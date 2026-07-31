# Recommendation Pipeline Debug Report

## Issue Overview
The `Generate Recommendations` feature on the frontend was failing silently or causing HTTP 500 errors. During the debugging audit, the execution was traced from the frontend API call to the backend AI and database logic. 

## Step-by-Step Trace & Root Cause Analysis

### 1. Frontend Button & API Call
**Status:** Works correctly.
**Trace:** The frontend button in `DashboardPage.tsx` successfully dispatched a `POST /api/recommendations/generate` request containing the correct `goalId` in JSON format.

### 2. API Endpoint & Validation
**Status:** Works correctly.
**Trace:** `generateSchema.parse(body)` successfully parsed the UUID. BetterAuth successfully validated the `session` and extracted the authenticated `userId`.

### 3. Recommendation Service & Caching
**Status:** **FAILED (Fixed)**
**Root Cause 1:** The `RecommendationService` utilized Redis caching but did not provide a way for the frontend to *force* regeneration. Since an earlier generation attempt failed (when the database was empty), an empty array `[]` was permanently cached. Clicking "Generate" repeatedly returned this empty cache instead of re-running the engine.
**Fix:** Modified `RecommendationService.generateRecommendations` to accept a `forceRefresh` parameter, and updated the API route to pass `true` when invoked via the explicit frontend button action.

### 4. Database Connection (Prisma)
**Status:** **FAILED (Fixed)**
**Root Cause 2:** During the API trace, the execution threw an unhandled exception: `Can't reach database server at ep-floral-breeze...neon.tech`. Investigation revealed that the codebase instantiated `new PrismaClient()` 17 times across different Repositories and Services. In the Next.js development environment with Hot Module Replacement (HMR), this rapidly spawned hundreds of inactive database connections, exhausting the Neon DB connection pool limits and causing subsequent queries to time out.
**Fix:** Refactored the entire codebase to strictly use the singleton pattern defined in `src/database/client.ts`. Replaced all manual `new PrismaClient()` calls with `import { prisma } from '@/database/client'`.

### 5. Recommendation Engine Execution
**Status:** Works correctly.
**Trace:** Once the database connection was stable, the query to fetch active MutualFunds returned successfully. The engine's ranking algorithm evaluated the Investor Profile against the MutualFunds dataset and successfully identified the Top 5 recommended funds.

### 6. Persistence & Return
**Status:** Works correctly.
**Trace:** The recommended funds were saved to the `RecommendationHistory` table tied to the specific `goalId`. The API correctly returned the JSON payload containing the array of recommendations with their rationale and scoring, which the frontend rendered successfully.

## Verification
A clean build (`npm run build`), linter pass (`npm run lint`), and Prisma validation were performed successfully to ensure the refactor did not introduce any regressions.

The "Generate Recommendations" flow is now fully operational end-to-end.
