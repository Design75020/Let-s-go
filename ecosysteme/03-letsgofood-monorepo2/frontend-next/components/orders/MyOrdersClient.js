'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWebSocket } from '@/contexts/WebSocketContext';
import api, { STATUS_LABELS, STATUS_COLORS } from '@/lib/api';
import { ClipboardList, Zap, ArrowRight, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function MyOrdersClient() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastEvent, connected } = useWebSocket();

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === 'order_updated' || lastEvent.type === 'driver_assigned') {
      setOrders((prev) => prev.map((o) => (o.id === lastEvent.order?.id ? lastEvent.order : o)));
      toast.info(lastEvent.message || 'Commande mise à jour');
    }
    if (lastEvent.type === 'order_created' && lastEvent.order) {
      setOrders((prev) => [lastEvent.order, ...prev]);
    }
  }, [lastEvent]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Mes commandes</h1>
          <p className="text-muted-foreground mt-1">Historique et suivi de vos commandes</p>
        </div>
        {connected && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-medium">
            <Zap className="w-3 h-3" />En direct
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-lg text-muted-foreground mb-4">Aucune commande pour le moment</p>
          <Link href="/restaurants" className="inline-flex items-center gap-2 bg-[#FF6B00] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#E05E00] transition-colors">
            Commander maintenant
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-border p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold" style={{ fontFamily: 'Outfit' }}>{order.restaurant_name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-muted ${STATUS_COLORS[order.status] || ''}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div className="border-t border-border pt-3 space-y-1.5 mb-3">
                {order.items?.map((item, idx) => (
                  <div key={`${idx}-${item.name}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#FF6B00]">{order.total_amount?.toFixed(2)} €</span>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-1 text-sm text-[#FF6B00] hover:underline font-medium"
                >
                  Suivre <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
