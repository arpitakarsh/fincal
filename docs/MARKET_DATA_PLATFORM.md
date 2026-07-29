# Market Data Platform

## Architecture Overview
The Market Data Platform (`src/features/market-data/`) is the central nervous system for all quantitative finance features. It abstracts away specific data vendors (Morningstar, AMFI, etc.) to ensure the Recommendation and Probability engines remain completely insulated from external API changes.

## Synchronization Pipeline
The `syncPipeline.ts` orchestrates the ingestion of external data. It follows a strict 4-step pure process:
1. **Fetch**: Calls the `IMarketDataProvider`.
2. **Validation**: Passes the raw payload through rigid Zod schemas (`schemas/providerPayloads.ts`). Any data violating basic physics (e.g. negative expense ratios) is dropped and logged, never touching the database.
3. **Normalization**: Standardizes naming conventions (e.g., merging "Large-Cap" and "Large Cap Equity" into a standard enum).
4. **Persist**: Upserts the data into Prisma.

## Database Expansion
We have heavily expanded the data model to include:
- `SectorAllocation` & `PortfolioHolding`: Allowing deep-dive portfolio overlapping and risk analysis.
- `ProviderMetadata`: Maps AMFI/Morningstar specific IDs to our internal UUIDs.
- `SyncLog`: Tracks the health of daily ingestion cron jobs.

## Internal API Boundary
The `MarketDataService.ts` is the only file that internal modules (like the Probability Engine) should talk to. It fetches the heavily sanitized, internally mapped data straight from Prisma, oblivious to the fact that it originally came from an external API.
