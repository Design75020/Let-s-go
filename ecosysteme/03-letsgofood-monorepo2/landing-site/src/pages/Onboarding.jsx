import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Phone, MessageCircle, Calendar, ArrowRight, Zap, Clock, Shield, Check } from "lucide-react";
import { landingConfig, getWhatsAppLink } from "../config/landingConfig.js";
import { trackEvent } from "../lib/tracking.js";

/* ═══════════════════════════════════════════════════════════
   ONBOARDING — Page d'atterrissage rapide après scan QR code
   URL: /onboarding?source=qr_landing
   Objectif: 3 choix clairs en 10 secondes pour convertir vite
═══════════════════════════════════════════════════════════ */

export default function Onboarding() {
  const nav = useNavigate();

  useEffect(() => {
    trackEvent("onboarding_viewed");
  }, []);

  const go = (preset, path = "/") => {
    trackEvent("cta_click", { cta: `onboarding_${preset || "direct"}` });
    const search = preset ? `?preset=${preset}` : "";
    nav(`${path}${search}#lead-section`);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("lead-preset", { detail: preset }));
      document.getElementById("lead-section")?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const choices = [
    {
      id: "callback",
      icon: Phone,
      title: "Être rappelé maintenant",
      desc: "Un conseiller vous appelle dans les 5 minutes",
      time: "5 min",
      color: "#FF5A00",
      primary: true,
      action: () => go("callback"),
    },
    {
      id: "whatsapp",
      icon: MessageCircle,
      title: "Parler sur WhatsApp",
      desc: "Chat direct avec notre équipe",
      time: "Instant",
      color: "#25D366",
      action: () => {
        trackEvent("cta_click", { cta: "onboarding_whatsapp" });
        window.location.href = getWhatsAppLink();
      },
    },
    {
      id: "rdv",
      icon: Calendar,
      title: "Planifier un rendez-vous",
      desc: "Choisissez l'horaire qui vous arrange",
      time: "2 min",
      color: "#1A1A1B",
      action: () => go("rdv"),
    },
  ];

  return (
    <div className="min-h-screen bg-brand-light flex flex-col" data-testid="onboarding-page">
      {/* Mini header (pas de nav complète volontairement) */}
      <header className="px-6 sm:px-8 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5" data-testid="onboarding-logo">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#6C6F70" }}
          >
            <span
              className="text-sm font-extrabold text-white"
              style={{ WebkitTextStroke: "0.5px #FF5A00", paintOrder: "stroke fill" }}
            >
              LG
            </span>
          </div>
          <span className="text-xl font-extrabold text-brand-ink">
            Let's <span className="text-brand-orange">Go</span>
          </span>
        </Link>
        <a
          href={`tel:${landingConfig.contact.phoneDisplay.replace(/\s/g, "")}`}
          onClick={() => trackEvent("cta_click", { cta: "onboarding_phone_header" })}
          className="text-sm font-semibold text-brand-nardo hover:text-brand-orange transition-colors hidden sm:inline-flex items-center gap-2"
        >
          <Phone className="w-4 h-4" />
          {landingConfig.contact.phoneDisplay}
        </a>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 w-full">
          <p className="text-sm uppercase tracking-[0.2em] font-semibold text-brand-orange mb-3 text-center">
            Bienvenue
          </p>
          <h1 className="text-4xl sm:text-5xl tracking-tight leading-tight font-bold text-center mb-4 text-brand-ink">
            Comment souhaitez-vous<br />
            <span className="text-brand-orange">être contacté ?</span>
          </h1>
          <p className="text-brand-nardo text-center mb-10 max-w-lg mx-auto">
            Choisissez l'option la plus rapide pour vous. Aucun engagement, aucun frais.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-nardo">
              <Zap className="w-3.5 h-3.5 text-brand-orange" />
              Activation en 24 h
            </div>
            <span className="w-1 h-1 rounded-full bg-brand-border" />
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-nardo">
              <Shield className="w-3.5 h-3.5 text-brand-orange" />
              0 € d'engagement
            </div>
            <span className="w-1 h-1 rounded-full bg-brand-border" />
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-nardo">
              <Check className="w-3.5 h-3.5 text-brand-orange" />
              0 % commission
            </div>
          </div>

          {/* 3 choix */}
          <div className="space-y-4">
            {choices.map((c) => (
              <button
                key={c.id}
                data-testid={`onboarding-choice-${c.id}`}
                onClick={c.action}
                className={`group w-full bg-white border-2 transition-all p-5 sm:p-6 flex items-center gap-5 text-left hover:-translate-y-0.5 hover:shadow-lg ${
                  c.primary
                    ? "border-brand-orange shadow-sm"
                    : "border-brand-border hover:border-brand-nardo"
                }`}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${c.color}15` }}
                >
                  <c.icon className="w-7 h-7" style={{ color: c.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base sm:text-lg">{c.title}</h3>
                    {c.primary && (
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-brand-orange text-white px-2 py-0.5">
                        Le + rapide
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-brand-nardo">{c.desc}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand-nardo">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-semibold">{c.time}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-brand-nardo group-hover:text-brand-orange transition-colors" />
                </div>
              </button>
            ))}
          </div>

          {/* Voir la landing complète */}
          <div className="text-center mt-10">
            <Link
              to="/"
              onClick={() => trackEvent("cta_click", { cta: "onboarding_discover_more" })}
              className="text-sm font-semibold text-brand-nardo hover:text-brand-orange transition-colors"
            >
              Découvrir d'abord comment ça marche →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer mini */}
      <footer className="py-6 text-center">
        <p className="text-xs text-brand-nardo">
          © {landingConfig.footer.year} Let's Go Food. 100 % transparence.
        </p>
      </footer>
    </div>
  );
}
