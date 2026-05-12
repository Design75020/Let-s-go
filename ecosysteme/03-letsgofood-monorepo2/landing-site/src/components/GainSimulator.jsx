import { useState, useMemo } from "react";
import { TrendingUp, Euro, ShoppingBag, ArrowRight } from "lucide-react";
import { landingConfig } from "../config/landingConfig.js";
import { trackEvent } from "../lib/tracking.js";

const TYPES = [
  { value: "burger", label: "Burger / Street food" },
  { value: "pizza", label: "Pizza" },
  { value: "sushi", label: "Sushi / Japonais" },
  { value: "asiatique", label: "Asiatique / Wok" },
  { value: "tacos", label: "Tacos / Kebab" },
  { value: "vegan", label: "Healthy / Vegan" },
  { value: "autre", label: "Autre" },
];

function euros(n) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
}

export default function GainSimulator({ onCta }) {
  const cfg = landingConfig.gainSimulator;
  const [type, setType] = useState("burger");
  const [orders, setOrders] = useState(20);
  const [basket, setBasket] = useState(22);
  const [tracked, setTracked] = useState(false);

  const estimate = useMemo(() => {
    const uplift = cfg.upliftByType[type] ?? 0.3;
    const extraOrdersPerDay = orders * uplift;
    const monthlyOrders = orders * cfg.daysPerMonth;
    const extraMonthlyOrders = extraOrdersPerDay * cfg.daysPerMonth;
    const monthlyRevenue = monthlyOrders * basket;
    const extraMonthlyRevenue = extraMonthlyOrders * basket;
    // With competitors: commission cost you'd lose
    const competitorLoss = monthlyRevenue * cfg.competitorCommission;
    // With Let's Go: you keep 100%, client pays margin
    const letsGoGain = extraMonthlyRevenue + competitorLoss;
    return {
      uplift: Math.round(uplift * 100),
      extraOrdersPerDay: Math.round(extraOrdersPerDay),
      extraMonthlyOrders: Math.round(extraMonthlyOrders),
      extraMonthlyRevenue: Math.round(extraMonthlyRevenue),
      competitorLoss: Math.round(competitorLoss),
      letsGoGain: Math.round(letsGoGain),
    };
  }, [type, orders, basket, cfg]);

  const fireSimulateEvent = () => {
    if (tracked) return;
    setTracked(true);
    trackEvent("simulator_computed", {
      type,
      orders,
      basket,
      uplift: estimate.uplift,
      extra_monthly_revenue: estimate.extraMonthlyRevenue,
    });
  };

  return (
    <div
      data-testid="gain-simulator"
      className="bg-white border border-brand-border overflow-hidden grid grid-cols-1 lg:grid-cols-2"
    >
      {/* INPUTS */}
      <div className="p-8 sm:p-10 bg-brand-light border-r border-brand-border">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-orange mb-2">
          Simulateur personnalisé
        </p>
        <h3 className="text-2xl font-bold mb-8">Estimez votre potentiel</h3>

        <label className="block text-sm font-medium text-brand-nardo mb-2">
          Type de restaurant
        </label>
        <select
          data-testid="sim-type"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            fireSimulateEvent();
          }}
          className="w-full h-12 px-4 border border-brand-border text-sm focus:outline-none focus:border-brand-orange transition-colors mb-6 bg-white"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium text-brand-nardo mb-2">
          Commandes / jour actuelles :{" "}
          <span className="font-bold text-brand-ink">{orders}</span>
        </label>
        <input
          data-testid="sim-orders"
          type="range"
          min="5"
          max="150"
          value={orders}
          onChange={(e) => {
            setOrders(Number(e.target.value));
            fireSimulateEvent();
          }}
          className="w-full accent-brand-orange h-2 cursor-pointer mb-6"
        />

        <label className="block text-sm font-medium text-brand-nardo mb-2">
          Panier moyen :{" "}
          <span className="font-bold text-brand-ink">{basket} €</span>
        </label>
        <input
          data-testid="sim-basket"
          type="range"
          min="8"
          max="60"
          value={basket}
          onChange={(e) => {
            setBasket(Number(e.target.value));
            fireSimulateEvent();
          }}
          className="w-full accent-brand-orange h-2 cursor-pointer"
        />
      </div>

      {/* OUTPUT */}
      <div className="p-8 sm:p-10 bg-white relative">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-nardo mb-2">
          Votre estimation mensuelle
        </p>
        <h3 className="text-2xl font-bold mb-8">Avec Let's Go</h3>

        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-brand-orange" />
            </div>
            <div>
              <p className="text-xs text-brand-nardo uppercase tracking-widest font-semibold">
                Commandes estimées en plus
              </p>
              <p className="text-3xl font-bold text-brand-orange">
                +{estimate.extraMonthlyOrders}
                <span className="text-sm font-medium text-brand-nardo ml-1">/ mois</span>
              </p>
              <p className="text-xs text-brand-nardo">
                soit +{estimate.uplift}% vs aujourd'hui (+{estimate.extraOrdersPerDay} / jour)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center shrink-0">
              <Euro className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <p className="text-xs text-brand-nardo uppercase tracking-widest font-semibold">
                CA supplémentaire mensuel
              </p>
              <p className="text-3xl font-bold text-[#10B981]">
                {euros(estimate.extraMonthlyRevenue)}
              </p>
              <p className="text-xs text-brand-nardo">
                Vous gardez <b>100 %</b> (aucune commission)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-brand-nardo uppercase tracking-widest font-semibold">
                Ce que vous éviteriez en commissions
              </p>
              <p className="text-2xl font-bold text-red-500">
                {euros(estimate.competitorLoss)} <span className="text-sm font-medium text-brand-nardo">/ mois</span>
              </p>
              <p className="text-xs text-brand-nardo">
                Vs Uber Eats / Deliveroo (~30 % de commission sur votre CA actuel)
              </p>
            </div>
          </div>
        </div>

        <a
          href="#lead-section"
          data-testid="sim-cta"
          onClick={() => {
            trackEvent("cta_click", { cta: "simulator_results_to_lead" });
            // Push the estimation to the lead form so it pre-fills the message
            window.dispatchEvent(
              new CustomEvent("lead-estimation", {
                detail: {
                  type,
                  orders,
                  basket,
                  uplift: estimate.uplift,
                  extraMonthlyOrders: estimate.extraMonthlyOrders,
                  extraMonthlyRevenue: estimate.extraMonthlyRevenue,
                },
              })
            );
            window.dispatchEvent(new CustomEvent("lead-preset", { detail: "callback" }));
            onCta?.();
          }}
          className="mt-8 inline-flex items-center justify-center gap-2 bg-brand-orange text-white hover:bg-brand-orange-dark font-semibold w-full h-12 transition-colors"
        >
          Je veux ces résultats <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
