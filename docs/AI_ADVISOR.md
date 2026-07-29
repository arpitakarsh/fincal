# AI Financial Advisor

## Architecture Overview
The AI Financial Advisor module (`src/features/ai/`) acts strictly as a translation, education, and summarization layer on top of our deterministic engines.

## The Core Rule: No Math
The AI **never** calculates CAGR, SIP, or Probabilities. It only ingests the structured output of the `RecommendationEngine` and `ProbabilityEngine`. 

## Prompt Flow
All prompts are centralized in `src/features/ai/prompts/`. They embed strict instructions commanding the LLM to trust the provided mathematical payload blindly. 

## Zod Validation
To prevent unstructured conversational output ("Sure, I can help you with that!"), the `IAIService` demands structured JSON constrained by Zod schemas in `schemas/aiResponses.ts`. If the LLM output violates the schema, the service is built to reject it immediately.

## Future Provider Independence & Redis
The `IAIService` is an interface waiting for a concrete class (e.g. `OpenAIAdapter`, `AnthropicAdapter`). This prevents vendor lock-in. Furthermore, the `ICacheManager` interface is stubbed to allow future Redis caching. Because AI prompts are expensive and slow, if user A asks for an educational tip on "Sharpe Ratio", it should hit the LLM once, cache the JSON in Redis for 30 days, and serve it instantly to User B.
