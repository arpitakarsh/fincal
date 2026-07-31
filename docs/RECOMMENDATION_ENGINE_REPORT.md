# Recommendation Engine Production Report

## Overview
The Recommendation Engine has been completely modernized to integrate with the real Mutual Fund database. The scoring algorithm dynamically balances investor risk appetite, investment horizon, and asset allocation strategies to serve personalized Mutual Fund recommendations, replacing static hardcoded lists.

## Architecture

1. **`RecommendationEngine.ts` (Core)**
   - Acts as a pure scoring pipeline.
   - Takes `Goal`, `InvestorProfile`, and a list of active `MutualFund` records as inputs.
   - Returns a sorted list of `ScoredFund` containing the fund object, the computed score, and a text rationale explaining *WHY* this fund was selected for the specific user context.

2. **`RecommendationService.ts` & Caching**
   - Coordinates repository reads.
   - Applies Redis caching using composite keys (`recommendations:{userId}:{goalId}`). Caches expire every 24 hours to balance freshness with database load.
   - Triggers the `RecommendationRepository.saveMany` batch insert to persist generated recommendations into `RecommendationHistory`.

3. **API Layer (`/api/recommendations/generate`)**
   - Implements `POST` endpoints.
   - Validates requests via `zod`.
   - Safely executes the orchestration logic.

## Scoring Factors & Weights

The engine computes a base score of 50 and dynamically applies modifiers capped between 0 and 100:

- **Investment Horizon vs. Category Alignment**:
  - *Short Term (< 3 years)*: Heavily penalizes Equity funds (-40) and strongly rewards Debt/Liquid funds (+30).
  - *Medium Term (3 - 7 years)*: Rewards Hybrid/Balanced funds (+30).
  - *Long Term (> 7 years)*: Rewards Equity funds (+30) for wealth creation, penalizes Debt funds (-20) due to inflation risk.
- **Risk Appetite Alignment**:
  - *Conservative/Low*: Penalizes Equity (-30), rewards Debt (+20).
  - *Aggressive/High*: Rewards Equity (+20).
- **Scheme Type Bias**:
  - Minor bonus (+5) applied for "Open Ended" schemes favoring high liquidity.

## Remaining Improvements
- Expand `FundMetrics` data points (Sharpe Ratio, Alpha) into the scoring model for quantitative filtering.
- Implement UI integration to surface the recommendations on the Goal Detail views.
