import { InvestorProfileData } from '@/features/investor/schemas/investor.schema';
import { FundCategory, CategoryRecommendation } from '../types';
import { calculateScore } from './scoring';
import { generateExplanation } from './explainer';
import { CATEGORY_DEFINITIONS } from './rules';

export function recommendCategories(profile: InvestorProfileData): CategoryRecommendation[] {
  // Guard against missing essential data
  if (!profile.targetYear || !profile.riskAppetite) {
    throw new Error('Incomplete profile: Missing targetYear or riskAppetite');
  }

  const recommendations: CategoryRecommendation[] = [];

  // Evaluate all known categories
  const categoriesToEvaluate = [
    FundCategory.FLEXI_CAP,
    FundCategory.LARGE_CAP,
    FundCategory.LIQUID,
    FundCategory.AGGRESSIVE_HYBRID,
  ];

  categoriesToEvaluate.forEach(category => {
    const score = calculateScore(profile, category);
    
    if (score > 0) {
      const expl = generateExplanation(category, score);
      const def = CATEGORY_DEFINITIONS[category];
      
      recommendations.push({
        category,
        score,
        confidence: expl.confidence,
        reason: expl.reason,
        risks: expl.risks,
        typicalHorizon: def.typicalHorizon,
        expectedVolatility: def.volatility,
      });
    }
  });

  // Sort descending by score
  return recommendations.sort((a, b) => b.score - a.score);
}
