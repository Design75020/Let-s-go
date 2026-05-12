/* ═══════════════════════════════════════════════════════════
   AGENT MAP — ID commercial → Nom affiché
   ───────────────────────────────────────────────────────────
   Utilisé uniquement pour personnaliser la bannière d'accueil
   quand un visiteur arrive avec ?ref=agent_023 (ou équivalent).
   Les IDs sont arbitraires et stables dans le temps, ce qui
   permet de changer le prénom d'un commercial sans toucher aux
   flyers/QR déjà imprimés.
═══════════════════════════════════════════════════════════ */

export const AGENT_MAP = {
  agent_001: "Paul",
  agent_002: "Léa",
  agent_003: "Marc",
  agent_004: "Sophie",
  agent_005: "Ahmed",
  // ➕ Ajoutez un nouvel agent : "agent_0XX": "Prénom"
};

export function getAgentDisplayName(ref) {
  if (!ref) return null;
  const key = String(ref).toLowerCase().trim();
  if (AGENT_MAP[key]) return AGENT_MAP[key];
  // Fallback : ref="paul" → "Paul" (titlecase du ref brut)
  if (/^[a-zA-Z]+$/.test(key)) {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }
  // Fallback : "agent_023" → "Notre équipe"
  return null;
}
