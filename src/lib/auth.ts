import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from '@/backend/infrastructure/database/client';
import { RateLimiter } from '@/backend/infrastructure/redis/rate-limit/RateLimiter';
import { z } from 'zod';

// ─── Validation schemas (exported for use in auth routes) ─────────────────────

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email({ error: 'Invalid email address' }),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
  password: z.string().min(1),
});

// ─── Rate limiter helper for auth endpoints ────────────────────────────────────

/**
 * Checks auth rate limit: 10 requests per 15 minutes per IP.
 * Returns true if the request is allowed, false if rate limited.
 */
export async function checkAuthRateLimit(ip: string): Promise<boolean> {
  const key = `ratelimit:auth:${ip}`;
  return RateLimiter.isAllowed(key, 10, 15 * 60);
}

// ─── Resolve canonical app URL ────────────────────────────────────────────────
//
// Better Auth uses this URL to:
//   • Set the base path for all /api/auth/* endpoints.
//   • Validate the Origin / Referer header against trustedOrigins.
//   • Build absolute redirect URLs after sign-in / sign-out.
//
// On Vercel, BETTER_AUTH_URL must be set to the deployment's canonical URL
// (e.g. https://fincal.vercel.app). Without it, Better Auth infers the URL
// from the incoming request, which can produce CORS failures when preview
// deployments have different hostnames.
//
const appUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'http://localhost:3000';

// ─── Better Auth instance ─────────────────────────────────────────────────────

export const auth = betterAuth({
  // The canonical base URL of this deployment. Used for cookie domains, redirects,
  // and as the implicit trusted origin.
  baseURL: appUrl,

  // Explicitly whitelist every origin that the browser may send requests from.
  // In a standard Next.js deployment the front-end and back-end share the same
  // origin, so only appUrl is needed. Add extra entries for custom domains or
  // staging environments.
  trustedOrigins: [
    appUrl,
    // Allow all *.vercel.app preview deployments so PRs can be tested without
    // adding each URL individually.
    'https://*.vercel.app',
    // Always allow localhost for local development.
    'http://localhost:3000',
    'http://localhost:3001',
  ],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Better Auth uses bcrypt internally — no manual hashing needed
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,           // sign-in automatically after register
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,   // 7 days
    updateAge: 60 * 60 * 24,        // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60               // 5-minute cookie cache
    }
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookiePrefix: 'better-auth',
    // Disable cross-subdomain cookies — not needed for same-origin deployments
    crossSubDomainCookies: { enabled: false },
  }
});
