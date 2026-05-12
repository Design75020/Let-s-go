import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Utensils, ClipboardList, Settings, LogOut, Plus, Search, Edit2, Trash2, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { emitEvent } from '../lib/events';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const chartData = [
  { day: 'Lun', sales: 400 },
  { day: 'Mar', sales: 700 },
  { day: 'Mer', sales: 450 },
  { day: 'Jeu', sales: 900 },
  { day: 'Ven', sales: 650 },
  { day: 'Sam', sales: 800 },
  { day: 'Dim', sales: 1000 },
];

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
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-80 border-r border-white/5 p-8 flex-col fixed h-full z-20 bg-[#08090a]">
        <div className="text-3xl font-black italic tracking-tighter mb-16 px-2">
          LGF<span className="text-[#ff385c]">.</span> MERCHANT
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

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#08090a]/80 backdrop-blur-2xl border-t border-white/5 px-4 md:px-6 py-4 flex items-center justify-between">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'orders', icon: ClipboardList },
          { id: 'menu', icon: Utensils },
          { id: 'settings', icon: Settings },
          { id: 'logout', icon: LogOut, action: logout },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => item.action ? item.action() : setActiveTab(item.id)}
            className={`p-3 md:p-4 rounded-xl transition-all ${
              activeTab === item.id ? 'bg-[#ff385c] text-white shadow-lg shadow-[#ff385c]/20' : 'text-white/40'
            } ${item.id === 'logout' ? 'text-red-500/60' : ''}`}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 p-6 md:p-12 pb-32 lg:pb-12 text-white">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 md:mb-16">
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tight uppercase truncate max-w-[300px]">{restoData?.name || 'Chargement...'}</h1>
            <p className="text-white/30 text-[10px] md:text-xs font-black tracking-widest mt-1 md:mt-2 uppercase">ID: {user?.uid.slice(0, 8)} • KERNEL V2.5</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-white/40 text-[8px] md:text-[10px] font-black uppercase tracking-widest block mb-0.5 md:mb-1">CA Jour</span>
                <span className="text-lg md:text-xl font-black italic">1,240.50€</span>
             </div>
            <div className="px-4 md:px-5 py-2.5 bg-green-500/10 border border-green-500/20 text-green-500 font-black rounded-full flex items-center gap-2 text-[10px] md:text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              OUVERT
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'menu' && <MenuManager restaurantId={user?.uid} />}
          {activeTab === 'orders' && <OrderMonitor restaurantId={user?.uid} />}
          {activeTab === 'settings' && <SettingsView restoData={restoData} user={user} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SettingsView({ restoData, user }: { restoData: any, user: any }) {
  const [name, setName] = useState(restoData?.name || '');
  const [category, setCategory] = useState(restoData?.category || 'Burger & Grill');
  const [updating, setUpdating] = useState(false);

  const handleSave = async () => {
    if (!user?.uid) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'restaurants', user.uid), {
        name,
        category,
        updatedAt: serverTimestamp()
      });
      alert('Paramètres mis à jour avec succès !');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la mise à jour.');
    } finally {
      setUpdating(false);
    }
  };

  const toggleStatus = async () => {
    if (!user?.uid) return;
    const newStatus = restoData?.status === 'open' ? 'closed' : 'open';
    try {
      await updateDoc(doc(db, 'restaurants', user.uid), {
        status: newStatus
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <h2 className="text-2xl font-bold italic mb-8 uppercase tracking-tight">Paramètres du Restaurant</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[2rem] space-y-6">
          <div>
            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-2">Nom de l'établissement</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[#ff385c] outline-none transition-all" 
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-2">Catégorie principale</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[#ff385c] outline-none transition-all appearance-none"
            >
               <option value="Burger & Grill">Burger & Grill</option>
               <option value="Sushi & Asia">Sushi & Asia</option>
               <option value="Pizza & Pasta">Pizza & Pasta</option>
               <option value="Health & Salads">Health & Salads</option>
            </select>
          </div>
          <button 
            onClick={handleSave}
            disabled={updating}
            className="w-full py-4 bg-[#ff385c] text-white font-black italic rounded-xl shadow-xl shadow-[#ff385c]/20 disabled:opacity-50"
          >
            {updating ? 'CHARGEMENT...' : 'ENREGISTRER LES MODIFICATIONS'}
          </button>
        </div>

        <div className="glass p-8 rounded-[2rem] flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold mb-4">Statut en direct</h4>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${restoData?.status === 'open' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="font-bold uppercase text-xs">{restoData?.status === 'open' ? 'Ouvert' : 'Fermé'}</span>
              </div>
              <button 
                onClick={toggleStatus}
                className="text-[10px] font-black text-[#ff385c] uppercase hover:underline"
              >
                Changer
              </button>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Compte Propriétaire</p>
            <p className="font-bold">{user?.email}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Dashboard() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
       <div className="lg:col-span-2 glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] overflow-hidden min-h-[400px]">
          <h3 className="text-lg md:text-xl font-bold mb-8 italic uppercase tracking-widest text-[#ff385c]">Performance hebdomadaire (Ventes)</h3>
          <div className="h-64 md:h-80 w-full anonymous-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff385c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff385c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'rgba(255,255,255,0.2)' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#08090a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#ff385c" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
       </div>
       <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-[#ff385c]/5 border-[#ff385c]/10 flex flex-col justify-between">
          <div>
            <Sparkles className="w-8 h-8 text-[#ff385c] mb-6" />
            <h3 className="text-lg md:text-xl font-bold mb-4 italic uppercase">Insight IA</h3>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              Vos ventes de "Burgers" ont augmenté de 15% ce weekend. Suggérez un menu groupé pour optimiser votre rentabilité.
            </p>
          </div>
          <button className="w-full py-4 bg-white text-black font-black italic rounded-xl text-[10px] md:text-xs hover:scale-105 transition-all">
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
  const [editingItem, setEditingItem] = useState<any>(null);

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
      setTimeout(() => {
         setAiAdvice("Basé sur les données du marketplace, vos prix sont 5% inférieurs à la concurrence directe. Une augmentation légère pourrait booster vos marges sans affecter le volume.");
         setAiLoading(false);
      }, 1500);
    } catch (e) {
      setAiAdvice("IA indisponible pour le moment.");
      setAiLoading(false);
    }
  };

  const addItem = async () => {
    if (!restaurantId) return;
    const name = prompt("Nom du produit ?") || 'Nouveau Produit';
    const price = parseFloat(prompt("Prix ?") || "10");
    await addDoc(collection(db, 'restaurants', restaurantId, 'menuItems'), {
      name,
      price,
      category: 'Gourmet',
      available: true,
      createdAt: serverTimestamp()
    });
  };

  const deleteItem = async (itemId: string) => {
    if (!restaurantId) return;
    if (confirm("Supprimer cet article ?")) {
      await deleteDoc(doc(db, 'restaurants', restaurantId, 'menuItems', itemId));
    }
  };

  const startEdit = (item: any) => {
    const newName = prompt("Nouveau nom :", item.name);
    const newPrice = prompt("Nouveau prix :", item.price.toString());
    if (newName && newPrice && restaurantId) {
      updateDoc(doc(db, 'restaurants', restaurantId, 'menuItems', item.id), {
        name: newName,
        price: parseFloat(newPrice)
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-xl md:text-2xl font-bold italic uppercase tracking-tight">Gestion de la Carte</h2>
          <p className="text-white/30 text-[10px] md:text-xs mt-1">Éditez vos produits en temps réel.</p>
        </div>
        <div className="grid grid-cols-2 lg:flex gap-3 md:gap-4 w-full md:w-auto">
          <button 
            onClick={getAiAdvice}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:border-[#ff385c]/50 transition-all text-[10px] md:text-xs"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#ff385c]" />}
            IA
          </button>
          <button 
            onClick={addItem}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-4 bg-[#ff385c] text-white font-black italic rounded-2xl hover:scale-105 active:scale-95 transition-all text-[10px] md:text-xs shadow-xl shadow-[#ff385c]/20"
          >
            <Plus className="w-4 h-4" />
            AJOUTER
          </button>
        </div>
      </div>

      <AnimatePresence>
        {aiAdvice && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-8 md:mb-12 p-6 md:p-8 bg-[#ff385c]/10 border border-[#ff385c]/20 rounded-[1.5rem] md:rounded-[2rem] relative"
          >
            <button onClick={() => setAiAdvice('')} className="absolute top-4 right-4 text-white/20 hover:text-white"><Trash2 className="w-4 h-4" /></button>
            <h4 className="text-[#ff385c] font-black flex items-center gap-2 mb-4 italic uppercase text-[10px] tracking-widest">
              <Sparkles className="w-4 h-4" /> GEMINI CORE
            </h4>
            <div className="text-white/60 text-xs md:text-sm leading-relaxed italic">{aiAdvice}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-20 text-white/10 font-black italic">CHARGEMENT...</div>
        ) : items.map((item) => (
          <div key={item.id} className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                <img 
                  src={`https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200`} 
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <Utensils className="w-6 h-6 md:w-8 md:h-8 text-white/10 relative z-10" />
              </div>
              <div>
                <h4 className="text-base md:text-lg font-bold tracking-tight">{item.name}</h4>
                <div className="flex items-center gap-2 md:gap-3 mt-1">
                  <span className="text-white/30 text-[10px] font-bold uppercase">{item.category}</span>
                  <span className="w-1 h-1 bg-white/10 rounded-full" />
                  <span className="text-[#ff385c] font-black text-sm md:text-base">{item.price?.toFixed(2)}€</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => startEdit(item)}
                className="flex-1 sm:flex-none p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl hover:bg-white/10 transition-colors flex justify-center items-center"
              >
                <Edit2 className="w-4 h-4 md:w-5 md:h-5 text-white/40" />
              </button>
              <button 
                onClick={() => deleteItem(item.id)}
                className="flex-1 sm:flex-none p-3 md:p-4 bg-red-500/10 rounded-xl md:rounded-2xl hover:bg-red-500/20 transition-colors flex justify-center items-center"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="text-center py-20 text-white/10 font-bold italic border border-dashed border-white/10 rounded-[2rem]">
            VOTRE CARTE EST VIDE
          </div>
        )}
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
    const correlationId = crypto.randomUUID();
    console.log(`[ORDER] [${correlationId}] Updating order ${orderId} status to ${status}`);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp()
      });

      await emitEvent({
        type: `order.${status}` as any,
        actorId: restaurantId || 'unknown',
        actorRole: 'merchant',
        resourceId: orderId,
        correlationId
      });
    } catch (error) {
      console.error("[ORDER] Error updating status:", error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-xl md:text-2xl font-bold italic mb-8 md:mb-12 uppercase tracking-tight">Commandes en Direct</h2>
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {orders.map((order) => (
          <div key={order.id} className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border transition-all ${order.status === 'pending' ? 'bg-[#ff385c]/5 border-[#ff385c]/20' : 'bg-white/[0.02] border-white/5'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
              <div>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-2">
                   <h3 className="text-lg md:text-xl font-bold italic truncate">#{order.id.slice(-4).toUpperCase()}</h3>
                   <span className={`px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest ${
                     order.status === 'pending' ? 'bg-[#ff385c] text-white' : 'bg-white/10 text-white/40'
                   }`}>
                     {order.status}
                   </span>
                </div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Client: {order.clientName}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xl md:text-2xl font-black italic text-[#ff385c]">{order.total?.toFixed(2)}€</p>
              </div>
            </div>

            <div className="space-y-2 mb-8 md:mb-10 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-[11px] md:text-xs font-bold">
                  <span className="text-white/60 truncate mr-4">1x {item.name}</span>
                  <span className="text-white/30 flex-shrink-0">{item.price.toFixed(2)}€</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {order.status === 'pending' && (
                <button 
                  onClick={() => updateStatus(order.id, 'accepted')}
                  className="w-full sm:flex-1 py-3 md:py-4 bg-white text-black font-black italic rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 hover:scale-[1.02] transition-transform text-xs md:text-sm"
                >
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> ACCEPTER
                </button>
              )}
              {order.status === 'accepted' && (
                <button 
                  onClick={() => updateStatus(order.id, 'preparing')}
                  className="w-full sm:flex-1 py-3 md:py-4 bg-[#ff385c] text-white font-black italic rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm"
                >
                  PRÉPARATION
                </button>
              )}
               {order.status === 'preparing' && (
                <button 
                  onClick={() => updateStatus(order.id, 'ready')}
                  className="w-full sm:flex-1 py-3 md:py-4 bg-green-500 text-white font-black italic rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm"
                >
                  PRÊT
                </button>
              )}
              <button 
                onClick={() => updateStatus(order.id, 'cancelled')}
                className="w-full sm:w-auto px-6 py-3 md:py-4 border border-red-500/20 text-red-500 font-bold text-[10px] md:text-xs rounded-xl md:rounded-2xl hover:bg-red-500/5 transition-all"
              >
                ANNULER
              </button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="p-16 md:p-24 rounded-[2rem] md:rounded-[3rem] border border-dashed border-white/5 text-center">
            <ClipboardList className="w-10 h-10 md:w-12 md:h-12 text-white/5 mx-auto mb-4 md:mb-6" />
            <p className="text-white/20 font-black italic uppercase tracking-widest text-xs md:text-sm">En attente de commandes...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
