/* ═══════════════════════════════════════════════════════════
   LANDING CONFIG — Configuration centrale du site letsgofood.fr
   ───────────────────────────────────────────────────────────
   Modifiez ce fichier (ou les variables d'environnement VITE_*)
   pour changer le comportement du site SANS toucher au code.
═══════════════════════════════════════════════════════════ */

function envBool(key, fallback) {
  const v = import.meta.env[key];
  if (v === "true") return true;
  if (v === "false") return false;
  return fallback;
}

const MODE = (import.meta.env.VITE_MODE || "lead").toLowerCase();
const isLead = MODE === "lead";

export const landingConfig = {
  /* ─── MODE ────────────────────────────────────────
     "lead" → aucun accès app, tous les boutons → formulaire
     "app"  → connexion/inscription activées + redirections app
  ─────────────────────────────────────────────────── */
  mode: MODE,
  isLead,

  /* ─── URLS & ENDPOINTS ──────────────────────────── */
  appUrl: import.meta.env.VITE_APP_URL || "https://app.letsgofood.fr",
  apiBase: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_APP_URL || "https://app.letsgofood.fr",
  leadEndpoint: import.meta.env.VITE_LEAD_ENDPOINT ?? "/api/leads",
  publicUrl: import.meta.env.VITE_PUBLIC_URL || "https://letsgofood.fr",

  /* ─── ACCÈS APPLICATION (flags) ─────────────────── */
  enableConnexion: envBool("VITE_ENABLE_CONNEXION", !isLead),
  enableSignup: envBool("VITE_ENABLE_SIGNUP", !isLead),
  enableUrgencyBanner: envBool("VITE_ENABLE_URGENCY", true),
  enableWhatsApp: envBool("VITE_ENABLE_WHATSAPP", true),

  /* ─── CONTACT ───────────────────────────────────── */
  contact: {
    // Numéro international sans + ni espaces (ex: "33746336197" pour 0033 7 46 33 61 97)
    whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || "33746336197",
    whatsappMessage:
      import.meta.env.VITE_WHATSAPP_MSG ||
      "Bonjour Let's Go, je souhaite en savoir plus pour référencer mon restaurant.",
    phoneDisplay: import.meta.env.VITE_PHONE_DISPLAY || "+33 7 46 33 61 97",
    email: import.meta.env.VITE_CONTACT_EMAIL || "design75020@proton.me",
  },

  /* ─── BRAND ─────────────────────────────────────── */
  brand: {
    name: "Let's",
    accent: "Go",
    tagline: "Plateforme de livraison nouvelle génération",
  },

  /* ─── HERO ──────────────────────────────────────── */
  hero: {
    eyebrow: "Plateforme de livraison nouvelle génération",
    title1: "Plus de clients.",
    title2: "Zéro contrainte.",
    subtitle:
      "Découvrez en 30 secondes comment augmenter vos commandes avec la livraison gratuite.",
    imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800",
  },

  /* ─── CTAs (mode lead) ──────────────────────────── */
  ctas: {
    primary: {
      label: "Être rappelé en moins de 5 minutes",
      icon: "phone",
      target: "#lead-section",
      preset: "callback",
      trackingId: "cta_primary_callback_5min",
    },
    secondary: {
      label: "Recevoir une démo personnalisée",
      icon: "play",
      target: "#lead-section",
      preset: "rdv",
      trackingId: "cta_secondary_demo",
    },
    tertiary: {
      label: "Tester mon potentiel de commandes",
      icon: "trending-up",
      target: "#gain-simulator",
      preset: null,
      trackingId: "cta_tertiary_simulator",
    },
  },

  /* ─── NAV ───────────────────────────────────────── */
  nav: {
    ctaLeadLabel: "Être rappelé",
  },

  /* ─── URGENCY BANNER ─────────────────────────────── */
  urgency: {
    minCount: 3,
    maxCount: 6,
  },

  /* ─── LEAD FORM ─────────────────────────────────── */
  leadForm: {
    successTitle: "Merci !",
    successMessages: {
      callback: "Nous vous rappelons dans les prochaines minutes.",
      rdv: "Nous vous contactons pour fixer un rendez-vous.",
      info: "Vous recevrez nos informations par SMS.",
    },
  },

  /* ─── GAIN SIMULATOR ─────────────────────────────── */
  gainSimulator: {
    // Pourcentage de commandes supplémentaires estimé par type
    upliftByType: {
      burger: 0.35,
      pizza: 0.32,
      sushi: 0.28,
      asiatique: 0.3,
      tacos: 0.38,
      kebab: 0.34,
      vegan: 0.26,
      autre: 0.3,
    },
    // Marge Let's Go sur le panier moyen (€) — utilisée pour l'estimation de frais évités
    marginPerOrder: 1.5,
    // Commission moyenne des concurrents (UberEats, Deliveroo)
    competitorCommission: 0.3,
    // Facteur jours/mois
    daysPerMonth: 30,
  },

  /* ─── TESTIMONIALS / PROOF ───────────────────────── */
  testimonials: [
    {
      restaurant: "Tacos Mehdi",
      type: "Street food · Tacos",
      city: "Lyon",
      growth: "+28%",
      growthLabel: "commandes en 3 mois",
      quote:
        "Avec Let's Go, je garde 100 % de mes prix. Mes marges ne fondent plus le week-end.",
      person: "Mehdi B., gérant",
      avatarBg: "#FF5A00",
    },
    {
      restaurant: "Street Wok Nana",
      type: "Asiatique · Wok",
      city: "Paris",
      growth: "+22%",
      growthLabel: "nouveaux clients / semaine",
      quote:
        "On a triplé nos commandes du soir. Les livreurs sont rapides et le support répond en 2 minutes.",
      person: "Nana T., fondatrice",
      avatarBg: "#0D0D0E",
    },
    {
      restaurant: "Burger Factory Nico",
      type: "Street food · Burger",
      city: "Marseille",
      growth: "+34%",
      growthLabel: "chiffre d'affaires livraison",
      quote:
        "Le modèle à marge fixe change tout. Fini les 30 % qui partaient chez Uber Eats.",
      person: "Nicolas R., chef",
      avatarBg: "#6C6F70",
    },
  ],

  /* ─── PARTNERS (restaurateurs partenaires — marquee) ── */
  partners: [
    "Tacos Mehdi",
    "Street Wok Nana",
    "Burger Factory Nico",
    "Pizza Napoli Bros",
    "Sushi Sakura",
    "Maison du Kebab",
    "Holy Bowl",
    "Frites & Co",
    "Le Vegan Truck",
    "Poulet Braisé 31",
    "Ramen Club",
    "Smash Burger Lab",
  ],

  /* ─── DELIVERY ZONES (carte de déploiement) ──────────── */
  deliveryZones: {
    headline: "Là où Let's Go opère déjà",
    subtitle: "Nous déployons ville par ville avec des livreurs locaux sélectionnés.",
    active: [
      { city: "Paris", x: 52, y: 18, status: "active" },
      { city: "Lyon", x: 65, y: 55, status: "active" },
      { city: "Marseille", x: 68, y: 85, status: "active" },
    ],
    soon: [
      { city: "Lille", x: 55, y: 6, status: "soon" },
      { city: "Bordeaux", x: 35, y: 68, status: "soon" },
      { city: "Toulouse", x: 50, y: 80, status: "soon" },
      { city: "Nantes", x: 28, y: 40, status: "soon" },
      { city: "Strasbourg", x: 85, y: 22, status: "soon" },
    ],
  },

  /* ─── NEWSLETTER ──────────────────────────────────── */
  newsletter: {
    headline: "Restez informé",
    subtitle:
      "Recevez nos guides exclusifs pour optimiser vos marges, et soyez prévenu quand Let's Go arrive dans votre ville.",
    benefits: [
      "1 email / mois maximum",
      "Études chiffrées exclusives",
      "Désinscription en 1 clic",
    ],
    placeholder: "votre@email.com",
    cta: "M'inscrire",
    successMessage: "Merci ! Vérifiez votre boîte mail pour confirmer.",
  },

  /* ─── QR CODE SECTION ─────────────────────────────── */
  qr: {
    // URL cible (avec tracking) — pointe vers la page onboarding rapide
    targetUrl: `${import.meta.env.VITE_PUBLIC_URL || "https://letsgofood.fr"}/onboarding?source=qr_landing`,
    headline: "Un simple flash et votre restaurant est référencé",
    subtitle:
      "Imprimez ce QR code sur vos flyers, vitrines ou cartes de visite. Chaque scan est tracé pour mesurer votre acquisition.",
    foreground: "#1A1A1B",
    background: "#FFFFFF",
  },

  /* ─── PDF BROCHURES (downloadables) ──────────────── */
  pdfs: {
    root: "/pdfs",
    files: {
      "/": "letsgofood-accueil.pdf",
      "/pour-restaurants": "letsgofood-restaurants.pdf",
      "/pour-livreurs": "letsgofood-livreurs.pdf",
      "/pour-clients": "letsgofood-clients.pdf",
    },
    bundle: "letsgofood-pack-complet.zip",
  },

  /* ─── FOOTER ────────────────────────────────────── */
  footer: {
    year: 2026,
    links: [
      { path: "/pour-restaurants", label: "Restaurants" },
      { path: "/pour-livreurs", label: "Livreurs" },
      { path: "/pour-clients", label: "Clients" },
    ],
  },
};

