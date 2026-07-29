import { z } from 'zod';

export const GoalRealityResponseSchema = z.object({
  isRealistic: z.boolean(),
  explanation: z.string(),
  actionItems: z.array(z.string()).min(1),
  riskWarnings: z.array(z.string()).optional()
});
export type GoalRealityResponse = z.infer<typeof GoalRealityResponseSchema>;

export const EducationalTipResponseSchema = z.object({
  term: z.string(),
  simpleDefinition: z.string(),
  whyItMatters: z.string(),
  commonMisconception: z.string()
});
export type EducationalTipResponse = z.infer<typeof EducationalTipResponseSchema>;

export const RecommendationExplanationSchema = z.object({
  whyRecommended: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  idealInvestor: z.string()
});
export type RecommendationExplanationResponse = z.infer<typeof RecommendationExplanationSchema>;
