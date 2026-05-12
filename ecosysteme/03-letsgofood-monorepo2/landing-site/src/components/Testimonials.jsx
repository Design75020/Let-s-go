import { Star, TrendingUp } from "lucide-react";
import { landingConfig } from "../config/landingConfig.js";

function Initials({ name, bg }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
      style={{ backgroundColor: bg }}
    >
      {initials}
    </div>
  );
}

export default function Testimonials() {
  const items = landingConfig.testimonials;
  return (
    <section data-testid="testimonials" className="py-24 sm:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <p className="text-sm uppercase tracking-[0.2em] font-semibold text-brand-orange mb-3 text-center">
          Ils nous font confiance
        </p>
        <h2 className="text-3xl sm:text-4xl tracking-tight font-semibold text-center mb-16">
          Des restaurateurs qui{" "}
          <span className="text-brand-orange">gagnent plus</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div
              key={t.restaurant}
              className="bg-white border border-brand-border p-6 hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col"
            >
              {/* Growth pill */}
              <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider mb-4">
                <TrendingUp className="w-3.5 h-3.5" />
                {t.growth} {t.growthLabel}
              </div>

              <p className="text-sm text-brand-ink leading-relaxed mb-6 flex-1">
                « {t.quote} »
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
                <Initials name={t.restaurant} bg={t.avatarBg} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {t.restaurant}
                  </p>
                  <p className="text-xs text-brand-nardo truncate">
                    {t.type} · {t.city}
                  </p>
                </div>
              </div>

              <div className="flex gap-0.5 mt-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]"
                  />
                ))}
                <span className="text-xs text-brand-nardo ml-2">
                  — {t.person}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-brand-nardo mt-10">
          Témoignages de restaurateurs partenaires sélectionnés.
        </p>
      </div>
    </section>
  );
}
