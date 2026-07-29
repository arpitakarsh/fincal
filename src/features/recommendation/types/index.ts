export enum FundCategory {
  LARGE_CAP = 'Large Cap',
  FLEXI_CAP = 'Flexi Cap',
  MID_CAP = 'Mid Cap',
  SMALL_CAP = 'Small Cap',
  LARGE_MID_CAP = 'Large & Mid Cap',
  MULTI_ASSET = 'Multi Asset',
  BALANCED_ADVANTAGE = 'Balanced Advantage',
  AGGRESSIVE_HYBRID = 'Aggressive Hybrid',
  EQUITY_SAVINGS = 'Equity Savings',
  ELSS = 'ELSS',
  GOLD = 'Gold',
  DEBT_SHORT_DURATION = 'Short Duration Debt',
  LIQUID = 'Liquid',
  MONEY_MARKET = 'Money Market',
  CORPORATE_BOND = 'Corporate Bond',
  DYNAMIC_BOND = 'Dynamic Bond',
}

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface CategoryRecommendation {
  category: FundCategory;
  score: number;
  confidence: ConfidenceLevel;
  reason: string;
  risks: string;
  typicalHorizon: string;
  expectedVolatility: string;
}

export interface ScoringFactor {
  category: FundCategory;
  baseScore: number;
  horizonMultiplier: number;
  riskMultiplier: number;
}
