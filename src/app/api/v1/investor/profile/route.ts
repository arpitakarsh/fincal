import { NextRequest } from 'next/server';
import { InvestorProfileSchema } from '@/features/investor/schemas/investor.schema';
import { createSuccessResponse, createErrorResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Server-side Zod validation ensures corrupt data never reaches the database
    const validation = InvestorProfileSchema.safeParse(body);
    
    if (!validation.success) {
      logger.warn('Investor Profile validation failed', { error: validation.error.format() });
      return createErrorResponse('Invalid profile data', 400);
    }

    // Placeholders for persistence:
    // await prisma.investorProfile.upsert(...)
    
    logger.info('Successfully validated and mocked saving Investor Profile');
    
    return createSuccessResponse({
      message: 'Profile saved successfully',
      profile: validation.data
    }, 201);
  } catch (err: any) {
    logger.error('Unhandled Investor Profile error', { message: err.message });
    return createErrorResponse('Internal server error', 500);
  }
}
