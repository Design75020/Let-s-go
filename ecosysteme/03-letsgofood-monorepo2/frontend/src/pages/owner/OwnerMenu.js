import { useState, useEffect, useMemo, useCallback } from "react";import api, { formatApiError } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

const emptyItem = { name: "", description: "", price: 0, image_url: "", category: "", available: true };

export default function OwnerMenu() {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyItem);

  const fetchData = useCallback(async () => {
    try {
      const { data: dashboard } = await api.get("/owner/dashboard");
      setRestaurants(dashboard.restaurants || []);
      if (dashboard.restaurants && dashboard.restaurants.length > 0) {
        const { data: items } = await api.get(`/restaurants/${dashboard.restaurants[0].id}/menu`);
        setMenuItems(items);
      }
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNew = () => { setForm(emptyItem); setEditId(null); setDialogOpen(true); };
  const openEdit = (item) => {
    setForm({ name: item.name, description: item.description || "", price: item.price, image_url: item.image_url || "", category: item.category || "", available: item.available });
    setEditId(item.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/menu-items/${editId}`, form);
        toast.success("Plat mis a jour");
      } else if (restaurants.length > 0) {
        await api.post(`/restaurants/${restaurants[0].id}/menu`, form);
        toast.success("Plat ajoute");
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce plat ?")) return;
    try { await api.delete(`/menu-items/${id}`); toast.success("Plat supprime"); fetchData(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const categories = useMemo(() => [...new Set(menuItems.map(i => i.category))], [menuItems]);

  const itemsByCategory = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat] = menuItems.filter((i) => i.category === cat);
    });
    return map;
  }, [categories, menuItems]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div data-testid="owner-menu" className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Mon Menu</h1>
          <p className="text-muted-foreground mt-1">{menuItems.length} plats</p>
        </div>
        <Button data-testid="add-menu-item-btn" onClick={openNew} className="bg-[#10B981] hover:bg-[#059669] text-white">
          <Plus className="w-4 h-4 mr-2" />Ajouter un plat
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20">
          <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-lg text-muted-foreground">Aucun plat dans votre menu</p>
          <p className="text-sm text-muted-foreground">Ajoutez votre premier plat pour commencer</p>
        </div>
      ) : categories.map(cat => (
        <div key={cat} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2" style={{ fontFamily: 'Outfit' }}>{cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemsByCategory[cat].map(item => (
              <div key={item.id} data-testid={`owner-menu-item-${item.id}`} className="bg-white rounded-xl border border-border overflow-hidden card-hover">
                {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover" />}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${item.available ? "bg-[#10B981]" : "bg-gray-300"}`} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#FF6B00]">{item.price.toFixed(2)} EUR</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier le plat" : "Nouveau plat"}</DialogTitle>
            <DialogDescription>Remplissez les informations du plat</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5"><Label>Nom *</Label><Input data-testid="menu-item-name" value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Prix (EUR) *</Label><Input data-testid="menu-item-price" type="number" step="0.01" value={form.price} onChange={(e) => setForm(f => ({...f, price: parseFloat(e.target.value) || 0}))} /></div>
              <div className="space-y-1.5"><Label>Categorie</Label><Input value={form.category} onChange={(e) => setForm(f => ({...f, category: e.target.value}))} placeholder="ex: Plats" /></div>
            </div>
            <div className="space-y-1.5"><Label>URL de l'image</Label><Input value={form.image_url} onChange={(e) => setForm(f => ({...f, image_url: e.target.value}))} placeholder="https://..." /></div>
            <div className="flex items-center gap-2">
              <Switch checked={form.available} onCheckedChange={(val) => setForm(f => ({...f, available: val}))} />
              <Label>Disponible</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button data-testid="save-menu-item-btn" onClick={handleSave} className="bg-[#10B981] hover:bg-[#059669] text-white">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
