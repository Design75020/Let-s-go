import LandingNav from "../components/LandingNav.jsx";
import PdfDownload from "../components/PdfDownload.jsx";
import RoleBadge, { RoleSwitcher } from "../components/RoleBadge.jsx";
import PageQRBlock from "../components/PageQRBlock.jsx";
import {
  ArrowRight, Zap, Gift, Clock, Shield, Star, Heart, ShoppingBag, Award,
} from "lucide-react";
import { getPrimaryCtaHref, landingConfig } from "../config/landingConfig.js";

const FOOD_IMG = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200";
const CTA_HREF = getPrimaryCtaHref();
const CTA_LABEL_HERO = landingConfig.isLead ? "Être informé du lancement" : "Commander maintenant";
const CTA_LABEL_FINAL = landingConfig.isLead ? "Être informé du lancement" : "Créer mon compte gratuit";

export default function LandingClients() {
  return (
    <div data-testid="landing-clients" className="min-h-screen bg-brand-bone">
      <LandingNav />

      {/* ROLE BADGE */}
      <div className="pt-16">
        <RoleBadge role="client" />
      </div>

      {/* HERO — Editorial asymmetric */}
      <section className="relative overflow-hidden grain-light min-h-[88vh] flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 py-24 relative z-10">
          <div className="flex flex-col justify-center">
            <p className="eyebrow mb-8 animate-fade-in">
              <span className="text-brand-orange">●</span> Pour les gourmands
            </p>
            <h1 className="font-display display-xl text-[3rem] sm:text-[4.5rem] lg:text-[5.8rem] mb-8 text-brand-ink animate-fade-in stagger-1">
              Vos plats<br />
              préférés.<br />
              <em className="italic font-light text-brand-orange">Livrés</em>{" "}
              <span className="italic font-light">gratuitement.</span>
            </h1>
            <p className="pull-quote text-xl text-brand-nardo mb-10 max-w-md animate-fade-in stagger-2 leading-relaxed">
              Commandez auprès des meilleurs restaurants de votre quartier. Livraison{" "}
              <em className="font-display text-brand-ink">gratuite</em> en 20 minutes. Sans frais cachés.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in stagger-3">
              <a
                href={CTA_HREF}
                data-testid="client-hero-cta"
                className="bg-brand-ink text-brand-cream hover:bg-brand-orange font-semibold px-7 py-4 text-sm uppercase tracking-widest transition-colors inline-flex items-center gap-3 group"
              >
                {CTA_LABEL_HERO}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#loyalty"
                className="border border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-brand-cream font-semibold px-7 py-4 text-sm uppercase tracking-widest transition-colors"
              >
                Programme fidélité
              </a>
            </div>

            <div className="flex gap-10 mt-12 pt-8 border-t border-brand-border animate-fade-in stagger-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-brand-orange" />
                <div>
                  <p className="font-display display-number text-2xl text-brand-ink">20 min</p>
                  <p className="eyebrow mt-0.5">Livraison</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-brand-orange" />
                <div>
                  <p className="font-display display-number text-2xl text-brand-ink">0 €</p>
                  <p className="eyebrow mt-0.5">Frais</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-brand-orange" />
                <div>
                  <p className="font-display display-number text-2xl italic text-brand-ink">Points</p>
                  <p className="eyebrow mt-0.5">Fidélité</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-start justify-center pt-10 animate-fade-in stagger-2">
            <div className="relative w-full max-w-md">
              <div className="offset-box relative">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <img src={FOOD_IMG} alt="Plats gourmets livrés" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/65 via-transparent to-transparent" />
                  <div className="absolute top-6 left-0 bg-brand-orange text-brand-cream py-2 px-5 text-[10px] font-bold uppercase tracking-widest">
                    Let's · Go · Tasty
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 bg-brand-cream/95 backdrop-blur-sm p-5 border border-brand-border">
                    <p className="eyebrow mb-1">Livraison client</p>
                    <p className="font-display display-number text-4xl text-brand-ink">
                      Gratuite.
                    </p>
                    <p className="text-xs text-brand-nardo mt-1 italic font-display">
                      Toujours. Sans abonnement premium.
                    </p>
                  </div>
                </div>
              </div>
              <p className="eyebrow text-brand-nardo mt-4 text-right">
                Fig. 04 — Livraison gratuite
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS — editorial grid */}
      <section className="py-24 sm:py-32 bg-brand-cream relative grain-light">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <p className="eyebrow mb-4 text-center">
            <span className="text-brand-orange">●</span> Pourquoi choisir Let's Go
          </p>
          <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-center mb-20 text-brand-ink">
            Le confort, <em className="italic font-light text-brand-orange">sans</em> les mauvaises surprises
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-border">
            {[
              { num: "01", icon: Shield, title: "Livraison toujours gratuite", desc: "0 € de frais de livraison. Toujours. Pas besoin d'abonnement premium." },
              { num: "02", icon: Clock, title: "20 minutes max", desc: "On ne vous propose que les restaurants qui peuvent livrer en moins de 20 minutes." },
              { num: "03", icon: ShoppingBag, title: "Prix transparents", desc: "Aucun frais caché. Le prix affiché est le prix que vous payez." },
              { num: "04", icon: Award, title: "Programme fidélité", desc: "1 point par euro dépensé. Échangez vos points contre des réductions." },
              { num: "05", icon: Heart, title: "Support réactif", desc: "Un problème ? Un vrai humain vous répond en temps réel." },
              { num: "06", icon: Zap, title: "Suivi en direct", desc: "Suivez votre commande en temps réel : préparation, livreur en route, arrivée." },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-brand-cream p-10 h-full flex flex-col group hover:bg-brand-bone transition-colors duration-500"
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
      <section className="py-24 sm:py-32 bg-brand-bone relative grain-light">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
          <p className="eyebrow mb-4 text-center">
            <span className="text-brand-orange">●</span> Commander en 3 étapes
          </p>
          <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-center mb-20 text-brand-ink">
            De l'envie à la <em className="italic font-light text-brand-orange">dégustation</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-border">
            {[
              { num: "01", title: "Choisissez", desc: "Parcourez les restaurants près de chez vous. Filtrez par cuisine, temps, note." },
              { num: "02", title: "Commandez", desc: "Ajoutez vos plats au panier. Utilisez un code promo ou vos points fidélité." },
              { num: "03", title: "Savourez", desc: "Suivez votre livreur en temps réel. Votre repas arrive en 20 minutes." },
            ].map((item) => (
              <div key={item.num} className="bg-brand-bone p-10 h-full flex flex-col group hover:bg-brand-cream transition-colors duration-500">
                <span className="font-display display-number text-6xl italic text-brand-ink/10 group-hover:text-brand-orange/40 transition-colors mb-8">
                  {item.num}
                </span>
                <h3 className="font-display text-3xl leading-tight mb-3 text-brand-ink">{item.title}</h3>
                <p className="text-sm text-brand-nardo leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOYALTY — editorial card row */}
      <section id="loyalty" className="py-24 sm:py-32 bg-brand-ink text-brand-cream relative grain">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="text-center mb-16">
            <Gift className="w-10 h-10 text-brand-orange mx-auto mb-5" strokeWidth={1.5} />
            <p className="eyebrow text-brand-cream/60 mb-4">
              <span className="text-brand-orange">●</span> Programme fidélité
            </p>
            <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl mb-4 text-brand-cream">
              Chaque commande<br />
              <em className="italic font-light text-brand-orange">vous rapporte</em>
            </h2>
            <p className="pull-quote text-lg text-brand-cream/60 max-w-xl mx-auto">
              Gagnez des points à chaque commande et profitez de réductions exclusives.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-brand-cream/10">
            {[
              { tier: "Bronze", points: "0+", discount: "Débutant", color: "#CD7F32" },
              { tier: "Silver", points: "100+", discount: "5 % off", color: "#C0C0C0" },
              { tier: "Gold", points: "500+", discount: "10 % off", color: "#FFD700" },
              { tier: "Platinum", points: "1000+", discount: "15 % off", color: "#E5E4E2" },
            ].map((t) => (
              <div key={t.tier} className="bg-brand-ink p-8 text-center flex flex-col items-center gap-2">
                <Award className="w-8 h-8 mb-3" style={{ color: t.color }} strokeWidth={1.5} />
                <p className="font-display text-2xl" style={{ color: t.color }}>{t.tier}</p>
                <p className="eyebrow text-brand-cream/50">{t.points} points</p>
                <p className="text-sm font-medium text-brand-cream mt-2">{t.discount}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAGE QR BLOCK */}
      <PageQRBlock
        role="client"
        title="Flashez, commandez, savourez."
        subtitle="Ce QR vous envoie directement vers l'inscription client. Idéal pour vos flyers, affiches ou partage avec vos proches."
      />

      {/* CTA finale */}
      <section className="py-24 sm:py-32 bg-brand-bone relative grain-light">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center relative z-10">
          <p className="eyebrow mb-6">
            <span className="text-brand-orange">●</span> Prêt à vous régaler
          </p>
          <h2 className="font-display display-xl text-4xl sm:text-6xl lg:text-7xl text-brand-ink mb-8 leading-[0.95]">
            Prêt à vous<br />
            <em className="italic font-light text-brand-orange">régaler</em> ?
          </h2>
          <p className="pull-quote text-xl text-brand-nardo mb-10 max-w-xl mx-auto">
            Inscription gratuite. Première commande avec livraison gratuite garantie.
          </p>
          <a
            href={CTA_HREF}
            data-testid="client-final-cta"
            className="bg-brand-ink text-brand-cream hover:bg-brand-orange font-semibold px-10 py-5 text-sm uppercase tracking-widest transition-colors inline-flex items-center gap-3 group"
          >
            {CTA_LABEL_FINAL}
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
          <RoleSwitcher current="client" />
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
            © 2026 Let's Go Food · <em className="font-display normal-case">Savourez librement.</em>
          </p>
        </div>
      </footer>
    </div>
  );
}
