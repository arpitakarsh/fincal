# File Structure

## Core Directories

- **`docs/`**: Comprehensive project documentation.
- **`prisma/`**: Contains `schema.prisma` representing the entire data model.
- **`public/`**: Static assets (favicon, images).
- **`src/`**: The root of all application logic.

## Inside `src/`

- **`app/`**: Next.js App Router.
  - `page.tsx`: Welcome landing page.
  - `login/page.tsx`: Authentication form.
  - `register/page.tsx`: Registration form.
  - `dashboard/page.tsx`: Protected route placeholder.
  - `calculator/page.tsx`: Investment planner placeholder.
- **`components/ui/`**: Clean Tailwind primitive components.
- **`config/`**: Global configuration constants.
- **`database/`**: Prisma client instantiation.
- **`domains/` & `features/`**: Business logic grouping.
- **`engine/`**: Pure calculation functions for financial planning.
- **`infrastructure/`**: Redis clients, external SDKs.
- **`lib/`**: `auth.ts` and `auth-client.ts` configurations.
- **`pages/api/`**: Legacy Next.js route handlers strictly hosting `auth/[...all].ts`.
- **`repositories/`**: Database abstraction layer containing `UserRepository.ts`, `GoalRepository.ts`, `FundRepository.ts`, and `RecommendationRepository.ts`.
- **`services/`**: Orchestration logic including `GoalService.ts`, `PortfolioService.ts`, `RecommendationService.ts`, and `ai.service.ts`.
- **`shared/` & `types/`**: Interfaces and utilities.
