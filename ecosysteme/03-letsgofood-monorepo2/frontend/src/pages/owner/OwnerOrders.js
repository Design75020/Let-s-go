import { useState, useEffect, useCallback } from "react";
import api, { STATUS_LABELS, STATUS_COLORS, formatApiError } from "../../lib/api";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { useNotificationSound } from "../../hooks/useNotificationSound";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Eye, Bell, BellOff, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { toast } from "sonner";

export default function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [detailOrder, setDetailOrder] = useState(null);
  const [newCount, setNewCount] = useState(0);
  const { lastEvent, connected } = useWebSocket();
  const { playUrgent, playChime, soundEnabled, toggleSound } = useNotificationSound();

  const fetchOrders = useCallback(async () => {
    try { const { data } = await api.get("/orders"); setOrders(data); }
    catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Real-time: new order notification with sound
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === "order_created") {
      playUrgent();
      setNewCount(c => c + 1);
      toast.success(
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#FF6B00]" />
          <span className="font-medium">Nouvelle commande !</span>
        </div>,
        { duration: 10000 }
      );
      fetchOrders();
    }
    if (lastEvent.type === "order_updated") {
      playChime();
      fetchOrders();
    }
  }, [lastEvent, playUrgent, playChime, fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Statut mis a jour");
      fetchOrders();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div data-testid="owner-orders" className="p-6 md:p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Commandes</h1>
            <p className="text-muted-foreground mt-1">{orders.length} commandes</p>
          </div>
          <div className="flex items-center gap-2">
            {newCount > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF6B00] text-white text-xs font-bold animate-bounce">
                <Bell className="w-3 h-3" />{newCount} nouvelle{newCount > 1 ? "s" : ""}
              </span>
            )}
            {connected && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-medium">
                <Zap className="w-3 h-3" />En direct
              </span>
            )}
            <button
              data-testid="owner-sound-toggle"
              onClick={toggleSound}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${soundEnabled ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-muted text-muted-foreground"}`}
            >
              {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? "Son" : "Muet"}</span>
            </button>
          </div>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="preparing">En preparation</TabsTrigger>
          <TabsTrigger value="ready">Pretes</TabsTrigger>
          <TabsTrigger value="delivered">Livrees</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.client_name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}</TableCell>
                <TableCell className="font-medium">{order.total.toFixed(2)} EUR</TableCell>
                <TableCell>
                  <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                    <SelectTrigger className="h-7 w-[130px] text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="preparing">En preparation</SelectItem>
                      <SelectItem value="ready">Pret</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setDetailOrder(order)}><Eye className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail de la commande</DialogTitle>
            <DialogDescription>{detailOrder?.client_name} - {detailOrder?.delivery_address}</DialogDescription>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-3 py-4">
              {detailOrder.items.map((item, idx) => (
                <div key={`item-${idx}-${item.name}`} className="flex justify-between text-sm py-1">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} EUR</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span><span className="text-[#FF6B00]">{detailOrder.total.toFixed(2)} EUR</span>
              </div>
              {detailOrder.notes && <p className="text-sm text-muted-foreground">Notes: {detailOrder.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
