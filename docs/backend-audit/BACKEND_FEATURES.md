# Backend Features

Based on the code analysis, the following backend features have been discovered:

1. **AI Integration**:
   - Financial Health Check generation.
   - User financial insights chat.
   - Portfolio analysis.
   - Goal recommendations based on investor profile, portfolio, and candidates.
   - Managed by `AIOrchestrationService` and `AIRecommendationService`.

2. **User Profiles and Goals**:
   - `InvestorProfile` management (age, capital, income, risk appetite).
   - `Goal` management (wealth creation, house, education, etc.).
   - Managed by `GoalService` and `InvestorProfileRepository`.

3. **Portfolio Management**:
   - Portfolio creation and management.
   - Holdings tracking and analytics.
   - Real-time NAV fetch via `LiveFundService`.
   - Managed by `PortfolioService`.

4. **Live Mutual Fund Data**:
   - Fetching live mutual fund universe from AMFI.
   - Searching mutual funds.
   - Fetching fund details from `mfapi.in`.
   - Managed by `LiveFundService`.

5. **Caching & Rate Limiting**:
   - Redis-based caching via `CacheManager`.
   - Sliding window rate limiting via `RateLimiter` (Redis Sorted Sets).

6. **Authentication**:
   - Better Auth integration (`better-auth/react`, `better-auth/adapters/prisma`).
   - Session and Account management.
