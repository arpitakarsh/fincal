import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/backend/infrastructure/database/client';
import { PortfolioService } from '@/backend/services/PortfolioService';
import { CacheManager } from '@/backend/infrastructure/redis/cache/CacheManager';
import { withApiAuthAndError } from '@/lib/apiWrapper';

const portfolioService = new PortfolioService();

/**
 * GET /api/dashboard
 * Optimized dashboard endpoint: user info, goals with AI recs, portfolio summary.
 * Portfolio uses live NAV data (cached 5 min via PortfolioService).
 */
export const GET = withApiAuthAndError(async (req: NextRequest, { session }) => {
  const userId = session.user.id;

  const [user, profile, goals, recommendations, portfolio] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    }),
    prisma.investorProfile.findUnique({ where: { userId } }),
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.aIRecommendation.findMany({
      where: { goal: { userId } },
      orderBy: { createdAt: 'desc' }
    }),
    // This call fetches live NAVs + computes P&L (cached 5 min)
    portfolioService.getPortfolio(userId),
  ]);

  // Attach top 3 AI recommendations + cached AI explanation per goal
  const goalsWithRecs = await Promise.all(goals.map(async (goal: any) => {
    const goalRecs = recommendations.filter((r: any) => r.goalId === goal.id);
    const aiExplanation = await CacheManager.get(`ai:recommend:${goal.id}`);
    return {
      ...goal,
      recommendations: goalRecs.slice(0, 3),
      aiExplanation: aiExplanation || null
    };
  }));

  return NextResponse.json({
    success: true,
    data: {
      user: { name: user?.name, email: user?.email },
      profileCompleted: !!profile,
      goals: {
        total: goalsWithRecs.length,
        upcoming: goalsWithRecs[0] || null,
        list: goalsWithRecs
      },
      portfolio: portfolio
        ? {
            totalValue: portfolio.totalCurrentValue,
            totalInvested: portfolio.totalInvested,
            totalGainLoss: portfolio.totalPnl,
            totalGainLossPercentage: portfolio.totalPnlPercentage,
            holdingsCount: portfolio.holdingsCount,
            assetAllocation: Object.fromEntries(
              portfolio.assetAllocation.map(a => [a.name, a.percentage])
            ),
          }
        : {
            totalValue: 0,
            totalInvested: 0,
            totalGainLoss: 0,
            totalGainLossPercentage: 0,
            holdingsCount: 0,
            assetAllocation: {}
          }
    }
  });
});
