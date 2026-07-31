# AI Pipeline

The application heavily utilizes AI to provide financial advice.

## Integration
- **Provider**: Google Generative AI (Gemini).
- **Model**: `gemini-2.5-flash`.
- **Modes**: Both `application/json` (structured responses) and `text/plain` (freeform chat/analysis).
- **Wrapper**: `callAI` function in `ai.service.ts` wraps the Google SDK.

## Capabilities

1. **Financial Health Check** (`generateFinancialHealthCheck`):
   - Uses: User profile, portfolio, and goals.
   - Output: JSON containing `overallHealth`, `strengths`, `warnings`, and `actionPlan`.

2. **Chat Assistant** (`chat`):
   - Uses: User profile, portfolio with holdings, and goals as context.
   - Output: Text response to user questions.

3. **Portfolio Analysis** (`analyzePortfolio`):
   - Uses: Portfolio data.
   - Output: Text paragraph highlighting diversification, risks, and potential improvements.

4. **Goal Recommendations** (`generateGoalRecommendations` & `generateRecommendations`):
   - Uses: User's goal, profile, portfolio, and an objective metrics engine context.
   - Output: Ranks candidate funds provided by the objective engine, returns a JSON array of recommendations with reasons, pros/cons, and risks.

## Storage and Caching
- Insights and Recommendations are saved to the database (`AIInsightHistory`, `AIRecommendation`).
- Results are cached in Redis to prevent excessive API calls.
- `RateLimiter` is available to protect AI endpoints from abuse.
