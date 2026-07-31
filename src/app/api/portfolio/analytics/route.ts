import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PortfolioService } from '@/backend/services/PortfolioService';
import { withApiAuthAndError } from '@/lib/apiWrapper';

const portfolioService = new PortfolioService();

/**
 * GET /api/portfolio/analytics
 * Returns allocation breakdowns and P&L summary (optimized subset of /portfolio).
 */
export const GET = withApiAuthAndError(async (req: NextRequest, { session }) => {
  const portfolio = await portfolioService.getPortfolio(session.user.id);

  if (!portfolio) {
    return NextResponse.json({
      success: true,
      data: null,
      message: 'No portfolio found.'
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      totalInvested: portfolio.totalInvested,
      currentValue: portfolio.totalCurrentValue,
      absoluteGainLoss: portfolio.totalPnl,
      gainLossPercentage: portfolio.totalPnlPercentage,
      assetAllocation: portfolio.assetAllocation,
      categoryAllocation: portfolio.categoryAllocation,
      amcAllocation: portfolio.amcAllocation,
    }
  });
});
