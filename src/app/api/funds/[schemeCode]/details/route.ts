import { NextResponse } from 'next/server';
import { FundAnalyticsService } from '@/backend/services/FundAnalyticsService';
import { withApiAuthAndError } from '@/lib/apiWrapper';

const analyticsService = new FundAnalyticsService();

export const GET = withApiAuthAndError(async (req, { params }) => {
  const { schemeCode } = await params;
  if (!schemeCode) throw new Error('Scheme code is required');

  const details = await analyticsService.getFundDetails(schemeCode);
  return NextResponse.json({ success: true, data: details });
});
