import { MutualFundData } from '../services/interfaces/IFundProvider';

/**
 * Filter out funds that are too new, too small, or missing critical data.
 */
export function validateFundEligibility(fund: MutualFundData): boolean {
  // Discard funds smaller than ₹500 Cr AUM (Liquidity/Safety risk)
  if (fund.aumCr < 500) return false;
  
  // Discard funds younger than 3 years
  const ageInMs = Date.now() - new Date(fund.launchDate).getTime();
  const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
  if (ageInYears < 3) return false;

  // Discard funds missing critical evaluation metrics
  if (fund.metrics.cagr3Y === undefined || fund.metrics.expenseRatio === undefined) {
    return false;
  }

  return true;
}
