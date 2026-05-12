import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import LeadDetail from "../components/LeadDetail.jsx";
import { Phone, MessageCircle, Filter, Search, RefreshCw, Inbox, Download } from "lucide-react";

const STATUS_LABEL = {
  new: { label: "Nouveau", bg: "bg-brand-orange/10", fg: "text-brand-orange" },
  contacted: { label: "Contacté", bg: "bg-blue-50", fg: "text-blue-600" },
  meeting: { label: "RDV", bg: "bg-purple-50", fg: "text-purple-600" },
  converted: { label: "Converti", bg: "bg-green-50", fg: "text-green-600" },
  lost: { label: "Perdu", bg: "bg-gray-100", fg: "text-gray-500" },
};

const PREF_LABEL = {
  callback: "Rappel",
  rdv: "RDV",
  info: "Infos SMS",
};

function whatsappHref(phone) {
  const clean = (phone || "").replace(/[^\d]/g, "").replace(/^0+/, "33");
  return `https://wa.me/${clean}`;
}

function formatDate(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [filterRef, setFilterRef] = useState("all");
  const [filterZone, setFilterZone] = useState("all");
  const [filterSrc, setFilterSrc] = useState("all");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await api.getLeads();
      setLeads(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const sources = useMemo(() => {
    const s = new Set();
    leads.forEach((l) => s.add(l.source || "direct"));
    return Array.from(s);
  }, [leads]);

  const refs = useMemo(() => {
    const s = new Set();
    leads.forEach((l) => { if (l.ref) s.add(l.ref); });
    return Array.from(s).sort();
  }, [leads]);

  const zones = useMemo(() => {
    const s = new Set();
    leads.forEach((l) => { if (l.zone) s.add(l.zone); });
    return Array.from(s).sort();
  }, [leads]);

  const srcs = useMemo(() => {
    const s = new Set();
    leads.forEach((l) => { if (l.src) s.add(l.src); });
    return Array.from(s).sort();
  }, [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const status = l.status || "new";
      if (filterStatus !== "all" && status !== filterStatus) return false;
      const src = l.source || "direct";
      if (filterSource !== "all" && src !== filterSource) return false;
      if (filterRef !== "all" && (l.ref || "") !== filterRef) return false;
      if (filterZone !== "all" && (l.zone || "") !== filterZone) return false;
      if (filterSrc !== "all" && (l.src || "") !== filterSrc) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = [l.restaurant, l.name, l.phone, l.city, l.cuisine, l.email, l.ref, l.zone, l.src]
          .filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, filterStatus, filterSource, filterRef, filterZone, filterSrc, query]);

  const hasAnyAttribFilter = refs.length + zones.length + srcs.length > 0;

  const onUpdated = (updated) => {
    setLeads((ls) => ls.map((l) => (l.id === updated.id ? updated : l)));
    setSelected(updated);
  };

  return (
    <div className="p-8 max-w-7xl">
      <header className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-orange">
            Pipeline
          </p>
          <h1 className="text-3xl font-bold mt-1">Leads</h1>
          <p className="text-sm text-brand-nardo mt-1">
            {filtered.length} / {leads.length} lead{leads.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={api.csvExportUrl({
              ref: filterRef !== "all" ? filterRef : "",
              zone: filterZone !== "all" ? filterZone : "",
              src: filterSrc !== "all" ? filterSrc : "",
            })}
            data-testid="leads-export-csv"
            className="inline-flex items-center gap-2 text-sm bg-brand-ink text-white hover:bg-brand-orange px-4 py-2 transition-colors font-semibold"
            title="Exporter les leads filtrés en CSV (Excel)"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <button
            onClick={load}
            data-testid="leads-refresh"
            className="inline-flex items-center gap-2 text-sm border border-brand-border hover:border-brand-nardo px-4 py-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border border-brand-border p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-nardo" />
          <input
            data-testid="leads-search"
            type="search"
            placeholder="Rechercher par nom, téléphone, ville…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 border border-brand-border text-sm focus:outline-none focus:border-brand-orange"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-brand-nardo">
          <Filter className="w-3.5 h-3.5" />
          Statut
        </div>
        <select
          data-testid="filter-status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 px-3 border border-brand-border text-sm bg-white"
        >
          <option value="all">Tous</option>
          <option value="new">Nouveau</option>
          <option value="contacted">Contacté</option>
          <option value="meeting">RDV</option>
          <option value="converted">Converti</option>
          <option value="lost">Perdu</option>
        </select>

        <select
          data-testid="filter-source"
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="h-10 px-3 border border-brand-border text-sm bg-white"
        >
          <option value="all">Toutes sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {hasAnyAttribFilter && (
          <>
            {refs.length > 0 && (
              <select
                data-testid="filter-ref"
                value={filterRef}
                onChange={(e) => setFilterRef(e.target.value)}
                className="h-10 px-3 border border-brand-border text-sm bg-white"
                title="Filtrer par commercial (ref)"
              >
                <option value="all">Tous commerciaux</option>
                {refs.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            )}
            {zones.length > 0 && (
              <select
                data-testid="filter-zone"
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="h-10 px-3 border border-brand-border text-sm bg-white"
                title="Filtrer par zone"
              >
                <option value="all">Toutes zones</option>
                {zones.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            )}
            {srcs.length > 0 && (
              <select
                data-testid="filter-src"
                value={filterSrc}
                onChange={(e) => setFilterSrc(e.target.value)}
                className="h-10 px-3 border border-brand-border text-sm bg-white"
                title="Filtrer par canal (src : flyer, qr, vitrine…)"
              >
                <option value="all">Tous canaux</option>
                {srcs.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </>
        )}
      </div>

      {/* Table */}
      {err && (
        <p className="text-sm text-red-600 mb-4">Erreur : {err}</p>
      )}
      {loading ? (
        <p className="text-sm text-brand-nardo">Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-brand-border p-12 text-center">
          <Inbox className="w-10 h-10 mx-auto text-brand-nardo mb-3" />
          <p className="text-sm text-brand-nardo">Aucun lead à afficher.</p>
        </div>
      ) : (
        <div className="bg-white border border-brand-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-light text-brand-nardo">
                <tr className="text-left text-xs uppercase tracking-widest">
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Ville</th>
                  <th className="py-3 px-4">Pref</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Attribution</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const status = l.status || "new";
                  const meta = STATUS_LABEL[status];
                  return (
                    <tr
                      key={l.id}
                      data-testid="lead-row"
                      className="border-t border-brand-border hover:bg-brand-light/50 cursor-pointer"
                      onClick={() => setSelected(l)}
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold">{l.restaurant || "—"}</p>
                        {l.cuisine && (
                          <p className="text-xs text-brand-nardo">{l.cuisine}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{l.phone}</p>
                        {l.email && (
                          <p className="text-xs text-brand-nardo truncate max-w-[180px]">
                            {l.email}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">{l.city || "—"}</td>
                      <td className="py-3 px-4 text-brand-nardo text-xs">
                        {PREF_LABEL[l.preference] || "—"}
                      </td>
                      <td className="py-3 px-4 text-xs">{l.source || "direct"}</td>
                      <td className="py-3 px-4 text-xs">
                        {(l.ref || l.src || l.zone) ? (
                          <div className="flex flex-col gap-0.5 min-w-[110px]">
                            {l.ref && (
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-brand-orange" />
                                <span className="font-semibold text-brand-ink">{l.ref}</span>
                              </span>
                            )}
                            {l.src && (
                              <span className="text-brand-nardo">via {l.src}</span>
                            )}
                            {l.zone && (
                              <span className="text-brand-nardo">{l.zone}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-brand-nardo">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${meta.bg} ${meta.fg}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-brand-nardo whitespace-nowrap">
                        {formatDate(l.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`tel:${l.phone}`}
                            className="w-8 h-8 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white transition-colors flex items-center justify-center"
                            title="Appeler"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={whatsappHref(l.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors flex items-center justify-center"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <LeadDetail
          lead={selected}
          onClose={() => setSelected(null)}
          onUpdated={onUpdated}
        />
      )}
    </div>
  );
}
