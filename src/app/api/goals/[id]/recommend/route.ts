import { NextResponse } from 'next/server';
import { AIRecommendationService } from '@/backend/services/AIRecommendationService';
import { withApiAuthAndError } from '@/lib/apiWrapper';

const aiService = new AIRecommendationService();

export const POST = withApiAuthAndError(async (req, { params, session }) => {
  const { id } = await params;
  
  const recommendations = await aiService.generateRecommendations(session.user.id, id);
  return NextResponse.json({ success: true, data: recommendations }, { status: 200 });
});

export const GET = withApiAuthAndError(async (req, { params, session }) => {
  const { id } = await params;
  const recommendations = await aiService.getGoalRecommendations(id, session.user.id);
  return NextResponse.json({ success: true, data: recommendations }, { status: 200 });
});
