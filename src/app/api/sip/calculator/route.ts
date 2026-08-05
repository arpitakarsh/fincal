import { NextResponse } from 'next/server';
import { FundAnalyticsService } from '@/backend/services/FundAnalyticsService';
import { calculatorSchema } from '@/shared/dtos/calculator.dto';
import { withApiAuthAndError } from '@/lib/apiWrapper';

const analyticsService = new FundAnalyticsService();

export const POST = withApiAuthAndError(async (req, { session }) => {
  const body = await req.json();
  const validatedData = calculatorSchema.parse(body);

  const result = await analyticsService.calculateProjection(validatedData, session.user.id);
  return NextResponse.json({ success: true, data: result }, { status: 200 });
});
