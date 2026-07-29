export interface MutualFund {
  isin: string;
  name: string;
  category: string;
  nav: number;
  expenseRatio: number;
  historicalReturns: {
    '1Y'?: number;
    '3Y'?: number;
    '5Y'?: number;
    '10Y'?: number;
  };
}
