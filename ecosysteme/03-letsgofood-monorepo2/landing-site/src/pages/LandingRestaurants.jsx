import LandingNav from "../components/LandingNav.jsx";
import PdfDownload from "../components/PdfDownload.jsx";
import RoleBadge, { RoleSwitcher } from "../components/RoleBadge.jsx";
import PageQRBlock from "../components/PageQRBlock.jsx";
import {
  ArrowRight, Check, DollarSign, Users, Shield, Heart, ChefHat,
} from "lucide-react";
import { getPrimaryCtaHref, landingConfig } from "../config/landingConfig.js";

const CHEF_IMG = "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200";
const CTA_HREF = getPrimaryCtaHref();
const CTA_LABEL = landingConfig.isLead ? "Être rappelé" : "Devenir partenaire";
const CTA_LABEL_FINAL = landingConfig.isLead ? "Planifier un rendez-vous" : "Devenir partenaire gratuitement";

export default function LandingRestaurants() {
  return (
    <div data-testid="landing-restaurants" className="min-h-screen bg-brand-bone">
      <LandingNav />

      {/* ROLE BADGE — pushed below fixed nav */}
      <div className="pt-16">
        <RoleBadge role="restaurateur" />
      </div>

      {/* HERO — Editorial asymmetric */}
      <section className="relative overflow-hidden grain-light min-h-[88vh] flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-16 py-24 relative z-10">
          <div className="flex flex-col justify-center">
            <p className="eyebrow mb-8 animate-fade-in">
              <span className="text-brand-orange">●</span> Pour les restaurateurs
            </p>
            <h1 className="font-display display-xl text-[3rem] sm:text-[4.5rem] lg:text-[5.8rem] mb-8 text-brand-ink animate-fade-in stagger-1">
              Zéro<br />
              commission.<br />
              <em className="italic font-light text-brand-orange">100 %</em>{" "}
              <span className="italic font-light">transparence.</span>
            </h1>
            <p className="pull-quote text-xl text-brand-nardo mb-10 max-w-md animate-fade-in stagger-2 leading-relaxed">
              Fini les 25–35 % de commission qui grignotent vos marges. Vous conservez vos prix. On applique une{" "}
              <em className="font-display text-brand-ink">marge fixe</em> par article.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in stagger-3">
              <a
                href={CTA_HREF}
                data-testid="hero-cta-register"
                className="bg-brand-ink text-brand-cream hover:bg-brand-orange font-semibold px-7 py-4 text-sm uppercase tracking-widest transition-colors inline-flex items-center gap-3 group"
              >
                {CTA_LABEL}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#solution"
                className="border border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-brand-cream font-semibold px-7 py-4 text-sm uppercase tracking-widest transition-colors"
              >
                Voir le modèle
              </a>
            </div>

            {/* Key stats — editorial row */}
            <div className="flex gap-10 mt-12 pt-8 border-t border-brand-border animate-fade-in stagger-4">
              <div>
                <p className="font-display display-number text-5xl text-brand-orange">0%</p>
                <p className="eyebrow mt-2">Commission</p>
              </div>
              <div>
                <p className="font-display display-number text-5xl text-brand-ink">+40%</p>
                <p className="eyebrow mt-2">Commandes</p>
              </div>
              <div>
                <p className="font-display display-number text-5xl italic text-brand-ink">Libre</p>
                <p className="eyebrow mt-2">Sans engagement</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-start justify-center pt-10 animate-fade-in stagger-2">
            <div className="relative w-full max-w-md">
              <div className="offset-box relative">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <img src={CHEF_IMG} alt="Chef restaurant partenaire" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/75 via-transparent to-transparent" />
                  <div className="absolute top-6 left-0 bg-brand-orange text-brand-cream py-2 px-5 text-[10px] font-bold uppercase tracking-widest">
                    Let's · Go · Food
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 bg-brand-cream/95 backdrop-blur-sm p-5 border border-brand-border">
                    <p className="eyebrow mb-1">Marge moyenne conservée</p>
                    <p className="font-display display-number text-4xl text-brand-ink">
                      100<span className="text-brand-orange">%</span>
                    </p>
                    <p className="text-xs text-brand-nardo mt-1">de vos prix de carte</p>
                  </div>
                </div>
              </div>
              <p className="eyebrow text-brand-nardo mt-4 text-right">
                Fig. 02 — Partenaire restaurateur
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM — editorial dark counter */}
      <section className="py-24 sm:py-32 bg-brand-ink text-brand-cream relative grain">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
          <p className="eyebrow text-brand-cream/60 mb-4 text-center">
            <span className="text-brand-orange">●</span> Le problème
          </p>
          <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-center mb-20 text-brand-cream">
            Les plateformes actuelles<br />
            <em className="italic font-light text-brand-orange">vous coûtent cher</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-cream/10">
            {[
              { num: "01", problem: "Commission de 25–35%", impact: "Vos marges fondent à chaque commande." },
              { num: "02", problem: "Contrat obligatoire", impact: "Vous êtes pieds et mains liés." },
              { num: "03", problem: "Algorithme opaque", impact: "Votre visibilité dépend de leur bon vouloir." },
            ].map((item) => (
              <div key={item.num} className="bg-brand-ink p-10 h-full flex flex-col">
                <span className="font-display display-number text-6xl italic text-brand-orange/40 mb-8">
                  {item.num}
                </span>
                <h3 className="font-display text-2xl leading-tight mb-3 text-brand-cream">
                  {item.problem}
                </h3>
                <p className="text-sm text-brand-cream/60 leading-relaxed">{item.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="py-24 sm:py-32 bg-brand-bone relative grain-light">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <p className="eyebrow mb-4 text-center">
            <span className="text-brand-orange">●</span> Notre solution
          </p>
          <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-center mb-16 text-brand-ink">
            Un modèle <em className="italic font-light">simple</em>, <em className="italic font-light text-brand-orange">juste</em>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16 items-center">
            <div className="space-y-10">
              {[
                { icon: DollarSign, title: "Marge fixe par article", desc: "+1 € sur les plats, +0,50 € sur les boissons, +0,25 € sur les extras. C'est tout. Vous conservez 100 % de vos prix de base." },
                { icon: Shield, title: "Aucun abonnement, aucun engagement", desc: "Pas de contrat. Pas de frais mensuels. Vous pouvez arrêter quand vous voulez." },
                { icon: Users, title: "On vous apporte des clients", desc: "Ce n'est plus le client qui cherche. C'est notre algorithme qui lui recommande votre restaurant." },
                { icon: Heart, title: "Liberté totale", desc: "Vous restez libre d'accepter ou non les petites commandes. Aucune pénalité." },
              ].map((item, i) => (
                <div key={item.title} className="flex gap-6 border-t border-brand-border pt-8 first:border-0 first:pt-0">
                  <div className="shrink-0">
                    <span className="font-display display-number text-3xl italic text-brand-orange">
                      0{i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-brand-ink mb-2 leading-tight">{item.title}</h3>
                    <p className="text-sm text-brand-nardo leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Example box — offset editorial card */}
            <div className="offset-box bg-brand-cream p-10 relative">
              <p className="eyebrow mb-4 text-brand-orange">
                <span>●</span> Exemple chiffré
              </p>
              <h3 className="font-display text-3xl mb-8 text-brand-ink leading-tight">
                Un panier à <em className="italic font-light text-brand-orange">20,50 €</em>
              </h3>
              <div className="space-y-3 text-sm mb-6">
                {[
                  ["1× Burger Classic", "12,00 €"],
                  ["1× Frites Maison", "5,50 €"],
                  ["1× Coca-Cola", "3,00 €"],
                ].map((r) => (
                  <div key={r[0]} className="flex justify-between py-2 border-b border-brand-border">
                    <span className="text-brand-ink">{r[0]}</span>
                    <span className="font-medium text-brand-ink font-display">{r[1]}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-nardo">Total restaurant (vos prix)</span>
                  <span className="font-display font-bold text-brand-ink">20,50 €</span>
                </div>
                <div className="flex justify-between text-sm text-brand-orange">
                  <span>Marge Let's Go (fixe)</span>
                  <span className="font-display font-bold">+1,75 €</span>
                </div>
                <div className="flex justify-between pt-3 border-t-2 border-brand-ink">
                  <span className="eyebrow">Prix client</span>
                  <span className="font-display display-number text-2xl text-brand-ink">22,25 €</span>
                </div>
              </div>
              <div className="mt-8 p-5 bg-brand-ink text-brand-cream">
                <p className="eyebrow text-brand-orange mb-1">Vous recevez</p>
                <p className="font-display display-number text-4xl text-brand-cream">
                  20,50 <span className="text-brand-orange">€</span>
                </p>
                <p className="text-xs text-brand-cream/60 mt-2 italic font-display">
                  Avec Uber Eats : ~14,35 € (−30 % de commission)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-24 sm:py-32 bg-brand-ink text-brand-cream relative grain">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 relative z-10">
          <p className="eyebrow text-brand-cream/60 mb-4 text-center">
            <span className="text-brand-orange">●</span> Comparatif
          </p>
          <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-center mb-16 text-brand-cream">
            Let's Go <em className="italic font-light text-brand-orange">versus</em> la concurrence
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-cream/20">
                  <th className="py-5 px-4 text-brand-cream/40 text-[10px] uppercase tracking-widest font-bold"></th>
                  <th className="py-5 px-4 text-brand-orange text-[10px] font-bold uppercase tracking-widest">Let's Go</th>
                  <th className="py-5 px-4 text-brand-cream/40 text-[10px] uppercase tracking-widest font-bold">Uber Eats</th>
                  <th className="py-5 px-4 text-brand-cream/40 text-[10px] uppercase tracking-widest font-bold">Deliveroo</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["Commission", "0 % (marge fixe)", "25–35 %", "25–30 %"],
                  ["Contrat / engagement", "Aucun", "Obligatoire", "Obligatoire"],
                  ["Vos prix modifiés ?", "Non, jamais", "Parfois imposés", "Parfois imposés"],
                  ["Abonnement mensuel", "0 €", "Variable", "Variable"],
                  ["Visibilité clients", "Recommandation IA", "Payante (boost)", "Payante (boost)"],
                  ["Support", "Humain + IA", "Chatbot", "Chatbot"],
                  ["Liberté de refus", "Oui, sans pénalité", "Pénalités", "Pénalités"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-brand-cream/10">
                    <td className="py-5 px-4 text-brand-cream/80 font-medium">{row[0]}</td>
                    <td className="py-5 px-4 text-brand-cream font-bold">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-brand-orange" />
                        {row[1]}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-brand-cream/40 italic font-display">{row[2]}</td>
                    <td className="py-5 px-4 text-brand-cream/40 italic font-display">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — editorial */}
      <section className="py-24 sm:py-32 bg-brand-cream relative grain-light">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
          <p className="eyebrow mb-4 text-center">
            <span className="text-brand-orange">●</span> Comment ça marche
          </p>
          <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-center mb-20 text-brand-ink">
            Trois étapes, <em className="italic font-light">un seul</em> objectif
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-border">
            {[
              { num: "01", title: "Inscrivez-vous", desc: "Créez votre compte restaurant en 2 minutes. Ajoutez votre menu et vos horaires." },
              { num: "02", title: "Recevez des commandes", desc: "Les clients de votre zone commandent. Vous êtes notifié en temps réel." },
              { num: "03", title: "On s'occupe du reste", desc: "Un livreur récupère la commande et la livre en 20 minutes chrono." },
            ].map((item) => (
              <div key={item.num} className="bg-brand-cream p-10 h-full flex flex-col group hover:bg-brand-bone transition-colors duration-500">
                <div className="flex items-start justify-between mb-10">
                  <span className="font-display display-number text-6xl italic text-brand-ink/10 group-hover:text-brand-orange/40 transition-colors">
                    {item.num}
                  </span>
                  <ChefHat className="w-5 h-5 text-brand-nardo group-hover:text-brand-orange transition-colors" />
                </div>
                <h3 className="font-display text-3xl leading-tight mb-4 text-brand-ink">{item.title}</h3>
                <p className="text-sm text-brand-nardo leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAGE-SPECIFIC QR BLOCK (for web + PDF) */}
      <PageQRBlock
        role="restaurateur"
        title="Rejoignez en scannant, tout simplement."
        subtitle="Imprimez ce QR sur votre devanture, votre carte ou un flyer. Vos clients et votre équipe basculent en 1 seconde vers le parcours restaurateur Let's Go."
      />

      {/* CTA finale */}
      <section className="py-24 sm:py-32 bg-brand-bone relative grain-light">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center relative z-10">
          <p className="eyebrow mb-6">
            <span className="text-brand-orange">●</span> Prêt à commencer
          </p>
          <h2 className="font-display display-xl text-4xl sm:text-6xl lg:text-7xl font-medium text-brand-ink mb-8 leading-[0.95]">
            Prêt à gagner<br />
            plus de <em className="italic font-light text-brand-orange">clients</em> ?
          </h2>
          <p className="pull-quote text-xl text-brand-nardo mb-10 max-w-xl mx-auto">
            Inscription gratuite. Aucun engagement. Commencez à recevoir des commandes dès aujourd'hui.
          </p>
          <a
            href={CTA_HREF}
            data-testid="final-cta"
            className="bg-brand-ink text-brand-cream hover:bg-brand-orange font-semibold px-10 py-5 text-sm uppercase tracking-widest transition-colors inline-flex items-center gap-3 group"
          >
            {CTA_LABEL_FINAL}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </section>

      {/* ROLE SWITCHER — at the bottom for cross-navigation */}
      <section className="bg-brand-bone no-print">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
          <p className="eyebrow mb-6 text-center">
            <span className="text-brand-orange">●</span> Autres espaces
          </p>
          <RoleSwitcher current="restaurateur" />
        </div>
      </section>

      {/* FOOTER — editorial */}
      <footer className="py-12 border-t border-brand-border bg-brand-bone">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-2xl">
            Let's <em className="italic font-light text-brand-orange">Go</em>
          </span>
          <PdfDownload variant="footer" />
          <p className="eyebrow text-brand-nardo">
            © 2026 Let's Go Food · <em className="font-display normal-case">100% transparence.</em>
          </p>
        </div>
      </footer>
    </div>
  );
}
