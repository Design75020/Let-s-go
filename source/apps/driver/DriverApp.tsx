
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Bike, Package, CheckCircle, MapPin, List } from 'lucide-react';
import { OrdersAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { SectionTitle, Card, Button } from '../../shared/ui';

export default function DriverApp() {
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const { user } = useAuth();

  // FIX (Split Brain): Orders are now fetched from the backend API (canonical SSoT)
  const fetchTasks = async () => {
    if (!user) return;
    try {
      const allOrders = await OrdersAPI.list();
      const available = allOrders.filter((o: any) =>
        ['READY', 'ready'].includes(o.status)
      );
      const mine = allOrders.filter((o: any) =>
        ['PICKED_UP', 'picked_up'].includes(o.status) && o.driverId === user.uid
      );
      setAvailableTasks(available);
      setMyTasks(mine);
    } catch (err) {
      console.error('Driver tasks fetch error:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchTasks();
    const interval = setInterval(fetchTasks, 4000); // Poll every 4s for live updates
    return () => clearInterval(interval);
  }, [user]);

  const acceptTask = async (orderId: string) => {
    try {
      await OrdersAPI.claim(orderId, user?.uid || '');
      await fetchTasks(); // Refresh immediately after action
    } catch (err) {
      console.error('Failed to claim mission in canonical SSoT', err);
    }
  };

  const deliverOrder = async (orderId: string) => {
    try {
      await OrdersAPI.complete(orderId);
      await fetchTasks(); // Refresh immediately after action
    } catch (err) {
      console.error('Failed to complete delivery in canonical SSoT', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
       <header className="mb-16 flex justify-between items-center">
          <SectionTitle title="LGF Dispatch" subtitle="Réseau de livraison actif" />
          <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-3">
             <Bike className="w-4 h-4 text-[#ff385c]" />
             <span className="text-[10px] font-black uppercase tracking-widest">En Service</span>
          </div>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card className="lg:col-span-1">
             <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                <List className="w-5 h-5 text-[#ff385c]" /> Missions Disponibles
             </h3>
             <div className="space-y-6">
                {availableTasks.map(task => (
                  <div key={task.id} className="p-8 bg-slate-50 border border-slate-50 rounded-[2.5rem] flex flex-col gap-6">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Restaurant</p>
                           <p className="text-lg font-black italic text-slate-900 uppercase tracking-tight">{task.restaurantName}</p>
                        </div>
                        <p className="text-xl font-black italic text-[#ff385c]">€5.50</p>
                     </div>
                     <Button onClick={() => acceptTask(task.id)} className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black italic uppercase italic">Accepter la mission</Button>
                  </div>
                ))}
                {availableTasks.length === 0 && (
                   <p className="text-slate-300 font-black italic text-center py-20 uppercase text-xs tracking-widest">En attente de commandes...</p>
                )}
             </div>
          </Card>

          <div className="space-y-10">
             {myTasks.length > 0 && (
                <Card className="bg-gradient-to-r from-[#ff385c] to-red-600 text-white border-none p-8">
                   <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                      <Package className="w-5 h-5 text-white animate-pulse" /> Livraisons en cours
                   </h3>
                   <div className="space-y-6">
                      {myTasks.map(task => (
                        <div key={task.id} className="p-6 bg-white/10 rounded-[2rem] border border-white/10 flex flex-col gap-4">
                           <div className="flex justify-between items-start text-xs font-black uppercase">
                              <div>
                                 <p className="text-[8px] opacity-60 tracking-widest mb-1">CLIENT</p>
                                 <p className="italic text-white">{task.clientName || 'Jean Client'}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] opacity-60 tracking-widest mb-1">RESTAURANT</p>
                                 <p className="italic text-white">{task.restaurantName}</p>
                              </div>
                           </div>
                           <Button onClick={() => deliverOrder(task.id)} className="w-full h-12 bg-white text-[#ff385c] hover:bg-slate-50 border-none font-black italic uppercase text-[10px] tracking-widest">
                              Valider la livraison
                           </Button>
                        </div>
                      ))}
                   </div>
                </Card>
             )}

             <Card className="bg-slate-900 border-none text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8">
                   <Navigation className="w-40 h-40 text-white/5 -mr-10 -mt-10" />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 relative z-10">Ma Position</h3>
                <div className="h-64 bg-slate-800 rounded-[2rem] flex items-center justify-center relative z-10 mb-10 border border-white/5 shadow-inner">
                   <MapPin className="w-8 h-8 text-[#ff385c] animate-bounce" />
                </div>
                <div className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5 relative z-10">
                   <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Signal GPS</span>
                   <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">STABLE</span>
                </div>
             </Card>
          </div>
       </div>
    </div>
  );
}
