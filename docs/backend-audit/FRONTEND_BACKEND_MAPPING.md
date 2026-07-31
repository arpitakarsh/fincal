# Frontend to Backend Mapping

The application is built using Next.js, and the backend routes map directly to frontend features:

## Dashboard (`/api/dashboard`)
- Powers the main user dashboard.
- Aggregates user details, profile completion status, goals (with top recommendations and AI explanations), and portfolio analytics in a single call.

## Onboarding (`/api/onboarding`)
- Maps to the initial user setup flow.
- Collects risk appetite, current capital, income, and creates the first goal if provided.

## Funds Explorer / Search (`/api/funds`)
- Used by search bars or fund explorer pages to query live mutual funds.
- Provides pagination and filtering.

## Goal Management (`/api/goals`)
- Used by goal creation modals and goal detail pages to perform CRUD operations on user goals.

## Portfolio & Holdings (`/api/portfolio`, `/api/portfolio/holdings`)
- Maps to the user's portfolio dashboard.
- Allows users to add, edit, or remove specific mutual fund holdings.
- `/api/portfolio/analytics` powers charts (Asset allocation, Category allocation, AMC allocation).

## AI Features (`/api/ai/*`)
- **Chat**: Powers a floating or dedicated AI financial assistant interface.
- **Insights**: Powers a "Financial Health Check" or "Health Score" section on the dashboard.
- **Recommendations**: Integrated into goal detail pages to suggest funds specifically tailored for that goal.
