import { redis } from '@/backend/infrastructure/redis/client';
import { logger } from './logger';

export class RateLimiter {
  private static inMemoryCache = new Map<string, { count: number; expiresAt: number }>();

  /**
   * Check rate limit. Returns an object detailing success, remaining limit, and reset time.
   */
  static async check(identifier: string, limit: number, windowSeconds: number) {
    const now = Date.now();
    
    try {
      if (redis.status === 'ready') {
        const key = `ratelimit:${identifier}`;
        const current = await redis.incr(key);
        if (current === 1) {
          await redis.expire(key, windowSeconds);
        }
        const ttl = await redis.ttl(key);
        
        return {
          success: current <= limit,
          limit,
          remaining: Math.max(0, limit - current),
          resetTime: new Date(now + ttl * 1000)
        };
      }
    } catch (e: any) {
      logger.warn(`Redis rate limit failed, falling back to memory: ${e.message}`);
    }

    // In-memory fallback if Redis is down or unconnected
    this.cleanInMemoryCache(now);
    
    let record = this.inMemoryCache.get(identifier);
    if (!record) {
      record = { count: 0, expiresAt: now + windowSeconds * 1000 };
    }
    
    record.count++;
    this.inMemoryCache.set(identifier, record);

    return {
      success: record.count <= limit,
      limit,
      remaining: Math.max(0, limit - record.count),
      resetTime: new Date(record.expiresAt)
    };
  }

  private static cleanInMemoryCache(now: number) {
    for (const [key, value] of this.inMemoryCache.entries()) {
      if (value.expiresAt <= now) {
        this.inMemoryCache.delete(key);
      }
    }
  }
}
