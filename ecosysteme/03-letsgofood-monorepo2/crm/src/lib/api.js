// Centralised CRM config — JWT token stored in localStorage for cross-domain auth.
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "https://app.letsgofood.fr").replace(/\/+$/, "");

const USER_KEY = "lg_crm_user";
const TOKEN_KEY = "lg_crm_token";

export function setUser(u) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch { /* noop */ }
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
}
export function setToken(t) {
  try { localStorage.setItem(TOKEN_KEY, t); } catch { /* noop */ }
}
export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; }
}
export function clearAuth() {
  try {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch { /* noop */ }
}

async function request(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = (import.meta.env.BASE_URL || "/") + "login";
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    let detail = "";
    try { const j = await res.json(); detail = j.detail || JSON.stringify(j); } catch { detail = res.statusText; }
    throw new Error(detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  async login(email, password) {
    const data = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    // Store JWT token for subsequent requests (cross-domain auth)
    if (data.access_token) setToken(data.access_token);
    return data;
  },
  logout() {
    clearAuth();
    return request("/api/auth/logout", { method: "POST" }).catch(() => {});
  },
  me() { return request("/api/auth/me"); },
  getLeads() { return request("/api/leads"); },
  getLead(id) { return request(`/api/leads/${id}`); },
  updateLead(id, data) { return request(`/api/leads/${id}`, { method: "PUT", body: JSON.stringify(data) }); },
  leadsStats() { return request("/api/leads/stats/summary"); },
  attributionSummary() { return request("/api/leads/attribution/summary"); },
  leaderboard(period = "month") { return request(`/api/leads/stats/leaderboard?period=${encodeURIComponent(period)}`); },
  trackSummary() { return request("/api/track/summary"); },
  csvExportUrl(filters = {}) {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
    const qs = p.toString();
    const token = getToken();
    return `${API_BASE}/api/leads/export/csv${qs ? `?${qs}` : ""}${token ? `${qs ? "&" : "?"}token=${token}` : ""}`;
  },
};
