import { useState, useEffect, useMemo } from "react";import api, { STATUS_LABELS, STATUS_COLORS, formatApiError } from "../../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Eye, UserPlus } from "lucide-react";
import { toast } from "sonner";

const ALL_STATUSES = ["pending", "preparing", "ready", "assigned", "delivering", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailOrder, setDetailOrder] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");

  const fetchData = async () => {
    try {
      const [oRes, dRes] = await Promise.all([api.get("/orders"), api.get("/drivers")]);
      setOrders(oRes.data);
      setDrivers(dRes.data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Statut mis a jour");
      fetchData();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) return;
    try {
      await api.put(`/orders/${assignOrderId}/assign-driver`, { driver_id: selectedDriver });
      toast.success("Livreur assigne");
      setAssignDialogOpen(false);
      setSelectedDriver("");
      fetchData();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const filtered = useMemo(() => statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter), [statusFilter, orders]);
  const activeDrivers = useMemo(() => drivers.filter((d) => d.is_active), [drivers]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div data-testid="admin-orders" className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Commandes</h1>
          <p className="text-muted-foreground mt-1">{orders.length} commandes au total</p>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all" data-testid="filter-all">Toutes ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending" data-testid="filter-pending">En attente</TabsTrigger>
          <TabsTrigger value="preparing" data-testid="filter-preparing">En preparation</TabsTrigger>
          <TabsTrigger value="delivering" data-testid="filter-delivering">En livraison</TabsTrigger>
          <TabsTrigger value="delivered" data-testid="filter-delivered">Livrees</TabsTrigger>
          <TabsTrigger value="cancelled" data-testid="filter-cancelled">Annulees</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Restaurant</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Livreur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                <TableCell className="font-medium">{order.client_name}</TableCell>
                <TableCell>{order.restaurant_name}</TableCell>
                <TableCell className="font-medium">{order.total.toFixed(2)} EUR</TableCell>
                <TableCell>{order.driver_name || <span className="text-muted-foreground text-xs">Non assigne</span>}</TableCell>
                <TableCell>
                  <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                    <SelectTrigger className="h-7 w-[130px] text-xs" data-testid={`status-select-${order.id}`}>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" data-testid={`view-order-${order.id}`} onClick={() => setDetailOrder(order)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    {!order.driver_id && (
                      <Button variant="ghost" size="sm" data-testid={`assign-driver-${order.id}`} onClick={() => { setAssignOrderId(order.id); setAssignDialogOpen(true); }}>
                        <UserPlus className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order detail dialog */}
      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail de la commande</DialogTitle>
            <DialogDescription>Commande de {detailOrder?.client_name}</DialogDescription>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Client:</span> <span className="font-medium">{detailOrder.client_name}</span></div>
                <div><span className="text-muted-foreground">Restaurant:</span> <span className="font-medium">{detailOrder.restaurant_name}</span></div>
                <div><span className="text-muted-foreground">Adresse:</span> <span className="font-medium">{detailOrder.delivery_address}</span></div>
                <div><span className="text-muted-foreground">Telephone:</span> <span className="font-medium">{detailOrder.phone || "N/A"}</span></div>
                <div><span className="text-muted-foreground">Paiement:</span> <span className="font-medium">{detailOrder.payment_method}</span></div>
                <div><span className="text-muted-foreground">Livreur:</span> <span className="font-medium">{detailOrder.driver_name || "Non assigne"}</span></div>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">Articles:</p>
                {detailOrder.items.map((item, idx) => (
                  <div key={`${item.name}-${idx}`} className="flex justify-between text-sm py-1">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} EUR</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-[#FF6B00]">{detailOrder.total.toFixed(2)} EUR</span>
                </div>
              </div>
              {detailOrder.notes && <p className="text-sm text-muted-foreground">Notes: {detailOrder.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign driver dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un livreur</DialogTitle>
            <DialogDescription>Choisissez un livreur pour cette commande</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger data-testid="driver-select">
                <SelectValue placeholder="Choisir un livreur" />
              </SelectTrigger>
              <SelectContent>
                {activeDrivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name} - {d.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Annuler</Button>
            <Button data-testid="confirm-assign-btn" onClick={handleAssignDriver} className="bg-[#FF6B00] hover:bg-[#E05E00] text-white">Assigner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
