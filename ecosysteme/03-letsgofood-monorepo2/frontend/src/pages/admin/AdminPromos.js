import { useState, useEffect } from "react";
import api, { formatApiError } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Plus, Pencil, Trash2, Tag, Percent, DollarSign, Copy } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { code: "", discount_type: "percentage", discount_value: 0, min_order: 0, max_uses: 0, expiry_date: "", is_active: true };

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchPromos = async () => {
    try { const { data } = await api.get("/promo-codes"); setPromos(data); }
    catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPromos(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };
  const openEdit = (p) => {
    setForm({ code: p.code, discount_type: p.discount_type, discount_value: p.discount_value, min_order: p.min_order || 0, max_uses: p.max_uses || 0, expiry_date: p.expiry_date ? p.expiry_date.split("T")[0] : "", is_active: p.is_active });
    setEditId(p.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, expiry_date: form.expiry_date ? new Date(form.expiry_date).toISOString() : "" };
      if (editId) {
        await api.put(`/promo-codes/${editId}`, payload);
        toast.success("Code promo mis a jour");
      } else {
        await api.post("/promo-codes", payload);
        toast.success("Code promo cree");
      }
      setDialogOpen(false);
      fetchPromos();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce code promo ?")) return;
    try { await api.delete(`/promo-codes/${id}`); toast.success("Code promo supprime"); fetchPromos(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copie !");
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div data-testid="admin-promos" className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Codes Promo</h1>
          <p className="text-muted-foreground mt-1">{promos.length} codes actifs</p>
        </div>
        <Button data-testid="add-promo-btn" onClick={openNew} className="bg-[#F59E0B] hover:bg-[#D97706] text-white">
          <Plus className="w-4 h-4 mr-2" />Nouveau code
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Reduction</TableHead>
              <TableHead>Commande min.</TableHead>
              <TableHead>Utilisations</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  <Tag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  Aucun code promo
                </TableCell>
              </TableRow>
            ) : promos.map((p) => (
              <TableRow key={p.id} data-testid={`promo-row-${p.id}`}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#F59E0B]/10 text-[#92400E] border-[#F59E0B]/20 font-mono">{p.code}</Badge>
                    <button onClick={() => copyCode(p.code)} className="text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    {p.discount_type === "percentage" ? <Percent className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                    {p.discount_value}{p.discount_type === "percentage" ? "%" : " EUR"}
                  </span>
                </TableCell>
                <TableCell>{p.min_order > 0 ? `${p.min_order} EUR` : "Aucun"}</TableCell>
                <TableCell>{p.current_uses}{p.max_uses > 0 ? ` / ${p.max_uses}` : " / illimite"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {p.expiry_date ? new Date(p.expiry_date).toLocaleDateString("fr-FR") : "Jamais"}
                </TableCell>
                <TableCell>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {p.is_active ? "Actif" : "Inactif"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} data-testid={`edit-promo-${p.id}`}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive" data-testid={`delete-promo-${p.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier le code" : "Nouveau code promo"}</DialogTitle>
            <DialogDescription>Configurez les parametres du code promo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5"><Label>Code *</Label><Input data-testid="promo-code-input" value={form.code} onChange={(e) => setForm(f => ({...f, code: e.target.value}))} placeholder="ex: PROMO20" className="font-mono uppercase" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type de reduction</Label>
                <Select value={form.discount_type} onValueChange={(val) => setForm(f => ({...f, discount_type: val}))}>
                  <SelectTrigger data-testid="promo-type-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed">Montant fixe (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Valeur</Label><Input data-testid="promo-value-input" type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm(f => ({...f, discount_value: parseFloat(e.target.value) || 0}))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Commande minimum (EUR)</Label><Input type="number" step="0.01" value={form.min_order} onChange={(e) => setForm(f => ({...f, min_order: parseFloat(e.target.value) || 0}))} /></div>
              <div className="space-y-1.5"><Label>Utilisations max (0=illimite)</Label><Input type="number" value={form.max_uses} onChange={(e) => setForm(f => ({...f, max_uses: parseInt(e.target.value) || 0}))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Date d'expiration</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm(f => ({...f, expiry_date: e.target.value}))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button data-testid="save-promo-btn" onClick={handleSave} className="bg-[#F59E0B] hover:bg-[#D97706] text-white">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
