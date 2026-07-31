# Goal-Centric Recommendation Refactor

## Executive Summary
The architecture of the recommendation module has been successfully migrated from a User-centric model to a Goal-centric model. Previously, recommendations were flattened and linked strictly at the User level, resulting in mismatched suggestions across multiple goals. The entire stack has now been unified so that every recommendation inherently belongs to one specific goal.

## 1. Database & Cache Refactoring
- **Prisma Schema**: `RecommendationHistory` already possessed a `goalId` foreign key. The infrastructure was inherently ready, minimizing database migrations.
- **Redis Cache Layer**: The `AIOrchestrationService` now constructs its caching key utilizing `goalId` (`ai:recommend:${goalId}`) instead of `userId`. This ensures AI explanations correctly cache against the goal they were generated for.

## 2. API & Service Hardening
- **RecommendationRepository**: Added `getRecommendationsByGoalId` and stripped out the global fetch query.
- **AIOrchestrationService**: Rewrote the `.recommend(userId, goalId)` method to actively inject the individual `Goal` data directly into the Gemini prompt pipeline to produce goal-specific analysis, rather than mixing all user goals together into a generic output.
- **Dashboard API**: Refactored `/api/dashboard` to sequentially iterate over the user's `goals`. It now attaches goal-specific `recommendations` and the cached `aiExplanation` securely to the specific object.
- **Recommendation APIs**: Modified `/api/ai/recommend` to strictly parse and pass the `goalId` argument using Zod.

## 3. UI/UX Restructuring
- **Standalone Module Purged**: The monolithic "AI Recommendations" container card has been completely removed from the Dashboard.
- **Contextual Generation**: Each active goal now dynamically renders its own card containing:
  - Generate / Regenerate Controls
  - Contextual AI Insight block
  - Top 5 Recommended Funds with associated rationales and scores.

## Final Verification
The stack passed rigorous compilation steps:
- `next build` executed perfectly with zero TypeScript errors.
- Component architecture successfully respects isolation across multiple concurrent user goals.
