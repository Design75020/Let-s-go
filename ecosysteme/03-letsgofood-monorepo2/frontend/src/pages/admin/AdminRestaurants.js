import { useState, useEffect } from "react";
import api, { formatApiError } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { name: "", address: "", phone: "", description: "", image_url: "", cuisine_type: "", delivery_fee: 0, min_order: 0, delivery_time: "30-45 min" };

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchRestaurants = async () => {
    try { const { data } = await api.get("/restaurants"); setRestaurants(data); }
    catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const openNew = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };
  const openEdit = (r) => {
    setForm({ name: r.name, address: r.address, phone: r.phone || "", description: r.description || "", image_url: r.image_url || "", cuisine_type: r.cuisine_type || "", delivery_fee: r.delivery_fee || 0, min_order: r.min_order || 0, delivery_time: r.delivery_time || "" });
    setEditId(r.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/restaurants/${editId}`, form);
        toast.success("Restaurant mis a jour");
      } else {
        await api.post("/restaurants", form);
        toast.success("Restaurant cree");
      }
      setDialogOpen(false);
      fetchRestaurants();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce restaurant ?")) return;
    try { await api.delete(`/restaurants/${id}`); toast.success("Restaurant supprime"); fetchRestaurants(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const handleToggleStatus = async (id) => {
    try { await api.put(`/restaurants/${id}/toggle-status`); fetchRestaurants(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const u = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div data-testid="admin-restaurants" className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Restaurants</h1>
          <p className="text-muted-foreground mt-1">{restaurants.length} restaurants enregistres</p>
        </div>
        <Button data-testid="add-restaurant-btn" onClick={openNew} className="bg-[#FF6B00] hover:bg-[#E05E00] text-white">
          <Plus className="w-4 h-4 mr-2" />Ajouter
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurant</TableHead>
              <TableHead>Cuisine</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Commandes</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.map((r) => (
              <TableRow key={r.id} data-testid={`restaurant-row-${r.id}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {r.image_url && <img src={r.image_url} alt={r.name} className="w-10 h-10 rounded-lg object-cover" />}
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.address}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline">{r.cuisine_type}</Badge></TableCell>
                <TableCell><span className="flex items-center gap-1"><Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />{r.rating}</span></TableCell>
                <TableCell>{r.total_orders}</TableCell>
                <TableCell>
                  <button onClick={() => handleToggleStatus(r.id)} data-testid={`toggle-status-${r.id}`} className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${r.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {r.status === "active" ? "Actif" : "Inactif"}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button data-testid={`edit-restaurant-${r.id}`} variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button data-testid={`delete-restaurant-${r.id}`} variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier le restaurant" : "Nouveau restaurant"}</DialogTitle>
            <DialogDescription>Remplissez les informations du restaurant</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-1.5"><Label>Nom *</Label><Input data-testid="restaurant-name-input" value={form.name} onChange={u("name")} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Adresse *</Label><Input value={form.address} onChange={u("address")} /></div>
            <div className="space-y-1.5"><Label>Telephone</Label><Input value={form.phone} onChange={u("phone")} /></div>
            <div className="space-y-1.5"><Label>Type de cuisine</Label><Input value={form.cuisine_type} onChange={u("cuisine_type")} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={u("description")} rows={2} /></div>
            <div className="col-span-2 space-y-1.5"><Label>URL de l'image</Label><Input value={form.image_url} onChange={u("image_url")} placeholder="https://..." /></div>
            <div className="space-y-1.5"><Label>Frais de livraison</Label><Input type="number" step="0.01" value={form.delivery_fee} onChange={(e) => setForm(f => ({...f, delivery_fee: parseFloat(e.target.value) || 0}))} /></div>
            <div className="space-y-1.5"><Label>Commande minimum</Label><Input type="number" step="0.01" value={form.min_order} onChange={(e) => setForm(f => ({...f, min_order: parseFloat(e.target.value) || 0}))} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Temps de livraison</Label><Input value={form.delivery_time} onChange={u("delivery_time")} placeholder="30-45 min" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button data-testid="save-restaurant-btn" onClick={handleSave} className="bg-[#FF6B00] hover:bg-[#E05E00] text-white">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
