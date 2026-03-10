import { calcSIP, calcFV } from './formulas.js';

const INFLATIONS = [4, 6, 8, 10, 12, 14];
const RETURNS = [6, 8, 10, 12, 14, 16];

export function calcSensitivity({ cost, yrs }) {
  return INFLATIONS.map(inf => ({
    inflation: inf,
    cols: RETURNS.map(ret => ({
      return: ret,
      sip: calcSIP(calcFV(cost, inf, yrs), ret, yrs),
    })),
  }));
}

export { INFLATIONS, RETURNS };