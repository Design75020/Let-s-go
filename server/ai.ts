
import { GoogleGenAI } from "@google/genai";

let aiInstance: any = null;

export function getAI() {
  if (aiInstance) return aiInstance;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not found in environment");
    return null;
  }

  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
}
