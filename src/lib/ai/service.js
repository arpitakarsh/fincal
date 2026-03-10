const jsonModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: { responseMimeType: 'application/json' },
});

const textModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

export async function callAI(prompt, mode = 'json') {
  try {
    const m = mode === 'json' ? jsonModel : textModel;
    const result = await m.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Service Error:', error);
    return '';
  }
}