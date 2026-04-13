import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const model = 'gemini-2.5-flash';

let aiInstance = null;
const getAI = () => {
  if (!aiInstance && API_KEY && API_KEY !== 'your_gemini_api_key_here') {
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiInstance;
};

/**
 * Generate AI response with retry logic + timeout
 */
export const generateAiResponse = async (prompt, retries = 2) => {
  const ai = getAI();
  if (!ai) throw new Error('GEMINI_NO_KEY');

  const contents = [{ role: 'user', parts: [{ text: prompt }] }];

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({ model, contents });
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from AI');
      return text;
    } catch (error) {
      const isLast = attempt === retries;
      if (isLast) {
        console.error('AI Generation Error (final attempt):', error);
        throw error;
      }
      // Wait before retry: 1s, 2s
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
};

/**
 * Parse AI JSON response safely, stripping markdown fences
 */
export const parseAiJson = (raw) => {
  if (!raw) return null;
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
};

/**
 * Check if API key is configured
 */
export const hasGeminiKey = () =>
  !!(API_KEY && API_KEY !== 'your_gemini_api_key_here');
