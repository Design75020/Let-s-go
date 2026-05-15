
import { GoogleGenAI } from "@google/genai";

export async function optimizeMenuPrices(menuItems: { name: string; price: number; category: string }[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    En tant qu'expert en stratégie de prix pour restaurants, analyse le menu suivant et propose des optimisations de prix basées sur les tendances du marché (prix moyens, rentabilité, psychologie des prix).
    
    Menu actuel :
    ${menuItems.map(item => `- ${item.name} (${item.category}): ${item.price}€`).join('\n')}
    
    Donne tes conseils en quelques phrases concises et percutantes pour aider le restaurateur à augmenter ses marges ou son volume de ventes.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });
    
    return response.text || "Aucun conseil généré.";
  } catch (error) {
    console.error("AI Price Optimization Error:", error);
    throw new Error("Impossible de générer des conseils d'optimisation via l'IA.");
  }
}
