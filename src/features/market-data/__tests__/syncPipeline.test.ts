import { SyncPipeline } from '../jobs/syncPipeline';
import { IMarketDataProvider } from '../providers/interfaces/IMarketDataProvider';

class MockCorruptedProvider implements IMarketDataProvider {
  getProviderName() { return 'MockProvider'; }
  async fetchFundMetadata(externalId: string) {
    return {
      externalId,
      rawData: {
        name: 'Corrupted Fund',
        category: 'Large Cap',
        amcName: 'Test AMC',
        expenseRatio: -1.5, // INVALID: Negative expense ratio
        aumCr: 1000,
        launchDate: '2020-01-01T00:00:00Z',
        benchmark: 'Nifty 50'
      }
    };
  }
  async fetchPortfolioHoldings(id: string) { return { externalId: id, rawData: {} }; }
  async fetchHistoricalNav(id: string, d: Date) { return { externalId: id, rawData: {} }; }
}

async function runTests() {
  console.log('--- Sync Pipeline Test ---');
  const provider = new MockCorruptedProvider();
  const pipeline = new SyncPipeline(provider);

  console.log('Testing payload with negative expense ratio (should drop at validation boundary):');
  const result = await pipeline.syncFundMetadata('12345');
  console.log('Sync Result Success:', result.success);
}

runTests();
