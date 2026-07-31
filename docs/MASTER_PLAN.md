# MASTER PLAN

## 1. Current Architecture
The repository relies on a unified, single-application Next.js structure housed entirely within `src/`. It strictly avoids monorepo paradigms, isolating frontend routing (App Router) from backend Clean Architecture layers (Repositories -> Services). 

## 2. Complete Folder Tree
```
/
├── docs/
├── prisma/
│   └── schema.prisma
├── public/
├── src/
│   ├── app/           (Next.js Route Handlers & Pages)
│   ├── components/    (Reusable Tailwind UI Primitives)
│   ├── config/        (App-wide constants)
│   ├── database/      (Prisma Client Instantiation)
│   ├── domains/       (Business Domain Logic)
│   ├── engine/        (Pure Math / Financial Calculators)
│   ├── features/      (Feature Modules)
│   ├── infrastructure/(External APIs & Redis)
│   ├── lib/           (Better Auth Configuration)
│   ├── pages/api/     (Legacy Auth API Routes)
│   ├── repositories/  (Prisma DB Access Layer)
│   ├── services/      (Business Orchestration)
│   ├── shared/        (Utilities)
│   └── types/         (TypeScript Interfaces)
```

## 3. Every Important File and Its Purpose
- `src/lib/auth.ts`: Global Better Auth configuration interfacing with PrismaAdapter.
- `src/middleware.ts`: Next.js Edge Middleware blocking unauthenticated traffic to `/dashboard`.
- `src/app/page.tsx`: Entry landing page.
- `prisma/schema.prisma`: The master frozen data model.

## 4. Backend Completion Checklist
- `[x]` Database client instantiation
- `[x]` Goal Service & Repository
- `[x]` Portfolio Service & Repository
- `[x]` Fund & Recommendation Services
- `[x]` Market Data Module (AMFI Importer, Provider, APIs)
- `[ ]` Investor Profile Repository & Service
- `[x]` REST API Route Handlers
- `[x]` API Integration Test Suite (Vitest)

## 5. Frontend Completion Checklist
- `[x]` Minimal Layout Scaffold
- `[x]` Authentication Pages (`/login`, `/register`)
- `[ ]` Dashboard Integration (`/dashboard`)
- `[ ]` Investor Profile Onboarding (`/onboarding`)
- `[ ]` Calculator Implementation (`/calculator`)

## 6. Database Completion Checklist
- `[x]` User / Session
- `[x]` InvestorProfile
- `[x]` MutualFund / AMC
- `[x]` Goal / Portfolio
- `[x]` RecommendationHistory
- `[ ]` Seed Scripts

## 7. Authentication Completion Checklist
- `[x]` Email & Password Support
- `[x]` Session Management
- `[x]` Protected Routes Middleware
- `[ ]` OAuth (Google/GitHub)

## 8. AI Completion Checklist
- `[x]` AI Service Setup
- `[x]` Prompt Engineering integration
- `[x]` Background processing (Redis Queue)

## 9. Every Implemented Feature
- **Authentication**: Fully active.
- **Database Architecture**: Completely resolved and mapped.
- **AI Module**: Fully active.
   - Implemented `/api/ai/chat`, `/api/ai/analyze-portfolio`, `/api/ai/recommend`.
   - Connected AI explicitly to user data via Prisma stringification.
   - Implemented robust Redis caching.
- **API Testing**: 100% of implemented APIs are covered by integration tests using Vitest with Prisma & Redis mocks.

## 10. Every Partially Implemented Feature
- **Financial Engines**: Logic exists in `src/engine`, but APIs are missing.
- **Dashboard**: UI is just a placeholder, no data fetching.

## 11. Every Missing Feature
- **Investor Profile**: Missing onboarding UX and API endpoints.
- **Market Data Polling**: No cron jobs fetch active NAVs yet.

## 12. Dependency Graph
- Next.js (App Router) -> Tailwind CSS (UI)
- Better Auth -> Prisma -> PostgreSQL (Identity)

## 13. Recommended Implementation Order
1. **Portfolio Management Module** (`PortfolioService.ts`) - Complete
   - Manage holdings (add/edit/delete `UserHolding`).
   - Dynamic asset & category allocation breakdowns.
   - Redis caching for complex calculations.
2. **Dashboard UI** (`/dashboard`) - Complete
   - Show authenticated user.
   - Display summaries for Investor Profile, Goals, Portfolio, and Recommendations.
   - Clean, minimal Tailwind architecture.
3. Integrate Financial Engines into the `calculator` route.

## 14. Technical Debt
- All backend technical debt eliminated during final audit.
- Only remaining debt concerns missing React frontend implementations.

## 15. Current Known Bugs
- None. (Authentication 404 bugs resolved).

## 16. Current TODO List
- Monitor AMFI daily cron job reliability.
- Monitor Redis cache hit rates for recommendations.
- [x] Integrate AI for personalized fund explanations.
- [x] Connect frontend Recommendation UI.
- [x] Perform end-to-end audit of Recommendation System.
- [x] Redesign Goal Module with extensive financial parameters.
- [x] Fix PrismaClientValidationError caused by uncoerced date strings in Goal creation.
- [x] Complete Backend -> Frontend Integration mapping and implement missing interfaces.
- [x] Refactor Recommendation pipeline to Goal-Centric, AI-Driven architecture.
  - RecommendationEngine now prepares deterministic context (required CAGR, filtered candidates).
  - AI (Gemini) now performs all ranking, scoring, and explanation.
  - Goal Details page now owns the Generate Recommendation button.
  - Dashboard links to Goal Details page instead of inline generation.
  - Goal creation form now accepts goal-specific Risk Preference field.
  - riskPreference column added to Goal table and Prisma schema.

## 17. Project Completion Percentage
**50%** (Backend infrastructure is 100% complete, hardened, and verified. Awaiting Frontend).
