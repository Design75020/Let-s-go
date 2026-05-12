import { useState } from "react";
import { Mail, Check, ArrowRight } from "lucide-react";
import { landingConfig, getLeadUrl } from "../config/landingConfig.js";
import { trackEvent, getTrackingContext } from "../lib/tracking.js";
import { getAttribution } from "../lib/attribution.js";

export default function Newsletter() {
  const cfg = landingConfig.newsletter;
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError("");
    // Reuse /api/leads endpoint with preference=info + source=newsletter
    const url = getLeadUrl();
    if (url) {
      try {
        const ctx = getTrackingContext();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: "newsletter",
            email: email.trim(),
            preference: "info",
            source: `newsletter${ctx.source && ctx.source !== "direct" ? `_${ctx.source}` : ""}`,
            session_id: ctx.session_id,
            device: ctx.device,
            message: "Inscription newsletter — guides et actualités",
            attribution: getAttribution(),
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        setError("Envoi impossible. Réessayez dans un instant.");
        setSending(false);
        return;
      }
    }
    trackEvent("newsletter_signup", { domain: email.split("@")[1] || "unknown" });
    setSubmitted(true);
    setSending(false);
  };

  return (
    <section
      id="newsletter"
      data-testid="newsletter"
      className="py-24 sm:py-32 bg-brand-ink text-brand-cream relative grain"
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="eyebrow text-brand-orange mb-4">
            <span>●</span> Newsletter
          </p>
          <h2 className="font-display display-xl text-4xl sm:text-5xl mb-6">
            {cfg.headline}
          </h2>
          <p className="text-brand-cream/70 leading-relaxed mb-8">
            {cfg.subtitle}
          </p>
          <ul className="space-y-2">
            {cfg.benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-brand-cream/80">
                <span className="w-1 h-1 rounded-full bg-brand-orange" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div>
          {submitted ? (
            <div
              data-testid="newsletter-success"
              className="p-8 border border-brand-orange/40 bg-brand-orange/10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-brand-orange/20 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-brand-orange" />
              </div>
              <p className="font-display text-xl italic">{cfg.successMessage}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/50" />
                <input
                  data-testid="newsletter-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={cfg.placeholder}
                  className="w-full h-14 pl-11 pr-4 bg-transparent border border-brand-cream/30 focus:border-brand-orange text-brand-cream placeholder:text-brand-cream/40 text-sm transition-colors focus:outline-none"
                />
              </div>

              {error && (
                <p className="text-xs text-brand-orange">{error}</p>
              )}

              <button
                data-testid="newsletter-submit"
                type="submit"
                disabled={sending}
                className="w-full bg-brand-orange text-brand-cream hover:bg-brand-orange-dark font-semibold text-sm uppercase tracking-widest h-14 transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {sending ? "Envoi…" : cfg.cta}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-brand-cream/40">
                Aucun spam. Vos données restent confidentielles.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
