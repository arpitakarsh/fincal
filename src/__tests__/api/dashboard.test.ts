// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/dashboard/route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prismaMock } from '../setup';
import { CacheManager } from '@/backend/infrastructure/redis/cache/CacheManager';

describe('Dashboard API', () => {
  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/dashboard');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('should return dashboard data for authenticated user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess-1', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });

    vi.spyOn(CacheManager, 'get').mockResolvedValue(null);
    vi.spyOn(CacheManager, 'set').mockResolvedValue(undefined);

    prismaMock.goal.findMany.mockResolvedValue([
      { id: 'goal-1', userId: 'user-1', name: 'Retirement', targetAmount: 1000000, currentAmount: 100000, targetDate: new Date(), createdAt: new Date(), updatedAt: new Date() } as any
    ]);
    
    prismaMock.portfolio.findUnique.mockResolvedValue({
      id: 'port-1',
      userId: 'user-1',
      totalInvested: 10000,
      holdings: [
        {
          investedValue: 10000,
          currentValue: 12000,
          fund: { category: 'Equity', amc: { name: 'HDFC' } }
        }
      ]
    } as any);

    prismaMock.recommendationHistory.findMany.mockResolvedValue([
      { id: 'rec-1', rationale: 'Good fund', scoreAtTime: 90, createdAt: new Date() } as any
    ]);

    const req = new NextRequest('http://localhost/api/dashboard');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.goals.total).toBe(1);
    expect(json.portfolio.totalInvested).toBe(10000);
    expect(json.recommendations.count).toBe(1);
    expect(json.recommendations.latest.rationale).toBe('Good fund');
  });
});
