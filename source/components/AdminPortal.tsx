import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingBag, Utensils, Truck, Users, 
  Wallet, Receipt, BookOpen, Megaphone, HelpCircle, 
  Settings, CreditCard, Map, Percent, Scale, Package, 
  Bell, Search, Calendar, ChevronDown, MoreVertical, 
  ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, 
  CheckCircle2, XCircle
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
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-slate-400 flex flex-col fixed h-full z-30 shadow-2xl">
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
              { label: 'Tableau de bord', icon: LayoutDashboard },
              { label: 'Commandes', icon: ShoppingBag },
              { label: 'Restaurants', icon: Utensils },
              { label: 'Livreurs', icon: Truck },
              { label: 'Clients', icon: Users },
              { label: 'Finance', icon: Wallet },
              { label: 'Payouts', icon: Receipt },
              { label: 'Catalogue', icon: BookOpen },
              { label: 'Marketing', icon: Megaphone },
              { label: 'Support', icon: HelpCircle },
              { label: 'Paramètres', icon: Settings },
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
                {item.label === 'Finance' && <ChevronDown className="w-4 h-4 opacity-40" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8 px-8 pb-8">
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 px-4">Configuration Business</div>
          <nav className="space-y-1">
            {[
              { label: 'Configuration financière', icon: CreditCard },
              { label: 'Zones de livraison', icon: Map },
              { label: 'Frais de livraison', icon: Package },
              { label: 'Règles de plateforme', icon: Scale },
              { label: 'Modules & Fonctions', icon: Percent },
            ].map((item) => (
              <button key={item.label} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-all">
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

          <div className="flex items-center gap-4 py-4 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white overflow-hidden group-hover:border-blue-500/50 transition-all">
               {user?.photoURL ? <img src={user.photoURL} alt="" /> : <span className="text-xs font-black">Admin</span>}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-white truncate">{user?.name || 'LGF Admin'}</p>
               <p className="text-[10px] font-medium text-slate-500 truncate">{user?.email}</p>
            </div>
            <MoreVertical className="w-4 h-4 text-slate-600 group-hover:text-white" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-10 bg-[#f8fafc]">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{activeTab}</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Vue d'ensemble de votre activité</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              01/05/2025 - 31/05/2025
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            <button className="relative p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#f8fafc]">12</span>
            </button>
            <div className="w-10 h-10 bg-green-500 text-white font-black flex items-center justify-center rounded-full text-lg shadow-lg shadow-green-500/20">
              A
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-6 mb-10">
          {[
            { label: 'Commandes totales', value: '2 458', trend: '+ 18.5%', icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-50', iconBg: 'bg-green-500' },
            { label: "Chiffre d'affaires brut", value: '€ 56 420,00', trend: '+ 21.3%', icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-50', iconBg: 'bg-purple-500' },
            { label: 'Revenus plateforme', value: '€ 6 320,00', trend: '+ 15.7%', icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-50', iconBg: 'bg-orange-500' },
            { label: 'Restaurants actifs', value: '128', trend: '+ 9.6%', icon: Utensils, color: 'text-blue-500', bg: 'bg-blue-50', iconBg: 'bg-blue-500' },
            { label: 'Livreurs actifs', value: '312', trend: '+ 11.2%', icon: Truck, color: 'text-emerald-500', bg: 'bg-emerald-50', iconBg: 'bg-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className={`w-12 h-12 ${stat.iconBg} rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-slate-100`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-black tracking-tight text-slate-900 mb-2">{stat.value}</h4>
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className={`w-3 h-3 ${stat.color}`} />
                <span className={`text-[10px] font-black ${stat.color}`}>{stat.trend}</span>
                <span className="text-[10px] font-medium text-slate-400 ml-1">vs mois dernier</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Notifications Row */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          {/* Main Chart */}
          <div className="col-span-12 lg:col-span-8 p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Commandes par jour</h3>
              </div>
              <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                Par jour <ChevronDown className="w-3 h-3 opacity-40" />
              </div>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#1e40af' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="col-span-12 lg:col-span-4 p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex flex-col">
            <h3 className="text-xl font-bold tracking-tight mb-8">Répartition des commandes</h3>
            <div className="flex-1 relative flex items-center justify-center">
              <ResponsiveContainer width={240} height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
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
                <p className="text-2xl font-black tracking-tight">2 458</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tighter">{item.name}</p>
                    <p className="text-xs font-black italic">{item.value} <span className="opacity-40 ml-1">({Math.round(item.value/2458*100)}%)</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actionable Tables */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          {/* Left Table: Orders */}
          <div className="col-span-8 p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold tracking-tight">Commandes récentes</h3>
               <button className="text-blue-500 text-xs font-bold hover:underline">Voir toutes</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-4">ID Commande</th>
                    <th className="pb-4">Restaurant</th>
                    <th className="pb-4">Client</th>
                    <th className="pb-4">Statut</th>
                    <th className="pb-4 text-right">Total</th>
                    <th className="pb-4 text-right">Date</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.length > 0 ? recentOrders.map((order, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-xs font-bold text-slate-500">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="py-4 text-xs font-bold">{order.restaurantName || 'Resto LGF'}</td>
                      <td className="py-4 text-xs font-medium text-slate-400">{order.clientName || 'Jean Dupont'}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status === 'delivered' ? 'Livrée' : order.status === 'pending' ? 'En préparation' : 'En livraison'}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-black text-right">€ {order.total?.toFixed(2) || '28.40'}</td>
                      <td className="py-4 text-xs font-medium text-slate-400 text-right">Aujourd'hui</td>
                      <td className="py-4 text-right">
                         <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                         </button>
                      </td>
                    </tr>
                  )) : [1,2,3,4,5].map(i => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-xs font-bold text-slate-500">#CMD-0245{i}</td>
                      <td className="py-4 text-xs font-bold">Pizza Napoli</td>
                      <td className="py-4 text-xs font-medium text-slate-400">Jean Dupont</td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-green-100 text-green-700">Livrée</span>
                      </td>
                      <td className="py-4 text-xs font-black text-right">€ 28,40</td>
                      <td className="py-4 text-xs font-medium text-slate-400 text-right">31/05/2025 14:32</td>
                      <td className="py-4 text-right"><MoreVertical className="w-4 h-4 text-slate-400" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel: Alerts */}
          <div className="col-span-4 p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold tracking-tight">Alertes & Notifications</h3>
                <button className="text-blue-500 text-xs font-bold hover:underline">Tout voir</button>
             </div>
             
             <div className="space-y-6">
                {[
                  { title: 'Payouts échoués', desc: '8 transferts ont échoué', type: 'error', icon: AlertTriangle, time: 'Il y a 5 min' },
                  { title: 'Compte restaurant en attente', desc: 'KYC en attente pour 3 restaurants', type: 'warning', icon: AlertTriangle, time: 'Il y a 25 min' },
                  { title: 'Nouveau restaurant', desc: '"Burger House" vient de s\'inscrire', type: 'info', icon: Bell, time: 'Il y a 1 h' },
                  { title: 'Payouts complétés', desc: '12 payouts ont été traités', type: 'success', icon: CheckCircle2, time: 'Il y a 2 h' },
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
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{alert.title}</p>
                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">{alert.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium line-clamp-1">{alert.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Second Table Row: Payouts */}
        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold tracking-tight">Payouts récents</h3>
                <button className="text-blue-500 text-xs font-bold hover:underline">Voir tous</button>
             </div>
             <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-4">ID Payout</th>
                    <th className="pb-4">Bénéficiaire</th>
                    <th className="pb-4">Montant</th>
                    <th className="pb-4">Statut</th>
                    <th className="pb-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {[
                     { id: 'PO-001254', name: 'Pizza Napoli', amount: '€ 320,00', status: 'Payé', type: 'success' },
                     { id: 'PO-001253', name: 'Sushi Master', amount: '€ 450,75', status: 'Payé', type: 'success' },
                     { id: 'PO-001252', name: 'Ahmed Ali (Livreur)', amount: '€ 85,40', status: 'Payé', type: 'success' },
                   ].map((p, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-xs font-bold text-slate-500">{p.id}</td>
                      <td className="py-4 text-xs font-black">{p.name}</td>
                      <td className="py-4 text-xs font-black">{p.amount}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-green-100 text-green-700">{p.status}</span>
                      </td>
                      <td className="py-4 text-xs font-medium text-slate-400 text-right">31/05/2025</td>
                    </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* Bottom Section: Operations & Financials */}
        <div className="grid grid-cols-12 gap-6">
          {/* Financial Overview */}
          <div className="col-span-8 p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
             <h3 className="text-xl font-bold tracking-tight mb-10">Aperçu financier</h3>
             <div className="grid grid-cols-4 gap-8 mb-12">
                {[
                  { label: 'Total brut', val: '€ 56 420,00' },
                  { label: 'Frais livraison', val: '€ 8 240,00' },
                  { label: 'Frais plateforme', val: '€ 6 320,00' },
                  { label: 'Montant transféré', val: '€ 41 860,00' },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                    <p className="text-xl font-black italic tracking-tight">{item.val}</p>
                  </div>
                ))}
             </div>
             
             <div className="relative h-4 bg-slate-100 rounded-full flex overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '74%' }} />
                <div className="h-full bg-orange-500" style={{ width: '11%' }} />
                <div className="h-full bg-blue-500" style={{ width: '15%' }} />
             </div>
             <div className="flex gap-8 mt-6">
                {[
                  { label: 'Transféré aux partenaires (74.1%)', color: 'bg-green-500' },
                  { label: 'Frais plateforme (11.2%)', color: 'bg-orange-500' },
                  { label: 'Frais livraison (14.6%)', color: 'bg-blue-500' },
                ].map((legend, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${legend.color}`} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{legend.label}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Real-time Activity */}
          <div className="col-span-4 p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
             <div className="flex items-center gap-3 mb-8">
                <h3 className="text-xl font-bold tracking-tight">Activité en temps réel</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             </div>
             
             <div className="space-y-6">
                {[
                  { time: 'Il y a 10 sec', event: 'Nouvelle commande #CMD-02459', detail: 'Pizza Napoli • € 32,60', color: 'bg-green-500' },
                  { time: 'Il y a 32 sec', event: 'Paiement réussi', detail: '#PAY-02459 • € 32,60', color: 'bg-blue-500' },
                  { time: 'Il y a 1 min', event: 'Commande acceptée par le restaurant', detail: '#CMD-02458 • Pizza Napoli', color: 'bg-orange-500' },
                  { time: 'Il y a 2 min', event: 'Livreur assigné', detail: '#CMD-02457 • Ahmed Ali', color: 'bg-emerald-500' },
                ].map((activity, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                       <div className={`w-3 h-3 rounded-full ${activity.color} ring-4 ring-white shadow-sm z-10`} />
                       {i < 3 && <div className="w-px h-12 bg-slate-100 -mb-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-black text-slate-800 line-clamp-1">{activity.event}</p>
                        <span className="text-[10px] font-medium text-slate-400 ml-2">{activity.time}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 italic line-clamp-1">{activity.detail}</p>
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
