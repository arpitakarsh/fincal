// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { GET, POST } from '@/app/api/goals/route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prismaMock } from '../setup';

describe('Goals API - Root', () => {
  it('GET should return goals for user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });
    
    prismaMock.goal.findMany.mockResolvedValue([
      { id: 'goal-1', userId: 'user-1', name: 'Car', targetAmount: 20000, currentAmount: 5000, category: 'Vehicle', targetDate: new Date(), createdAt: new Date(), updatedAt: new Date() }
    ]);

    const req = new NextRequest('http://localhost/api/goals');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.goals).toHaveLength(1);
    expect(json.goals[0].name).toBe('Car');
  });

  it('POST should create a goal', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'sess', userId: 'user-1', expiresAt: new Date(), ipAddress: '', userAgent: '', createdAt: new Date(), updatedAt: new Date() }
    });

    const mockGoal = { id: 'goal-2', userId: 'user-1', name: 'House', targetAmount: 500000, currentAmount: 0, category: 'Housing', targetDate: new Date(), createdAt: new Date(), updatedAt: new Date() };
    prismaMock.goal.create.mockResolvedValue(mockGoal);

    const req = new NextRequest('http://localhost/api/goals', {
      method: 'POST',
      body: JSON.stringify({ name: 'House', targetAmount: 500000, category: 'Housing', targetDate: new Date().toISOString() })
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.goal.name).toBe('House');
  });
});
