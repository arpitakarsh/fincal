import { CacheManager } from '../cache/CacheManager';
import { CacheKeys } from '../cache/CacheKeys';
import { RateLimiter } from '../rate-limit/RateLimiter';
import { redis } from '../client';

// Mock the redis client to prevent actual network calls during standard CI runs
jest.mock('../client', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
    pipeline: jest.fn(() => ({
      zremrangebyscore: jest.fn(),
      zcard: jest.fn(),
      zadd: jest.fn(),
      expire: jest.fn(),
      exec: jest.fn().mockResolvedValue([[null, 0], [null, 5]]) // Mock 5 requests
    }))
  }
}));

describe('Redis Infrastructure Layer', () => {
  describe('CacheManager', () => {
    it('should gracefully return null when redis throws an error (Fail-Safe)', async () => {
      // Simulate Redis being completely down
      (redis.get as jest.Mock).mockRejectedValueOnce(new Error('Connection timeout'));
      
      const key = CacheKeys.aiEducational('hash123');
      const result = await CacheManager.get(key);
      
      expect(result).toBeNull();
      // App does not crash!
    });
  });

  describe('RateLimiter', () => {
    it('should fail-open if the pipeline throws', async () => {
      (redis.pipeline as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Pipeline crashed');
      });

      const allowed = await RateLimiter.isAllowed('ratelimit:test', 10, 60);
      
      // Crucial requirement: If Redis dies, we do NOT block the user
      expect(allowed).toBe(true); 
    });
  });
});
