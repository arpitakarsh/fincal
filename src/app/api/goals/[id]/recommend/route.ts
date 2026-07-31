import { NextResponse } from 'next/server';
import { AIRecommendationService } from '@/backend/services/AIRecommendationService';
import { withApiAuthAndError } from '@/lib/apiWrapper';
import { logger } from '@/lib/logger';

const aiService = new AIRecommendationService();

export const POST = withApiAuthAndError(async (req, { params, session }) => {
  const { id } = await params;
  
  try {
    const recommendations = await aiService.generateRecommendations(session.user.id, id);
    return NextResponse.json({ success: true, data: recommendations }, { status: 200 });
  } catch (error: any) {
    logger.error(`AI Recommendation failed for goal ${id}:`, error);
    
    // Check if it's a rate limit error (based on message thrown from service)
    if (error.message?.includes('Rate limit exceeded')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 429 });
    }
    
    throw error;
  }
});

export const GET = withApiAuthAndError(async (req, { params, session }) => {
  const { id } = await params;
  const recommendations = await aiService.getGoalRecommendations(id, session.user.id);
  return NextResponse.json({ success: true, data: recommendations }, { status: 200 });
});
