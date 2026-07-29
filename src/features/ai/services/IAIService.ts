import { GoalRealityResponse, EducationalTipResponse, RecommendationExplanationResponse } from '../schemas/aiResponses';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalCostUsd: number;
}

export interface IAIService {
  /**
   * Evaluates if a goal is realistic based on the deterministic probability engine output.
   */
  analyzeGoalReality(
    goalDetails: any, 
    probabilityOutput: any
  ): Promise<{ data: GoalRealityResponse, usage: TokenUsage }>;

  /**
   * Generates a jargon-free educational tooltip.
   */
  generateEducationalTip(
    financialTerm: string
  ): Promise<{ data: EducationalTipResponse, usage: TokenUsage }>;

  /**
   * Explains a specific mutual fund recommendation based on the quantitative engine score.
   */
  explainRecommendation(
    fundQualityScore: any
  ): Promise<{ data: RecommendationExplanationResponse, usage: TokenUsage }>;
}

/**
 * Interface ready for future Redis implementation.
 */
export interface ICacheManager {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
}
