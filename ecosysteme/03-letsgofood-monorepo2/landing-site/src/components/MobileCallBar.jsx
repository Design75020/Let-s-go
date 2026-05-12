import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";
import { landingConfig } from "../config/landingConfig.js";
import { trackEvent } from "../lib/tracking.js";

/* ═══════════════════════════════════════════════════════════
   STICKY CALL BAR — Mobile uniquement
   Apparaît après scroll, bouton appel direct pour convertir vite
═══════════════════════════════════════════════════════════ */

export default function MobileCallBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("lg_callbar_dismissed") === "1") {
        setDismissed(true);
        return;
      }
    } catch (e) { /* noop */ }

    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const phoneRaw = landingConfig.contact.phoneDisplay.replace(/\s/g, "");

  const dismiss = (e) => {
    e.stopPropagation();
    try { sessionStorage.setItem("lg_callbar_dismissed", "1"); } catch { /* noop */ }
    setDismissed(true);
  };

  if (dismissed || !visible) return null;

  return (
    <a
      href={`tel:${phoneRaw}`}
      onClick={() => trackEvent("cta_click", { cta: "mobile_call_sticky" })}
      data-testid="mobile-call-bar"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-orange text-white shadow-2xl px-4 py-3 flex items-center gap-3 no-print animate-fade-in-up"
      aria-label={`Appeler ${landingConfig.contact.phoneDisplay}`}
    >
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <Phone className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest leading-none mb-0.5">
          Appeler maintenant
        </p>
        <p className="text-sm font-semibold truncate">
          {landingConfig.contact.phoneDisplay}
        </p>
      </div>
      <button
        onClick={dismiss}
        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0"
        aria-label="Masquer"
      >
        <X className="w-4 h-4" />
      </button>
    </a>
  );
}
