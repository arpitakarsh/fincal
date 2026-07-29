# Architecture

## Current Architecture
FinCal is currently a stateless, client-heavy Single Page Application (SPA) built on Next.js (App Router). 

- **Frontend:** React handles all UI rendering, state management (via `FinCalApp.jsx`), and visualization.
- **Backend:** The backend is minimal, consisting only of Next.js Route Handlers (`src/app/api/`) used exclusively to proxy requests to third-party services (like Google Generative AI) to keep API keys secure.
- **Data Layer:** Non-existent. All data resides in volatile React state.

### Folder Responsibilities
- `src/app/`: Next.js routing, page layouts, and backend API proxy routes.
- `src/components/`: Pure, presentation-focused React components divided by domain (`ai`, `inputs`, `charts`, etc.).
- `src/engine/`: Pure JavaScript mathematical functions. **No React code is permitted here.**
- `src/lib/`: Shared utilities and constants.

### Dependency & Data Flow
1. **User Action:** User alters an input (e.g., changes years).
2. **State Update:** `FinCalApp.jsx` updates its local state.
3. **Calculation:** `useMemo` hooks trigger functions in `src/engine/` using the new state.
4. **Render:** The derived calculation results are passed down as props to child components (`HeadlineSIP`, `Charts`, etc.) to trigger a re-render.

---

## Future Architecture

As FinCal evolves into an AI-powered Recommendation Platform, the architecture will transition to a **Full-Stack Serverless Architecture**.

### Planned Additions

#### 1. Persistence Layer (Database)
- **Database:** PostgreSQL.
- **ORM:** Prisma.
- **Purpose:** Store user profiles, saved portfolios, and cached mutual fund historical data.

#### 2. Authentication Layer
- **Provider:** NextAuth.js or Clerk.
- **Purpose:** Secure endpoints and allow users to save their progress and return later.

#### 3. Planned Services & Engines (Backend)
The `src/engine/` folder will expand significantly and may eventually move to server-side execution for heavier tasks (like Monte Carlo simulations).
- **Profiling Engine:** Scores risk tolerance.
- **Allocation Engine:** Maps risk + horizon to asset categories.
- **Recommendation Engine:** Ranks funds based on live/cached data.
- **Probability Engine (Monte Carlo):** Simulates returns.

#### 4. Planned APIs
- `/api/auth/*`: Authentication webhooks/routes.
- `/api/users/profile`: GET/PUT risk profiles.
- `/api/portfolios`: CRUD operations for saved goals.
- `/api/funds/recommend`: Fetches recommended funds based on parameters.
- `/api/funds/sync`: Internal chron job endpoint to sync latest fund NAVs.

### Future Dependency Flow
1. **Client** authenticates via NextAuth.
2. **Client** fetches saved profile and goals via `/api/portfolios`.
3. **Next.js API** queries **PostgreSQL** via Prisma.
4. If recommending funds, **API** checks **Redis** cache. If miss, queries external AMFI/Morningstar API, updates DB/Cache, and returns to Client.
5. **Client** passes data to `src/engine/` for client-side projections and renders UI.

## Feature-First Architecture
We have migrated from a flat components structure to a scalable Feature-First Architecture. The new structure isolates logic by domain (`src/features/calculator`, `src/features/ai`, etc.) and reserves `src/shared` for global reusable elements.
