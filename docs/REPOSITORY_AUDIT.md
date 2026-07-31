# Repository Audit Report

## 1. Directory Structure
The repository is currently in a structurally fragmented state. It exhibits a "split-brain" architecture where elements of the original monolith and the new monorepo layout coexist incorrectly.

**Identified Duplications & Inconsistencies:**
- `apps/web/app` vs `apps/web/pages`: The Next.js frontend contains both an App Router directory and a Pages Router directory.
- `apps/api/middleware.ts` vs `apps/web/middleware.ts`: The Next.js edge middleware was arbitrarily moved to the API app, which is functionally invalid for a frontend Next.js server.
- `apps/web/FinCalApp.tsx`: A legacy root component that is floating outside the standard Next.js directory convention.

## 2. Routing Audit
**Status:** Both App Router and Pages Router are present.
**Conflicting Routes:**
- The presence of `apps/web/app/` implies Next.js 13+ App Router usage.
- The presence of `apps/web/pages/` (including `pages/api` which was partially moved to `apps/api/`) creates routing ambiguity. Next.js will attempt to resolve both, leading to fatal build conflicts.

## 3. Import Audit
**Status:** Hundreds of broken imports.
When the project was relocated from `src/` to `apps/` and `packages/`, the underlying file contents were not updated.
**Examples of Broken Imports:**
- **File:** `apps/web/pages/auth/login.tsx`
  - **Import:** `import { authClient } from '@/lib/auth-client';`
  - **Reason:** `@/lib` no longer exists; it was moved to `packages/shared/lib` but the import path was not updated.
- **File:** `apps/api/middleware.ts`
  - **Import:** `import { auth } from "@/lib/auth";`
  - **Reason:** Alias `@/lib` resolves to the missing `src` folder.

## 4. TypeScript Audit
**Status:** `tsconfig.json` is fundamentally broken.
- **`baseUrl`:** Still points to `.` or `src/`.
- **`paths`:** The `@/*` alias is orphaned since `src/` was deleted.
- Workspace aliases (e.g., `@fincal/domain`) are missing from the compiler paths, preventing `apps/web` from resolving the packages.

## 5. Next.js Audit
**Status:** Configuration is completely detached from the new structure.
- **`next.config.mjs`:** Located at the project root instead of inside `apps/web/`. It lacks the `transpilePackages` directive required for monorepos.
- **Middleware:** Edge middleware was moved to `apps/api/middleware.ts`, so Next.js inside `apps/web` will no longer execute route protection.

## 6. Authentication Audit
**Status:** Better Auth was implemented but structurally orphaned.
- **Incorrect Location:** `apps/api/auth/[...all].ts` is isolated. Next.js expects API catch-alls to live inside the actual Next.js application (`apps/web/pages/api/auth/` or `apps/web/app/api/auth/`).
- The `auth.ts` configuration was moved to `packages/shared/lib`, severing it from the Next.js API route due to broken relative imports.

## 7. Prisma Audit
**Status:** Intact but precariously placed.
- **Schema:** Safely located at `prisma/schema.prisma`.
- **Client:** `npx prisma generate` succeeds, but the `database/client.ts` wrapper was moved to `packages/infrastructure/`, causing import failures wherever `prisma` is instantiated in the API or Web apps.

## 8. Build Audit
**Status:** Fatal Build Failure.
- **Compile Errors:** Next.js cannot compile due to the `src/` alias breaking globally.
- **Missing Dependencies:** `package.json` at the root declared workspaces, but individual apps/packages lack their own `package.json` files, making it an invalid NPM Workspace setup.

## 9. Monorepo Audit
**Status:** Partial (Broken) Monorepo.
The repository was forcefully rearranged into `apps/` and `packages/` folders, and `workspaces` was appended to the root `package.json`. However, because the sub-directories (`apps/web`, `packages/domain`) do not contain their own `package.json` files, the NPM workspace resolver completely ignores them. It is essentially just a monolithic project with arbitrary nested folders.

## 10. Repair Plan

**Step 1: Revert or Formalize Workspaces (30 mins)**
- Generate `package.json` files for `apps/web`, `apps/api`, and every package in `packages/*` to make them valid NPM workspaces.

**Step 2: Consolidate Next.js Configuration (30 mins)**
- Move `next.config.mjs`, `tailwind.config.mjs`, and `postcss.config.mjs` into `apps/web/`.
- Add `transpilePackages: ['@fincal/shared', '@fincal/domain', ...]` to `next.config.mjs`.

**Step 3: Resolve Routing Conflict & Middleware (30 mins)**
- Decide definitively between App Router and Pages Router. Delete the unused paradigm.
- Move `middleware.ts` back into `apps/web/` so route protection functions correctly.
- Move the Better Auth API catch-all back into `apps/web/pages/api/auth/[...all].ts`.

**Step 4: Fix TypeScript Aliases (30 mins)**
- Create a root `tsconfig.base.json`.
- Create specific `tsconfig.json` files in every app/package.
- Update `paths` to correctly map `@fincal/*` to the respective package directories.

**Step 5: Execute Global Import Codemod (30 mins)**
- Run a Regex sweep to replace all legacy `@/` and `../../` imports with the new `@fincal/*` workspace module aliases.
