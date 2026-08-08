/**
 * Tests for POST /api/nav/ingest
 *
 * This endpoint is the daily NAV ingestion cron. It:
 *  1. Authenticates via CRON_SECRET bearer token.
 *  2. Fetches AMFI NAVAll.txt.
 *  3. Parses and validates entries.
 *  4. UPSERTs all valid entries to the LatestNAV PostgreSQL table.
 *  5. Returns stats (parsed, written, skipped, durationMs).
 *
 * These tests mock LatestNavRepository and fetch to avoid hitting
 * real external services or the database.
 */

// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/nav/ingest/route';
import { NextRequest } from 'next/server';
import { LatestNavRepository } from '@/backend/repositories/LatestNavRepository';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/backend/repositories/LatestNavRepository', () => ({
  LatestNavRepository: {
    findBySchemeCode: vi.fn(),
    upsert: vi.fn(),
    upsertMany: vi.fn(),
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Minimal valid AMFI NAVAll.txt content
const VALID_AMFI_TXT = `Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
TestAMC Mutual Fund
Open Ended Schemes(Equity - Large Cap)
100001;INF111A01001;INF111A01002;TestAMC Direct Growth;100.50;01-Aug-2025
100002;INF222A01001;INF222A01002;TestAMC Bluechip Direct Growth;200.00;01-Aug-2025`;

const AUTH_HEADER = { authorization: 'Bearer dev-secret-key' };

function makeIngestRequest(headers: Record<string, string> = AUTH_HEADER) {
  return new NextRequest('http://localhost/api/nav/ingest', {
    method: 'POST',
    headers,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  (LatestNavRepository.upsertMany as ReturnType<typeof vi.fn>).mockResolvedValue(2);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/nav/ingest', () => {
  describe('Authentication', () => {
    it('returns 401 when no authorization header is provided', async () => {
      const req = new NextRequest('http://localhost/api/nav/ingest', { method: 'POST' });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('returns 401 when wrong token is provided', async () => {
      const req = makeIngestRequest({ authorization: 'Bearer wrong-token' });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('returns 401 when authorization format is wrong (no Bearer prefix)', async () => {
      const req = makeIngestRequest({ authorization: 'dev-secret-key' });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });
  });

  describe('Successful ingestion', () => {
    it('fetches AMFI, parses entries, and UPSERTs to PostgreSQL', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: async () => VALID_AMFI_TXT });
      (LatestNavRepository.upsertMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce(2);

      const res = await POST(makeIngestRequest());
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.parsed).toBe(2);
      expect(json.data.written).toBe(2);
      expect(json.data.skipped).toBe(0);
      expect(typeof json.data.durationMs).toBe('number');
    });

    it('calls upsertMany with the parsed LiveNAV array', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: async () => VALID_AMFI_TXT });
      (LatestNavRepository.upsertMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce(2);

      await POST(makeIngestRequest());

      expect(LatestNavRepository.upsertMany).toHaveBeenCalledTimes(1);
      const [calledWith] = (LatestNavRepository.upsertMany as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(Array.isArray(calledWith)).toBe(true);
      expect(calledWith.length).toBe(2);
      expect(calledWith[0]).toMatchObject({ schemeCode: '100001', nav: 100.5 });
    });
  });

  describe('AMFI fetch failure', () => {
    it('returns 502 when AMFI returns HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

      const res = await POST(makeIngestRequest());
      const json = await res.json();

      expect(res.status).toBe(502);
      expect(json.success).toBe(false);
    });

    it('returns 502 when AMFI fetch throws (network error)', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const res = await POST(makeIngestRequest());
      const json = await res.json();

      expect(res.status).toBe(502);
      expect(json.success).toBe(false);
    });
  });

  describe('Empty / malformed AMFI response', () => {
    it('returns 502 when AMFI response parses to empty universe (protects existing data)', async () => {
      // Only a header line — no actual fund data
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Scheme Code;ISIN;ISIN2;Name;NAV;Date',
      });

      const res = await POST(makeIngestRequest());
      const json = await res.json();

      // Should refuse to run upsertMany with empty data
      expect(res.status).toBe(502);
      expect(json.success).toBe(false);
      expect(LatestNavRepository.upsertMany).not.toHaveBeenCalled();
    });

    it('skips entries with invalid NAV but processes valid ones', async () => {
      const mixedTxt = `Scheme Code;X;Y;Name;NAV;Date
TestAMC Mutual Fund
Open Ended Schemes(Equity)
100001;A;B;Valid Fund;100.50;01-Aug-2025
100002;A;B;Invalid NAV Fund;N/A;01-Aug-2025`;

      mockFetch.mockResolvedValueOnce({ ok: true, text: async () => mixedTxt });
      // parseAmfiText already skips invalid NAVs, so only 1 entry reaches upsertMany
      (LatestNavRepository.upsertMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce(1);

      const res = await POST(makeIngestRequest());
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.parsed).toBe(1); // only 1 valid entry from parser
    });
  });

  describe('Database failure', () => {
    it('returns 500 when upsertMany throws', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: async () => VALID_AMFI_TXT });
      (LatestNavRepository.upsertMany as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('DB connection lost'),
      );

      const res = await POST(makeIngestRequest());
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.success).toBe(false);
    });
  });

  describe('Idempotency', () => {
    it('calling the endpoint twice produces the same result (UPSERT semantics)', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, text: async () => VALID_AMFI_TXT })
        .mockResolvedValueOnce({ ok: true, text: async () => VALID_AMFI_TXT });
      (LatestNavRepository.upsertMany as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(2);

      const res1 = await POST(makeIngestRequest());
      const res2 = await POST(makeIngestRequest());
      const json1 = await res1.json();
      const json2 = await res2.json();

      expect(json1.success).toBe(true);
      expect(json2.success).toBe(true);
      // Both runs report the same counts
      expect(json1.data.parsed).toBe(json2.data.parsed);
      // upsertMany was called twice (one per run)
      expect(LatestNavRepository.upsertMany).toHaveBeenCalledTimes(2);
    });
  });
});
