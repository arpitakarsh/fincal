import Redis, { RedisOptions } from 'ioredis';
import { logger } from '@/lib/logger';

// Default options ensuring the app never crashes on connection failure
const defaultOptions: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    logger.warn(`Redis reconnecting in ${delay}ms... (Attempt ${times})`);
    return delay;
  },
  maxRetriesPerRequest: 1, // Fail fast so the app can fallback to DB
};

class RedisClient {
  private static instance: Redis;

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(defaultOptions);

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
