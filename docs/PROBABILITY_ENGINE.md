# Probability & Analytics Engine

## Architecture Overview
The Probability Engine eliminates the flaw of "point-estimate" financial planning (e.g. assuming a static 12% CAGR forever). By strictly utilizing `HistoricalNAV` data points, the engine runs exhaustive `rolling.ts` calculations to determine the exact historical frequency of various return outcomes.

## Rolling Return Methodology
Instead of looking at point-to-point returns (which are heavily biased by the start/end dates chosen), the engine calculates returns for *every possible* N-year window in the fund's history. 
If a fund is 10 years old, there are roughly 1,750 trading days. For a 3-year horizon, the engine evaluates ~1,000 distinct 3-year periods to generate a robust statistical distribution.

## Probability Distributions
`probability.ts` buckets these thousands of rolling returns into human-understandable ranges (Negative, 0-8%, 12-15%, etc.). This generates the data payload for `ProbabilityHistogram.tsx`, showing the investor that while they *might* get 15%+, there is a historical 20% chance they land in the 8-12% bucket.

## Success Estimation
By solving the CAGR formula backward (`success.ts`), we identify the exact Minimum Required Rate of Return for a user's goal, and then divide the number of historical periods that beat that threshold by the total number of periods. "You have an 84% historical probability of hitting this goal".

## Future Integrations
Because this system relies heavily on processing massive arrays of daily NAVs, we have mapped an `AnalyticsCache` Prisma model. In a production environment, cron jobs will calculate these arrays overnight and serialize the `ProbabilityDistribution` JSON directly into the database to ensure rapid API responses. Monte Carlo simulations can be added as a separate module in the future if randomized Gaussian distribution modeling is desired.
