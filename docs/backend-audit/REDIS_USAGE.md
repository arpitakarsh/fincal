# Redis Usage

Redis is extensively used for caching and rate-limiting to ensure performance and cost control.

## Infrastructure
- Configured via `ioredis` in `RedisClient`.
- Implements exponential backoff for retries.
- Fails fast (`maxRetriesPerRequest: 1`) to allow the application to fallback to the database smoothly.

## CacheManager
- `CacheManager` provides static `get`, `set`, and `delete` methods.
- Methods are wrapped in `try-catch` to fail gracefully if Redis is down.

## CacheKeys
- Centralized key generation factory (`CacheKeys` object) to prevent typos and standardize namespaces.
- Namespaces: `ai`, `fund`, `analytics`, `rec`, `user`, `ratelimit`, `market`.

## What is Cached?
- **AMFI Universe**: Cached for 12 hours.
- **MFAPI Fund Details**: Cached for 24 hours.
- **User Goals**: Cached for 5 minutes.
- **User Portfolio**: Cached for 5 minutes.
- **Portfolio Analytics**: Cached for 5 minutes.
- **AI Insights & Recommendations**: Cached with varying TTLs (e.g., 15 mins for insights, 1 hour for portfolio analysis).

## RateLimiter
- Implements a sliding window rate limiter using Redis Sorted Sets (`zadd`, `zcard`, `zremrangebyscore`).
- Protects expensive endpoints (like AI generation).
- Fails open (allows request) if Redis is unreachable.
