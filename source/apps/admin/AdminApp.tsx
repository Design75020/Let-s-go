import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Utensils, 
  Truck, 
  Globe, 
  ShieldAlert, 
  Plus, 
  RefreshCw, 
  Check, 
  ShoppingCart, 
  Play, 
  MapPin, 
  User, 
  CircleDot,
  ArrowRight
} from 'lucide-react';
import { Card, SectionTitle, Button } from '../../shared/ui';
import { db, handleFirestoreError } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { OrdersAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

export default function AdminApp() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [message, setMessage] = useState('');

  // FIX (Split Brain): Orders are now fetched from the backend API (canonical SSoT Prisma/SQLite)
  // Restaurants and users remain in Firestore (static config data, no order state)
  const fetchOrders = async () => {
    try {
      const data = await OrdersAPI.list();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Orders fetch error:', err);
    }
  };

  useEffect(() => {
    // 1. Sync restaurants in real time (Firestore — static config data)
    const unsubRestos = onSnapshot(collection(db, 'restaurants'), (snapshot) => {
      setRestaurants(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error('Resto sync err:', err));

    // 2. Sync users in real time (Firestore — auth profiles)
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error('User sync err:', err));

    // 3. FIX: Orders from backend API (canonical SSoT — Prisma/SQLite)
    fetchOrders();
    const ordersInterval = setInterval(fetchOrders, 5000); // Poll every 5s for live updates

    return () => {
      unsubRestos();
      unsubUsers();
      clearInterval(ordersInterval);
    };
  }, []);

  const triggerNotification = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 4000);
  };

  // Quick Action: Simulate a customer order
  const createMockOrder = async (restoId: string, clientUid: string) => {
    setIsPlacing(true);
    try {
      const targetResto = restaurants.find(r => r.id === restoId) || { name: 'Burger House' };
      const targetClient = users.find(u => u.uid === clientUid) || { name: 'Jean Client' };
      
      const isSushi = restoId.includes('sushi');
      const items = isSushi ? [
        { id: 'item-tokyo-1', name: 'Plateau Salmon', price: 18.0, quantity: 1 }
      ] : [
        { id: 'item-burger-1', name: 'Le Classic', price: 12.5, quantity: 2 },
        { id: 'item-burger-2', name: 'Frites Maison', price: 4.5, quantity: 1 }
      ];
      const total = isSushi ? 18.0 : 29.5;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: clientUid,
          restaurantId: restoId,
          items,
          total,
          clientName: targetClient.name,
          restaurantName: targetResto.name,
          idempotencyKey: `mock_order_${Date.now()}`
        })
      });

      if (res.ok) {
        triggerNotification(`Commande créée avec succès pour ${targetResto.name} !`);
      } else {
        const errData = await res.json();
        triggerNotification(`Erreur: ${errData.error || 'Impossible de créer la commande'}`);
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification(`Échec de la requête: ${err.message}`);
    } finally {
      setIsPlacing(false);
    }
  };

  // State Transition calls mapped directly to SQLite SSoT backends
  const updateOrderStatus = async (orderId: string, action: 'accept' | 'ready' | 'complete') => {
    try {
      const endpoint = `/api/orders/${orderId}/${action}`;
      const res = await fetch(endpoint, {
        method: action === 'complete' ? 'PATCH' : 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        triggerNotification(`Statut mis à jour: ${action.toUpperCase()}`);
      } else {
        const err = await res.json();
        triggerNotification(`Erreur de transition: ${err.error}`);
      }
    } catch (err: any) {
      triggerNotification(`Erreur réseau: ${err.message}`);
    }
  };

  const assignDriver = async (orderId: string, driverId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId })
      });
      if (res.ok) {
        const driverName = users.find(u => u.uid === driverId)?.name || 'Livreur';
        triggerNotification(`Commande assignée avec succès à ${driverName} !`);
      } else {
        const err = await res.json();
        triggerNotification(`Erreur d'assignation: ${err.error}`);
      }
    } catch (err: any) {
      triggerNotification(`Erreur d'assignation réseau: ${err.message}`);
    }
  };

  const toggleRestoStatus = async (restoId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'open' ? 'closed' : 'open';
      await updateDoc(doc(db, 'restaurants', restoId), { status: nextStatus });
      triggerNotification(`Statut du restaurant mis à jour vers: ${nextStatus.toUpperCase()}`);
    } catch (err: any) {
      triggerNotification(`Erreur de mise à jour: ${err.message}`);
    }
  };

  const toggleDriverAvailability = async (uId: string, isAvailable: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uId), { available: !isAvailable });
      triggerNotification(`Disponibilité du livreur mise à jour !`);
    } catch (err: any) {
      triggerNotification(`Erreur livreur: ${err.message}`);
    }
  };

  // Split users by role
  const clients = users.filter(u => u.role === 'client');
  const drivers = users.filter(u => u.role === 'driver');

  return (
    <div className="p-8 md:p-12 bg-slate-50 min-h-screen font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900 border border-white/10 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-black uppercase tracking-wider"
          >
            <CircleDot className="w-4 h-4 text-[#ff385c] animate-pulse" />
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Console d'Administration</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">LETSGOFOOD V15 — SRE ORCHESTRATION SHIELD</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            System Live
          </div>
          <div className="px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">
            UTC: 2026-05-22
          </div>
        </div>
      </header>

      {/* Main Grid: Info Cards and Controller Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Left column: Live Simulator and Seed Entities */}
        <div className="xl:col-span-1 space-y-10">
          
          {/* Section: Interactive Simulation Center */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
              <Globe className="w-24 h-24" />
            </div>
            
            <SectionTitle title="Moteur Grains" subtitle="Générateur de flux instantané" />
            
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-6 leading-relaxed">
              Utilisez les boutons ci-dessous pour simuler des commandes et tester les transits en direct sur le SSoT PostgreSQL et Firestore.
            </p>

            <div className="space-y-4">
              <Button 
                onClick={() => createMockOrder('resto_burger', 'client_1')}
                disabled={isPlacing || restaurants.length === 0}
                className="w-full h-16 rounded-2xl flex items-center justify-between px-6 bg-[#ff385c] text-white hover:bg-red-600 border-none transition-all group"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-white" />
                  <span className="text-white text-left italic">
                    <span className="block text-[8px] opacity-60 uppercase not-italic tracking-widest leading-none mb-1">Jean Client chez</span>
                    Burger House (29.50€)
                  </span>
                </div>
                <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform" />
              </Button>

              <Button 
                onClick={() => createMockOrder('resto_sushi', 'client_2')}
                disabled={isPlacing || restaurants.length === 0}
                className="w-full h-16 rounded-2xl flex items-center justify-between px-6 bg-slate-900 text-white hover:bg-slate-800 border-none transition-all group"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-white" />
                  <span className="text-white text-left italic">
                    <span className="block text-[8px] opacity-60 uppercase not-italic tracking-widest leading-none mb-1">Emma Foodie chez</span>
                    Sushi Tokyo (18.00€)
                  </span>
                </div>
                <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform" />
              </Button>
            </div>
          </Card>

          {/* Section: 2 Seeded Restaurants */}
          <Card>
            <SectionTitle title="Partenaires Restaurants" subtitle="Configuration des 2 établissements" />
            <div className="space-y-6">
              {restaurants.map((resto) => (
                <div key={resto.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black italic text-xs uppercase">
                      {resto.name?.[0]}
                    </div>
                    <div>
                      <p className="font-black italic text-slate-900 uppercase text-xs">{resto.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{resto.category}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => toggleRestoStatus(resto.id, resto.status)}
                    className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all border ${
                      resto.status === 'open' 
                        ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' 
                        : 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100'
                    }`}
                  >
                    {resto.status === 'open' ? 'Ouvert' : 'Fermé'}
                  </button>
                </div>
              ))}
              {restaurants.length === 0 && (
                <p className="text-slate-300 text-center uppercase tracking-widest text-[9px] font-black italic py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                  En attente de chargement...
                </p>
              )}
            </div>
          </Card>

          {/* Section: 2 Seeded Drivers & Clients */}
          <Card>
            <SectionTitle title="Acteurs Dispatch" subtitle="Livreurs (2) & Clients (2)" />
            
            <div className="space-y-8">
              {/* Drivers list */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5" /> Personnel de livraison
                </h4>
                <div className="space-y-4">
                  {drivers.map(drv => (
                    <div key={drv.uid} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-black italic text-slate-900 uppercase">{drv.name}</p>
                          <p className="text-[8px] font-bold text-slate-400">{drv.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleDriverAvailability(drv.uid, !!drv.available)}
                        className={`px-3 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-wide ${
                          drv.available
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-200/50 text-slate-400'
                        }`}
                      >
                        {drv.available ? 'En Service' : 'Hors Ligne'}
                      </button>
                    </div>
                  ))}
                  {drivers.length === 0 && (
                    <p className="text-slate-300 text-center uppercase tracking-widest text-[8px] font-semibold">Aucun livreur configuré</p>
                  )}
                </div>
              </div>

              {/* Clients list */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Personas Clients
                </h4>
                <div className="space-y-4">
                  {clients.map(cl => (
                    <div key={cl.uid} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 text-xs">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-black italic text-slate-600 text-[10px] uppercase">
                        {cl.name?.[0]}
                      </div>
                      <div>
                        <p className="font-black italic text-slate-900 uppercase">{cl.name}</p>
                        <p className="text-[8px] font-bold text-slate-400">{cl.email}</p>
                      </div>
                    </div>
                  ))}
                  {clients.length === 0 && (
                    <p className="text-slate-300 text-center uppercase tracking-widest text-[8px] font-semibold">Aucun client configuré</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* Right column: Orders Monitor / Real-time pipeline */}
        <div className="xl:col-span-2 space-y-10">
          
          <Card className="min-h-[500px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-8 mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Transactions & Trajets en direct</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Suivi de routage des commandes de bout en bout</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Compte:</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-black italic">{orders.length} commandes</span>
              </div>
            </div>

            <div className="space-y-6">
              {orders.map((order) => {
                const status = (order.status || '').toUpperCase();
                const itemsList = order.items || [];
                
                // Mapped status for colored badges
                const statusColors = {
                  PENDING: 'bg-red-50 text-red-500 border-red-100',
                  ACCEPTED: 'bg-amber-50 text-amber-500 border-amber-100',
                  PREPARING: 'bg-blue-50 text-blue-500 border-blue-100',
                  READY: 'bg-indigo-50 text-indigo-500 border-indigo-100',
                  PICKED_UP: 'bg-purple-50 text-purple-500 border-purple-100',
                  DELIVERED: 'bg-emerald-50 text-emerald-500 border-emerald-110'
                } as any;

                return (
                  <div key={order.id} className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-8 shadow-sm">
                    <div className="space-y-4">
                      {/* Header row */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black italic tracking-wider text-slate-900 uppercase">#{order.id.slice(-6).toUpperCase()}</span>
                        <span className={`px-4 py-1.5 border rounded-full text-[8px] font-black uppercase tracking-widest ${statusColors[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {status}
                        </span>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-xs text-slate-500 uppercase italic font-bold">
                        <div>
                          <span className="text-[9px] block text-slate-300 not-italic uppercase font-black leading-none mb-1">Etablissement</span>
                          <span className="text-slate-800 font-extrabold">{order.restaurantName || 'Burger House'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] block text-slate-300 not-italic uppercase font-black leading-none mb-1">Destinataire</span>
                          <span className="text-slate-800 font-extrabold">{order.clientName || 'Jean Client'}</span>
                        </div>
                        <div className="col-span-2 pt-2">
                          <span className="text-[9px] block text-slate-300 not-italic uppercase font-black leading-none mb-1">Contenu</span>
                          <span className="text-slate-700 italic font-black text-[11px]">
                            {itemsList.map((it: any) => `${it.quantity || 1}x ${it.name || it.id}`).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 min-w-[200px]">
                      <span className="text-xl font-black italic text-slate-900 leading-none">
                        €{order.total ? Number(order.total).toFixed(2) : '0.00'}
                      </span>
                      
                      {/* Flow Transitions Action Station */}
                      <div className="w-full flex flex-wrap gap-2 justify-end">
                        {status === 'PENDING' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'accept')}
                            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all"
                          >
                            Accepter Commande
                          </button>
                        )}
                        
                        {status === 'ACCEPTED' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all"
                          >
                            Prêt pour livraison
                          </button>
                        )}

                        {status === 'READY' && (
                          <>
                            <button 
                              onClick={() => assignDriver(order.id, 'driver_1')}
                              className="px-3 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all"
                            >
                              Assigner Marco
                            </button>
                            <button 
                              onClick={() => assignDriver(order.id, 'driver_2')}
                              className="px-3 py-2 bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all"
                            >
                              Assigner Sophie
                            </button>
                          </>
                        )}

                        {status === 'PICKED_UP' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'complete')}
                            className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all"
                          >
                            Valider Livraison
                          </button>
                        )}

                        {status === 'DELIVERED' && (
                          <div className="flex items-center gap-1.5 text-emerald-500 text-[9px] font-black uppercase tracking-wider py-2">
                            <Check className="w-4 h-4 text-emerald-500 stroke-[3px]" />
                            Livraison Remplie
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {orders.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <CircleDot className="w-8 h-8 text-slate-200 mx-auto mb-4 animate-spin" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic leading-none mb-1">
                    Aucune transaction active détectée
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                    Utilisez le module grains pour générer des commandes
                  </p>
                </div>
              )}
            </div>
          </Card>
          
          <Card className="bg-slate-900 border-none text-white overflow-hidden relative p-8">
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldAlert className="w-32 h-32 rotate-12" />
             </div>
             
             <h3 className="text-lg font-black italic uppercase tracking-tighter mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#ff385c]" /> Notes d'Architecture de Test
             </h3>
             
             <div className="text-xs text-white/60 leading-relaxed uppercase italic font-bold space-y-2 relative z-10 font-sans">
                <p>• Le cycle complet implique une transition de statut linéaire : PENDING → ACCEPTED → READY → PICKED_UP (avec chauffeur) → DELIVERED.</p>
                <p>• Les modifications apportées via cette console sont exécutées de manière transactionnelle sur PostgreSQL et propagées en temps réel sur les interfaces Client, Merchant et Dispatcher via Firestore.</p>
             </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
