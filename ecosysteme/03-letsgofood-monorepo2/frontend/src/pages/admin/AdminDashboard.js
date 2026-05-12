import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../lib/api";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { Card, CardContent } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { STATUS_LABELS, STATUS_COLORS } from "../../lib/api";
import { DollarSign, ShoppingBag, Store, Bike, TrendingUp, Clock, Users, Zap } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastEvent, connected } = useWebSocket();

  const fetchAll = useCallback(async () => {
    try {
      const [sRes, cRes, oRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/chart-data"),
        api.get("/dashboard/recent-orders"),
      ]);
      setStats(sRes.data);
      setChartData(cRes.data);
      setRecentOrders(oRes.data);
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchAll();
      setLoading(false);
    })();
  }, [fetchAll]);

  // Real-time updates
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === "order_created") {
      toast.info(lastEvent.message || "Nouvelle commande !");
      fetchAll();
    }
    if (lastEvent.type === "order_updated" || lastEvent.type === "driver_assigned") {
      fetchAll();
    }
  }, [lastEvent, fetchAll]);

  const statCards = useMemo(() => [
    { label: "Revenus total", value: `${stats?.total_revenue?.toFixed(2) || 0} EUR`, icon: DollarSign, color: "#FF6B00", bg: "#FF6B00" },
    { label: "Commandes", value: stats?.total_orders || 0, icon: ShoppingBag, color: "#10B981", bg: "#10B981" },
    { label: "Restaurants", value: stats?.total_restaurants || 0, icon: Store, color: "#3B82F6", bg: "#3B82F6" },
    { label: "Livreurs", value: stats?.total_drivers || 0, icon: Bike, color: "#F59E0B", bg: "#F59E0B" },
  ], [stats]);

  const miniStats = useMemo(() => [
    { label: "Commandes aujourd'hui", value: stats?.today_orders || 0, icon: Clock },
    { label: "En attente", value: stats?.pending_orders || 0, icon: Zap },
    { label: "Livraisons actives", value: stats?.active_deliveries || 0, icon: TrendingUp },
    { label: "Clients", value: stats?.total_clients || 0, icon: Users },
  ], [stats]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div data-testid="admin-dashboard" className="p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de votre plateforme Let's Go</p>
        </div>
        {connected && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold" data-testid="admin-live-badge">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            Temps reel
          </span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <Card key={s.label} className={`border-border animate-fade-in stagger-${i + 1}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.bg}15` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {miniStats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 bg-white rounded-xl border border-border p-4 animate-fade-in">
            <s.icon className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold" style={{ fontFamily: 'Outfit' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border animate-fade-in">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Commandes (7 jours)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="commandes" fill="#FF6B00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border animate-fade-in">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Revenus (7 jours)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                <Tooltip />
                <Area type="monotone" dataKey="revenus" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="border-border animate-fade-in">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Commandes recentes</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id} data-testid={`recent-order-${order.id}`}>
                  <TableCell className="font-medium">{order.client_name}</TableCell>
                  <TableCell>{order.restaurant_name}</TableCell>
                  <TableCell className="font-medium">{order.total.toFixed(2)} EUR</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || ""}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
