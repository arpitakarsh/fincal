# Mutual Fund Recommendation Engine

## Architecture
The quantitative Mutual Fund Recommendation Engine runs completely independently of specific providers. By utilizing the `IFundProvider` abstraction layer, the engine can pull raw JSON from AMFI, Morningstar, or any proprietary API, and map it into the standard `MutualFundData` object.

## Ranking Pipeline
1. **Validation**: Enforces strict cutoffs (e.g. AUM > 500Cr, Age > 3 Years) to eliminate extremely risky, unproven, or liquid-constrained funds.
2. **Metric Normalization**: Standardizes diverse metrics (Expense Ratios, Sharpe, Drawdowns) onto a strict `0.0` to `1.0` scale using mathematical boundaries.
3. **Scoring Formula**:
   - `Sharpe Ratio`: 30% (Risk-adjusted performance)
   - `Rolling Return`: 30% (Consistency)
   - `Downside Capture`: 25% (Capital protection)
   - `Expense Ratio`: 15% (Cost drag)
4. **Ranking**: Funds are sorted descending by the computed `FundQualityScore` (0-100 scale).

## Explanation Engine
To provide maximum transparency and prevent blind AI-generated text, the `explainer.ts` engine deterministically maps the highest and lowest scoring metrics from the `FundScore.breakdown` object to human-readable explanations. 
If a fund scores exceptionally well on Expense Ratio but poorly on Downside Capture, the text automatically outputs: 
- *Strength: Highly efficient, low-cost expense ratio.*
- *Weakness: Can fall heavier than peers during bear markets.*

## Future Live Data Integration
The `src/features/funds/services/interfaces/IFundProvider.ts` is ready. 
To go live:
1. Create `MorningstarProvider.ts` implementing `IFundProvider`.
2. Connect it to a cron-job to dump updated metrics into the Prisma `MutualFund` and `FundMetrics` tables nightly.
3. Call `rankCategoryFunds(await provider.getFundsByCategory('Flexi Cap'))` to generate real-time recommendations.
