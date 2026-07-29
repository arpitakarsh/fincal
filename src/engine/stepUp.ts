export function calculateStepUpSIP({ baseSIP, stepUpPercent, years }: { baseSIP: number, stepUpPercent: number, years: number }) {
  if (!stepUpPercent || stepUpPercent <= 0) {
    return {
      initialSIP: baseSIP,
      yearlyAmounts: Array.from({ length: years }, (_, i) => ({
        year: i + 1,
        sipAmount: baseSIP,
      })),
    };
  }

  const yearlyAmounts = [];
  let currentSIP = baseSIP;

  for (let year = 1; year <= years; year++) {
    yearlyAmounts.push({
      year,
      sipAmount: parseFloat(currentSIP.toFixed(2)),
    });
    currentSIP = currentSIP * (1 + stepUpPercent / 100);
  }

  return {
    initialSIP: parseFloat(baseSIP.toFixed(2)),
    yearlyAmounts,
  };
}