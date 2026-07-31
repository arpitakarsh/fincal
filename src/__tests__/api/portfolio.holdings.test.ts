// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/portfolio/holdings/route';
import { PUT, DELETE } from '@/app/api/portfolio/holdings/[id]/route';
import { GET as GET_ANALYTICS } from '@/app/api/portfolio/analytics/route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prismaMock } from '../setup';
import { CacheManager } from '@/backend/infrastructure/redis/cache/CacheManager';

describe('Portfolio Holdings & Analytics API', () => {
  it('POST should add a holding to portfolio', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });

    vi.spyOn(CacheManager, 'get').mockResolvedValue(null);
    vi.spyOn(CacheManager, 'set').mockResolvedValue(undefined);
    vi.spyOn(CacheManager, 'delete').mockResolvedValue(undefined);

    prismaMock.portfolio.findUnique.mockResolvedValue({
      id: 'port-1', userId: 'user-1', totalInvested: 100000, currentValue: 120000, totalMonthlySip: 5000,
      createdAt: new Date(), updatedAt: new Date()
    } as any);

    prismaMock.userHolding.create.mockResolvedValue({
      id: 'holding-1', portfolioId: 'port-1', fundId: '123e4567-e89b-12d3-a456-426614174000', units: 100, averageNav: 50, investedValue: 5000,
      createdAt: new Date(), updatedAt: new Date()
    } as any);
    
    prismaMock.userHolding.findMany.mockResolvedValue([]);

    const req = new NextRequest('http://localhost/api/portfolio/holdings', {
      method: 'POST',
      body: JSON.stringify({ fundId: '123e4567-e89b-12d3-a456-426614174000', units: 100, averageNav: 50 })
    });
    
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.holding.investedValue).toBe(5000);
  });

  it('GET /analytics should return portfolio analytics', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });

    vi.spyOn(CacheManager, 'get').mockResolvedValue(null);

    prismaMock.portfolio.findUnique.mockResolvedValue({
      id: 'port-1', userId: 'user-1', totalInvested: 100000, currentValue: 120000, totalMonthlySip: 5000,
      holdings: [
        {
          id: 'holding-1',
          investedValue: 10000,
          currentValue: 12000,
          fund: {
            category: 'Equity - Large Cap',
            amc: { name: 'HDFC Mutual Fund' }
          }
        }
      ],
      createdAt: new Date(), updatedAt: new Date()
    } as any);

    const req = new NextRequest('http://localhost/api/portfolio/analytics');
    const res = await GET_ANALYTICS(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.analytics.totalInvested).toBe(10000);
    expect(json.analytics.currentValue).toBe(12000);
    expect(json.analytics.assetAllocation['Equity']).toBe(12000);
    expect(json.analytics.amcAllocation['HDFC Mutual Fund']).toBe(12000);
  });
});
