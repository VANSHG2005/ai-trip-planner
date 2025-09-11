import {
  GoogleGenAI,
} from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
});

const model = 'gemini-2.5-flash';

/**
 * Function to generate content from the AI model
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
export const generateAiResponse = async (prompt) => {
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
    });
    const resultText = response.candidates[0].content.parts[0].text;
    return resultText;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Failed to generate AI response. Please check the console for details.";
  }
};