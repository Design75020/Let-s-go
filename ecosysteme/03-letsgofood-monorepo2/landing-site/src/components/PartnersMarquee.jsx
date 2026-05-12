import { landingConfig } from "../config/landingConfig.js";

/* Marquee horizontal infinite — partenaires restaurants */
export default function PartnersMarquee() {
  const items = landingConfig.partners || [];
  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <section
      data-testid="partners-marquee"
      className="py-10 bg-brand-ink text-brand-cream border-y border-brand-border-dark overflow-hidden relative grain"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <p className="eyebrow text-brand-cream/60 text-center mb-6">
          Déjà avec nous · {items.length} restaurateurs partenaires
        </p>
      </div>

      <div className="relative z-10 overflow-hidden">
        <div className="marquee-track flex gap-8 animate-marquee whitespace-nowrap w-max">
          {doubled.map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-4 text-brand-cream/80 font-display text-2xl sm:text-3xl shrink-0"
            >
              <span className="italic">{name}</span>
              <span className="text-brand-orange text-lg">●</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
