import { redis } from '../client';
import { logger } from '@/lib/logger';

export class CacheManager {
  /**
   * Safely retrieves and parses a JSON payload.
   * If Redis fails, returns null instead of throwing, allowing DB fallback.
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error: any) {
      logger.error(`Cache GET failed for key: ${key}`, { error: error.message });
      return null;
    }
  }

  /**
   * Safely stringifies and sets a payload with an optional TTL (in seconds).
   */
  static async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const payload = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, payload);
      } else {
        await redis.set(key, payload);
      }
    } catch (error: any) {
      logger.error(`Cache SET failed for key: ${key}`, { error: error.message });
    }
  }

  /**
   * Safely deletes a key.
   */
  static async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error: any) {
      logger.error(`Cache DELETE failed for key: ${key}`, { error: error.message });
    }
  }
}
