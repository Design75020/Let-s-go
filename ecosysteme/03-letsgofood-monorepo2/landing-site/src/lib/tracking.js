/* ═══════════════════════════════════════════════════════════
   TRACKING — Ultra-léger, sans cookie, sans lib tierce
   ───────────────────────────────────────────────────────────
   - Capture la source UTM/QR au 1er chargement (sessionStorage)
   - Génère un session_id par onglet
   - Envoie les events en fire-and-forget (sendBeacon)
═══════════════════════════════════════════════════════════ */

import { landingConfig } from "../config/landingConfig.js";
import { getAttribution } from "./attribution.js";

const TRACK_URL = `${landingConfig.apiBase.replace(/\/+$/, "")}/api/track`;

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function detectDevice() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) return "tablet";
  if (/Mobile|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
}

function ensureSession() {
  try {
    let sid = sessionStorage.getItem("lg_sid");
    if (!sid) {
      sid = uuid();
      sessionStorage.setItem("lg_sid", sid);
    }
    return sid;
  } catch (e) {
    return uuid();
  }
}

// Persist source at first visit (URL param ?source=... or UTM)
function captureInitialSource() {
  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("source") || params.get("utm_source");
    if (source && !sessionStorage.getItem("lg_source")) {
      sessionStorage.setItem("lg_source", source);
    }
    // Store UTM bundle
    const utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => {
      const v = params.get(k);
      if (v) utm[k] = v;
    });
    if (Object.keys(utm).length && !sessionStorage.getItem("lg_utm")) {
      sessionStorage.setItem("lg_utm", JSON.stringify(utm));
    }
  } catch (e) {
    // ignore
  }
}

export function getTrackingContext() {
  if (typeof window === "undefined") return { source: "ssr", device: "unknown" };
  captureInitialSource();
  const params = new URLSearchParams(window.location.search);
  let utm = null;
  try {
    utm = JSON.parse(sessionStorage.getItem("lg_utm") || "null");
  } catch (e) {
    utm = null;
  }
  return {
    source:
      params.get("source") ||
      sessionStorage.getItem("lg_source") ||
      params.get("utm_source") ||
      "direct",
    session_id: ensureSession(),
    device: detectDevice(),
    path: window.location.pathname + window.location.search,
    referrer: document.referrer || null,
    timestamp: new Date().toISOString(),
    utm,
    attribution: getAttribution(),
  };
}

export function trackEvent(name, props = {}) {
  if (typeof window === "undefined" || !TRACK_URL) return;
  const ctx = getTrackingContext();
  const payload = { event: name, ...ctx, props };
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(TRACK_URL, blob);
    } else {
      fetch(TRACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    // silent
  }
}

// Auto-capture QR scan if source=qr_* at first page load
export function autoTrackQrScan() {
  if (typeof window === "undefined") return;
  captureInitialSource();
  try {
    const source = sessionStorage.getItem("lg_source") || "";
    const alreadyTracked = sessionStorage.getItem("lg_qr_tracked");
    if (source.startsWith("qr") && !alreadyTracked) {
      sessionStorage.setItem("lg_qr_tracked", "1");
      trackEvent("qr_scan", { source });
    }
  } catch (e) {
    // ignore
  }
}
