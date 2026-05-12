import { QRCodeSVG } from "qrcode.react";
import { Download, Scan } from "lucide-react";
import { landingConfig } from "../config/landingConfig.js";
import { trackEvent } from "../lib/tracking.js";

export default function QRSection() {
  const cfg = landingConfig.qr;

  const downloadSvg = () => {
    const svg = document.querySelector("#lg-qr-svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const str = serializer.serializeToString(svg);
    const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "letsgofood-qr.svg";
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("qr_downloaded", { format: "svg" });
  };

  return (
    <section id="qr-section" data-testid="qr-section" className="py-24 sm:py-32 bg-brand-ink text-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] font-semibold text-brand-orange mb-4">
            <Scan className="w-4 h-4 inline mr-2" />
            QR code de référencement
          </p>
          <h2 className="text-3xl sm:text-4xl tracking-tight font-bold mb-6">
            {cfg.headline}
          </h2>
          <p className="text-white/70 leading-relaxed mb-8">{cfg.subtitle}</p>

          <ul className="space-y-3 text-sm">
            {[
              "Imprimez-le sur vos supports physiques",
              "Chaque scan est tracé (source = qr_landing)",
              "Redirige vers le formulaire de contact optimisé",
              "Mesurez ROI de vos campagnes offline",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                <span className="text-white/80">{t}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={downloadSvg}
            data-testid="qr-download"
            className="mt-8 inline-flex items-center gap-2 bg-brand-orange text-white hover:bg-brand-orange-dark font-semibold px-6 py-3 transition-colors"
          >
            <Download className="w-4 h-4" />
            Télécharger le QR code (SVG)
          </button>
          <p className="text-xs text-white/40 mt-3 break-all">
            Cible : {cfg.targetUrl}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-white p-8 shadow-2xl relative">
            <QRCodeSVG
              id="lg-qr-svg"
              value={cfg.targetUrl}
              size={260}
              fgColor={cfg.foreground}
              bgColor={cfg.background}
              level="M"
              marginSize={0}
            />
            <div className="mt-4 text-center">
              <p className="text-brand-ink font-extrabold text-lg leading-none">
                Let's <span className="text-brand-orange">Go</span>
              </p>
              <p className="text-brand-nardo text-[10px] uppercase tracking-widest mt-1">
                Scan · Référence · Gagne
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
