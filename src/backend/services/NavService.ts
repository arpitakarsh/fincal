import { CacheManager } from '../infrastructure/redis/cache/CacheManager';
import { logger } from '@/lib/logger';

const MFAPI_BASE = 'https://api.mfapi.in/mf';
const AMFI_URL = 'https://www.amfiindia.com/spages/NAVAll.txt';

export interface LiveNAV {
  schemeCode: string;
  schemeName: string;
  nav: number;
  date: string;
  amc: string;
  category: string;
  navUnavailable?: boolean;
}

const NAV_CACHE_TTL = 20 * 60; // 20 minutes

export class NavService {
  /**
   * Fetch latest NAV for a scheme from mfapi.in/latest, with AMFI fallback.
   * Caches result for 20 minutes. Never throws — returns navUnavailable on failure.
   */
  static async getLatestNav(schemeCode: string): Promise<LiveNAV> {
    const cacheKey = `nav:latest:${schemeCode}`;

    // 1. Try cache
    const cached = await CacheManager.get<LiveNAV>(cacheKey);
    if (cached) return cached;

    // 2. Try mfapi.in /latest endpoint
    try {
      const res = await fetch(`${MFAPI_BASE}/${schemeCode}/latest`, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'SUCCESS' && json.data?.[0]) {
          const { nav, date } = json.data[0];
          const navNum = parseFloat(nav);
          if (!isNaN(navNum)) {
            const result: LiveNAV = {
              schemeCode,
              schemeName: json.meta?.scheme_name || '',
              nav: navNum,
              date,
              amc: json.meta?.fund_house || '',
              category: json.meta?.scheme_category || '',
            };
            await CacheManager.set(cacheKey, result, NAV_CACHE_TTL);
            return result;
          }
        }
      }
    } catch (err: any) {
      logger.warn(`mfapi.in /latest failed for ${schemeCode}: ${err.message}`);
    }

