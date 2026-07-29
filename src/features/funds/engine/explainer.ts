import { FundScore } from './scoring';

export interface FundExplanation {
  primaryStrength: string;
  primaryWeakness: string;
  reason: string;
}

export function generateFundExplanation(score: FundScore): FundExplanation {
  const b = score.breakdown;
  
  // Find highest metric
  let max = 'returns';
  let maxVal = b.returns;
  if (b.sharpe > maxVal) { max = 'sharpe'; maxVal = b.sharpe; }
  if (b.downside > maxVal) { max = 'downside'; maxVal = b.downside; }
  if (b.expense > maxVal) { max = 'expense'; maxVal = b.expense; }

  // Find lowest metric
  let min = 'returns';
  let minVal = b.returns;
  if (b.sharpe < minVal) { min = 'sharpe'; minVal = b.sharpe; }
  if (b.downside < minVal) { min = 'downside'; minVal = b.downside; }
  if (b.expense < minVal) { min = 'expense'; minVal = b.expense; }

  const textMap: Record<string, string> = {
    sharpe: 'excellent risk-adjusted returns compared to category peers',
    expense: 'a highly efficient, low-cost expense ratio',
    downside: 'strong downside protection during market corrections',
    returns: 'consistent rolling return outperformance',
  };

  const weakMap: Record<string, string> = {
    sharpe: 'takes higher unit risk for the return generated',
    expense: 'higher cost drag than optimal',
    downside: 'can fall heavier than peers during bear markets',
    returns: 'historical returns are slightly trailing top quartile',
  };

  return {
    primaryStrength: textMap[max] || 'overall balanced profile',
    primaryWeakness: weakMap[min] || 'average peer performance',
    reason: `Selected for its ${textMap[max]}.`,
  };
}
