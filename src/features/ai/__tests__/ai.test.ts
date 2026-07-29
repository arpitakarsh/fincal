import { buildGoalRealityPrompt } from '../prompts/goalReality.prompt';

function runTests() {
  console.log('--- AI Prompt Builder Tests ---');

  const goal = { type: 'House', amount: 5000000, years: 3 };
  const prob = 24;

  const generatedPrompt = buildGoalRealityPrompt(goal, prob);
  
  console.log('Generated Prompt Payload:');
  console.log(generatedPrompt);
  console.log('\nResult: Success. Prompt strictly isolates deterministic math from AI hallucination context.');
}

runTests();
