import { FundCategory } from '../types';
import { InvestorProfileData } from '@/features/investor/schemas/investor.schema';
import { getHorizonScore, getRiskScore, CATEGORY_DEFINITIONS } from './rules';

export function calculateScore(profile: InvestorProfileData, category: FundCategory): number {
  const def = CATEGORY_DEFINITIONS[category];
  if (!def) return 0;

  let totalScore = 0;

  // 1. Horizon Scoring
  const horizonScore = getHorizonScore(profile.targetYear, category);
  if (horizonScore === 0) return 0; // Absolute Veto
  totalScore += horizonScore;

  // 2. Risk Scoring
  const riskScore = getRiskScore(profile.riskAppetite, category);
  if (riskScore === 0) return 0; // Absolute Veto
  totalScore += riskScore;

  // 3. Goal Priority Scoring
  if (profile.goalType === 'retirement' && category === FundCategory.FLEXI_CAP) {
    totalScore += 20;
  }
  if (profile.goalType === 'house' && profile.targetYear - new Date().getFullYear() <= 2 && category === FundCategory.LIQUID) {
    totalScore += 20;
  }

  // Cap at 100
  return Math.min(totalScore, 100);
}
