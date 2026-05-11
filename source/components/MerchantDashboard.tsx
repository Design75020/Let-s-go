import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  ClipboardList, 
  TrendingUp, 
  Package, 
  Clock, 
  Settings, 
  LogOut,
  ChevronRight,
  Plus,
  Box,
  Truck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function MerchantDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/merchant/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'paid': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'preparing': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ready': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'delivered': return 'bg-white/10 text-white/40 border-white/20';
      default: return 'bg-white/10 text-white/40 border-white/20';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#08090a] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 space-y-8 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black font-black italic">LG</div>
          <span className="font-bold tracking-tight text-white/90">MERCHANT</span>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: 'orders', label: 'Orders', icon: ClipboardList },
            { id: 'menu', label: 'Menu', icon: Package },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {activeTab === 'orders' && "Live Orders"}
              {activeTab === 'menu' && "Menu Management"}
              {activeTab === 'analytics' && "Business Health"}
              {activeTab === 'settings' && "Store Settings"}
            </h1>
            <p className="text-white/40 text-sm">Welcome back, Gourmet Bistro Paris</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Store</span>
            </div>
          </div>
        </header>

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Pending', count: 3, icon: Clock, color: 'text-amber-400' },
                { label: 'Preparing', count: 5, icon: ClipboardList, color: 'text-emerald-400' },
                { label: 'Out for Delivery', count: 2, icon: Truck, color: 'text-blue-400' },
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <stat.icon className={`w-8 h-8 ${stat.color} p-1.5 bg-white/5 rounded-lg`} />
                    <span className="text-2xl font-black">{stat.count}</span>
                  </div>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="p-4 text-[10px] font-bold text-white/40 uppercase">Order ID</th>
                    <th className="p-4 text-[10px] font-bold text-white/40 uppercase">Customer</th>
                    <th className="p-4 text-[10px] font-bold text-white/40 uppercase">Items</th>
                    <th className="p-4 text-[10px] font-bold text-white/40 uppercase">Total</th>
                    <th className="p-4 text-[10px] font-bold text-white/40 uppercase">Status</th>
                    <th className="p-4 text-[10px] font-bold text-white/40 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-mono text-emerald-500">#{order._id.substr(-4)}</td>
                      <td className="p-4 font-bold">{order.userId ? 'Client Auth' : 'Anonyme'}</td>
                      <td className="p-4 text-white/60">{order.items?.length || 0} items</td>
                      <td className="p-4">{order.amount?.toFixed(2)}€</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === 'paid' && (
                            <button 
                              onClick={() => updateStatus(order._id, 'preparing')}
                              className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-bold rounded uppercase hover:bg-emerald-400"
                            >
                              Accepter
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button 
                              onClick={() => updateStatus(order._id, 'ready')}
                              className="px-3 py-1 bg-purple-500 text-white text-[10px] font-bold rounded uppercase hover:bg-purple-400"
                            >
                              Prêt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-white/20 italic">Aucune commande en cours</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Menu Items</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex gap-4">
                  <div className="w-20 h-20 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <Box className="w-8 h-8 text-white/20" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-bold">Signature Dish #{i}</h3>
                    <p className="text-xs text-white/40">Our most popular starter</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-bold text-emerald-400">12.50€</span>
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">In Stock</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
