# Authentication & Identity

## Architecture Overview
The platform utilizes **Better Auth** as the core identity provider. This keeps the application highly modular, vendor-agnostic, and completely integrated with our Prisma PostgreSQL database. 

## Separation of Concerns (Identity vs Financials)
A core architectural mandate is that the `User` identity model is entirely separated from the `InvestorProfile` (which handles goals and recommendations). 
A `User` table solely concerns itself with Emails, Hashes, Sessions, and Verifications. 
The `InvestorProfile` maps back to the User via a `userId` foreign key. This allows a single authenticated user to create multiple unique financial profiles/goals (e.g., one for Retirement, one for a House) without polluting the auth table.

## Middleware Routing & Security
We employ Next.js Middleware (`src/middleware.ts`) at the Edge. 
It aggressively guards specific paths:
- `/dashboard`
- `/portfolio`
- `/profile`
- `/api/private/*`

If a user without a valid Better Auth session cookie attempts to hit these routes, the middleware intercepts the request and instantly issues an HTTP 307 redirect to `/auth/login`.

## Future Proofing
Because we built this on Better Auth and explicitly defined the `Account` Prisma model, the system is natively ready to support OAuth (Google, GitHub) and Magic Link emails in the future without rewriting any of the core `AuthService` logic.
