import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  Package, 
  History, 
  Wallet, 
  Settings, 
  Power,
  Bell,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Phone,
  MessageSquare,
  Heart
} from 'lucide-react';

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('available');
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!isOnline) return;
    try {
      const token = localStorage.getItem('token');
      const [availRes, activeRes] = await Promise.all([
        fetch('/api/driver/available', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/driver/active', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const availData = await availRes.json();
      const activeData = await activeRes.json();
      setAvailableOrders(availData);
      setActiveOrders(activeData);
    } catch (err) {
      console.error('Failed to fetch driver data:', err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchData, 10000);
    fetchData();
    return () => clearInterval(interval);
  }, [isOnline]);

  // Simulate Driver Location Updates
  useEffect(() => {
    if (!isOnline || activeOrders.length === 0) return;

    const interval = setInterval(async () => {
      // Simulate moving around Lyon area
      const lat = 45.76 + (Math.random() - 0.5) * 0.01;
      const lng = 4.83 + (Math.random() - 0.5) * 0.01;

      const token = localStorage.getItem('token');
      activeOrders.forEach(async (order) => {
        if (order.status === 'picked_up') {
          await fetch('/api/driver/location', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
              orderId: order._id, 
              location: { lat, lng } 
            })
          });
        }
      });
    }, 5000); // Send update every 5s

    return () => clearInterval(interval);
  }, [isOnline, activeOrders]);

  const acceptOrder = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/driver/accept/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchData();
        setActiveTab('history'); // We'll show active in history or dedicated tab
      }
    } catch (err) {
      console.error('Accept failed:', err);
    }
  };

  const completeDelivery = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'delivered' })
      });
      fetchData();
    } catch (err) {
      console.error('Delivery completion failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-white font-sans flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Top Header */}
      <header className="md:hidden p-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-500 font-black italic">LG</div>
          <span className="font-black tracking-tighter">DRIVER</span>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-white/40" />
          <div className="w-8 h-8 bg-white/10 rounded-full" />
        </div>
      </header>

      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-64 bg-black/40 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-white/5 p-4 md:p-6 flex md:flex-col justify-around md:justify-start gap-4 z-50">
        <div className="hidden md:flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-black border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-500 font-extrabold italic text-xl">LG</div>
          <div className="flex flex-col">
            <span className="font-black tracking-tighter leading-none">DRIVER</span>
            <span className="text-[8px] text-white/30 tracking-[0.3em] uppercase">Ecosystem</span>
          </div>
        </div>

        {[
          { id: 'available', label: 'Deliver', icon: Navigation },
          { id: 'history', label: 'History', icon: History },
          { id: 'wallet', label: 'Wallet', icon: Wallet },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col md:flex-row items-center gap-2 md:gap-4 p-2 md:p-4 rounded-2xl transition-all ${
              activeTab === item.id 
                ? 'text-emerald-500 md:bg-emerald-500/10' 
                : 'text-white/30 hover:text-white'
            }`}
          >
            <item.icon className="w-6 h-6 md:w-5 md:h-5" />
            <span className="text-[10px] md:text-sm font-bold">{item.label}</span>
          </button>
        ))}

        <div className="hidden md:flex flex-col mt-auto pt-6 border-t border-white/5 gap-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-white/40">Status</span>
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isOnline ? 'bg-emerald-500' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isOnline ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <p className="text-[10px] text-center text-white/20 uppercase tracking-widest leading-relaxed">
            {isOnline ? "Searching for orders..." : "Go online to start earning"}
          </p>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 mb-20 md:mb-0 space-y-8 custom-scrollbar">
        {/* Toggle Status Mobile */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
            <span className="font-bold text-sm">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isOnline ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter">DASHBOARD</h1>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-1">Ready for dispatch</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase">Earning Today (incl. tips)</p>
              <p className="text-2xl font-black text-emerald-500">42.80€</p>
            </div>
          </div>

          {!isOnline ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                <Power className="w-10 h-10 text-white/10" />
              </div>
              <div>
                <h3 className="text-xl font-bold">You are currently offline</h3>
                <p className="text-sm text-white/40 max-w-[200px] mx-auto">Switch to online status to start receiving delivery requests near you.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">
                {activeTab === 'available' ? 'Available Orders' : 'Your Active Tasks'}
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {(activeTab === 'available' ? availableOrders : activeOrders).map((order) => (
                  <motion.div 
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-lg">{order.restaurantId?.name || 'Restaurant'}</h4>
                          <span className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest">{order.status}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black italic">{(order.amount + (order.tip || 0))?.toFixed(2)}€</p>
                        <div className="flex flex-col items-end">
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Guaranteed</p>
                          {order.tip > 0 && (
                            <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                              <Heart className="w-2 h-2 fill-emerald-500" /> Tips Incl.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 py-4 border-y border-white/5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold">{order.items?.length || 0} articles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold">Today</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {activeTab === 'available' ? (
                        <button 
                          onClick={() => acceptOrder(order._id)}
                          className="flex-1 py-4 bg-emerald-500 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          ACCEPT & NAVIGATE
                        </button>
                      ) : (
                        <button 
                          onClick={() => completeDelivery(order._id)}
                          className="flex-1 py-4 bg-blue-500 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          COMPLETE DELIVERY
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {(activeTab === 'available' ? availableOrders : activeOrders).length === 0 && (
                  <div className="col-span-full py-12 text-center text-white/20 italic bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                    No tasks found here
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Recent Performance */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Last Deliveries</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-bold">Pizza Roma</span>
                </div>
                <span className="text-xs text-white/30">Delivered at 14:20</span>
                <span className="text-sm font-mono">+5.20€</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
