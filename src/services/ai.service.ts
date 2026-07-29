import { GoogleGenerativeAI } from '@google/generative-ai';

export async function callAI(prompt: string, mode = 'json'): Promise<string | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set');
      return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: mode === 'json' ? "application/json" : "text/plain",
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('AI Service Error:', error.message);
    } else {
      console.error('AI Service Error:', error);
    }
    return null;
  }
}