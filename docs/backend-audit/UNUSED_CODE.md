# Unused or Deprecated Code

During the code scan, the following unused or deprecated elements were identified:

1. **`AIOrchestrationService.recommend`**
   - Explicitly throws an error: `Deprecated: Use generateGoalRecommendations instead`.

2. **`UserRepository`**
   - Exists in `backend/repositories/UserRepository.ts`.
   - All methods (`findById`, `create`, `update`) are commented out and currently empty.
   - Most user fetching is done directly via `prisma.user` in route handlers.

3. **`Goal` Model's `type` field**
   - Comment notes: `// Preserved from legacy placeholder model`.

4. **Potential Incompleteness in `PortfolioService.recalculatePortfolioTotals`**
   - The method comments note: `// Future integration: update currentValue based on latest NAV` and `// For now, let's keep it simple...`. It appears the recalculation logic is not fully implemented regarding writing back to the `Portfolio` model.
