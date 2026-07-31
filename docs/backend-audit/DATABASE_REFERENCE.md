# Database Reference

The application uses PostgreSQL with Prisma ORM.

## Models Discovered

### Identity & Auth
- **User**: Core user identity.
- **Session**: Auth sessions.
- **Account**: Third-party OAuth accounts.
- **Verification**: Verification tokens.

### User Data
- **UserPreferences**: Theme, currency, alerts.
- **InvestorProfile**: Financial information, risk appetite, behavior.
- **Goal**: Investment goals (target amount, date, etc.).
- **GoalProgress**: Snapshots of goal progress.
- **Portfolio**: Aggregated portfolio info.
- **PortfolioSnapshot**: Historical snapshots of portfolio value.
- **PortfolioHolding** / **UserHolding**: Specific fund holdings for a user.

### Mutual Funds & Market Data
- **AMC**: Asset Management Companies.
- **MutualFund**: Fund details, metadata.
- **FundMetrics**: Computed metrics (CAGR, Sharpe, etc.).
- **HistoricalNAV**: NAV history.
- **RollingReturn**: Rolling returns data.
- **AnalyticsCache**: Cached analytics data.
- **SectorAllocation**: Sector-wise allocation.
- **ProviderMetadata**: External provider mappings.

### AI & Jobs
- **AIInsightHistory**: History of generated AI insights.
- **RecommendationHistory**: History of AI recommendations for goals.
- **SyncLog**: Logs for background sync jobs (e.g., DailyNavSync).

## Repositories
- `GoalRepository`
- `InvestorProfileRepository`
- `PortfolioRepository`
- `UserHoldingRepository`
- `AIInsightRepository`
- `UserRepository` (Methods are currently commented out / empty)
