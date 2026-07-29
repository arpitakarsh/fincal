import { GoalCategory } from '@/types/common';

export function getInflationDefault(goalType: GoalCategory): number {
  const map: Record<GoalCategory, number> = { 
    house: 9, 
    education: 11, 
    healthcare: 9, 
    wedding: 8, 
    travel: 6.5, 
    car: 6, 
    general: 6 
  };
  return map[goalType] ?? 6;
}

export function getReturnDefault(years: number): { ret: number, fund: string } {
  if (years < 3) return { ret: 6.5, fund: 'Debt' };
  if (years <= 5) return { ret: 9.5, fund: 'Hybrid' };
  return { ret: 12, fund: 'Equity' };
}