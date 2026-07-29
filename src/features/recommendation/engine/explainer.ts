import { FundCategory, ConfidenceLevel } from '../types';
import { CATEGORY_DEFINITIONS } from './rules';

export function generateExplanation(category: FundCategory, score: number): { reason: string, risks: string, confidence: ConfidenceLevel } {
  const def = CATEGORY_DEFINITIONS[category];
  
  if (!def) {
    return {
      reason: 'General portfolio allocation.',
      risks: 'Standard market risks apply.',
      confidence: 'Low'
    };
  }

  let confidence: ConfidenceLevel = 'Low';
  if (score >= 80) confidence = 'High';
  else if (score >= 50) confidence = 'Medium';

  return {
    reason: def.baseReason,
    risks: def.risks,
    confidence
  };
}
