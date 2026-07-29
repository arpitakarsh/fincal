# Redis Infrastructure Layer

## Architecture Overview
The Redis Infrastructure layer (`src/infrastructure/redis/`) is designed to drastically improve application performance and protect external APIs (like OpenAI) from abuse. 

## The Prime Directive: Never Crash
A core architectural requirement of this platform is that **Redis failures must never bring down the application.**
The `client.ts` uses `ioredis` configured with a strict exponential backoff reconnect strategy. The `CacheManager` intercepts all `get`/`set` requests. If the Redis server crashes or a network partition occurs, the `CacheManager` catches the exception and simply returns `null`. The business logic then gracefully falls back to hitting the primary PostgreSQL database or the live AI API.

## Centralized Keys
To prevent caching bugs, strings are *never* concatenated inline in business logic. All cache keys are strictly generated via the `CacheKeys.ts` factory (e.g. `CacheKeys.aiEducational(hash)`).

## Rate Limiting
The `RateLimiter.ts` employs a Sliding Window algorithm using Redis Sorted Sets (`ZADD`, `ZCOUNT`). This protects our expensive endpoints. If a user exceeds their limit, they are blocked. **Crucially**, just like the CacheManager, if Redis dies, the RateLimiter "fails open" (returns `true`), prioritizing application uptime over strict rate-limiting.

## Future Queue Integration
We have scaffolded `src/infrastructure/redis/queues/`. In the future, this directory will house BullMQ instances for background jobs like the Market Data synchronization pipeline, decoupling heavy processing from the user-facing API.
