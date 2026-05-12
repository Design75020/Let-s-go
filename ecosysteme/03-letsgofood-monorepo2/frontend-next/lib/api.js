import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://letsgofood-monorepo2-production.up.railway.app';

// Client-side API instance (with auth token from localStorage)
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('foodrush_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('foodrush_token', token);
  else localStorage.removeItem('foodrush_token');
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('foodrush_token');
}

export function formatApiError(detail) {
  if (detail == null) return 'Une erreur s\'est produite.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e))).filter(Boolean).join(' ');
  if (detail && typeof detail.msg === 'string') return detail.msg;
  return String(detail);
}

// Server-side fetch (no auth token, for SSR/SSG)
export async function serverFetch(path) {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const STATUS_LABELS = {
  pending: 'En attente',
  preparing: 'En préparation',
  ready: 'Prêt',
  assigned: 'Assigné',
  picked_up: 'Récupéré',
  delivering: 'En livraison',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

export const STATUS_COLORS = {
  pending: 'status-pending',
  preparing: 'status-preparing',
  ready: 'status-ready',
  assigned: 'status-assigned',
  picked_up: 'status-delivering',
  delivering: 'status-delivering',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
};

export default api;
