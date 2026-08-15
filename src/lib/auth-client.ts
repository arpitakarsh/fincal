import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client — used in all client components for sign-in, sign-up,
 * sign-out, and session management.
 *
 * baseURL resolution:
 *   - In the browser, `window.location.origin` is always the same origin as the
 *     Next.js app, so auth requests are same-origin and no CORS preflight is
 *     needed. This is the correct approach for a monolithic Next.js deployment.
 *   - On the server (SSR / RSC), `NEXT_PUBLIC_APP_URL` must be set to the
 *     canonical deployment URL so Better Auth can build absolute redirect URLs.
 *
 * DO NOT hard-code a URL here — it will cause cross-origin requests when the
 * preview deployment URL differs from the env variable.
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin            // always same-origin in the browser
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});
