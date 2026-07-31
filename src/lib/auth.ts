import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from '@/backend/infrastructure/database/client';
import { RateLimiter } from '@/backend/infrastructure/redis/rate-limit/RateLimiter';
import { z } from 'zod';

// ─── Validation schemas (exported for use in auth routes) ─────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
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

// ─── Better Auth instance ─────────────────────────────────────────────────────

export const auth = betterAuth({
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
  }
});
