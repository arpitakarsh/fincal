## [Unreleased]
### Added
- Functional AI APIs (`/api/ai/chat`, `/api/ai/analyze-portfolio`, `/api/ai/recommend`) dynamically tied to user data.
- **AI Integration Stability**: Upgraded Gemini AI orchestration to gracefully surface true errors (429 Rate Limits, 403 Keys) rather than generic "AI generation failed" aborts. Enforced `withApiAuthAndError` on the Chat API.
- **Mutual Fund Data Pipeline**: Upgraded and executed the AMFI sync provider to seed the database with real, live Indian Mutual Funds (filtered for Direct Growth). The recommendation engine now ranks and returns actual market funds.
- **Frontend Integration**: Built and wired the `/onboarding` pipeline to the `InvestorProfileRepository`. Constructed the `/dashboard` UI natively in Tailwind to fetch user metrics, portfolio, goals, and directly trigger AI Mutual Fund Recommendations.
- **Authentication Repair**: Restored missing Next.js API catch-all route leveraging Better Auth's `toNodeHandler` to correctly process requests and cure 404 dead-ends.
- **FINAL AUDIT**: Performed full sweep of the repository confirming 100% backend consistency, passing builds, and zero dead code/TypeScript errors.
- **Production Hardening Audit**: Centralized API error handling (`withApiAuthAndError`), enforced Prisma transactions, fortified environment variable checks, stripped bloated UI libraries, and verified robust Redis degradation.
- **Market Data Module**: Implemented Provider Architecture (`MarketDataProvider`), `AMFIProvider`, Redis-cached APIs (`/api/market/funds`, `categories`, `amcs`, `nav`).
- Functional `Dashboard` UI aggregating live data from all backend modules via `GET /api/dashboard`.
- Completed Portfolio Management Module (Holdings CRUD, Dynamic Analytics, Redis Caching).
- `UserHolding` schema model linked to `Portfolio` and `MutualFund`.
- Portfolio Analytics API (`GET /api/portfolio/analytics`) for dashboard graphs.
- Integrated Recommendation Engine with real Mutual Fund database.
- Dynamic Mutual Fund scoring pipeline based on Horizon and Risk Appetite.
- Redis Caching for `POST /api/recommendations/generate` to prevent heavy redundant evaluations.
- Support for detailed AI/Logic-based rationales (`rationale`) explaining WHY a fund was picked.
- `InvestorProfileRepository` scaffolded for fetching risk context.
- `RECOMMENDATION_ENGINE_REPORT.md` documenting engine architecture and logic weights.
- `schemeType` schema field to `MutualFund` (e.g., "Open Ended Schemes") for rich filtering capabilities.
- Added comprehensive batched `$transaction` insertions to `AmfiImporterService` protecting database layer from locking and timeouts.
- `GET /api/funds` now securely handles `skip`/`take` pagination with dynamic query parameters (`limit`, `page`, `schemeType`).
- Integration tests targeting batched queries and fail-states in `sync-amfi` endpoints.
- Auto-sync retry mechanics with exponential backoff on fetch failures.
- `MUTUAL_FUND_REPORT.md` documenting production readiness.

## [Current Release Phase] - 2026-07-29

### Added
- **Market Data Architecture:** Built an extensible Provider Strategy pattern for live NAV tracking.
  - `src/market-data/providers/*` (Interface, Mock Provider, and Factory built to avoid paid APIs initially)
  - `src/market-data/services/MarketDataService.ts` (Upserts AMC and MutualFund DB models natively)
  - `src/app/api/market-data/search/route.ts` & `src/app/api/market-data/sync/route.ts`
  - `src/market-data/jobs/syncJob.ts` (Exposes `runDailyNavSync()` for external schedulers)
- **Redis Caching Layer:** Injected targeted caching into core Domain Services (`GoalService`, `PortfolioService`, `AIOrchestrationService`).
- **AI Orchestration:** Fully integrated the Gemini API with existing data models.
- **Recommendation Engine Pipeline:** Implemented complete CRUD pipeline for retrieving and viewing AI recommendations.
- **Dashboard Integration:** Built `/api/dashboard` aggregation endpoint and fully wired the frontend dashboard.
- **Portfolio Module:** Integrated comprehensive API and UI workflows for Portfolio tracking. 
- **Goals Module:** Added comprehensive Create, Read, Update, and Delete logic. 
- **Better Auth Integration:** Secure email/password flows mapping directly to the Prisma schema.
- **Integration Testing Suite:** Created comprehensive Vitest tests for all backend APIs with Prisma and Redis mocking.

### Changed
- **Architectural Shift:** Rolled back fragmented Monorepo structure natively back into `src/`.

### Removed
- **Bloated UI:** Deleted all marketing code, MagicUI, Framer Motion animations.

### Fixed
- End-to-end Audit: Upgraded AI service to `gemini-2.5-flash` to resolve 404 Not Found error from legacy flash model.
- Recommendation Dashboard: Fixed backend response mismatch in `/api/ai/recommend` where the frontend expected `explanation` but the API returned `reply`. AI explanations now render successfully.
- API Security: Secured `/api/recommendations/generate` using `withApiAuthAndError` middleware, bringing it into compliance with existing security standards.
- E2E Testing: Programmatically validated RecommendationEngine and AIOrchestrationService behavior using real database funds and mock user profiles.

