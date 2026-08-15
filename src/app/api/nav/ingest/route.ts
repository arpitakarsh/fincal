import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { NavService } from '@/backend/services/NavService';
import { LatestNavRepository } from '@/backend/repositories/LatestNavRepository';
import { logger } from '@/lib/logger';

/**
 * /api/nav/ingest
 *
 * Daily latest-NAV ingestion endpoint.
 *
 * This route is intended to be called by Vercel Cron (or any external
 * scheduler) once per day after AMFI publishes NAVs (~19:00 IST / 13:30 UTC).
 *
 * NOTE: Vercel Cron jobs always send GET requests, so both GET and POST are
 * supported. GET is used by the Vercel Cron scheduler; POST is available for
 * manual/script-based triggers.
 *
 * Flow:
 *   1. Verify CRON_SECRET bearer token.
 *   2. Fetch AMFI NAVAll.txt (full daily snapshot — ~15k schemes).
 *   3. Parse with NavService.parseAmfiText().
 *   4. Validate: skip entries with NAV ≤ 0 or missing scheme codes.
 *   5. UPSERT all valid entries into the LatestNAV table.
 *   6. Return stats.
 *
 * Storage impact:
 *   - One row per scheme. Same row is overwritten each day.
 *   - No historical NAV rows are created here. Storage stays bounded.
 *
 * Idempotency:
 *   - Running this endpoint twice with the same AMFI data produces the same
 *     result (UPSERT semantics). Safe to retry on failure.
 */

async function handleIngest(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();

  // ── Authentication ──────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // When CRON_SECRET is not set (dev environment), allow requests with a
  // recognisable dev token to simplify local testing.
  const isAuthorized =
    cronSecret != null
      ? token === cronSecret
      : token === 'dev-secret-key'; // non-prod fallback

  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  // ── Fetch AMFI NAVAll.txt ───────────────────────────────────────────────────
  let amfiText: string;
  try {
    const amfiUrl = 'https://www.amfiindia.com/spages/NAVAll.txt';
    const res = await fetch(amfiUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000), // 30s — file is ~3MB
    });

    if (!res.ok) {
      const msg = `AMFI NAVAll.txt fetch failed with HTTP ${res.status}`;
      logger.error(msg);
      return NextResponse.json({ success: false, error: msg }, { status: 502 });
    }

    amfiText = await res.text();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`NAV ingest: AMFI fetch error: ${message}`);
    return NextResponse.json(
      { success: false, error: `AMFI fetch failed: ${message}` },
      { status: 502 },
    );
  }

  // ── Parse ───────────────────────────────────────────────────────────────────
  const universe = NavService.parseAmfiText(amfiText);
  const navEntries = Object.values(universe);

  if (navEntries.length === 0) {
    const msg = 'AMFI NAVAll.txt parsed to an empty universe — aborting ingest to protect existing data';
    logger.error(msg);
    return NextResponse.json({ success: false, error: msg }, { status: 502 });
  }

  // ── UPSERT to PostgreSQL ────────────────────────────────────────────────────
  // LatestNavRepository.upsertMany filters out invalid NAVs and chunks into
  // batches of 500 to stay within Neon's transaction limits.
  let written = 0;
  try {
    written = await LatestNavRepository.upsertMany(navEntries);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`NAV ingest: upsertMany failed: ${message}`);
    return NextResponse.json(
      { success: false, error: `DB upsert failed: ${message}` },
      { status: 500 },
    );
  }

  const durationMs = Date.now() - startedAt;
  const skipped = navEntries.length - written;

  logger.info(
    `NAV ingest complete: parsed=${navEntries.length} written=${written} skipped=${skipped} duration=${durationMs}ms`,
  );

  return NextResponse.json({
    success: true,
    data: {
      parsed: navEntries.length,
      written,
      skipped,
      durationMs,
    },
  });
}

/**
 * GET /api/nav/ingest
 *
 * Vercel Cron always sends GET requests. This handler allows the cron job
 * configured in vercel.json to trigger the daily NAV ingest automatically.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  return handleIngest(req);
}

/**
 * POST /api/nav/ingest
 *
 * Manual trigger for the NAV ingest (e.g. from scripts or admin tools).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleIngest(req);
}
