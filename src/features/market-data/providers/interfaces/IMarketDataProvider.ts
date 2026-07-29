import { MutualFundData } from '@/features/funds/services/interfaces/IFundProvider';

export interface RawProviderPayload {
  externalId: string;
  rawData: any;
}

/**
 * Master interface that any external vendor adapter must implement.
 */
export interface IMarketDataProvider {
  getProviderName(): string;
  
  /**
   * Fetches core metadata (AUM, Expense Ratio, Launch Date).
   */
  fetchFundMetadata(externalId: string): Promise<RawProviderPayload>;
  
  /**
   * Fetches deep portfolio holdings and sector distributions.
   */
  fetchPortfolioHoldings(externalId: string): Promise<RawProviderPayload>;
  
  /**
   * Fetches historical daily NAV arrays for rolling calculations.
   */
  fetchHistoricalNav(externalId: string, startDate: Date): Promise<RawProviderPayload>;
}
