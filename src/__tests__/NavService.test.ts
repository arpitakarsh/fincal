/**
 * NavService unit tests (updated for PostgreSQL-first architecture)
 *
 * Architecture under test:
 *   getLatestNav():
 *     PostgreSQL (LatestNavRepository) → mfapi → AMFI → navUnavailable
 *
 *   getHistoricalNav():
 *     Redis (CacheManager) → mfapi → Redis TTL 24h
 *
 *   getFundUniverse() / searchFunds():
 *     Redis (CacheManager) → AMFI NAVAll.txt → Redis TTL 12h
 *
 *   Other: parseAmfiText, calculateCagr, batchGetLatestNavs — unchanged
 */

// @ts-nocheck  (vitest globals; test file doesn't need strict TS coverage)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavService } from '@/backend/services/NavService';
import { CacheManager } from '@/backend/infrastructure/redis/cache/CacheManager';
import { LatestNavRepository } from '@/backend/repositories/LatestNavRepository';

// ---------------------------------------------------------------------------
// Mock LatestNavRepository so tests don't need a real database
// ---------------------------------------------------------------------------
vi.mock('@/backend/repositories/LatestNavRepository', () => ({
  LatestNavRepository: {
    findBySchemeCode: vi.fn(),
    upsert: vi.fn(),
    upsertMany: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Mock CacheManager so tests don't need a real Redis connection
// ---------------------------------------------------------------------------
vi.mock('@/backend/infrastructure/redis/cache/CacheManager', () => ({
  CacheManager: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Mock global fetch so tests are hermetic
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDbRow(nav = 100.5) {
  return {
    schemeCode: '100001',
    schemeName: 'Test Fund Direct Growth',
    nav,
    date: '01-08-2025',
    amc: 'Test AMC',
    category: 'Equity',
  };
}

function mfapiLatestOk(nav = '100.50', date = '01-08-2025') {
  return {
    ok: true,
    json: async () => ({
      status: 'SUCCESS',
      meta: { scheme_name: 'Test Fund Direct Growth', fund_house: 'Test AMC', scheme_category: 'Equity' },
      data: [{ nav, date }],
    }),
  };
}

function mfapiHistOk(entries: { nav: string; date: string }[]) {
  return {
    ok: true,
    json: async () => ({ status: 'SUCCESS', data: entries }),
  };
}

function httpError(status: number) {
  return { ok: false, status, json: async () => ({}), text: async () => '' };
}

// Minimal AMFI NAVAll.txt text with one valid record
const AMFI_SAMPLE = `Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
TestAMC Mutual Fund
Open Ended Schemes(Equity - Large Cap)
100001;INF111A01001;INF111A01002;TestAMC Direct Growth;100.50;01-Aug-2025`;

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  // Default: DB returns null (no row), Redis returns null (cache miss), fetch unused
  (LatestNavRepository.findBySchemeCode as ReturnType<typeof vi.fn>).mockResolvedValue(null);
  (LatestNavRepository.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  (LatestNavRepository.upsertMany as ReturnType<typeof vi.fn>).mockResolvedValue(0);
  (CacheManager.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);
  (CacheManager.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// 1. Latest NAV — PostgreSQL-first
// ---------------------------------------------------------------------------

describe('NavService.getLatestNav', () => {
  it('returns DB row directly without hitting external API', async () => {
    const dbRow = makeDbRow();
    (LatestNavRepository.findBySchemeCode as ReturnType<typeof vi.fn>).mockResolvedValueOnce(dbRow);

    const result = await NavService.getLatestNav('100001');

    expect(result.nav).toBe(100.5);
    expect(result.schemeName).toBe('Test Fund Direct Growth');
    expect(result.navUnavailable).toBeUndefined();
    // DB was checked
    expect(LatestNavRepository.findBySchemeCode).toHaveBeenCalledWith('100001');
    // No external API call needed
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('falls back to mfapi when DB has no row, then persists result', async () => {
    // DB miss
    (LatestNavRepository.findBySchemeCode as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    mockFetch.mockResolvedValueOnce(mfapiLatestOk());

    const result = await NavService.getLatestNav('100001');

    expect(result.nav).toBe(100.5);
    expect(result.navUnavailable).toBeUndefined();
    // Should have tried DB
    expect(LatestNavRepository.findBySchemeCode).toHaveBeenCalledWith('100001');
    // Should have tried mfapi
    expect(mockFetch).toHaveBeenCalledTimes(1);
    // Fire-and-forget persist: upsert should be called (may be async)
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(LatestNavRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ schemeCode: '100001', nav: 100.5 }),
    );
  });

  it('falls back to AMFI when DB miss and mfapi fails, then persists', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('mfapi network error'))      // mfapi fails
      .mockResolvedValueOnce({ ok: true, text: async () => AMFI_SAMPLE }); // AMFI succeeds

    const result = await NavService.getLatestNav('100001');

    expect(result.nav).toBe(100.5);
    expect(result.navUnavailable).toBeUndefined();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(LatestNavRepository.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ schemeCode: '100001', nav: 100.5 }),
    );
  });

  it('returns navUnavailable when DB miss and both mfapi and AMFI fail', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('mfapi fail'))
      .mockResolvedValueOnce({ ok: true, text: async () => '' }); // AMFI returns empty

    const result = await NavService.getLatestNav('100001');

    expect(result.navUnavailable).toBe(true);
    expect(result.nav).toBe(0);
  });

  it('falls back to external API when DB throws (DB failure is non-fatal)', async () => {
    (LatestNavRepository.findBySchemeCode as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('DB connection lost'),
    );
    mockFetch.mockResolvedValueOnce(mfapiLatestOk());

    const result = await NavService.getLatestNav('100001');

    expect(result.nav).toBe(100.5);
    expect(result.navUnavailable).toBeUndefined();
  });

  it('rejects invalid NAV from mfapi (N/A) and falls back to AMFI', async () => {
    mockFetch
      .mockResolvedValueOnce(mfapiLatestOk('N/A'))
      .mockResolvedValueOnce({ ok: true, text: async () => AMFI_SAMPLE });

    const result = await NavService.getLatestNav('100001');
    expect(result.nav).toBe(100.5);
  });

  it('rejects zero NAV from mfapi and falls back to AMFI', async () => {
    mockFetch
      .mockResolvedValueOnce(mfapiLatestOk('0'))
      .mockResolvedValueOnce({ ok: true, text: async () => AMFI_SAMPLE });

    const result = await NavService.getLatestNav('100001');
    expect(result.nav).toBe(100.5);
  });

  it('rejects HTTP error from mfapi and falls back to AMFI', async () => {
    mockFetch
      .mockResolvedValueOnce(httpError(503))
      .mockResolvedValueOnce({ ok: true, text: async () => AMFI_SAMPLE });

    const result = await NavService.getLatestNav('100001');
    expect(result.nav).toBe(100.5);
  });
});

// ---------------------------------------------------------------------------
// 2. Historical NAV — Redis-first (unchanged from before)
// ---------------------------------------------------------------------------

describe('NavService.getHistoricalNav', () => {
  it('returns cached result without hitting external API', async () => {
    const cachedHistory = [{ date: '01-08-2025', nav: 100.5 }];
    (CacheManager.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(cachedHistory);

    const result = await NavService.getHistoricalNav('100001');

    expect(result).toEqual(cachedHistory);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches from mfapi on cache miss and caches the result', async () => {
    const entries = [
      { nav: '105.00', date: '01-08-2025' },
      { nav: '100.00', date: '01-07-2025' },
    ];
    mockFetch.mockResolvedValueOnce(mfapiHistOk(entries));

    const result = await NavService.getHistoricalNav('100001');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ date: '01-08-2025', nav: 105 });
    expect(CacheManager.set).toHaveBeenCalledWith(
      'nav:history:100001',
      expect.any(Array),
      86400, // 24h
    );
  });

  it('filters out malformed (NaN) entries from mfapi', async () => {
    const entries = [
      { nav: '105.00', date: '01-08-2025' },
      { nav: 'N/A', date: '01-07-2025' },   // should be filtered
      { nav: '0', date: '01-06-2025' },      // should be filtered
    ];
    mockFetch.mockResolvedValueOnce(mfapiHistOk(entries));

    const result = await NavService.getHistoricalNav('100001');
    expect(result).toHaveLength(1);
    expect(result[0]!.nav).toBe(105);
  });

  it('returns empty array when mfapi returns HTTP error', async () => {
    mockFetch.mockResolvedValueOnce(httpError(404));
    const result = await NavService.getHistoricalNav('000000');
    expect(result).toEqual([]);
  });

  it('returns empty array on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network error'));
    const result = await NavService.getHistoricalNav('000000');
    expect(result).toEqual([]);
  });

  it('returns empty array when mfapi status is not SUCCESS', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'FAILED', data: [] }),
    });
    const result = await NavService.getHistoricalNav('000000');
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 3. AMFI Parser
// ---------------------------------------------------------------------------

