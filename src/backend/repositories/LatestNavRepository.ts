import { prisma } from '@/backend/infrastructure/database/client';
import { logger } from '@/lib/logger';
import type { LiveNAV } from '@/backend/services/NavService';

/**
 * Repository for the LatestNAV table.
 *
 * Design decisions:
 * - schemeCode is the primary key → exactly one row per scheme.
 * - All writes are UPSERTs: INSERT or UPDATE.  Never DELETE + INSERT.
 *   This keeps storage bounded (one row per scheme, not one per day).
 * - Repository does NOT contain business logic — that lives in NavService
 *   and the ingest service.
 */
export class LatestNavRepository {
  /**
   * Find the latest NAV for a single scheme code.
   * Returns null if the scheme is not in the database yet.
   */
  static async findBySchemeCode(schemeCode: string): Promise<LiveNAV | null> {
    try {
      const row = await prisma.latestNAV.findUnique({
        where: { schemeCode },
      });
      if (!row) return null;

      return {
        schemeCode: row.schemeCode,
        schemeName: row.schemeName,
        nav: row.nav,
        date: row.navDate,
        amc: row.amc,
        category: row.category,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`LatestNavRepository.findBySchemeCode failed for ${schemeCode}: ${message}`);
      // Re-throw so callers can decide the fallback strategy
      throw err;
    }
  }

  /**
   * Upsert a single scheme's latest NAV.
   * Creates the row if it doesn't exist; updates it if it does.
   * nav must be > 0 — invalid values are rejected before reaching here.
   */
  static async upsert(nav: LiveNAV): Promise<void> {
    const data = {
      schemeName: nav.schemeName,
      nav: nav.nav,
      navDate: nav.date,
      amc: nav.amc,
      category: nav.category,
    };

    await prisma.latestNAV.upsert({
      where: { schemeCode: nav.schemeCode },
      create: { schemeCode: nav.schemeCode, ...data },
      update: data,
    });
  }

  /**
   * Upsert a batch of latest NAVs.
   *
   * Uses individual upserts in a Prisma transaction for correctness.
   * Returns the number of records successfully written.
   *
   * We avoid Prisma's createMany because it doesn't support upsert semantics
   * in a single statement on all adapters.  The transaction ensures atomicity
   * at the batch level.
   *
   * For very large batches (10k+ schemes) consider chunking; AMFI has ~15k
   * schemes, which is comfortably handled in a single Neon transaction at
   * this project's scale.
   */
  static async upsertMany(navs: LiveNAV[]): Promise<number> {
    if (navs.length === 0) return 0;

    // Filter out any entries that somehow have invalid NAV (defensive)
    const valid = navs.filter(n => Number.isFinite(n.nav) && n.nav > 0);
    if (valid.length === 0) return 0;

    let written = 0;

    // Prisma's interactive transactions have a 5s default timeout.
    // For 15k+ rows, use $executeRawUnsafe or chunking if needed.
    // For typical AMFI data (~15k rows), chunking in application is safe.
    const CHUNK_SIZE = 500;

    for (let i = 0; i < valid.length; i += CHUNK_SIZE) {
      const chunk = valid.slice(i, i + CHUNK_SIZE);
      try {
        await prisma.$transaction(
          chunk.map(n =>
            prisma.latestNAV.upsert({
              where: { schemeCode: n.schemeCode },
              create: {
                schemeCode: n.schemeCode,
                schemeName: n.schemeName,
                nav: n.nav,
                navDate: n.date,
                amc: n.amc,
                category: n.category,
              },
              update: {
                schemeName: n.schemeName,
                nav: n.nav,
                navDate: n.date,
                amc: n.amc,
                category: n.category,
              },
            }),
          ),
        );
        written += chunk.length;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error(
          `LatestNavRepository.upsertMany chunk ${i}–${i + chunk.length} failed: ${message}`,
        );
        // Continue with remaining chunks; partial success is better than total failure
      }
    }

    return written;
  }
}