### Changed
- **Architectural Correction**: Fully migrated the Recommendation Engine and AI Generation modules from a global User-centric model to a Goal-centric model.
- **Dashboard UI**: Removed the global recommendation card. Recommendations, expected returns, and AI insights now dynamically generate and render contextually inside the specific Goal cards.
- **Caching**: AI Explanations are now securely cached in Redis uniquely against the `goalId` instead of generically at the `userId` level.
- **Date Handling Bugfix**: Replaced custom string refinements with `z.coerce.date()` across Zod schemas, specifically in Goal Creation. This fixes a `PrismaClientValidationError` ("premature end of input") by ensuring frontend date strings are properly converted into JavaScript `Date` objects before interacting with the database.
- **Complete Frontend Integration**: Created missing UI pages (`/funds`, `/admin`, `/portfolio/holdings`, `/profile`, `/goals/[id]`, `/chat`) and wired them natively to their respective existing backend APIs. This officially maps 100% of the completed backend logic directly to the user interface.

## Goal-Centric AI Recommendation Refactor

- **Goal Create Form**: Rebuilt with only investment-planning-relevant fields. Added goal-specific `riskPreference` (LOW/MODERATE/HIGH/VERY_HIGH). SIP/Lump Sum amounts are shown conditionally based on chosen investment mode. After creation, user is redirected directly to Goal Details page.
- **Database**: Added `riskPreference String?` column to `Goal` table in Prisma schema. Pushed to NeonDB and regenerated Prisma Client.
- **RecommendationEngine**: Converted from subjective rule-based scoring to `prepareRecommendationContext()`. Now computes deterministic objective metrics (required CAGR, shortfall, inflation-adjusted target) and filters candidate funds using hard constraints only.
- **AIOrchestrationService**: Added `generateGoalRecommendations(goal, profile, portfolio, engineContext)`. AI receives full context + filtered candidate funds and must respond with structured JSON (fundId, aiScore, confidence, suitability, summary, whyRecommended, pros, cons, risks, bestFor, notIdealFor).
- **RecommendationService**: Refactored to orchestrate the full pipeline: load data → engine context → AI ranking → persist to DB as JSON-serialized rationale → return from DB with fund metrics.
- **RecommendationRepository**: Now includes `fund: { include: { metrics: true } }` in all queries, exposing CAGR, Sharpe, Sortino, Alpha, Beta etc to the frontend.
- **`/api/recommendations`**: Added POST endpoint for generation. GET endpoint now supports `?goalId=` filter.
- **Goal Details page (`/goals/[id]`)**: Full rebuild. Shows goal parameters, manual "Generate Recommendation" button, rich AI recommendation cards with expandable panels showing fund metrics (CAGR, Sharpe, Alpha, etc.), Pros, Cons, Risks, Best For, Not Ideal For, and "Add to Portfolio" action button.
- **Dashboard**: Simplified. Removed inline recommendation generation. Each Goal card now shows recommendation count and links to the Goal Details page.

## Recommendation Quality Improvement

### Problem Fixed
System was recommending Liquid, Dynamic Bond, and Corporate Bond funds for long-horizon goals like Wealth Creation (6+ years). Root cause: the candidate filter was generic and did not enforce financial horizon logic.

### Changes

**`src/engine/RecommendationEngine.ts`** — Replaced weak generic filter with horizon-based category suitability map:
- 6 horizon buckets: `emergency` (<1yr), `short` (1–3yr), `medium` (3–5yr), `medium_long` (5–7yr), `long` (7–10yr), `very_long` (10+yr)
- Each bucket maps to financially appropriate fund categories (e.g. `very_long` → Flexi Cap, Mid Cap, ELSS, Index)
- Emergency Fund goal type auto-routes to Liquid/Money Market regardless of horizon
- Risk-based exclusion layer (e.g. Low risk excludes Small Cap, Thematic, Contra)
- SIP mode check: excludes funds whose minSip exceeds user's monthly amount
- Fund deduplication by ID before passing to AI
- Funds sorted to prefer those with metrics (richer AI context)
- Falls back to all funds only if category filter returns 0 results
- Enriches each candidate with full fund metrics (CAGR, Sharpe, Sortino, Alpha, Beta, Drawdown) 

**`src/services/AIOrchestrationService.ts`** — Rewrote AI prompt with explicit 7-dimension scoring rubric:
1. CAGR Coverage (25 pts) — vs required CAGR
2. Risk-Adjusted Returns (20 pts) — Sharpe/Sortino
3. Cost Efficiency (15 pts) — expense ratio
4. Downside Protection (15 pts) — max drawdown, beta
5. Fund Quality & Scale (10 pts) — AUM
6. Horizon Alignment (10 pts) — category match
7. Risk Compatibility (5 pts) — riskometer vs goal risk
- AI must return `scoreBreakdown` per dimension so scores are auditable
- AI deduplicates its own output (by fundId, keeping highest score)
- Strict rules: exact fund IDs, no invented funds, valid JSON only

**`src/services/RecommendationService.ts`** — Added deduplication before DB save, fetches funds with metrics included (limit 200).

**`src/app/goals/[id]/page.tsx`** — Added visual Score Breakdown panel (7 progress bars) in expanded fund detail view.

### Validation Scenarios
| Goal | Horizon | Expected Categories |
|------|---------|-------------------|
| Emergency Fund | 6 months | Liquid, Money Market, Overnight |
| Car | 2 years | Arbitrage, Corporate Bond, Short Duration |
| House | 5 years | Aggressive Hybrid, Balanced Advantage, Flexi Cap |
| Wealth Creation | 7 years | Flexi Cap, Large & Mid Cap, Multi Asset |
| Retirement | 25 years | Flexi Cap, Mid Cap, ELSS, Index |
| Child Education | 15 years | Flexi Cap, Large & Mid Cap, Mid Cap |
