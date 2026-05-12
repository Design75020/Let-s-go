import { QRCodeSVG } from "qrcode.react";
import { Scan, Download } from "lucide-react";
import { landingConfig } from "../config/landingConfig.js";
import { trackEvent } from "../lib/tracking.js";

/* QR code block optimized for PDF flyers — role-specific tracking */
export default function PageQRBlock({ role, title, subtitle }) {
  const base = landingConfig.publicUrl.replace(/\/+$/, "");
  const target = `${base}/onboarding?source=qr_${role}`;

  const download = () => {
    const svg = document.querySelector(`#qr-${role}`);
    if (!svg) return;
    const str = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `letsgofood-qr-${role}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("qr_downloaded", { format: "svg", role });
  };

  return (
    <section
      data-testid={`page-qr-${role}`}
      className="py-20 sm:py-28 bg-brand-ink text-brand-cream relative grain"
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-8 relative z-10 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-12 items-center">
        <div>
          <p className="eyebrow text-brand-orange mb-4">
            <Scan className="w-3.5 h-3.5 inline mr-2" />
            Code à flasher
          </p>
          <h2 className="font-display display-xl text-3xl sm:text-4xl lg:text-5xl mb-5 text-brand-cream leading-[1.05]">
            {title}
          </h2>
          <p className="text-brand-cream/70 leading-relaxed mb-6 text-sm sm:text-base">
            {subtitle}
          </p>
          <ul className="space-y-2 text-sm mb-6">
            <li className="flex items-center gap-3 text-brand-cream/80">
              <span className="w-1 h-1 rounded-full bg-brand-orange" />
              Fonctionne sur flyer / vitrine / carte de visite
            </li>
            <li className="flex items-center gap-3 text-brand-cream/80">
              <span className="w-1 h-1 rounded-full bg-brand-orange" />
              Tracking automatique (source={`qr_${role}`})
            </li>
            <li className="flex items-center gap-3 text-brand-cream/80">
              <span className="w-1 h-1 rounded-full bg-brand-orange" />
              Redirige vers le parcours le plus court
            </li>
          </ul>
          <button
            onClick={download}
            data-testid={`qr-download-${role}`}
            className="no-print inline-flex items-center gap-2 bg-brand-orange text-brand-cream hover:bg-brand-orange-dark font-semibold px-5 py-3 text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Télécharger ce QR (SVG)
          </button>
          <p className="text-xs text-brand-cream/40 mt-3 break-all font-mono">
            {target}
          </p>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="bg-brand-cream p-6 shadow-2xl relative">
            <QRCodeSVG
              id={`qr-${role}`}
              value={target}
              size={220}
              fgColor="#0D0D0E"
              bgColor="#FAF8F4"
              level="M"
              marginSize={0}
            />
            <div className="mt-4 text-center">
              <p className="font-display text-base text-brand-ink leading-none">
                Let's <em className="italic font-light text-brand-orange">Go</em>
              </p>
              <p className="eyebrow text-brand-nardo mt-1.5 text-[9px]">
                {role === "restaurateur" && "Espace restaurateurs"}
                {role === "livreur" && "Espace livreurs"}
                {role === "client" && "Espace clients"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
