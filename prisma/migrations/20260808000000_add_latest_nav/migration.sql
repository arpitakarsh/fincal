-- Migration: add_latest_nav
-- Purpose: Create LatestNAV table to store the current (latest) NAV per scheme.
--
-- Design:
--   - One row per scheme code (schemeCode is the primary key).
--   - Rows are UPSERTed by the daily ingest job — never inserted historically.
--   - This is NOT a historical NAV table. Storage is bounded at ~one row per
--     mutual fund scheme (~15,000 rows for the entire AMFI universe).
--   - Historical NAV data is intentionally NOT stored here (it lives in Redis
--     with a 24h TTL to avoid bloating the free-tier PostgreSQL database).

-- CreateTable
CREATE TABLE "LatestNAV" (
    "schemeCode" TEXT NOT NULL,
    "schemeName" TEXT NOT NULL DEFAULT '',
    "nav"        DOUBLE PRECISION NOT NULL,
    "navDate"    TEXT NOT NULL DEFAULT '',
    "amc"        TEXT NOT NULL DEFAULT '',
    "category"   TEXT NOT NULL DEFAULT '',
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LatestNAV_pkey" PRIMARY KEY ("schemeCode")
);
