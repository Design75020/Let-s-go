import { Download, FileText, Package, ChefHat, Bike, ShoppingBag, Home, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { landingConfig, getPdfBundleUrl } from "../config/landingConfig.js";
import { trackEvent } from "../lib/tracking.js";

/* Hub de téléchargement — affiche les 4 brochures PDF + le pack ZIP complet.
   Chaque PDF est role-specific et embarque son propre QR code tracké. */
export default function PdfHub() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const root = landingConfig.pdfs.root;

  const pdfs = [
    {
      key: "accueil",
      viewerRole: "accueil",
      file: landingConfig.pdfs.files["/"],
      title: "La landing complète",
      subtitle: "Vue d'ensemble Let's Go · 9 pages",
      icon: Home,
      accent: "#0D0D0E",
    },
    {
      key: "restaurateur",
      viewerRole: "restaurateur",
      file: landingConfig.pdfs.files["/pour-restaurants"],
      title: "Pour les restaurateurs",
      subtitle: "0 % commission · QR → qr_restaurateur",
      icon: ChefHat,
      accent: "#FF5A00",
    },
    {
      key: "livreur",
      viewerRole: "livreur",
      file: landingConfig.pdfs.files["/pour-livreurs"],
      title: "Pour les livreurs",
      subtitle: "Courses courtes · QR → qr_livreur",
      icon: Bike,
      accent: "#10B981",
    },
    {
      key: "client",
      viewerRole: "client",
      file: landingConfig.pdfs.files["/pour-clients"],
      title: "Pour les clients",
      subtitle: "Livraison gratuite · QR → qr_client",
      icon: ShoppingBag,
      accent: "#3B82F6",
    },
  ];

  const onDownload = (key, file) =>
    trackEvent("pdf_downloaded", { key, file });

  return (
    <section
      id="brochures"
      data-testid="pdf-hub"
      className="py-24 sm:py-32 bg-brand-cream relative grain-light"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow mb-4">
              <span className="text-brand-orange">●</span> Brochures imprimables
            </p>
            <h2 className="font-display display-xl text-4xl sm:text-5xl lg:text-6xl text-brand-ink leading-[0.95]">
              Télécharger Let's Go<br />
              en <em className="italic font-light text-brand-orange">version papier</em>
            </h2>
            <p className="pull-quote text-lg text-brand-nardo mt-6 max-w-xl">
              Quatre brochures A4 prêtes à imprimer, chacune avec son QR code tracké.
              Idéales pour vitrines, flyers, cartes de visite et distribution terrain.
            </p>
          </div>

          {/* Bundle CTA — pack complet ZIP */}
          <a
            href={getPdfBundleUrl()}
            download
            onClick={() => onDownload("bundle", landingConfig.pdfs.bundle)}
            data-testid="pdf-bundle-download"
            className="offset-box bg-brand-ink text-brand-cream hover:bg-brand-orange font-semibold px-7 py-5 flex items-center gap-4 group shrink-0 self-start transition-colors"
          >
            <div className="w-11 h-11 bg-brand-orange/20 group-hover:bg-brand-cream/20 flex items-center justify-center shrink-0 transition-colors">
              <Package className="w-5 h-5 text-brand-orange group-hover:text-brand-cream transition-colors" />
            </div>
            <div className="text-left">
              <p className="eyebrow text-brand-orange group-hover:text-brand-cream/80 mb-0.5">
                Pack complet
              </p>
              <p className="font-display text-xl text-brand-cream leading-tight">
                Les 4 PDFs · ZIP
              </p>
            </div>
            <Download className="w-5 h-5 text-brand-cream/70 group-hover:text-brand-cream transition-colors" />
          </a>
        </div>

        {/* 4 PDFs — grille éditoriale */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-border">
          {pdfs.map((p, i) => {
            const href = `${base}${root}/${p.file}`;
            const Icon = p.icon;
            return (
              <div
                key={p.key}
                data-testid={`pdf-hub-${p.key}`}
                className="bg-brand-cream p-7 h-full flex flex-col group hover:bg-brand-bone transition-colors duration-300"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="font-display display-number text-5xl italic text-brand-ink/10 group-hover:text-brand-orange/40 transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${p.accent}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: p.accent }} />
                  </div>
                </div>
                <h3 className="font-display text-2xl leading-tight text-brand-ink mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-brand-nardo mb-6">{p.subtitle}</p>

                <div className="mt-auto pt-4 border-t border-brand-border grid grid-cols-2 gap-1.5">
                  <Link
                    to={`/brochure/${p.viewerRole}`}
                    onClick={() => trackEvent("pdf_viewer_opened", { key: p.key, file: p.file })}
                    data-testid={`pdf-hub-view-${p.key}`}
                    className="inline-flex items-center justify-center gap-1.5 h-9 text-[10px] font-bold uppercase tracking-widest text-brand-ink hover:bg-brand-ink hover:text-brand-cream border border-brand-ink transition-colors"
                  >
                    <Eye className="w-3 h-3" /> Lire
                  </Link>
                  <a
                    href={href}
                    download
                    onClick={() => onDownload(p.key, p.file)}
                    data-testid={`pdf-hub-download-${p.key}`}
                    className="inline-flex items-center justify-center gap-1.5 h-9 text-[10px] font-bold uppercase tracking-widest bg-brand-ink text-brand-cream hover:bg-brand-orange transition-colors"
                  >
                    <Download className="w-3 h-3" /> PDF
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-brand-nardo mt-6 text-center italic font-display">
          « Lire en ligne » enregistre chaque ouverture · « PDF » déclenche le téléchargement direct
        </p>
      </div>
    </section>
  );
}
