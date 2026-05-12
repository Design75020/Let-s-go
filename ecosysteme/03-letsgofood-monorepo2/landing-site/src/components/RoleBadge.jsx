import { ChefHat, Bike, ShoppingBag } from "lucide-react";

const ROLES = {
  restaurateur: {
    icon: ChefHat,
    label: "Restaurateur",
    here: "Restaurateur ici",
    tagline: "Pour les professionnels de la restauration",
    accent: "#FF5A00",
  },
  livreur: {
    icon: Bike,
    label: "Livreur",
    here: "Livreur ici",
    tagline: "Pour les livreurs indépendants",
    accent: "#10B981",
  },
  client: {
    icon: ShoppingBag,
    label: "Client",
    here: "Client ici",
    tagline: "Pour les gourmands",
    accent: "#3B82F6",
  },
};

/* Big visible "who is this page for" indicator — also visible in PDF */
export default function RoleBadge({ role }) {
  const meta = ROLES[role];
  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <div
      data-testid={`role-badge-${role}`}
      className="flex items-center justify-center gap-3 bg-brand-ink text-brand-cream py-3 px-6 border-b border-brand-border-dark"
    >
      <div
        className="w-7 h-7 flex items-center justify-center"
        style={{ backgroundColor: meta.accent }}
      >
        <Icon className="w-4 h-4 text-brand-cream" />
      </div>
      <p className="eyebrow text-brand-cream">
        <span style={{ color: meta.accent }}>▸</span>{" "}
        Vous êtes <strong className="text-brand-cream">{meta.here}</strong>{" "}
        <span className="text-brand-cream/50 hidden sm:inline">· {meta.tagline}</span>
      </p>
    </div>
  );
}

/* Horizontal nav between the 3 roles — helps users navigate between pages */
export function RoleSwitcher({ current }) {
  const items = [
    { role: "restaurateur", path: "/pour-restaurants" },
    { role: "livreur", path: "/pour-livreurs" },
    { role: "client", path: "/pour-clients" },
  ];

  return (
    <div className="grid grid-cols-3 gap-px bg-brand-border" data-testid="role-switcher">
      {items.map((item) => {
        const meta = ROLES[item.role];
        const Icon = meta.icon;
        const active = current === item.role;
        return (
          <a
            key={item.role}
            href={item.path}
            className={`p-6 flex flex-col items-center text-center transition-colors ${
              active
                ? "bg-brand-ink text-brand-cream"
                : "bg-brand-bone text-brand-ink hover:bg-brand-cream"
            }`}
          >
            <div
              className="w-10 h-10 flex items-center justify-center mb-3"
              style={{ backgroundColor: active ? meta.accent : `${meta.accent}20` }}
            >
              <Icon
                className="w-5 h-5"
                style={{ color: active ? "#FAF8F4" : meta.accent }}
              />
            </div>
            <p className="eyebrow mb-1" style={{ color: active ? "#FAF8F4" : "#6C6F70" }}>
              {active ? "Vous êtes ici" : "Aller à"}
            </p>
            <p className="font-display text-lg">{meta.label}</p>
          </a>
        );
      })}
    </div>
  );
}
