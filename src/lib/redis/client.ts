import "server-only";
import Redis, { RedisOptions } from 'ioredis';
import { logger } from '@/lib/logger';

// Default options ensuring the app never crashes on connection failure
const defaultOptions: RedisOptions = {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    if (times > 3) {
      logger.warn(`Redis disconnected, falling back...`);
      return null; // Stop retrying after 3 attempts, let it fail fast
    }
    return delay;
  },
  maxRetriesPerRequest: 1, // Fail fast so the app can fallback to DB
  enableOfflineQueue: false, // Don't queue commands if redis is down
};

class RedisClient {
  private static instance: Redis;

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      const url = process.env.REDIS_URL;
      
      if (url) {
        RedisClient.instance = new Redis(url, defaultOptions);
      } else {
        RedisClient.instance = new Redis(defaultOptions);
      }

      RedisClient.instance.on('connect', () => {
        logger.info('Successfully connected to Redis infrastructure');
      });

      RedisClient.instance.on('error', (err) => {
        logger.error('Redis connection error', { message: err.message });
      });
    }

    return RedisClient.instance;
  }
}

export const redis = RedisClient.getInstance();
