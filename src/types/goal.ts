import { GoalCategory, InflationSourceType, RiskProfileType } from '@/types/common';

export interface GoalAssumptions {
  goalType: GoalCategory;
  cost: number;
  yrs: number;
  inflation: number;
  inflationSrc: InflationSourceType;
  riskProfile: RiskProfileType;
  annualRet: number;
  stepUpOn: boolean;
  stepUpPct: number;
  lumpsumOn: boolean;
  lumpsum: number;
  activeSheet: boolean;
  activeAccordion: string | null;
  locks: {
    inflation: boolean;
    annualRet: boolean;
  };
}
