import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingBag, Utensils, Truck, Users, 
  Wallet, Receipt, BookOpen, Megaphone, HelpCircle, 
  Settings, CreditCard, Map, Percent, Scale, Package, 
  Bell, Search, Calendar, ChevronDown, MoreVertical, 
  ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, 
  CheckCircle2, XCircle, Globe, LogOut, Edit2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, limit, orderBy } from 'firebase/firestore';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

const lineData = [
  { day: '01/05', orders: 150 },
  { day: '06/05', orders: 200 },
  { day: '11/05', orders: 180 },
  { day: '15/05', orders: 280 },
  { day: '21/05', orders: 220 },
  { day: '26/05', orders: 300 },
  { day: '31/05', orders: 250 },
];

const pieData = [
  { name: 'Livrées', value: 1842, color: '#10b981' },
  { name: 'En préparation', value: 324, color: '#f59e0b' },
  { name: 'En livraison', value: 210, color: '#3b82f6' },
  { name: 'Annulées', value: 82, color: '#ef4444' },
];

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('Supervision Kernel');
  const { user, logout } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-slate-900 text-slate-400 flex-col fixed h-full z-30 shadow-2xl">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black italic">LG</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white leading-none">LetsGoFood</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">CRM PLATFORM</p>
            </div>
          </div>

          <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 px-4">Menu Principal</div>
          
          <nav className="space-y-1">
            {[
              { label: 'Supervision Kernel', icon: LayoutDashboard },
              { label: 'Applications Core', icon: Package },
              { label: 'Plateforme Client (Live)', icon: Globe },
              { label: 'Merchant Interface', icon: Utensils },
              { label: 'Driver Dispatch', icon: Truck },
              { label: 'SaaS Control Tower', icon: Settings },
              { label: 'CRM & Sales', icon: Wallet },
              { label: 'Acquisition (Marketing)', icon: Megaphone },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  activeTab === item.label 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8 px-8 pb-8">
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 px-4">Système & Support</div>
          <nav className="space-y-1">
            {[
              { label: 'Support Technique', icon: HelpCircle },
              { label: 'Configuration Platform', icon: Scale },
            ].map((item) => (
              <button 
                key={item.label} 
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                  activeTab === item.label ? 'text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setActiveTab(item.label)}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-bold">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5 space-y-4">
          <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5 group hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">Mode de test</p>
                <p className="text-[8px] font-medium text-slate-500">Kernel Sandbox</p>
              </div>
            </div>
            <div className="w-10 h-5 bg-blue-500 rounded-full p-1 flex justify-end">
              <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
            </div>
          </div>

          <div 
            onClick={logout}
            className="flex items-center gap-4 py-4 cursor-pointer group hover:bg-white/5 px-4 rounded-xl transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white overflow-hidden group-hover:border-blue-500/50 transition-all flex-shrink-0">
               {user?.photoURL ? <img src={user.photoURL} alt="" /> : <span className="text-xs font-black">Admin</span>}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-white truncate">{user?.name || 'LGF Admin'}</p>
               <p className="text-[10px] font-medium text-slate-500 truncate">{user?.email}</p>
            </div>
            <LogOut className="w-4 h-4 text-slate-600 group-hover:text-red-500" />
          </div>
        </div>
      </aside>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-white/5 px-4 md:px-6 py-3 flex items-center justify-between">
        {[
          { label: 'Supervision', icon: LayoutDashboard, tab: 'Supervision Kernel' },
          { label: 'Live', icon: Globe, tab: 'Plateforme Client (Live)' },
          { label: 'Merchant', icon: Utensils, tab: 'Merchant Interface' },
          { label: 'SaaS', icon: Settings, tab: 'SaaS Control Tower' },
          { label: 'Logout', icon: LogOut, action: logout },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => item.action ? item.action() : setActiveTab(item.tab || '')}
            className={`p-3 md:p-4 rounded-xl transition-all ${
              activeTab === item.tab
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'text-slate-500 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 md:p-10 pb-24 md:pb-32 lg:pb-10 bg-[#f8fafc]">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{activeTab}</h1>
            <p className="text-xs md:text-sm font-medium text-slate-400 mt-1">Vue d'ensemble de votre activité</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none flex items-center gap-3 px-3 md:px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-[10px] md:text-sm font-bold text-slate-600 truncate">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              01/05/2025 - 31/05/2025
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </div>
            <button className="relative p-2.5 md:p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex-shrink-0">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] md:text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#f8fafc]">12</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Supervision Kernel' ? (
              <KernelOverview recentOrders={recentOrders} />
            ) : activeTab === 'SaaS Control Tower' ? (
              <SaaSControl />
            ) : activeTab === 'Applications Core' ? (
              <AppsCore />
            ) : activeTab === 'Merchant Interface' ? (
              <MerchantInterface />
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                 <Globe className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                 <h2 className="text-xl font-bold mb-2">Module en cours de déploiement</h2>
                 <p className="text-slate-400 text-sm">La section {activeTab} est en cours de synchronisation avec le Kernel.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function AppsCore() {
  const apps = [
    { name: 'Storefront Mobile', status: 'Online', version: '2.4.1', users: '12k+' },
    { name: 'Merchant POS', status: 'Online', version: '1.9.0', users: '840' },
    { name: 'Logistics Engine', status: 'Standby', version: '3.0.2', users: 'N/A' },
    { name: 'Payment Gateway', status: 'Online', version: '2.1.1', users: 'Global' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {apps.map((app, i) => (
        <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className={`px-2 py-1 rounded text-[8px] font-black uppercase ${app.status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {app.status}
            </div>
            <Package className="w-4 h-4 text-slate-300" />
          </div>
          <h4 className="font-bold mb-1">{app.name}</h4>
          <p className="text-[10px] text-slate-400 mb-4">v{app.version}</p>
          <div className="flex justify-between items-end">
            <span className="text-xs font-black text-slate-500">{app.users} users</span>
            <button className="text-[10px] font-black text-blue-500 hover:underline" onClick={() => alert('Rebooting ' + app.name)}>REBOOT</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MerchantInterface() {
  return (
    <div className="p-8 bg-white border border-slate-200 rounded-[2rem]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-bold">Base Restaurateurs</h3>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold" onClick={() => alert('Invitation envoyée.')}>INVITER UN PARTENAIRE</button>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                <Utensils className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold">Brasserie de Paris #{i}</p>
                <p className="text-[10px] text-slate-500">Dernière activité: il y a 2h</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-slate-400" /></button>
              <button className="p-2 hover:bg-red-50 rounded-lg transition-colors"><XCircle className="w-4 h-4 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KernelOverview({ recentOrders }: { recentOrders: any[] }) {
  return (
    <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-10">
          {[
            { label: 'Commandes', value: '2 458', trend: '+ 18%', icon: ShoppingBag, color: 'text-green-500', iconBg: 'bg-green-500' },
            { label: "C.A. Brut", value: '€ 56 420', trend: '+ 21%', icon: Wallet, color: 'text-purple-500', iconBg: 'bg-purple-500' },
            { label: 'Plateforme', value: '€ 6 320', trend: '+ 15%', icon: CreditCard, color: 'text-orange-500', iconBg: 'bg-orange-500' },
            { label: 'Restaurants', value: '128', trend: '+ 9%', icon: Utensils, color: 'text-blue-500', iconBg: 'bg-blue-500' },
            { label: 'Livreurs', value: '312', trend: '+ 11%', icon: Truck, color: 'text-emerald-500', iconBg: 'bg-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="p-4 md:p-6 bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] shadow-sm group hover:border-blue-500/30 transition-all">
              <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.iconBg} rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 text-white shadow-lg`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{stat.label}</p>
              <h4 className="text-lg md:text-2xl font-black tracking-tight text-slate-900 mb-1 md:mb-2">{stat.value}</h4>
              <div className="flex items-center gap-1">
                <ArrowUpRight className={`w-3 h-3 ${stat.color}`} />
                <span className={`text-[9px] md:text-[10px] font-black ${stat.color}`}>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 xl:col-span-8 p-6 md:p-8 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-lg md:text-xl font-bold tracking-tight">Commandes par jour</h3>
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Par jour <ChevronDown className="w-3 h-3 opacity-40" />
              </div>
            </div>
            <div className="h-64 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} 
                    activeDot={{ r: 5, strokeWidth: 0, fill: '#1e40af' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 p-6 md:p-8 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-sm flex flex-col items-center">
            <h3 className="text-lg md:text-xl font-bold tracking-tight mb-8 w-full text-left">Répartition</h3>
            <div className="flex-1 relative flex items-center justify-center min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xl font-black tracking-tight">2 458</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8 w-full">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold text-slate-400 truncate uppercase tracking-tighter">{item.name}</p>
                    <p className="text-[10px] font-black italic">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 xl:col-span-8 p-6 md:p-8 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg md:text-xl font-bold tracking-tight">Commandes récentes</h3>
               <button className="text-blue-500 text-xs font-bold hover:underline uppercase tracking-widest">Tout voir</button>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-4">Commande</th>
                    <th className="pb-4">Restaurant</th>
                    <th className="pb-4">Statut</th>
                    <th className="pb-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((order, i) => (
                    <tr key={i} className="text-xs">
                      <td className="py-4 font-bold text-slate-500">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="py-4 font-bold">{order.restaurantName || 'Resto LGF'}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-blue-100 text-blue-700">{order.status}</span>
                      </td>
                      <td className="py-4 font-black text-right">€ {order.total?.toFixed(2)}</td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && [1,2,3].map(i => (
                    <tr key={i} className="text-xs">
                      <td className="py-4 font-bold text-slate-500">#CMD-0{i}</td>
                      <td className="py-4 font-bold">Demo Resto</td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-green-100 text-green-700">DÉLIVRÉ</span>
                      </td>
                      <td className="py-4 font-black text-right">€ 24.50</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 p-6 md:p-8 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
             <h3 className="text-lg md:text-xl font-bold tracking-tight mb-8">Alertes</h3>
             <div className="space-y-6">
                {[
                  { title: 'Payouts échoués', type: 'error', icon: AlertTriangle },
                  { title: 'KYC en attente', type: 'warning', icon: AlertTriangle },
                ].map((alert, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                      <alert.icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold">{alert.title}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
    </>
  );
}

function SaaSControl() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Configuration SaaS mise à jour dans le Kernel.');
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
        <h3 className="text-xl font-bold mb-6 italic">Variables Plateforme</h3>
        <div className="space-y-4">
          {[
            { label: 'Commission Restaurant (%)', val: '15' },
            { label: 'Frais Client Fixe (€)', val: '1.50' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
               <span className="text-xs font-bold text-slate-500">{item.label}</span>
               <input type="text" defaultValue={item.val} className="w-16 bg-white border rounded px-2 py-1 text-right font-black" />
            </div>
          ))}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-blue-500 text-white font-black italic rounded-xl mt-4 disabled:opacity-50"
          >
            {saving ? 'SYNCHRONISATION...' : 'SAUVEGARDER'}
          </button>
        </div>
      </div>
      <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold mb-6 italic text-blue-400">Maintenance</h3>
          <p className="text-slate-500 text-xs mb-6">Purger le cache du Kernel réinitialise les statistiques en temps réel pour tous les terminaux actifs.</p>
        </div>
        <button 
          onClick={() => alert("Cache Kernel purgé avec succès.")}
          className="w-full py-4 bg-white/5 border border-white/10 text-white font-black italic rounded-xl hover:bg-white/10 transition-all"
        >
          PURGER LE CACHE
        </button>
      </div>
    </div>
  );
}
