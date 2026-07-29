import { IMarketDataProvider } from '../providers/interfaces/IMarketDataProvider';
import { ProviderFundMetadataSchema } from '../schemas/providerPayloads';
import { MutualFundData } from '@/features/funds/services/interfaces/IFundProvider';

export class SyncPipeline {
  constructor(private provider: IMarketDataProvider) {}

  async syncFundMetadata(externalId: string): Promise<{ success: boolean; data?: MutualFundData; error?: any }> {
    try {
      // 1. Fetch
      const rawPayload = await this.provider.fetchFundMetadata(externalId);

      // 2. Validate
      const parsed = ProviderFundMetadataSchema.safeParse(rawPayload.rawData);
      if (!parsed.success) {
        console.error(`Validation Failed for ${externalId}`, parsed.error.format());
        return { success: false, error: 'Validation Failed' };
      }

      // 3. Normalize
      // (e.g. Map Morningstar's "Large-Cap" to our internal "Large Cap")
      const normalizedData = {
        ...parsed.data,
        launchDate: new Date(parsed.data.launchDate),
        // Placeholders for metrics we didn't fetch yet
        metrics: {}
      } as MutualFundData;

      // 4. Persist
      // await prisma.mutualFund.upsert(...)
      console.log(`Successfully synced metadata for ${normalizedData.name}`);
      
      return { success: true, data: normalizedData };

    } catch (e: any) {
      console.error(`Sync pipeline crashed for ${externalId}:`, e.message);
      // await prisma.syncLog.create({ data: { status: 'FAILED', ... }})
      return { success: false, error: e.message };
    }
  }
}
