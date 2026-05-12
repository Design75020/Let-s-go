import { useState } from "react";
import { X, Phone, MessageCircle, Mail, MapPin, Save, Check } from "lucide-react";
import { api } from "../lib/api.js";

const STATUSES = [
  { value: "new", label: "Nouveau" },
  { value: "contacted", label: "Contacté" },
  { value: "meeting", label: "RDV pris" },
  { value: "converted", label: "Converti" },
  { value: "lost", label: "Perdu" },
];

function whatsappHref(phone) {
  const clean = (phone || "").replace(/[^\d]/g, "").replace(/^0+/, "33");
  return `https://wa.me/${clean}`;
}

function fmt(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("fr-FR");
  } catch { return iso; }
}

export default function LeadDetail({ lead, onClose, onUpdated }) {
  const [status, setStatus] = useState(lead.status || "new");
  const [notes, setNotes] = useState(lead.notes || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    setSaving(true);
    setErr("");
    setSaved(false);
    try {
      const updated = await api.updateLead(lead.id, { status, notes });
      onUpdated(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      data-testid="lead-detail"
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-brand-border px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-brand-nardo">
              Lead · {lead.id.slice(0, 8)}
            </p>
            <h2 className="text-xl font-bold mt-0.5">
              {lead.restaurant || "Sans nom"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-brand-light hover:bg-brand-border transition-colors flex items-center justify-center"
            data-testid="lead-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact */}
          <section>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-brand-nardo mb-3">
              Contact
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                <span className="font-semibold">{lead.phone}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-brand-ink hover:text-brand-orange truncate"
                  >
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.city && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                  <span>{lead.city}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <a
                href={`tel:${lead.phone}`}
                data-testid="quick-call"
                className="bg-brand-orange text-white hover:bg-brand-orange-dark font-semibold py-2.5 flex items-center justify-center gap-2 text-sm transition-colors"
              >
                <Phone className="w-4 h-4" /> Appeler
              </a>
              <a
                href={whatsappHref(lead.phone)}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="quick-whatsapp"
                className="bg-[#25D366] text-white hover:bg-[#1ea952] font-semibold py-2.5 flex items-center justify-center gap-2 text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </section>

          {/* Métadonnées */}
          <section>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-brand-nardo mb-3">
              Informations
            </h3>
            <dl className="divide-y divide-brand-border text-sm">
              <Row label="Cuisine" value={lead.cuisine} />
              <Row label="Préférence" value={lead.preference} />
              <Row label="Source" value={lead.source} />
              <Row label="Device" value={lead.device} />
              <Row label="Reçu le" value={fmt(lead.created_at)} />
              {lead.updated_at && <Row label="Modifié le" value={fmt(lead.updated_at)} />}
              {lead.message && <Row label="Message" value={lead.message} />}
            </dl>
          </section>

          {/* Status update */}
          <section>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-brand-nardo mb-3">
              Mettre à jour
            </h3>

            <label className="block text-xs font-medium text-brand-nardo mb-1.5">
              Statut du lead
            </label>
            <select
              data-testid="lead-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-11 px-3 border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-orange mb-4"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <label className="block text-xs font-medium text-brand-nardo mb-1.5">
              Notes internes
            </label>
            <textarea
              data-testid="lead-notes"
              rows={4}
              placeholder="Écris ici ce qui a été dit, prochaine action…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border text-sm focus:outline-none focus:border-brand-orange resize-none"
            />

            {err && <p className="text-xs text-red-600 mt-2">{err}</p>}

            <button
              data-testid="lead-save"
              onClick={save}
              disabled={saving}
              className="mt-4 w-full bg-brand-ink text-white hover:bg-black font-semibold h-11 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" /> Enregistré
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {saving ? "Enregistrement…" : "Enregistrer"}
                </>
              )}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="py-2.5 grid grid-cols-3 gap-3">
      <dt className="text-xs text-brand-nardo uppercase tracking-wider">{label}</dt>
      <dd className="col-span-2 text-sm break-words">{value}</dd>
    </div>
  );
}
