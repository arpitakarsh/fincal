export function calculateLumpsum({ lumpsumAmount, annualReturn, years }: { lumpsumAmount: number, annualReturn: number, years: number }) {
  if (!lumpsumAmount || lumpsumAmount <= 0) return { lumpsumFV: 0 };
  const rate = annualReturn / 100;
  const fv = lumpsumAmount * Math.pow(1 + rate, years);
  return { lumpsumFV: parseFloat(fv.toFixed(10)) };
}