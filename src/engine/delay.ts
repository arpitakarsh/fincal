import { calculateSIP } from '@/engine/formulas';

export function calculateCostOfDelay({ presentCost, inflation, annualReturn, years }: { presentCost: number, inflation: number, annualReturn: number, years: number }) {
  const baseSIP = calculateSIP({ presentCost, inflation, annualReturn, years });

  const delays = [1, 3, 5];
  const delayScenarios = delays.map((delayYears) => {
    const newYears = years - delayYears;
    if (newYears <= 0) return { delayYears, sip: null, difference: null };
    
    const delayedSIP = calculateSIP({ presentCost, inflation, annualReturn, years: newYears });
    return {
      delayYears,
      sip: delayedSIP,
      difference: parseFloat((delayedSIP - baseSIP).toFixed(2)),
    };
  });

  return {
    baseSIP,
    delayScenarios,
  };
}