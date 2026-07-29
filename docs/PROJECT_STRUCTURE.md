# Project Structure

This document explains the purpose and rules for the primary directories in the FinCal codebase.

## `/src/app/`
- **Purpose:** Next.js App Router root. Handles URL routing, layout definitions, and backend API routes.
- **Responsibilities:** Defining pages (`page.js`), layouts (`layout.js`), and server-side API endpoints (`api/`).
- **Allowed:** Next.js specific files (`loading.js`, `error.js`), global CSS (`globals.css`), and thin API route handlers.
- **Forbidden:** Deep business logic, complex React components.

## `/src/components/`
- **Purpose:** Reusable React UI components.
- **Responsibilities:** Rendering data to the screen and capturing user input.
- **Allowed:** `.jsx` or `.tsx` files containing pure UI logic.
- **Forbidden:** Heavy mathematical calculations, direct database queries, global state definitions.
- **Sub-folders:**
  - `ai/`: AI-related input and result components.
  - `charts/`: Recharts wrappers.
  - `inputs/`: Form controls.
  - `results/`: Display cards for calculated data.
  - `ui/`: Generic primitives (buttons, dialogs).

## `/src/engine/`
- **Purpose:** The "Brain" of the application. Pure business and mathematical logic.
- **Responsibilities:** Calculating SIPs, generating scenarios, validating inputs, running simulations.
- **Allowed:** Pure `.js` or `.ts` files exporting functions.
- **Forbidden:** ANY React code (`import React`, hooks, JSX), DOM manipulation, external network requests.

## `/src/lib/`
- **Purpose:** Shared utilities and configuration.
- **Responsibilities:** Providing constants, formatting functions, and generic helpers.
- **Allowed:** `constants.js`, string/date formatters, API clients.
- **Forbidden:** Feature-specific business logic.

## `/docs/` (This folder)
- **Purpose:** Long-term project documentation for AI and human developers.
- **Responsibilities:** Maintaining architectural context, roadmaps, and rules.
- **Allowed:** `.md` files, diagrams.

## Future Additions
- `/prisma/`: Will be added in Phase 8 for database schema and migrations.
- `/src/services/`: Will be added to bridge API routes and the database/engine, handling heavy backend business logic.
- `/tests/`: Will be added to contain Jest/Vitest unit tests.
