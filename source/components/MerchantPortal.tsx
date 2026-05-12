import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Utensils, ClipboardList, Settings, LogOut, Plus, Search, Edit2, Trash2, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function MerchantPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const [restoData, setRestoData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'restaurants', user.uid);
    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        setRestoData({ id: snapshot.id, ...snapshot.data() });
      } else {
        // Initial resto setup if none
        await setDoc(doc(db, 'restaurants', user.uid), {
          name: user.name || 'Mon Restaurant',
          ownerId: user.uid,
          status: 'open',
          category: 'Burger & Grill',
          rating: 5.0
        });
      }
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-[#08090a]">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 p-8 flex flex-col fixed h-full z-20 bg-[#08090a]">
        <div className="text-3xl font-black italic tracking-tighter mb-16 px-2">
          LETSGOFOOD<span className="text-[#ff385c]">.</span> MERCHANT
        </div>

        <nav className="space-y-3 flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
            { id: 'orders', icon: ClipboardList, label: 'Commandes' },
            { id: 'menu', icon: Utensils, label: 'Carte & Menu' },
            { id: 'settings', icon: Settings, label: 'Paramètres' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-white text-black' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#ff385c]' : ''}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={logout}
          className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500/60 hover:bg-red-500/5 hover:text-red-500 transition-all mt-auto"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80 p-12">
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-4xl font-black italic tracking-tight uppercase">{restoData?.name || 'Chargement...'}</h1>
            <p className="text-white/30 text-xs font-black tracking-widest mt-2">ID: {user?.uid.slice(0, 8)} • MODE UNIFIÉ V2.5</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest block mb-1">Chiffre d'affaires</span>
                <span className="text-xl font-black italic">1,240.50€</span>
             </div>
            <div className="px-5 py-2.5 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-black rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              OUVERT
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'menu' && <MenuManager restaurantId={user?.uid} />}
          {activeTab === 'orders' && <OrderMonitor restaurantId={user?.uid} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Dashboard() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-8">
       <div className="col-span-2 glass p-10 rounded-[3rem]">
          <h3 className="text-xl font-bold mb-8">Performance hebdomadaire</h3>
          <div className="h-64 flex items-end gap-4">
            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-white/5 rounded-t-xl relative group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-[#ff385c] rounded-t-xl"
                />
              </div>
            ))}
          </div>
       </div>
       <div className="glass p-10 rounded-[3rem] bg-[#ff385c]/5 border-[#ff385c]/10">
          <Sparkles className="w-8 h-8 text-[#ff385c] mb-6" />
          <h3 className="text-xl font-bold mb-4 italic">Insight IA</h3>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            Vos ventes de "Burgers" ont augmenté de 15% ce weekend. Suggérez un menu groupé pour optimiser votre rentabilité.
          </p>
          <button className="w-full py-4 bg-white text-black font-black italic rounded-xl text-xs">
            VOIR L'ANALYSE DÉTAILLÉE
          </button>
       </div>
    </motion.div>
  );
}

