import { calculateSIP } from './formulas';

export function calculateDelay({ presentCost, inflation, annualReturn, years }) {
  const originalSIP = calculateSIP({ presentCost, inflation, annualReturn, years });

  return [1, 2, 3].map((delayYears) => {
    const remainingYears = years - delayYears;

    if (remainingYears <= 0) {
      return {
        delayYears,
        newSIP: 0,
        extraSIP: 0,
        extraTotal: 0,
      };
    }

    const newSIP = calculateSIP({
      presentCost,
      inflation,
      annualReturn,
      years: remainingYears,
    });

    const extraSIP = parseFloat((newSIP - originalSIP).toFixed(2));
    const extraTotal = parseFloat((extraSIP * remainingYears * 12).toFixed(2));

    return {
      delayYears,
      newSIP: parseFloat(newSIP.toFixed(2)),
      extraSIP,
      extraTotal,
    };
  });
}