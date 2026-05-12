import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import LandingNav from "../components/LandingNav.jsx";
import GainSimulator from "../components/GainSimulator.jsx";
import Testimonials from "../components/Testimonials.jsx";
import QRSection from "../components/QRSection.jsx";
import PdfDownload from "../components/PdfDownload.jsx";
import PartnersMarquee from "../components/PartnersMarquee.jsx";
import DeliveryMap from "../components/DeliveryMap.jsx";
import Newsletter from "../components/Newsletter.jsx";
import PdfHub from "../components/PdfHub.jsx";
import {
  ArrowRight, ArrowDown, Bike, Users, Zap, Shield, Heart, DollarSign,
  TrendingUp, Phone, ChefHat, ShoppingBag, Check, X, Play, Calendar, MessageSquare,
} from "lucide-react";
import { landingConfig, getLeadUrl } from "../config/landingConfig.js";
import { trackEvent, getTrackingContext } from "../lib/tracking.js";
import { getAttribution } from "../lib/attribution.js";

/* ─── SCROLL ANIMATION HOOK ─── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function AnimDiv({ children, className = "", delay = 0 }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── COUNTER ANIMATION ─── */
function Counter({ end, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.max(1, Math.floor(end / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(timer); }
      else setVal(start);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, end]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

/* ─── PRICE SIMULATOR ─── */
function PriceSimulator() {
  const [price, setPrice] = useState(15);
  const margin = price >= 10 ? 1.0 : 0.5;
  const clientPrice = (price + margin + 0.5).toFixed(2);
  const uberCut = (price * 0.30).toFixed(2);
  const uberReceive = (price - price * 0.30).toFixed(2);
  return (
    <div className="bg-white border border-brand-border p-8 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-6 text-center">Simulez vos gains</h3>
      <label className="text-sm text-brand-nardo block mb-2">Prix de votre plat</label>
      <div className="flex items-center gap-4 mb-6">
        <input
          data-testid="price-slider"
          type="range" min="5" max="35"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="flex-1 accent-brand-orange h-2 cursor-pointer"
        />
        <span className="text-2xl font-bold min-w-[60px] text-right">{price} €</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-brand-orange/5 border border-brand-orange/20 p-4 text-center">
          <p className="text-xs text-brand-nardo uppercase tracking-widest font-semibold mb-1">Avec Let's Go</p>
          <p className="text-3xl font-bold text-brand-orange">{price} €</p>
          <p className="text-xs text-[#10B981] font-semibold mt-1">Vous recevez 100%</p>
          <p className="text-[10px] text-brand-nardo mt-1">Client paie {clientPrice} €</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4 text-center">
          <p className="text-xs text-brand-nardo uppercase tracking-widest font-semibold mb-1">Avec Uber Eats</p>
          <p className="text-3xl font-bold text-gray-400 line-through">{price} €</p>
          <p className="text-xs text-red-500 font-semibold mt-1">Vous recevez {uberReceive} €</p>
          <p className="text-[10px] text-brand-nardo mt-1">Commission : -{uberCut} €</p>
        </div>
      </div>
    </div>
  );
}

/* ─── LEAD FORM ─── */
function LeadForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ restaurant: "", phone: "", city: "", cuisine: "", preference: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [estimation, setEstimation] = useState(null);

  // Listen for preset events from CTAs (scroll to form + pre-select preference)
  useEffect(() => {
    const handler = (e) => {
      const preset = e.detail;
      if (preset && ["callback", "rdv", "info"].includes(preset)) {
        setForm((f) => ({ ...f, preference: preset }));
      }
    };
    const estHandler = (e) => {
      const est = e.detail;
      if (est && typeof est === "object") {
        setEstimation(est);
        // Pre-fill the message with the estimation summary
        setForm((f) => ({
          ...f,
          cuisine: f.cuisine || est.type || "",
          message: `Estimation simulateur — Type: ${est.type}, Commandes actuelles: ${est.orders}/jour, Panier moyen: ${est.basket}€ → +${est.extraMonthlyOrders} commandes/mois (+${est.uplift}%), CA supplémentaire estimé: ${est.extraMonthlyRevenue}€/mois.`,
        }));
      }
    };
    // Support URL ?preset=callback|rdv|info
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("preset");
      if (p && ["callback", "rdv", "info"].includes(p)) {
        setForm((f) => ({ ...f, preference: p }));
      }
    } catch { /* noop */ }

    window.addEventListener("lead-preset", handler);
    window.addEventListener("lead-estimation", estHandler);
    return () => {
      window.removeEventListener("lead-preset", handler);
      window.removeEventListener("lead-estimation", estHandler);
    };
  }, []);

  const submit = async () => {
    if (!form.preference) return;
    setSending(true);
    setError("");
    const url = getLeadUrl();
    const ctx = getTrackingContext();
    if (url) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            source: ctx.source || "letsgofood.fr",
            session_id: ctx.session_id,
            device: ctx.device,
            referrer: ctx.referrer,
            utm: ctx.utm,
            attribution: getAttribution(),
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        setError("Envoi impossible. Réessayez ou appelez-nous directement.");
        setSending(false);
        return;
      }
    }
    trackEvent("lead_submit", {
      preference: form.preference,
      has_restaurant: !!form.restaurant,
      has_city: !!form.city,
      has_estimation: !!estimation,
      estimated_monthly_revenue: estimation?.extraMonthlyRevenue ?? null,
    });
    setSubmitted(true);
    setSending(false);
  };

  if (submitted) {
    const msg = landingConfig.leadForm.successMessages[form.preference] || landingConfig.leadForm.successMessages.info;
    return (
      <div className="text-center py-12" data-testid="lead-success">
        <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-[#10B981]" />
        </div>
        <h3 className="text-2xl font-bold mb-2">{landingConfig.leadForm.successTitle}</h3>
        <p className="text-brand-nardo">{msg}</p>
      </div>
    );
  }

  return (
    <div data-testid="lead-form">
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-brand-orange" : "bg-brand-border"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-xl font-semibold">Votre restaurant</h3>
          <input
            data-testid="lead-restaurant"
            placeholder="Nom de votre restaurant"
            value={form.restaurant}
            onChange={(e) => setForm({ ...form, restaurant: e.target.value })}
            className="w-full h-12 px-4 border border-brand-border text-sm focus:outline-none focus:border-brand-orange transition-colors"
          />
          <input
            data-testid="lead-phone"
            placeholder="Votre téléphone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full h-12 px-4 border border-brand-border text-sm focus:outline-none focus:border-brand-orange transition-colors"
          />
          <button
            data-testid="lead-next-1"
            onClick={() => { if (form.restaurant && form.phone) setStep(2); }}
            className="w-full bg-brand-orange text-white h-12 font-semibold text-sm hover:bg-brand-orange-dark transition-colors flex items-center justify-center gap-2"
          >
            Continuer <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-xl font-semibold">Votre emplacement</h3>
          <input
            data-testid="lead-city"
            placeholder="Ville"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full h-12 px-4 border border-brand-border text-sm focus:outline-none focus:border-brand-orange transition-colors"
          />
          <input
            data-testid="lead-cuisine"
            placeholder="Type de cuisine (ex : burger, sushi, pizza…)"
            value={form.cuisine}
            onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
            className="w-full h-12 px-4 border border-brand-border text-sm focus:outline-none focus:border-brand-orange transition-colors"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="h-12 px-6 border border-brand-border text-sm font-medium text-brand-nardo hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
            <button
              data-testid="lead-next-2"
              onClick={() => { if (form.city) setStep(3); }}
              className="flex-1 bg-brand-orange text-white h-12 font-semibold text-sm hover:bg-brand-orange-dark transition-colors flex items-center justify-center gap-2"
            >
              Continuer <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-xl font-semibold">Comment souhaitez-vous être contacté ?</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "callback", icon: Phone, label: "Rappel immédiat", desc: "On vous appelle dans les prochaines minutes" },
              { id: "rdv", icon: Calendar, label: "Planifier un rendez-vous", desc: "Choisissez le moment qui vous arrange" },
              { id: "info", icon: MessageSquare, label: "Recevoir les infos par SMS", desc: "On vous envoie un résumé complet" },
            ].map((opt) => (
              <button
                key={opt.id}
                data-testid={`lead-pref-${opt.id}`}
                onClick={() => setForm({ ...form, preference: opt.id })}
                className={`p-4 border text-left flex items-center gap-4 transition-all ${
                  form.preference === opt.id
                    ? "border-brand-orange bg-brand-orange/5"
                    : "border-brand-border hover:border-brand-orange/30"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    form.preference === opt.id
                      ? "bg-brand-orange text-white"
                      : "bg-gray-100 text-brand-nardo"
                  }`}
                >
                  <opt.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-brand-nardo">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(2)}
              className="h-12 px-6 border border-brand-border text-sm font-medium text-brand-nardo hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
            <button
              data-testid="lead-submit"
              disabled={sending}
              onClick={submit}
              className="flex-1 bg-brand-orange text-white h-12 font-semibold text-sm hover:bg-brand-orange-dark transition-colors disabled:opacity-60"
            >
              {sending ? "Envoi…" : "Envoyer ma demande"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── APP DEMO ANIMATION ─── */
function AppDemo() {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActiveStep((s) => (s + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      title: "Le client commande",
      subtitle: "Il parcourt les restaurants, choisit ses plats et passe commande en 30 secondes.",
      color: "#3B82F6",
      icon: ShoppingBag,
      mockup: (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64 mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-brand-orange" />
            <span className="text-xs font-bold">Let's Go</span>
          </div>
          <div className="space-y-2">
            {["Burger Factory", "Pizzeria Napoli", "Sakura Sushi"].map((r, i) => (
              <div
                key={r}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${
                  i === 0 ? "bg-brand-orange/10 border border-brand-orange/20" : "bg-gray-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${i === 0 ? "bg-brand-orange" : "bg-gray-200"}`} />
                <div>
                  <p className="font-semibold">{r}</p>
                  <p className="text-[10px] text-gray-400">{["12 min", "15 min", "18 min"][i]} — Gratuit</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-brand-orange text-white text-center py-2 rounded-lg text-xs font-bold">
            Commander
          </div>
        </div>
      ),
    },
    {
      title: "Le restaurant prépare",
      subtitle: "Il reçoit la commande avec une alerte sonore et commence la préparation.",
      color: "#FF5A00",
      icon: ChefHat,
      mockup: (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64 mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold">Nouvelle commande !</span>
            <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
          </div>
          <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-lg p-3 mb-3">
            <p className="text-xs font-bold">Commande #1234</p>
            <p className="text-[10px] text-gray-500 mt-1">1× Classic Burger — 1× Frites — 1× Coca</p>
            <p className="text-sm font-bold text-brand-orange mt-2">22,25 €</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#10B981] text-white text-center py-2 rounded-lg text-xs font-bold">Accepter</div>
            <div className="bg-gray-100 text-gray-500 text-center py-2 rounded-lg text-xs">Refuser</div>
          </div>
        </div>
      ),
    },
    {
      title: "Le livreur livre",
      subtitle: "Un livreur est assigné automatiquement. Le client suit la livraison en direct.",
      color: "#10B981",
      icon: Bike,
      mockup: (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64 mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Bike className="w-4 h-4 text-[#10B981]" />
            <span className="text-xs font-bold">En livraison</span>
          </div>
          <div className="bg-[#10B981]/5 rounded-lg p-3 mb-3 h-28 flex items-center justify-center relative">
            <div className="absolute w-full h-0.5 bg-[#10B981]/20 top-1/2" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-orange" />
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#10B981] animate-pulse" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#3B82F6]" />
            <p className="absolute bottom-2 text-[10px] text-[#10B981] font-semibold">Arrivée dans 8 min</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-full bg-[#10B981]/20" />
            <div>
              <p className="font-semibold">Lucas M.</p>
              <p className="text-[10px] text-gray-400">Livreur en route</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-4">
        {steps.map((s, i) => (
          <button
            key={s.title}
            data-testid={`demo-step-${i}`}
            onClick={() => setActiveStep(i)}
            className={`w-full text-left p-5 border transition-all duration-300 flex items-start gap-4 ${
              activeStep === i ? "bg-white shadow-md" : "border-brand-border hover:border-gray-300"
            }`}
            style={activeStep === i ? { borderColor: s.color } : {}}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                activeStep === i ? "text-white" : "bg-gray-100 text-brand-nardo"
              }`}
              style={activeStep === i ? { backgroundColor: s.color } : {}}
            >
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{s.title}</h3>
              <p
                className={`text-xs mt-1 transition-all ${
                  activeStep === i
                    ? "text-brand-nardo max-h-20 opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                {s.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="w-72 h-[520px] bg-[#1A1A1B] rounded-[2.5rem] p-3 shadow-2xl">
            <div className="w-full h-full bg-brand-light rounded-[2rem] overflow-hidden flex items-center justify-center">
              <div className="transition-all duration-500" key={activeStep}>
                {steps[activeStep].mockup}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CTA HELPER ─── */
function triggerPreset(preset) {
  if (!preset) return;
  window.dispatchEvent(new CustomEvent("lead-preset", { detail: preset }));
}

/* ─── URGENCY COUNTER ─── */
function UrgencyCounter() {
  const [count] = useState(
    () =>
      Math.floor(
        Math.random() * (landingConfig.urgency.maxCount - landingConfig.urgency.minCount + 1)
      ) + landingConfig.urgency.minCount
  );
  if (!landingConfig.enableUrgencyBanner) return null;
  return (
    <div className="bg-brand-ink text-brand-cream py-2.5 text-center text-xs font-semibold tracking-wider uppercase border-b border-brand-border-dark">
      <span className="text-brand-orange">●</span>{" "}
      Plus que <span className="underline decoration-brand-orange underline-offset-2">{count} places</span> dans votre secteur —{" "}
      <a href="#lead-section" onClick={() => triggerPreset("callback")} className="ed-link text-brand-cream">
        Réservez la vôtre
      </a>
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function LandingPage() {
  return (
    <div data-testid="landing-page" className="min-h-screen bg-brand-bone">
      <LandingNav />
      <UrgencyCounter />

      {/* HERO — Editorial asymmetric */}
      <section className="pt-16 min-h-screen flex items-center relative overflow-hidden grain-light">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 py-20 relative z-10">
          <div className="flex flex-col justify-center">
            <AnimDiv>
              <p className="eyebrow mb-8">
                <span className="text-brand-orange">●</span>{" "}
                {landingConfig.hero.eyebrow}
              </p>
            </AnimDiv>
            <AnimDiv delay={100}>
              <h1 className="font-display display-xl text-[3.5rem] sm:text-[5rem] lg:text-[6.5rem] mb-8 text-brand-ink">
                Plus de<br />
                clients. <em className="font-light not-italic block">Zéro</em>
                <span className="italic font-light text-brand-orange">contrainte.</span>
              </h1>
            </AnimDiv>
            <AnimDiv delay={200}>
              <p className="text-lg sm:text-xl leading-relaxed text-brand-nardo mb-8 max-w-md">
                Découvrez en 30 secondes comment augmenter vos commandes avec la livraison{" "}
                <em className="font-display text-brand-ink">gratuite</em>.
              </p>
            </AnimDiv>
            <AnimDiv delay={300}>
              <div className="flex flex-wrap gap-3 mb-8">
                <a
                  href={landingConfig.ctas.primary.target}
                  onClick={() => {
                    triggerPreset(landingConfig.ctas.primary.preset);
                    trackEvent("cta_click", { cta: landingConfig.ctas.primary.trackingId });
                  }}
                  data-testid="hero-cta-primary"
                  className="bg-brand-ink text-brand-cream hover:bg-brand-orange font-semibold px-7 py-4 text-sm uppercase tracking-widest transition-all duration-300 flex items-center gap-3 group"
                >
                  <Phone className="w-4 h-4" />
                  {landingConfig.ctas.primary.label}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href={landingConfig.ctas.secondary.target}
                  onClick={() => {
                    triggerPreset(landingConfig.ctas.secondary.preset);
                    trackEvent("cta_click", { cta: landingConfig.ctas.secondary.trackingId });
                  }}
                  data-testid="hero-cta-secondary"
                  className="border border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-brand-cream font-semibold px-7 py-4 text-sm uppercase tracking-widest transition-colors flex items-center gap-3"
                >
                  <Play className="w-3.5 h-3.5" />
                  {landingConfig.ctas.secondary.label}
                </a>
                <a
                  href={landingConfig.ctas.tertiary.target}
                  onClick={() => trackEvent("cta_click", { cta: landingConfig.ctas.tertiary.trackingId })}
                  data-testid="hero-cta-tertiary"
                  className="ed-link text-brand-nardo hover:text-brand-ink font-semibold px-1 py-4 text-sm uppercase tracking-widest transition-colors flex items-center gap-3"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {landingConfig.ctas.tertiary.label}
                </a>
              </div>
            </AnimDiv>
            <AnimDiv delay={400}>
              <div className="flex gap-10 mt-6 pt-8 border-t border-brand-border">
                <div>
                  <p className="font-display display-number text-5xl text-brand-orange">
                    <Counter end={0} suffix="%" />
                  </p>
                  <p className="eyebrow mt-2">Commission</p>
                </div>
                <div>
                  <p className="font-display display-number text-5xl text-brand-ink">
                    <Counter end={20} suffix=" min" />
                  </p>
                  <p className="eyebrow mt-2">Livraison</p>
                </div>
                <div>
                  <p className="font-display display-number text-5xl italic text-brand-ink">
                    Gratuit
                  </p>
                  <p className="eyebrow mt-2">Pour le client</p>
                </div>
              </div>
            </AnimDiv>
          </div>
          <div className="hidden lg:flex items-start justify-center pt-12">
            <AnimDiv delay={200}>
              <div className="relative w-full">
                <div className="relative offset-box">
                  <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden">
                    <img
                      src={landingConfig.hero.imageUrl}
                      alt="Restaurant partenaire"
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent" />
                    {/* Floating ribbon */}
                    <div className="absolute top-6 left-0 bg-brand-orange text-brand-cream py-2 px-5 text-xs font-bold uppercase tracking-widest">
                      Let's · Go · Food
                    </div>
                    {/* Stat card */}
                    <div className="absolute bottom-6 left-6 right-6 bg-brand-cream/95 backdrop-blur-sm p-5 border border-brand-border">
                      <p className="eyebrow mb-1">Chiffre moyen</p>
                      <p className="font-display display-number text-4xl text-brand-ink">
                        +40<span className="text-brand-orange">%</span>
                      </p>
                      <p className="text-xs text-brand-nardo mt-1">commandes chez nos partenaires</p>
                    </div>
                  </div>
                </div>
                {/* Corner label */}
                <p className="eyebrow text-brand-nardo mt-4 text-right">
                  Fig. 01 — Le modèle Let's Go
                </p>
              </div>
            </AnimDiv>
          </div>
        </div>

        {/* Scroll indicator — positioned absolute */}
        <a
          href="#pedagogy"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-brand-nardo hover:text-brand-orange transition-colors eyebrow flex flex-col items-center gap-2"
        >
          Poursuivre
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </a>
      </section>

      {/* PARTNERS MARQUEE — immédiatement après le hero pour proof sociale */}
      <PartnersMarquee />

      {/* PEDAGOGIE */}
      <section id="pedagogy" className="py-24 sm:py-32 bg-brand-bone relative grain-light">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
          <AnimDiv>
            <p className="eyebrow mb-4 text-center">
              <span className="text-brand-orange">●</span> Comment ça marche
            </p>
          </AnimDiv>
          <AnimDiv delay={100}>
            <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-center mb-20 text-brand-ink">
              Trois principes, <em className="italic font-light">un seul</em> objectif
            </h2>
          </AnimDiv>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-border">
            {[
              { icon: DollarSign, title: "Vous gardez vos prix", desc: "Aucune commission en %. Votre carte, vos prix. On ajoute une marge fixe et transparente pour le client.", num: "01" },
              { icon: Users, title: "On trouve les clients", desc: "Notre algorithme recommande votre restaurant aux clients proches. Vous n'avez rien à faire.", num: "02" },
              { icon: Bike, title: "On gère la livraison", desc: "Nos livreurs récupèrent et livrent en 20 minutes. Suivi en temps réel pour le client.", num: "03" },
            ].map((item, i) => (
              <AnimDiv key={item.title} delay={i * 150}>
                <div className="bg-brand-bone p-10 h-full flex flex-col group hover:bg-brand-cream transition-colors duration-500">
                  <div className="flex items-start justify-between mb-10">
                    <span className="font-display display-number text-6xl italic text-brand-ink/10 group-hover:text-brand-orange/30 transition-colors">
                      {item.num}
                    </span>
                    <item.icon className="w-5 h-5 text-brand-nardo group-hover:text-brand-orange transition-colors" />
                  </div>
                  <h3 className="font-display text-3xl leading-tight mb-4 text-brand-ink">
                    {item.title}
                  </h3>
                  <p className="text-sm text-brand-nardo leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </AnimDiv>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo-section" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <AnimDiv>
            <p className="eyebrow mb-4 text-center">
              <span className="text-brand-orange">●</span> Démo interactive
            </p>
          </AnimDiv>
          <AnimDiv delay={100}>
            <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-center mb-4 text-brand-ink">
              Voyez le système <em className="italic font-light">en action</em>
            </h2>
          </AnimDiv>
          <AnimDiv delay={200}>
            <p className="text-brand-nardo text-center mb-16 max-w-lg mx-auto">
              Cliquez sur chaque étape pour voir comment Let's Go fonctionne de la commande à la livraison.
            </p>
          </AnimDiv>
          <AnimDiv delay={300}><AppDemo /></AnimDiv>
        </div>
      </section>

      {/* SIMULATEUR DE GAIN (potentiel restaurant) */}
      <section id="gain-simulator" className="py-24 sm:py-32 bg-brand-cream relative grain-light">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
          <AnimDiv>
            <p className="eyebrow mb-4 text-center">
              <span className="text-brand-orange">●</span> Simulateur personnalisé
            </p>
          </AnimDiv>
          <AnimDiv delay={100}>
            <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-center mb-4 text-brand-ink">
              Testez votre <em className="italic font-light">potentiel</em>
            </h2>
          </AnimDiv>
          <AnimDiv delay={200}>
            <p className="text-brand-nardo text-center mb-16 max-w-xl mx-auto">
              Répondez en 10 secondes et découvrez combien vous pourriez gagner en plus chaque mois.
            </p>
          </AnimDiv>
          <AnimDiv delay={300}>
            <GainSimulator />
          </AnimDiv>
        </div>
      </section>

      {/* DELIVERY MAP — Nouvelle section Zones actives */}
      <DeliveryMap />

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* QR CODE */}
      <QRSection />

      {/* PDF HUB — 4 brochures imprimables + pack ZIP */}
      <PdfHub />

      {/* NEWSLETTER */}
      <Newsletter />

      {/* COMPARAISON — Editorial version */}
      <section className="py-24 sm:py-32 bg-brand-ink text-brand-cream relative grain">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 relative z-10">
          <AnimDiv>
            <p className="eyebrow text-brand-cream/60 mb-4 text-center">
              <span className="text-brand-orange">●</span> Comparatif
            </p>
            <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-center mb-16 text-brand-cream">
              Let's Go <em className="italic font-light text-brand-orange">versus</em> la concurrence
            </h2>
          </AnimDiv>
          <div className="overflow-x-auto">
            <table data-testid="comparison-table" className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-cream/20">
                  <th className="py-5 px-4 text-brand-cream/40 text-xs uppercase tracking-widest"></th>
                  <th className="py-5 px-4 text-brand-orange text-xs font-bold uppercase tracking-widest">Let's Go</th>
                  <th className="py-5 px-4 text-brand-cream/40 text-xs uppercase tracking-widest">Autres</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["Commission", "0% (marge fixe)", "25-35%"],
                  ["Livraison client", "Gratuite", "2-6 €"],
                  ["Temps livraison", "20 min", "30-45 min"],
                  ["Contrat", "Aucun", "Obligatoire"],
                  ["Support", "Humain + IA", "Chatbot"],
                  ["Liberté", "Totale", "Limitée"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-brand-cream/10">
                    <td className="py-5 px-4 text-brand-cream/80 font-medium">{row[0]}</td>
                    <td className="py-5 px-4 text-brand-cream font-bold">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-brand-orange" />
                        {row[1]}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-brand-cream/40 italic font-display">
                      {row[2]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* RASSURANCE — Editorial */}
      <section className="py-24 bg-brand-bone relative grain-light">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-brand-border">
            {[
              { icon: Shield, title: "Sans engagement", desc: "Aucun contrat. Arrêtez quand vous voulez." },
              { icon: Zap, title: "Activation rapide", desc: "En ligne en 24h. Inscription en 2 minutes." },
              { icon: Heart, title: "Support humain", desc: "Un interlocuteur dédié pour vous accompagner." },
            ].map((item, i) => (
              <AnimDiv key={item.title} delay={i * 150}>
                <div className="bg-brand-bone p-10 h-full text-center">
                  <item.icon className="w-6 h-6 text-brand-orange mx-auto mb-5" />
                  <h3 className="font-display text-2xl mb-2">{item.title}</h3>
                  <p className="text-sm text-brand-nardo">{item.desc}</p>
                </div>
              </AnimDiv>
            ))}
          </div>
        </div>
      </section>

      {/* LEAD CAPTURE */}
      <section id="lead-section" className="py-24 sm:py-32 bg-brand-cream relative">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 relative z-10">
          <AnimDiv>
            <p className="eyebrow mb-6">
              <span className="text-brand-orange">●</span> Rejoignez-nous
            </p>
            <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl mb-8 text-brand-ink leading-[0.95]">
              Prêt à augmenter<br />
              vos <em className="italic font-light text-brand-orange">commandes</em> ?
            </h2>
            <p className="pull-quote text-xl text-brand-nardo mb-10 leading-relaxed max-w-md">
              Remplissez le formulaire et notre équipe vous contacte pour tout mettre en place. Inscription gratuite, aucun engagement.
            </p>
            <div className="space-y-3 mb-10">
              {[
                "0% de commission sur vos ventes",
                "Activation en 24h",
                "Support dédié",
                "Aucun engagement",
              ].map((t) => (
                <div key={t} className="flex items-center gap-3 text-sm">
                  <span className="w-1 h-1 rounded-full bg-brand-orange" />
                  <span className="font-medium text-brand-ink">{t}</span>
                </div>
              ))}
            </div>

            {/* PDF download */}
            <div className="no-print">
              <PdfDownload variant="inline" />
            </div>
          </AnimDiv>
          <AnimDiv delay={200}>
            <div className="bg-brand-bone border border-brand-border p-8 relative">
              <span className="absolute -top-3 left-6 bg-brand-orange text-brand-cream text-[10px] px-3 py-1 font-bold uppercase tracking-widest">
                3 étapes · 60 secondes
              </span>
              <LeadForm />
            </div>
          </AnimDiv>
        </div>
      </section>

      {/* FOOTER — Editorial */}
      <footer className="py-16 border-t border-brand-border bg-brand-bone">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <span className="font-display text-2xl">
                Let's <em className="italic font-light text-brand-orange">Go</em>
              </span>
              <p className="text-xs text-brand-nardo mt-3 leading-relaxed max-w-xs">
                Plateforme de livraison multi-restaurants. 0% commission, livraison gratuite, 20 min chrono.
              </p>
            </div>
            <div>
              <p className="eyebrow mb-4">Plateforme</p>
              <nav className="flex flex-col gap-2.5 text-sm">
                <Link to="/pour-restaurants" className="ed-link text-brand-ink w-fit">Pour restaurants</Link>
                <Link to="/pour-livreurs" className="ed-link text-brand-ink w-fit">Pour livreurs</Link>
                <Link to="/pour-clients" className="ed-link text-brand-ink w-fit">Pour clients</Link>
              </nav>
            </div>
            <div>
              <p className="eyebrow mb-4">Ressources</p>
              <div className="flex flex-col gap-2.5 text-sm">
                <PdfDownload variant="footer" />
                <a href="#lead-section" className="ed-link text-brand-ink w-fit">Être rappelé</a>
                <a href="#newsletter" className="ed-link text-brand-ink w-fit">Newsletter</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-brand-nardo">
              © 2026 Let's Go Food. <em className="font-display">100% transparence.</em>
            </p>
            <p className="eyebrow text-brand-nardo">
              Fabriqué avec <span className="text-brand-orange">●</span> en France
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