    // 3. Fallback: parse AMFI NAVAll.txt
    try {
      const amfiNav = await NavService.getNavFromAmfi(schemeCode);
      if (amfiNav) {
        await CacheManager.set(cacheKey, amfiNav, NAV_CACHE_TTL);
        return amfiNav;
      }
    } catch (err: any) {
      logger.warn(`AMFI fallback failed for ${schemeCode}: ${err.message}`);
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
   * Fetch full historical NAV data for a scheme from mfapi.in.
   * Cached for 24 hours (data changes only once per day).
   */
  static async getHistoricalNav(schemeCode: string): Promise<{ date: string; nav: number }[]> {
    const cacheKey = `nav:history:${schemeCode}`;
    const cached = await CacheManager.get<{ date: string; nav: number }[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${MFAPI_BASE}/${schemeCode}`, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return [];
      const json = await res.json();
      if (json.status !== 'SUCCESS' || !json.data) return [];

      const history = json.data
        .map((d: any) => ({ date: d.date, nav: parseFloat(d.nav) }))
        .filter((d: any) => !isNaN(d.nav));

      await CacheManager.set(cacheKey, history, 24 * 60 * 60); // 24h
      return history;
    } catch (err: any) {
      logger.warn(`Historical NAV fetch failed for ${schemeCode}: ${err.message}`);
      return [];
    }
  }

  /**
   * Fetch and search AMFI NAVAll.txt for a given scheme code.
   * Universe is cached for 12 hours.
   */
  private static async getNavFromAmfi(schemeCode: string): Promise<LiveNAV | null> {
    const universeCacheKey = 'amfi:universe:parsed';
    let universe = await CacheManager.get<Record<string, LiveNAV>>(universeCacheKey);

    if (!universe) {
      const res = await fetch(AMFI_URL, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return null;
      const text = await res.text();
      universe = NavService.parseAmfiText(text);
      await CacheManager.set(universeCacheKey, universe, 12 * 60 * 60); // 12h
    }

    return universe[schemeCode] || null;
  }

  /**
   * Get the full AMFI fund universe as an array.
   */
  static async getFundUniverse(): Promise<LiveNAV[]> {
    const universeCacheKey = 'amfi:universe:parsed';
    let universe = await CacheManager.get<Record<string, LiveNAV>>(universeCacheKey);

    if (!universe) {
      const res = await fetch(AMFI_URL, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return [];
      const text = await res.text();
      universe = NavService.parseAmfiText(text);
      await CacheManager.set(universeCacheKey, universe, 12 * 60 * 60); // 12h
    }

    return Object.values(universe);
  }

  /**
   * Search funds in the AMFI universe.
   * Prioritizes 'Direct Growth' if query doesn't explicitly look for 'Regular'.
   */
  static async searchFunds(query: string, limit: number = 10): Promise<LiveNAV[]> {
    const universe = await this.getFundUniverse();
    if (!query) return [];
    
    const q = query.toLowerCase();
    let results = universe.filter(f => f.schemeName.toLowerCase().includes(q));
    
    if (!q.includes('regular')) {
      const directGrowth = results.filter(f => f.schemeName.toLowerCase().includes('direct') && f.schemeName.toLowerCase().includes('growth'));
      if (directGrowth.length > 0) results = directGrowth;
    }
    
    return results.slice(0, limit);
  }

  /**
   * Parse AMFI NAVAll.txt into a map keyed by schemeCode.
   */
  static parseAmfiText(text: string): Record<string, LiveNAV> {
    const map: Record<string, LiveNAV> = {};
    const lines = text.split('\n');
    let currentAmc = '';
    let currentCategory = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('Scheme Code')) continue;

      if (trimmed.endsWith('Mutual Fund')) {
        currentAmc = trimmed;
        continue;
      }

      if (trimmed.includes('Schemes(')) {
        const match = trimmed.match(/(.*?)\((.*?)\)/);
        if (match?.[2]) currentCategory = match[2].trim();
        continue;
      }

      const parts = trimmed.split(';');
      if (parts.length >= 6) {
        const code = parts[0]?.trim();
        const name = parts[3]?.trim() || '';
        const navStr = parts[4]?.trim() || '';
        const date = parts[5]?.trim() || '';
        if (!code || code === '-') continue;
        const nav = parseFloat(navStr);
        if (isNaN(nav) || nav <= 0) continue;

        map[code] = {
          schemeCode: code,
          schemeName: name,
          nav,
          date,
          amc: currentAmc,
          category: currentCategory,
        };
      }
    }

    return map;
  }

  /**
   * Batch-fetch NAVs for multiple scheme codes concurrently with a concurrency cap.
   */
  static async batchGetLatestNavs(
    schemeCodes: string[],
    concurrency = 5
  ): Promise<Record<string, LiveNAV>> {
    const result: Record<string, LiveNAV> = {};

    // Process in chunks to avoid hammering the API
    for (let i = 0; i < schemeCodes.length; i += concurrency) {
      const chunk = schemeCodes.slice(i, i + concurrency);
      const navs = await Promise.all(chunk.map(code => NavService.getLatestNav(code)));
      navs.forEach((nav, idx) => {
        result[chunk[idx]!] = nav;
      });
    }

    return result;
  }

  /**
   * Calculate CAGR from historical data.
   */
  static calculateCagr(
    history: { date: string; nav: number }[],
    years: number
  ): number | null {
    if (history.length < 2) return null;
    const currentNav = history[0]!.nav;
    // history is newest-first from mfapi
    const targetDate = new Date(history[0]!.date.split('-').reverse().join('-'));
    targetDate.setFullYear(targetDate.getFullYear() - years);

    // Find closest historical data point
    let oldNav: number | null = null;
    for (const h of history) {
      const d = new Date(h.date.split('-').reverse().join('-'));
      if (d <= targetDate) {
        oldNav = h.nav;
        break;
      }
    }

    if (!oldNav || oldNav <= 0) return null;
    return (Math.pow(currentNav / oldNav, 1 / years) - 1) * 100;
  }
}
