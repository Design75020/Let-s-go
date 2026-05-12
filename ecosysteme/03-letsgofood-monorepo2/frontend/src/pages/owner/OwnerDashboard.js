import { useState, useEffect, useCallback } from "react";
import api, { STATUS_LABELS, STATUS_COLORS } from "../../lib/api";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { useNotificationSound } from "../../hooks/useNotificationSound";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ShoppingBag, DollarSign, Clock, Store, Bell, Zap } from "lucide-react";
import { toast } from "sonner";

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { lastEvent, connected } = useWebSocket();
  const { playUrgent } = useNotificationSound();

  const fetchData = useCallback(async () => {
    try { const { data: d } = await api.get("/owner/dashboard"); setData(d); }
    catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === "order_created") {
      playUrgent();
      toast.success(
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#FF6B00]" />
          <span className="font-medium">Nouvelle commande !</span>
        </div>,
        { duration: 10000 }
      );
      fetchData();
    }
    if (lastEvent.type === "order_updated" || lastEvent.type === "driver_assigned") {
      fetchData();
    }
  }, [lastEvent, playUrgent, fetchData]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!data) return <div className="p-8 text-center text-muted-foreground">Aucun restaurant associe a votre compte</div>;

  const stats = [
    { label: "Revenus total", value: `${data.total_revenue.toFixed(2)} EUR`, icon: DollarSign, color: "#10B981" },
    { label: "Commandes totales", value: data.total_orders, icon: ShoppingBag, color: "#FF6B00" },
    { label: "Commandes aujourd'hui", value: data.today_orders, icon: Clock, color: "#3B82F6" },
    { label: "En attente", value: data.pending_orders, icon: Store, color: "#F59E0B" },
  ];

  return (
    <div data-testid="owner-dashboard" className="p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Mon Restaurant</h1>
          <p className="text-muted-foreground mt-1">{data.restaurants.map(r => r.name).join(", ")}</p>
        </div>
        {connected && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />Temps reel
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={s.label} className={`border-border animate-fade-in stagger-${i + 1}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border animate-fade-in">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Commandes recentes</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent_orders.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Aucune commande</TableCell></TableRow>
              ) : data.recent_orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.client_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{order.items.length} article(s)</TableCell>
                  <TableCell className="font-medium">{order.total.toFixed(2)} EUR</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
