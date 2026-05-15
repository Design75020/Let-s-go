
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function optimizeMenuPrices(menuItems: { name: string; price: number; category: string }[]) {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not configured on client.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    En tant qu'expert en stratégie de prix pour restaurants, analyse le menu suivant et propose des optimisations de prix basées sur les tendances du marché (prix moyens, rentabilité, psychologie des prix).
    
    Menu actuel :
    ${menuItems.map(item => `- ${item.name} (${item.category}): ${item.price}€`).join('\n')}
    
    Donne tes conseils en quelques phrases concises et percutantes pour aider le restaurateur à augmenter ses marges ou son volume de ventes.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Price Optimization Error:", error);
    throw new Error("Impossible de générer des conseils d'optimisation via l'IA.");
  }
}
