import { NextResponse } from 'next/server';
import { GoalService } from '@/backend/services/GoalService';
import { goalSchema } from '@/shared/dtos/goal.dto';
import { withApiAuthAndError } from '@/lib/apiWrapper';

const goalService = new GoalService();

export const GET = withApiAuthAndError(async (req, { session }) => {
  const goals = await goalService.getUserGoals(session.user.id);
  return NextResponse.json({ success: true, data: goals });
});

export const POST = withApiAuthAndError(async (req, { session }) => {
  const body = await req.json();
  const validatedData = goalSchema.parse(body);
  const newGoal = await goalService.createGoal(session.user.id, validatedData);
  return NextResponse.json({ success: true, data: newGoal }, { status: 201 });
});
