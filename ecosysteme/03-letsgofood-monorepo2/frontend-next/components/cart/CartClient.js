'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, CreditCard, Banknote, Tag, Check, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import api, { formatApiError } from '@/lib/api';

export default function CartClient() {
  const { items, restaurantId, restaurantName, deliveryFee, subtotal, total, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);

  const finalTotal = Math.max(0, total - promoDiscount);

  const validatePromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    try {
      const { data } = await api.post('/promos/validate', { code: promoCode, order_amount: subtotal });
      setPromoApplied(data);
      const discount = data.discount_type === 'percentage'
        ? (subtotal * data.discount_value) / 100
        : data.discount_value;
      setPromoDiscount(Math.min(discount, subtotal));
      toast.success(`Code promo appliqué : -${discount.toFixed(2)} €`);
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail) || 'Code promo invalide.');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleOrder = async () => {
    if (!user) { router.push('/login'); return; }
    if (!address.trim()) { toast.error('Veuillez entrer une adresse de livraison.'); return; }
    setLoading(true);
    try {
      const orderPayload = {
        restaurant_id: restaurantId,
        items: items.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
        delivery_address: address,
        notes,
        promo_code: promoApplied ? promoCode : undefined,
        payment_method: paymentMethod,
      };
      const { data: order } = await api.post('/orders', orderPayload);
      if (paymentMethod === 'stripe' && order.stripe_session_url) {
        clearCart();
        window.location.href = order.stripe_session_url;
      } else {
        clearCart();
        toast.success('Commande passée avec succès !');
        router.push(`/orders/${order.id}`);
      }
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail) || 'Erreur lors de la commande.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Votre panier est vide</h1>
        <p className="text-muted-foreground mb-6">Ajoutez des plats depuis un restaurant pour commencer.</p>
        <Link href="/restaurants" className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#E05E00] transition-colors">
          <ArrowLeft className="w-4 h-4" />Voir les restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/restaurants" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Continuer mes achats
      </Link>
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Mon panier</h1>
      <p className="text-muted-foreground mb-8">{restaurantName}</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Items */}
        <div className="lg:col-span-3 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-white rounded-xl border border-border p-4">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover shrink-0" loading="lazy" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{item.name}</h3>
                <p className="text-sm font-semibold text-[#FF6B00]">{item.price.toFixed(2)} €</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
                <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors ml-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            {/* Address */}
            <div>
              <label className="block text-xs font-medium mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />Adresse de livraison
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Rue de la Paix, Paris"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30"
              />
            </div>
            {/* Notes */}
            <div>
              <label className="block text-xs font-medium mb-1.5">Instructions spéciales</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instructions spéciales..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 resize-none"
              />
            </div>
            {/* Promo */}
            <div>
              <label className="block text-xs font-medium mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />Code promo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="PROMO2024"
                  disabled={!!promoApplied}
                  className="flex-1 px-3 py-2 rounded-lg border border-border text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 disabled:opacity-50"
                />
                {promoApplied ? (
                  <button disabled className="px-3 py-2 rounded-lg border border-[#10B981] text-[#10B981] text-sm">
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={validatePromo}
                    disabled={validatingPromo || !promoCode.trim()}
                    className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {validatingPromo ? '...' : 'Appliquer'}
                  </button>
                )}
              </div>
              {promoApplied && (
                <p className="text-xs text-[#10B981] font-medium mt-1">
                  {promoApplied.discount_type === 'percentage' ? `${promoApplied.discount_value}%` : `${promoApplied.discount_value} €`} de réduction appliquée
                </p>
              )}
            </div>
            {/* Totals */}
            <div className="border-t border-border pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{subtotal.toFixed(2)} €</span></div>
              {promoDiscount > 0 && <div className="flex justify-between text-[#10B981]"><span>Réduction</span><span>-{promoDiscount.toFixed(2)} €</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Livraison</span><span>{deliveryFee.toFixed(2)} €</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>Total</span><span className="text-[#FF6B00]">{finalTotal.toFixed(2)} €</span>
              </div>
            </div>
            {/* Payment */}
            <div>
              <label className="block text-xs font-medium mb-1.5">Mode de paiement</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'stripe', label: 'Carte (Stripe)', icon: CreditCard },
                  { value: 'cash', label: 'Espèces', icon: Banknote },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentMethod(value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${paymentMethod === value ? 'border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]' : 'border-border text-muted-foreground hover:bg-muted'}`}
                  >
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>
              {paymentMethod === 'stripe' && (
                <p className="text-[11px] text-muted-foreground italic mt-1.5">
                  Mode test : carte <span className="font-mono font-semibold">4242 4242 4242 4242</span>
                </p>
              )}
            </div>
            <button
              onClick={handleOrder}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {paymentMethod === 'stripe' ? `Payer ${finalTotal.toFixed(2)} € par carte` : `Commander (${finalTotal.toFixed(2)} €)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
