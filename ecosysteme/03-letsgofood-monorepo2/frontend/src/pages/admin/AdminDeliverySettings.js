import { useState, useEffect } from "react";
import api, { formatApiError } from "../../lib/api";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { MapPin, DollarSign, Clock, Bike, Save, UtensilsCrossed, Coffee, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminDeliverySettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try { const { data } = await api.get("/settings/delivery"); setSettings(data); }
    catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/settings/delivery", settings);
      toast.success("Parametres sauvegardes !");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  const updateMargin = (key, value) => {
    setSettings(s => ({ ...s, margins: { ...s.margins, [key]: parseFloat(value) || 0 } }));
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!settings) return null;

  return (
    <div data-testid="admin-delivery-settings" className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Livraison & Commission</h1>
          <p className="text-muted-foreground mt-1">Configurez les zones, marges et parametres de livraison</p>
        </div>
        <Button data-testid="save-delivery-settings" onClick={handleSave} disabled={saving} className="bg-[#FF6B00] hover:bg-[#E05E00] text-white">
          {saving ? "Sauvegarde..." : <><Save className="w-4 h-4 mr-2" />Sauvegarder</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission / Marge */}
        <Card className="border-border animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontFamily: 'Outfit' }}>Marges par categorie</h3>
                <p className="text-xs text-muted-foreground">Montant ajoute au prix de chaque article</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="w-4 h-4 text-[#FF6B00]" />
                  <div>
                    <p className="text-sm font-medium">Plats / Burgers / Pizzas</p>
                    <p className="text-xs text-muted-foreground">Plats principaux</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">+</span>
                  <Input
                    data-testid="margin-plat"
                    type="number" step="0.25" min="0"
                    value={settings.margins?.plat || 0}
                    onChange={(e) => updateMargin("plat", e.target.value)}
                    className="w-20 h-8 text-center text-sm"
                  />
                  <span className="text-sm font-medium">EUR</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Coffee className="w-4 h-4 text-[#3B82F6]" />
                  <div>
                    <p className="text-sm font-medium">Boissons / Desserts</p>
                    <p className="text-xs text-muted-foreground">Boissons et desserts</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">+</span>
                  <Input
                    data-testid="margin-boisson"
                    type="number" step="0.25" min="0"
                    value={settings.margins?.boisson || 0}
                    onChange={(e) => updateMargin("boisson", e.target.value)}
                    className="w-20 h-8 text-center text-sm"
                  />
                  <span className="text-sm font-medium">EUR</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Plus className="w-4 h-4 text-[#F59E0B]" />
                  <div>
                    <p className="text-sm font-medium">Extras / Accompagnements</p>
                    <p className="text-xs text-muted-foreground">Entrees, supplements, sauces</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">+</span>
                  <Input
                    data-testid="margin-extra"
                    type="number" step="0.25" min="0"
                    value={settings.margins?.extra || 0}
                    onChange={(e) => updateMargin("extra", e.target.value)}
                    className="w-20 h-8 text-center text-sm"
                  />
                  <span className="text-sm font-medium">EUR</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone de livraison */}
        <Card className="border-border animate-fade-in stagger-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontFamily: 'Outfit' }}>Zone de livraison</h3>
                <p className="text-xs text-muted-foreground">Rayon et temps maximum</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Rayon standard (km)</Label>
                  <Input
                    data-testid="radius-km"
                    type="number" step="0.5" min="1"
                    value={settings.radius_km}
                    onChange={(e) => setSettings(s => ({...s, radius_km: parseFloat(e.target.value) || 3.5}))}
                  />
                  <p className="text-xs text-muted-foreground">Livraison gratuite dans ce rayon</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Rayon maximum (km)</Label>
                  <Input
                    data-testid="max-radius-km"
                    type="number" step="0.5" min="1"
                    value={settings.max_radius_km}
                    onChange={(e) => setSettings(s => ({...s, max_radius_km: parseFloat(e.target.value) || 5}))}
                  />
                  <p className="text-xs text-muted-foreground">Au-dela = hors zone</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Temps max livraison (min)</Label>
                  <Input
                    data-testid="max-delivery-min"
                    type="number" min="10"
                    value={settings.max_delivery_min}
                    onChange={(e) => setSettings(s => ({...s, max_delivery_min: parseInt(e.target.value) || 20}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Panier minimum (EUR)</Label>
                  <Input
                    data-testid="min-order"
                    type="number" step="0.5" min="0"
                    value={settings.min_order}
                    onChange={(e) => setSettings(s => ({...s, min_order: parseFloat(e.target.value) || 10}))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Livraison gratuite</p>
                  <p className="text-xs text-muted-foreground">Dans le rayon standard</p>
                </div>
                <Switch checked={settings.free_delivery} onCheckedChange={(v) => setSettings(s => ({...s, free_delivery: v}))} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimation */}
        <Card className="border-border lg:col-span-2 animate-fade-in stagger-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <Bike className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontFamily: 'Outfit' }}>Estimation du temps</h3>
                <p className="text-xs text-muted-foreground">Parametres de calcul</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Vitesse livreur (km/h)</Label>
                <Input
                  type="number" min="5"
                  value={settings.scooter_speed_kmh}
                  onChange={(e) => setSettings(s => ({...s, scooter_speed_kmh: parseInt(e.target.value) || 20}))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Temps preparation (min)</Label>
                <Input
                  type="number" min="0"
                  value={settings.prep_time_min}
                  onChange={(e) => setSettings(s => ({...s, prep_time_min: parseInt(e.target.value) || 10}))}
                />
              </div>
              <div className="p-3 rounded-lg bg-[#10B981]/5 border border-[#10B981]/20">
                <p className="text-xs text-muted-foreground">A 1 km</p>
                <p className="text-lg font-bold text-[#10B981]">{Math.round(settings.prep_time_min + (1 / settings.scooter_speed_kmh) * 60)} min</p>
              </div>
              <div className="p-3 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                <p className="text-xs text-muted-foreground">A {settings.radius_km} km</p>
                <p className="text-lg font-bold text-[#F59E0B]">{Math.round(settings.prep_time_min + (settings.radius_km / settings.scooter_speed_kmh) * 60)} min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
