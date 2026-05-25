
import { auth } from '../lib/firebase';

const API_BASE = '/api';

export async function optimizeMenuPrices(menuItems: { name: string; price: number; category: string }[]) {
  const token = await auth.currentUser?.getIdToken();
  const response = await fetch(`${API_BASE}/ai/optimize-menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ menuItems })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'AI request failed');
  }

  const data = await response.json();
  return data.advice;
}
