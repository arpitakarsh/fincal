import { calcAll } from '@/engine/formulas';
import { SensitivityPoint } from '@/types/analytics';

const INFLATION_SPREAD = [-2, -1, 0, 1, 2, 3];
const RETURN_SPREAD = [-4, -2, 0, 2, 4, 6];

export function calcSensitivity({ cost, yrs }: { cost: number, yrs: number }): SensitivityPoint[] {
  const results: SensitivityPoint[] = [];
  const baseInf = 6;
  const baseRet = 10;

  for (const iDiff of INFLATION_SPREAD) {
    for (const rDiff of RETURN_SPREAD) {
      const inf = Math.max(0, baseInf + iDiff);
      const ret = Math.max(1, baseRet + rDiff);
      const { sip, fv } = calcAll({ cost, inflation: inf, yrs, annualRet: ret, lumpsum: 0 });
      results.push({ inflation: inf, return: ret, sip, fv });
    }
  }
  return results;
}