import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { getAttribution } from "../lib/attribution.js";
import { getAgentDisplayName } from "../config/agents.js";

const DISMISS_KEY = "lg_attrib_welcome_dismissed";

/* Bannière de bienvenue personnalisée — visible uniquement si :
   - le visiteur arrive avec un ?ref=... dans l'URL (ou l'a déjà stocké)
   - il n'a pas fermé la bannière dans la session courante
*/
export default function AttributionWelcome() {
  const [attrib, setAttrib] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const a = getAttribution();
    if (!a.ref) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* noop */
    }
    setAttrib(a);
    // Animation d'entrée : très léger délai pour ne pas voler l'attention du hero
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* noop */
    }
  };

  if (!attrib || !attrib.ref) return null;

  const agent = getAgentDisplayName(attrib.ref);
  const zone = attrib.zone;
  const message = agent
    ? `${agent} vous a recommandé Let's Go`
    : "Vous avez été invité sur Let's Go";

  return (
    <div
      data-testid="attribution-welcome"
      aria-live="polite"
      className={`fixed z-[60] left-1/2 -translate-x-1/2 bottom-6 sm:bottom-auto sm:top-[84px] sm:translate-x-0 sm:right-6 sm:left-auto transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="offset-box bg-brand-cream border border-brand-border px-5 py-4 pr-10 max-w-[92vw] sm:max-w-sm relative shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-brand-orange/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-brand-orange" />
          </div>
          <div className="min-w-0">
            <p className="eyebrow text-brand-orange mb-1.5">
              <span>●</span> Bienvenue
            </p>
            <p className="font-display text-lg leading-tight text-brand-ink">
              👋 {message}
            </p>
            {zone && (
              <p className="text-xs text-brand-nardo mt-1.5">
                Livraison disponible dans votre zone{" "}
                <span className="text-brand-ink font-semibold">{zone}</span>.
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          data-testid="attribution-welcome-close"
          aria-label="Fermer la bannière"
          className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center text-brand-nardo hover:text-brand-ink transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
