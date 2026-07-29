import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url().optional(), // Optional for now since DB is uninitialized
  GEMINI_API_KEY: z.string().optional(),
});

// Avoid executing on client side
const parsedEnv = typeof window === 'undefined' ? envSchema.safeParse(process.env) : { success: true, data: process.env as any };

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment variables');
}

export const env = parsedEnv.data;
