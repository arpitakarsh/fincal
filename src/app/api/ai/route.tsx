// @ts-nocheck
import { callAI } from '@/services/ai.service';
import { INSIGHT_PROMPT, VALIDATOR_PROMPT, PARSER_PROMPT } from '@/services/ai.prompts';
import { parseGoalResponse, parseValidatorResponse } from '@/services/ai.parser';

export async function POST(req) {
  const body = await req.json();
  const { type, data } = body;
  console.log('AI request:', type, data);

  if (type === 'insight') {
    const raw = await callAI(INSIGHT_PROMPT(data), 'text');
    return Response.json({ result: raw });
  }

  if (type === 'validator') {
    const raw = await callAI(VALIDATOR_PROMPT(data), 'json');
    return Response.json({ result: parseValidatorResponse(raw) });
  }

  if (type === 'parser') {
    const raw = await callAI(PARSER_PROMPT(data.text), 'json');
    console.log('AI raw response:', raw);
    return Response.json({ result: parseGoalResponse(raw) });
  }

  return Response.json({ error: 'Invalid type' }, { status: 400 });
}