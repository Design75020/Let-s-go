import { MessageCircle } from "lucide-react";
import { landingConfig, getWhatsAppLink } from "../config/landingConfig.js";
import { trackEvent } from "../lib/tracking.js";

export default function WhatsAppFloat() {
  if (!landingConfig.enableWhatsApp) return null;
  return (
    <a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-float"
      onClick={() => trackEvent("cta_click", { cta: "whatsapp_float" })}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-[#25D366] text-white rounded-full pl-4 pr-5 py-3 shadow-2xl hover:bg-[#1ea952] transition-all hover:scale-105 no-print"
      aria-label="Contacter sur WhatsApp"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-semibold hidden sm:inline">
        Parler à un conseiller
      </span>
    </a>
  );
}
