import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import api, { formatApiError } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Tag, Check, CreditCard, Banknote } from "lucide-react";
import { toast } from "sonner";

export default function CartCheckout() {
  const { items, restaurantName, deliveryFee, subtotal, total, updateQuantity, removeItem, clearCart, itemCount } = useCart();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe"); // "stripe" | "cash"
  const navigate = useNavigate();
  const { restaurantId } = useCart();

  const handleOrder = async () => {
    if (!address.trim()) { toast.error("Veuillez entrer une adresse de livraison"); return; }
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }));
      const { data: order } = await api.post("/orders", {
        restaurant_id: restaurantId,
        items: orderItems,
        delivery_address: address,
        phone,
        notes,
        payment_method: paymentMethod,
        promo_code: promoApplied ? promoApplied.code : "",
      });
      clearCart();
      if (paymentMethod === "stripe") {
        // Redirect to Stripe Checkout
        const { data: checkout } = await api.post("/payments/checkout", {
          order_id: order.id,
          origin_url: window.location.origin,
        });
        if (checkout.url) {
          window.location.href = checkout.url;
          return;
        }
        toast.error("Impossible de démarrer le paiement Stripe");
        setLoading(false);
        return;
      }
      toast.success("Commande passée avec succès !");
      navigate("/my-orders");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  const validatePromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    try {
      const { data } = await api.post("/promo-codes/validate", { code: promoCode, subtotal });
      setPromoDiscount(data.discount);
      setPromoApplied(data);
      toast.success(`Code applique ! -${data.discount.toFixed(2)} EUR`);
    } catch (err) {
      setPromoDiscount(0);
      setPromoApplied(null);
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setValidatingPromo(false);
    }
  };

  const finalTotal = subtotal - promoDiscount + deliveryFee;

  if (itemCount === 0) {
    return (
      <div data-testid="empty-cart" className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Votre panier est vide</h2>
        <p className="text-muted-foreground mb-6">Explorez nos restaurants et ajoutez des plats</p>
        <Link to="/home">
          <Button className="bg-[#FF6B00] hover:bg-[#E05E00] text-white">Voir les restaurants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="cart-checkout" className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/home" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />Continuer les achats
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>Votre panier</h1>
      <p className="text-muted-foreground mb-8">Commande chez <span className="font-medium text-foreground">{restaurantName}</span></p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-3 space-y-3">
          {items.map((item) => (
            <div key={item.id} data-testid={`cart-item-${item.id}`} className="flex items-center gap-4 bg-white rounded-xl border border-border p-4">
              {item.image_url && <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{item.name}</h3>
                <p className="text-sm font-semibold text-[#FF6B00]">{item.price.toFixed(2)} EUR</p>
              </div>
              <div className="flex items-center gap-2">
                <button data-testid={`decrease-${item.id}`} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button data-testid={`increase-${item.id}`} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
                <button data-testid={`remove-${item.id}`} onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-colors ml-2">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-border p-6 sticky top-24 space-y-5">
            <h3 className="font-semibold text-lg" style={{ fontFamily: 'Outfit' }}>Livraison</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Adresse de livraison *</Label>
                <Input data-testid="delivery-address-input" placeholder="Votre adresse" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Telephone</Label>
                <Input data-testid="delivery-phone-input" placeholder="+33 6 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Textarea data-testid="delivery-notes-input" placeholder="Instructions speciales..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
            </div>

            {/* Promo code */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1"><Tag className="w-3 h-3" />Code promo</Label>
              <div className="flex gap-2">
                <Input
                  data-testid="promo-code-input"
                  placeholder="Entrez votre code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="font-mono text-sm uppercase"
                  disabled={!!promoApplied}
                />
                {promoApplied ? (
                  <Button variant="outline" size="sm" className="shrink-0 text-[#10B981] border-[#10B981]" disabled>
                    <Check className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    data-testid="apply-promo-btn"
                    variant="outline"
                    size="sm"
                    onClick={validatePromo}
                    disabled={validatingPromo || !promoCode.trim()}
                    className="shrink-0"
                  >
                    {validatingPromo ? "..." : "Appliquer"}
                  </Button>
                )}
              </div>
              {promoApplied && (
                <p className="text-xs text-[#10B981] font-medium">
                  {promoApplied.discount_type === "percentage" ? `${promoApplied.discount_value}%` : `${promoApplied.discount_value} EUR`} de reduction appliquee
                </p>
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{subtotal.toFixed(2)} EUR</span></div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-[#10B981]"><span>Reduction</span><span>-{promoDiscount.toFixed(2)} EUR</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Livraison</span><span>{deliveryFee.toFixed(2)} EUR</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>Total</span><span className="text-[#FF6B00]">{finalTotal.toFixed(2)} EUR</span></div>
            </div>

            {/* Payment method selector */}
            <div className="space-y-2">
              <Label className="text-xs">Mode de paiement</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  data-testid="pay-stripe-btn"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${paymentMethod === "stripe" ? "border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]" : "border-border text-muted-foreground hover:bg-muted"}`}
                >
                  <CreditCard className="w-4 h-4" />
                  Carte (Stripe)
                </button>
                <button
                  type="button"
                  data-testid="pay-cash-btn"
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${paymentMethod === "cash" ? "border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]" : "border-border text-muted-foreground hover:bg-muted"}`}
                >
                  <Banknote className="w-4 h-4" />
                  Espèces
                </button>
              </div>
              {paymentMethod === "stripe" && (
                <p className="text-[11px] text-muted-foreground italic">
                  Mode test : utilisez la carte <span className="font-mono font-semibold">4242 4242 4242 4242</span> avec n'importe quelle date future et CVC.
                </p>
              )}
            </div>

            <Button
              data-testid="place-order-btn"
              onClick={handleOrder}
              disabled={loading}
              className="w-full bg-[#FF6B00] hover:bg-[#E05E00] text-white h-12"
            >
              {loading
                ? (paymentMethod === "stripe" ? "Redirection vers Stripe..." : "Commande en cours...")
                : (paymentMethod === "stripe" ? `Payer ${finalTotal.toFixed(2)} EUR par carte` : `Commander (${finalTotal.toFixed(2)} EUR)`)}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              {paymentMethod === "stripe" ? "Paiement sécurisé · Stripe test mode" : "Paiement à la livraison"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
