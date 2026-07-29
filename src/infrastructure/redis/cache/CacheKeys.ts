/**
 * Centralized key generation factory.
 * Prevents typos and ensures namespacing is consistent across the app.
 */
export const CacheKeys = {
  // --- AI Namespace ---
  aiQuery: (userId: string, queryHash: string) => `ai:user:${userId}:query:${queryHash}`,
  aiEducational: (termHash: string) => `ai:edu:${termHash}`,
  
  // --- Fund Data Namespace ---
  fundMetadata: (fundId: string) => `fund:meta:${fundId}`,
  fundHistoricalNav: (fundId: string, year: number) => `fund:nav:${fundId}:${year}`,
  
  // --- Analytics Namespace ---
  rollingReturns: (fundId: string, periodYears: number) => `analytics:rolling:${fundId}:${periodYears}`,
  recommendationProfile: (profileHash: string) => `rec:profile:${profileHash}`,
  
  // --- Rate Limit Namespace ---
  rateLimitIp: (ip: string, endpoint: string) => `ratelimit:ip:${ip}:${endpoint}`,
};