function MenuManager({ restaurantId }: { restaurantId?: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');

  useEffect(() => {
    if (!restaurantId) return;
    const q = query(collection(db, 'restaurants', restaurantId, 'menuItems'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const getAiAdvice = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/optimize-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      setAiAdvice(data.advice);
    } catch (e) {
      setAiAdvice("IA indisponible pour le moment.");
    } finally {
      setAiLoading(false);
    }
  };

  const addItem = async () => {
    if (!restaurantId) return;
    await addDoc(collection(db, 'restaurants', restaurantId, 'menuItems'), {
      name: 'Nouveau Burger Pro',
      price: 14.50,
      category: 'Burger',
      available: true
    });
  };

  const deleteItem = async (itemId: string) => {
    if (!restaurantId) return;
    await deleteDoc(doc(db, 'restaurants', restaurantId, 'menuItems', itemId));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-2xl font-bold italic uppercase tracking-tight">Gestion de la Carte</h2>
          <p className="text-white/30 text-xs mt-1">Éditez vos produits en temps réel sur le marketplace.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={getAiAdvice}
            className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:border-[#ff385c]/50 transition-all text-xs"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#ff385c]" />}
            CONSEIL IA
          </button>
          <button 
            onClick={addItem}
            className="flex items-center gap-2 px-6 py-4 bg-[#ff385c] text-white font-black italic rounded-2xl hover:scale-105 active:scale-95 transition-all text-xs shadow-xl shadow-[#ff385c]/20"
          >
            <Plus className="w-4 h-4" />
            AJOUTER UN PRODUIT
          </button>
        </div>
      </div>

      <AnimatePresence>
        {aiAdvice && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-12 p-8 bg-[#ff385c]/10 border border-[#ff385c]/20 rounded-[2rem] relative"
          >
            <button onClick={() => setAiAdvice('')} className="absolute top-4 right-4 text-white/20 hover:text-white"><Trash2 className="w-4 h-4" /></button>
            <h4 className="text-[#ff385c] font-black flex items-center gap-2 mb-4 italic uppercase text-xs tracking-widest">
              <Sparkles className="w-4 h-4" /> Analyse Gemini 1.5
            </h4>
            <div className="text-white/60 text-sm leading-relaxed italic">{aiAdvice}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-20 text-white/10 font-black italic">SYNCHRONISATION FIRESTORE...</div>
        ) : items.map((item) => (
          <div key={item.id} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                <Utensils className="w-8 h-8 text-white/10" />
              </div>
              <div>
                <h4 className="text-lg font-bold tracking-tight">{item.name}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-white/30 text-xs font-bold uppercase">{item.category}</span>
                  <span className="w-1 h-1 bg-white/10 rounded-full" />
                  <span className="text-[#ff385c] font-black">{item.price.toFixed(2)}€</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                <Edit2 className="w-5 h-5 text-white/40" />
              </button>
              <button 
                onClick={() => deleteItem(item.id)}
                className="p-4 bg-red-500/10 rounded-2xl hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function OrderMonitor({ restaurantId }: { restaurantId?: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    const q = query(collection(db, 'orders'), where('restaurantId', '==', restaurantId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const updateStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, 'orders', orderId), { 
      status,
      updatedAt: serverTimestamp()
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-2xl font-bold italic mb-12 uppercase tracking-tight">Commandes en Direct</h2>
      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => (
          <div key={order.id} className={`p-10 rounded-[3rem] border transition-all ${order.status === 'pending' ? 'bg-[#ff385c]/5 border-[#ff385c]/20' : 'bg-white/[0.02] border-white/5'}`}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-4 mb-2">
                   <h3 className="text-xl font-bold italic">COMMANDE #{order.id.slice(-4).toUpperCase()}</h3>
                   <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     order.status === 'pending' ? 'bg-[#ff385c] text-white' : 'bg-white/10 text-white/40'
                   }`}>
                     {order.status}
                   </span>
                </div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Client: {order.clientName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black italic text-[#ff385c]">{order.total?.toFixed(2)}€</p>
                <p className="text-white/20 text-[10px] font-bold">MODE CB • LGF PAY</p>
              </div>
            </div>

            <div className="space-y-3 mb-10">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-xs font-bold">
                  <span className="text-white/60">1x {item.name}</span>
                  <span className="text-white/30">{item.price.toFixed(2)}€</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              {order.status === 'pending' && (
                <button 
                  onClick={() => updateStatus(order.id, 'accepted')}
                  className="flex-1 py-4 bg-white text-black font-black italic rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                >
                  <CheckCircle className="w-5 h-5" /> ACCEPTER LA COMMANDE
                </button>
              )}
              {order.status === 'accepted' && (
                <button 
                  onClick={() => updateStatus(order.id, 'preparing')}
                  className="flex-1 py-4 bg-[#ff385c] text-white font-black italic rounded-2xl flex items-center justify-center gap-3"
                >
                  PASSER EN PRÉPARATION
                </button>
              )}
               {order.status === 'preparing' && (
                <button 
                  onClick={() => updateStatus(order.id, 'ready')}
                  className="flex-1 py-4 bg-green-500 text-white font-black italic rounded-2xl flex items-center justify-center gap-3"
                >
                  MARQUER COMME PRÊT
                </button>
              )}
              <button 
                onClick={() => updateStatus(order.id, 'cancelled')}
                className="px-8 py-4 border border-red-500/20 text-red-500 font-bold text-xs rounded-2xl hover:bg-red-500/5 transition-all"
              >
                ANNULER
              </button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="p-24 rounded-[3rem] border border-dashed border-white/5 text-center">
            <ClipboardList className="w-12 h-12 text-white/5 mx-auto mb-6" />
            <p className="text-white/20 font-black italic uppercase tracking-widest text-sm">Le terminal est en attente de commandes...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
