import { useState, useEffect } from "react";
import api, { formatApiError } from "../../lib/api";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Award, Star, Gift, ShoppingBag, TrendingUp, Copy } from "lucide-react";
import { toast } from "sonner";

export default function LoyaltyPage() {
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  const fetchLoyalty = async () => {
    try { const { data } = await api.get("/loyalty/status"); setLoyalty(data); }
    catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLoyalty(); }, []);

  const handleRedeem = async (points) => {
    setRedeeming(true);
    try {
      const { data } = await api.post("/loyalty/redeem", { points });
      toast.success(`Code promo genere : ${data.code} (-${data.discount_value} EUR)`);
      navigator.clipboard.writeText(data.code);
      toast.info("Code copie dans le presse-papiers !");
      fetchLoyalty();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setRedeeming(false); }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!loyalty) return null;

  const progressToNext = loyalty.next_tier
    ? ((loyalty.total_points_earned - loyalty.tier.min_points) / (loyalty.next_tier.min_points - loyalty.tier.min_points)) * 100
    : 100;

  return (
    <div data-testid="loyalty-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>Programme Fidelite</h1>
      <p className="text-muted-foreground mb-8">Gagnez des points a chaque commande et profitez de reductions exclusives</p>

      {/* Tier Card */}
      <Card className="border-border mb-8 overflow-hidden animate-fade-in">
        <div className="h-2" style={{ backgroundColor: loyalty.tier.color }} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${loyalty.tier.color}20` }}>
                <Award className="w-8 h-8" style={{ color: loyalty.tier.color }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Votre niveau</p>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Outfit', color: loyalty.tier.color }}>{loyalty.tier.name}</h2>
                {loyalty.tier.discount > 0 && (
                  <p className="text-sm text-muted-foreground">{loyalty.tier.discount}% de reduction sur chaque commande</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ fontFamily: 'Outfit' }}>{loyalty.points}</p>
              <p className="text-sm text-muted-foreground">points disponibles</p>
            </div>
          </div>

          {loyalty.next_tier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression vers <span className="font-medium" style={{ color: loyalty.next_tier.color }}>{loyalty.next_tier.name}</span></span>
                <span className="font-medium">{loyalty.points_to_next} points restants</span>
              </div>
              <Progress value={progressToNext} className="h-2.5" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-border animate-fade-in stagger-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Points totaux gagnes</p>
              <p className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>{loyalty.total_points_earned}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border animate-fade-in stagger-2">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Commandes passees</p>
              <p className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>{loyalty.order_count}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border animate-fade-in stagger-3">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gains par commande</p>
              <p className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>1pt / EUR</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Redeem */}
      <Card className="border-border mb-8 animate-fade-in">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
            <Gift className="w-5 h-5 text-[#F59E0B]" />Echanger vos points
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Convertissez vos points en codes promo : 100 points = 5 EUR de reduction</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[100, 200, 500].map((pts) => (
              <button
                key={pts}
                data-testid={`redeem-${pts}-btn`}
                disabled={loyalty.points < pts || redeeming}
                onClick={() => handleRedeem(pts)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  loyalty.points >= pts
                    ? "border-[#F59E0B]/30 hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 cursor-pointer"
                    : "border-border opacity-50 cursor-not-allowed"
                }`}
              >
                <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'Outfit' }}>{pts}</p>
                <p className="text-xs text-muted-foreground">points</p>
                <p className="text-sm font-semibold text-[#10B981] mt-2">= {(pts / 100) * 5} EUR</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tiers explanation */}
      <Card className="border-border animate-fade-in">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Niveaux de fidelite</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {loyalty.tiers.map((t) => (
              <div key={t.name} className={`p-4 rounded-xl border text-center ${loyalty.tier.name === t.name ? "ring-2" : ""}`} style={{ borderColor: `${t.color}40`, ringColor: t.color }}>
                <Award className="w-6 h-6 mx-auto mb-2" style={{ color: t.color }} />
                <p className="font-semibold text-sm" style={{ color: t.color }}>{t.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.min_points}+ pts</p>
                <p className="text-xs font-medium mt-1">{t.discount > 0 ? `${t.discount}% off` : "Debutant"}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
