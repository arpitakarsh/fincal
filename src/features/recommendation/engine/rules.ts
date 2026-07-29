import { FundCategory } from '../types';

export const CATEGORY_DEFINITIONS = {
  [FundCategory.FLEXI_CAP]: {
    horizonMin: 5,
    riskMin: 'moderate',
    volatility: 'High',
    typicalHorizon: '5-7+ years',
    baseReason: 'Excellent for long-term wealth creation with diversified exposure.',
    risks: 'Subject to market volatility. Fund manager bias can lead to underperformance.',
  },
  [FundCategory.LARGE_CAP]: {
    horizonMin: 3,
    riskMin: 'moderate',
    volatility: 'Medium-High',
    typicalHorizon: '3-5+ years',
    baseReason: 'Provides stability to the equity portfolio by investing in top 100 companies.',
    risks: 'May underperform mid/small caps in strong bull runs.',
  },
  [FundCategory.LIQUID]: {
    horizonMin: 0,
    riskMin: 'low',
    volatility: 'Very Low',
    typicalHorizon: '1-6 months',
    baseReason: 'Ideal for parking emergency funds safely with high liquidity.',
    risks: 'Returns may not beat inflation.',
  },
  [FundCategory.AGGRESSIVE_HYBRID]: {
    horizonMin: 3,
    riskMin: 'moderate',
    volatility: 'Medium',
    typicalHorizon: '3-5 years',
    baseReason: 'Balances growth with debt cushion during market falls.',
    risks: 'Debt taxation rules apply depending on equity allocation.',
  },
  // Add other definitions here for brevity...
};

export function getHorizonScore(targetYear: number, category: FundCategory): number {
  const currentYear = new Date().getFullYear();
  const horizon = targetYear - currentYear;
  
  if (category === FundCategory.FLEXI_CAP) {
    if (horizon < 3) return 0; // Veto
    if (horizon >= 7) return 40;
    return 20;
  }
  
  if (category === FundCategory.LIQUID) {
    if (horizon > 3) return 5;
    return 40;
  }
  
  if (category === FundCategory.LARGE_CAP) {
    if (horizon < 2) return 0; // Veto
    if (horizon >= 5) return 30;
    return 15;
  }

  return 10; // Default fallback
}

export function getRiskScore(riskAppetite: string, category: FundCategory): number {
  if (category === FundCategory.FLEXI_CAP) {
    if (riskAppetite === 'low') return 0; // Veto
    if (riskAppetite === 'high') return 40;
    return 20;
  }
  
  if (category === FundCategory.LIQUID) {
    if (riskAppetite === 'low') return 30;
    return 10;
  }
  
  if (category === FundCategory.LARGE_CAP) {
    if (riskAppetite === 'low') return 0;
    if (riskAppetite === 'moderate') return 30;
    return 20;
  }
  
  return 10;
}
