'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import api, { STATUS_LABELS, STATUS_COLORS } from '@/lib/api';
import { ShoppingBag, DollarSign, Clock, Store, Bell, Zap, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OwnerDashboardClient() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState([]);
  const { lastEvent, connected } = useWebSocket();
  const { playUrgent, playSuccess, startPersistentAlarm, stopPersistentAlarm } = useNotificationSound();
  const pendingOrderIdsRef = useRef(new Set());

  const fetchData = useCallback(async () => {
    try {
      const { data: d } = await api.get('/owner/dashboard');
      setData(d);
      // Identify pending orders that need attention
      const pending = (d?.recent_orders || []).filter(o => o.status === 'pending');
      setPendingOrders(pending);
      // Start persistent alarm for each pending order
      pending.forEach(order => {
        if (!pendingOrderIdsRef.current.has(order.id)) {
          pendingOrderIdsRef.current.add(order.id);
          startPersistentAlarm(order.id);
        }
      });
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [startPersistentAlarm]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'order_created') {
      // New order — start persistent alarm
      const orderId = lastEvent.order?.id;
      if (orderId && !pendingOrderIdsRef.current.has(orderId)) {
        pendingOrderIdsRef.current.add(orderId);
        startPersistentAlarm(orderId);
      }
      toast.success(
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#FF6B00]" />
          <div>
            <p className="font-semibold">Nouvelle commande !</p>
            <p className="text-xs text-muted-foreground">{lastEvent.order?.client_name} — {lastEvent.order?.total?.toFixed(2)} €</p>
          </div>
        </div>,
        { duration: 0, dismissible: false } // Stays until dismissed
      );
      fetchData();
    }

    if (lastEvent.type === 'order_updated') {
      const order = lastEvent.order;
      if (order && (order.status === 'confirmed' || order.status === 'cancelled')) {
        // Order accepted or cancelled — stop alarm
        pendingOrderIdsRef.current.delete(order.id);
        stopPersistentAlarm();
        if (order.status === 'confirmed') playSuccess();
        setPendingOrders(prev => prev.filter(o => o.id !== order.id));
      }
      fetchData();
    }
  }, [lastEvent, startPersistentAlarm, stopPersistentAlarm, playSuccess, fetchData]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      pendingOrderIdsRef.current.delete(orderId);
      stopPersistentAlarm();
      if (newStatus === 'confirmed') playSuccess();
      toast.success(`Commande ${newStatus === 'confirmed' ? 'acceptée' : 'refusée'}`);
      fetchData();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!data) return (
    <div className="p-8 text-center text-muted-foreground">
      Aucun restaurant associé à votre compte
    </div>
  );

  const stats = [
    { label: 'Revenus total', value: `${data.total_revenue?.toFixed(2) || '0.00'} €`, icon: DollarSign, color: '#10B981' },
    { label: 'Commandes totales', value: data.total_orders || 0, icon: ShoppingBag, color: '#FF6B00' },
    { label: "Commandes aujourd'hui", value: data.today_orders || 0, icon: Clock, color: '#3B82F6' },
    { label: 'En attente', value: data.pending_orders || 0, icon: Store, color: '#F59E0B' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Mon Restaurant</h1>
          <p className="text-muted-foreground mt-1">{data.restaurants?.map(r => r.name).join(', ')}</p>
        </div>
        {connected && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            Temps réel
          </span>
        )}
      </div>

      {/* Pending orders alert banner */}
      {pendingOrders.length > 0 && (
        <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-[#FF6B00]" />
            <h2 className="font-bold text-[#FF6B00]">
              {pendingOrders.length} commande{pendingOrders.length > 1 ? 's' : ''} en attente de validation !
            </h2>
          </div>
          <div className="space-y-3">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg p-3 flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-semibold text-sm">{order.client_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                  <p className="text-sm font-bold text-[#FF6B00] mt-1">{order.total?.toFixed(2)} €</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                    className="flex items-center gap-1 bg-[#10B981] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#059669] transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Accepter
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Commandes récentes</h3>
        {(!data.recent_orders || data.recent_orders.length === 0) ? (
          <p className="text-center py-10 text-muted-foreground">Aucune commande</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Articles</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recent_orders.map(order => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium">{order.client_name}</td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3 font-semibold text-[#FF6B00]">{order.total?.toFixed(2)} €</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS?.[order.status] || 'bg-muted'}`}>
                        {STATUS_LABELS?.[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3">
                      {order.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                            className="bg-[#10B981] text-white px-2 py-1 rounded text-xs hover:bg-[#059669]"
                          >✓</button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          >✗</button>
                        </div>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'ready')}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                        >Prêt</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
