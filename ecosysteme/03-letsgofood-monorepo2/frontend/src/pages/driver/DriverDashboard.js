import { useState, useEffect, useRef, useCallback } from "react";
import api, { STATUS_LABELS, STATUS_COLORS, formatApiError } from "../../lib/api";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { useNotificationSound } from "../../hooks/useNotificationSound";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Package, MapPin, Clock, CheckCircle, Truck, ArrowRight, Zap, Bell, BellOff, Smartphone, SmartphoneNfc } from "lucide-react";
import { toast } from "sonner";

export default function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("available");
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const { lastEvent, connected } = useWebSocket();
  const { playChime, playUrgent, playSuccess, soundEnabled, toggleSound, vibrationEnabled, toggleVibration, canVibrate } = useNotificationSound();
  const prevOrderCountRef = useRef(0);

  const fetchOrders = useCallback(async () => {
    try { const { data } = await api.get("/orders"); setOrders(data); }
    catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Real-time updates with sound alerts
  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === "driver_assigned") {
      playUrgent();
      setNewOrderCount((c) => c + 1);
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 3000);
      toast.success(
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#F59E0B]" />
          <span className="font-medium">Nouvelle livraison assignee !</span>
        </div>,
        { duration: 8000 }
      );
      fetchOrders();
    }

    if (lastEvent.type === "order_created") {
      playChime();
      setNewOrderCount((c) => c + 1);
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 3000);
      toast.info(
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#3B82F6]" />
          <span>Nouvelle commande disponible</span>
        </div>,
        { duration: 5000 }
      );
      fetchOrders();
    }

    if (lastEvent.type === "order_updated") {
      fetchOrders();
    }
  }, [lastEvent, playChime, playUrgent, fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (newStatus === "delivered") {
        playSuccess();
        toast.success("Livraison terminee ! Bravo !");
      } else {
        toast.success("Statut mis a jour");
      }
      fetchOrders();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const clearNewCount = () => setNewOrderCount(0);

  const available = orders.filter((o) => o.status === "ready" && !o.driver_id);
  const active = orders.filter((o) => ["assigned", "picked_up", "delivering"].includes(o.status));
  const completed = orders.filter((o) => o.status === "delivered");

  const statusFlow = {
    assigned: { next: "picked_up", label: "Recuperer la commande", icon: Package },
    picked_up: { next: "delivering", label: "En route pour livrer", icon: Truck },
    delivering: { next: "delivered", label: "Commande livree", icon: CheckCircle },
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div data-testid="driver-dashboard" className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>Mes livraisons</h1>
      <div className="flex items-center gap-3 mb-6">
        <p className="text-muted-foreground">Gerez vos livraisons en cours</p>
        {connected && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-medium" data-testid="driver-live-badge">
            <Zap className="w-3 h-3" />En direct
          </span>
        )}
        {newOrderCount > 0 && (
          <span
            data-testid="new-order-count"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF6B00] text-white text-xs font-bold ${pulseAnimation ? "animate-bounce" : ""}`}
          >
            <Bell className="w-3 h-3" />{newOrderCount} nouvelle{newOrderCount > 1 ? "s" : ""}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
        <button
          data-testid="sound-toggle-btn"
          onClick={toggleSound}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            soundEnabled
              ? "bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          title={soundEnabled ? "Desactiver les alertes sonores" : "Activer les alertes sonores"}
        >
          {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          <span className="hidden sm:inline">{soundEnabled ? "Son" : "Son off"}</span>
        </button>
        {canVibrate && (
          <button
            data-testid="vibration-toggle-btn"
            onClick={toggleVibration}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              vibrationEnabled
                ? "bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            title={vibrationEnabled ? "Desactiver la vibration" : "Activer la vibration"}
          >
            {vibrationEnabled ? <SmartphoneNfc className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            <span className="hidden sm:inline">{vibrationEnabled ? "Vibration" : "Vibration off"}</span>
          </button>
        )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v); if (v === "available") clearNewCount(); }} className="space-y-6">
        <TabsList>
          <TabsTrigger value="available" data-testid="tab-available">Disponibles ({available.length})</TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active">En cours ({active.length})</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Terminees ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {available.length === 0 ? (
            <div className="text-center py-16"><Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" /><p className="text-muted-foreground">Aucune livraison disponible</p></div>
          ) : (
            <div className="space-y-4">
              {available.map((order) => (
                <Card key={order.id} data-testid={`available-order-${order.id}`} className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold" style={{ fontFamily: 'Outfit' }}>{order.restaurant_name}</h3>
                        <p className="text-sm text-muted-foreground">{order.items.length} article(s) - {order.total.toFixed(2)} EUR</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="w-3.5 h-3.5" />{order.delivery_address}
                    </div>
                    <Button data-testid={`accept-order-${order.id}`} onClick={() => updateStatus(order.id, "delivering")} className="w-full bg-[#10B981] hover:bg-[#059669] text-white">
                      Accepter la livraison <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {active.length === 0 ? (
            <div className="text-center py-16"><Truck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" /><p className="text-muted-foreground">Aucune livraison en cours</p></div>
          ) : (
            <div className="space-y-4">
              {active.map((order) => {
                const flow = statusFlow[order.status];
                return (
                  <Card key={order.id} data-testid={`active-order-${order.id}`} className="border-border border-l-4 border-l-[#F59E0B]">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold" style={{ fontFamily: 'Outfit' }}>{order.restaurant_name}</h3>
                          <p className="text-sm text-muted-foreground">Client: {order.client_name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground mb-4">
                        <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{order.delivery_address}</p>
                        {order.phone && <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />{order.phone}</p>}
                      </div>
                      <div className="border-t pt-3 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={`item-${idx}-${item.name}`} className="flex justify-between text-sm py-0.5">
                            <span>{item.quantity}x {item.name}</span><span>{(item.price * item.quantity).toFixed(2)} EUR</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Total</span><span>{order.total.toFixed(2)} EUR</span></div>
                      </div>
                      {flow && (
                        <Button data-testid={`update-status-${order.id}`} onClick={() => updateStatus(order.id, flow.next)} className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white">
                          <flow.icon className="w-4 h-4 mr-2" />{flow.label}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completed.length === 0 ? (
            <div className="text-center py-16"><CheckCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" /><p className="text-muted-foreground">Aucune livraison terminee</p></div>
          ) : (
            <div className="space-y-3">
              {completed.map((order) => (
                <Card key={order.id} data-testid={`completed-order-${order.id}`} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{order.restaurant_name}</h3>
                      <p className="text-xs text-muted-foreground">{order.client_name} - {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">{order.total.toFixed(2)} EUR</span>
                      <span className="status-delivered px-2 py-0.5 rounded-full text-xs font-medium">Livre</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
