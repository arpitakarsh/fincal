# Investor Profile Domain

## Data Model
The `InvestorProfile` model represents the central financial identity of the user. It aggregates their basic demographics (Age), financial snapshot (Capital, Income, Monthly Cap), Primary Goals, and Behavioral indicators (Risk Tolerance, Knowledge).

## Validation Rules
We utilize strict Zod schemas (`src/features/investor/schemas/investor.schema.ts`) to ensure zero corrupt data enters the system. Age must be >= 18, target years must be in the future, and financial integers cannot be negative.

## Wizard Flow
The UI is driven by `useInvestorWizard` hook to manage state locally without polluting the global calculator state. It flows from Basic Details -> Financial Details -> Goals -> Preferences -> Review.

## Future Extensions
This profile is completely decoupled from the SIP calculator. It will serve as the engine for the forthcoming Category Recommendation Engine, Monte Carlo Simulation, and AI Portfolio Generation systems without requiring schema updates.
