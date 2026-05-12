import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingBag, Utensils, Truck, Users, 
  Wallet, Receipt, BookOpen, Megaphone, HelpCircle, 
  Settings, CreditCard, Map, Percent, Scale, Package, 
  Bell, Search, Calendar, ChevronDown, MoreVertical, 
  ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, 
  CheckCircle2, XCircle, Globe, LogOut
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
  const [activeTab, setActiveTab] = useState('Tableau de bord');
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

        {/* Stats Grid */}
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

        {/* Charts & Notifications Row */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          {/* Main Chart */}
          <div className="col-span-12 xl:col-span-8 p-6 md:p-8 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-lg md:text-xl font-bold tracking-tight">Commandes par jour</h3>
              </div>
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Par jour <ChevronDown className="w-3 h-3 opacity-40" />
              </div>
            </div>
            
            <div className="h-64 md:h-80 w-full anonymous-chart">
               {/* Simplified chart for mobile performance if needed, but ResponsiveContainer should handle it */}
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

          {/* Distribution Chart */}
          <div className="col-span-12 xl:col-span-4 p-6 md:p-8 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-sm flex flex-col items-center">
            <h3 className="text-lg md:text-xl font-bold tracking-tight mb-8 w-full text-left">Répartition</h3>
            <div className="flex-1 relative flex items-center justify-center min-h-[200px]">
              <ResponsiveContainer width={200} height={200}>
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
              <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-center pointer-events-none">
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

        {/* Actionable Tables */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          {/* Left Table: Orders */}
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
                    <th className="pb-4">Client</th>
                    <th className="pb-4">Statut</th>
                    <th className="pb-4 text-right">Total</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.length > 0 ? recentOrders.map((order, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors text-xs">
                      <td className="py-4 font-bold text-slate-500">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="py-4 font-bold truncate max-w-[120px]">{order.restaurantName || 'Resto LGF'}</td>
                      <td className="py-4 font-medium text-slate-400 truncate max-w-[100px]">{order.clientName || 'Jean D.'}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 font-black text-right">€ {order.total?.toFixed(2) || '28.40'}</td>
                      <td className="py-4 text-right">
                         <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                         </button>
                      </td>
                    </tr>
                  )) : [1,2,3].map(i => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors text-xs">
                      <td className="py-4 font-bold text-slate-500">#CMD-024{i}</td>
                      <td className="py-4 font-bold">LGF Food</td>
                      <td className="py-4 font-medium text-slate-400">Client LGF</td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter bg-green-100 text-green-700">DÉLIVRÉ</span>
                      </td>
                      <td className="py-4 font-black text-right">€ 28.40</td>
                      <td className="py-4 text-right"><MoreVertical className="w-4 h-4 text-slate-400" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel: Alerts */}
          <div className="col-span-12 xl:col-span-4 p-6 md:p-8 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg md:text-xl font-bold tracking-tight">Alertes</h3>
                <button className="text-blue-500 text-xs font-bold hover:underline uppercase tracking-widest">Tout</button>
             </div>
             
             <div className="space-y-6">
                {[
                  { title: 'Payouts échoués', desc: '8 transferts ont échoué', type: 'error', icon: AlertTriangle, time: '5m' },
                  { title: 'KYC en attente', desc: '3 restaurants', type: 'warning', icon: AlertTriangle, time: '25m' },
                  { title: 'Nouveau resto', desc: '"Burger House"', type: 'info', icon: Bell, time: '1h' },
                  { title: 'Payouts ok', desc: '12 payouts traités', type: 'success', icon: CheckCircle2, time: '2h' },
                ].map((alert, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      alert.type === 'error' ? 'bg-red-50' : 
                      alert.type === 'warning' ? 'bg-orange-50' :
                      alert.type === 'success' ? 'bg-green-50' : 'bg-blue-50'
                    }`}>
                      <alert.icon className={`w-5 h-5 ${
                        alert.type === 'error' ? 'text-red-500' : 
                        alert.type === 'warning' ? 'text-orange-500' :
                        alert.type === 'success' ? 'text-green-500' : 'text-blue-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="text-[11px] md:text-sm font-bold text-slate-800 line-clamp-1 truncate">{alert.title}</p>
                        <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap ml-2">{alert.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{alert.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Second Table Row: Payouts */}
        <div className="grid grid-cols-1 gap-6 mb-10">
          <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold tracking-tight">Payouts</h3>
                <button className="text-blue-500 text-xs font-bold hover:underline tracking-widest uppercase">Tout voir</button>
             </div>
             <div className="overflow-x-auto scrollbar-hide">
               <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="pb-4">ID</th>
                      <th className="pb-4">Bénéficiaire</th>
                      <th className="pb-4">Montant</th>
                      <th className="pb-4">Statut</th>
                      <th className="pb-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                     {[
                       { id: 'PO-001254', name: 'Napoli', amount: '€ 320.00', status: 'Payé' },
                       { id: 'PO-001253', name: 'Sushi', amount: '€ 450.75', status: 'Payé' },
                       { id: 'PO-001252', name: 'Ahmed', amount: '€ 85.40', status: 'Payé' },
                     ].map((p, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 font-bold text-slate-500">{p.id}</td>
                        <td className="py-4 font-black truncate">{p.name}</td>
                        <td className="py-4 font-black">{p.amount}</td>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter bg-green-100 text-green-700">{p.status}</span>
                        </td>
                        <td className="py-4 text-slate-400 text-right">31/05/25</td>
                      </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Bottom Section: Operations & Financials */}
        <div className="grid grid-cols-12 gap-6 pb-20 md:pb-0">
          {/* Financial Overview */}
          <div className="col-span-12 xl:col-span-8 p-6 md:p-8 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
             <h3 className="text-lg md:text-xl font-bold tracking-tight mb-10">Finances</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
                {[
                  { label: 'Brut', val: '€ 56K' },
                  { label: 'Livraison', val: '€ 8K' },
                  { label: 'Plateforme', val: '€ 6K' },
                  { label: 'Transféré', val: '€ 41K' },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 truncate">{item.label}</p>
                    <p className="text-lg md:text-xl font-black italic tracking-tight">{item.val}</p>
                  </div>
                ))}
             </div>
             
             <div className="relative h-3 md:h-4 bg-slate-100 rounded-full flex overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '74%' }} />
                <div className="h-full bg-orange-500" style={{ width: '11%' }} />
                <div className="h-full bg-blue-500" style={{ width: '15%' }} />
             </div>
             <div className="flex flex-wrap gap-4 md:gap-8 mt-6">
                {[
                  { label: 'Partenaires (74.1%)', color: 'bg-green-500' },
                  { label: 'LGF (11.2%)', color: 'bg-orange-500' },
                  { label: 'Logistique (14.6%)', color: 'bg-blue-500' },
                ].map((legend, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded flex-shrink-0 ${legend.color}`} />
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{legend.label}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Real-time Activity */}
          <div className="col-span-12 xl:col-span-4 p-6 md:p-8 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
             <div className="flex items-center gap-3 mb-8">
                <h3 className="text-lg md:text-xl font-bold tracking-tight">Activité</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
             </div>
             
             <div className="space-y-6">
                {[
                  { time: '10s', event: 'Cmd #2459', detail: 'Napoli • €32', color: 'bg-green-500' },
                  { time: '32s', event: 'Pay OK', detail: '#PAY-2459', color: 'bg-blue-500' },
                  { time: '1m', event: 'Cmd #2458 OK', detail: 'Restaurant Napoli', color: 'bg-orange-500' },
                  { time: '2m', event: 'Livreur OK', detail: 'Ahmed A.', color: 'bg-emerald-500' },
                ].map((activity, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                       <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${activity.color} ring-4 ring-white shadow-sm z-10 flex-shrink-0`} />
                       {i < 3 && <div className="w-px h-10 bg-slate-100 -mb-2" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="text-[11px] md:text-xs font-black text-slate-800 line-clamp-1 truncate">{activity.event}</p>
                        <span className="text-[8px] md:text-[10px] font-medium text-slate-400 ml-2">{activity.time}</span>
                      </div>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 italic line-clamp-1 truncate">{activity.detail}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
