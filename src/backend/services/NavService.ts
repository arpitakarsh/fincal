import { CacheManager } from '../infrastructure/redis/cache/CacheManager';
import { LatestNavRepository } from '../repositories/LatestNavRepository';
import { logger } from '@/lib/logger';

const MFAPI_BASE = 'https://api.mfapi.in/mf';
const AMFI_URL = 'https://www.amfiindia.com/spages/NAVAll.txt';

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface LiveNAV {
  schemeCode: string;
  schemeName: string;
  /**
   * The NAV value.
   *
   * When `navUnavailable` is true this field is 0, which is NOT a real NAV.
   * All callers must gate on `navUnavailable` before using `nav`.
   * Callers that do arithmetic with `nav` directly (e.g. FundAnalyticsService)
   * already guard with `liveNav.nav > 0` which is safe because a genuine NAV
   * will never legitimately be 0 or negative.
   */
  nav: number;
  date: string;
  amc: string;
  category: string;
  navUnavailable?: boolean;
}

// ---------------------------------------------------------------------------
// Internal types – narrow the external API contracts so `any` propagates no
// further than the JSON parse boundary.
// ---------------------------------------------------------------------------

/** Shape of a single entry in mfapi /latest data array */
interface MfapiLatestEntry {
  nav: string;
  date: string;
}

/** Shape of the mfapi /latest response */
interface MfapiLatestResponse {
  status: string;
  meta?: {
    scheme_name?: string;
    fund_house?: string;
    scheme_category?: string;
  };
  data?: MfapiLatestEntry[];
}

/** Shape of a single entry in the historical data array */
interface MfapiHistEntry {
  nav: string;
  date: string;
}

/** Shape of the mfapi full historical response (same endpoint, no /latest) */
interface MfapiHistResponse {
  status: string;
  data?: MfapiHistEntry[];
}

// ---------------------------------------------------------------------------
// Cache TTLs
// ---------------------------------------------------------------------------

const HIST_CACHE_TTL = 24 * 60 * 60;  // 24 hours — historical NAV is immutable once published
const AMFI_CACHE_TTL = 12 * 60 * 60;  // 12 hours — AMFI universe changes only on new fund launches

// ---------------------------------------------------------------------------
// In-flight request deduplication
// Prevents a cache-miss stampede: if 100 concurrent requests arrive for the
// same uncached schemeCode, only one fetch goes to mfapi; the rest await the
// same Promise.  This is process-level only – not distributed – which is
// sufficient for a single-instance deployment.  Distributed deduplication
// (e.g. Redlock) has been intentionally omitted as unnecessary at current scale.
// ---------------------------------------------------------------------------

const inFlightLatest = new Map<string, Promise<LiveNAV>>();
const inFlightHistorical = new Map<string, Promise<{ date: string; nav: number }[]>>();

// ---------------------------------------------------------------------------
// NavService
// ---------------------------------------------------------------------------

export class NavService {
  /**
   * Get the latest NAV for a scheme.
   *
   * Primary source: PostgreSQL `LatestNAV` table (populated by daily ingest).
   *
   * Fallback chain (only used if PostgreSQL has no row for this scheme OR
   * the DB read fails):
   *   1. mfapi.in /latest  (5s timeout)
   *   2. AMFI NAVAll.txt   (15s timeout, full daily snapshot)
   *
   * When a fallback succeeds, the result is persisted to PostgreSQL so
   * subsequent requests hit the DB instead of the external API.
   *
   * Never throws — returns navUnavailable: true on total failure.
   *
   * Concurrent requests for the same uncached schemeCode share a single in-flight
   * fetch so the external API is hit at most once per cache-miss cycle.
   */
  static async getLatestNav(schemeCode: string): Promise<LiveNAV> {
    // Deduplicate concurrent requests for the same scheme code.
    const inflight = inFlightLatest.get(schemeCode);
    if (inflight) return inflight;

    const promise = NavService._resolveLatestNav(schemeCode);
    inFlightLatest.set(schemeCode, promise);
    try {
      return await promise;
    } finally {
      inFlightLatest.delete(schemeCode);
    }
  }

  private static async _resolveLatestNav(schemeCode: string): Promise<LiveNAV> {
    // 1. PostgreSQL — the primary source of truth after daily ingest
    try {
      const dbRow = await LatestNavRepository.findBySchemeCode(schemeCode);
      if (dbRow) return dbRow;
      // Scheme not yet in DB — fall through to external API
    } catch (err: unknown) {
      // DB read failure: log and fall through to external API.
      // Do NOT silently return stale/wrong data — better to re-fetch.
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`LatestNAV DB read failed for ${schemeCode}, falling back to external API: ${message}`);
    }

