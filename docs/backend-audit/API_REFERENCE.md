# API Reference

The following API routes were discovered in the Next.js `app/api` directory:

1. **Dashboard**
   - `GET /api/dashboard`: Fetches user profile, goals, recommendations, and portfolio analytics.

2. **Funds**
   - `GET /api/funds`: Searches and paginates through live mutual funds.
   - `GET /api/funds/[id]`: Fetches specific fund details based on scheme code.

3. **Goals**
   - `GET /api/goals`: Retrieves all goals for the authenticated user.
   - `POST /api/goals`: Creates a new goal.
   - `GET /api/goals/[id]`: Retrieves a specific goal.
   - `PUT /api/goals/[id]`: Updates a specific goal.
   - `DELETE /api/goals/[id]`: Deletes a specific goal.

4. **Onboarding**
   - `POST /api/onboarding`: Saves user investor profile and optionally creates a first goal.

5. **Portfolio**
   - `GET /api/portfolio`: Retrieves the user's portfolio.
   - `POST /api/portfolio`: Creates or updates a portfolio.
   - `DELETE /api/portfolio`: Deletes the portfolio.
   - `GET /api/portfolio/analytics`: Retrieves analytics for the portfolio.
   - `POST /api/portfolio/holdings`: Adds a holding to the portfolio.
   - `PUT /api/portfolio/holdings/[id]`: Updates a holding.
   - `DELETE /api/portfolio/holdings/[id]`: Deletes a holding.

6. **AI Features**
   - `GET /api/ai/recommendations`: Gets AI fund recommendations for a goal.
   - `POST /api/ai/recommendations`: Generates new recommendations for a goal.
   - `POST /api/ai/analyze-portfolio`: Analyzes the user's portfolio.
   - `POST /api/ai/chat`: Chat interaction with the financial AI.
   - `GET /api/ai/insights`: Retrieves user AI insights.
   - `POST /api/ai/insights`: Generates a Financial Health Check insight.
   - `POST /api/ai/recommend`: Evaluates candidate funds for a goal (deprecated in favor of `generateGoalRecommendations`).
