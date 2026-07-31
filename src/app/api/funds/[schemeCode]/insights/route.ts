import { NextResponse } from 'next/server';
import { FundAnalyticsService } from '@/backend/services/FundAnalyticsService';
import { withApiAuthAndError } from '@/lib/apiWrapper';
import { logger } from '@/lib/logger';

const analyticsService = new FundAnalyticsService();

export const GET = withApiAuthAndError(async (req, { params, session }) => {
  const { schemeCode } = await params;
  if (!schemeCode) throw new Error('Scheme code is required');

  const { searchParams } = new URL(req.url);
  const goalId = searchParams.get('goalId');
  if (!goalId) throw new Error('goalId query parameter is required for insights');

  try {
    const insights = await analyticsService.getFundInsights(schemeCode, goalId, session.user.id);
    return NextResponse.json({ success: true, data: insights });
  } catch (error: any) {
    logger.error(`Failed to get insights for ${schemeCode}: ${error.message}`);
    if (error.message?.includes('Rate limit exceeded')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 429 });
    }
    throw error;
  }
});
