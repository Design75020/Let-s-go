'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWebSocket } from '@/contexts/WebSocketContext';
import api, { STATUS_LABELS, STATUS_COLORS } from '@/lib/api';
import { ArrowLeft, Clock, ChefHat, Package, Truck, CheckCircle, Zap, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { status: 'pending', label: 'Commande reçue', icon: Clock, color: '#F59E0B' },
  { status: 'preparing', label: 'En préparation', icon: ChefHat, color: '#3B82F6' },
  { status: 'ready', label: 'Prête', icon: Package, color: '#8B5CF6' },
  { status: 'delivering', label: 'En livraison', icon: Truck, color: '#F97316' },
  { status: 'delivered', label: 'Livrée', icon: CheckCircle, color: '#10B981' },
];

export default function OrderTrackingClient({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const { lastEvent } = useWebSocket();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const cancelled = searchParams.get('cancelled') === '1';

  const refreshOrder = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data);
    } catch { /* noop */ }
  }, [orderId]);

  useEffect(() => {
    refreshOrder().finally(() => setLoading(false));
  }, [refreshOrder]);

  // Stripe return polling
  useEffect(() => {
    if (!sessionId) return;
    setPaymentPolling(true);
    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        if (data.payment_status === 'paid') {
          setPaymentStatus('paid');
          setPaymentPolling(false);
          toast.success('Paiement confirmé ! Votre commande est en route.');
          await refreshOrder();
          router.replace(`/orders/${orderId}`);
          return;
        }
        if (data.status === 'expired') { setPaymentStatus('expired'); setPaymentPolling(false); return; }
        if (attempts >= 8) { setPaymentStatus('pending'); setPaymentPolling(false); return; }
        setTimeout(poll, 2000);
      } catch {
        if (attempts >= 8) { setPaymentStatus('failed'); setPaymentPolling(false); return; }
        setTimeout(poll, 2000);
      }
    };
    poll();
  }, [sessionId, orderId, refreshOrder, router]);

  useEffect(() => {
    if (!lastEvent || !order) return;
    if ((lastEvent.type === 'order_updated' || lastEvent.type === 'driver_assigned') && lastEvent.order?.id === order.id) {
      setOrder(lastEvent.order);
      toast.success(lastEvent.message || 'Commande mise à jour !');
    }
  }, [lastEvent, order]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!order) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">Commande introuvable.</p>
      <Link href="/my-orders" className="text-[#FF6B00] hover:underline mt-4 inline-block">Retour aux commandes</Link>
    </div>
  );

  const stepIndex = STEPS.findIndex((s) => s.status === order.status);
  const currentStep = stepIndex >= 0 ? stepIndex : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/my-orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Mes commandes
      </Link>

      {/* Payment status banners */}
      {paymentPolling && (
        <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 animate-pulse" />Vérification du paiement en cours...
        </div>
      )}
      {paymentStatus === 'paid' && (
        <div className="mb-4 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />Paiement confirmé !
        </div>
      )}
      {cancelled && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />Paiement annulé. Vous pouvez réessayer.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>{order.restaurant_name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Commande #{order.id?.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-muted ${STATUS_COLORS[order.status] || ''}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const done = idx <= currentStep;
            return (
              <div key={step.status} className="flex items-center flex-1">
                <div className={`flex flex-col items-center flex-1 ${idx === 0 ? '' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${done ? 'text-white' : 'bg-muted text-muted-foreground'}`}
                    style={done ? { backgroundColor: step.color } : {}}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] mt-1 text-center leading-tight ${done ? 'font-medium' : 'text-muted-foreground'}`}>{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 rounded transition-all ${idx < currentStep ? 'bg-[#10B981]' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Items */}
        <div className="border-t border-border pt-4 space-y-2">
          {order.items?.map((item, idx) => (
            <div key={`${idx}-${item.name}`} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
              <span>{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-[#FF6B00]">{order.total_amount?.toFixed(2)} €</span>
          </div>
        </div>

        {order.delivery_address && (
          <p className="text-xs text-muted-foreground mt-3">📍 {order.delivery_address}</p>
        )}
      </div>
    </div>
  );
}
