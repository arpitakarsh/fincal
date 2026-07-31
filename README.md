# FinCal Backend

FinCal is an AI-powered mutual fund tracking and recommendation platform for Indian investors. 
This backend is built on Next.js App Router (API Routes), powered by Prisma, PostgreSQL, Redis, and Better Auth.

## Infrastructure

- **Database**: PostgreSQL (via Neon or local Docker) managed via Prisma.
- **Cache & Rate Limiting**: Redis (via Upstash or local Docker). Handles high-speed calculations, 3rd-party API rate limits, and application-level rate limiting.
- **Authentication**: Better Auth (JWT based) with encrypted session persistence.
- **AI Engine**: Gemini or OpenAI for financial insights.

## Prerequisites & Setup

1. Install Node.js (v20+)
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` or `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fincal"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
BETTER_AUTH_SECRET="your-super-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# AI Integration
GEMINI_API_KEY="your-gemini-key"
# OPENAI_API_KEY="your-openai-key" # Optional fallback
```

### Running the App Locally

1. Start your local PostgreSQL and Redis servers.
2. Push the Prisma Schema to sync your database:
   ```bash
   npx prisma db push
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Key API Endpoints

All endpoints except `/api/auth/*` are protected and require a valid auth session.

- `POST /api/auth/register` - Create a user
- `POST /api/auth/login` - Authenticate
- `GET /api/dashboard` - Unified dashboard data (portfolio summary + goals)
- `POST /api/goals` - Create a new financial goal
- `POST /api/goals/:id/recommend` - Trigger AI mutual fund recommendations for a goal (5 req/hr limit)
- `GET /api/funds/:schemeCode/details` - Live fund NAV, returns (1M to 5Y), and risk metrics (Sharpe, Volatility)
- `GET /api/funds/:schemeCode/insights?goalId=xxx` - AI-generated pros, cons, and suitability score (10 req/hr limit)
- `POST /api/portfolio/holdings` - Add a holding (supports manual tracking or adding from an AI recommendation)
- `POST /api/sip/calculator` - Intelligent SIP/Lumpsum FV calculator utilizing actual trailing returns.
- `GET /api/health` - Check database and cache health status.

## Security & Rate Limiting

- **Graceful Degradation**: If Redis goes down, the application will fallback to in-memory rate limiting and direct database/API fetching without crashing.
- **Centralized Rate Limiting**: General API endpoints are limited to 200 requests per 15 minutes per user/IP. Public endpoints (Auth) are strictly limited to 10 requests per 15 minutes.
- **Security Headers**: Standard security headers (HSTS, X-XSS-Protection, No-Sniff, etc.) are rigidly enforced globally via `next.config.mjs`.
