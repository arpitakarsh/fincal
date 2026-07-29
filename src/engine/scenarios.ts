import { calcAll } from '@/engine/formulas';
import { CalculationInputs } from '@/types/analytics';

export interface Scenario {
  id: string;
  label: string;
  ret: number;
  color: string;
  fv?: number;
  sip?: number;
  invested?: number;
  returns?: number;
}

const SCENARIOS: Scenario[] = [
  { id: 'conservative', label: 'Conservative', ret: 8, color: '#64748b' },
  { id: 'moderate',     label: 'Moderate',     ret: 10, color: '#224c87' },
  { id: 'aggressive',  label: 'Aggressive',   ret: 12, color: '#059669' },
];

export function calcScenarios({ cost, inflation, yrs, lumpsum = 0 }: Omit<CalculationInputs, 'annualRet'>) {
  return SCENARIOS.map(s => ({
    ...s,
    ...calcAll({ cost, inflation, yrs, annualRet: s.ret, lumpsum }),
  }));
}

export { SCENARIOS };