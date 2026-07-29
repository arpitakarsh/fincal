import { GoalCategory } from '@/types/common';
import { ValidationError, ValidationWarning } from '@/types/analytics';

const COST_BOUNDS: Record<string, { min: number; max: number }> = {
  house:      { min: 1000000, max: 100000000 },
  education:  { min: 100000, max: 10000000 },
  healthcare: { min: 50000, max: 10000000 },
  wedding:    { min: 100000, max: 10000000 },
  travel:     { min: 50000, max: 5000000 },
  car:        { min: 100000, max: 10000000},
  general:    { min: 10000, max: 100000000},
};

export function getHardErrors({ cost, yrs, inflation, annualRet }: { cost: number, yrs: number, inflation: number, annualRet: number }): ValidationError[] {
  const errs: ValidationError[] = [];
  if (!cost || cost <= 0)        errs.push({ field: 'cost',      message: 'Enter a valid goal amount' });
  if (!yrs || yrs <= 0)          errs.push({ field: 'yrs',       message: 'Enter a valid time horizon' });
  if (inflation == null || inflation < 0) errs.push({ field: 'inflation', message: 'Enter a valid inflation rate' });
  if (!annualRet || annualRet <= 0)       errs.push({ field: 'annualRet', message: 'Enter a valid return rate' });
  return errs;
}

export function getSoftWarnings({ cost, yrs, annualRet, goalType, riskProfile }: { cost: number, yrs: number, annualRet: number, goalType: GoalCategory, riskProfile: string }): ValidationWarning[] {
  const warns: ValidationWarning[] = [];
  const bounds = COST_BOUNDS[goalType];

  if (bounds) {
    if (cost < bounds.min) warns.push({ field: 'cost', message: `Cost seems low for a ${goalType} goal` });
    if (cost > bounds.max) warns.push({ field: 'cost', message: `Cost seems high for a ${goalType} goal` });
  }

  if (yrs < 1)  warns.push({ field: 'yrs', message: 'Timeline is very short' });
  if (yrs > 40) warns.push({ field: 'yrs', message: 'Timeline is unusually long' });

  if (riskProfile === 'growth' && yrs < 3)  warns.push({ field: 'annualRet', message: 'Growth profile is risky for short timelines' });
  if (riskProfile === 'safe'   && yrs > 10) warns.push({ field: 'annualRet', message: 'Safe profile may underperform for long timelines' });

  return warns;
}

export function computeConfidenceScore({ presentCost, years, inflation, annualReturn, goalType }: { presentCost: number, years: number, inflation: number, annualReturn: number, goalType: GoalCategory }): number {
  let score = 100;
  if (annualReturn > 14) score -= 30;
  if (inflation < 4) score -= 20;
  if (years < 2) score -= 25;
  if (presentCost > 50000000) score -= 15;
  return Math.max(10, Math.min(score, 95));
}
