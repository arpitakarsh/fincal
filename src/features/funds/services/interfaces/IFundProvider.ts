export interface FundBaseData {
  isin: string;
  name: string;
  category: string;
  amcName: string;
  expenseRatio: number;
  aumCr: number;
  launchDate: Date;
  benchmark: string;
}

export interface FundQuantitativeMetrics {
  cagr1Y?: number;
  cagr3Y?: number;
  cagr5Y?: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
  alpha?: number;
  beta?: number;
  stdDev?: number;
  maxDrawdown?: number;
  upsideCapture?: number;
  downsideCapture?: number;
}

export interface MutualFundData extends FundBaseData {
  metrics: FundQuantitativeMetrics;
}

export interface IFundProvider {
  /**
   * Fetch a specific fund by ISIN
   */
  getFundByIsin(isin: string): Promise<MutualFundData | null>;
  
  /**
   * Search for funds matching criteria
   */
  searchFunds(query: string, category?: string): Promise<MutualFundData[]>;
  
  /**
   * Get all funds within a specific category
   */
  getFundsByCategory(category: string): Promise<MutualFundData[]>;
}
