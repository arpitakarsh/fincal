# Architectural Decisions

This document records the major architectural decisions made during the lifecycle of the project.

## Why React
React was chosen for its robust ecosystem, component-driven architecture, and excellent performance for highly interactive interfaces. Given the dynamic nature of a financial calculator (where changing one input instantly updates charts and outputs), React's state management and virtual DOM are ideal.

## Why Next.js (App Router)
Next.js was selected for its hybrid rendering capabilities.
- **SEO & Initial Load:** Important pages can be server-side rendered (SSR) or statically generated (SSG).
- **API Routes:** It provides a built-in backend (`src/app/api/`) which allows us to securely call external APIs (like Google Generative AI) without exposing API keys to the client.
- **App Router:** The new App Router offers better performance, nested layouts, and server components, aligning with modern React best practices.

## Why Tailwind CSS
Tailwind CSS provides a utility-first approach that significantly speeds up development and ensures a consistent design system. It avoids the problem of dead CSS and makes it easy to implement responsive designs and dark modes without managing complex external stylesheets.

## Why Feature-Based Folders (in `src/components`)
Organizing components by domain/feature (e.g., `ai`, `inputs`, `charts`, `results`) rather than strictly by type (e.g., `atoms`, `molecules`) makes the codebase easier to navigate as it scales. It keeps related UI logic co-located.

## Why the `src/engine/` Abstraction
Financial math can be complex and requires rigorous testing. By completely decoupling the business logic (`src/engine/`) from the React UI components, we ensure that:
1. The math can be unit-tested in isolation in a Node environment.
2. The logic can easily be moved to a backend server (e.g., Node/Python) in the future if required, without rewriting the algorithms.

## Future Decisions (Planned)

### Why PostgreSQL (Planned)
PostgreSQL is chosen for its robust relational model, ACID compliance, and excellent support for complex queries. Financial data (portfolios, transactions, historical returns) is highly relational and requires strong consistency guarantees.

### Why Prisma (Planned)
Prisma offers a highly type-safe ORM that integrates seamlessly with Next.js and TypeScript. It accelerates database development with intuitive schema modeling and auto-generated migrations.

### Why Redis (Planned)
Mutual fund historical data and external API responses (e.g., AMFI NAVs) do not change every second. Redis will be used as a caching layer to reduce database load, minimize external API calls, and ensure sub-100ms response times for the recommendation engine.
