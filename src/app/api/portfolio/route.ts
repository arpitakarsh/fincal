import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PortfolioService } from '@/backend/services/PortfolioService';
import { withApiAuthAndError } from '@/lib/apiWrapper';

const portfolioService = new PortfolioService();

/**
 * GET /api/portfolio
 * Returns the full portfolio with live NAVs, per-holding P&L, and allocation breakdowns.
 */
export const GET = withApiAuthAndError(async (req: NextRequest, { session }) => {
  const portfolio = await portfolioService.getPortfolio(session.user.id);

  if (!portfolio) {
    return NextResponse.json({
      success: true,
      data: null,
      message: 'No portfolio yet. Add your first holding to get started.'
    });
  }

  return NextResponse.json({ success: true, data: portfolio });
});

/**
 * DELETE /api/portfolio
 * Delete the entire portfolio and all its holdings.
 */
export const DELETE = withApiAuthAndError(async (req: NextRequest, { session }) => {
  await portfolioService.deletePortfolio(session.user.id);
  return NextResponse.json({ success: true, message: 'Portfolio deleted' });
});
