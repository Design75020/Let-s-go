
export async function optimizeMenuPrices(menuItems: { name: string; price: number; category: string }[]) {
  // SECURITY: Call backend proxy instead of using Gemini SDK directly on client
  try {
    const response = await fetch('/api/ai/optimize-menu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('lgf_token')}`
      },
      body: JSON.stringify({ items: menuItems })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erreur Kernel IA');
    }

    const data = await response.json();
    return data.advice || "Aucun conseil généré.";
  } catch (error) {
    console.error("AI Price Optimization Error:", error);
    throw new Error("Impossible de générer des conseils via le Kernel backend.");
  }
}
