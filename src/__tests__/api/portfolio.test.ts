// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { GET, POST, DELETE } from '@/app/api/portfolio/route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prismaMock } from '../setup';

describe('Portfolio API', () => {
  it('GET should return portfolio for user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });
    
    prismaMock.portfolio.findUnique.mockResolvedValue({
      id: 'port-1', userId: 'user-1', totalInvested: 100000, currentValue: 120000, totalMonthlySip: 5000,
      createdAt: new Date(), updatedAt: new Date()
    } as any);

    const req = new NextRequest('http://localhost/api/portfolio');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.portfolio.currentValue).toBe(120000);
  });

  it('POST should save portfolio', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });

    prismaMock.portfolio.upsert.mockResolvedValue({
      id: 'port-1', userId: 'user-1', totalInvested: 100000, currentValue: 120000, totalMonthlySip: 5000,
      createdAt: new Date(), updatedAt: new Date()
    } as any);

    const req = new NextRequest('http://localhost/api/portfolio', {
      method: 'POST',
      body: JSON.stringify({ totalInvested: 100000, currentValue: 120000, totalMonthlySip: 5000 })
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.portfolio.currentValue).toBe(120000);
  });

  it('DELETE should delete portfolio', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });

    prismaMock.portfolio.delete.mockResolvedValue({} as any);

    const req = new NextRequest('http://localhost/api/portfolio', { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
