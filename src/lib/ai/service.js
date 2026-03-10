import { GoogleGenerativeAI } from '@google/generative-ai';

export async function callAI(prompt, mode = 'json') {
  // March 2026 Latest: 3.1 Flash-Lite is 2.5x faster for JSON extraction
  const MODEL_NAME = 'gemini-3.1-flash-lite-preview';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY is missing from .env");
    return '';
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      ...(mode === 'json' && { 
        generationConfig: { 
          responseMimeType: 'application/json' 
        } 
      }),
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    // Fallback: If 3.1 Preview ever breaks, try gemini-3-flash
    console.error('AI Service Error:', error.message);
    return '';
  }
}