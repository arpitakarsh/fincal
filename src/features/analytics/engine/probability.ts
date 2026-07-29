import { RETURN_BUCKETS } from './config';

export interface BucketProbability {
  bucketId: string;
  label: string;
  probabilityPercent: number;
  occurrences: number;
}

export function generateProbabilityDistribution(rollingReturns: number[]): BucketProbability[] {
  const total = rollingReturns.length;
  if (total === 0) return [];

  const counts: Record<string, number> = {};
  RETURN_BUCKETS.forEach(b => counts[b.id] = 0);

  rollingReturns.forEach(ret => {
    const bucket = RETURN_BUCKETS.find(b => ret >= b.min && ret < b.max);
    if (bucket) {
      counts[bucket.id]++;
    }
  });

  return RETURN_BUCKETS.map(b => ({
    bucketId: b.id,
    label: b.label,
    occurrences: counts[b.id],
    probabilityPercent: Math.round((counts[b.id] / total) * 1000) / 10,
  }));
}
