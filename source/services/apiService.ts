/**
 * LetsGoFood V15 — Unified API Service (Single Source of Truth)
 *
 * FIX: Replaces direct Firestore reads in frontend apps with REST API calls.
 * Backend Prisma/SQLite is the canonical source of truth for orders.
 * Firebase is used ONLY for auth (token) and restaurant/menu data (Firestore).
 */
import { auth } from '../lib/firebase';

const API_BASE = '/api';

// ─────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken().catch(() => null);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || `API error ${response.status}`);
  }
  return response.json();
}

// ─────────────────────────────────────────────
// Orders — canonical SSoT (Prisma backend)
// ─────────────────────────────────────────────
export const OrdersAPI = {
  /** List recent orders from backend (canonical SSoT) */
  list: () => apiFetch('/orders'),

  /** Get a single order by ID */
  get: (id: string) => apiFetch(`/orders/${id}`),

  /** Create a new order */
  create: (data: {
    userId: string;
    restaurantId: string;
    restaurantName?: string;
    clientName?: string;
    items: Array<{ id: string; name?: string; price: number; quantity?: number }>;
    total: number;
    idempotencyKey?: string;
  }) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(data) }),

  /** Accept an order (restaurant) */
  accept: (id: string) => apiFetch(`/orders/${id}/accept`, { method: 'PATCH' }),

  /** Mark order as ready (restaurant) */
  setReady: (id: string) => apiFetch(`/orders/${id}/ready`, { method: 'PATCH' }),

  /** Claim an order (driver) */
  claim: (id: string, driverId: string) =>
    apiFetch(`/orders/${id}/claim`, { method: 'POST', body: JSON.stringify({ driverId }) }),

  /** Complete delivery (driver) */
  complete: (id: string) => apiFetch(`/orders/${id}/complete`, { method: 'PATCH' }),
};

// ─────────────────────────────────────────────
// Ratings
// ─────────────────────────────────────────────
export const RatingsAPI = {
  submit: (data: { orderId: string; restaurantId: string; score: number; feedback?: string }) =>
    apiFetch('/ratings', { method: 'POST', body: JSON.stringify(data) }),
};

// ─────────────────────────────────────────────
// Health / Monitoring
// ─────────────────────────────────────────────
export const HealthAPI = {
  check: () => apiFetch('/health'),
  version: () => apiFetch('/version'),
  monitoring: () => apiFetch('/monitoring'),
};

export default { OrdersAPI, RatingsAPI, HealthAPI };
