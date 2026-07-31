import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../../lib/logger';

export async function callAI(prompt: string, mode = 'json'): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error('AI configuration error: GEMINI_API_KEY missing');
      throw new Error('GEMINI_API_KEY is not configured in the environment');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: mode === 'json' ? "application/json" : "text/plain",
      }
    });

    const result = await model.generateContent(prompt);
    
    // Add validation for empty or malformed responses
    if (!result || !result.response) {
      throw new Error('Received empty response from Gemini API');
    }

    const responseText = result.response.text();
    if (!responseText) {
      throw new Error('Received blank text from Gemini API');
    }
    
    return responseText;
  } catch (error: any) {
    // Do not log the full error object if it contains sensitive tokens, just log message and status
    logger.error('Gemini API Error', { message: error.message, status: error.status });
    
    if (error.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
      throw new Error('AI API rate limit exceeded or quota exhausted.');
    }
    if (error.status === 403 || error?.message?.includes('403') || error?.message?.includes('API key not valid')) {
      throw new Error('AI API key is invalid or unauthorized.');
    }
    if (error.message && error.message.includes('fetch')) {
      throw new Error('Network failure while communicating with AI service.');
    }

    // Surface real error
    throw new Error(`AI error: ${error.message || 'Unknown failure'}`);
  }
}