import { callAI } from '../../../lib/ai/service';
import { INSIGHT_PROMPT, VALIDATOR_PROMPT, PARSER_PROMPT } from '../../../lib/ai/prompts';
import { parseGoalResponse, parseValidatorResponse } from '../../../lib/ai/parser';

export async function POST(req) {
  const body = await req.json();
  const { type, data } = body;

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
    return Response.json({ result: parseGoalResponse(raw) });
  }

  return Response.json({ error: 'Invalid type' }, { status: 400 });
}