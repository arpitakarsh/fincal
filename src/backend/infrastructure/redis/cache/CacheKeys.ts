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
  
  // --- User Domain Namespace ---
  userGoals: (userId: string) => `user:${userId}:goals`,
  userPortfolio: (userId: string) => `user:${userId}:portfolio`,
  userInsights: (userId: string) => `user:${userId}:insights`,
  
  // --- Rate Limit Namespace ---
  rateLimitIp: (ip: string, endpoint: string) => `ratelimit:ip:${ip}:${endpoint}`,

  // --- Market Data Namespace ---
  marketData: (key: string) => `market:${key}`,
};
