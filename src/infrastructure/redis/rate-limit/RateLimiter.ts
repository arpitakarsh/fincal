import { redis } from '../client';
import { logger } from '@/lib/logger';

export class RateLimiter {
  /**
   * Sliding window rate limiter using Redis Sorted Sets.
   * Useful for protecting expensive AI endpoints.
   * 
   * @param key The unique redis key (e.g. ratelimit:ip:127.0.0.1:ai)
   * @param limit Maximum number of requests allowed
   * @param windowSeconds The time window in seconds
   * @returns true if allowed, false if rate limited
   */
  static async isAllowed(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    try {
      const now = Date.now();
      const windowStart = now - (windowSeconds * 1000);
      
      const pipeline = redis.pipeline();
      
      // 1. Remove timestamps older than the window
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // 2. Count requests in current window
      pipeline.zcard(key);
      
      // 3. Add current request timestamp
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // 4. Set expiry on the set itself to prevent memory leaks
      pipeline.expire(key, windowSeconds);
      
      const results = await pipeline.exec();
      if (!results) return true; // Fail open
      
      const requestCount = results[1][1] as number;
      
      if (requestCount >= limit) {
        logger.warn(`Rate limit exceeded for key: ${key}`);
        return false;
      }
      
      return true;
    } catch (error: any) {
      // Fail open: if Redis is down, don't block legitimate traffic
      logger.error(`RateLimiter failed for key: ${key}`, { error: error.message });
      return true;
    }
  }
}