describe('NavService.parseAmfiText', () => {
  it('parses a valid AMFI file correctly', () => {
    const result = NavService.parseAmfiText(AMFI_SAMPLE);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['100001']).toMatchObject({
      schemeCode: '100001',
      schemeName: 'TestAMC Direct Growth',
      nav: 100.5,
      date: '01-Aug-2025',
      amc: 'TestAMC Mutual Fund',
      category: 'Equity - Large Cap',
    });
  });

  it('handles CRLF line endings correctly', () => {
    const crlfText = AMFI_SAMPLE.replace(/\n/g, '\r\n');
    const result = NavService.parseAmfiText(crlfText);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['100001']!.nav).toBe(100.5);
  });

  it('skips malformed lines with insufficient columns', () => {
    const text = `Scheme Code;ISIN;Name;NAV;Date\nTestAMC Mutual Fund\n100001;incomplete\n100002;INF;INF2;Valid Fund;99.0;01-Aug-2025`;
    const result = NavService.parseAmfiText(text);
    expect(result['100001']).toBeUndefined();
    expect(result['100002']).toBeDefined();
  });

  it('skips records with invalid NAV values', () => {
    const text = `Scheme Code;X;Y;Name;NAV;Date\nTestAMC Mutual Fund\n100001;INF;INF2;Bad Fund;N/A;01-Aug-2025`;
    const result = NavService.parseAmfiText(text);
    expect(result['100001']).toBeUndefined();
  });

  it('associates records with the correct AMC after multiple AMC headers', () => {
    const text = [
      'Scheme Code;X;Y;Name;NAV;Date',
      'First Mutual Fund',
      'Open Ended Schemes(Equity)',
      '100001;A;B;First Fund Direct Growth;100.0;01-Aug-2025',
      'Second Mutual Fund',
      'Open Ended Schemes(Debt)',
      '200001;A;B;Second Fund Direct Growth;200.0;01-Aug-2025',
    ].join('\n');
    const result = NavService.parseAmfiText(text);
    expect(result['100001']!.amc).toBe('First Mutual Fund');
    expect(result['200001']!.amc).toBe('Second Mutual Fund');
    expect(result['100001']!.category).toBe('Equity');
    expect(result['200001']!.category).toBe('Debt');
  });

  it('returns empty map for completely empty input', () => {
    expect(NavService.parseAmfiText('')).toEqual({});
  });

  it('skips the header line', () => {
    const result = NavService.parseAmfiText('Scheme Code;ISIN;ISIN2;Name;NAV;Date');
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('skips records with code "-"', () => {
    const text = `Scheme Code;X;Y;Name;NAV;Date\nTestAMC Mutual Fund\n-;INF;INF2;Bad Code;100.0;01-Aug-2025`;
    const result = NavService.parseAmfiText(text);
    expect(result['-']).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 4. CAGR
// ---------------------------------------------------------------------------

describe('NavService.calculateCagr', () => {
  it('calculates CAGR correctly for ordered (newest-first) data', () => {
    const history = [
      { date: '01-01-2025', nav: 200 }, // newest
      { date: '01-01-2024', nav: 100 }, // 1Y ago
    ];
    const cagr = NavService.calculateCagr(history, 1);
    expect(cagr).toBeCloseTo(100, 5);  // 100% CAGR
  });

  it('calculates the same CAGR regardless of input ordering (unordered)', () => {
    const orderedHistory = [
      { date: '01-01-2025', nav: 200 },
      { date: '01-01-2024', nav: 100 },
    ];
    const unorderedHistory = [
      { date: '01-01-2024', nav: 100 },
      { date: '01-01-2025', nav: 200 },
    ];
    const cagr1 = NavService.calculateCagr(orderedHistory, 1);
    const cagr2 = NavService.calculateCagr(unorderedHistory, 1);
    expect(cagr1).toBeCloseTo(cagr2!, 5);
  });

  it('returns null when history has fewer than 2 entries', () => {
    expect(NavService.calculateCagr([{ date: '01-01-2025', nav: 200 }], 1)).toBeNull();
    expect(NavService.calculateCagr([], 1)).toBeNull();
  });

  it('returns null when years <= 0', () => {
    const h = [{ date: '01-01-2024', nav: 100 }, { date: '01-01-2025', nav: 200 }];
    expect(NavService.calculateCagr(h, 0)).toBeNull();
    expect(NavService.calculateCagr(h, -1)).toBeNull();
  });

  it('returns null for non-finite years', () => {
    const h = [{ date: '01-01-2024', nav: 100 }, { date: '01-01-2025', nav: 200 }];
    expect(NavService.calculateCagr(h, Infinity)).toBeNull();
    expect(NavService.calculateCagr(h, NaN)).toBeNull();
  });

  it('returns null when history does not reach back far enough (insufficient data)', () => {
    // Only 6 months of data, asking for 1Y CAGR
    const h = [
      { date: '01-07-2024', nav: 100 },
      { date: '01-01-2025', nav: 110 },
    ];
    expect(NavService.calculateCagr(h, 1)).toBeNull();
  });

  it('skips entries with invalid (NaN) dates', () => {
    const history = [
      { date: 'not-a-date', nav: 50 },    // invalid date — skipped
      { date: '01-01-2024', nav: 100 },
      { date: '01-01-2025', nav: 200 },
    ];
    const cagr = NavService.calculateCagr(history, 1);
    expect(cagr).toBeCloseTo(100, 5);
  });

  it('skips entries with zero or negative NAV', () => {
    const history = [
      { date: '01-01-2023', nav: 0 },     // invalid — skipped
      { date: '01-01-2024', nav: 100 },
      { date: '01-01-2025', nav: 200 },
    ];
    const cagr = NavService.calculateCagr(history, 1);
    expect(cagr).toBeCloseTo(100, 5);
  });

  it('returns null when all historical NAVs are zero or negative', () => {
    const h = [{ date: '01-01-2024', nav: 0 }, { date: '01-01-2025', nav: -1 }];
    expect(NavService.calculateCagr(h, 1)).toBeNull();
  });

  it('does not use history[0] blindly – works correctly when newest entry is at the end', () => {
    // Sort order: oldest first
    const history = [
      { date: '01-01-2023', nav: 80 },   // oldest
      { date: '01-01-2024', nav: 100 },  // 1Y ago
      { date: '01-01-2025', nav: 200 },  // newest (at END of array)
    ];
    const cagr = NavService.calculateCagr(history, 1);
    // Should compare 200 vs 100 (1Y), not 200 vs 80
    expect(cagr).toBeCloseTo(100, 5);
  });
});

// ---------------------------------------------------------------------------
// 5. Batch NAV
// ---------------------------------------------------------------------------

describe('NavService.batchGetLatestNavs', () => {
  it('returns NAVs for multiple scheme codes', async () => {
    const db100001 = { ...makeDbRow(), schemeCode: '100001', nav: 100 };
    const db100002 = { ...makeDbRow(), schemeCode: '100002', nav: 200 };
    (LatestNavRepository.findBySchemeCode as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(db100001)
      .mockResolvedValueOnce(db100002);

    const result = await NavService.batchGetLatestNavs(['100001', '100002'], 5);

    expect(result['100001']!.nav).toBe(100);
    expect(result['100002']!.nav).toBe(200);
  });

  it('respects concurrency limit – processes chunks sequentially', async () => {
    const dbRow = makeDbRow();
    (LatestNavRepository.findBySchemeCode as ReturnType<typeof vi.fn>).mockResolvedValue(dbRow);

    const result = await NavService.batchGetLatestNavs(['A', 'B', 'C', 'D'], 2);
    expect(Object.keys(result)).toHaveLength(4);
  });

  it('one failing scheme does not prevent others from returning', async () => {
    // Process with concurrency=1 so BAD is fully resolved before 100002 starts
    (LatestNavRepository.findBySchemeCode as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('DB error for BAD'))   // BAD: DB fails
      .mockResolvedValueOnce({ ...makeDbRow(), schemeCode: '100002', nav: 150 }); // 100002: DB hit

    // BAD falls back to mfapi then AMFI (both fail → navUnavailable)
    mockFetch
      .mockRejectedValueOnce(new Error('mfapi fail for BAD'))         // BAD: mfapi fails
      .mockResolvedValueOnce({ ok: true, text: async () => '' });     // BAD: AMFI empty

    const result = await NavService.batchGetLatestNavs(['BAD', '100002'], 1);

    expect(result['BAD']!.navUnavailable).toBe(true);
    expect(result['100002']!.nav).toBe(150);
  });

  it('deduplicates scheme codes and fetches each only once', async () => {
    const dbRow = makeDbRow();
    (LatestNavRepository.findBySchemeCode as ReturnType<typeof vi.fn>).mockResolvedValue(dbRow);

    await NavService.batchGetLatestNavs(['100001', '100001', '100001'], 5);

    // Should have called findBySchemeCode only once (deduplicated)
    expect(LatestNavRepository.findBySchemeCode).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// 6. searchFunds
// ---------------------------------------------------------------------------

describe('NavService.searchFunds', () => {
  const sampleUniverse: Record<string, object> = {
    '100001': { schemeCode: '100001', schemeName: 'SBI Blue Chip Direct Growth', nav: 100, date: '01-08-2025', amc: 'SBI', category: 'Equity' },
    '100002': { schemeCode: '100002', schemeName: 'SBI Blue Chip Regular Growth', nav: 95, date: '01-08-2025', amc: 'SBI', category: 'Equity' },
    '100003': { schemeCode: '100003', schemeName: 'Axis Long Term Equity Direct Growth', nav: 200, date: '01-08-2025', amc: 'Axis', category: 'ELSS' },
    '100004': { schemeCode: '100004', schemeName: 'HDFC Large Cap Fund Direct Growth', nav: 150, date: '01-08-2025', amc: 'HDFC', category: 'Equity' },
  };

  beforeEach(() => {
    // Return cached universe
    (CacheManager.get as ReturnType<typeof vi.fn>).mockResolvedValue(sampleUniverse);
  });

  it('returns empty array for empty query', async () => {
    const result = await NavService.searchFunds('');
    expect(result).toEqual([]);
  });

  it('filters by name case-insensitively', async () => {
    const result = await NavService.searchFunds('sbi', 10);
    expect(result.some(f => f.schemeName.includes('SBI'))).toBe(true);
  });

  it('prioritises Direct Growth when query does not include "regular"', async () => {
    const result = await NavService.searchFunds('sbi blue chip', 10);
    // Should only return direct growth (not regular)
    expect(result.every(f => f.schemeName.toLowerCase().includes('direct') && f.schemeName.toLowerCase().includes('growth'))).toBe(true);
  });

  it('does not filter for Direct Growth when query includes "regular"', async () => {
    const result = await NavService.searchFunds('sbi blue chip regular', 10);
    expect(result.some(f => f.schemeName.includes('Regular'))).toBe(true);
  });

  it('respects the limit parameter', async () => {
    const result = await NavService.searchFunds('direct', 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// 7. In-flight deduplication (cache stampede prevention)
// ---------------------------------------------------------------------------

describe('NavService in-flight deduplication', () => {
  it('makes only one DB request when many concurrent callers ask for the same uncached scheme', async () => {
    const dbRow = makeDbRow();
    (LatestNavRepository.findBySchemeCode as ReturnType<typeof vi.fn>).mockResolvedValue(dbRow);

    // Fire 10 concurrent requests for the same scheme
    const results = await Promise.all(
      Array.from({ length: 10 }, () => NavService.getLatestNav('100001')),
    );

    // DB should have been called exactly once (deduplication worked)
    expect(LatestNavRepository.findBySchemeCode).toHaveBeenCalledTimes(1);
    expect(results.every(r => r.nav === 100.5)).toBe(true);
  });
});
