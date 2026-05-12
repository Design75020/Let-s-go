import { useLocation } from "react-router-dom";
import { Download, FileText } from "lucide-react";
import { getPdfForPath, landingConfig } from "../config/landingConfig.js";
import { trackEvent } from "../lib/tracking.js";

export default function PdfDownload({ variant = "inline" }) {
  const location = useLocation();
  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const href = getPdfForPath(pathname);
  const label =
    pathname === "/"
      ? "Brochure Let's Go Food"
      : pathname === "/pour-restaurants"
      ? "Brochure Restaurants"
      : pathname === "/pour-livreurs"
      ? "Brochure Livreurs"
      : "Brochure Clients";

  const fire = () =>
    trackEvent("pdf_downloaded", { path: pathname, file: href });

  if (variant === "footer") {
    return (
      <a
        href={href}
        download
        onClick={fire}
        data-testid="pdf-download-footer"
        className="inline-flex items-center gap-2 text-xs text-brand-nardo hover:text-brand-orange transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Télécharger cette page en PDF
      </a>
    );
  }

  return (
    <a
      href={href}
      download
      onClick={fire}
      data-testid="pdf-download-inline"
      className="inline-flex items-center gap-3 bg-white border border-brand-border hover:border-brand-orange/40 hover:shadow-md p-4 transition-all group"
    >
      <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-brand-orange" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-brand-ink">{label}</p>
        <p className="text-xs text-brand-nardo">PDF · format A4 · imprimable</p>
      </div>
      <Download className="w-4 h-4 text-brand-nardo group-hover:text-brand-orange transition-colors" />
    </a>
  );
}
