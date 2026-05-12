/* ═══════════════════════════════════════════════════════════
   ATTRIBUTION — Capture & persistance multi-canal
   ───────────────────────────────────────────────────────────
   Gère les paramètres marketing présents dans l'URL :
     ?ref=agent_023  → ID commercial (qui a recommandé)
     ?src=flyer      → Canal d'acquisition (flyer, qr, vitrine)
     ?zone=paris11   → Zone géographique
     ?camp=hiver2026 → Campagne (optionnel)

   - 1ère visite : capture depuis URL → localStorage (persistant)
   - Visites suivantes : la valeur déjà stockée est préservée sauf
     si de nouveaux paramètres plus spécifiques arrivent (ils
     prennent alors le dessus — dernier clic gagne par paramètre)
   - Helpers :
       captureAttribution()  → à appeler au boot
       getAttribution()      → retourne { ref, src, zone, camp }
       clearAttribution()    → utilitaire test / opt-out
═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = "lg_attrib";
const FIELDS = ["ref", "src", "zone", "camp"];

function safeReadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function safeWriteStore(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    /* noop */
  }
}

/* Lit les params URL, merge avec le store et persiste.
   Dernier clic gagne PAR CHAMP (ex: changer de zone écrase la
   zone précédente mais garde le ref d'origine s'il n'est pas
   présent dans la nouvelle URL). */
export function captureAttribution() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const stored = safeReadStore();
  const next = { ...stored };
  let changed = false;
  FIELDS.forEach((key) => {
    const v = params.get(key);
    if (v && v.length < 120) {
      const clean = v.trim();
      if (clean && clean !== stored[key]) {
        next[key] = clean;
        changed = true;
      }
    }
  });
  if (changed) {
    next.first_seen = stored.first_seen || new Date().toISOString();
    next.last_seen = new Date().toISOString();
    safeWriteStore(next);
  }
  return next;
}

export function getAttribution() {
  if (typeof window === "undefined") return {};
  const s = safeReadStore();
  const out = {};
  FIELDS.forEach((k) => {
    if (s[k]) out[k] = s[k];
  });
  return out;
}

export function hasAttribution() {
  const a = getAttribution();
  return FIELDS.some((k) => !!a[k]);
}

export function clearAttribution() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
