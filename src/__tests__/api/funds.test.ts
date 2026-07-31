// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/funds/route';
import { GET as GET_ID } from '@/app/api/funds/[id]/route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prismaMock } from '../setup';

describe('Funds API', () => {
  it('GET /api/funds should return list of funds', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });
    
    prismaMock.mutualFund.findMany.mockResolvedValue([
      { id: 'fund-1', amcId: 'amc-1', name: 'Fund A', category: 'Equity', riskLevel: 'HIGH', currentNav: 50, oneYearReturn: 10, threeYearReturn: null, fiveYearReturn: null, isRecommended: true, createdAt: new Date(), updatedAt: new Date(), schemeCode: '1' }
    ]);

    const req = new NextRequest('http://localhost/api/funds');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.items).toHaveLength(1);
    expect(json.data.items[0].name).toBe('Fund A');
  });

  it('GET /api/funds/[id] should return a single fund', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });

    prismaMock.mutualFund.findUnique.mockResolvedValue({
      id: 'fund-1', amcId: 'amc-1', name: 'Fund A', category: 'Equity', riskLevel: 'HIGH', currentNav: 50, oneYearReturn: 10, threeYearReturn: null, fiveYearReturn: null, isRecommended: true, createdAt: new Date(), updatedAt: new Date(), schemeCode: '1'
    });

    const req = new NextRequest('http://localhost/api/funds/fund-1');
    const res = await GET_ID(req, { params: Promise.resolve({ id: 'fund-1' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.name).toBe('Fund A');
  });
});
