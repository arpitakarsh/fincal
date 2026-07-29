import { GoalAssumptions } from '@/types/goal';

export interface Portfolio {
  id: string;
  userId: string;
  goals: GoalAssumptions[];
  createdAt: string;
  updatedAt: string;
}
