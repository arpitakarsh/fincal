import { NextResponse } from 'next/server';
import { FundAnalyticsService } from '@/backend/services/FundAnalyticsService';
import { calculatorSchema } from '@/shared/dtos/calculator.dto';
import { withApiAuthAndError } from '@/lib/apiWrapper';
import { logger } from '@/lib/logger';

const analyticsService = new FundAnalyticsService();

export const POST = withApiAuthAndError(async (req, { session }) => {
  const body = await req.json();
  const validatedData = calculatorSchema.parse(body);

  try {
    const result = await analyticsService.calculateProjection(validatedData, session.user.id);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    logger.error(`Calculator projection failed: ${error.message}`);
    
    // Check if it's a rate limit error
    if (error.message?.includes('Rate limit exceeded')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 429 });
    }
    
    // Pass other validation or historical data errors
    throw error;
  }
});
