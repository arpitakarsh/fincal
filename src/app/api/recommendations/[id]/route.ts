import { NextResponse } from 'next/server';
import { prisma } from '@/backend/infrastructure/database/client';
import { withApiAuthAndError } from '@/lib/apiWrapper';

export const GET = withApiAuthAndError(async (req, { params, session }) => {
  const { id } = await params;
  
  const recommendation = await prisma.aIRecommendation.findUnique({
    where: { id, userId: session.user.id }
  });

  if (!recommendation) throw new Error('Recommendation not found');

  return NextResponse.json({ success: true, data: { recommendation } });
});
