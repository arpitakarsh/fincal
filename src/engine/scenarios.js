import { calcAll } from './formulas.js';

const SCENARIOS = [
  { id: 'conservative', label: 'Conservative', ret: 8, color: '#64748b' },
  { id: 'moderate',     label: 'Moderate',     ret: 10, color: '#224c87' },
  { id: 'aggressive',  label: 'Aggressive',   ret: 12, color: '#059669' },
];

export function calcScenarios({ cost, inflation, yrs, lumpsum = 0 }) {
  return SCENARIOS.map(s => ({
    ...s,
    ...calcAll({ cost, inflation, yrs, annualRet: s.ret, lumpsum }),
  }));
}

export { SCENARIOS };