import { GoalCategory } from '@/types/common';

export const INSIGHT_PROMPT = ({ goalType, cost, sip, yrs, inflation, annualRet }: { goalType: GoalCategory, cost: number, sip: number, yrs: number, inflation: number, annualRet: number }) => 
  `You are a financial advisor. The user is planning for a ${goalType} goal costing ₹${cost} in today's terms. ` +
  `They want to achieve this in ${yrs} years. ` +
  `We assume inflation is ${inflation}% p.a. and their investments will grow at ${annualRet}% p.a. ` +
  `Based on this, their required monthly SIP is ₹${sip}. ` +
  `Write a short, encouraging 2-3 sentence insight (max 40 words) about this plan. Be specific but simple. Do not give direct stock/fund advice.`;


export const VALIDATOR_PROMPT = ({ goalType, cost, inflation, annualRet, yrs }: { goalType: GoalCategory, cost: number, inflation: number, annualRet: number, yrs: number }) =>
  `Act as a harsh but fair financial reality-checker. ` +
  `Goal: ${goalType}. Cost today: ₹${cost}. Years: ${yrs}. Inflation assumption: ${inflation}%. Expected return: ${annualRet}%. ` +
  `Respond with a JSON object exactly like this: {"score": 85, "feedback": "Your reason here"} ` +
  `Score is 1-100 (100 being extremely realistic/safe, 1 being totally unrealistic). ` +
  `Deduct points for: Returns > 12%, Inflation < 6%, Time horizon < 3 years for equity, or unreasonably low cost for the goal type. ` +
  `Keep feedback under 20 words. No markdown, just raw JSON.`;


export const PARSER_PROMPT = (text: string) =>
  `Extract financial goal data from this text: "${text}". ` +
  `Return ONLY a valid JSON object with the following optional keys: ` +
  `- goalType (string: "house", "education", "wedding", "car", "travel", "healthcare", "general") ` +
  `- cost (number: amount in INR) ` +
  `- yrs (number: time horizon in years) ` +
  `- inflation (number: inflation percentage) ` +
  `- annualRet (number: expected return percentage) ` +
  `Infer standard values if vague (e.g. "a few years" = 3). If a unit like "lakhs" or "crores" is used, convert to raw numbers (e.g., 50 lakhs = 5000000). ` +
  `No extra text or markdown formatting. ONLY JSON.`;
