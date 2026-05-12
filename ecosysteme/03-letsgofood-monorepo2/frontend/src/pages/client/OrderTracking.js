import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import api, { STATUS_LABELS, STATUS_COLORS } from "../../lib/api";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, MapPin, Package, Clock, CheckCircle, Truck, ChefHat, Zap, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { status: "pending", label: "Commande recue", icon: Clock, color: "#F59E0B" },
  { status: "preparing", label: "En preparation", icon: ChefHat, color: "#3B82F6" },
  { status: "ready", label: "Prete", icon: Package, color: "#8B5CF6" },
  { status: "delivering", label: "En livraison", icon: Truck, color: "#F97316" },
  { status: "delivered", label: "Livree", icon: CheckCircle, color: "#10B981" },
];

function getStepIndex(status) {
  const idx = STEPS.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { lastEvent } = useWebSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const cancelled = searchParams.get("cancelled") === "1";
  const [paymentPolling, setPaymentPolling] = useState(Boolean(sessionId));
  const [paymentStatus, setPaymentStatus] = useState(null); // "paid" | "pending" | "failed" | "expired"

  const refreshOrder = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data);
    } catch { /* noop */ }
  }, [orderId]);

  useEffect(() => {
    (async () => {
      await refreshOrder();
      setLoading(false);
    })();
  }, [refreshOrder]);

  // Stripe return: poll payment status until paid or timeout
  useEffect(() => {
    if (!sessionId) return;
    let attempts = 0;
    const maxAttempts = 8; // ~16s
    const poll = async () => {
      attempts += 1;
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        if (data.payment_status === "paid") {
          setPaymentStatus("paid");
          setPaymentPolling(false);
          toast.success("Paiement confirmé ! Votre commande est en route.");
          await refreshOrder();
          const next = new URLSearchParams(searchParams);
          next.delete("session_id");
          setSearchParams(next, { replace: true });
          return;
        }
        if (data.status === "expired") {
          setPaymentStatus("expired");
          setPaymentPolling(false);
          toast.error("Session de paiement expirée. Veuillez réessayer.");
          return;
        }
        if (attempts >= maxAttempts) {
          setPaymentStatus("pending");
          setPaymentPolling(false);
          toast.info("Vérification du paiement plus longue que prévu. Rafraîchissez la page dans un instant.");
          return;
        }
        setTimeout(poll, 2000);
      } catch {
        if (attempts >= maxAttempts) {
          setPaymentStatus("failed");
          setPaymentPolling(false);
          return;
        }
        setTimeout(poll, 2000);
      }
    };
    poll();
  }, [sessionId, refreshOrder, searchParams, setSearchParams]);

  // Listen for real-time updates
  useEffect(() => {
    if (!lastEvent || !order) return;
    if ((lastEvent.type === "order_updated" || lastEvent.type === "driver_assigned") && lastEvent.order?.id === order.id) {
      setOrder(lastEvent.order);
      toast.success(lastEvent.message || "Commande mise a jour !");
    }
  }, [lastEvent, order]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!order) return <div className="text-center py-20 text-muted-foreground">Commande introuvable</div>;

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div data-testid="order-tracking" className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/my-orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />Retour aux commandes
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Suivi de commande</h1>
          <p className="text-muted-foreground text-sm">{order.restaurant_name}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10">
          <Zap className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="text-xs font-medium text-[#10B981]" data-testid="live-indicator">En direct</span>
        </div>
      </div>

      {/* Payment return banner */}
      {cancelled && order.payment_status !== "paid" && (
        <Card className="border-[#F59E0B]/40 bg-[#F59E0B]/5 mb-6" data-testid="payment-cancelled-banner">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Paiement annulé</p>
              <p className="text-xs text-muted-foreground">Vous pouvez relancer le paiement depuis votre commande.</p>
            </div>
          </CardContent>
        </Card>
      )}
      {paymentPolling && (
        <Card className="border-[#3B82F6]/40 bg-[#3B82F6]/5 mb-6" data-testid="payment-polling-banner">
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-[#3B82F6] shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Vérification du paiement…</p>
              <p className="text-xs text-muted-foreground">Quelques secondes, nous confirmons votre transaction Stripe.</p>
            </div>
          </CardContent>
        </Card>
      )}
      {paymentStatus === "paid" && (
        <Card className="border-[#10B981]/40 bg-[#10B981]/5 mb-6" data-testid="payment-paid-banner">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Paiement confirmé</p>
              <p className="text-xs text-muted-foreground">Merci ! Votre commande est transmise au restaurant.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress tracker */}
      {isCancelled ? (
        <Card className="border-destructive/30 mb-6">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-destructive text-xl font-bold">X</span>
            </div>
            <h3 className="font-semibold text-destructive" style={{ fontFamily: 'Outfit' }}>Commande annulee</h3>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border mb-6 animate-fade-in">
          <CardContent className="p-6">
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted">
                <div
                  className="h-full bg-[#10B981] transition-all duration-700 ease-out"
                  style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {STEPS.map((step, idx) => {
                  const isActive = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div key={step.status} className="flex flex-col items-center" style={{ width: 80 }}>
                      <div
                        data-testid={`step-${step.status}`}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCurrent
                            ? "ring-4 ring-offset-2 shadow-lg scale-110"
                            : isActive
                            ? "shadow-sm"
                            : "bg-muted"
                        }`}
                        style={{
                          backgroundColor: isActive ? step.color : undefined,
                          ringColor: isCurrent ? `${step.color}40` : undefined,
                        }}
                      >
                        <step.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                      </div>
                      <span className={`text-xs mt-2 text-center font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="border-border animate-fade-in stagger-1">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: 'Outfit' }}>Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 shrink-0" />{order.delivery_address}
              </div>
              {order.driver_name && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="w-3.5 h-3.5 shrink-0" />Livreur: <span className="font-medium text-foreground">{order.driver_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                {new Date(order.created_at).toLocaleString("fr-FR")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border animate-fade-in stagger-2">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: 'Outfit' }}>Recapitulatif</h3>
            <div className="space-y-1.5">
              {order.items.map((item, idx) => (
                <div key={`item-${idx}-${item.name}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} EUR</span>
                </div>
              ))}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-[#10B981]">
                  <span>Reduction</span><span>-{order.discount.toFixed(2)} EUR</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Livraison</span><span>{order.delivery_fee.toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span>Total</span><span className="text-[#FF6B00]">{order.total.toFixed(2)} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
