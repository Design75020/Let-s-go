import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { landingConfig, getLoginUrl, getRegisterUrl } from "../config/landingConfig.js";

const navLinks = [
  { path: "/pour-restaurants", label: "Restaurants" },
  { path: "/pour-livreurs", label: "Livreurs" },
  { path: "/pour-clients", label: "Clients" },
];

export default function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLead, enableConnexion, enableSignup, nav } = landingConfig;

  const goLeadForm = (e, preset = "callback") => {
    if (e) e.preventDefault();
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#lead-section`);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("lead-preset", { detail: preset }));
      }, 200);
      return;
    }
    window.dispatchEvent(new CustomEvent("lead-preset", { detail: preset }));
    document.getElementById("lead-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      data-testid="landing-nav"
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-brand-bone/85 border-b border-brand-border"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" data-testid="landing-logo">
          <div
            className="w-9 h-9 flex items-center justify-center"
            style={{ backgroundColor: "#0D0D0E" }}
          >
            <span className="text-sm font-display font-bold text-brand-cream italic">
              LG
            </span>
          </div>
          <span className="text-xl font-display text-brand-ink">
            {landingConfig.brand.name}{" "}
            <em className="italic font-light text-brand-orange">{landingConfig.brand.accent}</em>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              data-testid={`nav-${link.label.toLowerCase()}`}
              className={`eyebrow transition-colors ed-link ${
                location.pathname === link.path
                  ? "text-brand-orange"
                  : "text-brand-nardo hover:text-brand-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {landingConfig.contact.phoneDisplay && (
            <a
              href={`tel:${landingConfig.contact.phoneDisplay.replace(/\s/g, "")}`}
              data-testid="nav-phone"
              onClick={() => window.dispatchEvent(new CustomEvent("track-cta", { detail: "nav_phone" }))}
              className="text-sm font-semibold text-brand-nardo hover:text-brand-orange transition-colors inline-flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              {landingConfig.contact.phoneDisplay}
            </a>
          )}
          {enableConnexion && (
            <a
              href={getLoginUrl()}
              data-testid="nav-login"
              className="text-sm font-semibold text-brand-nardo hover:text-brand-ink transition-colors px-4 py-2"
            >
              Connexion
            </a>
          )}
          {enableSignup ? (
            <a
              href={getRegisterUrl()}
              data-testid="nav-join"
              className="bg-brand-orange text-white hover:bg-brand-orange-dark font-semibold text-sm px-5 py-2.5 transition-colors"
            >
              Rejoindre {landingConfig.brand.name} {landingConfig.brand.accent}
            </a>
          ) : (
            <a
              href="/#lead-section"
              onClick={(e) => goLeadForm(e, "callback")}
              data-testid="nav-cta-lead"
              className="bg-brand-ink text-brand-cream hover:bg-brand-orange font-semibold text-xs uppercase tracking-widest px-5 py-2.5 transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" />
              {nav.ctaLeadLabel}
            </a>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-black/5 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-semibold text-brand-nardo hover:text-brand-orange py-2"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-black/5 flex gap-3">
            {enableConnexion && (
              <a href={getLoginUrl()} className="text-sm font-semibold text-brand-nardo py-2">
                Connexion
              </a>
            )}
            {enableSignup ? (
              <a
                href={getRegisterUrl()}
                className="bg-brand-orange text-white font-semibold text-sm px-5 py-2 flex-1 text-center"
              >
                Rejoindre
              </a>
            ) : (
              <a
                href="/#lead-section"
                onClick={(e) => goLeadForm(e, "callback")}
                className="bg-brand-orange text-white font-semibold text-sm px-5 py-2 flex-1 text-center inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                {nav.ctaLeadLabel}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Mode badge — discreet indicator for non-prod environments */}
      {!isLead && (
        <div className="bg-amber-100 text-amber-800 text-[10px] text-center py-1 font-semibold tracking-wider uppercase">
          Mode app actif
        </div>
      )}
    </header>
  );
}
