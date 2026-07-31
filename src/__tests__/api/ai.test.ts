// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/ai/generate/route';
import { GET } from '@/app/api/ai/insights/route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prismaMock } from '../setup';
import * as aiService from '@/backend/services/ai.service';

vi.mock('@/backend/services/ai.service', () => ({
  callAI: vi.fn()
}));

describe('AI API', () => {
  it('POST /api/ai/generate should return generated insight', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });
    
    prismaMock.investorProfile.findUnique.mockResolvedValue({
      id: 'prof-1', userId: 'user-1', age: 30, annualIncome: 100000, riskAppetite: 'HIGH',
      createdAt: new Date(), updatedAt: new Date()
    });
    prismaMock.portfolio.findUnique.mockResolvedValue(null);
    prismaMock.goal.findMany.mockResolvedValue([]);

    vi.mocked(aiService.callAI).mockResolvedValue(JSON.stringify({
      overallHealth: 'GOOD', strengths: [], warnings: [], actionPlan: []
    }));

    prismaMock.aIInsightHistory.create.mockResolvedValue({
      id: 'ins-1', userId: 'user-1', topic: 'Financial Health Check', insight: { overallHealth: 'GOOD' } as any,
      createdAt: new Date(), updatedAt: new Date()
    });

    const req = new NextRequest('http://localhost/api/ai/generate', { method: 'POST' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.insight.topic).toBe('Financial Health Check');
  });

  it('GET /api/ai/insights should return insights', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });

    prismaMock.aIInsightHistory.findMany.mockResolvedValue([
      { id: 'ins-1', userId: 'user-1', topic: 'Financial Health Check', insight: { overallHealth: 'GOOD' } as any, createdAt: new Date(), updatedAt: new Date() }
    ]);

    const req = new NextRequest('http://localhost/api/ai/insights');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.insights).toHaveLength(1);
    expect(json.insights[0].topic).toBe('Financial Health Check');
  });
});
