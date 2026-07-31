import { NextResponse } from 'next/server';
import { prisma } from '@/backend/infrastructure/database/client';
import { redis } from '@/backend/infrastructure/redis/client';
import { logger } from '@/lib/logger';
import '@/config/env'; // Validate env on boot (or when route is hit if not loaded yet)

export const GET = async () => {
  let dbStatus = 'ok';
  let cacheStatus = 'ok';

  try {
    // A quick query to check DB liveness
    await prisma.$queryRaw`SELECT 1`;
  } catch (e: any) {
    logger.error(`HealthCheck: DB failed: ${e.message}`);
    dbStatus = 'down';
  }

  try {
    if (redis.status !== 'ready') {
      cacheStatus = 'down';
    } else {
      await redis.ping();
    }
  } catch (e: any) {
    logger.error(`HealthCheck: Redis failed: ${e.message}`);
    cacheStatus = 'down';
  }

  const isHealthy = dbStatus === 'ok'; // Redis can be down (we have fallback)

  return NextResponse.json({
    success: isHealthy,
    data: {
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: dbStatus,
      redis: cacheStatus,
      timestamp: new Date().toISOString()
    }
  }, { status: isHealthy ? 200 : 503 });
};
