# FinCal — AI-Powered Personal Finance Platform

FinCal is an intelligent, full-stack personal finance platform designed for Indian investors. It combines portfolio tracking, goal-based financial planning, and AI-powered mutual fund recommendations into a single, unified dashboard.

Built on the Next.js App Router (v16), FinCal provides real-time NAV tracking from AMFI, interactive charts, and AI-driven actionable insights powered by Google Gemini to help you manage and grow your wealth effectively.

![Architecture](https://img.shields.io/badge/Architecture-Next.js%2016-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Cache-Redis-DC382D?logo=redis)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure](#2-folder-structure)
3. [Architecture](#3-architecture)
4. [Pipeline / Data Flow](#4-pipeline--data-flow)
5. [Tech Stack / Tools Used](#5-tech-stack--tools-used)
6. [File-by-File Breakdown](#6-file-by-file-breakdown)
7. [Setup & Installation](#7-setup--installation)
8. [How to Run](#8-how-to-run)
9. [Configuration](#9-configuration)
10. [Dependencies Between Modules](#10-dependencies-between-modules)
11. [Known Limitations / TODOs](#11-known-limitations--todos)
12. [Contribution Guide](#12-contribution-guide)

---

## 1. Project Overview

### What It Does

FinCal is a personal finance SaaS platform targeting **Indian retail investors**. It solves the problem of fragmented financial tooling by offering:

- **Goal-Based Planning**: Create and track financial goals (retirement, house, education, wedding, etc.). The platform calculates the required SIP / lumpsum to reach each goal and shows progress over time.
- **Portfolio Tracking**: Track mutual fund holdings with live NAVs fetched daily from AMFI and mfapi.in. Shows real-time P&L, CAGR, allocation breakdown (by category, AMC, asset class).
- **AI Fund Recommendations**: Per goal, the platform calls Google Gemini to recommend 4–6 real Indian mutual fund schemes (Direct Growth only), validated against the live AMFI universe. Recommendations include score, reason, and suggested allocation %.
- **Fund Explorer**: Search any fund from the full AMFI universe (~15,000 schemes), view live NAV, historical returns (1M, 3M, 6M, 1Y, 3Y, 5Y, since inception), and risk metrics (Sharpe ratio, annualized volatility, max drawdown).
- **SIP/Lumpsum Calculator**: Goal-aware FV calculator that auto-fetches historical returns for a given fund and projects corpus growth with and without step-up.
- **AI Financial Assistant**: A conversational interface powered by Gemini for open-ended financial Q&A.
- **Onboarding**: Captures investor profile (age, risk appetite, income, liquidity preference, existing capital) to personalize all recommendations.

### Target Users

Indian retail investors who want a data-driven, AI-assisted approach to mutual fund investing — without relying on a human advisor.

---

## 2. Folder Structure

```
fincal/                          # Main project root (Next.js app)
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI pipeline
├── docs/                        # Developer/architecture documentation (~54 files)
├── prisma/
│   ├── schema.prisma            # PostgreSQL schema (all models + enums)
│   └── migrations/              # Prisma migration history
│       ├── 20260729121822_init/
│       └── 20260808000000_add_latest_nav/
├── public/                      # Static assets
├── src/
│   ├── __tests__/               # Vitest test suite
│   │   ├── setup.ts             # Global test setup/mocks
│   │   ├── NavService.test.ts   # NavService unit tests (largest test)
│   │   └── api/                 # API route integration tests (10 files)
│   ├── app/
│   │   ├── layout.tsx           # Root HTML layout
│   │   ├── page.tsx             # Landing/marketing page (public)
│   │   ├── globals.css          # Global CSS
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page
│   │   ├── onboarding/          # Investor profile onboarding
│   │   ├── (dashboard)/         # Protected route group
│   │   │   ├── layout.tsx       # Sidebar nav + session guard
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── portfolio/       # Holdings & allocation
│   │   │   ├── goals/           # Goals + [id] detail
│   │   │   ├── funds/           # Fund explorer + [id]
│   │   │   ├── calculator/      # SIP/Lumpsum calculator
│   │   │   ├── assistant/       # AI chat (stub)
│   │   │   └── settings/        # User settings
│   │   └── api/                 # Next.js API routes
│   │       ├── auth/            # Better Auth handlers
│   │       ├── dashboard/
│   │       ├── onboarding/
│   │       ├── portfolio/        # + holdings/ + analytics/
│   │       ├── goals/            # + [id]/ + recommendations/
│   │       ├── funds/            # + [schemeCode]/
│   │       ├── recommendations/
│   │       ├── sip/
│   │       ├── nav/ingest/       # Daily AMFI cron endpoint
│   │       ├── profile/
│   │       ├── health/
│   │       └── ai/
│   ├── backend/
│   │   ├── infrastructure/
│   │   │   ├── database/client.ts         # Prisma singleton
│   │   │   └── redis/
│   │   │       ├── client.ts              # ioredis singleton
│   │   │       ├── cache/CacheManager.ts  # get/set/delete
│   │   │       ├── cache/CacheKeys.ts     # Key factory
│   │   │       └── rate-limit/
│   │   ├── repositories/
│   │   │   ├── AIInsightRepository.ts
│   │   │   ├── GoalRepository.ts
│   │   │   ├── InvestorProfileRepository.ts
│   │   │   ├── LatestNavRepository.ts
│   │   │   ├── PortfolioRepository.ts
│   │   │   ├── UserHoldingRepository.ts
│   │   │   └── UserRepository.ts
│   │   └── services/
│   │       ├── ai.service.ts
│   │       ├── AIRecommendationService.ts
│   │       ├── FundAnalyticsService.ts
│   │       ├── GoalService.ts
│   │       ├── NavService.ts
│   │       └── PortfolioService.ts
│   ├── components/
│   │   ├── charts/              # 7 Recharts components
│   │   ├── dashboard/           # 4 dashboard widgets
│   │   ├── layout/DashboardShell.tsx
│   │   ├── portfolio/HoldingModal.tsx
│   │   └── ui/                  # 12 generic UI primitives
│   ├── config/
│   │   ├── env.ts               # Zod env validation
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useApi.ts
│   │   └── useDashboard.ts
│   ├── lib/
│   │   ├── api/                 # Response helpers
│   │   ├── redis/               # Redis utility aliases
│   │   ├── apiWrapper.ts        # HOF wrappers
│   │   ├── auth-client.ts
│   │   ├── auth.ts
│   │   ├── constants.ts
│   │   ├── format.ts
│   │   ├── logger.ts
│   │   ├── rateLimit.ts
│   │   └── utils.ts
│   ├── middleware.ts             # Edge middleware (auth guard)
│   ├── shared/dtos/             # Zod input DTOs
│   ├── types/index.ts           # ApiResult<T>
│   └── validations/             # Mirror of shared/dtos
├── .dockerignore
├── .env.example
├── .gitignore
├── .prettierrc
├── ARCHITECTURE.md
├── Dockerfile
├── PROJECT_DOCUMENTATION.md
├── docker-compose.yml
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── vercel.json
└── vitest.config.ts
```

> **Note**: The outer `fincal_old/` directory is a wrapper. All meaningful code lives in `fincal_old/fincal/`.

---

## 3. Architecture

### Overview

FinCal follows a **monolithic full-stack architecture** using Next.js App Router, co-locating frontend pages and backend API routes in a single deployable unit.

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                        │
│  React 19 pages + components  │  Better Auth client SDK     │
│  useApi / apiFetch hooks       │  Recharts, Radix UI         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP (fetch, credentials: include)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS SERVER (Edge + Node.js)                 │
│                                                              │
│  middleware.ts (Edge)                                        │
│  ├─ Check better-auth.session_token cookie                  │
│  ├─ Protected pages  → redirect /login                      │
│  └─ Protected APIs   → 401 JSON                             │
│                                                              │
│  API Routes (Node.js runtime)                                │
│  ├─ withApiAuthAndError() HOF                               │
│  │     auth + rate-limit + Zod + generic error handling     │
│  └─ Delegate to backend/services/*                          │
└──────────┬─────────────────────────┬────────────────────────┘
           │                         │
           ▼                         ▼
┌──────────────────┐    ┌────────────────────────────────────┐
│  BACKEND LAYER   │    │         EXTERNAL SERVICES           │
│                  │    │                                      │
│  NavService      │───▶│  mfapi.in  (latest + historical NAV)│
│  PortfolioSvc    │    │  AMFI NAVAll.txt  (fund universe)   │
│  GoalService     │    │  Google Gemini 2.5 Flash  (AI)      │
│  FundAnalytics   │    └────────────────────────────────────┘
│  AIRecommendSvc  │
│  Repositories    │
│  └─ Prisma ORM   │
└──────────┬───────┘
           │
    ┌──────┴───────────────────────┐
    │                              │
    ▼                              ▼
┌──────────────┐        ┌────────────────────┐
│  PostgreSQL  │        │       Redis         │
│              │        │                    │
│  Users       │        │  NAV history  24h  │
│  Sessions    │        │  AMFI universe 12h │
│  Portfolio   │        │  Portfolio    5min │
│  Holdings    │        │  Fund details  1h  │
│  Goals       │        │  AI insights  24h  │
│  LatestNAV   │        │  Rate limiting     │
│  AIRecomms   │        │  (in-mem fallback) │
└──────────────┘        └────────────────────┘
```

### Key Architectural Patterns

| Pattern | Where Used |
|---|---|
| **Repository Pattern** | `src/backend/repositories/` — thin Prisma wrappers, zero business logic |
| **Service Layer** | `src/backend/services/` — all business logic, orchestrates repos + caches |
| **HOF API Wrapper** | `withApiAuthAndError` — cross-cutting concerns: auth, rate limit, error handling |
| **Cache-Aside** | Redis for hot data; always read DB on cache miss |
| **Graceful Degradation** | Redis down → in-memory fallback; mfapi down → AMFI fallback; AMFI down → navUnavailable |
| **In-Flight Deduplication** | NavService prevents cache-miss stampedes using in-process Promise Map |
| **Singleton Instances** | Prisma and Redis clients use globalThis singletons safe for Next.js hot reload |

---

## 4. Pipeline / Data Flow

### 4.1 NAV Data Pipeline

```
Daily cron (14:30 UTC / ~20:00 IST)
        │
        ▼
Vercel Cron → POST /api/nav/ingest
        ├─ Bearer token auth (CRON_SECRET)
        ├─ Fetch AMFI NAVAll.txt (~3MB, ~15k schemes, 30s timeout)
        ├─ NavService.parseAmfiText()
        │   extracts: schemeCode, schemeName, NAV, date, AMC, category
        │   skips: malformed lines, NAV <= 0, missing codes
        └─ LatestNavRepository.upsertMany() in batches of 500
               └─ PostgreSQL LatestNAV table (one row per scheme, overwritten)

User request needing a live NAV
        │
        ▼
NavService.getLatestNav(schemeCode)
        ├─ 1st: LatestNAV PostgreSQL table (primary)
        ├─ 2nd: mfapi.in /latest (fallback, 5s timeout) → persist to DB
        └─ 3rd: AMFI NAVAll.txt (last resort, 15s timeout) → persist to DB
        └─ All failed → { navUnavailable: true, nav: 0 }
```

### 4.2 AI Recommendation Pipeline

```
User requests AI recommendations for a goal
        │
        ▼
POST /api/goals/[id]/recommendations/generate
        ├─ Rate limit: 5/hour per user (Redis INCR)
        ├─ Load goal details + current holdings from PostgreSQL
        ├─ Build structured Gemini prompt
        │
        ▼
callAI(prompt, 'json') → Google Gemini 2.5 Flash
        │
        ▼
Parse JSON → [ { schemeCode, fundName, category, score, reason, allocationPct } ]
        ├─ Validate schemeCode via NavService.getLatestNav()
        │   └─ Invalid → search AMFI universe by fund name
        ├─ Filter: IDCW / Dividend / Regular → skip
        ├─ Normalize scores 0–100
        └─ prisma.aIRecommendation.create() for each valid result
```

### 4.3 Authenticated Request Flow

```
Browser → fetch('/api/portfolio', { credentials: 'include' })
        │
        ▼
Next.js middleware.ts (Edge)
        └─ Check better-auth.session_token cookie
               ├─ Missing → 401 JSON (API) or redirect /login (page)
               └─ Present → NextResponse.next()
        │
        ▼
withApiAuthAndError()
        ├─ auth.api.getSession() → full session validation
        ├─ RateLimiter.check(): 200 req / 15 min per user
        ├─ Execute handler(req, { session })
        └─ Catch ZodError → 400 | any Error → 500
```

### 4.4 CI/CD Pipeline

```
git push to main/master
        │
        ▼
GitHub Actions (.github/workflows/ci.yml)
        ├─ npm ci
        ├─ npx tsc --noEmit
        ├─ npm run lint
        ├─ npx prisma generate
        └─ npm run build

Deployment target: Not specified in codebase.
Vercel-ready: vercel.json + Next.js standalone output configured.
```

---

## 5. Tech Stack / Tools Used

### Languages

| Language | Version | Usage |
|---|---|---|
| TypeScript | ^6.0.3 | Entire codebase, strict mode |
| CSS | — | Via Tailwind CSS |

### Core Framework & UI

| Library | Version | Purpose |
|---|---|---|
| Next.js | ^16.1.6 | Full-stack framework (App Router, API routes, Edge middleware) |
| React | ^19.0.0 | UI components |
| React DOM | ^19.0.0 | DOM rendering |
| Tailwind CSS | ^3.4.1 | Utility-first CSS |
| Recharts | ^3.8.0 | Charts (area, donut, bar) |
| Lucide React | ^0.482.0 | Icons |
| @radix-ui/react-accordion | ^1.2.12 | Accordion |
| @radix-ui/react-dialog | ^1.1.15 | Modals |
| @radix-ui/react-slider | ^1.3.6 | Range sliders |
| @radix-ui/react-tooltip | ^1.2.8 | Tooltips |
| react-confetti | ^6.4.0 | Confetti animation |
| react-countup | ^6.5.3 | Animated number counting |
| html2canvas | ^1.4.1 | Screenshot for PDF |
| jsPDF | ^4.2.0 | PDF generation |
| zod | ^4.4.3 | Schema validation |
| uuid | ^14.0.1 | UUID generation |
| dotenv | ^17.3.1 | Env var loading |
| server-only | ^0.0.1 | Server-module guard |

### Database & Cache

| Tool | Version | Purpose |
|---|---|---|
| PostgreSQL | 15 (Docker) | Primary database |
| Prisma ORM | ^5.22.0 | Schema, migrations, client |
| @prisma/client | ^5.22.0 | Generated DB client |
| Redis | 7 (Docker) | Caching + rate limiting |
| ioredis | ^5.11.1 | Redis Node.js client |

### Authentication

| Tool | Version | Purpose |
|---|---|---|
| better-auth | ^1.6.25 | Email/password auth, session management |

### AI & External Data

| Service | Version | Purpose |
|---|---|---|
| @google/generative-ai | ^0.24.1 | Gemini 2.5 Flash — AI features |
| mfapi.in | External API | Latest + historical NAV per scheme |
| AMFI NAVAll.txt | External file | Full fund universe (~15k schemes) |

### Dev & Testing

| Tool | Version | Purpose |
|---|---|---|
| Vitest | ^4.1.10 | Test runner |
| @vitest/coverage-v8 | ^4.1.10 | Coverage |
| vitest-mock-extended | ^5.1.0 | Type-safe mocks |
| node-mocks-http | ^1.18.1 | HTTP mocks for tests |
| ESLint | ^9 | Linting |
| Prettier | ^3.9.6 | Formatting |

### Deployment

| Tool | Purpose |
|---|---|
| Docker (node:18-alpine) | Multi-stage production image |
| Docker Compose | Local stack: app + PostgreSQL + Redis |
| Vercel | Deployment + cron job execution |
| GitHub Actions | CI pipeline |

---

## 6. File-by-File Breakdown

### Config Files

#### `package.json`
Project manifest. Scripts: `dev`, `build` (includes `prisma generate`), `start`, `lint`, `prisma:generate`, `prisma:push`, `prisma:migrate`. No `test` script — use `npx vitest`.

#### `next.config.mjs`
Sets security response headers globally: HSTS, X-Frame-Options (SAMEORIGIN), X-XSS-Protection, X-Content-Type-Options, Referrer-Policy.

#### `tsconfig.json`
Strict TypeScript. Path alias: `@/*` → `./src/*`.

#### `vitest.config.ts`
Node environment, setup file at `src/__tests__/setup.ts`. Coverage targets `src/app/api/**/*.ts`.

#### `vercel.json`
Vercel cron: `POST /api/nav/ingest` at `30 14 * * *` UTC (14:30 UTC = ~20:00 IST, after AMFI NAV publication).

#### `Dockerfile`
Three-stage build (deps → builder → runner) on node:18-alpine. Uses Next.js standalone output. Exposes port 3000.

#### `docker-compose.yml`
Local stack: `web` (Next.js), `db` (postgres:15), `redis` (redis:7). Named volumes for persistence.

---

### Database Schema (`prisma/schema.prisma`)

| Model | Purpose |
|---|---|
| `User` | Core identity. Parent of all user-owned data. |
| `Session` | Better Auth session tokens (7-day expiry). |
| `Account` | Provider accounts. `password` field for email/password auth. |
| `Verification` | Email verification tokens. |
| `UserPreferences` | Theme, currency, email alert toggle. |
| `InvestorProfile` | Onboarding: age, income, capital, risk appetite, investment style. |
| `Portfolio` | Aggregate totals (invested, current value, monthly SIP). One per user. |
| `UserHolding` | Fund position: schemeCode, units, averageNav, investedValue, currentValue. |
| `PortfolioSnapshot` | Historical portfolio value snapshots. |
| `Goal` | Financial goal: type, SIP/lumpsum, horizon, risk appetite. |
| `GoalProgress` | Historical goal progress snapshots. |
| `AIRecommendation` | Gemini-generated fund rec: schemeCode, score, reason, allocation %, addedToPortfolio. |
| `AIInsightHistory` | Cached AI insight JSON per topic per user. |
| `LatestNAV` | One row per AMFI scheme (PK = schemeCode). Updated daily by ingest job. |

**Enums**: `InvestmentType` (lumpsum, sip) · `GoalType` (wealth_generation, education, retirement, house, other) · `RiskAppetiteGoal` (low, moderate, high)

---

### Middleware (`src/middleware.ts`)

Next.js Edge middleware. Checks `better-auth.session_token` cookie.
- Protected API routes → 401 JSON if missing.
- Protected pages → redirect `/login?from=<path>`.
- Auth pages + valid session → redirect `/dashboard`.

Only checks cookie presence. Cryptographic validation happens in `withApiAuthAndError`.

---

### Backend Services

#### `NavService.ts` — 569 lines
Central NAV engine. All fund price lookups go through here.

- `getLatestNav(schemeCode)` — Three-tier: PostgreSQL → mfapi.in (5s) → AMFI (15s). Never throws. Returns `{ navUnavailable: true }` on failure. Concurrent requests for same code share one Promise.
- `getHistoricalNav(schemeCode)` — mfapi.in full history. Redis 24h cache.
- `getFundUniverse()` — Full AMFI fund list. Redis 12h cache.
- `searchFunds(query, limit)` — Case-insensitive, prioritizes Direct Growth.
- `batchGetLatestNavs(codes, concurrency=5)` — Parallel batch with deduplication.
- `calculateCagr(history, years)` — Strict CAGR; returns null if insufficient history.
- `parseAmfiText(text)` — AMFI NAVAll.txt parser; handles CRLF/LF; skips malformed lines.

**Dependencies**: CacheManager, LatestNavRepository, logger.
**Used by**: PortfolioService, AIRecommendationService, FundAnalyticsService, nav/ingest route.

#### `PortfolioService.ts` — 358 lines

- `getPortfolio(userId)` — Fetches holdings, batch-resolves NAVs, computes P&L + asset/category/AMC allocations. Writes updated currentValue to DB (fire-and-forget). Redis 5min cache.
- `addHolding(userId, input)` — Validates NAV, resolves units, creates UserHolding, marks recommendation as added.
- `updateHolding` / `deleteHolding` / `deletePortfolio` — CRUD + cache invalidation.
- `getAnalytics(userId)` — Legacy dashboard-compatible wrapper.

**Dependencies**: NavService, CacheManager, CacheKeys, prisma, logger.

#### `AIRecommendationService.ts` — 169 lines

- `generateRecommendations(userId, goalId)` — Rate-limited (5/hour). Builds Gemini prompt, validates scheme codes, filters non-Direct/non-Growth, normalizes scores, saves to DB.
- `getGoalRecommendations(goalId, userId)` — DB fetch, sorted by score desc.

**Dependencies**: callAI, NavService, PortfolioService, CacheManager, prisma, logger.

#### `FundAnalyticsService.ts` — 332 lines

- `getFundDetails(schemeCode)` — Computes 1M/3M/6M/1Y/3Y/5Y/inception returns + Sharpe ratio + annualized volatility + max drawdown. Needs ≥30 data points for returns, ≥252 for risk. Redis 60min cache.
- `getFundInsights(schemeCode, goalId, userId)` — Goal-aware AI suitability (pros/cons/score/summary). Rate-limited (10/hour). Redis 24h cache.
- `calculateProjection(input, userId)` — SIP/lumpsum FV calculator using historical returns. Rate-limited (30/hour).
- Risk-free rate: 6.5% (hardcoded, India-appropriate for Sharpe).

#### `GoalService.ts` — 41 lines
Thin CRUD + cache invalidation. Auto-generates goal names from type.

#### `ai.service.ts` — 50 lines
`callAI(prompt, mode)` — Gemini 2.5 Flash wrapper. Handles quota (429), auth (403), network failures.

---

### Infrastructure

#### `database/client.ts`
Prisma singleton via globalThis. Safe for Next.js hot reload.

#### `redis/client.ts`
ioredis singleton. Fail-fast config: 3 retries max, no offline queue, maxRetriesPerRequest=1.

#### `redis/cache/CacheManager.ts`
Static get/set/delete. All Redis errors caught and logged — never thrown. Enables DB-fallback patterns.

#### `redis/cache/CacheKeys.ts`
Factory functions with domain namespacing: `ai:`, `fund:`, `analytics:`, `user:`, `ratelimit:`, `market:`.

---

### Repositories

All are thin Prisma wrappers with no business logic.

| File | Key Methods |
|---|---|
| `LatestNavRepository.ts` | `findBySchemeCode`, `upsert`, `upsertMany` (500-row batches in Prisma transactions) |
| `GoalRepository.ts` | `findAllByUserId`, `findByIdAndUserId`, `createGoal`, `updateGoal`, `deleteGoal` |
| `PortfolioRepository.ts` | Portfolio CRUD |
| `UserHoldingRepository.ts` | Holding CRUD |
| `InvestorProfileRepository.ts` | Profile upsert/find |
| `AIInsightRepository.ts` | AI insight storage |
| `UserRepository.ts` | User lookup |

---

### API Routes (`src/app/api/`)

All wrapped in `withApiAuthAndError` except `/api/auth/*` and `/api/health`.

| Route | Methods | Purpose |
|---|---|---|
| `/api/auth/[...all]` | ALL | Better Auth (sign-in, sign-up, session) |
| `/api/health` | GET | Health check (public) |
| `/api/dashboard` | GET | Portfolio summary + goals |
| `/api/onboarding` | POST | Save investor profile |
| `/api/profile` | GET, PATCH | User profile & preferences |
| `/api/portfolio` | GET, DELETE | Full portfolio / delete portfolio |
| `/api/portfolio/holdings` | GET, POST | List / add holding |
| `/api/portfolio/holdings/[id]` | PATCH, DELETE | Update / delete holding |
| `/api/portfolio/analytics` | GET | Portfolio analytics |
| `/api/goals` | GET, POST | List / create goal |
| `/api/goals/[id]` | GET, PATCH, DELETE | Single goal CRUD |
| `/api/goals/[id]/recommendations` | GET, POST | Fetch / generate AI recs |
| `/api/funds` | GET | Search AMFI universe |
| `/api/funds/[schemeCode]` | GET | Fund details + metrics |
| `/api/funds/[schemeCode]/insights` | GET | AI suitability insights |
| `/api/recommendations` | GET | All user recommendations |
| `/api/recommendations/[id]` | PATCH, DELETE | Update / delete recommendation |
| `/api/sip/calculator` | POST | SIP/Lumpsum FV projection |
| `/api/nav/ingest` | POST | Daily AMFI NAV ingest (cron) |
| `/api/ai` | POST | AI assistant chat |

---

### Frontend Pages

#### `page.tsx` — Landing page
Public. Hero section, 3 feature cards (AI, goal tracking, security), login/register CTAs.

#### `(dashboard)/layout.tsx`
Responsive sidebar: 256px fixed (desktop), slide-in drawer (mobile). Session from `authClient.useSession()`. Handles logout.

#### `(dashboard)/dashboard/page.tsx` — ~15KB
Summary cards (net worth, invested, P&L), allocation donut, goals preview list.

#### `(dashboard)/portfolio/page.tsx`
Holdings table with live P&L per holding, allocation charts. Add/edit/delete via HoldingModal.

#### `(dashboard)/goals/page.tsx` — ~22KB, largest page
Goals list with progress bars, multi-step goal creation, AI recommendation panel with fund cards.

#### `(dashboard)/funds/page.tsx` — ~15KB
Live search across AMFI universe. Fund detail card: NAV, returns table, risk metrics.

#### `(dashboard)/calculator/page.tsx` — ~7KB
SIP/Lumpsum calculator: cost/inflation/return/step-up sliders, corpus area chart, sensitivity table, PDF export.

#### `(dashboard)/assistant/page.tsx` — 398 bytes
Stub page for AI chat assistant. Navigation entry exists but implementation is minimal.

---

### Shared Utilities (`src/lib/`)

#### `auth.ts`
Server-side Better Auth: Prisma adapter, email/password, 7-day sessions, secure cookies in prod. Exports `auth`, `registerSchema`, `loginSchema`, `checkAuthRateLimit`.

#### `auth-client.ts`
Browser Better Auth client. Exports `authClient` with `useSession`, `signOut`.

#### `apiWrapper.ts`
- `withApiAuthAndError(handler)` — validates session, 200 req/15min rate limit, ZodError → 400, Error → 500.
- `withApiError(handler)` — public routes, 10 req/15min per IP.

#### `rateLimit.ts`
`RateLimiter.check()` — Redis INCR-based with automatic in-memory Map fallback when Redis is down.

#### `constants.ts`
Color palette, goal types/labels, investment scenarios (Conservative 8%, Moderate 10%, Aggressive 12%), slider ranges, SEBI disclaimer text.

#### `logger.ts`
Structured console logger: info/warn/error/debug. Debug suppressed in production.

#### `format.ts`
Indian locale currency formatting (rupee symbol, lakh/crore abbreviations).

---

### Custom Hooks

#### `useApi.ts`
Generic fetch hook: `{ data, error, loading, refetch, setData }`. Also exports `apiFetch<T>()` imperative helper for mutations.

#### `useDashboard.ts`
Dashboard data hook wrapping `useApi` for `/api/dashboard`.

---

### Types (`src/types/index.ts`)
`ApiSuccess<T>`, `ApiFailure`, `ApiResult<T>` — universal `{ success, data?, error? }` envelope for all API responses.

---

### DTOs/Validations

| File | Key Schemas |
|---|---|
| `goal.dto.ts` | `CreateGoalSchema`, `UpdateGoalSchema` |
| `portfolio.dto.ts` | `AddHoldingSchema`, `UpdateHoldingSchema` |
| `calculator.dto.ts` | `CalculatorInputSchema` |

---

### Tests (`src/__tests__/`)

#### `setup.ts`
Global mocks: Prisma client (vitest-mock-extended), Redis client, Better Auth session, logger.

#### `NavService.test.ts` — 22KB
Covers: CAGR edge cases, AMFI parsing, three-tier fallback, in-flight deduplication, batch fetching, navUnavailable handling.

#### `api/*.test.ts` — 10 files
ai, dashboard, funds, goals, goals-by-id, market-data, nav-ingest, portfolio-holdings, portfolio, recommendations.

---

## 7. Setup & Installation

### Prerequisites

- **Node.js** v20+ (v22 recommended)
- **PostgreSQL** v15+
- **Redis** v7+ (optional — falls back to in-memory rate limiting)
- **Google Gemini API key** — from [Google AI Studio](https://aistudio.google.com/)

### Installation Steps

```bash
# 1. Navigate to the app directory
cd fincal_old/fincal

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your actual values

# 4. Set up database
npx prisma db push          # dev: push schema directly
# OR
npx prisma migrate deploy    # prod: run migrations

# 5. Generate Prisma client (also runs in npm run build)
npx prisma generate

# 6. (Optional) Seed NAV data — after starting the app:
curl -X POST http://localhost:3000/api/nav/ingest \
  -H "Authorization: Bearer dev-secret-key"
```

---

## 8. How to Run

### Development
```bash
cd fincal_old/fincal
npm run dev
# App at http://localhost:3000
```

### Production
```bash
npm run build
npm run start
```

### Docker
```bash
cd fincal_old/fincal
docker-compose up --build -d
```

### Tests
```bash
npx vitest             # run all tests
npx vitest --coverage  # with coverage report
npx vitest NavService  # specific file
npx vitest --watch     # watch mode
```

### Lint & Type Check
```bash
npm run lint
npx tsc --noEmit
```

### Database
```bash
npm run prisma:push      # push schema (dev)
npm run prisma:migrate   # create + apply migration
npm run prisma:generate  # regenerate client
npx prisma studio        # open GUI
```

---

## 9. Configuration

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | **Yes** | PostgreSQL URL: `postgresql://user:pass@host:5432/db?schema=public` |
| `BETTER_AUTH_SECRET` | **Yes** | Session signing secret. Minimum 32 characters. |
| `BETTER_AUTH_URL` | **Yes** | Full app URL (e.g., `http://localhost:3000`). |
| `GEMINI_API_KEY` | **Yes*** | Google Gemini key. *AI features fail without it. |
| `REDIS_URL` | No | Redis URL. In-memory fallback if unset/unavailable. |
| `CRON_SECRET` | No | Bearer token for `/api/nav/ingest`. Dev: `dev-secret-key` accepted. |
| `NEXT_TELEMETRY_DISABLED` | No | Set `1` to disable Next.js telemetry. |
| `NODE_ENV` | Auto | `development`/`production`/`test`. Controls cookie security, logging. |

### Cache TTL Reference

| Data | TTL |
|---|---|
| Historical NAV (per scheme) | 24 hours |
| AMFI fund universe | 12 hours |
| Fund details + metrics | 60 minutes |
| Portfolio (per user) | 5 minutes |
| User goals list | 5 minutes |
| AI fund insights (per scheme+goal) | 24 hours |
| Rate limit windows (API) | 15 minutes |
| Rate limit windows (AI features) | 60 minutes |

### Key Config Files

| File | Purpose |
|---|---|
| `next.config.mjs` | Security HTTP headers |
| `tsconfig.json` | TypeScript strict + `@/` alias |
| `vitest.config.ts` | Test environment and coverage scope |
| `vercel.json` | Cron job definition |
| `.prettierrc` | Code formatting rules |
| `eslint.config.mjs` | Linting rules |

---

## 10. Dependencies Between Modules

### Core Dependency Graph

```
prisma/client (singleton)
    └── used by: ALL repositories, auth.ts

redis/client (singleton)
    └── used by: CacheManager, rateLimit.ts

CacheManager
    └── depends on: redis/client, logger
    └── used by: NavService, PortfolioService, GoalService,
                 FundAnalyticsService, AIRecommendationService

NavService  ← MOST DEPENDED-UPON SERVICE
    └── depends on: CacheManager, LatestNavRepository, logger
    └── used by: PortfolioService, AIRecommendationService,
                 FundAnalyticsService, nav/ingest route

PortfolioService
    └── depends on: NavService, CacheManager, CacheKeys, prisma, logger
    └── used by: AIRecommendationService, dashboard route, portfolio routes

ai.service.ts
    └── depends on: @google/generative-ai, logger
    └── used by: AIRecommendationService, FundAnalyticsService

apiWrapper.ts
    └── depends on: auth.ts, logger, rateLimit.ts, zod
    └── used by: ALL authenticated API route handlers

src/types/index.ts (ApiResult<T>)
    └── used by: all API routes + all client-side fetch hooks
```

### Tightly Coupled Modules

| Module | Tight Coupling Reason |
|---|---|
| `NavService` | Central to all fund data. Any change ripples to Portfolio, Goals, Fund Explorer |
| `apiWrapper.ts` | Wraps every API route handler. Signature change = update all routes |
| `CacheKeys.ts` | Key rename silently breaks cache invalidation across all services |
| `prisma/schema.prisma` | Changes require migration + client regen + repository updates |
| `src/types/index.ts` | Universal API shape — changes break all client fetch calls |

---

## 11. Known Limitations / TODOs

### Incomplete Features

- **AI Assistant page** (`src/app/(dashboard)/assistant/page.tsx`) is a 398-byte stub — sidebar nav entry exists but page is not implemented.
- **Goal progress snapshots** (`GoalProgress` model) defined in schema but no automated snapshotting logic exists.
- **Portfolio snapshots** (`PortfolioSnapshot` model) defined but no ingest pipeline.
- **XIRR calculation** — mentioned in README feature list but not implemented in code.
- **`fincal_old/src/app/`** — outer wrapper directory contains no source files (artifact of restructuring).

### TODOs in Code

- `logger.ts`: `// In production, this could push to Datadog/Sentry` — not implemented.
- `LatestNavRepository.ts`: Notes distributed Redlock intentionally omitted (single-instance only).
- `AIRecommendationService.ts`: May save recommendations with empty `schemeCode` if AI + AMFI lookup both fail, silently disabling "Add to Portfolio".

### Technical Debt

- `any` types at AI response boundaries in `GoalService.createGoal` and recommendation parsing.
- `src/shared/dtos/` and `src/validations/` contain duplicate Zod schemas — one set should be removed.
- No `test` script in `package.json` — must use `npx vitest`.
- No frontend component tests — coverage is only for API routes and NavService.
- No database seed script despite README mentioning `npx prisma db seed`.
- Hardcoded 6.5% risk-free rate in `FundAnalyticsService` — should be configurable.

---

## 12. Contribution Guide

### Coding Conventions

- **TypeScript strict mode** — All new code must be fully typed. No implicit `any`.
- **Path aliases** — Always use `@/` (e.g., `@/lib/logger`). No relative `../../` imports.
- **File naming**: Services → `PascalCase.ts`, Repositories → `PascalCaseRepository.ts`, Components → `PascalCase.tsx`, Utilities → `camelCase.ts`, API routes → `route.ts`, Pages → `page.tsx`.
- **Error handling**: Services never throw on infrastructure failure (log + fallback). API routes throw freely — `withApiAuthAndError` handles them.
- **Cache invalidation**: Every write must call `CacheManager.delete()` for all affected keys.
- **API response format**: Always `{ success: boolean, data?: T, error?: string }`.
- **Rate limiting**: New AI or expensive features need per-user rate limits via `CacheManager`.
- **Server-only imports**: `src/backend/` must never be imported from client components.

### Adding a New Feature

1. Update `prisma/schema.prisma` if new models needed → `npm run prisma:migrate`.
2. Create/update `src/backend/repositories/YourRepository.ts`.
3. Implement `src/backend/services/YourService.ts`.
4. Add Zod schema to `src/shared/dtos/your.dto.ts`.
5. Add API route at `src/app/api/your/route.ts` with `withApiAuthAndError`.
6. Build page/component in `src/app/(dashboard)/` or `src/components/`.
7. Add `src/__tests__/api/your.test.ts`.

### Before Committing

```bash
npm run lint
npx tsc --noEmit
```

### CI Requirements (All PRs to main/master)

1. TypeScript type check must pass
2. ESLint must pass
3. Prisma client must generate
4. Full Next.js build must succeed

---

*Built for the modern Indian investor.*

> For deeper architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).
