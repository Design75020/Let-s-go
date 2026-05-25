
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Utensils, ClipboardList, Settings, LogOut, 
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError } from '../../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// Shared UI components
import { SectionTitle } from '../../shared/ui';

// Tabs
import MerchantDashboard from './components/MerchantDashboard';
import MenuManager from './components/MenuManager';
import OrderMonitor from './components/OrderMonitor';
import KYCManager from './components/KYCManager';
import SettingsView from './components/SettingsView';

export default function MerchantApp() {
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
    <div className="flex min-h-screen bg-slate-50">
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
        <button onClick={logout} className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all mt-auto">
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Déconnexion</span>
        </button>
      </aside>

      <main className="flex-1 lg:ml-80 p-6 md:p-12 pb-32 lg:pb-12 text-slate-900">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase truncate max-w-[400px] text-slate-900">{restoData?.name || 'Chargement...'}</h1>
            <p className="text-slate-300 text-[10px] md:text-xs font-black tracking-widest mt-2 uppercase italic">NODE_SYNC • MERCHANT_v10</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-6 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
                <span className="text-slate-300 text-[9px] font-black uppercase tracking-widest block mb-1">LIVE REVENUE</span>
                <span className="text-xl md:text-2xl font-black italic text-slate-900">1,240.50€</span>
             </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <MerchantDashboard />}
          {activeTab === 'menu' && <MenuManager restaurantId={user?.uid} />}
          {activeTab === 'orders' && <OrderMonitor restaurantId={user?.uid} />}
          {activeTab === 'kyc' && <KYCManager user={user} />}
          {activeTab === 'settings' && <SettingsView restoData={restoData} user={user} />}
        </AnimatePresence>
      </main>
    </div>
  );
}
