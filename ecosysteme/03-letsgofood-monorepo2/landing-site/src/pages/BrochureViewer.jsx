import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Download, ArrowLeft, FileText, ExternalLink } from "lucide-react";
import { landingConfig, getPdfBundleUrl } from "../config/landingConfig.js";
import { trackEvent } from "../lib/tracking.js";

const ROLE_META = {
  accueil: {
    pathKey: "/",
    title: "La landing complète",
    subtitle: "Vue d'ensemble de Let's Go — marketplace, attribution, conversion.",
    accent: "#0D0D0E",
  },
  restaurateur: {
    pathKey: "/pour-restaurants",
    title: "Pour les restaurateurs",
    subtitle: "0 % commission, marge fixe, zéro engagement.",
    accent: "#FF5A00",
  },
  livreur: {
    pathKey: "/pour-livreurs",
    title: "Pour les livreurs",
    subtitle: "Courses courtes, rémunération juste, liberté totale.",
    accent: "#10B981",
  },
  client: {
    pathKey: "/pour-clients",
    title: "Pour les clients",
    subtitle: "Livraison gratuite en 20 minutes, sans frais cachés.",
    accent: "#3B82F6",
  },
};

/* Tracking pixel : on reporte l'ouverture en frappant /api/track via le
   lib tracking.js (qui joint automatiquement attribution + session_id). */
export default function BrochureViewer() {
  const { role } = useParams();
  const meta = ROLE_META[role];
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    if (!meta) return;
    const file = landingConfig.pdfs.files[meta.pathKey];
    // Event "pdf_opened" : déclenché au montage, inclut attribution automatique
    trackEvent("pdf_opened", { role, file });
  }, [meta, role]);

  if (!meta) return <Navigate to="/" replace />;

  const file = landingConfig.pdfs.files[meta.pathKey];
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const pdfUrl = `${base}${landingConfig.pdfs.root}/${file}`;

  return (
    <div data-testid="brochure-viewer" className="min-h-screen bg-brand-ink text-brand-cream">
      {/* Header bar */}
      <header className="sticky top-0 z-20 bg-brand-ink/95 backdrop-blur-sm border-b border-brand-cream/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-brand-cream/70 hover:text-brand-cream transition-colors"
            data-testid="brochure-back"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>

          <div className="hidden sm:block flex-1 min-w-0">
            <p className="eyebrow text-brand-cream/60" style={{ color: meta.accent }}>
              <span style={{ color: meta.accent }}>●</span> Brochure · PDF A4
            </p>
            <h1 className="font-display text-lg sm:text-xl leading-tight truncate text-brand-cream">
              {meta.title}
            </h1>
          </div>

          <a
            href={pdfUrl}
            download
            onClick={() => trackEvent("pdf_downloaded", { role, file, source: "viewer" })}
            data-testid="brochure-download"
            className="inline-flex items-center gap-2 bg-brand-orange text-brand-cream px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-brand-cream hover:text-brand-ink transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Télécharger
          </a>
        </div>
      </header>

      {/* PDF viewer */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-brand-cream border border-brand-cream/20 shadow-2xl overflow-hidden">
          {pdfError ? (
            <div className="p-12 text-center text-brand-ink">
              <FileText className="w-12 h-12 mx-auto mb-4 text-brand-nardo" />
              <p className="font-display text-xl mb-2">Aperçu indisponible</p>
              <p className="text-sm text-brand-nardo mb-6">
                Votre navigateur ne peut pas afficher ce PDF en ligne. Téléchargez-le pour le consulter.
              </p>
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center gap-2 bg-brand-ink text-brand-cream px-5 py-2.5 text-xs font-bold uppercase tracking-widest"
              >
                <Download className="w-3.5 h-3.5" /> Télécharger le PDF
              </a>
            </div>
          ) : (
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              title={meta.title}
              className="w-full h-[calc(100vh-140px)] min-h-[600px] border-0"
              onError={() => setPdfError(true)}
              data-testid="brochure-iframe"
            />
          )}
        </div>

        <p className="text-center text-xs text-brand-cream/50 mt-4 italic font-display">
          {meta.subtitle} — ouverture enregistrée pour analyse terrain.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={getPdfBundleUrl()}
            download
            onClick={() => trackEvent("pdf_downloaded", { role: "bundle", source: "viewer" })}
            className="inline-flex items-center gap-2 text-xs text-brand-cream/70 hover:text-brand-cream border border-brand-cream/20 hover:border-brand-cream/40 px-4 py-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Pack complet (4 PDFs)
          </a>
          <Link
            to={meta.pathKey}
            className="inline-flex items-center gap-2 text-xs text-brand-cream/70 hover:text-brand-cream border border-brand-cream/20 hover:border-brand-cream/40 px-4 py-2 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Voir la page web
          </Link>
        </div>
      </main>
    </div>
  );
}
