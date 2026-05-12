import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { api } from "../lib/api.js";
import {
  TrendingUp, Users, Phone, Calendar, Check, X as XIcon, ArrowRight, Activity, Award, Crown, Medal, Download,
} from "lucide-react";

const STATUS_META = {
  new: { label: "Nouveau", color: "#FF5A00", icon: Users },
  contacted: { label: "Contacté", color: "#3B82F6", icon: Phone },
  meeting: { label: "RDV pris", color: "#8B5CF6", icon: Calendar },
  converted: { label: "Converti", color: "#10B981", icon: Check },
  lost: { label: "Perdu", color: "#6C6F70", icon: XIcon },
};

const TIER_META = {
  legend: { label: "Legend", color: "#FF5A00", icon: Crown },
  pro: { label: "Pro", color: "#8B5CF6", icon: Medal },
  rookie: { label: "Rookie", color: "#6C6F70", icon: Award },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState(null);
  const [attrib, setAttrib] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [leaderPeriod, setLeaderPeriod] = useState("month");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, e, a] = await Promise.all([
          api.leadsStats(),
          api.trackSummary(),
          api.attributionSummary(),
        ]);
        setStats(s);
        setEvents(e);
        setAttrib(a);
      } catch (err) {
        setErr(err.message);
      }
    })();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const lb = await api.leaderboard(leaderPeriod);
        if (mounted) setLeaderboard(lb);
      } catch { /* noop */ }
    })();
    return () => { mounted = false; };
  }, [leaderPeriod]);

  if (err) return <div className="p-10 text-red-600 text-sm">Erreur : {err}</div>;
  if (!stats) return <div className="p-10 text-brand-nardo text-sm">Chargement…</div>;

  const totalByStatus = Object.values(stats.by_status).reduce((a, b) => a + b, 0);

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-orange">
          Vue d'ensemble
        </p>
        <h1 className="text-3xl font-bold mt-1">Dashboard</h1>
        <p className="text-sm text-brand-nardo mt-1">
          Pipeline commercial en temps réel
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KpiCard label="Leads total" value={stats.total} icon={Users} color="#1A1A1B" />
        <KpiCard label="Aujourd'hui" value={stats.today} icon={TrendingUp} color="#FF5A00" />
        <KpiCard label="Convertis" value={stats.by_status.converted} icon={Check} color="#10B981" />
        <KpiCard
          label="Taux conversion"
          value={
            stats.total > 0
              ? `${Math.round((stats.by_status.converted / stats.total) * 100)}%`
              : "0%"
          }
          icon={Activity}
          color="#3B82F6"
        />
      </section>

      {/* Funnel */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-brand-border p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6">
            Pipeline par statut
          </h2>
          <div className="space-y-3">
            {["new", "contacted", "meeting", "converted", "lost"].map((s) => {
              const meta = STATUS_META[s];
              const count = stats.by_status[s] || 0;
              const pct = totalByStatus > 0 ? (count / totalByStatus) * 100 : 0;
              const Icon = meta.icon;
              return (
                <div key={s}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2 font-medium">
                      <Icon className="w-4 h-4" style={{ color: meta.color }} />
                      {meta.label}
                    </span>
                    <span className="font-bold">{count}</span>
                  </div>
                  <div className="h-2 bg-brand-light overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: meta.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-brand-border p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6">
            Leads par source
          </h2>
          <div className="space-y-3">
            {stats.by_source.length === 0 && (
              <p className="text-sm text-brand-nardo">Aucune donnée.</p>
            )}
            {stats.by_source.map((s) => (
              <div key={s.source} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0">
                <span className="text-sm font-medium">{s.source}</span>
                <span className="text-lg font-bold text-brand-orange">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attribution — Top commerciaux / zones / canaux */}
      {attrib && (
        <AttributionSection attrib={attrib} />
      )}

      {/* Leaderboard — gamifié par tier */}
      {leaderboard && (
        <LeaderboardSection
          data={leaderboard}
          period={leaderPeriod}
          onPeriodChange={setLeaderPeriod}
        />
      )}

      {/* Events */}
      {events && (
        <section className="bg-white border border-brand-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest">
              Tracking — Activité landing
            </h2>
            <span className="text-xs text-brand-nardo">
              {events.total_events} events · {events.total_leads} leads
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {events.breakdown.slice(0, 12).map((e, i) => (
              <div key={i} className="border border-brand-border p-3">
                <p className="text-[10px] text-brand-nardo uppercase tracking-widest truncate">
                  {e.source || "direct"}
                </p>
                <p className="text-sm font-semibold truncate">{e.event}</p>
                <p className="text-xl font-bold text-brand-orange mt-1">{e.count}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Link
        to="/leads"
        className="mt-8 inline-flex items-center gap-2 bg-brand-orange text-white hover:bg-brand-orange-dark font-semibold px-6 py-3 transition-colors"
      >
        Gérer les leads <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white border border-brand-border p-5">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-brand-nardo font-semibold">
          {label}
        </p>
      </div>
      <p className="text-3xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

/* ─── ATTRIBUTION SECTION ─── */
function AttributionSection({ attrib }) {
  const { total, tagged, by_ref, by_src, by_zone, by_camp } = attrib;
  const pct = total > 0 ? Math.round((tagged / total) * 100) : 0;
  const hasAny = (by_ref?.length || 0) + (by_src?.length || 0) + (by_zone?.length || 0) + (by_camp?.length || 0) > 0;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Attribution — Qui ramène les leads ?
          </h2>
          <p className="text-xs text-brand-nardo mt-1">
            {tagged}/{total} leads trackés ({pct}%) · répartition par commercial, canal et zone
          </p>
        </div>
      </div>

      {!hasAny ? (
        <div className="bg-white border border-brand-border p-8 text-center text-sm text-brand-nardo">
          Aucun lead tracké pour le moment. Partagez un lien avec ?ref=agent_001&amp;src=flyer&amp;zone=paris11
          pour commencer à mesurer vos canaux.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <RankList title="Top commerciaux" emptyLabel="Aucun ref" items={by_ref} accent="#FF5A00" />
          <RankList title="Top canaux (src)" emptyLabel="Aucun canal" items={by_src} accent="#3B82F6" />
          <RankList title="Top zones" emptyLabel="Aucune zone" items={by_zone} accent="#10B981" />
          <RankList title="Top campagnes" emptyLabel="Aucune campagne" items={by_camp} accent="#8B5CF6" />
        </div>
      )}

      <LinkBuilder />
    </section>
  );
}

function RankList({ title, emptyLabel, items, accent }) {
  return (
    <div className="bg-white border border-brand-border p-5">
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-nardo mb-3">{title}</h3>
      {!items || items.length === 0 ? (
        <p className="text-xs text-brand-nardo">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 6).map((it, i) => {
            const convRate = it.count > 0 ? Math.round((it.converted / it.count) * 100) : 0;
            return (
              <li key={it.key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm min-w-0">
                  <span
                    className="text-[10px] font-display italic flex-shrink-0"
                    style={{ color: accent }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium truncate">{it.key}</span>
                </span>
                <span className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-base font-bold" style={{ color: accent }}>{it.count}</span>
                  {it.converted > 0 && (
                    <span className="text-[10px] text-[#10B981] font-semibold">
                      {convRate}% conv.
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ─── LINK BUILDER — construit un lien trackable pour un commercial ─── */
function LinkBuilder() {
  const [ref, setRef] = useState("");
  const [src, setSrc] = useState("flyer");
  const [zone, setZone] = useState("");
  const [camp, setCamp] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  const base = import.meta.env.VITE_PUBLIC_URL || "https://letsgofood.fr";
  const params = new URLSearchParams();
  if (ref) params.set("ref", ref.trim());
  if (src) params.set("src", src.trim());
  if (zone) params.set("zone", zone.trim());
  if (camp) params.set("camp", camp.trim());
  const qs = params.toString();
  const url = qs ? `${base}/?${qs}` : `${base}/`;

  // Regenerate QR code whenever URL changes (debounced)
  useEffect(() => {
    let cancelled = false;
    setQrLoading(true);
    const t = setTimeout(async () => {
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: 420,
          margin: 2,
          color: { dark: "#0D0D0E", light: "#FFFFFF" },
          errorCorrectionLevel: "H",
        });
        if (!cancelled) setQrDataUrl(dataUrl);
      } catch { /* noop */ }
      finally { if (!cancelled) setQrLoading(false); }
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };

  const downloadQr = async (format) => {
    if (format === "svg") {
      const svg = await QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "H" });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      triggerDownload(blob, `qr-${ref || "letsgo"}${zone ? `-${zone}` : ""}.svg`);
    } else {
      const link = document.createElement("a");
      link.download = `qr-${ref || "letsgo"}${zone ? `-${zone}` : ""}.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  return (
    <div className="bg-white border border-brand-border p-5 mt-4" data-testid="link-builder">
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-nardo mb-3">
        Générateur de lien & QR trackable
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <input
              data-testid="lb-ref"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="ref (agent_001)"
              className="h-9 px-3 border border-brand-border text-xs focus:outline-none focus:border-brand-orange"
            />
            <input
              data-testid="lb-src"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="src (flyer/qr/vitrine)"
              className="h-9 px-3 border border-brand-border text-xs focus:outline-none focus:border-brand-orange"
            />
            <input
              data-testid="lb-zone"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="zone (paris11)"
              className="h-9 px-3 border border-brand-border text-xs focus:outline-none focus:border-brand-orange"
            />
            <input
              data-testid="lb-camp"
              value={camp}
              onChange={(e) => setCamp(e.target.value)}
              placeholder="camp (hiver2026)"
              className="h-9 px-3 border border-brand-border text-xs focus:outline-none focus:border-brand-orange"
            />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <code
              data-testid="lb-url"
              className="flex-1 h-9 px-3 text-xs bg-brand-light border border-brand-border flex items-center truncate text-brand-ink"
            >
              {url}
            </code>
            <button
              type="button"
              onClick={copy}
              data-testid="lb-copy"
              className="h-9 px-4 bg-brand-orange text-white text-xs font-semibold uppercase tracking-widest hover:bg-brand-orange-dark transition-colors"
            >
              {copied ? "Copié ✓" : "Copier"}
            </button>
          </div>
          <p className="text-[11px] text-brand-nardo italic leading-relaxed">
            Chaque QR/lien trace automatiquement le commercial, le canal et la zone.
            Télécharge le QR en haute résolution pour l'imprimer sur tes flyers, vitrines ou cartes de visite.
          </p>
        </div>

        {/* QR preview + download */}
        <div className="flex flex-col items-center gap-2 w-[200px] shrink-0">
          <div className="w-full aspect-square bg-white border border-brand-border flex items-center justify-center overflow-hidden">
            {qrLoading || !qrDataUrl ? (
              <div className="text-[10px] text-brand-nardo">Génération…</div>
            ) : (
              <img src={qrDataUrl} alt="QR trackable" className="w-full h-full object-contain" data-testid="lb-qr-preview" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5 w-full">
            <button
              type="button"
              onClick={() => downloadQr("png")}
              data-testid="lb-download-png"
              className="inline-flex items-center justify-center gap-1 h-8 px-2 text-[10px] font-bold uppercase tracking-widest bg-brand-ink text-white hover:bg-brand-orange transition-colors"
            >
              <Download className="w-3 h-3" /> PNG
            </button>
            <button
              type="button"
              onClick={() => downloadQr("svg")}
              data-testid="lb-download-svg"
              className="inline-flex items-center justify-center gap-1 h-8 px-2 text-[10px] font-bold uppercase tracking-widest bg-brand-ink text-white hover:bg-brand-orange transition-colors"
            >
              <Download className="w-3 h-3" /> SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

/* ─── LEADERBOARD SECTION — gamifié par tier ─── */
function LeaderboardSection({ data, period, onPeriodChange }) {
  const items = data?.leaderboard || [];
  return (
    <section className="mb-10" data-testid="leaderboard-section">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Leaderboard commerciaux
          </h2>
          <p className="text-xs text-brand-nardo mt-1">
            Classement terrain gamifié — Legend / Pro / Rookie
          </p>
        </div>
        <div className="inline-flex border border-brand-border rounded overflow-hidden bg-white">
          {[
            { k: "week", l: "7 j" },
            { k: "month", l: "30 j" },
            { k: "all", l: "Tout" },
          ].map((p) => (
            <button
              key={p.k}
              type="button"
              data-testid={`leader-period-${p.k}`}
              onClick={() => onPeriodChange(p.k)}
              className={`px-4 h-8 text-[10px] uppercase tracking-widest font-bold transition-colors ${period === p.k ? "bg-brand-ink text-white" : "text-brand-nardo hover:bg-brand-light"}`}
            >
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-brand-border p-8 text-center text-sm text-brand-nardo">
          Aucun commercial classé sur cette période. Les leads doivent être capturés avec un paramètre ?ref=agent_XXX pour apparaître ici.
        </div>
      ) : (
        <div className="bg-white border border-brand-border overflow-hidden">
          {items.slice(0, 10).map((item, i) => {
            const tier = TIER_META[item.tier] || TIER_META.rookie;
            const TierIcon = tier.icon;
            return (
              <div
                key={item.ref}
                className={`flex items-center gap-4 px-5 py-4 border-b border-brand-border last:border-b-0 ${i < 3 ? "bg-brand-light/40" : ""}`}
              >
                <div className="w-10 text-center">
                  <span className="font-display display-number text-2xl italic" style={{ color: i === 0 ? "#FF5A00" : i < 3 ? "#8B5CF6" : "#6C6F70" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-brand-ink truncate">{item.ref}</span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                      style={{ backgroundColor: `${tier.color}15`, color: tier.color }}
                    >
                      <TierIcon className="w-3 h-3" />
                      {tier.label}
                    </span>
                  </div>
                  {item.zones.length > 0 && (
                    <p className="text-[11px] text-brand-nardo mt-0.5 truncate">
                      Zones : {item.zones.join(" · ")}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-display display-number text-2xl text-brand-ink">
                    {item.count}
                  </p>
                  <p className="text-[10px] text-brand-nardo">leads</p>
                </div>
                {item.converted > 0 && (
                  <div className="text-right min-w-[55px]">
                    <p className="font-display display-number text-lg text-[#10B981]">
                      {item.conversion_rate}%
                    </p>
                    <p className="text-[10px] text-brand-nardo">conv.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