/* ─── HELPERS ───────────────────────────────────── */

export function getLeadUrl() {
  const ep = landingConfig.leadEndpoint;
  if (!ep) return "";
  if (/^https?:\/\//i.test(ep)) return ep;
  const base = landingConfig.apiBase.replace(/\/+$/, "");
  const path = ep.startsWith("/") ? ep : `/${ep}`;
  return `${base}${path}`;
}

export function getPrimaryCtaHref() {
  if (landingConfig.isLead) return "/#lead-section";
  return `${landingConfig.appUrl}/register`;
}

export function getLoginUrl() {
  return `${landingConfig.appUrl}/login`;
}

export function getRegisterUrl() {
  return `${landingConfig.appUrl}/register`;
}

export function getWhatsAppLink() {
  const num = landingConfig.contact.whatsappNumber;
  const msg = encodeURIComponent(landingConfig.contact.whatsappMessage);
  return `https://wa.me/${num}?text=${msg}`;
}

export function getPdfForPath(pathname) {
  const files = landingConfig.pdfs.files;
  const file = files[pathname] || files["/"];
  // Respect Vite base path in build (e.g. /landing-preview/)
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  return `${base}${landingConfig.pdfs.root}/${file}`;
}

export function getPdfBundleUrl() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  return `${base}${landingConfig.pdfs.root}/${landingConfig.pdfs.bundle}`;
}
