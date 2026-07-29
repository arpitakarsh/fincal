export interface RiskMetrics {
  bestCase: number;
  worstCase: number;
  median: number;
  percentile25: number;
  percentile75: number;
}

export function calculateRiskAnalytics(rollingReturns: number[]): RiskMetrics {
  if (rollingReturns.length === 0) {
    return { bestCase: 0, worstCase: 0, median: 0, percentile25: 0, percentile75: 0 };
  }

  const sorted = [...rollingReturns].sort((a, b) => a - b);
  const n = sorted.length;

  const getPercentile = (p: number) => {
    const index = (p / 100) * (n - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    if (upper >= n) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  return {
    bestCase: Math.round(sorted[n - 1] * 10) / 10,
    worstCase: Math.round(sorted[0] * 10) / 10,
    median: Math.round(getPercentile(50) * 10) / 10,
    percentile25: Math.round(getPercentile(25) * 10) / 10,
    percentile75: Math.round(getPercentile(75) * 10) / 10,
  };
}