    // 2. mfapi.in /latest (fallback — called only when DB has no row)
    const fromMfapi = await NavService._fetchFromMfapi(schemeCode);
    if (fromMfapi) {
      // Persist to DB so future requests skip the external API
      NavService._persistLatestNav(fromMfapi); // fire-and-forget
      return fromMfapi;
    }

    // 3. AMFI NAVAll.txt fallback
    try {
      const amfiNav = await NavService.getNavFromAmfi(schemeCode);
      if (amfiNav) {
        NavService._persistLatestNav(amfiNav); // fire-and-forget
        return amfiNav;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`AMFI fallback failed for ${schemeCode}: ${message}`);
    }

    // 4. Both failed — return navUnavailable marker
    logger.error(`NAV unavailable for scheme ${schemeCode}`);
    return {
      schemeCode,
      schemeName: '',
      nav: 0,
      date: '',
      amc: '',
      category: '',
      navUnavailable: true,
    };
  }

  /**
   * Persist a latest NAV to PostgreSQL.  Called fire-and-forget from fallback
   * paths so a DB write failure never blocks the user response.
   */
  private static _persistLatestNav(nav: LiveNAV): void {
    LatestNavRepository.upsert(nav).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`Failed to persist latest NAV for ${nav.schemeCode} to DB: ${message}`);
    });
  }

  /**
   * Fetch latest NAV from mfapi.in /latest.  Returns null on any failure.
   */
  private static async _fetchFromMfapi(schemeCode: string): Promise<LiveNAV | null> {
    try {
      const res = await fetch(`${MFAPI_BASE}/${schemeCode}/latest`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        logger.warn(`mfapi.in /latest HTTP ${res.status} for scheme ${schemeCode}`);
        return null;
      }

      const json = (await res.json()) as MfapiLatestResponse;
      if (json.status === 'SUCCESS' && json.data?.[0]) {
        const entry = json.data[0];
        const navNum = parseFloat(entry.nav);
        if (!isNaN(navNum) && navNum > 0) {
          return {
            schemeCode,
            schemeName: json.meta?.scheme_name ?? '',
            nav: navNum,
            date: entry.date,
            amc: json.meta?.fund_house ?? '',
            category: json.meta?.scheme_category ?? '',
          };
        }
        logger.warn(
          `mfapi.in /latest returned invalid NAV "${entry.nav}" for scheme ${schemeCode}`,
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`mfapi.in /latest failed for ${schemeCode}: ${message}`);
    }
    return null;
  }

  /**
   * Fetch full historical NAV data for a scheme from mfapi.in.
   * Cached in Redis for 24 hours (data changes only once per day).
   * Returns data in newest-first order as delivered by mfapi.
   *
   * Historical NAV is NOT persisted in PostgreSQL — the free-tier DB has
   * limited storage and historical data is large.  Redis provides a
   * sufficient 24h cache.
   *
   * Concurrent requests for the same uncached schemeCode share a single fetch.
   */
  static async getHistoricalNav(schemeCode: string): Promise<{ date: string; nav: number }[]> {
    const inflight = inFlightHistorical.get(schemeCode);
    if (inflight) return inflight;

    const promise = NavService._fetchHistoricalNav(schemeCode);
    inFlightHistorical.set(schemeCode, promise);
    try {
      return await promise;
    } finally {
      inFlightHistorical.delete(schemeCode);
    }
  }

  private static async _fetchHistoricalNav(
    schemeCode: string,
  ): Promise<{ date: string; nav: number }[]> {
    const cacheKey = `nav:history:${schemeCode}`;

    // 1. Redis cache (miss → mfapi)
    const cached = await CacheManager.get<{ date: string; nav: number }[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${MFAPI_BASE}/${schemeCode}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        logger.warn(`mfapi.in historical HTTP ${res.status} for scheme ${schemeCode}`);
        return [];
      }

      const json = (await res.json()) as MfapiHistResponse;
      if (json.status !== 'SUCCESS' || !json.data) return [];

      const history = json.data
        .map((d): { date: string; nav: number } => ({ date: d.date, nav: parseFloat(d.nav) }))
        .filter((d): boolean => !isNaN(d.nav) && d.nav > 0);

      // Cache for 24h — historical data is immutable once published
      await CacheManager.set(cacheKey, history, HIST_CACHE_TTL);
      return history;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`Historical NAV fetch failed for ${schemeCode}: ${message}`);
      return [];
    }
  }

  /**
   * Fetch and search AMFI NAVAll.txt for a given scheme code.
   * The AMFI universe is cached in Redis for 12 hours.
   */
  private static async getNavFromAmfi(schemeCode: string): Promise<LiveNAV | null> {
    const universeCacheKey = 'amfi:universe:parsed';
    let universe = await CacheManager.get<Record<string, LiveNAV>>(universeCacheKey);

    if (!universe) {
      const res = await fetch(AMFI_URL, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        logger.warn(`AMFI NAVAll.txt HTTP ${res.status}`);
        return null;
      }
      const text = await res.text();
      universe = NavService.parseAmfiText(text);

      // Guard: do not cache an empty universe — it probably means the response
      // was malformed or empty, and caching it would black-hole all AMFI lookups
      // for 12 hours.
      if (Object.keys(universe).length === 0) {
        logger.warn(
          'AMFI NAVAll.txt parsed to an empty universe – skipping cache to avoid black-holing lookups',
        );
        return null;
      }

      await CacheManager.set(universeCacheKey, universe, AMFI_CACHE_TTL);
    }

    return universe[schemeCode] ?? null;
  }

  /**
   * Get the full AMFI fund universe as an array.
   *
   * Flow: Redis (12h) → AMFI NAVAll.txt → parse → Redis.
   * The universe is NOT stored in PostgreSQL — it would require ~15k rows
   * in the free-tier database that would need constant maintenance.
   */
  static async getFundUniverse(): Promise<LiveNAV[]> {
    const universeCacheKey = 'amfi:universe:parsed';
    let universe = await CacheManager.get<Record<string, LiveNAV>>(universeCacheKey);

    if (!universe) {
      try {
        const res = await fetch(AMFI_URL, {
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) {
          logger.warn(`AMFI NAVAll.txt HTTP ${res.status} when fetching universe`);
          return [];
        }
        const text = await res.text();
        universe = NavService.parseAmfiText(text);

        if (Object.keys(universe).length === 0) {
          logger.warn(
            'AMFI NAVAll.txt parsed to empty universe during getFundUniverse – skipping cache',
          );
          return [];
        }

        await CacheManager.set(universeCacheKey, universe, AMFI_CACHE_TTL);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`AMFI universe fetch failed: ${message}`);
        return [];
      }
    }

    return Object.values(universe);
  }

  /**
   * Search funds in the AMFI universe.
   * Prioritizes 'Direct Growth' if query doesn't explicitly look for 'Regular'.
   *
   * Behaviour:
   * - Empty query → empty results (not the whole universe).
   * - If filtered directGrowth set is non-empty AND query doesn't include
   *   "regular", use directGrowth subset; otherwise use the full match set.
   *   This preserves all valid results: the narrowing only applies when there
   *   are direct-growth results to show.
   * - limit is respected.
   * - Case-insensitive matching throughout.
   */
  static async searchFunds(query: string, limit: number = 10): Promise<LiveNAV[]> {
    if (!query) return [];

    const universe = await this.getFundUniverse();
    const q = query.toLowerCase();
    const results = universe.filter(f => f.schemeName.toLowerCase().includes(q));

    if (!q.includes('regular')) {
      const directGrowth = results.filter(
        f =>
          f.schemeName.toLowerCase().includes('direct') &&
          f.schemeName.toLowerCase().includes('growth'),
      );
      if (directGrowth.length > 0) return directGrowth.slice(0, limit);
    }

    return results.slice(0, limit);
  }

  /**
   * Parse AMFI NAVAll.txt into a map keyed by schemeCode.
   *
   * Format notes:
   * - The file uses either LF or CRLF line endings depending on the server.
   *   We normalise by splitting on '\n' and calling trim() on each line, which
   *   strips the trailing '\r' in CRLF files as well as leading/trailing spaces.
   * - Malformed lines (wrong column count, non-numeric NAV, negative/zero NAV,
   *   missing scheme code) are silently skipped so one bad line never aborts
   *   the whole parse.
   * - AMC and category context is accumulated per-section; a malformed header
   *   line does NOT reset the context, so subsequent data lines still carry the
   *   last valid AMC/category.
   */
  static parseAmfiText(text: string): Record<string, LiveNAV> {
    const map: Record<string, LiveNAV> = {};
    const lines = text.split('\n');
    let currentAmc = '';
    let currentCategory = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('Scheme Code')) continue;

      // AMC header line (e.g. "Aditya Birla Sun Life Mutual Fund")
      if (trimmed.endsWith('Mutual Fund')) {
        currentAmc = trimmed;
        continue;
      }

      // Category header line (e.g. "Open Ended Schemes(Equity Scheme - Large Cap Fund)")
      if (trimmed.includes('Schemes(')) {
        const match = trimmed.match(/(.*?)\((.*?)\)/);
        if (match?.[2]) currentCategory = match[2].trim();
        continue;
      }

      // Data line: SchemeCode;ISIN1;ISIN2;SchemeName;NAV;Date
      const parts = trimmed.split(';');
      if (parts.length < 6) continue; // malformed – skip safely

      const code = parts[0]?.trim() ?? '';
      const name = parts[3]?.trim() ?? '';
      const navStr = parts[4]?.trim() ?? '';
      const date = parts[5]?.trim() ?? '';

      // Skip placeholder or empty codes
      if (!code || code === '-') continue;

      const nav = parseFloat(navStr);
      // Skip NaN, zero, and negative NAVs — they are not valid
      if (!isFinite(nav) || nav <= 0) continue;

      map[code] = {
        schemeCode: code,
        schemeName: name,
        nav,
        date,
        amc: currentAmc,
        category: currentCategory,
      };
    }

    return map;
  }

  /**
   * Batch-fetch NAVs for multiple scheme codes concurrently with a concurrency cap.
   *
   * - Processes codes in chunks of `concurrency` (default 5).
   * - Duplicate scheme codes are deduplicated before processing.
   * - One failed scheme (navUnavailable) does NOT prevent other schemes.
   * - Each call goes through getLatestNav() which checks PostgreSQL first.
   */
  static async batchGetLatestNavs(
    schemeCodes: string[],
    concurrency = 5,
  ): Promise<Record<string, LiveNAV>> {
    const result: Record<string, LiveNAV> = {};

    // Deduplicate to avoid redundant fetches when the same code appears multiple times.
    const uniqueCodes = [...new Set(schemeCodes)];

    for (let i = 0; i < uniqueCodes.length; i += concurrency) {
      const chunk = uniqueCodes.slice(i, i + concurrency);
      const navs = await Promise.all(chunk.map(code => NavService.getLatestNav(code)));
      navs.forEach((nav, idx) => {
        result[chunk[idx]!] = nav;
      });
    }

    return result;
  }

  /**
   * Calculate CAGR from a historical NAV series.
   *
   * @param history   Array of {date, nav} entries in any order.
   *                  mfapi delivers newest-first, but this function does NOT
   *                  assume any particular ordering — it sorts internally.
   * @param years     Number of years for the CAGR window. Must be > 0.
   * @returns         CAGR as a percentage (e.g. 12.5 means 12.5%), or null if
   *                  the calculation cannot be performed.
   *
   * Algorithm:
   * 1. Parse all dates; discard entries whose date is invalid or whose NAV is
   *    non-positive.
   * 2. Sort ascending by date (oldest first).
   * 3. The latest NAV is the last entry.
   * 4. The target date is (latestDate − years).
   * 5. Find the latest valid entry on or before the target date ("at most the
   *    target date").  This gives a real historical comparison point rather than
   *    an extrapolated one.
   * 6. If no entry exists on or before the target date (insufficient history),
   *    return null rather than silently producing a wrong answer.
   */
  static calculateCagr(
    history: { date: string; nav: number }[],
    years: number,
  ): number | null {
    // Validate years before doing any work
    if (!Number.isFinite(years) || years <= 0) return null;

    if (history.length < 2) return null;

    /**
     * Parse a date string that may be in mfapi's DD-MM-YYYY format or the
     * standard ISO/browser-parseable formats.  Returns null for invalid dates.
     */
    const parseDateStr = (dateStr: string): Date | null => {
      let d: Date;
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        // mfapi format: DD-MM-YYYY → rewrite to YYYY-MM-DD for unambiguous parsing
        const [dd, mm, yyyy] = dateStr.split('-');
        d = new Date(`${yyyy}-${mm}-${dd}`);
      } else {
        d = new Date(dateStr);
      }
      return isNaN(d.getTime()) ? null : d;
    };

    // Build a validated, sorted (ascending) series
    type Entry = { date: Date; nav: number };
    const valid: Entry[] = [];
    for (const h of history) {
      if (!Number.isFinite(h.nav) || h.nav <= 0) continue; // skip bad NAV
      const d = parseDateStr(h.date);
      if (d === null) continue; // skip invalid date
      valid.push({ date: d, nav: h.nav });
    }

    if (valid.length < 2) return null;

    // Sort ascending by date (oldest → newest)
    valid.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Latest point
    const latest = valid[valid.length - 1]!;
    const currentNav = latest.nav;
    const latestDate = latest.date;

    // Target date: latestDate − years
    const targetDate = new Date(latestDate);
    targetDate.setFullYear(targetDate.getFullYear() - years);

    // Find the latest entry on or before targetDate.
    // Iterate from newest to oldest (reverse) so we get the closest point
    // that is still within the requested window.
    let oldNav: number | null = null;
    for (let i = valid.length - 2; i >= 0; i--) {
      const entry = valid[i]!;
      if (entry.date <= targetDate) {
        oldNav = entry.nav;
        break;
      }
    }

    // No data point exists on or before the target date → insufficient history
    if (oldNav === null || oldNav <= 0) return null;

    return (Math.pow(currentNav / oldNav, 1 / years) - 1) * 100;
  }
}
