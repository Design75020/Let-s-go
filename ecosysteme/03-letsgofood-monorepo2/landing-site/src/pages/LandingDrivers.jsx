import LandingNav from "../components/LandingNav.jsx";
import PdfDownload from "../components/PdfDownload.jsx";
import RoleBadge, { RoleSwitcher } from "../components/RoleBadge.jsx";
import PageQRBlock from "../components/PageQRBlock.jsx";
import { ArrowRight, Zap, DollarSign, Clock, Heart, MapPin, Shield, Bike } from "lucide-react";
import { getPrimaryCtaHref, landingConfig } from "../config/landingConfig.js";

const CTA_HREF = getPrimaryCtaHref();
const CTA_LABEL = landingConfig.isLead ? "Être rappelé" : "Devenir livreur";

export default function LandingDrivers() {
  return (
    <div data-testid="landing-drivers" className="min-h-screen bg-brand-bone">
      <LandingNav />

      {/* ROLE BADGE */}
      <div className="pt-16">
        <RoleBadge role="livreur" />
      </div>

      {/* HERO — Editorial asymmetric, dark tone */}
      <section className="relative overflow-hidden grain bg-brand-ink text-brand-cream min-h-[88vh] flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-16 py-24 relative z-10">
          <div className="flex flex-col justify-center">
            <p className="eyebrow text-brand-cream/60 mb-8 animate-fade-in">
              <span className="text-brand-orange">●</span> Pour les livreurs
            </p>
            <h1 className="font-display display-xl text-[3rem] sm:text-[4.5rem] lg:text-[5.8rem] mb-8 text-brand-cream animate-fade-in stagger-1">
              Livrez<br />
              <em className="italic font-light text-brand-orange">librement</em>.<br />
              Gagnez <span className="italic font-light">justement</span>.
            </h1>
            <p className="pull-quote text-xl text-brand-cream/70 mb-10 max-w-md animate-fade-in stagger-2 leading-relaxed">
              Des courses courtes, bien payées, avec un vrai support humain. Pas d'algorithme punitif, pas de pression.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in stagger-3">
              <a
                href={CTA_HREF}
                data-testid="driver-hero-cta"
                className="bg-brand-orange text-brand-cream hover:bg-brand-cream hover:text-brand-ink font-semibold px-7 py-4 text-sm uppercase tracking-widest transition-colors inline-flex items-center gap-3 group"
              >
                {CTA_LABEL}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#benefits"
                className="border border-brand-cream text-brand-cream hover:bg-brand-cream hover:text-brand-ink font-semibold px-7 py-4 text-sm uppercase tracking-widest transition-colors"
              >
                Voir les avantages
              </a>
            </div>

            <div className="flex gap-10 mt-12 pt-8 border-t border-brand-cream/20 animate-fade-in stagger-4">
              <div>
                <p className="font-display display-number text-5xl text-brand-orange">3,5 km</p>
                <p className="eyebrow text-brand-cream/60 mt-2">Course max</p>
              </div>
              <div>
                <p className="font-display display-number text-5xl text-brand-cream">20 min</p>
                <p className="eyebrow text-brand-cream/60 mt-2">Livraison</p>
              </div>
              <div>
                <p className="font-display display-number text-5xl italic text-brand-cream">Libre</p>
                <p className="eyebrow text-brand-cream/60 mt-2">Sans pénalité</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center animate-fade-in stagger-2">
            <div className="relative">
              <div className="offset-box relative">
                <div className="w-[380px] h-[480px] bg-brand-cream flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 grain-light opacity-50" />
                  <Bike className="w-52 h-52 text-brand-ink relative z-10" strokeWidth={1.2} />
                  <div className="absolute top-6 left-0 bg-brand-orange text-brand-cream py-2 px-5 text-[10px] font-bold uppercase tracking-widest z-20">
                    Let's · Go · Riders
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 bg-brand-ink text-brand-cream p-5 z-20">
                    <p className="eyebrow text-brand-orange mb-1">Zone optimisée</p>
                    <p className="font-display display-number text-4xl">
                      3,5<span className="text-brand-orange"> km</span>
                    </p>
                    <p className="text-xs text-brand-cream/60 mt-1">par course en moyenne</p>
                  </div>
                </div>
              </div>
              <p className="eyebrow text-brand-cream/50 mt-4 text-right">
                Fig. 03 — Rider Let's Go
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS — editorial grid with offset boxes */}
      <section id="benefits" className="py-24 sm:py-32 bg-brand-bone relative grain-light">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <p className="eyebrow mb-4 text-center">
            <span className="text-brand-orange">●</span> Pourquoi Let's Go
          </p>
          <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-center mb-20 text-brand-ink">
            Les vrais avantages<br />
            d'un <em className="italic font-light text-brand-orange">rider</em> respecté
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-border">
            {[
              { num: "01", icon: MapPin, title: "Courses courtes", desc: "Maximum 3,5 km. Pas de trajets interminables. Plus de courses, moins de fatigue." },
              { num: "02", icon: DollarSign, title: "Rémunération juste", desc: "Chaque course est rémunérée équitablement. Pas de tarif qui baisse aux heures creuses." },
              { num: "03", icon: Clock, title: "Flexibilité totale", desc: "Connectez-vous, déconnectez-vous quand vous voulez. Zéro obligation." },
              { num: "04", icon: Zap, title: "Alertes temps réel", desc: "Son + vibration dès qu'une course est disponible. Ne ratez rien." },
              { num: "05", icon: Heart, title: "Support humain", desc: "Un problème ? Un vrai humain vous répond. Pas de chatbot robotique." },
              { num: "06", icon: Shield, title: "Zéro pénalité", desc: "Vous pouvez refuser une course sans conséquence. Votre liberté est respectée." },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-brand-bone p-10 h-full flex flex-col group hover:bg-brand-cream transition-colors duration-500"
              >
                <div className="flex items-start justify-between mb-10">
                  <span className="font-display display-number text-6xl italic text-brand-ink/10 group-hover:text-brand-orange/40 transition-colors">
                    {item.num}
                  </span>
                  <item.icon className="w-5 h-5 text-brand-nardo group-hover:text-brand-orange transition-colors" />
                </div>
                <h3 className="font-display text-2xl leading-tight mb-3 text-brand-ink">{item.title}</h3>
                <p className="text-sm text-brand-nardo leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 sm:py-32 bg-brand-cream relative grain-light">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
          <p className="eyebrow mb-4 text-center">
            <span className="text-brand-orange">●</span> En 4 étapes
          </p>
          <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-center mb-20 text-brand-ink">
            Devenir livreur<br />
            en <em className="italic font-light">moins de</em> 24h
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-brand-border">
            {[
              { num: "01", title: "Inscrivez-vous", desc: "Créez votre compte livreur en 2 minutes." },
              { num: "02", title: "Passez en ligne", desc: "Activez votre statut et recevez des courses." },
              { num: "03", title: "Récupérez & livrez", desc: "Allez au restaurant, livrez au client." },
              { num: "04", title: "Soyez payé", desc: "Recevez votre paiement rapidement." },
            ].map((item) => (
              <div key={item.num} className="bg-brand-cream p-8 h-full flex flex-col group hover:bg-brand-bone transition-colors">
                <span className="font-display display-number text-5xl italic text-brand-orange/50 mb-6">
                  {item.num}
                </span>
                <h3 className="font-display text-xl leading-tight mb-2 text-brand-ink">{item.title}</h3>
                <p className="text-xs text-brand-nardo leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAGE QR BLOCK */}
      <PageQRBlock
        role="livreur"
        title="Flashez, installez, roulez."
        subtitle="Ce QR vous ouvre directement le parcours d'inscription livreur. Imprimable sur un flyer, une carte de visite ou partageable en direct avec votre équipe."
      />

      {/* CTA finale */}
      <section className="py-24 sm:py-32 bg-brand-bone relative grain-light">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center relative z-10">
          <Bike className="w-12 h-12 text-brand-orange mx-auto mb-6" strokeWidth={1.5} />
          <p className="eyebrow mb-6">
            <span className="text-brand-orange">●</span> Rejoignez l'équipe
          </p>
          <h2 className="font-display display-xl text-4xl sm:text-6xl lg:text-7xl text-brand-ink mb-8 leading-[0.95]">
            Prêt à <em className="italic font-light text-brand-orange">rouler</em> ?
          </h2>
          <p className="pull-quote text-xl text-brand-nardo mb-10 max-w-xl mx-auto">
            Inscription gratuite. Commencez à livrer dès aujourd'hui.
          </p>
          <a
            href={CTA_HREF}
            data-testid="driver-final-cta"
            className="bg-brand-ink text-brand-cream hover:bg-brand-orange font-semibold px-10 py-5 text-sm uppercase tracking-widest transition-colors inline-flex items-center gap-3 group"
          >
            {CTA_LABEL}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </section>

      {/* ROLE SWITCHER */}
      <section className="bg-brand-bone no-print">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
          <p className="eyebrow mb-6 text-center">
            <span className="text-brand-orange">●</span> Autres espaces
          </p>
          <RoleSwitcher current="livreur" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-brand-border bg-brand-bone">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-2xl">
            Let's <em className="italic font-light text-brand-orange">Go</em>
          </span>
          <PdfDownload variant="footer" />
          <p className="eyebrow text-brand-nardo">
            © 2026 Let's Go Food · <em className="font-display normal-case">Riders libres.</em>
          </p>
        </div>
      </footer>
    </div>
  );
}
