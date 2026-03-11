export function calculateStepUpSIP({ baseSIP, stepUpPercent, years }) {
  const yearlyAmounts = [];
  let totalInvested = 0;

  for (let year = 1; year <= years; year++) {
    const sipThisYear = parseFloat(
      (baseSIP * Math.pow(1 + stepUpPercent / 100, year - 1)).toFixed(10)
    );
    yearlyAmounts.push({ year, sipAmount: parseFloat(sipThisYear.toFixed(2)) });
    totalInvested += sipThisYear * 12;
  }

  return {
    yearlyAmounts,
    totalInvested: parseFloat(totalInvested.toFixed(2)),
  };
}