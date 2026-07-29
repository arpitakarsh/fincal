import { MutualFundData } from '../services/interfaces/IFundProvider';
import { normalizeSharpe, normalizeExpenseRatio, normalizeDownsideCapture, normalizeRollingReturn } from './normalization';

export interface FundScore {
  total: number;
  breakdown: {
    sharpe: number;
    expense: number;
    downside: number;
    returns: number;
  };
}

const WEIGHTS = {
  SHARPE: 0.30,       // 30% Risk-adjusted returns
  EXPENSE: 0.15,      // 15% Cost efficiency
  DOWNSIDE: 0.25,     // 25% Capital protection
  RETURNS: 0.30,      // 30% Raw consistency
};

export function calculateFundScore(fund: MutualFundData): FundScore {
  const sharpeScore = normalizeSharpe(fund.metrics.sharpeRatio);
  const expenseScore = normalizeExpenseRatio(fund.expenseRatio);
  const downsideScore = normalizeDownsideCapture(fund.metrics.downsideCapture);
  const returnScore = normalizeRollingReturn(fund.metrics.cagr3Y);

  const total = (
    (sharpeScore * WEIGHTS.SHARPE) +
    (expenseScore * WEIGHTS.EXPENSE) +
    (downsideScore * WEIGHTS.DOWNSIDE) +
    (returnScore * WEIGHTS.RETURNS)
  ) * 100; // 0 to 100 scale

  return {
    total: Math.round(total * 10) / 10,
    breakdown: {
      sharpe: sharpeScore,
      expense: expenseScore,
      downside: downsideScore,
      returns: returnScore,
    }
  };
}
