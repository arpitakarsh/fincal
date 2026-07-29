/**
 * Normalizes a metric from its raw range to a 0-1 score.
 * Higher is always better in the output.
 */

export function normalizeSharpe(sharpe: number | undefined): number {
  if (sharpe === undefined) return 0;
  // Standard range: 0.5 to 2.5
  return Math.min(Math.max((sharpe - 0.5) / 2.0, 0), 1);
}

export function normalizeExpenseRatio(expense: number | undefined): number {
  if (expense === undefined) return 0;
  // Lower is better. Range: 0.2% to 2.0%
  const normalized = 1 - Math.min(Math.max((expense - 0.2) / 1.8, 0), 1);
  return normalized;
}

export function normalizeDownsideCapture(capture: number | undefined): number {
  if (capture === undefined) return 0.5; // Neutral fallback
  // Lower is better (defensive). Range: 60% to 120%
  return 1 - Math.min(Math.max((capture - 60) / 60, 0), 1);
}

export function normalizeRollingReturn(cagr3Y: number | undefined): number {
  if (cagr3Y === undefined) return 0;
  // Assumes equity. Standard range: 8% to 20%
  return Math.min(Math.max((cagr3Y - 8) / 12, 0), 1);
}
