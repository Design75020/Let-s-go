import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Navigation, CheckCircle, Package, Clock, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function DriverApp() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // SECURITY: Listen to orders assigned to me or ready for pickup
    const q = query(collection(db, 'orders'), where('status', 'in', ['ready', 'picked_up']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Filter locally for simplicity in this demo, but rules prevent unauthorized access to specific docs
      const filtered = allOrders.filter((o: any) => o.status === 'ready' || o.driverId === user.uid);
      setOrders(filtered);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const acceptOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('lgf_token')}`
        },
        body: JSON.stringify({ driverName: user.name })
      });
      if (!response.ok) throw new Error('Impossible d\'accepter cette mission');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const deliverOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('lgf_token')}`
        },
        body: JSON.stringify({ status: 'delivered' })
      });
      if (!response.ok) throw new Error('Erreur Kernel lors de la livraison');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Simulate Location Updates when delivering
  useEffect(() => {
    const activeOrders = orders.filter(o => o.status === 'picked_up' && o.driverId === user.uid);
    if (activeOrders.length === 0) return;

    const interval = setInterval(async () => {
      const lat = 48.8566 + (Math.random() - 0.5) * 0.01;
      const lng = 2.3522 + (Math.random() - 0.5) * 0.01;

      for (const order of activeOrders) {
        // SECURITY: Secure location update via API
        fetch('/api/drivers/location', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('lgf_token')}`
          },
          body: JSON.stringify({ orderId: order.id, location: { lat, lng } })
        }).catch(err => console.error('Location update failed:', err));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orders, user.uid]);

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      {/* Mobile Top Bar */}
      <header className="fixed top-0 w-full z-40 bg-[#08090a]/50 backdrop-blur-2xl border-b border-white/5 h-20 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ff385c]/10 rounded-xl flex items-center justify-center border border-[#ff385c]/20">
            <Truck className="w-5 h-5 text-[#ff385c]" />
          </div>
          <div>
            <h1 className="font-black italic text-lg tracking-tighter">DRIVER HUB</h1>
            <p className="text-[8px] font-black tracking-widest text-[#ff385c]/60">LGF LOGISTICS V2</p>
          </div>
        </div>
        <button onClick={logout} className="p-3 bg-white/5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="pt-28 pb-12 px-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Status Card */}
          <div className="glass p-8 rounded-[2rem] border-green-500/20 bg-green-500/5">
             <div className="flex items-center justify-between mb-2">
                <span className="text-green-500 text-[10px] font-black tracking-widest uppercase">Statut : En Ligne</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             </div>
             <p className="text-xs text-white/40 font-medium">Recherche de livraisons à proximité de votre position...</p>
          </div>

          <h2 className="text-xl font-bold italic uppercase tracking-tight mt-8">LIVRAISONS DISPONIBLES</h2>

          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/10">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="text-xs font-black italic tracking-widest">CONNECTING TO DISPATCH...</p>
              </div>
            ) : orders.filter(o => o.status === 'ready').map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-8 rounded-[2.5rem] border-white/10"
              >
                <div className="flex justify-between items-start mb-6">
                   <div>
                     <p className="text-[10px] font-black text-[#ff385c] tracking-widest mb-1 uppercase">NOUVELLE MISSION</p>
                     <h3 className="text-lg font-bold italic uppercase leading-none">{order.restaurantName}</h3>
                   </div>
                   <p className="text-xl font-black italic">12.50€</p>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-xs text-white/40 font-bold">
                    <MapPin className="w-4 h-4 text-[#ff385c]" />
                    <span>Restaurant : {order.restaurantName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40 font-bold">
                    <Navigation className="w-4 h-4 text-white/60" />
                    <span>Client : {order.clientName}</span>
                  </div>
                </div>

                <button 
                  onClick={() => acceptOrder(order.id)}
                  className="w-full py-4 bg-white text-black font-black italic rounded-2xl hover:scale-[1.02] transition-transform shadow-xl"
                >
                  ACCEPTER LA LIVRAISON
                </button>
              </motion.div>
            ))}

            {/* Orders being delivered */}
            {orders.filter(o => o.status === 'picked_up' && o.driverId === user.uid).map((order) => (
              <motion.div 
                key={order.id}
                className="glass p-8 rounded-[2.5rem] border-green-500/30 bg-green-500/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                   <Package className="w-12 h-12 text-green-500/20 rotate-12" />
                </div>
                <p className="text-[10px] font-black text-green-500 tracking-widest mb-2 uppercase">LIVRAISON EN COURS</p>
                <h3 className="text-lg font-bold italic uppercase mb-6">Livraison vers {order.clientName}</h3>
                
                <button 
                  onClick={() => deliverOrder(order.id)}
                  className="w-full py-4 bg-green-500 text-white font-black italic rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-green-500/20"
                >
                  <CheckCircle className="w-5 h-5" /> MARQUER COMME LIVRÉ
                </button>
              </motion.div>
            ))}

            {!loading && orders.length === 0 && (
              <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                <Package className="w-10 h-10 text-white/5 mx-auto mb-4" />
                <p className="text-white/20 font-black italic uppercase text-xs">Aucune commande prête pour le moment</p>
                <p className="text-[8px] text-white/10 mt-2">Restez vigilant, les nouvelles missions arrivent en temps réel.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
