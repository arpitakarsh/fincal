# FinCal — Engineering Manual

> **This document is a complete engineering reference for the FinCal codebase.**
> It is not a marketing README. It is designed so that after reading it you can
> explain the full architecture, every major data flow, every API, and the
> reasoning behind every architectural decision — without opening a single
> source file.

---

## Table of Contents

1. [What is FinCal?](#1-what-is-fincal)
2. [Core Features](#2-core-features)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Project Structure](#5-project-structure)
6. [Database Architecture](#6-database-architecture)
7. [Data Models — Detailed](#7-data-models--detailed)
8. [API Architecture](#8-api-architecture)
9. [Complete Data Flows](#9-complete-data-flows)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Fund Data Pipeline](#11-fund-data-pipeline)
12. [Portfolio Architecture](#12-portfolio-architecture)
13. [Goals Module](#13-goals-module)
14. [Financial Calculation Engines](#14-financial-calculation-engines)
15. [Fund Metrics](#15-fund-metrics)
16. [Recommendation Engine](#16-recommendation-engine)
17. [AI Architecture](#17-ai-architecture)
18. [Redis & Caching](#18-redis--caching)
19. [Frontend Architecture](#19-frontend-architecture)
20. [Error Handling](#20-error-handling)
21. [Security](#21-security)
22. [Environment Variables](#22-environment-variables)
23. [Local Development](#23-local-development)
24. [Database Development Workflow](#24-database-development-workflow)
25. [Testing](#25-testing)
26. [Build & Deployment](#26-build--deployment)
27. [Performance](#27-performance)
28. [Architectural Decisions](#28-architectural-decisions)
29. [Known Limitations](#29-known-limitations)
30. [Future Roadmap](#30-future-roadmap)
31. [Learning Guide](#31-learning-guide)
32. [Interview Questions](#32-interview-questions)
33. [Key Files Reference](#33-key-files-reference)
34. [Glossary](#34-glossary)

---

## 1. What is FinCal?

FinCal is a **full-stack Indian mutual fund planning and portfolio tracking
application** built with Next.js, PostgreSQL, Redis, and Google Gemini AI.

### The Problem It Solves

Retail mutual fund investors in India face three core problems:

1. **Fragmented data** — NAV information, fund categories, and AMC data are
   scattered across AMFI, individual AMC websites, and fund aggregators.
2. **No personalised guidance** — Generic fund lists do not account for a
   user's actual risk tolerance, time horizon, or existing portfolio.
3. **No single view** — Investors manage SIPs across multiple platforms and
   have no consolidated live P&L view.

FinCal solves all three by:
- Ingesting the entire AMFI fund universe (~15,000 schemes) daily into
  PostgreSQL so NAV is always available from the DB without calling external
  APIs on every user request.
- Running a deterministic eligibility filter (risk + time horizon) over the
  real AMFI universe, then sending only pre-filtered candidates to Gemini AI
  for ranking — ensuring AI never invents funds.
- Letting users track a real portfolio with per-holding P&L computed against
  live NAVs, cached in Redis for 5 minutes to prevent stampede reads.

### Who It Is For

- Individual retail mutual fund investors in India who want:
  - A unified live portfolio view
  - Goal-based fund recommendations
  - SIP/Lumpsum projection calculators
  - Fund deep-dive metrics (returns, volatility, Sharpe ratio, max drawdown)
  - AI-generated fund insights grounded in real financial data

---

## 2. Core Features

| Feature | Status |
|---------|--------|
| Email/password authentication (Better Auth) | ✅ Implemented |
| User onboarding with investor profile capture | ✅ Implemented |
| Portfolio management (add/update/delete holdings) | ✅ Implemented |
| Live NAV enrichment from AMFI / mfapi.in | ✅ Implemented |
| Per-holding P&L calculation | ✅ Implemented |
| Asset/category/AMC allocation breakdowns | ✅ Implemented |
| Fund Explorer with search and pagination | ✅ Implemented |
| Fund Details: returns, risk metrics, NAV chart | ✅ Implemented |
| AI fund insights (Gemini) | ✅ Implemented |
| Goal creation with full financial parameters | ✅ Implemented |
| AI-powered fund recommendations per goal | ✅ Implemented |
| SIP / Lumpsum projection calculator | ✅ Implemented |
| AMFI NAV daily ingest (Vercel Cron) | ✅ Implemented |
| Redis caching throughout | ✅ Implemented |
| API rate limiting (Redis + in-memory fallback) | ✅ Implemented |
| AI rate limiting (per-user, per feature) | ✅ Implemented |
| Health check endpoint | ✅ Implemented |
| Settings / user preferences | ✅ Implemented (partial UI) |
| AI Assistant chat page | ⚠️ Placeholder — not implemented |
| OAuth (Google/GitHub) | ❌ Planned |
| Portfolio snapshots / historical tracking | ⚠️ Schema exists, not populated |
| Goal progress tracking | ⚠️ Schema exists, not automated |
| Password reset | ❌ Not implemented |
| XIRR calculation engine | ❌ Not implemented (planned) |
| Monte Carlo simulation | ❌ Planned |

---

## 3. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | ^16.1.6 |
| Runtime | React | ^19.0.0 |
| Language | TypeScript | ^6.0.3 |
| Database | PostgreSQL | (Neon serverless in prod) |
| ORM | Prisma | ^5.22.0 |
| Cache / Rate Limit | Redis via ioredis | ^5.11.1 |
| Authentication | Better Auth | ^1.6.25 |
| AI | Google Gemini 2.5 Flash | via @google/generative-ai ^0.24.1 |
| Validation | Zod | ^4.4.3 |
| Charts | Recharts | ^3.8.0 |
| Icons | Lucide React | ^0.482.0 |
| CSS | Tailwind CSS | ^3.4.1 |
| UI Primitives | Radix UI (Accordion, Dialog, Slider, Tooltip) | various |
| Testing | Vitest | ^4.1.10 |
| PDF Export | jsPDF + html2canvas | ^4.2.0, ^1.4.1 |
| Deployment | Vercel (with Cron) | — |
| Linting | ESLint + Prettier | — |

---

## 4. System Architecture

### High-Level Architecture

```mermaid
graph TD
    User["👤 User (Browser)"]

    subgraph Frontend["Frontend — Next.js App Router"]
        Pages["Pages / Route Segments<br/>/login, /dashboard, /portfolio<br/>/funds, /goals, /calculator"]
        Layout["Dashboard Layout<br/>(Client Component)"]
        ClientComp["Client Components<br/>('use client')"]
    end

    subgraph Backend["Backend — Next.js API Routes"]
        APIRoutes["API Routes<br/>/api/..."]
        Middleware["Middleware<br/>(Session + Route Guard)"]
        ApiWrapper["withApiAuthAndError()<br/>(Auth + Rate Limit + Error)"]
    end

    subgraph Services["Services Layer"]
        NavSvc["NavService<br/>(NAV fetch, parse, CAGR)"]
        PortfolioSvc["PortfolioService<br/>(Holdings, P&L)"]
        FundAnalyticsSvc["FundAnalyticsService<br/>(Details, Returns, Risk, Calculator)"]
        GoalSvc["GoalService<br/>(CRUD)"]
        AIRecSvc["AIRecommendationService<br/>(Filter + Rank + Validate)"]
        AISvc["ai.service.ts<br/>(Gemini wrapper)"]
    end

    subgraph Repositories["Repositories Layer"]
        LatestNavRepo["LatestNavRepository"]
        PortfolioRepo["PortfolioRepository (unused)"]
        GoalRepo["GoalRepository"]
        InvestorProfileRepo["InvestorProfileRepository"]
        AIInsightRepo["AIInsightRepository"]
    end

    subgraph Infrastructure["Infrastructure"]
        Prisma["Prisma ORM"]
        PG["PostgreSQL"]
        Redis["Redis (ioredis)"]
        CacheMgr["CacheManager<br/>(get/set/delete)"]
        RateLimiter["RateLimiter<br/>(Redis Sorted Sets)"]
    end

    subgraph External["External APIs"]
        AMFI["AMFI NAVAll.txt<br/>(~15k schemes daily)"]
        MfAPI["mfapi.in<br/>(historical NAV)"]
        Gemini["Google Gemini 2.5 Flash"]
    end

    User -->|HTTP| Middleware
    Middleware -->|passes through| Frontend
    Middleware -->|guards| APIRoutes
    Frontend -->|fetch()| APIRoutes
    APIRoutes --> ApiWrapper
    ApiWrapper --> Services
    Services --> Repositories
    Services --> CacheMgr
    Services --> External
    Repositories --> Prisma
    Prisma --> PG
    CacheMgr --> Redis
    ApiWrapper --> RateLimiter
    RateLimiter --> Redis
```

### Key Architectural Principles

1. **API routes are thin.** Each API route file does almost nothing except
   parse + validate the request, call a service, and return the response.
   Zero business logic lives in route files.

2. **Services own business logic.** `PortfolioService` knows how to compute
   P&L. `AIRecommendationService` knows how to filter eligible funds.
   `FundAnalyticsService` knows how to compute CAGR, Sharpe, and max drawdown.

3. **Repositories own database access.** They are simple Prisma wrappers.
   They do not contain business logic. This boundary means you can replace
   PostgreSQL with anything else without touching services.

4. **CacheManager is a thin, safe wrapper.** Every `CacheManager.get()` call
   catches Redis errors and returns `null` — so a Redis failure gracefully
   falls back to database queries. The application never crashes because Redis
   is down.

5. **AI cannot invent data.** The recommendation pipeline first builds an
   eligible fund list from the real AMFI universe, then passes only those
   candidate scheme codes to Gemini. After Gemini responds, every scheme code
   is cross-checked against the original candidate map. Any AI-invented code
   is silently dropped.

---

## 5. Project Structure

```
fincal/
├── prisma/
│   ├── schema.prisma           # Single source of truth for DB schema
│   └── migrations/             # Prisma migration history
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Route group — all authenticated pages
│   │   │   ├── layout.tsx      # Sidebar + nav (Client Component)
│   │   │   ├── dashboard/      # /dashboard
│   │   │   ├── portfolio/      # /portfolio
│   │   │   ├── goals/          # /goals, /goals/[id]
│   │   │   ├── funds/          # /funds, /funds/[id]
│   │   │   ├── calculator/     # /calculator
│   │   │   ├── assistant/      # /assistant (placeholder)
│   │   │   └── settings/       # /settings
│   │   ├── api/                # API routes (backend)
│   │   │   ├── auth/           # Better Auth handler
│   │   │   ├── dashboard/      # GET /api/dashboard
│   │   │   ├── funds/          # GET /api/funds, /funds/[code]/details, /insights
│   │   │   ├── goals/          # CRUD /api/goals, /goals/[id]
│   │   │   ├── health/         # GET /api/health
│   │   │   ├── nav/ingest/     # GET|POST /api/nav/ingest (cron)
│   │   │   ├── onboarding/     # POST /api/onboarding
│   │   │   ├── portfolio/      # GET|DELETE /api/portfolio
│   │   │   │   ├── analytics/  # GET /api/portfolio/analytics
│   │   │   │   └── holdings/   # POST /api/portfolio/holdings
│   │   │   │       └── [id]/   # PATCH|PUT|DELETE /api/portfolio/holdings/[id]
│   │   │   ├── profile/        # GET|PUT|DELETE /api/profile
│   │   │   ├── recommendations/# GET|POST /api/recommendations
│   │   │   └── sip/calculator/ # POST /api/sip/calculator
│   │   ├── login/              # /login
│   │   ├── register/           # /register
│   │   ├── onboarding/         # /onboarding
│   │   ├── globals.css
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page /
│   ├── backend/
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   │   └── client.ts   # Prisma singleton
│   │   │   └── redis/
│   │   │       ├── client.ts   # ioredis singleton
│   │   │       ├── cache/
│   │   │       │   ├── CacheManager.ts   # get/set/delete wrapper
│   │   │       │   └── CacheKeys.ts      # Centralized key factory
│   │   │       └── rate-limit/
│   │   │           └── RateLimiter.ts    # Sliding window (sorted sets)
│   │   ├── repositories/
│   │   │   ├── AIInsightRepository.ts
│   │   │   ├── GoalRepository.ts
│   │   │   ├── InvestorProfileRepository.ts
│   │   │   ├── LatestNavRepository.ts    # Most important repository
│   │   │   ├── PortfolioRepository.ts    # Exists but mostly unused (service uses Prisma directly)
│   │   │   └── UserRepository.ts         # Stub — not yet implemented
│   │   └── services/
│   │       ├── ai.service.ts             # Gemini API wrapper
│   │       ├── AIRecommendationService.ts # Full recommendation pipeline
│   │       ├── FundAnalyticsService.ts   # Returns, risk, projection
│   │       ├── GoalService.ts
│   │       ├── NavService.ts             # NAV fetch, parse, CAGR
│   │       └── PortfolioService.ts       # Portfolio + holdings logic
│   ├── components/
│   │   ├── charts/             # Recharts wrappers
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── layout/             # Shared layout components
│   │   ├── portfolio/          # Portfolio-specific components
│   │   └── ui/                 # Generic UI components
│   ├── config/
│   │   └── env.ts              # Environment variable validation
│   ├── hooks/                  # Custom React hooks
│   ├── lib/
│   │   ├── api/                # Client-side API helpers
│   │   ├── apiWrapper.ts       # withApiAuthAndError() — most important lib
│   │   ├── auth.ts             # Better Auth server instance
│   │   ├── auth-client.ts      # Better Auth client instance
│   │   ├── constants.ts        # UI constants, color palette, presets
│   │   ├── format.ts           # Number/currency formatting helpers
│   │   ├── logger.ts           # Structured console logger
│   │   ├── rateLimit.ts        # RateLimiter (Redis + in-memory fallback)
│   │   └── utils.ts            # Shared utilities
│   ├── middleware.ts            # Next.js middleware (route guards)
│   ├── shared/
│   │   └── dtos/               # Zod schemas shared between frontend and backend
│   │       ├── calculator.dto.ts
│   │       ├── goal.dto.ts
│   │       └── portfolio.dto.ts
│   ├── types/                  # TypeScript type declarations
│   └── validations/            # Additional Zod schemas
│       ├── calculator.ts
│       ├── goal.ts
│       └── portfolio.ts
├── docs/                       # Internal engineering docs (60+ files)
├── .env.example                # Environment variable template
├── next.config.mjs             # Next.js configuration
├── package.json
├── tailwind.config.mjs
├── tsconfig.json
├── vercel.json                 # Vercel Cron configuration
└── vitest.config.ts            # Test configuration
```

### Important Directory Explanations

| Directory | Responsibility |
|-----------|---------------|
| `src/app/` | All pages (UI) and API routes. Next.js App Router convention. |
| `src/app/(dashboard)/` | Route group — shares the sidebar layout without affecting URL paths. |
| `src/app/api/` | Backend REST endpoints. Each `route.ts` maps to an HTTP method. |
| `src/backend/` | Pure backend code. Never imported by client components. |
| `src/backend/infrastructure/` | Database and Redis clients — adapters to external systems. |
| `src/backend/repositories/` | Thin Prisma wrappers. No business logic. |
| `src/backend/services/` | Business logic. Calls repositories and external APIs. |
| `src/shared/dtos/` | Zod schemas used on both server (API validation) and client (form validation). |
| `src/lib/` | Cross-cutting utilities — auth, logging, rate limiting, API wrappers. |
| `src/middleware.ts` | Runs on every request. Reads the Better Auth cookie and blocks unauthorized access. |

---

## 6. Database Architecture

### Why PostgreSQL and Prisma?

PostgreSQL provides ACID compliance, which matters for financial data where
double-writes or partial updates would corrupt portfolio state. Prisma provides
type-safe database access and schema-as-code migrations. The combination means
the schema is version-controlled, the client is automatically generated, and
every database query is type-checked at compile time.

### The `LatestNAV` Design Decision

Historical NAV data (10+ years of daily prices per fund, for ~15k schemes) is
enormous. Storing it all in PostgreSQL would require hundreds of millions of
rows. Instead:

- **PostgreSQL `LatestNAV` table**: One row per scheme, updated daily by the
  Vercel Cron job. Stores only the current NAV. Bounded at ~15,000 rows.
- **Redis cache** (`nav:history:{schemeCode}`, 24h TTL): Full historical NAV
  series from mfapi.in, cached on first access. Never persisted to PostgreSQL.

This means the application's free-tier PostgreSQL database stays small while
still supporting all required calculations.

### ER Diagram

```mermaid
erDiagram
    User {
        String id PK
        String name
        String email UK
        Boolean emailVerified
        String image
        DateTime createdAt
        DateTime updatedAt
    }

    Session {
        String id PK
        DateTime expiresAt
        String token UK
        String ipAddress
        String userAgent
        String userId FK
    }

    Account {
        String id PK
        String accountId
        String providerId
        String password
        String userId FK
    }

    Verification {
        String id PK
        String identifier
        String value
        DateTime expiresAt
    }

    UserPreferences {
        String id PK
        String theme
        String currency
        Boolean emailAlerts
        String userId FK_UK
    }

    InvestorProfile {
        String id PK
        Int age
        Float currentCapital
        Float monthlyInvestmentCap
        Float existingSip
        Float existingLumpsum
        Float emergencyFund
        Float annualIncome
        String goalType
        Float targetAmount
        Int targetYear
        String riskAppetite
        String investmentKnowledge
        String liquidityPreference
        String investmentStyle
        String userId FK_UK
    }

    Portfolio {
        String id PK
        Float totalInvested
        Float currentValue
        Float totalMonthlySip
        String userId FK_UK
    }

    UserHolding {
        String id PK
        String fundId
        String fundName
        String schemeCode
        Float units
        Float averageNav
        Float investedValue
        Float currentValue
        String source
        String recommendationId
        String portfolioId FK
    }

    PortfolioSnapshot {
        String id PK
        DateTime date
        Float totalValue
        Float netInvested
        String portfolioId FK
    }

    Goal {
        String id PK
        String name
        String investmentType
        Float lumpsumAmount
        Float sipAmount
        Float targetAmount
        Float timeHorizonYears
        Boolean isFlexibleHorizon
        String goalType
        String riskAppetite
        Int age
        String additionalNotes
        String userId FK
    }

    GoalProgress {
        String id PK
        DateTime date
        Float amount
        Float percentage
        String goalId FK
    }

    AIRecommendation {
        String id PK
        String schemeCode
        String fundName
        String category
        Float score
        String reason
        Float suggestedAllocationPercent
        Boolean addedToPortfolio
        String goalId FK
        String userId FK
    }

    AIInsightHistory {
        String id PK
        String topic
        Json insight
        String userId FK
    }

    LatestNAV {
        String schemeCode PK
        String schemeName
        Float nav
        String navDate
        String amc
        String category
        DateTime updatedAt
    }

    User ||--o{ Session : "has"
    User ||--o{ Account : "has"
    User ||--o| UserPreferences : "has"
    User ||--o| InvestorProfile : "has"
    User ||--o| Portfolio : "has"
    User ||--o{ Goal : "has"
    User ||--o{ AIInsightHistory : "has"
    User ||--o{ AIRecommendation : "has"
    Portfolio ||--o{ UserHolding : "contains"
    Portfolio ||--o{ PortfolioSnapshot : "has"
    Goal ||--o{ GoalProgress : "tracks"
    Goal ||--o{ AIRecommendation : "has"
```

---

## 7. Data Models — Detailed

### `User`
The core identity record. Created by Better Auth on registration.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` (UUID) | Primary key, auto-generated |
| `name` | `String` | Display name |
| `email` | `String` | Unique. Used for login |
| `emailVerified` | `Boolean` | Defaults `false`. Better Auth email verification |
| `image` | `String?` | Optional avatar URL |
| `createdAt`, `updatedAt` | `DateTime` | Auditing |

**Relations**: Has one `Portfolio`, one `InvestorProfile`, one
`UserPreferences`, many `Session`, many `Account`, many `Goal`, many
`AIInsightHistory`, many `AIRecommendation`.

---

### `Session`
Created by Better Auth on every login. Contains the session token stored in
the browser cookie. Indexed by `userId`.

| Field | Type | Notes |
|-------|------|-------|
| `token` | `String` | Unique. Stored as cookie in browser |
| `expiresAt` | `DateTime` | Session lifetime. Configured: 7 days |
| `ipAddress`, `userAgent` | `String?` | Optional device fingerprinting |

**Cascade**: Deleting a `User` cascades to delete all their `Session` rows.

---

### `Account`
Stores OAuth or credential-based account linkage for Better Auth. For
email/password, the `password` field stores the bcrypt hash.

---

### `Verification`
Better Auth uses this for email verification tokens. Not directly used by
application business logic.

---

### `UserPreferences`
One-to-one with `User`. Stores UI/notification preferences.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `theme` | `String` | `"system"` | `"light"`, `"dark"`, or `"system"` |
| `currency` | `String` | `"INR"` | `"INR"` or `"USD"` |
| `emailAlerts` | `Boolean` | `true` | — |

---

### `InvestorProfile`
One-to-one with `User`. Captured during onboarding. Used by the
recommendation engine to understand the investor's situation.

| Field | Type | Notes |
|-------|------|-------|
| `age` | `Int` | Used for horizon calculation in recommendations |
| `currentCapital` | `Float` | Existing investable corpus |
| `monthlyInvestmentCap` | `Float` | Maximum monthly SIP capacity |
| `existingSip` | `Float` | Existing SIP commitments outside FinCal |
| `existingLumpsum` | `Float` | Existing lumpsum investments |
| `emergencyFund` | `Float` | Emergency fund amount (affects available capital) |
| `annualIncome` | `Float?` | Annual income |
| `goalType` | `String` | Free-text goal classification from onboarding |
| `targetAmount` | `Float?` | Corpus target from onboarding |
| `targetYear` | `Int` | Year by which the target should be reached |
| `riskAppetite` | `String` | `"Low"`, `"Moderate"`, `"High"` |
| `investmentKnowledge` | `String` | `"BEGINNER"`, `"INTERMEDIATE"`, etc. |
| `liquidityPreference` | `String` | How quickly user may need access |
| `investmentStyle` | `String` | `"PASSIVE"`, `"ACTIVE"` |

**Important**: `riskAppetite` here stores free-text values from onboarding
(e.g., `"MODERATE"`). The `Goal.riskAppetite` field uses a Prisma enum
(`low`, `moderate`, `high`). These are separate fields with different value
formats — do not confuse them.

---

### `Portfolio`
One-to-one with `User`. A single aggregate portfolio per user.

| Field | Type | Notes |
|-------|------|-------|
| `totalInvested` | `Float` | Sum of invested amounts across all holdings. Updated on each portfolio fetch. |
| `currentValue` | `Float` | Sum of current values using live NAVs. Updated on each portfolio fetch. |
| `totalMonthlySip` | `Float` | Stored but not auto-computed from holdings in current code. |

**Design note**: `totalInvested` and `currentValue` are denormalized and
updated by `PortfolioService.getPortfolio()` as a side effect of each fetch.
They are not the source of truth for P&L calculations — those are always
recomputed live from holdings × current NAV.

---

### `UserHolding`
Each row represents one mutual fund position in a user's portfolio. There is
no debit/credit transaction log — adding a holding is the "buy" event.
Updating changes the average NAV and units.

| Field | Type | Notes |
|-------|------|-------|
| `schemeCode` | `String?` | AMFI scheme code. Indexed for fast NAV lookups. |
| `fundName` | `String?` | Cached fund name from AMFI |
| `units` | `Float` | Number of units held |
| `averageNav` | `Float` | Purchase NAV (or weighted average if multiple buys — not yet implemented) |
| `investedValue` | `Float` | `units × averageNav`. The cost basis. |
| `currentValue` | `Float?` | `units × currentNav`. Updated fire-and-forget during portfolio fetch. |
| `source` | `String?` | `"manual"` or `"ai_recommendation"` |
| `recommendationId` | `String?` | Links back to the `AIRecommendation` if sourced from AI |

**Indexes**: `portfolioId` (for listing all holdings), `schemeCode` (for
NAV lookups).

**Important limitation**: There is no separate `Transaction` model. If a user
buys more units of the same fund, the correct flow is to manually update the
holding with new units + recalculated average NAV. Separate buy/sell
transaction history is **not implemented**.

---

### `PortfolioSnapshot`
Time-series snapshots of total portfolio value. Schema exists and is queried
by the dashboard for a historical value chart. **Automatic snapshot creation
is not implemented** — snapshots are not being written by any current job or
trigger. The table will be empty unless manually populated.

---

### `Goal`
Represents a financial goal the user is working toward. Each goal has its own
risk appetite, time horizon, and investment type, independent of the
`InvestorProfile`.

| Field | Type | Notes |
|-------|------|-------|
| `investmentType` | `Enum` | `lumpsum` or `sip` |
| `goalType` | `Enum` | `wealth_generation`, `education`, `retirement`, `house`, `other` |
| `riskAppetite` | `Enum` | `low`, `moderate`, `high` |
| `targetAmount` | `Float` | The corpus the user wants to reach |
| `timeHorizonYears` | `Float` | Investment duration in years |
| `isFlexibleHorizon` | `Boolean` | Whether user can extend the timeline |
| `lumpsumAmount` | `Float?` | Required if `investmentType = lumpsum` |
| `sipAmount` | `Float?` | Required if `investmentType = sip` |
| `age` | `Int` | User's age at time of goal creation (for recommendation context) |
| `additionalNotes` | `String?` | Free-text context for AI recommendations |

---

### `AIRecommendation`
Persisted output of the recommendation pipeline. Scoped to both `userId` and
`goalId` so a user cannot see another user's recommendations.

| Field | Type | Notes |
|-------|------|-------|
| `schemeCode` | `String` | AMFI scheme code — comes from validated AMFI universe, not AI |
| `fundName` | `String` | Canonical name from AMFI — not AI-generated |
| `category` | `String` | Canonical category from AMFI |
| `score` | `Float` | Suitability score 0–100, clamped. Determined by AI ranking. |
| `reason` | `String` | AI-generated explanation (up to 2000 chars, validated by Zod) |
| `suggestedAllocationPercent` | `Float` | Normalized by service to sum to exactly 100% |
| `addedToPortfolio` | `Boolean` | Set to `true` when user adds this recommendation to portfolio |

---

### `AIInsightHistory`
Logs AI analysis sessions. Stored as JSON blob so the insight structure can
evolve. Used by the dashboard to show recent insights.

---

### `LatestNAV`
The most critical "operational table" — primary key is `schemeCode` (not UUID).
One row per scheme. UPSERT semantics — same row is overwritten daily.

| Field | Notes |
|-------|-------|
| `schemeCode` (PK) | AMFI scheme code — uniquely identifies a fund |
| `nav` | Always > 0. A `Float`, not a currency type. |
| `navDate` | Raw date string from AMFI (e.g., `"16-Aug-2026"`) — stored as `String` to avoid timezone ambiguity. |
| `schemeName` | Full scheme name |
| `amc` | Asset Management Company name |
| `category` | Fund category string from AMFI |

**Why `navDate` is a `String`**: Timezone conversion of date-only values
(like NAV dates) can shift them by one day depending on the server timezone.
Storing them as strings avoids this. NAV dates are never queried by range, so
there is no need for `DateTime` semantics.

---

## 8. API Architecture

### API Response Format

All API routes follow a consistent response envelope:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "Error message", "details": [...] }
```

### The `withApiAuthAndError` Wrapper

Every protected API route is wrapped with `withApiAuthAndError()` from
[`src/lib/apiWrapper.ts`](src/lib/apiWrapper.ts). This wrapper does:

1. **Session check**: Calls `auth.api.getSession()`. Returns `401` if no
   valid session cookie exists.
2. **Rate limit**: Calls `RateLimiter.check()` — 200 requests per 15 minutes
   per user. Returns `429` with `Retry-After` header if exceeded.
3. **Error handling**: Catches `ZodError` → `400` with field details. Catches
   everything else → `500`.

The public `withApiError()` variant skips the session check but still applies
rate limiting (10 req / 15 min per IP) and Zod error handling.

### Complete API Endpoint Reference

#### Authentication

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| `GET/POST` | `/api/auth/[...all]` | Better Auth handler — all sign-in/out/register flows | Public |
| `GET` | `/api/auth/me` | Returns the current Better Auth session | Public |

#### Dashboard

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| `GET` | `/api/dashboard` | All dashboard data in one request: user, profile, goals, portfolio, insights, recommendations | ✅ |

**Response shape**: `{ user, profileCompleted, goals, portfolio, profile, insights }`

#### Portfolio

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| `GET` | `/api/portfolio` | Full portfolio with live NAVs, per-holding P&L, allocation breakdowns | ✅ |
| `DELETE` | `/api/portfolio` | Delete entire portfolio | ✅ |
| `GET` | `/api/portfolio/analytics` | P&L summary + allocation (subset of GET /portfolio) | ✅ |
| `POST` | `/api/portfolio/holdings` | Add a new holding | ✅ |
| `PATCH` | `/api/portfolio/holdings/[id]` | Update holding units/nav | ✅ |
| `PUT` | `/api/portfolio/holdings/[id]` | Full replacement of holding units/nav | ✅ |
| `DELETE` | `/api/portfolio/holdings/[id]` | Remove a single holding | ✅ |

**POST /api/portfolio/holdings body:**
```json
{
  "schemeCode": "120503",
  "units": 10.5,           // OR
  "amount": 5000,          // provide units OR amount, not both
  "purchaseNav": 250.0,    // optional — fetched live if not supplied
  "source": "manual",      // "manual" | "ai_recommendation"
  "recommendationId": "..."// optional
}
```

#### Funds

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| `GET` | `/api/funds?search=&page=&limit=` | Search or list funds from AMFI universe | ✅ |
| `GET` | `/api/funds/[schemeCode]/details` | Full fund details: NAV, returns, risk metrics, history | ✅ |
| `GET` | `/api/funds/[schemeCode]/insights?goalId=` | AI-generated pros/cons/analysis. Optional goal context | ✅ |

#### Goals

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| `GET` | `/api/goals` | List all user goals | ✅ |
| `POST` | `/api/goals` | Create a new goal | ✅ |
| `GET` | `/api/goals/[id]` | Get a single goal with recommendations | ✅ |
| `PATCH` | `/api/goals/[id]` | Update a goal | ✅ |
| `DELETE` | `/api/goals/[id]` | Delete a goal | ✅ |

#### Recommendations

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| `GET` | `/api/recommendations?goalId=` | List saved recommendations (optional filter by goal) | ✅ |
| `POST` | `/api/recommendations` | Generate new AI recommendations for a goal | ✅ |

**POST body:** `{ "goalId": "uuid" }`

#### NAV Ingestion

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| `GET` | `/api/nav/ingest` | Vercel Cron daily NAV ingest (14:30 UTC = 20:00 IST) | Bearer token |
| `POST` | `/api/nav/ingest` | Manual trigger for NAV ingest | Bearer token |

Authentication: `Authorization: Bearer <CRON_SECRET>`. In dev, accepts `Bearer dev-secret-key`.

#### Profile & Onboarding

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| `GET` | `/api/profile` | Get user + investorProfile + preferences | ✅ |
| `PUT` | `/api/profile` | Update profile/preferences/user name. Body: `{ type: "profile"|"preferences"|"user", data: {...} }` | ✅ |
| `DELETE` | `/api/profile` | Delete account and all data | ✅ |
| `POST` | `/api/onboarding` | Save investor profile + create initial goal | ✅ (manual session check) |

#### Calculator

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| `POST` | `/api/sip/calculator` | SIP / Lumpsum projection | ✅ |

**POST body:**
```json
{
  "schemeCode": "120503",
  "monthlyAmount": 5000,
  "years": 10,
  "type": "sip",
  "expectedReturnPercent": 12.5  // optional — auto-computed from history if omitted
}
```

#### Utility

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| `GET` | `/api/health` | DB + Redis health check | Public |

---

## 9. Complete Data Flows

### A. Authentication — Sign In

```
User submits email + password
↓
Browser calls authClient.signIn.email({ email, password })
  (better-auth/react client, calls POST /api/auth/sign-in/email)
↓
Better Auth server (src/lib/auth.ts) receives request
  → Looks up user by email in PostgreSQL User table
  → Verifies bcrypt hash (password column in Account table)
  → Creates new Session row with 7-day expiry
  → Sets better-auth.session_token cookie (HttpOnly, Secure in prod)
↓
Browser redirects to /dashboard
```

### B. Protected API Request

```
Browser fetches /api/portfolio (cookie automatically sent)
↓
Next.js Middleware (src/middleware.ts)
  → Reads better-auth.session_token cookie
  → If missing → redirect to /login (pages) or 401 JSON (API)
  → If present → passes through to route handler
↓
withApiAuthAndError() wrapper
  → auth.api.getSession({ headers }) — validates token against Session table
  → RateLimiter.check() — 200 req / 15 min per user
↓
PortfolioService.getPortfolio(userId)
↓
Response returned to browser
```

### C. Fund Search

```
User types in search box (400ms debounce)
↓
Browser fetches GET /api/funds?search=<query>&limit=20
↓
withApiAuthAndError() → session check + rate limit
↓
NavService.searchFunds(query, 20)
  → NavService.getFundUniverse()
      → CacheManager.get('amfi:universe:parsed')  ← Redis (12h TTL)
        If hit: return cached universe
        If miss:
          → fetch https://www.amfiindia.com/spages/NAVAll.txt (15s timeout)
          → NavService.parseAmfiText(text)
              → parse each line: SchemeCode;ISIN1;ISIN2;SchemeName;NAV;Date
              → skip malformed lines, negative/zero NAVs, empty codes
              → accumulate AMC + category from section headers
          → CacheManager.set('amfi:universe:parsed', universe, 43200)
  → Filter universe by query (case-insensitive substring)
  → If query doesn't include "regular": narrow to Direct Growth only
  → Return first 20 matches
↓
API returns array of { id, name, category, amc, metrics }
↓
Frontend renders fund list
```

### D. Fund Details Fetch

```
User clicks a fund → /funds/120503
↓
Frontend fetches GET /api/funds/120503/details
↓
FundAnalyticsService.getFundDetails("120503")
  → CacheManager.get('fund:details:120503')  ← Redis (60 min TTL)
    If hit: return cached details
    If miss:
      → NavService.getLatestNav("120503")
          → LatestNavRepository.findBySchemeCode("120503")  ← PostgreSQL
            If found: return row as LiveNAV
            If not found or DB error: try mfapi.in /latest (5s timeout)
              If success: persist to DB fire-and-forget → return
              If fail: try AMFI NAVAll.txt (15s timeout)
                If success: persist to DB fire-and-forget → return
                If fail: return navUnavailable: true
      → NavService.getHistoricalNav("120503")
          → CacheManager.get('nav:history:120503')  ← Redis (24h TTL)
            If miss: fetch mfapi.in/mf/120503 (10s timeout)
              → parse daily entries, cache result
              → return [{date, nav}, ...]
      → FundAnalyticsService.calculateReturns(currentNav, history)
      → FundAnalyticsService.calculateRiskMetrics(history)
      → CacheManager.set('fund:details:120503', details, 3600)
  → Return FundDetails
↓
Frontend renders fund name, NAV, returns table, risk metrics, NAV chart
```

### E. Daily NAV Ingest (AMFI Cron)

```
Vercel Cron fires at 14:30 UTC (≈20:00 IST, after AMFI publishes daily NAV)
↓
GET /api/nav/ingest
  with header: Authorization: Bearer <CRON_SECRET>
↓
handleIngest():
  → Verify bearer token
  → fetch https://www.amfiindia.com/spages/NAVAll.txt (30s timeout, ~3MB file)
  → NavService.parseAmfiText(text) → Record<schemeCode, LiveNAV>
    → Skip empty universe (guard against malformed response)
  → LatestNavRepository.upsertMany(navEntries)
      → Chunk into batches of 500
      → For each chunk: prisma.$transaction(500 × upsert operations)
        → Creates row if new scheme, updates nav/navDate/schemeName if existing
  → Return { parsed, written, skipped, durationMs }
↓
All future getLatestNav() calls now hit PostgreSQL and skip mfapi/AMFI fallbacks
```

### F. Add Holding

```
User fills form: fund = "HDFC Mid Cap", amount = ₹10,000
↓
Frontend validates via addHoldingSchema (Zod)
↓
POST /api/portfolio/holdings
  Body: { schemeCode: "120503", amount: 10000, source: "manual" }
↓
withApiAuthAndError() → session check
↓
portfolioService.addHolding(userId, { schemeCode: "120503", amount: 10000 })
  → Ensure portfolio exists (create if not)
  → NavService.getLatestNav("120503") → LiveNAV { nav: 95.34, ... }
  → Validate nav > 0 and nav < 1,000,000 (sanity guard)
  → units = 10000 / 95.34 = 104.88 units
  → prisma.userHolding.create({
        schemeCode: "120503",
        fundName: "HDFC Mid-Cap Opportunities Fund - Direct Growth",
        units: 104.88,
        averageNav: 95.34,
        investedValue: 10000,
        currentValue: 104.88 * 95.34,
    })
  → If recommendationId supplied: mark AIRecommendation.addedToPortfolio = true
  → CacheManager.delete('user:{userId}:portfolio')    ← invalidate portfolio cache
  → CacheManager.delete('portfolio:analytics:{userId}')
↓
Return enriched holding
```

### G. Portfolio Calculation (GET /api/portfolio)

```
GET /api/portfolio
↓
PortfolioService.getPortfolio(userId)
  → CacheManager.get('user:{userId}:portfolio')  ← Redis (5 min TTL)
    If hit: return cached result
    If miss:
      → prisma.portfolio.findUnique({ include: { holdings: true } })
      → Extract all schemeCodes from holdings
      → NavService.batchGetLatestNavs(schemeCodes, concurrency=5)
          → Chunks of 5 concurrent NavService.getLatestNav() calls
          → Each call: PostgreSQL → mfapi.in fallback → AMFI fallback
      → For each holding:
          currentValue = holding.units × liveNav.nav
          pnl = currentValue - holding.investedValue
          pnlPercentage = (pnl / investedValue) × 100
          Update holding.currentValue in DB (fire-and-forget)
      → totalInvested = sum(holding.investedValue)
      → totalCurrentValue = sum(holding.currentValue)
      → totalPnl = totalCurrentValue - totalInvested
      → Build assetAllocation, categoryAllocation, amcAllocation breakdowns
      → Update portfolio.totalInvested and portfolio.currentValue in DB
      → CacheManager.set('user:{userId}:portfolio', result, 300)
↓
Return PortfolioSummary
```

### H. Generate Fund Recommendations

```
User clicks "Generate Recommendations" on a goal
↓
POST /api/recommendations  Body: { goalId: "uuid" }
↓
AIRecommendationService.generateRecommendations(userId, goalId)
  → Rate limit check: CacheManager.get('ratelimit:ai_recommend:{userId}')
      → Max 5 requests per hour. Throw if exceeded.
  → Load goal (with userId guard — throws if not found/unauthorized)
  → PortfolioService.getPortfolio(userId) → existing holdings list
  → NavService.getFundUniverse() → ~15,000 LiveNAV entries from AMFI
  → getEligibleFunds(universe, goal.riskAppetite, goal.timeHorizonYears)
      → Filter: must have valid schemeCode, schemeName, nav > 0
      → Filter: name must include "direct" AND "growth"
      → Filter: name must NOT include "regular", "idcw", "dividend"
      → Filter by time horizon (< 3Y → liquid/debt, 3-5Y → hybrid/large cap, > 5Y → equity)
      → Filter by risk appetite (low → conservative categories, high → equity/small cap)
  → selectCandidatePool(eligible, riskAppetite, horizon)
      → Score each fund: base 50 + horizon adjustments (±15-35) + risk adjustments (±15-25)
      → Sort by score descending → take top 60 as candidates for Gemini
  → Build prompt with:
      - Goal details (type, amount, horizon, risk, age, notes)
      - Existing holdings (for diversification context)
      - Candidate universe (up to 60 funds with schemeCode, name, category, AMC)
      - Strict instructions: only select from candidates, return exact schemeCodes
  → callAI(prompt, 'json') → Gemini 2.5 Flash → JSON string
  → JSON.parse + Zod validation (AIRecommendationResponseSchema)
  → For each AI recommendation:
      - Verify schemeCode exists in candidate map (else skip)
      - Verify fund name includes "direct" AND "growth" (else skip)
      - NavService.getLatestNav() — verify NAV is available (else skip)
      - Clamp score to [0, 100]
  → Require ≥ 4 valid recommendations (else throw)
  → Sort by score desc, take top 6
  → Normalize allocation percentages to sum to exactly 100%
  → prisma.$transaction:
      - deleteMany existing recommendations for this goal+user
      - createMany new recommendations (using AMFI canonical values, not AI's)
  → Increment rate limit counter
  → Return saved recommendations sorted by score
```

### I. AI Fund Insights

```
User opens fund detail page → clicks "Get AI Insights"
↓
GET /api/funds/120503/insights?goalId=<optional>
↓
FundAnalyticsService.getFundInsights("120503", goalId, userId)
  → Cache check: CacheManager.get('fund:insights:120503:{goalId}')  ← Redis (24h TTL)
    If hit: return cached
  → Rate limit: CacheManager.get('ratelimit:fund_insights:{userId}')
      → Max 10 per hour per user
  → FundAnalyticsService.getFundDetails("120503") → returns, risk metrics
  → If goalId: load Goal from DB to add goal context to prompt
  → Build prompt with actual computed returns (1M, 3M, 6M, 1Y, 3Y, 5Y, inception)
      and actual risk metrics (volatility %, Sharpe, max drawdown)
      The AI is analyzing REAL numbers — it cannot invent them
  → callAI(prompt, 'json') → Gemini 2.5 Flash
  → Parse + validate: { pros: string[], cons: string[], suitabilityScore: 0-10|null, analysis: string }
  → CacheManager.set(cacheKey, insights, 86400)  ← 24h TTL
  → Return FundInsights
```

### J. SIP Projection Calculation

```
User: fund=HDFC Flexi Cap, ₹5,000/month, 10 years
↓
POST /api/sip/calculator
  Body: { schemeCode: "120503", monthlyAmount: 5000, years: 10, type: "sip" }
↓
FundAnalyticsService.calculateProjection({ schemeCode, monthlyAmount, years, type }, userId)
  → Rate limit: max 30 per hour per user
  → getFundDetails("120503") → fetch historical NAV + compute returns
  → If expectedReturnPercent not supplied:
      years ≤ 3 → use 3Y return (or 1Y fallback)
      years > 3 → use 5Y return (or 3Y → 1Y fallback)
      If none available → throw (require manual input)
  → SIP formula:
      n = 10 × 12 = 120 months
      r = (annualReturn/100) / 12   (monthly rate)
      totalInvested = 5000 × 120 = ₹6,00,000
      estimatedValue = 5000 × ((1+r)^n - 1) / r × (1+r)
  → Return { totalInvested, estimatedValue, estimatedGains,
             absoluteReturnPercent, usedReturnPercent,
             historicalReturns: { 1Y, 3Y, 5Y, sinceInception } }
```

### K. Redis Cache Flow

```mermaid
flowchart TD
    Request["Incoming Request"]
    CacheGet["CacheManager.get(key)"]
    CacheHit{"Hit?"}
    ReturnCached["Return cached value"]
    DBQuery["Query PostgreSQL / External API"]
    CacheSet["CacheManager.set(key, value, TTL)"]
    ReturnFresh["Return fresh value"]
    RedisDown{"Redis available?"}
    ReturnNull["Return null\n(graceful fallback to DB)"]

    Request --> CacheGet
    CacheGet --> RedisDown
    RedisDown -- Yes --> CacheHit
    RedisDown -- No --> ReturnNull
    CacheHit -- Yes --> ReturnCached
    CacheHit -- No --> DBQuery
    DBQuery --> CacheSet
    CacheSet --> ReturnFresh
    ReturnNull --> DBQuery
```

---

## 10. Authentication & Authorization

### Library

Better Auth (`better-auth` v1.6.25) manages the full authentication lifecycle.
It is configured in [`src/lib/auth.ts`](src/lib/auth.ts).

### Configuration

```typescript
betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,    // Canonical app URL
  trustedOrigins: [appUrl, 'https://*.vercel.app', 'http://localhost:3000'],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,         // Sign in immediately after registration
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,   // 7 days
    updateAge: 60 * 60 * 24,        // Refresh if older than 1 day
    cookieCache: { enabled: true, maxAge: 5 * 60 }  // 5-min client cookie cache
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookiePrefix: 'better-auth',
  }
})
```

### Session Cookie

Better Auth sets `better-auth.session_token` (or
`__Secure-better-auth.session_token` in production) as an HttpOnly cookie.
The middleware reads this cookie without calling the database — it only checks
for presence of the cookie. Full session validation (DB lookup) happens inside
the `withApiAuthAndError()` wrapper via `auth.api.getSession({ headers })`.

### Auth Routes

Better Auth mounts all its handlers at `/api/auth/[...all]`. The relevant
endpoints include:
- `POST /api/auth/sign-up/email` — register
- `POST /api/auth/sign-in/email` — login
- `POST /api/auth/sign-out` — logout
- `GET /api/auth/session` — get current session

### Client Side

`src/lib/auth-client.ts` exports `authClient = createAuthClient({ baseURL })`.
The `baseURL` resolves to `window.location.origin` in the browser (always
same-origin) and to `NEXT_PUBLIC_APP_URL` on the server.

`authClient.useSession()` is a React hook used in the dashboard layout to
display the user's name and manage logout.

### Authorization (Ownership Checks)

Every protected operation verifies the resource belongs to the requesting user:

- `GoalRepository.findByIdAndUserId(id, userId)` — goals
- `GoalRepository.deleteGoal(id, userId)` — uses `deleteMany` with `{ id, userId }` clause
- `PortfolioService.updateHolding()` — loads portfolio by `userId`, verifies `holding.portfolioId === portfolio.id`
- `AIRecommendationService.generateRecommendations()` — loads goal with `{ id: goalId, userId }` guard
- `FundAnalyticsService.getFundInsights()` — loads goal with `{ id: goalId, userId }` guard

### Auth Rate Limiting

`checkAuthRateLimit(ip)` in `src/lib/auth.ts` uses `RateLimiter.isAllowed()`:
10 requests per 15 minutes per IP, backed by Redis sorted sets.

---

## 11. Fund Data Pipeline

The fund data lifecycle moves through several stages:

```mermaid
flowchart TD
    AMFI["AMFI NAVAll.txt\nhttps://www.amfiindia.com/spages/NAVAll.txt\n~3MB text file, ~15,000 schemes"]
    Parse["NavService.parseAmfiText()\nLine-by-line parsing\nAMC/category context tracking\nSkip malformed lines"]
    Validate["Validation\nnav > 0\nschemeCode not empty\nnot a placeholder -"]
    Ingest["LatestNavRepository.upsertMany()\n500-row transaction batches\nUPSERT — one row per scheme"]
    PG["PostgreSQL LatestNAV table\n~15,000 rows\nOne row per scheme, updated daily"]
    Redis["Redis amfi:universe:parsed\n12h TTL\nFull universe in memory"]
    NavService["NavService.getLatestNav(schemeCode)\n1. PostgreSQL lookup\n2. mfapi.in fallback (5s)\n3. AMFI fallback (15s)"]
    HistRedis["Redis nav:history:{schemeCode}\n24h TTL"]
    MfAPI["mfapi.in/{schemeCode}\nFull historical NAV series"]

    AMFI -->|Cron: 14:30 UTC daily| Parse
    Parse --> Validate
    Validate --> Ingest
    Ingest --> PG
    AMFI -->|On-demand, 12h cache| Parse
    Parse --> Redis
    PG --> NavService
    Redis --> NavService
    MfAPI -->|On-demand| HistRedis
    HistRedis --> NavService
```

### AMFI File Format

The AMFI NAVAll.txt file uses a structured text format:

```
Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
...
Aditya Birla Sun Life Mutual Fund     ← AMC header line (ends with "Mutual Fund")
Open Ended Schemes(Equity Scheme - Large Cap Fund)   ← Category header line
118989;INF209K01983;INF209K01991;Aditya Birla Sun Life Frontline Equity Fund - Growth;94.6100;16-Aug-2026
```

`NavService.parseAmfiText()` tracks the current AMC and category as it
processes section headers, so each data line inherits its context.

### Scheme Code

The `schemeCode` (also called "Scheme Code" in AMFI nomenclature) is a
numeric string (e.g., `"120503"`) that uniquely identifies one mutual fund
scheme. It is the primary key of `LatestNAV` and is stored in `UserHolding.schemeCode`.
The same code is used to call mfapi.in: `https://api.mfapi.in/mf/120503`.

### Latest NAV Resolution Order

When `NavService.getLatestNav(schemeCode)` is called:

1. **PostgreSQL** `LatestNAV` table — primary source, populated by daily ingest
2. **mfapi.in /latest** — fallback if DB has no row (5s timeout)
3. **AMFI NAVAll.txt** — secondary fallback (15s timeout, parses full file)
4. **`navUnavailable: true`** — returned if all sources fail; never throws

When a fallback succeeds, the result is persisted to PostgreSQL
(fire-and-forget) so the next request hits the DB.

### In-Flight Deduplication

`NavService` maintains two process-level `Map` objects (`inFlightLatest`,
`inFlightHistorical`). If 100 concurrent requests arrive for the same
uncached `schemeCode`, only one fetch goes to mfapi.in. The other 99 await
the same `Promise`. This prevents "thundering herd" on cold cache misses.
This is process-level only — it does not coordinate across multiple Vercel
function instances in a distributed deployment.

### What Is NOT Stored in PostgreSQL

- **Historical NAV series** — too large (~3.5M+ rows for 15k funds × years).
  Fetched from mfapi.in on demand and cached in Redis for 24 hours.
- **Full AMFI universe** — ~15k records kept in Redis (12h TTL) as a JSON blob.
  Fetching from PostgreSQL would require 15k row reads per fund search.

---

## 12. Portfolio Architecture

### Single Portfolio per User

Each user has exactly one `Portfolio` record. Holdings within it are separate
`UserHolding` rows. There is no multi-portfolio or account concept.

### P&L Calculation

P&L is always computed live during `getPortfolio()`. It is never persisted as
a standalone figure:

```
pnl = currentValue - investedValue
    = (units × currentNav) - (units × averageNav)

pnlPercentage = (pnl / investedValue) × 100
```

When NAV is unavailable for a holding, the service falls back to the stored
`currentValue` in the DB (written on last successful fetch) rather than
showing an artificially bad P&L.

### Allocation Breakdowns

`buildAllocation()` groups holdings by either `amc` or `category` and computes
percentage of total current value. The asset-level allocation additionally
buckets categories into `Equity`, `Debt`, `Hybrid`, `Gold / Commodity`,
`Index / ETF`, `Other` using keyword matching on the category string.

### Cache Invalidation

The portfolio cache key `user:{userId}:portfolio` is invalidated immediately
after:
- `addHolding()` — new holding added
- `updateHolding()` — units or NAV changed
- `deleteHolding()` — holding removed
- `deletePortfolio()` — entire portfolio cleared

There is no time-based expiry for the cache key itself — invalidation is
event-driven on write operations. However, during `getPortfolio()`, the result
is cached for 5 minutes (300 seconds) via `CacheManager.set(..., 300)`.

---

## 13. Goals Module

### Goal Lifecycle

```
User → Create goal form (/goals)
  → Validates via goalSchema (Zod)
      - investmentType: "lumpsum" or "sip"
      - riskAppetite: "low", "moderate", "high"
      - goalType: "wealth_generation", "education", "retirement", "house", "other"
      - Cross-field: lumpsumAmount required if type=lumpsum
      - Cross-field: sipAmount required if type=sip
      - Cross-field: targetAmount ≥ lumpsumAmount if lumpsum
  → POST /api/goals
  → GoalService.createGoal()
      → Auto-generates name if blank: "Retirement Goal", "Education Goal" etc.
      → GoalRepository.createGoal()
      → CacheManager.delete('user:{userId}:goals')
```

### Goal Caching

`GoalService.getUserGoals()` caches the goals list for 5 minutes in
`user:{userId}:goals`. The cache is invalidated on every create/update/delete.

### Goal-Recommendation Binding

Every `AIRecommendation` is bound to both `goalId` and `userId`. This means:
- Recommendations are goal-specific (different goals can have different sets)
- Users cannot see each other's recommendations (userId guard)
- When recommendations are regenerated for a goal, all old ones are deleted in
  a transaction before new ones are inserted (atomic replacement)

### GoalProgress (Partially Implemented)

The `GoalProgress` model has a schema and is queried by the dashboard
(showing the latest snapshot). However, **no code automatically creates
`GoalProgress` entries**. Progress snapshots would need to be written by a
scheduled job or user action — this is not currently implemented.

---

## 14. Financial Calculation Engines

### Important: Deterministic Calculations vs. AI

**Deterministic calculations** are numbers computed by code from real data:
returns, volatility, Sharpe ratio, CAGR, P&L. These numbers are computed by
`FundAnalyticsService` and `NavService` from real historical NAV data.

**AI (Gemini)** receives these pre-computed numbers in its prompt and
interprets them. It cannot change them. The AI's role is qualitative analysis
only — pros, cons, narrative.

This boundary is critical: AI never performs arithmetic on financial data.

---

### CAGR (Compound Annual Growth Rate)

`NavService.calculateCagr(history, years)` and `FundAnalyticsService.cagr()`.

**Formula:**

$$\text{CAGR} = \left(\frac{\text{NAV}_{\text{current}}}{\text{NAV}_{\text{start}}}\right)^{1/\text{years}} - 1$$

**Example**: Fund started at NAV ₹100 three years ago. Current NAV is ₹150.

$$\text{3Y CAGR} = \left(\frac{150}{100}\right)^{1/3} - 1 = 1.5^{0.333} - 1 \approx 0.1447 = 14.47\%$$

**Algorithm** (`NavService.calculateCagr`):
1. Validate inputs (years > 0, at least 2 data points)
2. Parse all dates (handling mfapi's `DD-MM-YYYY` format and standard formats)
3. Discard entries with invalid dates or non-positive NAVs
4. Sort ascending by date (oldest first)
5. `latestNav` = last entry's NAV; `latestDate` = last entry's date
6. `targetDate` = `latestDate - years`
7. Find the latest entry on or before `targetDate` (walk backwards)
8. If no such entry exists → return `null` (insufficient history)
9. Apply CAGR formula

**Return value**: Percentage (e.g., `14.47` means 14.47%), or `null` if
insufficient data.

---

### Returns Calculation

`FundAnalyticsService.calculateReturns(currentNav, history)`

Computes returns for multiple periods. `history` is newest-first (as returned
by mfapi.in).

| Period | Method |
|--------|--------|
| 1M, 3M, 6M | `pctChange(currentNav, navN_monthsAgo)` |
| 1Y | `pctChange(currentNav, nav12MonthsAgo)` |
| 3Y, 5Y | `cagr(currentNav, navN_monthsAgo, N_years)` |
| Since Inception | `cagr(currentNav, firstEverNav, years_since_inception)` |

**`pctChange` formula:**

$$\text{Return\%} = \frac{\text{NAV}_\text{current} - \text{NAV}_\text{past}}{\text{NAV}_\text{past}} \times 100$$

Finding the historical NAV: `findClosestNav(targetDate, history)` walks
newest-first through history and returns the first entry whose date ≤ target.

---

### Annualized Volatility (Standard Deviation)

`FundAnalyticsService.calculateRiskMetrics(history)`

Requires at least 252 data points (approximately one year of trading days).

**Step 1**: Compute daily returns from chronological NAV series:
$$r_t = \frac{\text{NAV}_t - \text{NAV}_{t-1}}{\text{NAV}_{t-1}}$$

**Step 2**: Mean daily return:
$$\bar{r} = \frac{1}{N}\sum_{t=1}^{N} r_t$$

**Step 3**: Daily variance:
$$\sigma_d^2 = \frac{1}{N}\sum_{t=1}^{N}(r_t - \bar{r})^2$$

**Step 4**: Annualized volatility (using 252 trading days):
$$\sigma_{\text{annual}} = \sqrt{\sigma_d^2} \times \sqrt{252}$$

Returned as a ratio (e.g., `0.18` = 18% annualized volatility).

---

### Sharpe Ratio

`FundAnalyticsService.calculateRiskMetrics(history)`

Risk-free rate is **6.5%** (hardcoded as a reasonable India-specific
approximation — represents the approximate yield on Indian government bonds).

$$\text{Sharpe} = \frac{R_{\text{annualized}} - R_f}{\sigma_{\text{annual}}}$$

Where:
- $R_{\text{annualized}}$ = annualized return computed from `(endNAV/startNAV)^{1/years} - 1`
- $R_f$ = 0.065 (6.5%)
- $\sigma_{\text{annual}}$ = annualized volatility

Interpretation: Sharpe > 1 is generally considered acceptable; > 2 is good.
Returns `null` if volatility is 0 (to avoid division by zero).

---

### Maximum Drawdown

`FundAnalyticsService.calculateRiskMetrics(history)`

Maximum peak-to-trough decline over the entire history.

**Algorithm**:
1. Walk chronologically through NAV series
2. Track `peak` = highest NAV seen so far
3. At each point: `drawdown = (peak - nav) / peak`
4. `maxDrawdown = max(drawdown)` over all points

$$\text{Max Drawdown\%} = \max\left(\frac{\text{peak} - \text{NAV}_t}{\text{peak}}\right) \times 100$$

Returned as a percentage (e.g., `15.3` means 15.3% maximum decline from peak).

---

### SIP Projection Formula

`FundAnalyticsService.calculateProjection()`

For SIP (Systematic Investment Plan), using the standard future value of
annuity formula:

$$\text{FV} = P \times \frac{(1+r)^n - 1}{r} \times (1+r)$$

Where:
- $P$ = monthly investment amount
- $r$ = monthly rate = `(annualReturn/100) / 12`
- $n$ = total months = `years × 12`
- The trailing `(1+r)` converts from an ordinary annuity to an annuity-due
  (payments at beginning of period)

Special case: if `r = 0` (zero return), `FV = P × n`.

For **Lumpsum**:

$$\text{FV} = P \times (1 + r_{\text{annual}})^{\text{years}}$$

The return rate used is auto-selected from historical data:
- `years ≤ 3`: use 3Y CAGR (or 1Y fallback)
- `years > 3`: use 5Y CAGR (or 3Y → 1Y fallback)
- User can override by supplying `expectedReturnPercent` in the request

---

## 15. Fund Metrics

The following metrics are actually implemented in `FundAnalyticsService`:

| Metric | Symbol | Implemented | Notes |
|--------|--------|-------------|-------|
| 1-Month Return | 1M | ✅ | `pctChange` |
| 3-Month Return | 3M | ✅ | `pctChange` |
| 6-Month Return | 6M | ✅ | `pctChange` |
| 1-Year Return | 1Y | ✅ | `pctChange` |
| 3-Year CAGR | 3Y | ✅ | `cagr` formula |
| 5-Year CAGR | 5Y | ✅ | `cagr` formula |
| Since Inception CAGR | inception | ✅ | `cagr` from first NAV |
| Annualized Volatility | σ | ✅ | Requires ≥252 data points |
| Sharpe Ratio | — | ✅ | Risk-free rate = 6.5% |
| Maximum Drawdown | — | ✅ | Peak-to-trough % |
| Alpha | α | ❌ Not implemented | Requires benchmark index data |
| Beta | β | ❌ Not implemented | Requires benchmark index data |
| Sortino Ratio | — | ❌ Not implemented | |
| Expense Ratio | — | ❌ Not implemented | Not in AMFI daily file |
| Upside / Downside Capture | — | ❌ Not implemented | |
| Rolling Returns | — | ❌ Not implemented | |

---

## 16. Recommendation Engine

### Architecture Overview

The recommendation engine has two distinct layers:

1. **Deterministic filter** — written in TypeScript, runs 100% of the logic
   except ranking. No AI involved. This ensures candidate quality.
2. **AI ranker (Gemini)** — receives only pre-filtered, real fund candidates.
   Ranks them by suitability. Cannot invent funds.

### Step-by-Step Pipeline

```
getEligibleFunds(universe, riskAppetite, timeHorizonYears):
  Start with full AMFI universe (~15k funds)

  Step 1 — Mandatory Direct Growth filter:
    schemeName must include "direct"
    schemeName must include "growth"
    schemeName must NOT include "regular", "idcw", "dividend"
    nav must be > 0

  Step 2 — Time horizon filter (category-based):
    < 3 years  → liquid, money market, ultra short, low duration,
                  short duration, overnight, arbitrage, conservative hybrid
    3–5 years  → hybrid, large cap, balanced advantage, equity savings,
                  multi asset, large & mid cap
    > 5 years  → flexi cap, large & mid cap, mid cap, small cap,
                  large cap, multi asset (adjusted by riskAppetite)
    (only narrows if filtered set has ≥ 4 funds)

  Step 3 — Risk appetite filter:
    low      → liquid, money market, short duration, conservative,
               balanced advantage, multi asset, equity savings, large cap, hybrid
    moderate → large cap, flexi cap, large & mid cap, multi asset,
               balanced advantage, hybrid, mid cap
    high     → flexi cap, large & mid cap, mid cap, small cap,
               large cap, multi asset, hybrid
    (only narrows if filtered set has ≥ 4 funds)

selectCandidatePool(eligible, riskAppetite, timeHorizonYears):
  Score each fund (base = 50):
    Horizon adjustments (+/-15 to +/-35 based on category fit)
    Risk adjustments (+/-15 to +/-25 based on category fit)
  Sort by score desc → take top 60 candidates

→ Send 60 candidates to Gemini with goal context

Gemini returns 4–6 ranked recommendations with:
  schemeCode, score(0-100), reason, suggestedAllocationPercent

Post-AI validation:
  Verify each schemeCode in candidate map (else skip)
  Verify "direct" AND "growth" in fund name (else skip)
  NavService.getLatestNav() — verify NAV available (else skip)
  Clamp score to [0, 100], allocation to [0, 100]

Require ≥ 4 valid recommendations (else throw)
Normalize allocations to exactly 100% (fix rounding in last item)

Save to DB (atomic: delete old → insert new)
```

### Scoring Formula

The `categorySuitabilityScore()` function computes a pre-AI score to rank
candidates before passing to Gemini. This determines which 60 funds Gemini
gets to choose from.

```
Base score = 50

Horizon component:
  < 3Y: liquid/money market/short duration → +35; small/mid/flexi cap → -30
  3-5Y: hybrid/balanced/multi asset/large cap → +25; small cap → -15
  > 5Y: flexi cap/large & mid → +25; small cap → +20 (high risk) or -10

Risk component:
  low risk:  liquid/hybrid/balanced → +15; small/mid cap → -25
  moderate:  large cap/flexi cap/balanced → +15
  high:      mid cap/small cap/flexi cap → +15

Final = clamp(score, 0, 100)
```

---

## 17. AI Architecture

### Provider

Google Gemini 2.5 Flash, via `@google/generative-ai` SDK.

### `callAI(prompt, mode)` — `src/backend/services/ai.service.ts`

The single entry point for all AI calls.

```typescript
callAI(prompt: string, mode: 'json' | 'text'): Promise<string>
```

- Creates a `GoogleGenerativeAI` instance on every call (not cached)
- Uses `model: 'gemini-2.5-flash'`
- `mode = 'json'` sets `responseMimeType: 'application/json'` — Gemini
  returns structured JSON directly, reducing parse failures
- Returns the raw text string — callers parse and validate

### Error Handling

The `callAI` wrapper maps Gemini-specific errors to clean user-facing messages:
- `429` / "quota" → `"AI API rate limit exceeded or quota exhausted."`
- `403` / "API key not valid" → `"AI API key is invalid or unauthorized."`
- Network errors → `"Network failure while communicating with AI service."`
- All others → `"AI error: <original message>"`

The API key is read from `process.env.GEMINI_API_KEY` at call time, not at
module initialization. This means if the key changes, no restart is needed.

### Where AI Is Used

| Feature | Service | AI Role | Rate Limit |
|---------|---------|---------|-----------|
| Fund Recommendations | `AIRecommendationService` | Rank pre-filtered candidates | 5/hour/user |
| Fund Insights | `FundAnalyticsService.getFundInsights()` | Analyze computed metrics | 10/hour/user |
| SIP Calculator | `FundAnalyticsService.calculateProjection()` | Not used — pure math | 30/hour/user (rate limit on calculator, not AI) |

### The Grounding Pattern

AI is never the source of financial facts. Before any AI call:

1. **Deterministic code computes the facts** (returns, risk metrics, eligible
   funds)
2. **Facts are embedded in the prompt** so AI has the real numbers
3. **AI interprets** — it writes the "why" narrative, not the numbers
4. **Post-AI validation** rejects any AI output that contradicts or invents
   data (e.g., a fund code not in the candidate map)

### AI Responses Cached

Fund insights are cached in Redis for **24 hours** per `schemeCode + goalId`
combination. Recommendations are not cached in Redis — they are persisted in
PostgreSQL and read directly.

### AI Assistant Page — Not Implemented

The `/assistant` page (`src/app/(dashboard)/assistant/page.tsx`) currently
renders only a placeholder. There is no conversational AI chat feature.

---

## 18. Redis & Caching

### Redis Client

`src/backend/infrastructure/redis/client.ts` — Singleton using ioredis.

```typescript
retryStrategy: max 3 retries, 50ms→2000ms delay, then null (stop retrying)
maxRetriesPerRequest: 1   // Fail fast on individual command failures
enableOfflineQueue: false  // Don't queue commands when Redis is down
```

When Redis is down, commands fail immediately (not queued). `CacheManager`
catches these failures and returns `null`, allowing the caller to fall back to
its database or external API.

### CacheManager

`src/backend/infrastructure/redis/cache/CacheManager.ts`

| Method | Behavior |
|--------|----------|
| `get<T>(key)` | `redis.get(key)` → `JSON.parse`. Returns `null` on any error. Never throws. |
| `set(key, value, ttlSeconds?)` | `redis.setex(key, ttl, JSON.stringify(value))`. Errors are caught and logged. |
| `delete(key)` | `redis.del(key)`. Errors are caught and logged. |

### Cache Keys (CacheKeys.ts)

```typescript
CacheKeys.userPortfolio(userId)    → 'user:{userId}:portfolio'
CacheKeys.userGoals(userId)        → 'user:{userId}:goals'
CacheKeys.userInsights(userId)     → 'user:{userId}:insights'
CacheKeys.aiQuery(userId, hash)    → 'ai:user:{userId}:query:{hash}'
CacheKeys.aiEducational(hash)      → 'ai:edu:{hash}'
CacheKeys.fundMetadata(fundId)     → 'fund:meta:{fundId}'
CacheKeys.fundHistoricalNav(id, y) → 'fund:nav:{fundId}:{year}'
CacheKeys.rollingReturns(id, p)    → 'analytics:rolling:{fundId}:{p}'
CacheKeys.recommendationProfile(h) → 'rec:profile:{hash}'
CacheKeys.rateLimitIp(ip, ep)      → 'ratelimit:ip:{ip}:{endpoint}'
CacheKeys.marketData(key)          → 'market:{key}'
```

Some keys in `CacheKeys.ts` (e.g., `fundHistoricalNav`, `rollingReturns`)
are not actively used by any service — they appear to be reserved for future
features.

### Cache Inventory

| Key Pattern | TTL | What Is Cached | Written By |
|-------------|-----|----------------|-----------|
| `user:{userId}:portfolio` | 300s (5 min) | Full PortfolioSummary with live NAV | `PortfolioService.getPortfolio()` |
| `user:{userId}:goals` | 300s (5 min) | User's goal list | `GoalService.getUserGoals()` |
| `nav:history:{schemeCode}` | 86400s (24h) | Array of `{date, nav}` from mfapi | `NavService._fetchHistoricalNav()` |
| `amfi:universe:parsed` | 43200s (12h) | `Record<schemeCode, LiveNAV>` | `NavService.getFundUniverse()` |
| `fund:details:{schemeCode}` | 3600s (60 min) | FundDetails with returns + risk | `FundAnalyticsService.getFundDetails()` |
| `fund:insights:{schemeCode}:{goalId}` | 86400s (24h) | FundInsights from AI | `FundAnalyticsService.getFundInsights()` |
| `ratelimit:ai_recommend:{userId}` | 3600s (1h) | Request count (int) | `AIRecommendationService` |
| `ratelimit:fund_insights:{userId}` | 3600s (1h) | Request count (int) | `FundAnalyticsService` |
| `ratelimit:calculator:{userId}` | 3600s (1h) | Request count (int) | `FundAnalyticsService` |
| `ratelimit:{identifier}` | window seconds | Counter (via INCR) | `RateLimiter.check()` |
| `ratelimit:auth:{ip}` | 900s (15 min) | Sorted set (sliding window) | `RateLimiter.isAllowed()` |
| `ai:recommend:{goalId}` | varies | AI explanation (dashboard) | Dashboard route |

### Rate Limiting Implementation

Two distinct rate limiters exist:

1. **`RateLimiter` (backend/infrastructure)** — Redis sorted-set sliding
   window. Used for auth rate limiting. `isAllowed(key, limit, window)` adds
   the current timestamp to a sorted set, removes old timestamps, and counts.

2. **`RateLimiter` (lib/rateLimit.ts)** — Fixed window with Redis INCR.
   Used by `withApiAuthAndError()` for general API rate limiting (200/15min).
   Falls back to an in-memory Map if Redis is down.

3. **CacheManager-based per-feature limiters** — Simple counter stored via
   `CacheManager.get/set`. Used for AI-specific limits (5/h recommendations,
   10/h insights, 30/h calculator).

### Redis Fallback Behavior

If Redis is unavailable:
- `CacheManager.get()` → returns `null` → service falls back to DB
- `CacheManager.set()` → fails silently (data not cached, no error to user)
- `RateLimiter.check()` → falls back to in-memory Map (per-process, not
  distributed — less accurate but prevents total failure)
- `RateLimiter.isAllowed()` → returns `true` (fail open — auth requests pass)

The application **does not crash** if Redis is unavailable. It becomes slower
(every request hits the DB or external API) but remains functional.

---

## 19. Frontend Architecture

### Next.js App Router

FinCal uses the App Router (introduced in Next.js 13). All files in `src/app/`
follow the convention: `page.tsx` = route page, `layout.tsx` = layout wrapper.

### Route Groups

`(dashboard)` is a **route group** — a directory with parentheses in the name.
It does not appear in the URL. Its purpose is to share the sidebar layout
(`layout.tsx`) across all dashboard pages without affecting URLs:
- `/dashboard` → `(dashboard)/dashboard/page.tsx`
- `/portfolio` → `(dashboard)/portfolio/page.tsx`
- `/funds` → `(dashboard)/funds/page.tsx`

### Server Components vs. Client Components

In the App Router, all components are **Server Components by default**.
A component becomes a **Client Component** when it has `'use client'` at the top.

| Component | Type | Reason |
|-----------|------|--------|
| `(dashboard)/layout.tsx` | Client | Uses `authClient.useSession()` React hook, `useState`, `useRouter` |
| `(dashboard)/funds/page.tsx` | Client | Uses `useState`, `useEffect`, `useSearchParams` for interactive search |
| `(dashboard)/portfolio/page.tsx` | Client | Uses `useState`, `useEffect` for dynamic data fetching |
| `(dashboard)/goals/page.tsx` | Client | Interactive form state |
| `(dashboard)/calculator/page.tsx` | Client | Interactive calculator inputs |
| `(dashboard)/assistant/page.tsx` | Server | Static placeholder page |
| `login/page.tsx` | Client | Form state (`useState`), `useRouter` |

Most FinCal pages are Client Components because they rely on browser-side
`fetch()` calls after mount. A future optimization could use Server Components
with server-side fetching for initial data, then hydrate for interactivity.

### Data Fetching Pattern

The pattern used throughout is:

```typescript
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    const res = await fetch('/api/portfolio');
    const json = await res.json();
    setData(json.data);
    setLoading(false);
  };
  loadData();
}, [dependencies]);
```

This is straightforward but not ideal — Server Components could fetch data
directly without needing an API round-trip for initial render.

### Navigation

The sidebar (`DashboardLayout`) links to:
- `/dashboard` — overview
- `/portfolio` — holdings + P&L
- `/goals` — goal management
- `/funds` — fund explorer
- `/calculator` — SIP/Lumpsum projections
- `/assistant` — placeholder
- `/settings` — user preferences

### Loading States

Skeleton placeholders (animated `animate-pulse` divs) are shown while data
loads. Error states display a message with a retry option.

### Empty States

When a portfolio has no holdings, or no goals exist, pages render an
informative empty state with a call-to-action.

### Charts

Recharts is used for all data visualizations:
- Portfolio value history (line chart)
- Asset/category/AMC allocation (pie/doughnut charts)
- NAV history for individual funds (line chart)

### Pagination

The Fund Explorer implements client-side pagination: page and limit are
passed as query parameters to `GET /api/funds`. The API returns only the
requested slice of the AMFI universe.

---

## 20. Error Handling

### API Errors

All protected routes are wrapped by `withApiAuthAndError()`. Errors are
categorized:

| Error Type | HTTP Status | Response |
|------------|-------------|---------|
| No session cookie | 401 | `{ success: false, error: "Unauthorized" }` |
| Rate limit exceeded | 429 | `{ success: false, error: "Too Many Requests" }` + `Retry-After` header |
| Zod validation failure | 400 | `{ success: false, error: "Validation Error", details: [...] }` |
| Business logic error (thrown) | 500 | `{ success: false, error: "<message>" }` |
| Unhandled exception | 500 | `{ success: false, error: "Internal Server Error" }` |

### Redis Failures

All `CacheManager` operations catch Redis errors internally. A Redis failure
never propagates to the caller — the caller receives `null` from `get()` and
no error from `set()/delete()`.

### External API Failures

**mfapi.in**: `NavService._fetchFromMfapi()` returns `null` on any failure.
The caller falls through to the AMFI fallback.

**AMFI**: `NavService.getNavFromAmfi()` throws on fetch failure but is
caught by the caller which returns `navUnavailable: true`.

**Gemini**: `callAI()` maps HTTP errors to clean messages. The caller
propagates these to the API response.

### Database Errors

Prisma throws typed errors. The `withApiAuthAndError()` wrapper catches all
exceptions and returns `500`. Specific Prisma errors (e.g.,
`P2025 Record not found`) are not currently handled with custom status codes.

### NAV Unavailable

When `navUnavailable: true` is returned from `NavService.getLatestNav()`:
- `PortfolioService` falls back to the stored `currentValue` DB column (last
  known good value) to prevent showing fake losses
- The holding UI renders a warning indicator
- The portfolio total still includes the holding using the fallback value

---

## 21. Security

### Implemented

| Control | Implementation |
|---------|---------------|
| Session-based authentication | Better Auth cookie (HttpOnly, Secure in prod) |
| Route protection (page routes) | Next.js Middleware reads cookie, redirects to `/login` |
| Route protection (API routes) | `withApiAuthAndError()` validates session before handler |
| User ownership enforcement | All queries filter by `userId` (goals, holdings, recommendations) |
| Input validation | Zod schemas at API boundary (`addHoldingSchema`, `goalSchema`, etc.) |
| API rate limiting | 200 req / 15 min per user (Redis INCR, in-memory fallback) |
| AI rate limiting | 5/hour (recommendations), 10/hour (insights) per user (CacheManager) |
| Auth rate limiting | 10 auth requests / 15 min per IP (sliding window sorted set) |
| Environment variables | Secrets in `.env`, never in source code |
| Security HTTP headers | `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `X-XSS-Protection` |
| CORS for Better Auth | `Access-Control-Allow-Origin` set to `BETTER_AUTH_URL` |
| Cron endpoint | Bearer token (`CRON_SECRET`) required |
| NAV sanity check | Rejects NAV ≤ 0 or NAV > 1,000,000 |
| AI fund validation | Rejects any AI-recommended schemeCode not in pre-built candidate map |
| bcrypt | Better Auth handles password hashing internally |

### Limitations

- **No CSRF protection** beyond cookie-based sessions (Better Auth handles
  this implicitly via same-origin cookie rules, but explicit CSRF tokens are
  not implemented)
- **No account lockout** after failed login attempts (rate limiting exists,
  but no hard lockout)
- **No email verification** (the `emailVerified` field exists in the DB, but
  no email verification flow is implemented)
- **No password reset flow** (the UI has a "Forgot password?" link but it
  does not function)
- **Middleware is cookie-presence only** — the middleware reads the cookie
  name to decide if a user "looks authenticated." Full token validation
  happens inside the API route handlers. This means an expired or forged
  cookie would pass middleware but fail at the API level.

---

## 22. Environment Variables

Never put actual secret values in this file or the repository.

### Database

```env
DATABASE_URL=postgresql://user:password@host:5432/fincal?schema=public
```

PostgreSQL connection string. In production, typically a Neon serverless
PostgreSQL connection string.

### Authentication

```env
BETTER_AUTH_SECRET=at-least-32-character-random-string
BETTER_AUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

- `BETTER_AUTH_SECRET` — used to sign session tokens. Rotate this to
  invalidate all sessions.
- `BETTER_AUTH_URL` — canonical deployment URL. Must match the actual
  domain. CORS errors occur if mismatched.
- `NEXT_PUBLIC_APP_URL` — same as `BETTER_AUTH_URL`. Used by the client-side
  auth library for SSR requests.

### Redis

```env
REDIS_URL=redis://localhost:6379
```

Optional. If not set, the Redis client connects to `localhost:6379` by
default. If Redis is unavailable, the app degrades gracefully (slower, no
cache, in-memory rate limiting).

### AI

```env
GEMINI_API_KEY=your-google-ai-api-key
```

Required for the recommendation engine and fund insights. The app throws a
`500` error on AI endpoints if this is missing.

### Cron Job

```env
CRON_SECRET=random-secret-for-ingest-endpoint
```

Optional. Used to authenticate `GET /api/nav/ingest`. In local development,
the endpoint accepts `Authorization: Bearer dev-secret-key` as a fallback.

### Telemetry

```env
NEXT_TELEMETRY_DISABLED=1
```

Disables Next.js telemetry collection.

---

## 23. Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL (local or cloud — Neon free tier works)
- Redis (optional — app works without it, just slower)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd fincal

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL,
# NEXT_PUBLIC_APP_URL, GEMINI_API_KEY

# 4. Generate Prisma client
npm run prisma:generate

# 5. Push schema to database (creates tables)
npm run prisma:push
# OR run migrations if you have a migration history:
# npm run prisma:migrate

# 6. Start development server
npm run dev
```

The app runs at `http://localhost:3000`.

### NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `NODE_OPTIONS=--dns-result-order=ipv4first next dev` | Development server with hot reload. The DNS option forces IPv4 to avoid connection issues with PostgreSQL on some systems. |
| `npm run build` | `prisma generate && next build` | Production build. Always regenerates Prisma client first. |
| `npm run start` | `next start` | Start production server after build |
| `npm run lint` | `eslint src` | Run ESLint |
| `npm run prisma:generate` | `prisma generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:push` | `prisma db push` | Push schema to DB (no migration files) |
| `npm run prisma:migrate` | `prisma migrate dev` | Create and apply a migration |

### Triggering the NAV Ingest Locally

```bash
curl -X POST http://localhost:3000/api/nav/ingest \
  -H "Authorization: Bearer dev-secret-key"
```

This populates the `LatestNAV` table. Without this, NAV requests fall back to
mfapi.in on every request.

---

## 24. Database Development Workflow

### Understanding the Three States

```
Schema (prisma/schema.prisma)
    ↕ (prisma generate)
Prisma Client (node_modules/.prisma/client)
    ↕ (prisma migrate dev / prisma db push)
PostgreSQL Database
```

### `prisma generate`

**When to use**: After any change to `schema.prisma`.

**What it does**: Reads `schema.prisma` and generates TypeScript types and
the database client in `node_modules/.prisma/client`. Does NOT touch the
database.

**Important**: The production `build` script runs `prisma generate` first
because Vercel's deployment creates a fresh `node_modules` that may not have
the generated client.

### `prisma db push`

**When to use**: During **rapid development** when you want to apply schema
changes to the database without creating migration files.

**What it does**: Introspects the current schema, diffs it against the
database, and applies the changes directly. Does not create migration files.
Can be destructive on existing data if columns are removed.

**When NOT to use**: Production databases or when you need a migration history
for rollbacks.

### `prisma migrate dev`

**When to use**: Any time you want a permanent record of a schema change.

**What it does**:
1. Compares current schema to last migration
2. Creates a new SQL migration file in `prisma/migrations/`
3. Applies the migration to the database
4. Regenerates the Prisma client

The migration files are committed to git, giving you a full history of schema
evolution.

### `prisma db pull`

**When to use**: When you want to generate a schema from an existing database.

**What it does**: Connects to the database and reverse-engineers the current
state into `schema.prisma`. Useful when the database is the source of truth
(e.g., shared production database).

### `prisma studio`

**When to use**: Inspecting or editing data during development.

```bash
npx prisma studio
```

Opens a web UI at `http://localhost:5555` for browsing and editing database
records directly.

---

## 25. Testing

### Test Framework

Vitest (`^4.1.10`) with `vitest-mock-extended` for mock generation.

### Test Files

```
src/__tests__/
├── NavService.test.ts           # Unit tests for NavService (largest test file)
├── setup.ts                     # Global test setup
└── api/
    ├── ai.test.ts
    ├── dashboard.test.ts
    ├── funds.test.ts
    ├── goals.id.test.ts
    ├── goals.test.ts
    ├── market-data.test.ts
    ├── nav-ingest.test.ts       # Tests for the NAV ingest endpoint
    ├── portfolio.holdings.test.ts
    ├── portfolio.test.ts
    └── recommendations.test.ts
```

### What Is Tested

- **`NavService.test.ts`**: Unit tests for `parseAmfiText`, `calculateCagr`,
  `searchFunds`, `getLatestNav` with mocked external fetches.
- **API integration tests**: All API endpoints are tested using mocked Prisma
  and Redis. Tests verify authentication requirements, validation errors, and
  success responses.

### What Is NOT Tested

- E2E tests (no Playwright/Cypress setup)
- Full integration tests against a real database
- `FundAnalyticsService` calculation correctness (no unit tests for return
  calculations, Sharpe, max drawdown)
- `AIRecommendationService` pipeline
- Frontend components (no React testing library setup)

**Testing coverage currently needs improvement.** The most critical missing
tests are unit tests for `FundAnalyticsService.calculateReturns()`,
`calculateRiskMetrics()`, and `PortfolioService.getPortfolio()`.

### Running Tests

```bash
npx vitest run           # Run all tests once
npx vitest               # Watch mode
npx vitest --coverage    # With coverage report
```

---

## 26. Build & Deployment

### Production Build

```bash
npm run build
# = prisma generate && next build
```

The build step:
1. Regenerates the Prisma client (required on Vercel because `node_modules/.prisma` is not committed)
2. Compiles TypeScript, bundles client/server code
3. Generates static pages where possible

### Vercel Deployment

The project is configured for Vercel:

**`vercel.json`**:
```json
{
  "crons": [
    { "path": "/api/nav/ingest", "schedule": "30 14 * * *" }
  ]
}
```

This configures Vercel Cron to call `GET /api/nav/ingest` daily at 14:30 UTC
(approximately 20:00 IST — after AMFI publishes daily NAVs). The Cron job is
free on Vercel's Hobby plan.

**`next.config.mjs`**:
- `serverExternalPackages: ['@prisma/client', 'prisma', 'ioredis']` — prevents
  Next.js from trying to bundle native binaries
- `outputFileTracingIncludes` — ensures Prisma's query engine binary is
  included in the Vercel deployment bundle

### Required Environment Variables for Production

At minimum:
- `DATABASE_URL` (PostgreSQL connection string)
- `BETTER_AUTH_SECRET` (random, at least 32 chars)
- `BETTER_AUTH_URL` (exact production URL, no trailing slash)
- `NEXT_PUBLIC_APP_URL` (same as `BETTER_AUTH_URL`)
- `GEMINI_API_KEY`
- `REDIS_URL` (optional but strongly recommended)
- `CRON_SECRET` (required for secure NAV ingest)

### Docker

A `Dockerfile` and `docker-compose.yml` are present for containerized
deployment. Docker support is configured but not the primary deployment target.

---

## 27. Performance

### Current Mechanisms

| Mechanism | Implementation |
|-----------|---------------|
| Portfolio caching | Redis, 5-minute TTL. Portfolio is not recomputed on every request. |
| AMFI universe caching | Redis, 12-hour TTL. ~3MB universe parsed once, served from memory. |
| Historical NAV caching | Redis, 24-hour TTL. Immutable once published. |
| Fund details caching | Redis, 60-minute TTL. Returns + risk recomputed hourly, not per-request. |
| AI insights caching | Redis, 24-hour TTL. Expensive Gemini calls cached aggressively. |
| Concurrent NAV batch | `NavService.batchGetLatestNavs()` fetches 5 at a time in parallel. |
| In-flight deduplication | Single fetch per uncached schemeCode at process level. |
| DB write as side-effect | `currentValue` in `UserHolding` updated fire-and-forget to avoid blocking. |
| PostgreSQL LatestNAV | Eliminates external API calls for all scheme codes in DB (the majority after first ingest). |
| Pagination | Fund Explorer paginates AMFI universe in-memory (page × limit slice). |
| Prisma singleton | One Prisma client instance for the process lifetime (not recreated per request). |
| Redis singleton | One ioredis connection per process. |
| Connection pooling | Managed by Prisma (PrismaClient handles pool internally). |

### DNS Resolution

`NODE_OPTIONS=--dns-result-order=ipv4first` is set for the `dev`, `build`,
and `start` scripts. This forces IPv4-first DNS resolution, which can
prevent connection failures to PostgreSQL and Redis on systems where IPv6
resolution is slower or broken.

### Potential Future Improvements

- **Server Components for initial data**: Convert dashboard and portfolio
  pages to Server Components so initial data is server-rendered, not fetched
  after mount. This would eliminate the loading spinner on first visit.
- **Distributed in-flight deduplication**: Replace the process-level Map with
  Redis-backed locks (e.g., Redlock) for correctness in multi-instance
  deployments.
- **Database indexes**: Add composite indexes on `Goal(userId, createdAt)`,
  `AIRecommendation(goalId, score)` for faster sorted queries.
- **Portfolio snapshots automation**: A daily cron job to write
  `PortfolioSnapshot` rows would enable the historical value chart.
- **Edge caching**: For public data (fund list, fund details) without user
  context, Vercel Edge Cache could serve responses without hitting the server.
- **Webhook-based NAV invalidation**: Instead of TTL-based cache expiry,
  invalidate on AMFI update events.
- **Read replicas**: For scaling database reads, add a PostgreSQL read replica
  for `SELECT` queries (especially `LatestNAV` lookups).

---

## 28. Architectural Decisions

### Next.js App Router

**Decision**: Use Next.js 15+ with the App Router.

**Reason**: App Router enables co-located server and client code, nested
layouts (the dashboard sidebar), and built-in API routes — eliminating the
need for a separate Express/Fastify backend.

**Benefit**: Single repository, single deployment, TypeScript end-to-end.

**Tradeoff**: Mixing server and client components requires discipline about
which code runs where. `'use client'` boundaries must be carefully managed.

### Repository / Service Separation

**Decision**: Repositories handle database access. Services contain business
logic. API routes call services, not repositories directly (mostly).

**Reason**: This separation means:
- Services can be unit-tested without a database (mock the repository)
- Switching from Prisma to another ORM only affects repositories
- Business logic (e.g., P&L calculation) is not duplicated across API routes

**Current reality**: `PortfolioService` directly uses `prisma` for some
queries rather than going through `PortfolioRepository`. This is a pragmatic
shortcut — the repository pattern is consistently applied in `GoalRepository`
and `LatestNavRepository`.

### Pure NAV Service

**Decision**: `NavService` performs no Redis caching for the latest NAV
directly — instead, `LatestNavRepository` abstracts the PostgreSQL storage
and `CacheManager` is called explicitly in the services that need it.

**Reason**: Separates concerns. The repository does not know about caching
policy. The service decides what to cache and for how long.

### AI Cannot Be the Source of Fund Facts

**Decision**: The eligibility filter runs before Gemini. Gemini receives
only real, validated funds. Post-AI validation rejects any fund code not in
the candidate map.

**Reason**: LLMs can hallucinate. A hallucinated scheme code would result in
users attempting to invest in funds that don't exist or are wrong funds with
the right name. The cost of one extra filter step is negligible compared to
the risk.

### LatestNAV as PostgreSQL Table (Not Redis-Only)

**Decision**: Store the current NAV for every scheme in PostgreSQL, not
just in Redis.

**Reason**: Redis is ephemeral. If Redis restarts, the AMFI universe cache
is lost and every request would need to call AMFI (a slow, large file).
PostgreSQL provides a durable, fast primary source for the ~15,000 rows.

### Historical NAV in Redis (Not PostgreSQL)

**Decision**: Historical NAV series are NOT stored in PostgreSQL.

**Reason**: ~15,000 schemes × 3,650 days (10 years) = 54 million rows. This
would exceed a free-tier database's limits and make NAV queries expensive.
Redis with a 24h TTL is sufficient because the data is immutable once
published.

### Single Portfolio Per User

**Decision**: One `Portfolio` record per user (1:1).

**Reason**: Simplicity. Multi-portfolio support (e.g., separate portfolios
for self and spouse) would require significant UI and data model complexity
for a feature with unclear demand at this stage.

### Redis Fail-Open Policy

**Decision**: All Redis failures are caught. The app falls back to slower
but correct behavior (DB queries, in-memory rate limiting).

**Reason**: A caching layer should never be a point of failure. Redis is a
performance optimization, not a critical dependency.

### Zod at the API Boundary

**Decision**: All API inputs are validated with Zod before reaching service
layer code.

**Reason**: TypeScript only provides compile-time safety. At runtime, API
inputs are `unknown`. Zod catches malformed data at the boundary with clear
error messages, preventing corrupt data from reaching the database.

---

## 29. Known Limitations

| Limitation | Impact | Notes |
|------------|--------|-------|
| No XIRR implementation | Portfolio returns are simple CAGR, not time-weighted. | Planned but not implemented. |
| No transaction history | Users cannot see individual buy/sell history. | Only the current holding state is stored. |
| No portfolio snapshots automation | Historical portfolio value chart will be empty. | `PortfolioSnapshot` schema exists but no writer. |
| No goal progress tracking | GoalProgress entries are never automatically created. | Schema exists, UI shows progress only if data exists. |
| AI Assistant is a placeholder | `/assistant` page has no functionality. | Renders static text only. |
| No email verification | Users can register with unverified emails. | `emailVerified` field exists but flow not implemented. |
| No password reset | "Forgot password?" link does nothing. | Not implemented. |
| No OAuth login | Only email/password authentication. | Google/GitHub OAuth planned. |
| In-flight dedup is process-level only | Multiple Vercel function instances won't share dedup state. | Acceptable at current scale. |
| AMFI category matching is string-based | Category filter uses `includes()` checks. | Brittle if AMFI changes category naming. |
| No alpha/beta/Sortino | Only volatility, Sharpe, max drawdown are implemented. | Benchmark data needed. |
| `PortfolioRepository` largely unused | `PortfolioService` queries Prisma directly. | Repository pattern not consistently applied. |
| No CI/CD pipeline | Deployments are manual push to Vercel. | No automated testing on PR. |
| Limited test coverage | No tests for financial calculations. | Critical gap for a financial application. |
| `UserRepository` is a stub | Empty class body. | Not used anywhere. |

---

## 30. Future Roadmap

### Implemented ✅

- Full authentication (email/password, sessions)
- User onboarding + investor profile
- Portfolio management (add/update/delete holdings with live NAV)
- P&L computation against live NAVs
- Fund Explorer (search, paginate, AMFI universe)
- Fund Details (returns: 1M/3M/6M/1Y/3Y/5Y/inception, risk: volatility/Sharpe/max drawdown)
- AI Fund Insights (Gemini, grounded in computed metrics)
- Goal creation with financial parameters
- AI Fund Recommendations (per goal, filtered + ranked)
- SIP / Lumpsum projection calculator
- Daily AMFI NAV ingest (Vercel Cron)
- Redis caching + rate limiting
- Health check endpoint

### Partially Implemented ⚠️

- **Portfolio snapshots**: Schema + dashboard query exist. No writer.
- **Goal progress**: Schema + dashboard query exist. No automatic updates.
- **AI Assistant chat**: Route + sidebar link exist. Page is a placeholder.
- **Settings page**: Basic profile updates work. UI is minimal.

### Planned ❌

- XIRR portfolio return calculation
- Portfolio overlap analysis across holdings
- Transaction history (separate buy/sell log)
- Monte Carlo probability engine
- Email verification flow
- Password reset flow
- OAuth login (Google, GitHub)
- Background job queue (BullMQ) for heavy AI tasks
- Alpha, Beta, Sortino ratio metrics
- Rolling return calculations
- Automated portfolio snapshots (daily cron)
- E2E test suite (Playwright)
- Unit tests for all financial calculations

---

## 31. Learning Guide

Follow this order to deeply understand the codebase from first principles.

---

### Step 1 — Understand the Business Domain

**Read first**: This README (sections 1 and 2).

**Files to open**: `src/lib/constants.ts`

**What you should understand**: What is NAV? What is a mutual fund scheme?
What is a SIP? What is a goal? What is risk appetite? What does P&L mean?

**Question to answer**: Why does FinCal exist? What user problem does it solve
that existing platforms don't?

---

### Step 2 — Understand the Database Schema

**Files to open**: `prisma/schema.prisma`

**What you should understand**: Every model, every field, every relationship.
Why is `LatestNAV` keyed by `schemeCode` and not UUID? Why is `navDate`
stored as a `String`? Why is there no `Transaction` model?

**Question to answer**: How does a `User` connect to their `Portfolio`?
How does a `Goal` connect to its `AIRecommendation`?

---

### Step 3 — Understand Authentication

**Files to open**:
- `src/lib/auth.ts` — server configuration
- `src/lib/auth-client.ts` — client usage
- `src/middleware.ts` — route protection
- `src/app/login/page.tsx` — login UI

**What you should understand**: What cookie does Better Auth set? What does
the middleware check? Where is the full session validated?

**Question to answer**: What happens if the session cookie is present but
the session has expired in the database?

---

### Step 4 — Understand the API Pattern

**Files to open**:
- `src/lib/apiWrapper.ts` — the wrapper
- `src/app/api/portfolio/route.ts` — typical route usage
- `src/app/api/portfolio/holdings/route.ts` — POST route

**What you should understand**: What does `withApiAuthAndError()` do?
What is the consistent response envelope? What HTTP status codes are used?

**Question to answer**: If a Zod schema validation fails, what does the
user receive?

---

### Step 5 — Understand the Services

**Files to open** (in this order):
- `src/backend/services/GoalService.ts` — simplest service
- `src/backend/services/PortfolioService.ts` — medium complexity
- `src/backend/services/NavService.ts` — highest complexity

**What you should understand**: What is the layering? What does each service
know about? Why does `NavService` not directly read Redis — it delegates to
`CacheManager`?

**Question to answer**: If `NavService.getLatestNav("120503")` is called and
the `LatestNAV` table is empty, what happens step by step?

---

### Step 6 — Understand Repositories

**Files to open**:
- `src/backend/repositories/LatestNavRepository.ts` — most important
- `src/backend/repositories/GoalRepository.ts`
- `src/backend/infrastructure/database/client.ts`

**What you should understand**: Why do repositories exist as a separate
layer? What is `prismaClientSingleton()`? Why does it use `globalThis`?

**Question to answer**: Why does the Prisma client use a singleton pattern?
What would happen without it in a Next.js development environment?

---

### Step 7 — Understand the Fund Data Pipeline

**Files to open**:
- `src/backend/services/NavService.ts` — full file
- `src/app/api/nav/ingest/route.ts` — ingest endpoint
- `src/backend/repositories/LatestNavRepository.ts` — upsertMany

**What you should understand**: Where does NAV data come from? What is the
AMFI file format? How are batches of 500 handled in the upsert? What happens
if the cron job fails?

**Question to answer**: If the Vercel Cron fails for two days, what does a
user see when they view their portfolio? Is data stale?

---

### Step 8 — Understand Portfolio Calculations

**Files to open**:
- `src/backend/services/PortfolioService.ts` — full file

**What you should understand**: How is P&L computed? Why is `currentValue`
updated fire-and-forget? What happens if 10 concurrent portfolio requests
arrive?

**Question to answer**: If a user has 20 holdings, how many database queries
does a single `GET /api/portfolio` make?

---

### Step 9 — Understand Redis / Caching

**Files to open**:
- `src/backend/infrastructure/redis/client.ts`
- `src/backend/infrastructure/redis/cache/CacheManager.ts`
- `src/backend/infrastructure/redis/cache/CacheKeys.ts`
- `src/lib/rateLimit.ts`

**What you should understand**: Why is Redis configured with
`enableOfflineQueue: false`? What is the difference between the two
`RateLimiter` classes? What is the fallback when Redis is down?

**Question to answer**: If Redis goes down during peak traffic, what is the
user experience? What breaks? What still works?

---

### Step 10 — Understand the Recommendation Engine

**Files to open**:
- `src/backend/services/AIRecommendationService.ts` — full file

**What you should understand**: Read the 15-step pipeline. Understand why
eligibility filtering happens before Gemini. Understand the post-AI
validation loop. Understand allocation normalization.

**Question to answer**: If Gemini returns a valid JSON response containing a
`schemeCode` that wasn't in the candidate map, what happens?

---

### Step 11 — Understand the AI Layer

**Files to open**:
- `src/backend/services/ai.service.ts`
- `src/backend/services/FundAnalyticsService.ts` — `getFundInsights()` method

**What you should understand**: What is the model? What is JSON mode?
How does the prompt include real computed data? Why can't AI change the numbers?

**Question to answer**: What financial data does Gemini receive in the Fund
Insights prompt? Who computed that data?

---

### Step 12 — Understand the Frontend

**Files to open**:
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/funds/page.tsx`
- `src/app/(dashboard)/portfolio/page.tsx`

**What you should understand**: What does the route group `(dashboard)` do?
Why is the layout a Client Component? What is the data fetching pattern?

**Question to answer**: When a user lands on `/portfolio`, does the browser
need to make an API call to get data, or is it server-rendered?

---

### Step 13 — Understand Complete User Flows

Trace these flows end-to-end through the code (middleware → API → service →
repository → DB):

1. **Register** → `POST /api/auth/sign-up/email` → Better Auth
2. **Add a holding** → `POST /api/portfolio/holdings` → `PortfolioService.addHolding`
3. **Generate recommendations** → `POST /api/recommendations` → `AIRecommendationService.generateRecommendations`

---

## 32. Interview Questions

These questions test deep understanding of the actual FinCal architecture.

### Database

1. **Why is `schemeCode` the primary key of `LatestNAV` instead of a UUID?**
   Because one scheme has exactly one current NAV, and UPSERT by scheme code
   allows the same row to be overwritten daily without deleting/inserting.
   UUID would require a separate unique index and more complex upsert logic.

2. **Why is `navDate` stored as a `String` in PostgreSQL?**
   To avoid timezone ambiguity. `DateTime` would be interpreted relative to
   the server timezone, potentially shifting a "16-Aug-2026" NAV date to
   "15-Aug-2026" UTC. As a string, it's stored and returned exactly as
   published by AMFI.

3. **Why doesn't FinCal have a `Transaction` model?**
   It's not implemented yet. The current model stores only the current holding
   state (units, average NAV). Buy/sell transaction history is planned but not
   built.

4. **What is the cascade behavior of deleting a User?**
   Cascades to: `Session`, `Account`, `UserPreferences`, `InvestorProfile`,
   `Portfolio` (which cascades to `UserHolding` and `PortfolioSnapshot`),
   `Goal` (which cascades to `GoalProgress` and `AIRecommendation`),
   `AIInsightHistory`.

### Redis

5. **What exactly does Redis cache?**
   Portfolio summaries (5 min), AMFI fund universe (12h), historical NAV
   series (24h), fund details with computed metrics (60 min), AI fund insights
   (24h), and rate limit counters.

6. **What happens if Redis goes down?**
   The app continues running. `CacheManager.get()` returns `null`. Services
   fall through to PostgreSQL and external APIs. Rate limiting falls back to
   per-process in-memory Maps (less accurate but functional). AI insights and
   fund details become slower (recomputed every request) but not unavailable.

7. **Why is `enableOfflineQueue: false` set in the Redis client?**
   If Redis is down and commands are queued, they would all execute when Redis
   comes back, potentially causing a burst of delayed operations. Failing fast
   allows the application to immediately use its fallback path.

### NAV Data

8. **How does NAV data enter the system?**
   Via a daily Vercel Cron job at 14:30 UTC that calls `GET /api/nav/ingest`.
   The endpoint fetches the AMFI NAVAll.txt file (~3MB), parses ~15k schemes,
   and upserts them into the `LatestNAV` PostgreSQL table in 500-row batches.

9. **What happens if the daily ingest fails?**
   The `LatestNAV` table retains yesterday's NAV data. `NavService.getLatestNav()`
   will still return the most recent row from PostgreSQL. The NAV shown will
   be one day stale. For mfapi.in, the fallback will return the live NAV if
   mfapi is available.

10. **How does in-flight request deduplication work?**
    `NavService` maintains a `Map<schemeCode, Promise<LiveNAV>>`. The first
    call for an uncached schemeCode starts a fetch and stores the Promise in
    the Map. Subsequent concurrent calls for the same code return the same
    Promise. When the Promise settles, the Map entry is deleted.

### Portfolio

11. **How is portfolio current value calculated?**
    `currentValue = units × currentNav` per holding. `currentNav` is fetched
    live from the `LatestNAV` PostgreSQL table (or mfapi.in as fallback).
    The total is the sum across all holdings. This is computed during
    `getPortfolio()`, not stored as a persistent figure.

12. **How does adding a holding work when the user provides an amount instead of units?**
    `units = amount / currentNav`. The current NAV is fetched from
    `NavService.getLatestNav()`. If NAV is unavailable and no `purchaseNav`
    was supplied, the API throws an error.

13. **Why is `currentValue` in `UserHolding` updated fire-and-forget?**
    To prevent a slow DB write from blocking the API response. The update is
    a best-effort cache of the last known current value. If it fails, the
    DB column becomes stale but the live calculation in memory is still correct.

### Recommendations

14. **How do you prevent AI from inventing mutual funds?**
    The eligibility filter runs before Gemini. Gemini receives only scheme
    codes that exist in the current AMFI universe. After Gemini responds, each
    scheme code is validated against the candidate Map. Any code not present
    is silently dropped. Additionally, fund names are re-validated for
    "direct" + "growth" keywords.

15. **How is the allocation percentage normalized to 100%?**
    After collecting Gemini's percentages, the service sums them. Each
    percentage is divided by the total and multiplied by 100. The last item
    absorbs the rounding difference to ensure the sum is exactly 100%.

16. **What happens if Gemini returns fewer than 4 valid recommendations?**
    `AIRecommendationService` throws an error: "The AI did not produce enough
    valid mutual fund recommendations." The old recommendations in the DB are
    NOT deleted (the delete happens inside a transaction after validation
    passes).

### Authentication

17. **How does FinCal prevent users from accessing another user's portfolio?**
    Every query includes `userId` in the `where` clause. `GoalRepository`
    uses `findFirst({ where: { id, userId } })`. `PortfolioService` loads the
    portfolio by `userId` and verifies `holding.portfolioId === portfolio.id`
    before allowing updates.

18. **What is the difference between the middleware session check and the API wrapper check?**
    Middleware reads the cookie name only — fast, but does not validate the
    session against the database. This prevents unnecessary DB hits for clearly
    unauthenticated requests. The `withApiAuthAndError()` wrapper calls
    `auth.api.getSession()` which validates the token against the `Session`
    table — slower but authoritative.

### Scaling

19. **How would you scale this application to 1 million users?**
    Key bottlenecks:
    - **PostgreSQL**: Move to a managed cluster (PlanetScale, Neon paid tier).
      Add read replicas. Partition `LatestNAV` by AMC for faster scans.
    - **Redis**: Replace single instance with Redis Cluster or managed Redis
      (Upstash, Elasticache). Implement distributed Redlock for in-flight
      deduplication.
    - **NAV ingest**: The single cron job ingesting 15k schemes in 500-row
      batches works at small scale. For 1M users, consider Kafka-backed event
      streaming per scheme.
    - **AI calls**: At scale, AI insights would need a queue (BullMQ) to
      prevent concurrent Gemini requests from exhausting the quota.
    - **Server Components**: Converting client-fetched pages to SSR with
      streaming would improve TTFB significantly.

20. **What is the biggest performance bottleneck right now?**
    A cold portfolio request (cache miss) for a user with 20 holdings requires:
    one portfolio DB query, 20 concurrent NAV lookups (from PostgreSQL or
    external API), 20 fire-and-forget DB writes, one portfolio total update,
    and one Redis set. The NAV batch is parallelized (5 at a time), but the
    overall time depends on PostgreSQL round-trip latency × 4 rounds.

---

## 33. Key Files Reference

### Architecture

| File | Why It Matters |
|------|---------------|
| [src/middleware.ts](src/middleware.ts) | Every HTTP request passes through this. Defines all protected routes. |
| [src/lib/apiWrapper.ts](src/lib/apiWrapper.ts) | The central nerve of the API layer. Authentication, rate limiting, error handling in one place. |
| [src/lib/auth.ts](src/lib/auth.ts) | Better Auth server configuration. Session duration, trusted origins, cookie settings. |
| [next.config.mjs](next.config.mjs) | Next.js configuration. Why Prisma and ioredis are external packages. Security headers. |
| [vercel.json](vercel.json) | Vercel Cron configuration. The NAV ingest schedule. |

### Database

| File | Why It Matters |
|------|---------------|
| [prisma/schema.prisma](prisma/schema.prisma) | The complete database schema. Source of truth for all data shapes. |
| [src/backend/infrastructure/database/client.ts](src/backend/infrastructure/database/client.ts) | Prisma singleton. The global pattern prevents client duplication in dev. |
| [src/backend/repositories/LatestNavRepository.ts](src/backend/repositories/LatestNavRepository.ts) | Upsert logic for the NAV table. Chunked transactions. |

### Authentication

| File | Why It Matters |
|------|---------------|
| [src/lib/auth.ts](src/lib/auth.ts) | Better Auth server instance — the authoritative auth configuration. |
| [src/lib/auth-client.ts](src/lib/auth-client.ts) | Better Auth client — used in all client components. |
| [src/app/login/page.tsx](src/app/login/page.tsx) | Example of `authClient.signIn.email()` usage. |

### Portfolio

| File | Why It Matters |
|------|---------------|
| [src/backend/services/PortfolioService.ts](src/backend/services/PortfolioService.ts) | All portfolio business logic: P&L, allocation, holding CRUD. |
| [src/app/api/portfolio/route.ts](src/app/api/portfolio/route.ts) | GET / DELETE portfolio endpoints. |
| [src/app/api/portfolio/holdings/route.ts](src/app/api/portfolio/holdings/route.ts) | POST holding endpoint. |
| [src/shared/dtos/portfolio.dto.ts](src/shared/dtos/portfolio.dto.ts) | Zod schemas for portfolio operations. |

### Funds

| File | Why It Matters |
|------|---------------|
| [src/backend/services/NavService.ts](src/backend/services/NavService.ts) | The most critical service. NAV resolution, AMFI parsing, CAGR. |
| [src/backend/services/FundAnalyticsService.ts](src/backend/services/FundAnalyticsService.ts) | Returns, risk metrics, SIP calculator, AI insights. |
| [src/app/api/nav/ingest/route.ts](src/app/api/nav/ingest/route.ts) | Daily NAV ingest. Cron authentication, AMFI fetch, DB upsert. |

### Goals

| File | Why It Matters |
|------|---------------|
| [src/backend/services/GoalService.ts](src/backend/services/GoalService.ts) | Simple goal CRUD with cache invalidation. |
| [src/backend/repositories/GoalRepository.ts](src/backend/repositories/GoalRepository.ts) | Goal queries with userId guard — prevents cross-user access. |
| [src/shared/dtos/goal.dto.ts](src/shared/dtos/goal.dto.ts) | Complex cross-field Zod validation for goals. |

### Calculations

| File | Why It Matters |
|------|---------------|
| [src/backend/services/FundAnalyticsService.ts](src/backend/services/FundAnalyticsService.ts) | CAGR, volatility, Sharpe, max drawdown, SIP formula. |
| [src/backend/services/NavService.ts](src/backend/services/NavService.ts) | `calculateCagr()` — pure function, no dependencies. |

### AI

| File | Why It Matters |
|------|---------------|
| [src/backend/services/ai.service.ts](src/backend/services/ai.service.ts) | Thin Gemini wrapper. Error mapping. |
| [src/backend/services/AIRecommendationService.ts](src/backend/services/AIRecommendationService.ts) | Complete recommendation pipeline — the most complex service. |

### Redis

| File | Why It Matters |
|------|---------------|
| [src/backend/infrastructure/redis/client.ts](src/backend/infrastructure/redis/client.ts) | ioredis singleton. Retry strategy. Fail-fast configuration. |
| [src/backend/infrastructure/redis/cache/CacheManager.ts](src/backend/infrastructure/redis/cache/CacheManager.ts) | All Redis reads/writes go through this. Never throws. |
| [src/backend/infrastructure/redis/cache/CacheKeys.ts](src/backend/infrastructure/redis/cache/CacheKeys.ts) | Centralized key factory — prevents typos and ensures consistent namespacing. |
| [src/lib/rateLimit.ts](src/lib/rateLimit.ts) | API rate limiter with Redis INCR + in-memory fallback. |

### Frontend

| File | Why It Matters |
|------|---------------|
| [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx) | Sidebar, navigation, session-aware logout. Applied to all dashboard pages. |
| [src/app/(dashboard)/funds/page.tsx](src/app/(dashboard)/funds/page.tsx) | Fund search with debounce, pagination, URL state. |

### API

| File | Why It Matters |
|------|---------------|
| [src/app/api/dashboard/route.ts](src/app/api/dashboard/route.ts) | Parallel data aggregation — 6 queries fired simultaneously. |
| [src/app/api/recommendations/route.ts](src/app/api/recommendations/route.ts) | Recommendation CRUD + generation trigger. |

### Configuration

| File | Why It Matters |
|------|---------------|
| [.env.example](.env.example) | Template for all required environment variables. |
| [package.json](package.json) | All scripts, dependencies, and version constraints. |
| [tsconfig.json](tsconfig.json) | TypeScript configuration including `@/` path alias. |

---

## 34. Glossary

### Financial Terms

| Term | Definition |
|------|-----------|
| **NAV** | Net Asset Value. The per-unit price of a mutual fund on a given date. Calculated as (Fund AUM − Liabilities) / Total Units Outstanding. |
| **AMC** | Asset Management Company. The company that manages the mutual fund. Examples: HDFC AMC, Mirae Asset. |
| **AMFI** | Association of Mutual Funds in India. Regulatory body that publishes daily NAV data for all registered mutual fund schemes. |
| **Scheme Code** | A numeric identifier assigned by AMFI to each individual mutual fund scheme. E.g., `120503` for HDFC Mid-Cap Opportunities Fund - Direct Growth. |
| **Direct Growth** | A fund plan where (1) "Direct" means no distributor commission — lower expense ratio; (2) "Growth" means profits are reinvested into NAV rather than paid out as dividends. |
| **SIP** | Systematic Investment Plan. Fixed-amount investment on a recurring schedule (typically monthly). |
| **Lumpsum** | A one-time investment of a fixed amount. |
| **CAGR** | Compound Annual Growth Rate. The rate of return that would grow an investment from its beginning value to its ending value over a period, assuming growth is compounded annually. |
| **XIRR** | Extended Internal Rate of Return. Time-weighted return that accounts for the timing of cash flows. More accurate than CAGR for portfolios with multiple investment dates. |
| **P&L** | Profit and Loss. `P&L = current value − invested value`. |
| **Corpus** | Total accumulated investment value. Used in the context of a goal: "target corpus" is the amount to accumulate by a certain date. |
| **Volatility** | Annualized standard deviation of daily returns. Measures how much the fund's NAV fluctuates. Higher volatility = higher risk. |
| **Sharpe Ratio** | (Portfolio return − Risk-free rate) / Volatility. Measures return per unit of risk. Higher is better. In FinCal: risk-free rate = 6.5%. |
| **Max Drawdown** | Maximum peak-to-trough decline over a period. Represents the worst-case loss from a high point. |
| **AUM** | Assets Under Management. Total market value of all assets a fund manages. |
| **ELSS** | Equity Linked Savings Scheme. A category of mutual funds that qualifies for tax deduction under Section 80C of the Indian Income Tax Act. |
| **Flexi Cap** | A mutual fund category that can invest across large cap, mid cap, and small cap stocks without restrictions. |
| **Balanced Advantage Fund** | A hybrid fund that dynamically allocates between equity and debt based on market valuations. |

### Technical Terms

| Term | Definition |
|------|-----------|
| **Repository** | A class that encapsulates all database access for a domain entity. Contains only CRUD operations. No business logic. |
| **Service** | A class that encapsulates business logic. Calls repositories and external APIs. Orchestrates use cases. |
| **Server Component** | A React component that runs on the server. Cannot use browser APIs (`window`, `document`), React hooks, or event handlers. Can directly fetch data. |
| **Client Component** | A React component marked with `'use client'`. Runs in both the browser and during server-side rendering (SSR). Can use hooks, event handlers, browser APIs. |
| **Route Group** | A Next.js App Router directory with parentheses in the name (e.g., `(dashboard)`). Groups routes for shared layouts without affecting URL structure. |
| **Cache-aside** | A caching pattern where the application code is responsible for reading from cache first, and if miss, reading from the source and populating the cache. |
| **UPSERT** | A database operation that inserts a row if it doesn't exist, or updates it if it does. Implemented via `prisma.model.upsert()`. |
| **DTO** | Data Transfer Object. A typed object used to carry data between layers. In FinCal, Zod schemas define DTOs (e.g., `AddHoldingInput`). |
| **In-flight deduplication** | A technique where concurrent requests for the same resource share a single underlying fetch operation rather than each making a separate call. |
| **Fail-fast** | Failing immediately upon detecting an error, rather than attempting retries. ioredis is configured fail-fast (`maxRetriesPerRequest: 1`, `enableOfflineQueue: false`). |
| **Fail-open** | Allowing requests to pass through when a guard (like a rate limiter) fails, rather than blocking all traffic. Used for Redis-backed rate limiting. |
| **Prisma Client** | The auto-generated TypeScript database client created by `prisma generate`. Provides type-safe access to all database operations. |
| **Fire-and-forget** | An asynchronous operation that is started but not awaited. Errors are caught internally. Used for non-critical writes (e.g., updating `currentValue` in `UserHolding`). |
| **Session token** | A unique, unguessable string stored in an HttpOnly cookie and in the `Session` table. Used to identify an authenticated user. |
| **Bearer token** | An authentication mechanism where the caller includes a secret in the `Authorization: Bearer <token>` header. Used by the NAV ingest cron endpoint. |
| **Sliding window** | A rate limiting algorithm that tracks the exact timestamps of recent requests in a sorted set, expiring old ones. More accurate than fixed-window counting. |
| **Zod** | A TypeScript-first schema validation library. Used to validate API inputs at runtime. Generates TypeScript types from schema definitions. |

---

*FinCal Engineering Manual — Generated from actual codebase inspection. Last updated August 2026.*
