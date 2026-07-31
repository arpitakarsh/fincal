# Architecture

## High-Level Architecture
This project is a **Single-App Next.js Repository**. It explicitly avoids monorepo configurations to reduce build complexity.

### Frontend
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Minimal, no bloat)
- **Routing:** Handled strictly inside `src/app/`.

### Backend
- **Framework:** Next.js Route Handlers (`src/app/api/` or `src/pages/api/`)
- **Database:** PostgreSQL (via Neon)
- **ORM:** Prisma (`prisma/schema.prisma`)
- **Caching/Queues:** Redis (Planned for future BullMQ integration)
- **Authentication:** Better Auth (Prisma Adapter)

## Directory Responsibilities
- **`src/app/`**: Next.js App Router (Pages, Layouts, CSS).
- **`src/pages/api/`**: Legacy API routes (Specifically hosting Better Auth endpoints).
- **`src/components/ui/`**: Reusable primitive React components (Button, Input, Card).
- **`src/services/`**: Core business logic. Validates inputs and enforces domain rules.
- **`src/repositories/`**: Exclusive layer for interacting with Prisma. No other layer communicates directly with the database.
- **`src/domains/` & `src/features/`**: Domain specific validation, interfaces, and isolated business logic.
- **`src/engine/`**: Pure deterministic math functions (SIP, SWP, XIRR calculations).
