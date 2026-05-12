import { useState, useEffect } from "react";
import api, { formatApiError } from "../../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Bike, Package } from "lucide-react";

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try { const { data } = await api.get("/drivers"); setDrivers(data); }
    catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const toggleActive = async (id) => {
    try {
      await api.put(`/users/${id}/toggle-active`);
      fetchDrivers();
    } catch (err) {
      const { toast } = await import("sonner");
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div data-testid="admin-drivers" className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Livreurs</h1>
          <p className="text-muted-foreground mt-1">{drivers.length} livreurs enregistres</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Livreur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telephone</TableHead>
              <TableHead>Livraisons</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  <Bike className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  Aucun livreur enregistre
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((d) => (
                <TableRow key={d.id} data-testid={`driver-row-${d.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-[#10B981]">{d.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{d.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{d.email}</TableCell>
                  <TableCell>{d.phone || "N/A"}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" />{d.delivery_count}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${d.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {d.is_active ? "Actif" : "Inactif"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button data-testid={`toggle-driver-${d.id}`} variant="ghost" size="sm" onClick={() => toggleActive(d.id)}>
                      {d.is_active ? "Desactiver" : "Activer"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
