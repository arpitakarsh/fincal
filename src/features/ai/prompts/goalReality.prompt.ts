import { BASE_SYSTEM_PROMPT } from './system.prompt';

export function buildGoalRealityPrompt(goalDetails: any, successProbability: number): string {
  return `
${BASE_SYSTEM_PROMPT}

TASK: Evaluate the reality of the user's investment goal based on the deterministic success probability provided.

CONTEXT:
- Goal: ${JSON.stringify(goalDetails)}
- Engine Calculated Success Probability: ${successProbability}%

INSTRUCTIONS:
1. If probability < 50%, flag it as unrealistic. Suggest actionable changes (increase SIP, increase horizon, reduce target).
2. If probability >= 50% and < 80%, flag as somewhat realistic but needing a buffer.
3. If probability >= 80%, flag as highly realistic.
4. Output strictly according to the GoalRealityResponseSchema JSON structure.
  `;
}
