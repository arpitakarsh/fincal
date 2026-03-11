export function calculateLumpsum({ lumpsumAmount, annualReturn, years }) {
  if (!lumpsumAmount || lumpsumAmount <= 0) return { lumpsumFV: 0 };

  const lumpsumFV = parseFloat(
    (lumpsumAmount * Math.pow(1 + annualReturn / 100, years)).toFixed(10)
  );

  return { lumpsumFV: parseFloat(lumpsumFV.toFixed(2)) };
}