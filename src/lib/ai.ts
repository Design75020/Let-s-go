// Rule: All AI logic is backend-only. No direct SDK initialization in frontend.

export async function askAI(prompt: string, context: string = "") {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context }),
    });
    
    if (!res.ok) throw new Error('AI Service Unavailable');
    
    const data = await res.json();
    return data.response;
  } catch (err) {
    console.error('AI Proxy Error:', err);
    return "Désolé, le service d'intelligence artificielle est temporairement indisponible.";
  }
}
