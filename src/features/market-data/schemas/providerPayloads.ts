import { z } from 'zod';

// We never trust the provider. Everything must pass this schema.
export const ProviderFundMetadataSchema = z.object({
  externalId: z.string(),
  name: z.string(),
  category: z.string(),
  amcName: z.string(),
  expenseRatio: z.number().min(0).max(5), // Sanity check
  aumCr: z.number().min(0),
  launchDate: z.string().datetime(), // Must be ISO
  benchmark: z.string()
});

export const ProviderHistoricalNavSchema = z.object({
  externalId: z.string(),
  dataPoints: z.array(z.object({
    date: z.string().datetime(),
    nav: z.number().positive()
  }))
});
