import { GoogleGenAI } from "@google/genai";
import { config } from "./config";

let aiInstance: GoogleGenAI | null = null;

export const getAI = (): GoogleGenAI | null => {
  if (!aiInstance) {
    const apiKey = config.GEMINI_API_KEY;
    if (!apiKey || 
        apiKey === "MY_GEMINI_API_KEY" || 
        apiKey.trim() === "") {
       console.warn("GEMINI_API_KEY is missing on server. AI features disabled.");
       return null;
    }
    try {
      aiInstance = new GoogleGenAI({ apiKey });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI on server:", err);
      return null;
    }
  }
  return aiInstance;
};
