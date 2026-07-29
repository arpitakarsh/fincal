import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/apiResponse';
import { logger } from '@/lib/logger';
import { parseNaturalLanguageGoal } from '@/services/ai.service';
import { z } from 'zod';

const aiRequestSchema = z.object({
  query: z.string().min(3),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = aiRequestSchema.safeParse(body);
    
    if (!validation.success) {
      logger.warn('AI Parsing validation failed', { error: validation.error.format() });
      return createErrorResponse('Invalid request parameters', 400);
    }

    const { query } = validation.data;
    logger.info(`Processing AI goal parsing for query: "${query}"`);
    
    const parsedParams = await parseNaturalLanguageGoal(query);
    
    if (!parsedParams) {
      return createErrorResponse('Failed to understand the goal. Please try rephrasing.', 422);
    }
    
    return createSuccessResponse(parsedParams);
  } catch (err: any) {
    logger.error('Unhandled AI route error', { message: err.message });
    return createErrorResponse('Internal server error', 500);
  }
}
