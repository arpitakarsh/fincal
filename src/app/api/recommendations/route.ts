import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/backend/infrastructure/database/client';
import { auth } from '@/lib/auth';
import { AIRecommendationService } from '@/backend/services/AIRecommendationService';
import { withApiAuthAndError } from '@/lib/apiWrapper';
import { z } from 'zod';

const recService = new AIRecommendationService();

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const goalId = url.searchParams.get("goalId");

  const whereClause: any = { goal: { userId: session.user.id } };
  if (goalId) {
    whereClause.goalId = goalId;
  }

  const recommendations = await prisma.aIRecommendation.findMany({
    where: whereClause,
    include: { goal: true },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ recommendations });
}

const reqSchema = z.object({
  goalId: z.uuid()
});

export const POST = withApiAuthAndError(async (req, { session }) => {
  const body = await req.json();
  const { goalId } = reqSchema.parse(body);
  const recommendations = await recService.generateRecommendations(session.user.id, goalId);
  return NextResponse.json({ recommendations });
});
