
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

let genAI: any = null;

export function getAI() {
  if (!API_KEY) return null;
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: API_KEY });
  }
  return {
    models: {
      generateContent: async (prompt: string, systemInstruction?: string) => {
        if (!genAI) return null;
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: systemInstruction 
        });
        const result = await model.generateContent(prompt);
        return { text: result.response.text() };
      }
    }
  };
}
