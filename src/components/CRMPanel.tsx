import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Target,
  ChevronLeft,
  Sparkles,
  Loader2,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { askAI } from '../lib/ai';
import { useAuth } from '../context/AuthContext';

export default function CRMPanel() {
  const { token } = useAuth();
  const [crmStats, setCrmStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    const context = `Données CRM: ${crmStats?.kpis?.totalOrders || 0} commandes, ${crmStats?.kpis?.totalLeads || 0} prospects.`;
    const response = await askAI(aiPrompt, context);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCrmStats(data);
      setLoading(false);
    } catch (err) {
      console.error('CRM Sync Error:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-[#08090a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#050608] text-[#e0e0e0] font-sans overflow-hidden">
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#08090a] shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-white/40" />
          </Link>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h1 className="text-sm font-bold tracking-widest uppercase">CRM HUB :: Support & Sales</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-white/20 uppercase">Module CRM v2.4</span>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden grid grid-cols-12 gap-6">
        {/* Left Column: KPI & Lists */}
        <div className="col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="grid grid-cols-3 gap-4 shrink-0">
            <KPICard title="Total Orders" value={crmStats?.kpis.totalOrders} trend="Lifetime" color="text-emerald-400" icon={<ShoppingBag className="w-4 h-4" />} />
            <KPICard title="New Leads" value={crmStats?.kpis.totalLeads} trend="Sales Pipeline" color="text-blue-400" icon={<Users className="w-4 h-4" />} />
            <KPICard title="Conversion Rate" value={`${crmStats?.kpis.conversion}%`} trend="Target 4.5%" color="text-purple-400" icon={<TrendingUp className="w-4 h-4" />} />
          </div>

          <section className="flex-1 bg-[#0a0b0d] border border-white/5 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Opérations Clientèle</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {crmStats?.recent.orders.map((o: any) => (
                 <div key={o._id} className="p-4 bg-white/2 border border-white/5 rounded-xl flex justify-between items-center hover:border-white/10 transition-colors">
                   <div className="flex flex-col">
                     <span className="text-xs font-bold">Order #{o._id.slice(-8).toUpperCase()}</span>
                     <span className="text-[10px] text-white/30 uppercase font-mono">{o.status} • {o.amount}€</span>
                   </div>
                   <Link to={`/admin`} className="text-[10px] text-blue-400 hover:underline uppercase font-bold">Détails Admin</Link>
                 </div>
               ))}
            </div>
          </section>
        </div>

        {/* Right Column: AI & Secondary Analytics */}
        <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
            <section className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-6 flex flex-col shrink-0 overflow-hidden">
              <h2 className="text-[10px] font-black text-purple-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> CRM AI Co-Pilot
              </h2>
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {aiResponse && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-purple-500/10 border border-purple-500/10 rounded-xl text-[11px] text-purple-200/60 leading-relaxed italic"
                    >
                       {aiResponse}
                    </motion.div>
                  )}
                </AnimatePresence>
                <form onSubmit={handleAskAI} className="relative">
                  <input 
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Analyser les performances..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono text-white placeholder:text-white/10 focus:outline-none focus:border-purple-500/40 pr-10 uppercase"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors">
                    {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </section>

            <section className="flex-1 bg-[#0a0b0d] border border-white/5 rounded-2xl p-6 flex flex-col overflow-hidden">
               <h2 className="text-[10px] font-bold text-white/20 uppercase mb-4 tracking-widest flex items-center gap-2">
                 <Target className="w-3 h-3" /> Performance Équipes
               </h2>
               <div className="space-y-4 overflow-y-auto">
                  {crmStats?.analytics.agents.map((a: any) => (
                    <div key={a._id} className="flex items-center justify-between p-3 bg-white/2 rounded-lg">
                       <span className="text-[11px] font-medium">{a._id}</span>
                       <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">{a.orders} ORD</span>
                    </div>
                  ))}
               </div>
            </section>
        </div>
      </main>
    </div>
  );
}

function KPICard({ title, value, trend, icon, color }: any) {
  return (
    <div className="bg-[#0a0b0d] border border-white/5 rounded-2xl p-6 flex flex-col gap-1">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>{icon}</div>
        <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-white/30 uppercase font-bold tracking-widest">Live</span>
      </div>
      <div className={`text-2xl font-black ${color} tracking-tighter`}>{value}</div>
      <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{title}</div>
      <div className="text-[8px] text-white/10 uppercase font-mono mt-1">{trend}</div>
    </div>
  );
}
