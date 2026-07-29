# Portfolio Tracking & Goal Management

## Architecture Overview
The Portfolio Tracking module (`src/features/dashboard/`) serves as the central state engine for the user. It aggregates the outputs of the Authentication, Recommendation, and AI engines into a unified view of the user's financial life.

## Goal-Centric Design
Unlike standard brokerages that just dump a list of mutual funds on the screen, this platform tracks **Goals**. 
The `Goal` model in Prisma acts as the parent container. A user has a "House" goal. That goal tracks its own `currentAmount`, `monthlySip`, and `healthScore`. The recommendations are then attached directly to that specific goal via the `RecommendationHistory` table.

## Health Scoring Engine
The `GoalService` implements a dynamic `healthScore` calculator. It analyzes the current percentage funded versus the time remaining. A goal that is 10% funded with 20 years left is "GOOD". A goal that is 10% funded with 1 year left is "CRITICAL". This translates directly to the `GoalCard.tsx` UI, immediately drawing the user's attention to failing goals.

## Future Live Portfolio Valuation
Currently, the `Portfolio` model tracks `totalInvested` (what the user manually inputted). In a future release, the `MarketDataService` will cross-reference the user's `PortfolioHolding`s with daily NAV updates, automatically recalculating the `currentValue` of the portfolio every evening and pushing the delta to the `PortfolioSnapshot` table to render historical equity curves.
