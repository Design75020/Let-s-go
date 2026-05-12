import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Add token to every request from localStorage as fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("foodrush_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("foodrush_token", token);
  } else {
    localStorage.removeItem("foodrush_token");
  }
}

export function getAuthToken() {
  return localStorage.getItem("foodrush_token");
}

export function formatApiError(detail) {
  if (detail == null) return "Une erreur s'est produite.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const STATUS_LABELS = {
  pending: "En attente",
  preparing: "En preparation",
  ready: "Pret",
  assigned: "Assigne",
  picked_up: "Recupere",
  delivering: "En livraison",
  delivered: "Livre",
  cancelled: "Annule",
};

export const STATUS_COLORS = {
  pending: "status-pending",
  preparing: "status-preparing",
  ready: "status-ready",
  assigned: "status-assigned",
  picked_up: "status-delivering",
  delivering: "status-delivering",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
};

export default api;
