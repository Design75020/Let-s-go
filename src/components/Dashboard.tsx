import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Terminal, 
  Activity, 
  Wifi,
  Layers,
  ChevronLeft,
  Users,
  ShoppingBag,
  TrendingUp,
  MapPin,
  Clock,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [logs, setLogs] = useState([
    { type: 'info', text: '[INFO] Initializing Node.js Full-Stack Architecture...', color: 'text-blue-400' },
  ]);
  const [health, setHealth] = useState<any>(null);
  const [crmStats, setCrmStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'system' | 'crm'>('crm');

  const fetchData = async () => {
    try {
      // Fetch health & stats in parallel
      const [healthRes, statsRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/stats')
      ]);
      
      const healthData = await healthRes.json();
      const statsData = await statsRes.json();
      
      setHealth(healthData);
      setCrmStats(statsData);
      
      if (loading) {
        setLogs(prev => [...prev, 
          { type: 'success', text: `[SUCCESS] Connected to Backend v${healthData.version}`, color: 'text-emerald-400' },
          { type: 'info', text: `[INFO] CRM Engine Active: Capturing Leads & Events`, color: 'text-blue-400' }
        ]);
        setLoading(false);
      }
    } catch (err) {
      setHealth({ status: 'error', db: 'disconnected' });
      setLogs(prev => [...prev, { type: 'error', text: '[ERROR] Backend sync failed', color: 'text-red-400' }]);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div id="dashboard-container" className="h-screen w-full flex flex-col bg-[#08090a] text-[#e0e0e0] font-sans overflow-hidden select-none">
      {/* Header Navigation */}
      <header id="dashboard-header" className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0c0d0f] shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-white/60" />
            </Link>
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <h1 className="text-lg font-semibold tracking-tight">LGF <span className="text-emerald-400 font-bold">Control</span></h1>
          </div>
          
          <nav className="flex items-center gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
            <button 
              onClick={() => setActiveTab('crm')}
              className={`px-4 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-widest transition-all ${activeTab === 'crm' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40 hover:text-white/60'}`}
            >
              CRM Overview
            </button>
            <button 
              onClick={() => setActiveTab('system')}
              className={`px-4 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-blue-500/20 text-blue-400' : 'text-white/40 hover:text-white/60'}`}
            >
              System Health
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase font-mono leading-none mb-1">Server Host</span>
            <span className="text-xs font-mono text-emerald-400/80">0.0.0.0:3000</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <motion.button 
            onClick={() => { setLoading(true); fetchData(); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs rounded hover:bg-emerald-600/20 transition-all cursor-default flex items-center gap-2"
          >
            <Activity className="w-3 h-3" />
            LIVE SYNC
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main id="dashboard-main" className="flex-1 p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'crm' ? (
            <motion.div 
              key="crm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full grid grid-cols-12 gap-6 overflow-hidden"
            >
              {/* CRM KPIs */}
              <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <KPICard title="Total Orders" value={crmStats?.kpis.totalOrders || 0} trend={`+${crmStats?.kpis.ordersToday || 0} today`} icon={<ShoppingBag className="w-4 h-4" />} color="text-emerald-400" />
                <KPICard title="New Leads" value={crmStats?.kpis.totalLeads || 0} trend={`+${crmStats?.kpis.leadsToday || 0} today`} icon={<Users className="w-4 h-4" />} color="text-blue-400" />
                <KPICard title="Global Conversion" value={`${crmStats?.kpis.conversion || 0}%`} trend="Visit to Order" icon={<TrendingUp className="w-4 h-4" />} color="text-purple-400" />
                <KPICard title="Active Zones" value={crmStats?.analytics.zones.length || 0} trend="Coverage" icon={<MapPin className="w-4 h-4" />} color="text-amber-400" />
              </div>

              {/* CRM Main Body */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                <section className="bg-white/5 border border-white/10 rounded-lg flex-1 flex flex-col overflow-hidden">
                  <div className="h-10 border-b border-white/10 flex items-center px-4 bg-white/5 justify-between">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Recent Activity</span>
                    <Clock className="w-3 h-3 text-white/20" />
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    <h3 className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest pb-1 border-b border-white/5">Latest Orders</h3>
                    {crmStats?.recent.orders.map((o: any) => (
                      <div key={o._id} className="flex items-center justify-between p-3 bg-black/40 rounded border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">Order #{o._id.slice(-6).toUpperCase()}</span>
                          <span className="text-[10px] text-white/40 uppercase font-mono">{o.status} • {o.amount}€</span>
                        </div>
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono uppercase">{o.zone || 'Global'}</span>
                      </div>
                    ))}
                    
                    <h3 className="text-[10px] font-mono text-blue-400 uppercase tracking-widest pt-4 pb-1 border-b border-white/5">Latest Leads</h3>
                    {crmStats?.recent.leads.map((l: any) => (
                      <div key={l._id} className="flex items-center justify-between p-3 bg-black/40 rounded border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{l.name}</span>
                          <span className="text-[10px] text-white/40 uppercase font-mono">{l.type} • {l.phone}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase">Ref: {l.ref || 'Direct'}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* CRM Analytics Sidebar */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-hidden">
                <section className="bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col shrink-0 overflow-hidden">
                  <h2 className="text-xs font-mono text-white/40 uppercase mb-4 tracking-widest flex items-center gap-2">
                    <Target className="w-3 h-3" /> Agent Leaderboard
                  </h2>
                  <div className="space-y-3 overflow-y-auto custom-scrollbar">
                    {crmStats?.analytics.agents.map((a: any) => (
                      <div key={a._id} className="flex items-center justify-between p-2 bg-black/40 rounded">
                        <span className="text-xs font-mono text-white/80">{a._id}</span>
                        <div className="flex gap-2">
                          <span className="text-[10px] text-emerald-400 font-mono">{a.orders} ORD</span>
                          <span className="text-[10px] text-white/30 font-mono">{a.tasks} EVT</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white/5 border border-white/10 rounded-lg p-5 flex-1 flex flex-col overflow-hidden">
                  <h2 className="text-xs font-mono text-white/40 uppercase mb-4 tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Zone Performance
                  </h2>
                  <div className="space-y-4 overflow-y-auto custom-scrollbar">
                    {crmStats?.analytics.zones.map((z: any) => (
                      <div key={z._id} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-white/60 uppercase">{z._id || 'UNSET'}</span>
                          <span>{z.count} events</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (z.count / 100) * 100)}%` }}
                            className="h-full bg-emerald-500/40"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="system"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full grid grid-cols-12 gap-6 overflow-hidden"
            >
              {/* Existing System View */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-hidden">
                <section className="bg-white/5 border border-white/10 rounded-lg p-5 flex-1 shadow-2xl relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Database className="w-20 h-20" />
                  </div>
                  <h2 className="text-xs font-mono text-white/40 uppercase mb-4 tracking-widest flex items-center gap-2 shrink-0">
                    <span className="w-1 h-3 bg-emerald-500"></span> Service Configuration
                  </h2>
                  <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    <EnvCard label="NODE_ENV" value={`"${health?.version || 'development'}"`} badge="ACTIVE" badgeColor="bg-blue-500/20 text-blue-400" />
                    <EnvCard label="MONGO_STATUS" value={health?.db === 'connected' ? 'Connected to Replica Set' : 'Error / Disconnected'} badge={health?.db === 'connected' ? 'ONLINE' : 'OFFLINE'} badgeColor={health?.db === 'connected' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-500"} />
                    <EnvCard label="API_ENDPOINT" value="/api/health" badge="REST" badgeColor="bg-amber-500/20 text-amber-400" />
                    <EnvCard label="SOCKET_WS" value="ws://0.0.0.0:3000" badge="ACTIVE" badgeColor="bg-purple-500/20 text-purple-400" />
                  </div>
                </section>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5 h-40 flex flex-col shrink-0 flex items-center justify-center border-dashed">
                  <Activity className="w-8 h-8 text-white/10 mb-2" />
                  <span className="text-[10px] font-mono text-white/20 uppercase">System Heartbeat: Stable</span>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                  <ServiceCard icon={<Database className="w-4 h-4" />} label="MongoDB Engine" status={health?.db === 'connected' ? "Synced" : "Offline"} color={health?.db === 'connected' ? "bg-emerald-500" : "bg-red-500"} statusColor={health?.db === 'connected' ? "text-emerald-400/60" : "text-red-400/60"} />
                  <ServiceCard icon={<Wifi className="w-4 h-4" />} label="Stripe Webhooks" status="Polling" color="bg-blue-500" statusColor="text-blue-400/60" />
                  <ServiceCard icon={<Layers className="w-4 h-4" />} label="Event Stream" status="Live" color="bg-purple-500" statusColor="text-purple-400/60" />
                </div>
                <div className="flex-1 bg-black/60 border border-white/10 rounded-lg flex flex-col relative overflow-hidden">
                  <div className="h-8 border-b border-white/10 flex items-center px-4 bg-white/5 shrink-0">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Architectural Logs</span>
                  </div>
                  <div className="p-4 font-mono text-[11px] space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
                    {logs.map((log, index) => (
                      <p key={index} className={log.color}>{log.text}</p>
                    ))}
                    <div className="pt-4 flex items-center gap-2">
                      <span className="text-emerald-400 animate-pulse font-bold">{'>'}</span>
                      <span className="text-white/20">Awaiting stream...</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="h-10 border-t border-white/10 bg-[#0c0d0f] flex items-center justify-between px-6 text-[10px] font-mono uppercase tracking-widest text-white/30 truncate">
        <div className="flex gap-6">
          <span>Status: <span className="text-emerald-400/60">Operational</span></span>
          <span>CRM Engine: <span className="text-blue-400/60">v1.2</span></span>
        </div>
        <div className="hidden sm:block">
          Enterprise Logistics Stabilization Prototype / <span className="text-white/60 font-bold">Protocol ACTIVE</span>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

function KPICard({ title, value, trend, icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{title}</span>
        <div className={`${color}/10 p-1.5 rounded-lg`}>{icon}</div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <span className="text-[10px] text-white/30 font-mono uppercase">{trend}</span>
    </div>
  );
}

function EnvCard({ label, value, badge, badgeColor }: any) {
  return (
    <div className="bg-black/40 p-3 rounded border border-white/5">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-white/60">{label}</span>
        <span className={`text-[10px] ${badgeColor} px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter`}>{badge}</span>
      </div>
      <div className="text-sm font-mono text-white/90 break-all">{value}</div>
    </div>
  );
}

function ServiceCard({ icon, label, status, color, statusColor }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col items-center gap-2">
      <div className={`w-8 h-8 rounded-full ${color}/10 flex items-center justify-center`}>
        <div className={`w-2 h-2 rounded-full ${color} animate-pulse`}></div>
      </div>
      <span className="text-xs font-medium">{label}</span>
      <span className={`text-[10px] font-mono ${statusColor}`}>{status}</span>
    </div>
  );
}
