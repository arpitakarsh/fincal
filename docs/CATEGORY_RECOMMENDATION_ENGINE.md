# Category Recommendation Engine

## Architecture
The Category Recommendation Engine is a deterministic, rule-based system isolated at `src/features/recommendation/engine/`. It deliberately eschews Artificial Intelligence in favor of highly predictable, testable, and transparent mathematical scoring.

## Scoring System
Categories receive points based on multi-variate factors derived from the `InvestorProfile`:
1. **Horizon Scoring**: Time-to-goal dictates eligibility. (e.g., Short-term goals issue absolute vetos to equity funds, resulting in a 0 multiplier).
2. **Risk Scoring**: Risk appetite adds additive scoring to appropriately volatile funds.
3. **Goal Scoring**: Specific goal vectors (like Retirement) provide booster multipliers to wealth-creation categories like Flexi Cap.

## Decision Rules & Transparency
Every output is packaged with a `reason` and `risks` paragraph generated strictly by `explainer.ts`. This ensures full transparency for compliance and user trust.

## Future Extensibility
Since the engine is a pure TypeScript function (`calculateScore`), it can be run on the client, server-side in an API route, or directly inside a PostgreSQL Prisma migration script for bulk re-evaluations. It is fully ready to pipe its category outputs into the actual Mutual Fund Database query engine.
