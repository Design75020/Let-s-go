import { useState, useEffect } from "react";
import api from "../../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Users, MapPin, ShoppingBag, DollarSign } from "lucide-react";

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try { const { data } = await api.get("/clients"); setClients(data); }
      catch { /* noop */ }
      finally { setLoading(false); }
    };
    fetchClients();
  }, []);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div data-testid="admin-clients" className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>Clients</h1>
          <p className="text-muted-foreground mt-1">{clients.length} clients enregistres</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telephone</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Commandes</TableHead>
              <TableHead>Depenses</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  Aucun client enregistre
                </TableCell>
              </TableRow>
            ) : (
              clients.map((c) => (
                <TableRow key={c.id} data-testid={`client-row-${c.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-[#3B82F6]">{c.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell>{c.phone || "N/A"}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />{c.address || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-muted-foreground" />{c.order_count}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 font-medium text-[#10B981]">
                      <DollarSign className="w-3 h-3" />{c.total_spent.toFixed(2)} EUR
                    </span>
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
