// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/recommendations/route';
import { POST } from '@/app/api/recommendations/generate/route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prismaMock } from '../setup';
import { CacheManager } from '@/backend/infrastructure/redis/cache/CacheManager';

describe('Recommendations API', () => {
  it('GET should return recommendations for user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });
    
    prismaMock.recommendationHistory.findMany.mockResolvedValue([
      { id: 'rec-1', userId: 'user-1', goalId: 'goal-1', recommendedFunds: ['fund-1'], projectedAmount: 100000, 
        status: 'ACTIVE', reason: 'Good fit', createdAt: new Date() } as any
    ]);

    const req = new NextRequest('http://localhost/api/recommendations');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.recommendations).toHaveLength(1);
    expect(json.recommendations[0].reason).toBe('Good fit');
  });

  it('POST /generate should generate recommendations for goal', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });

    vi.spyOn(CacheManager, 'get').mockResolvedValue(null);
    vi.spyOn(CacheManager, 'set').mockResolvedValue(true);

    prismaMock.goal.findFirst.mockResolvedValue({
      id: 'goal-1',
      userId: 'user-1',
      targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10), // 10 years horizon
    } as any);

    prismaMock.investorProfile.findUnique.mockResolvedValue({
      userId: 'user-1',
      riskAppetite: 'High'
    } as any);

    prismaMock.mutualFund.findMany.mockResolvedValue([
      { id: 'fund-1', name: 'Equity Fund', category: 'Equity', schemeType: 'Open Ended' },
      { id: 'fund-2', name: 'Debt Fund', category: 'Debt', schemeType: 'Open Ended' }
    ] as any);

    prismaMock.recommendationHistory.createMany.mockResolvedValue({ count: 2 } as any);

    const req = new NextRequest('http://localhost/api/recommendations/generate', {
      method: 'POST',
      body: JSON.stringify({ goalId: 'e207ed1d-b84f-405e-8557-0a417c469f34' })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    // Equity fund should score higher for 10yr horizon + high risk appetite
    expect(json.data[0].fund.name).toBe('Equity Fund');
  });
});
