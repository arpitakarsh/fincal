# FinCal

FinCal is an intelligent, full-stack personal finance platform designed for Indian investors. It combines portfolio tracking, goal-based financial planning, and AI-powered mutual fund recommendations into a single, unified dashboard.

Built on the modern Next.js App Router, FinCal provides real-time NAV tracking, interactive charts, and actionable insights to help you manage your wealth effectively.

![FinCal Architecture](https://img.shields.io/badge/Architecture-Next.js%2016-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Cache-Redis-DC382D?logo=redis)

---

## 🌟 Key Features

*   **Unified Dashboard**: Get a bird's-eye view of your net worth, total investments, and goal progress.
*   **Portfolio Tracking**: Track mutual fund holdings with real-time NAVs fetched from AMFI. Calculates P&L, XIRR, and CAGR dynamically.
*   **Goal Planning**: Set financial targets (e.g., Retirement, Education) and calculate the precise monthly SIP required based on your risk appetite.
*   **AI Financial Advisor**: Powered by Google Gemini, the platform acts as a virtual SEBI-registered advisor. It analyzes your goals and market data to recommend specific mutual funds.
*   **SIP Calculator**: Interactive, chart-based calculator to visualize the magic of compounding over time.
*   **Secure Authentication**: Fully protected routes using Better Auth with encrypted JWT sessions.

## 📚 Complete Documentation

For an in-depth dive into the architecture, database schema, data flow, API reference, and development rules, please read the [**Complete Project Documentation**](./PROJECT_DOCUMENTATION.md).

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 16.1 (App Router), React 19, Tailwind CSS, Recharts, Lucide React, Radix UI.
*   **Backend**: Next.js API Routes, Prisma ORM, Zod Validation.
*   **Database & Cache**: PostgreSQL, Redis (ioredis).
*   **Authentication**: Better Auth.
*   **AI Integration**: Google Generative AI (`@google/generative-ai`).

---

## 🚀 Getting Started (Local Development)

### Prerequisites

1.  Node.js (v20+)
2.  PostgreSQL Server (running locally or via Docker)
3.  Redis Server (running locally or via Docker)

### 1. Environment Variables

Create a `.env` or `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fincal"

# Redis Cache
REDIS_URL="redis://localhost:6379"
# Or if using separate host/port (used in Docker):
# REDIS_HOST="localhost"
# REDIS_PORT="6379"

# Authentication
BETTER_AUTH_SECRET="generate-a-random-super-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# AI Integration
GEMINI_API_KEY="your-google-gemini-api-key"
```

### 2. Installation & Database Setup

Install dependencies:
```bash
npm install
```

Push the Prisma schema to your PostgreSQL database:
```bash
npx prisma db push
```

*(Optional)* Seed the database if you have seed scripts configured:
```bash
npx prisma db seed
```

### 3. Run the Development Server

Start the application:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

FinCal comes with a complete `docker-compose` setup for easy deployment. It spins up the Next.js app, a PostgreSQL instance, and a Redis container.

1. Ensure Docker and Docker Compose are installed.
2. Build and start the containers:
   ```bash
   docker-compose up --build -d
   ```
3. The app will be available at `http://localhost:3000`.

*(Note: Ensure your `.env` is configured correctly for Docker, or rely on the environment variables defined in the `docker-compose.yml` file).*

---

## 📡 Key API Routes

All endpoints except `/api/auth/*` are protected and require a valid auth session.

*   `GET /api/dashboard` - Unified dashboard data (portfolio summary + goals)
*   `POST /api/onboarding` - Save initial investor profile
*   `GET /api/portfolio` - Fetch holdings and aggregate live NAVs
*   `POST /api/goals` - Create a new financial goal
*   `GET /api/goals/:id/recommend` - Trigger AI mutual fund recommendations for a goal
*   `POST /api/sip/calculator` - Intelligent SIP/Lumpsum FV calculator
*   `GET /api/funds/:schemeCode/details` - Live fund NAV and metrics

## 🛡️ Security & Reliability

*   **Graceful Degradation**: If external APIs (like `mfapi.in` or Redis) go down, the application falls back to local AMFI parsing and last-known DB values to prevent catastrophic UI failures.
*   **Centralized Rate Limiting**: General API endpoints are protected against abuse.
*   **Type Safety**: End-to-end type safety using TypeScript and Zod schema validation.

---
*Built for the modern Indian investor.*
