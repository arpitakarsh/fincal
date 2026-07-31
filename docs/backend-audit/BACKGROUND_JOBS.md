# Background Jobs

Explicit background job scheduling mechanisms (like cron or queue workers) were not directly observed in the provided codebase snippet.

However, there is evidence of background processes and synchronization tasks:

1. **SyncLog Model**:
   - The Prisma schema includes a `SyncLog` model intended to track background jobs.
   - Example job mentioned: `DailyNavSync`.
   - Tracks `status` (SUCCESS, PARTIAL, FAILED), `recordsProcessed`, and `errors`.

2. **LiveFundService Caching**:
   - `LiveFundService` fetches the entire NAV universe from AMFI (`NAVAll.txt`).
   - The result is cached for 12 hours (`43200` seconds).
   - This suggests a mechanism where data is periodically refreshed, perhaps triggered by the first user request after cache expiration, acting as an implicit background task.

Further investigation into the deployed environment (e.g., Vercel Cron, external task schedulers) would be needed to see how these syncs are formally scheduled.
