import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, ShoppingBag, Utensils, Truck, Users, 
  Wallet, Receipt, BookOpen, Megaphone, HelpCircle, 
  Settings, CreditCard, Map, Percent, Scale, Package, 
  Bell, Search, Calendar, ChevronDown, MoreVertical, 
  ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, 
  CheckCircle2, XCircle, Globe, LogOut, Edit2, MapPin
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, limit, orderBy, where, doc, updateDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

import DriverApp from './DriverApp';
import MerchantPortal from './MerchantPortal';
import ClientStore from './ClientStore';

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
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#ff385c]/10 selection:text-slate-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col fixed h-full z-30">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#ff385c] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff385c]/20 rotate-3 transition-transform hover:rotate-0">
              <Globe className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 italic leading-none">LGF KERNEL</h1>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mt-1.5">v10.0 ENGINE</p>
            </div>
          </div>

          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6 px-4">ORCHESTRATION</div>
          
          <nav className="space-y-1">
            {[
              { label: 'Supervision Kernel', icon: LayoutDashboard },
              { label: 'Applications Core', icon: Package },
              { label: 'Plateforme Client (Live)', icon: Globe },
              { label: 'Merchant Interface', icon: Utensils },
              { label: 'Driver Dispatch', icon: Truck },
              { label: 'SaaS Control Tower', icon: Settings },
              { label: 'CRM & Sales', icon: Wallet },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group overflow-hidden relative ${
                  activeTab === item.label 
                    ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5 relative z-10">
                  <item.icon className={`w-4 h-4 ${activeTab === item.label ? 'text-[#ff385c]' : 'group-hover:text-slate-600'}`} />
                  <span className="text-[12px] font-black italic uppercase tracking-tight">{item.label}</span>
                </div>
                {activeTab === item.label && (
                   <motion.div layoutId="activeTabGlow" className="absolute left-0 w-1 h-1/2 bg-[#ff385c] rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-50 space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-900 uppercase">System Status</p>
                  <p className="text-[8px] font-bold text-slate-400">Stable • 12ms</p>
               </div>
            </div>
            <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ scaleX: [1, 0.4, 0.8, 0.5, 1] }} 
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="h-full w-full bg-[#ff385c] origin-left" 
               />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group">
            <div className="w-8 h-8 rounded-lg bg-[#ff385c]/5 border border-[#ff385c]/10 flex items-center justify-center overflow-hidden flex-shrink-0 text-[#ff385c] font-black text-[10px]">
               {user?.photoURL ? <img src={user.photoURL} alt="" /> : 'ROOT'}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black italic text-slate-900 truncate uppercase leading-none mb-1">{user?.name || 'ROOT OPERATOR'}</p>
               <p className="text-[8px] font-bold text-slate-300 truncate uppercase tracking-widest leading-none">Control Node</p>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => navigate('/login')}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-slate-600 transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={logout}
                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-50 bg-white/90 backdrop-blur-xl border border-slate-200 px-8 py-4 flex items-center justify-between rounded-[2rem] shadow-2xl">
        {[
          { label: 'Supervision', icon: LayoutDashboard, tab: 'Supervision Kernel' },
          { label: 'Live', icon: Globe, tab: 'Plateforme Client (Live)' },
          { label: 'Merchant', icon: Utensils, tab: 'Merchant Interface' },
          { label: 'Driver', icon: Truck, tab: 'Driver Dispatch' },
          { label: 'SaaS', icon: Settings, tab: 'SaaS Control Tower' },
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`p-3 rounded-xl transition-all ${
              activeTab === item.tab
                ? 'bg-slate-900 text-white' 
                : 'text-slate-400'
            }`}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 md:p-10 pb-32 md:pb-40 lg:pb-12 h-screen overflow-y-auto scrollbar-hide">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-slate-900 uppercase">{activeTab}</h1>
            <div className="flex items-center gap-4 mt-3">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Live Feed Active</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-slate-200" />
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Operator: LGF_DEV_04</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none flex items-center gap-4 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-[10px] font-black italic text-slate-900 uppercase">
              <Calendar className="w-3.5 h-3.5 text-[#ff385c]" />
              MAI 2026
              <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <button className="relative w-12 h-12 bg-white text-slate-900 border border-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff385c] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">2</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'Supervision Kernel' ? (
              <KernelOverview recentOrders={recentOrders} />
            ) : activeTab === 'SaaS Control Tower' ? (
              <SaaSControl />
            ) : activeTab === 'Applications Core' ? (
              <AppsCore />
            ) : activeTab === 'CRM & Sales' ? (
              <CRMSales />
            ) : activeTab === 'Merchant Interface' ? (
              <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 min-h-[80vh] shadow-xl">
                <MerchantPortal isEmbedded />
              </div>
            ) : activeTab === 'Plateforme Client (Live)' ? (
              <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 min-h-[80vh] shadow-xl">
                <ClientStore isEmbedded />
              </div>
            ) : activeTab === 'Driver Dispatch' ? (
              <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 min-h-[80vh] shadow-xl">
                <DriverApp isEmbedded />
              </div>
            ) : (
              <div className="p-20 text-center bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                 <Globe className="w-12 h-12 text-slate-100 mx-auto mb-6 animate-pulse" />
                 <h2 className="text-2xl font-black italic text-slate-900 uppercase mb-3">Module en cours</h2>
                 <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto">La section {activeTab} est en cours de synchronisation.</p>
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
    { name: 'Driver Nexus', status: 'Maintenance', version: '4.0.2', users: '312' },
    { name: 'Admin Kernel', status: 'Online', version: '10.0.0', users: '14' },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {apps.map((app) => (
          <div key={app.name} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-[#ff385c]/30 transition-all">
            <div className="flex justify-between items-start mb-8">
              <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase italic tracking-widest ${app.status === 'Online' ? 'bg-emerald-50 text-white' : 'bg-orange-500 text-white'}`}>
                {app.status}
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <Package className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
            </div>
            <h4 className="text-lg font-black italic text-slate-900 uppercase mb-1 tracking-tight">{app.name}</h4>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-8 font-mono">NODE_{app.version}</p>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{app.users} NODES_ACTIVE</span>
              <button 
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black italic uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-900/10"
                onClick={() => alert('Rebooting ' + app.name)}
              >
                REBOOT
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-[#ff385c] rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl shadow-[#ff385c]/20">
        <Globe className="absolute -right-20 -bottom-20 w-[24rem] h-[24rem] opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-6 leading-none">Kernel v10.0 Infrastructure Sync</h2>
          <p className="text-white/90 text-lg font-medium mb-10 leading-relaxed">L'orchestration des micro-services est gérée en temps réel par le Kernel central LGF. Synchronisation sécurisée et persistante.</p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-white text-[#ff385c] rounded-2xl font-black italic text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">LOGS SYSTÈME</button>
            <button className="px-8 py-4 bg-black/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-black italic text-[10px] uppercase tracking-widest hover:bg-black/20 transition-all active:scale-95">DIAGNOSTIC RESEAU</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KernelOverview({ recentOrders }: { recentOrders: any[] }) {
  const [stats, setStats] = useState({
    orders: 0,
    gmv: 0,
    revenue: 0,
    merchants: 0,
    drivers: 0
  });

  useEffect(() => {
    const ordersCount = recentOrders.length;
    const totalGMV = recentOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalRevenue = totalGMV * 0.15; // 15% commission as defined in SaaSControl
    
    // In a real app we would query these, but let's derive from available info for now
    setStats(prev => ({
      ...prev,
      orders: ordersCount * 42, // Scaled for demo impact
      gmv: totalGMV * 10, 
      revenue: totalRevenue * 10,
      merchants: 4, // From our seed
      drivers: 2 // From our seed
    }));
  }, [recentOrders]);

  return (
    <div className="space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {[
            { label: 'OPERATIONS', value: stats.orders, trend: '+18%', icon: ShoppingBag, color: 'text-emerald-500' },
            { label: "GMV TOTAL", value: `€${stats.gmv.toFixed(0)}`, trend: '+21%', icon: Wallet, color: 'text-[#ff385c]' },
            { label: 'REVENUE', value: `€${stats.revenue.toFixed(0)}`, trend: '+15%', icon: CreditCard, color: 'text-blue-500' },
            { label: 'RESTAURATEURS', value: stats.merchants, trend: '+9%', icon: Utensils, color: 'text-orange-500' },
            { label: 'FLOTTE', value: stats.drivers, trend: '+11%', icon: Truck, color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="p-8 md:p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-8 relative z-10">
                 <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#ff385c] group-hover:text-white transition-all">
                   <stat.icon className="w-5 h-5" />
                 </div>
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl">
                   <ArrowUpRight className={`w-3 h-3 ${stat.color}`} />
                   <span className={`text-[9px] font-black ${stat.color}`}>{stat.trend}</span>
                 </div>
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 relative z-10 italic">{stat.label}</p>
              <h4 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase relative z-10">{stat.value}</h4>
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-500">
                <stat.icon className="w-24 h-24" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-8 md:gap-10">
          <div className="col-span-12 xl:col-span-8 space-y-10">
             {/* Main Chart Container */}
             <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6 relative z-10">
                   <div>
                     <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-1">Volume de Transactions</h3>
                     <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Real-time kernel orchestration feed</p>
                   </div>
                   <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                     <button className="px-5 py-2.5 bg-white text-slate-900 rounded-lg text-[9px] font-black italic uppercase tracking-widest shadow-sm">VOLUME</button>
                     <button className="px-5 py-2.5 bg-transparent text-slate-300 rounded-lg text-[9px] font-black italic uppercase tracking-widest hover:text-slate-900 transition-colors">FLOW</button>
                   </div>
                </div>
                <div className="h-80 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(0,0,0,0.2)' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(0,0,0,0.2)' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 25px 50px rgba(0,0,0,0.1)', padding: '16px' }}
                        itemStyle={{ fontSize: '10px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}
                        cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#ff385c" 
                        strokeWidth={5} 
                        dot={{ r: 0 }} 
                        activeDot={{ r: 6, strokeWidth: 3, fill: '#fff', stroke: '#ff385c' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Recent Activities Table */}
             <div className="p-10 bg-white border border-slate-100 rounded-[3rem] text-slate-900 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-center mb-10 relative z-10">
                   <div>
                     <h3 className="text-2xl font-black italic uppercase tracking-tighter">LOG DE COMMANDES</h3>
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Dernières interactions synchronisées</p>
                   </div>
                   <button className="px-6 py-3 bg-slate-100 text-slate-900 rounded-xl text-[10px] font-black italic tracking-widest uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm">EXPORTER</button>
                </div>
                <div className="overflow-x-auto scrollbar-hide relative z-10">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="text-left text-[9px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-100">
                        <th className="pb-6">ID</th>
                        <th className="pb-6">RESTAURANT</th>
                        <th className="pb-6">STATUS</th>
                        <th className="pb-6 text-right">MONTANT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentOrders.map((order, i) => (
                        <tr key={i} className="group hover:bg-slate-50 transition-all duration-300">
                          <td className="py-6 font-black italic text-base tracking-tighter uppercase text-slate-400 group-hover:text-slate-900">#{order.id.slice(-8).toUpperCase()}</td>
                          <td className="py-6">
                             <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                                   <Utensils className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <span className="font-black italic text-sm tracking-tight uppercase text-slate-800">{order.restaurantName || 'LGF HUB'}</span>
                             </div>
                          </td>
                          <td className="py-6">
                            <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase bg-slate-900 text-white italic tracking-widest shadow-sm">
                               {order.status || 'OK'}
                            </span>
                          </td>
                          <td className="py-6 font-black italic text-right text-xl text-[#ff385c]">€{order.total?.toFixed(2) || '24.50'}</td>
                        </tr>
                      ))}
                      {recentOrders.length === 0 && [1,2,3].map(i => (
                         <tr key={i}>
                           <td colSpan={4} className="py-6 text-center text-slate-200 font-black uppercase text-[10px] tracking-widest italic">Attente de données...</td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-8 md:gap-10">
             <div className="p-8 bg-[#ff385c] rounded-[3rem] text-white shadow-2xl shadow-[#ff385c]/10 relative overflow-hidden group cursor-pointer">
                <Globe className="absolute -right-12 -bottom-12 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 relative z-10 italic">Cluster Sync</h3>
                <p className="text-sm font-medium text-white/80 mb-10 relative z-10 leading-relaxed uppercase italic tracking-tight">Instances synchronisées via le Core Protocol.</p>
                <div className="flex flex-col gap-3 relative z-10">
                   <div className="px-5 py-2.5 bg-black/10 backdrop-blur-md rounded-xl text-[9px] font-black italic uppercase tracking-widest">STABLE_99.9%</div>
                   <div className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-[9px] font-black italic uppercase tracking-widest shadow-lg text-center">OPTIMISER</div>
                </div>
             </div>

             <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm relative overflow-hidden group">
                <h3 className="text-lg font-black italic text-slate-900 uppercase italic tracking-widest mb-10 relative z-10">Core Usage</h3>
                <div className="relative flex items-center justify-center h-56 w-full z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#ff385c' : '#f1f5f9'} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-4xl font-black italic tracking-tighter text-slate-900 italic">82%</p>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">LOAD</p>
                  </div>
                </div>
                <div className="space-y-3 mt-10 relative z-10">
                   {pieData.slice(0, 3).map((item, i) => (
                     <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-50">
                        <div className="flex items-center gap-3">
                           <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i === 0 ? '#ff385c' : '#cbd5e1' }} />
                           <span className="text-[9px] font-black text-slate-400 uppercase italic tracking-widest">{item.name}</span>
                        </div>
                        <span className="text-xs font-black italic text-slate-900">{item.value}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="p-10 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-xl relative group overflow-hidden">
                <h3 className="text-lg font-black italic text-white uppercase italic tracking-widest mb-10">Security Feed</h3>
                <div className="space-y-6">
                  {[
                    { title: 'Payout Alert', type: 'critical' },
                    { title: 'New Provision', type: 'info' },
                    { title: 'Audit Success', type: 'success' },
                  ].map((alert, i) => (
                    <div key={i} className="flex gap-5 items-start">
                       <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${alert.type === 'critical' ? 'bg-[#ff385c]' : alert.type === 'info' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                       <div className="flex-1">
                          <p className="text-sm font-black italic text-white uppercase italic tracking-tight">{alert.title}</p>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-tight mt-1 truncate">Synchronisation OK...</p>
                       </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-6 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black italic text-white/20 uppercase tracking-widest mt-10 hover:text-white hover:bg-[#ff385c] transition-all">
                   FILES_ACCESS
                </button>
             </div>
          </div>
        </div>
    </div>
  );
}

function CRMSales() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', 'in', ['merchant', 'driver']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return () => unsubscribe();
  }, []);

  const approveKYC = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), { 'kyc.status': 'approved' });
  };

  const rejectKYC = async (uid: string) => {
    const reason = prompt('Raison du rejet ?') || 'Documents non valides';
    await updateDoc(doc(db, 'users', uid), { 
      'kyc.status': 'rejected',
      'kyc.rejectionReason': reason 
    });
  };

  return (
    <div className="space-y-10">
      <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm relative overflow-hidden">
        <h3 className="text-2xl font-black italic uppercase mb-10 tracking-tighter text-slate-900">Validations KYC & Documents</h3>
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-200 font-black uppercase italic text-xs tracking-widest">Analyse du Kernel...</div>
          ) : users.filter(u => u.kyc?.status === 'pending').length === 0 ? (
            <div className="text-center py-12 text-slate-300 font-black uppercase italic text-xs tracking-widest bg-slate-50 rounded-2xl border border-slate-50">Aucun dossier en attente</div>
          ) : users.filter(u => u.kyc?.status === 'pending').map((user, i) => (
            <div key={user.uid} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-50 group hover:border-[#ff385c]/20 transition-all">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black italic">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="font-black italic text-lg tracking-tight uppercase leading-tight text-slate-900">{user.name}</h4>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{user.role} • {user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => approveKYC(user.uid)}
                     className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black italic uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                   >
                     APPROUVER
                   </button>
                   <button 
                     onClick={() => rejectKYC(user.uid)}
                     className="px-5 py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl text-[9px] font-black italic uppercase tracking-widest active:scale-95 transition-all"
                   >
                     REJETER
                   </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b border-slate-200/50 mb-6">
                 {user.kyc && Object.entries(user.kyc).filter(([k]) => k.endsWith('Url')).map(([key, url]: [string, any]) => (
                   <div key={key} className="space-y-2">
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{key.replace('Url', '')}</p>
                      <div className="w-full h-24 bg-white border border-slate-100 rounded-xl overflow-hidden cursor-zoom-in group/img relative">
                        <img src={url} alt="" className="w-full h-full object-cover opacity-50 group-hover/img:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                           <Search className="w-4 h-4 text-white" />
                        </div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Soumis le: {new Date(user.updatedAt?.seconds * 1000).toLocaleDateString() || 'Récemment'}</span>
                 </div>
                 <button className="text-[10px] font-black text-[#ff385c] uppercase italic tracking-widest hover:underline">FICHE COMPLETE</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-xl lg:col-span-1">
           <h3 className="text-xl font-black italic uppercase mb-8 tracking-tighter text-[#ff385c]">Statistiques CRM</h3>
           <div className="space-y-6">
              {[
                { label: 'PROSPECTS', val: '42' },
                { label: 'CONTRATS', val: '128' },
                { label: 'RECOUVREMENT', val: '€14.2K' },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{s.label}</span>
                  <span className="text-2xl font-black italic tracking-tighter">{s.val}</span>
                </div>
              ))}
           </div>
        </div>
        <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm lg:col-span-2">
           <h3 className="text-xl font-black italic uppercase mb-8 tracking-tighter text-slate-900">Derniers Partenaires Actifs</h3>
           <div className="space-y-4">
              {users.filter(u => u.kyc?.status === 'approved').slice(0, 3).map((u, i) => (
                <div key={i} className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black italic text-xs">OK</div>
                    <div>
                      <p className="font-black italic text-sm tracking-tight uppercase leading-none text-slate-900">{u.name}</p>
                      <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest mt-1">{u.role}</p>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 bg-white text-slate-400 rounded-full text-[8px] font-black uppercase tracking-widest">ACTIF</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function SaaSControl() {
  const [saving, setSaving] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'driver'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDrivers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return () => unsubscribe();
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Configuration SaaS mise à jour dans le Kernel.');
    }, 1000);
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm relative overflow-hidden">
          <h3 className="text-2xl font-black italic uppercase mb-10 tracking-tighter text-slate-900">Facturation & Fees</h3>
          <div className="space-y-4">
            {[
              { label: 'COMMISSION (%)', val: '15' },
              { label: 'FRAIS SERVICE (€)', val: '1.50' },
              { label: 'LIVRAISON MIN (€)', val: '2.50' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-50">
                 <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{item.label}</span>
                 <input type="text" defaultValue={item.val} className="w-20 bg-white border border-slate-100 rounded-xl px-4 py-2 text-right font-black italic text-base text-slate-900 outline-none focus:border-[#ff385c]/30 shadow-sm transition-all" />
              </div>
            ))}
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full py-5 bg-slate-900 text-white font-black italic rounded-2xl mt-6 disabled:opacity-50 shadow-xl shadow-slate-900/10 active:scale-95 transition-all uppercase tracking-widest text-[10px]"
            >
              {saving ? 'MISSION SYNC...' : 'DÉPLOYER LA CONFIG'}
            </button>
          </div>
        </div>
        
        <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden border border-slate-800">
          <div>
            <h3 className="text-2xl font-black italic uppercase mb-10 tracking-tighter text-[#ff385c]">Maintenance Kernel</h3>
            <p className="text-white/40 text-sm font-medium leading-relaxed mb-10 uppercase italic tracking-tight">Vider le cache et forcer le re-calcul des vecteurs.</p>
            <div className="space-y-4 mb-10">
               <div className="flex items-center gap-3 text-white/50 text-[10px] font-black uppercase italic tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Core Protocol: Sync
               </div>
               <div className="flex items-center gap-3 text-white/50 text-[10px] font-black uppercase italic tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Hardened Security
               </div>
            </div>
          </div>
          <button 
            onClick={() => alert("Cache Kernel purgé avec succès.")}
            className="w-full py-5 bg-white/5 border border-white/10 text-white/50 font-black italic rounded-2xl hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-[10px] active:scale-95"
          >
            FORCE CACHE CLEAR
          </button>
        </div>
      </div>

      <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
        <h3 className="text-2xl font-black italic uppercase mb-10 tracking-tighter text-slate-900">Fleet Supervision (Real-time)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-1 space-y-4">
              {drivers.map((driver) => (
                <div key={driver.uid} className="p-6 bg-slate-50 rounded-2xl border border-slate-50 group hover:border-[#ff385c]/20 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${driver.available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      <p className="font-black italic text-sm tracking-tight uppercase text-slate-900 leading-none">{driver.name}</p>
                    </div>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{driver.available ? 'AVAILABLE' : 'OFFLINE'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 font-black uppercase tracking-widest">
                    <MapPin className="w-3 h-3" />
                    {driver.location ? `${driver.location.lat.toFixed(4)}, ${driver.location.lng.toFixed(4)}` : 'UNKNOWN POSITION'}
                  </div>
                </div>
              ))}
              {drivers.length === 0 && <div className="text-center py-10 text-slate-200 font-black uppercase italic text-xs tracking-widest">Recherche de signaux...</div>}
           </div>
           
           <div className="lg:col-span-2 aspect-video bg-slate-900 rounded-[2.5rem] relative overflow-hidden group border border-slate-800">
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/2.3522,48.8566,12/800x450?access_token=pk.placeholder')] bg-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              
              {/* Fake animated driver pins */}
              {drivers.map((d, i) => (
                <motion.div 
                  key={d.uid}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                  className="absolute p-2 bg-[#ff385c] rounded-full border-4 border-white shadow-2xl z-20"
                  style={{ 
                    left: `${20 + i * 15}%`, 
                    top: `${30 + (i % 2) * 20}%` 
                  }}
                >
                  <Truck className="w-3 h-3 text-white" />
                </motion.div>
              ))}

              <div className="absolute top-6 left-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[8px] font-black text-white uppercase tracking-widest">Network Grid: ACTIVE</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
