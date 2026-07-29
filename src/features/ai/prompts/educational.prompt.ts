import { BASE_SYSTEM_PROMPT } from './system.prompt';

export function buildEducationalPrompt(financialTerm: string): string {
  return `
${BASE_SYSTEM_PROMPT}

TASK: Define the term "${financialTerm}" for a beginner investor.

INSTRUCTIONS:
1. Translate jargon into simple analogies if possible.
2. Explain why it actually matters to their money.
3. Highlight one common misconception retail investors have about it.
4. Output strictly according to the EducationalTipResponseSchema JSON structure.
  `;
}
