# Portfolio Management Report

## Architecture Overview
The Portfolio Management module tracks user investments in Mutual Funds, providing dynamic analytics, allocation graphs, and history.

### Database Layer
- **`Portfolio`**: A high-level entity holding cached calculations (totalInvested, etc.) associated 1:1 with a `User`.
- **`UserHolding`**: The crucial mapping model linking `Portfolio` to `MutualFund`. It tracks the individual units purchased, average NAV, and invested capital per scheme.
- **`PortfolioSnapshot`**: Daily tracking metric for total net worth plotting.

### Service Layer (`PortfolioService.ts`)
- **Holdings Management**: Implements idempotent logic for Adding, Updating, and Deleting `UserHolding` records. Automatically invalidates Redis caches and triggers portfolio total recalcs upon mutation.
- **Analytics Pipeline**: Computes real-time:
  - Total Invested vs Current Value
  - Absolute Gain & Loss (%)
  - Asset Allocation Breakdown (Equity vs. Debt vs. Hybrid)
  - Category Allocation Breakdown (Large Cap, Mid Cap, etc.)
  - AMC Allocation Breakdown (HDFC, SBI, etc.)

### API Layer
- **`GET /api/portfolio`**: High-level metadata.
- **`POST /api/portfolio/holdings`**: Create holding.
- **`PUT /api/portfolio/holdings/[id]`**: Mutate holding.
- **`DELETE /api/portfolio/holdings/[id]`**: Remove holding.
- **`GET /api/portfolio/analytics`**: Robust metrics payload (cached 5 mins via Redis).

## Verification Details
- **Build**: Successfully compiles `Next.js 15 Turbopack`.
- **Database**: Schemas pushed, relations validated, cascading deletes enacted on User/Portfolio drops.
- **Tests**: `vitest` mocks verify complex allocation map calculations correctly bucket funds by category.

## Remaining Improvements (Future Work)
- Integrate a live fetching hook to update `currentValue` dynamically against real-time NAV records rather than assuming static values.
- Build the `XIRR` calculation engine route to handle rolling cashflows.
