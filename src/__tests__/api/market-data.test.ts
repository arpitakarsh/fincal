// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as SYNC_AMFI } from '@/app/api/market-data/sync-amfi/route';
import { NextRequest } from 'next/server';
import { prismaMock } from '../setup';

describe('Market Data API', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('POST /api/market-data/sync-amfi should require auth header', async () => {
    const req = new NextRequest('http://localhost/api/market-data/sync-amfi', {
      method: 'POST',
      headers: { 'authorization': 'Bearer wrong' }
    });
    
    const res = await SYNC_AMFI(req);
    expect(res.status).toBe(401);
  });

  it('POST /api/market-data/sync-amfi should sync data successfully', async () => {
    const dummyAmfiTxt = `Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
Aditya Birla Sun Life Mutual Fund
Open Ended Schemes( Equity Scheme - Large Cap Fund )
107747;INF209K01157;INF209K01165;Aditya Birla Sun Life Frontline Equity Fund - Regular Plan - Dividend;32.55;29-Jul-2026`;

    prismaMock.syncLog.create.mockResolvedValue({ id: 'log-1' } as any);
    prismaMock.syncLog.update.mockResolvedValue({ id: 'log-1' } as any);
    prismaMock.aMC.findUnique.mockResolvedValue({ id: 'amc-1', name: 'Aditya Birla Sun Life Mutual Fund', createdAt: new Date(), updatedAt: new Date() });
    
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      text: async () => dummyAmfiTxt
    } as any);

    prismaMock.mutualFund.upsert.mockResolvedValue({
      id: 'fund-1', amcId: 'amc-1', name: 'Aditya Birla Sun Life Frontline Equity Fund - Regular Plan - Dividend',
      isin: 'INF209K01157', schemeCode: '107747', category: 'Equity Scheme - Large Cap Fund',
      riskLevel: 'HIGH', currentNav: 32.55, oneYearReturn: null, threeYearReturn: null, fiveYearReturn: null, isRecommended: false,
      createdAt: new Date(), updatedAt: new Date()
    });

    prismaMock.fundNavHistory.upsert.mockResolvedValue({
      id: 'nav-1', fundId: 'fund-1', date: new Date('29-Jul-2026'), nav: 32.55, createdAt: new Date()
    });

    const req = new NextRequest('http://localhost/api/market-data/sync-amfi', {
      method: 'POST',
      headers: { 'authorization': `Bearer ${process.env.CRON_SECRET || 'dev-secret-key'}` }
    });
    
    const res = await SYNC_AMFI(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.stats.totalProcessed).toBe(1);
    expect(json.stats.newOrUpdated).toBe(1);
  });
});
