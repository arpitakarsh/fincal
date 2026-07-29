import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { redis } from '@/infrastructure/redis/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Check Database
    await prisma.$queryRaw`SELECT 1`;

    // 2. Check Redis
    await redis.ping();

    res.status(200).json({
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      services: {
        database: 'OK',
        redis: 'OK'
      }
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'UNHEALTHY',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}
