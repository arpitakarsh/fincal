import { MutualFundData } from '../services/interfaces/IFundProvider';
import { validateFundEligibility } from './validation';
import { calculateFundScore, FundScore } from './scoring';
import { generateFundExplanation, FundExplanation } from './explainer';

export interface RankedFund extends MutualFundData {
  qualityScore: FundScore;
  explanation: FundExplanation;
  rank: number;
}

export function rankCategoryFunds(funds: MutualFundData[]): RankedFund[] {
  // 1. Validation
  const eligible = funds.filter(validateFundEligibility);

  // 2. & 3. Normalization and Scoring
  const scored = eligible.map(fund => {
    const score = calculateFundScore(fund);
    return { fund, score };
  });

  // 4. Ranking (Sort descending by total score)
  scored.sort((a, b) => b.score.total - a.score.total);

  // 5. Explanation generation and Assembly
  return scored.map((item, idx) => ({
    ...item.fund,
    qualityScore: item.score,
    explanation: generateFundExplanation(item.score),
    rank: idx + 1,
  }));
}
