'use client';
import { useState, useEffect } from 'react';
import api, { formatApiError } from '@/lib/api';
import { Award, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoyaltyClient() {
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  const fetchLoyalty = async () => {
    try {
      const { data } = await api.get('/loyalty/status');
      setLoyalty(data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLoyalty(); }, []);

  const handleRedeem = async (points) => {
    setRedeeming(true);
    try {
      const { data } = await api.post('/loyalty/redeem', { points });
      toast.success(`Code promo généré : ${data.code} (-${data.discount_value} €)`);
      navigator.clipboard.writeText(data.code);
      toast.info('Code copié dans le presse-papiers !');
      fetchLoyalty();
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail) || 'Erreur lors de l\'échange.');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!loyalty) return null;

  const progressToNext = loyalty.next_tier
    ? ((loyalty.total_points_earned - loyalty.tier.min_points) / (loyalty.next_tier.min_points - loyalty.tier.min_points)) * 100
    : 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Programme Fidélité</h1>
      <p className="text-muted-foreground mb-8">Gagnez des points à chaque commande et profitez de réductions exclusives</p>

      {/* Tier Card */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden mb-8">
        <div className="h-2" style={{ backgroundColor: loyalty.tier.color }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${loyalty.tier.color}20` }}>
                <Award className="w-8 h-8" style={{ color: loyalty.tier.color }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Votre niveau</p>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Outfit', color: loyalty.tier.color }}>
                  {loyalty.tier.name}
                </h2>
                {loyalty.tier.discount > 0 && (
                  <p className="text-sm text-muted-foreground">{loyalty.tier.discount}% de réduction sur chaque commande</p>
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
                <span className="text-muted-foreground">
                  Progression vers <span className="font-medium" style={{ color: loyalty.next_tier.color }}>{loyalty.next_tier.name}</span>
                </span>
                <span className="font-medium">{loyalty.points_to_next} points restants</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="h-2.5 rounded-full transition-all" style={{ width: `${Math.min(progressToNext, 100)}%`, backgroundColor: loyalty.tier.color }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Redeem */}
      {loyalty.points >= 100 && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Échanger vos points</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { points: 100, discount: 2 },
              { points: 250, discount: 5 },
              { points: 500, discount: 12 },
            ].filter((o) => loyalty.points >= o.points).map((option) => (
              <button
                key={option.points}
                onClick={() => handleRedeem(option.points)}
                disabled={redeeming}
                className="flex flex-col items-center gap-1 p-4 rounded-xl border border-border hover:border-[#FF6B00] hover:bg-[#FF6B00]/5 transition-all disabled:opacity-50"
              >
                {redeeming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5 text-[#FF6B00]" />}
                <span className="font-bold text-lg">{option.points} pts</span>
                <span className="text-sm text-muted-foreground">= -{option.discount} €</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
