// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { GET, PUT, DELETE } from '@/app/api/goals/[id]/route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prismaMock } from '../setup';

describe('Goals API - [id]', () => {
  const getParams = (id: string) => ({ params: Promise.resolve({ id }) });

  it('GET should return goal', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });
    
    prismaMock.goal.findFirst.mockResolvedValue({
      id: 'goal-1', userId: 'user-1', name: 'Car', targetAmount: 20000, currentAmount: 5000, category: 'Vehicle', targetDate: new Date(), createdAt: new Date(), updatedAt: new Date()
    } as any);

    const req = new NextRequest('http://localhost/api/goals/goal-1');
    const res = await GET(req, getParams('goal-1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.goal.name).toBe('Car');
  });

  it('PUT should update goal', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });
    
    prismaMock.goal.updateMany.mockResolvedValue({ count: 1 });

    const req = new NextRequest('http://localhost/api/goals/goal-1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Car Updated', targetAmount: 25000, category: 'Vehicle', targetDate: new Date().toISOString() })
    });
    const res = await PUT(req, getParams('goal-1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('DELETE should delete goal', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });

    prismaMock.goal.deleteMany.mockResolvedValue({ count: 1 });

    const req = new NextRequest('http://localhost/api/goals/goal-1', { method: 'DELETE' });
    const res = await DELETE(req, getParams('goal-1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
