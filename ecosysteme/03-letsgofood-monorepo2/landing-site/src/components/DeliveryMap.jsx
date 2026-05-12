import { landingConfig } from "../config/landingConfig.js";

/* Simplified SVG map of France with city dots */
export default function DeliveryMap() {
  const cfg = landingConfig.deliveryZones;
  if (!cfg) return null;

  return (
    <section
      id="delivery-zones"
      data-testid="delivery-map"
      className="py-24 sm:py-32 bg-brand-bone relative grain-light"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
        {/* Left — content */}
        <div>
          <p className="eyebrow mb-4">
            <span className="text-brand-orange">●</span> Zones actives
          </p>
          <h2 className="font-display display-xl text-[2.8rem] sm:text-5xl lg:text-6xl mb-6 text-brand-ink">
            {cfg.headline}
          </h2>
          <p className="text-brand-nardo leading-relaxed mb-10 max-w-md">
            {cfg.subtitle}
          </p>

          <div className="space-y-6">
            <div>
              <p className="eyebrow mb-3 text-brand-orange">
                <span>■</span> Actuellement disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                {cfg.active.map((z) => (
                  <span
                    key={z.city}
                    className="inline-flex items-center gap-2 bg-brand-ink text-brand-cream text-sm font-semibold px-4 py-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-brand-orange" />
                    {z.city}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3 text-brand-nardo">
                <span>○</span> Bientôt chez vous
              </p>
              <div className="flex flex-wrap gap-2">
                {cfg.soon.map((z) => (
                  <span
                    key={z.city}
                    className="inline-flex items-center gap-2 border border-brand-border text-brand-ink text-sm font-medium px-4 py-2 bg-white/40"
                  >
                    <span className="w-2 h-2 rounded-full border border-brand-nardo" />
                    {z.city}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-brand-nardo mt-10 italic">
            Votre ville n'est pas listée ? Demandez-nous quand on arrive →
          </p>
        </div>

        {/* Right — France SVG map */}
        <div className="relative aspect-square max-w-md mx-auto w-full">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* France shape (very simplified) */}
            <path
              d="M 40 10 L 52 8 L 60 5 L 70 12 L 80 20 L 88 30 L 90 45 L 86 55 L 80 65 L 78 78 L 72 90 L 60 92 L 55 88 L 48 90 L 38 85 L 25 80 L 18 65 L 15 50 L 18 38 L 22 25 L 30 15 Z"
              fill="#EAE3D5"
              stroke="#6C6F70"
              strokeWidth="0.3"
              opacity="0.8"
            />

            {/* Active cities */}
            {cfg.active.map((z) => (
              <g key={`active-${z.city}`}>
                <circle
                  cx={z.x}
                  cy={z.y}
                  r="3"
                  fill="#FF5A00"
                  opacity="0.2"
                  className="animate-pulse"
                />
                <circle cx={z.x} cy={z.y} r="1.4" fill="#FF5A00" />
                <text
                  x={z.x + 3}
                  y={z.y + 1.5}
                  fontSize="3"
                  fontFamily="Outfit, sans-serif"
                  fontWeight="700"
                  fill="#0D0D0E"
                >
                  {z.city}
                </text>
              </g>
            ))}

            {/* Soon cities */}
            {cfg.soon.map((z) => (
              <g key={`soon-${z.city}`} opacity="0.6">
                <circle
                  cx={z.x}
                  cy={z.y}
                  r="1.2"
                  fill="none"
                  stroke="#6C6F70"
                  strokeWidth="0.4"
                  strokeDasharray="0.8 0.5"
                />
                <text
                  x={z.x + 3}
                  y={z.y + 1.2}
                  fontSize="2.2"
                  fontFamily="Outfit, sans-serif"
                  fill="#6C6F70"
                >
                  {z.city}
                </text>
              </g>
            ))}
          </svg>

          {/* Corner labels (editorial style) */}
          <div className="absolute top-0 left-0 text-[10px] eyebrow text-brand-nardo">
            N
          </div>
          <div className="absolute bottom-0 right-0 text-[10px] eyebrow text-brand-nardo">
            52°N · 8°E
          </div>
        </div>
      </div>
    </section>
  );
}
