import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  GEMINI_API_KEY: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL is required"),
  CRON_SECRET: z.string().optional(), // Used for sync APIs
  REDIS_URL: z.string().optional(), // Used for Redis fallback
});

// Avoid executing on client side
const parsedEnv = typeof window === 'undefined' ? envSchema.safeParse(process.env) : { success: true, data: process.env as any };

if (!parsedEnv.success) {
  const error = (parsedEnv as any).error;
  console.error('❌ Invalid environment variables:', error?.format?.() || error);
  // Do not throw in development if we just want it to run without breaking on simple missing optional vars, but our schema is strict now.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Invalid environment variables');
  }
}

export const env = parsedEnv.success ? parsedEnv.data : process.env;
