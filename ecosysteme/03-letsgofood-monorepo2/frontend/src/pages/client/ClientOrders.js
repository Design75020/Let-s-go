import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { STATUS_LABELS, STATUS_COLORS } from "../../lib/api";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { useNotificationSound } from "../../hooks/useNotificationSound";
import { Badge } from "../../components/ui/badge";
import { ClipboardList, Package, MapPin, Zap, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function ClientOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastEvent, connected } = useWebSocket();
  const { playChime } = useNotificationSound();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders");
        setOrders(data);
      } catch { /* noop */ }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === "order_updated" || lastEvent.type === "driver_assigned") {
      playChime();
      setOrders((prev) => prev.map((o) => (o.id === lastEvent.order?.id ? lastEvent.order : o)));
      toast.info(lastEvent.message || "Commande mise a jour");
    }
    if (lastEvent.type === "order_created" && lastEvent.order) {
      setOrders((prev) => [lastEvent.order, ...prev]);
    }
  }, [lastEvent, playChime]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div data-testid="client-orders" className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>Mes commandes</h1>
      <div className="flex items-center gap-3 mb-8">
        <p className="text-muted-foreground">Historique et suivi de vos commandes</p>
        {connected && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-medium" data-testid="orders-live-badge">
            <Zap className="w-3 h-3" />En direct
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-lg text-muted-foreground">Aucune commande pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} data-testid={`order-card-${order.id}`} className="bg-white rounded-xl border border-border p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold" style={{ fontFamily: 'Outfit' }}>{order.restaurant_name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || ""}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                {order.items.map((item, idx) => (
                  <div key={`item-${idx}-${item.name}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} EUR</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 mt-3 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.delivery_address}</span>
                  {order.driver_name && (
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" />Livreur: {order.driver_name}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#FF6B00]">{order.total.toFixed(2)} EUR</span>
                  {!["delivered", "cancelled"].includes(order.status) && (
                    <Link
                      to={`/order/${order.id}`}
                      data-testid={`track-order-${order.id}`}
                      className="flex items-center gap-1 text-xs font-medium text-[#FF6B00] hover:underline"
                    >
                      Suivre <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
