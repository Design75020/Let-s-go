import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Utensils, ClipboardList, Settings, LogOut, 
  Plus, Search, Edit2, Trash2, Sparkles, Loader2, CheckCircle, 
  XCircle, ShieldCheck, FileText, FileCheck, CreditCard, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
import { optimizeMenuPrices } from '../services/aiService';

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

export default function MerchantPortal({ isEmbedded = false }: { isEmbedded?: boolean }) {
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
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `restaurants/${user.uid}`);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className={`flex min-h-screen ${isEmbedded ? 'bg-transparent' : 'bg-slate-50'}`}>
      {/* Sidebar for Desktop */}
      {!isEmbedded && (
        <aside className="hidden lg:flex w-80 border-r border-slate-100 p-10 flex-col fixed h-full z-20 bg-white">
          <div className="text-2xl font-black italic tracking-tighter mb-16 px-2 text-slate-900">
            LGF<span className="text-[#ff385c]">.</span> MERCHANT
          </div>

          <nav className="space-y-2 flex-1">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
              { id: 'orders', icon: ClipboardList, label: 'Commandes' },
              { id: 'menu', icon: Utensils, label: 'Carte & Menu' },
              { id: 'kyc', icon: ShieldCheck, label: 'Documents & KYC' },
              { id: 'settings', icon: Settings, label: 'Paramètres' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-slate-100 text-slate-900 shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#ff385c]' : ''}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <button 
            onClick={logout}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all mt-auto"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Déconnexion</span>
          </button>
        </aside>
      )}

      {/* Bottom Navigation for Mobile */}
      {!isEmbedded && (
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-50 bg-white/90 backdrop-blur-xl border border-slate-200 px-4 py-4 flex items-center justify-between rounded-[2rem] shadow-2xl">
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'orders', icon: ClipboardList },
            { id: 'menu', icon: Utensils },
            { id: 'kyc', icon: ShieldCheck },
            { id: 'settings', icon: Settings },
            { id: 'logout', icon: LogOut, action: logout },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => item.action ? item.action() : setActiveTab(item.id)}
              className={`p-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-[#ff385c] text-white shadow-lg' : 'text-slate-400'
              } ${item.id === 'logout' ? 'text-red-400' : ''}`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </nav>
      )}

      {/* Main Content */}
      <main className={`flex-1 ${!isEmbedded ? 'lg:ml-80' : ''} p-6 md:p-12 pb-32 lg:pb-12 text-slate-900`}>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase truncate max-w-[400px] text-slate-900">{restoData?.name || 'Chargement...'}</h1>
            <p className="text-slate-300 text-[10px] md:text-xs font-black tracking-widest mt-2 uppercase italic">NODE_SYNC • MERCHANT_PORTAL_v2.5</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
                <span className="text-slate-300 text-[9px] font-black uppercase tracking-widest block mb-1">Chiffre d'Affaires</span>
                <span className="text-xl md:text-2xl font-black italic text-slate-900">1,240.50€</span>
             </div>
            <div className="px-5 py-3 bg-emerald-50 border border-emerald-100 text-emerald-600 font-black rounded-full flex items-center gap-2 text-[10px] md:text-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              OUVERT
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'menu' && <MenuManager restaurantId={user?.uid} />}
          {activeTab === 'orders' && <OrderMonitor restaurantId={user?.uid} />}
          {activeTab === 'kyc' && <KYCManager user={user} />}
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
          <h2 className="text-xl font-black italic uppercase text-slate-900 tracking-widest">Établissement</h2>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Nom de l'établissement</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-[#ff385c] outline-none transition-all font-black italic text-slate-900" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Catégorie</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-[#ff385c] outline-none transition-all appearance-none font-black italic text-slate-900"
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
              className="w-full py-5 bg-slate-900 text-white font-black italic rounded-2xl shadow-xl shadow-slate-900/10 disabled:opacity-50 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              {updating ? 'EN COURS...' : 'ENREGISTRER'}
            </button>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between gap-10">
          <div>
            <h4 className="text-xl font-black italic uppercase text-slate-900 tracking-widest mb-6">Service Actif</h4>
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-50">
              <div className="flex items-center gap-4">
                <div className={`w-3.5 h-3.5 rounded-full ${restoData?.status === 'open' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse shadow-sm`} />
                <span className="font-black italic uppercase text-xs text-slate-900 tracking-tight">{restoData?.status === 'open' ? 'En Service' : 'Fermé'}</span>
              </div>
              <button 
                onClick={toggleStatus}
                className="text-[10px] font-black text-[#ff385c] uppercase hover:underline tracking-widest italic"
              >
                MODIFIER
              </button>
            </div>
          </div>

          {restoData?.aiMenuAdvice && (
            <div className="p-6 bg-[#ff385c]/5 border border-[#ff385c]/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#ff385c]" />
                <h5 className="text-[10px] font-black uppercase tracking-widest text-[#ff385c]">CONSEIL_IA</h5>
              </div>
              <p className="text-xs text-slate-500 italic leading-relaxed">
                {restoData.aiMenuAdvice}
              </p>
            </div>
          )}
          
          <div className="pt-8 border-t border-slate-50">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">OPÉRATEUR</p>
            <p className="font-black italic text-slate-900 uppercase tracking-tight">{user?.email}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function KYCManager({ user }: { user: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      setProfile(snapshot.data());
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const updateKYC = async (field: string) => {
    const url = prompt(`URL pour ${field} ? (Simulé pour la démo)`) || 'https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=200';
    if (!user?.uid) return;
    await updateDoc(doc(db, 'users', user.uid), {
      [`kyc.${field}`]: url,
      'kyc.status': 'pending',
      updatedAt: serverTimestamp()
    });
  };

  const docs = [
    { key: 'idCardUrl', label: 'Pièce d\'identité', icon: ShieldCheck },
    { key: 'kbizUrl', label: 'Extrait KBIS', icon: FileText },
    { key: 'insuranceUrl', label: 'Assurance Professionnelle', icon: FileCheck },
    { key: 'ibanUrl', label: 'Relevé d\'Identité Bancaire (RIB)', icon: CreditCard },
  ];

  if (loading) return <div>Chargement...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Dossier de Conformité</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Gérez vos documents légaux pour LetsGoFood</p>
        </div>
        <div className={`px-6 py-3 rounded-full font-black italic text-xs uppercase tracking-widest shadow-sm ${
          profile?.kyc?.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
          profile?.kyc?.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
        }`}>
          STATUT : {profile?.kyc?.status || 'NON SOUMIS'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {docs.map((doc) => (
          <div key={doc.key} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm group hover:border-[#ff385c]/20 transition-all flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-8">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <doc.icon className="w-6 h-6 text-slate-400 group-hover:text-[#ff385c] transition-colors" />
              </div>
              {profile?.kyc?.[doc.key] ? (
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-black italic uppercase tracking-tight text-slate-900 mb-2">{doc.label}</h3>
              <p className="text-xs text-slate-400 font-medium mb-8">Document requis pour la validation de votre compte commerçant.</p>
              
              {profile?.kyc?.[doc.key] && (
                <div className="w-full h-32 bg-slate-50 rounded-2xl mb-6 overflow-hidden border border-slate-100 relative group/img">
                  <img src={profile.kyc[doc.key]} alt="" className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-slate-900/10 backdrop-blur-sm">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Voir le document</span>
                  </div>
                </div>
              )}

              <button 
                onClick={() => updateKYC(doc.key)}
                className="w-full py-4 bg-slate-50 hover:bg-slate-900 hover:text-white transition-all text-slate-900 rounded-2xl text-[10px] font-black italic uppercase tracking-widest border border-slate-100"
              >
                {profile?.kyc?.[doc.key] ? 'MODIFIER LE FICHIER' : 'AJOUTER UN DOCUMENT'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {profile?.kyc?.status === 'rejected' && (
        <div className="p-8 bg-red-50 border border-red-100 rounded-[2.5rem] flex items-start gap-6">
          <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
          <div>
            <h4 className="text-red-600 font-black italic uppercase text-sm tracking-widest mb-1">Dossier Rejeté</h4>
            <p className="text-red-500/70 text-xs font-bold">{profile.kyc.rejectionReason || 'Vos documents ne sont pas conformes. Veuillez les mettre à jour.'}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Dashboard() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
       <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm min-h-[400px]">
          <h3 className="text-lg md:text-xl font-black mb-10 italic uppercase tracking-widest text-[#ff385c]">Performance (Ventes)</h3>
          <div className="h-64 md:h-80 w-full anonymous-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff385c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ff385c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.2)' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 25px 50px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#0f172a' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#ff385c" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
       </div>
       <div className="bg-slate-900 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] text-white flex flex-col justify-between shadow-xl">
          <div>
            <Sparkles className="w-8 h-8 text-[#ff385c] mb-6" />
            <h3 className="text-xl font-black italic mb-6 uppercase tracking-widest">Optimisation IA</h3>
            <p className="text-white/40 text-[13px] leading-relaxed mb-8 uppercase italic tracking-tight">
              Vos ventes de "Burgers" ont augmenté de 15% ce weekend. Suggérez un menu groupé pour optimiser votre rentabilité.
            </p>
          </div>
          <button className="w-full py-5 bg-white text-slate-900 font-black italic rounded-2xl text-[10px] md:text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 uppercase tracking-widest">
            ANALYSES_PRO
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
  const [aiError, setAiError] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    if (!restaurantId) return;
    const q = query(collection(db, 'restaurants', restaurantId, 'menuItems'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `restaurants/${restaurantId}/menuItems`);
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const getAiAdvice = async () => {
    if (!restaurantId || items.length === 0) {
      setAiError("Ajoutez des articles à votre menu avant de demander une analyse.");
      return;
    }
    setAiLoading(true);
    setAiError('');
    setAiAdvice('');
    
    try {
      const advice = await optimizeMenuPrices(items.map(item => ({
        name: item.name,
        price: item.price,
        category: item.category
      })));
      
      setAiAdvice(advice);

      // Store in merchant settings
      await updateDoc(doc(db, 'restaurants', restaurantId), {
        aiMenuAdvice: advice,
        aiAdviceAt: serverTimestamp()
      });
    } catch (e: any) {
      setAiError(e.message || "Impossible de contacter le Kernel IA.");
    } finally {
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
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-slate-900">Carte & Menu</h2>
          <p className="text-slate-300 text-[10px] md:text-xs mt-1 uppercase font-bold tracking-widest italic">Édition en temps réel</p>
        </div>
        <div className="grid grid-cols-2 lg:flex gap-3 md:gap-4 w-full md:w-auto">
          <button 
            onClick={getAiAdvice}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 border border-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-all text-xs shadow-sm"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#ff385c]" />}
            CONSEIL IA
          </button>
          <button 
            onClick={addItem}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#ff385c] text-white font-black italic rounded-2xl hover:scale-105 active:scale-95 transition-all text-[10px] md:text-xs shadow-lg shadow-[#ff385c]/20 uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            AJOUTER
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {aiAdvice && (
          <motion.div 
            key="advice"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-8 md:mb-12 p-6 md:p-8 bg-emerald-50 border border-emerald-100 rounded-[2rem] relative"
          >
            <button onClick={() => setAiAdvice('')} className="absolute top-4 right-4 text-emerald-300 hover:text-emerald-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
            <h4 className="text-emerald-600 font-black flex items-center gap-2 mb-4 italic uppercase text-[10px] tracking-widest">
              <Sparkles className="w-4 h-4" /> RECOMMANDATION IA
            </h4>
            <div className="text-emerald-700 text-xs md:text-sm leading-relaxed italic font-medium">{aiAdvice}</div>
          </motion.div>
        )}

        {aiError && (
          <motion.div 
            key="error"
            initial={{ height: 0, opacity: 0, scale: 0.95 }}
            animate={{ height: 'auto', opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.95 }}
            className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4"
          >
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-red-500 font-black italic uppercase text-[10px] tracking-widest mb-1">Erreur Sync</h4>
              <p className="text-red-500/80 text-xs font-bold">{aiError}</p>
            </div>
            <button onClick={() => setAiError('')} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-20 text-slate-100 font-black italic uppercase tracking-widest">Initialisation...</div>
        ) : items.map((item) => (
          <div key={item.id} className="p-4 md:p-6 rounded-[2rem] bg-white border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:shadow-xl transition-all h-full">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative shadow-sm">
                <img 
                  src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200`} 
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/10" />
              </div>
              <div>
                <h4 className="text-lg font-black italic tracking-tight text-slate-900 uppercase leading-none mb-2">{item.name}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">{item.category}</span>
                  <span className="w-1 h-1 bg-slate-100 rounded-full" />
                  <span className="text-[#ff385c] font-black italic text-base">€{item.price?.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 sm:opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => startEdit(item)}
                className="flex-1 sm:flex-none p-4 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => deleteItem(item.id)}
                className="flex-1 sm:flex-none p-4 bg-red-50 text-red-300 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="text-center py-20 text-slate-100 font-black italic border-2 border-dashed border-slate-100 rounded-[3rem] uppercase tracking-widest">
            Aucun article disponible
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
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
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
      <h2 className="text-xl md:text-2xl font-black italic mb-10 md:mb-12 uppercase tracking-tighter text-slate-900 border-b border-slate-100 pb-6">Commandes Live</h2>
      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {orders.map((order) => (
          <div key={order.id} className={`p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border transition-all shadow-sm h-full ${order.status === 'pending' ? 'bg-[#ff385c]/5 border-[#ff385c]/20' : 'bg-white border-slate-100'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-3">
                   <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-slate-900">#{order.id.slice(-4).toUpperCase()}</h3>
                   <span className={`px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
                     order.status === 'pending' ? 'bg-[#ff385c] text-white' : 'bg-slate-900 text-white'
                   }`}>
                     {order.status}
                   </span>
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">{order.clientName}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl md:text-3xl font-black italic text-[#ff385c]">€{order.total?.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-3 mb-10 max-h-48 overflow-y-auto pr-4 scrollbar-hide border-y border-slate-50 py-6">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-[11px] md:text-xs">
                  <span className="text-slate-500 font-black italic tracking-tight uppercase">1x {item.name}</span>
                  <span className="text-slate-300 font-black italic">€{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {order.status === 'pending' && (
                <button 
                  onClick={() => updateStatus(order.id, 'accepted')}
                  className="w-full sm:flex-1 py-4 md:py-5 bg-slate-900 text-white font-black italic rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10"
                >
                  <CheckCircle className="w-5 h-5" /> ACCEPTER
                </button>
              )}
              {order.status === 'accepted' && (
                <button 
                  onClick={() => updateStatus(order.id, 'preparing')}
                  className="w-full sm:flex-1 py-4 md:py-5 bg-[#ff385c] text-white font-black italic rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-lg"
                >
                  CUISINE
                </button>
              )}
               {order.status === 'preparing' && (
                <button 
                  onClick={() => updateStatus(order.id, 'ready')}
                  className="w-full sm:flex-1 py-4 md:py-5 bg-emerald-500 text-white font-black italic rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-lg"
                >
                  PRÊT
                </button>
              )}
              <button 
                onClick={() => updateStatus(order.id, 'cancelled')}
                className="w-full sm:w-auto px-8 py-4 md:py-5 border border-slate-100 text-slate-300 font-black italic text-[10px] md:text-xs rounded-2xl hover:text-red-500 hover:border-red-100 transition-all uppercase tracking-widest"
              >
                ANNULER
              </button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="p-20 md:p-32 rounded-[3rem] bg-white border border-dashed border-slate-200 text-center shadow-sm">
            <ClipboardList className="w-12 h-12 text-slate-100 mx-auto mb-6" />
            <p className="text-slate-300 font-black italic uppercase tracking-widest text-sm italic">File d'attente vide</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
