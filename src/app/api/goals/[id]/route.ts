import { NextResponse } from 'next/server';
import { GoalService } from '@/backend/services/GoalService';
import { updateGoalSchema } from '@/shared/dtos/goal.dto';
import { withApiAuthAndError } from '@/lib/apiWrapper';

const goalService = new GoalService();

export const GET = withApiAuthAndError(async (req, { params, session }) => {
  const { id } = await params;
  const goal = await goalService.getGoalById(id, session.user.id);
  if (!goal) throw new Error('Goal not found');
  return NextResponse.json({ success: true, data: goal });
});

export const PATCH = withApiAuthAndError(async (req, { params, session }) => {
  const { id } = await params;
  const body = await req.json();
  const validatedData = updateGoalSchema.parse(body);
  const updatedGoal = await goalService.updateGoal(id, session.user.id, validatedData);
  if (!updatedGoal) throw new Error('Goal not found');
  return NextResponse.json({ success: true, data: updatedGoal });
});

export const DELETE = withApiAuthAndError(async (req, { params, session }) => {
  const { id } = await params;
  await goalService.deleteGoal(id, session.user.id);
  return NextResponse.json({ success: true, message: 'Goal deleted' });
});
