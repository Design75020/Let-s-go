import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Activity, 
  Wifi, 
  Layers, 
  Database,
  ChevronLeft,
  Server,
  Zap,
  Shield,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { token } = useAuth();
  const [health, setHealth] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
     setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const fetchData = async () => {
    try {
      const [hRes, sRes, mRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/metrics', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const hData = await hRes.json();
      const sData = await sRes.json();
      const mData = await mRes.json();
      
      setHealth(hData);
      setStats(sData);
      
      if (mData.trace) {
        const traceLogs = mData.trace.map((t: any) => 
          `[${t.severity.toUpperCase()}] ${t.action}: ${JSON.stringify(t.details).substring(0, 50)}...`
        );
        setLogs(traceLogs);
      }
      
      setLoading(false);
    } catch (err) {
      addLog('ERR: Backend Sync Failure');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const runSeed = async () => {
     addLog('SYS: Running DB Seeding...');
     const res = await fetch('/api/seed', { method: 'POST' });
     if (res.ok) addLog('SYS: Database Seeding SUCCESSFUL');
     fetchData();
  };

  if (loading) return <div className="h-screen bg-[#08090a] flex items-center justify-center text-white font-mono uppercase tracking-[0.4em]">ADMIN :: BOOTING...</div>;

  return (
    <div className="h-screen w-full flex flex-col bg-[#050608] text-white font-mono overflow-hidden">
      <header className="h-14 border-b border-emerald-500/10 flex items-center justify-between px-6 bg-[#08090a] shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/" className="p-1.5 hover:bg-white/5 rounded transition-colors">
            <ChevronLeft className="w-4 h-4 text-white/40" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase">SYSTEM SUPERVISION :: ADMIN</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Live Engine</span>
           </div>
           <div className="w-px h-6 bg-white/10"></div>
           <span className="text-[10px] text-white/20">DB: {health?.db === 'connected' ? 'OK' : 'FAIL'}</span>
           <span className="text-[10px] text-white/20">v{health?.version}</span>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
        {/* System Cards */}
        <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
           <section className="bg-[#08090a] border border-white/5 p-6 rounded-2xl flex flex-col gap-6">
              <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest border-b border-white/5 pb-2">Core Services</h3>
              <div className="space-y-4">
                 <ServiceRow icon={Server} label="API SERVER" status="ONLINE" color="text-emerald-400" />
                 <ServiceRow icon={Database} label="MONGODB CLUSTER" status={health?.db.toUpperCase()} color={health?.db === 'connected' ? "text-emerald-400" : "text-red-500"} />
                 <ServiceRow icon={Wifi} label="STRIPE WEBHOOKS" status="POLLING" color="text-blue-400" />
                 <ServiceRow icon={Zap} label="AI GEMINI-2.0" status={health?.ai ? 'READY' : 'OFF'} color="text-purple-400" />
              </div>
           </section>

           <section className="flex-1 bg-[#08090a] border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
               <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest border-b border-white/5 pb-2">Actions</h3>
               <button onClick={runSeed} className="w-full py-4 border border-dashed border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-xl hover:bg-amber-500/5 transition-all">
                  Run DB Sequence :: Seed
               </button>
               <button onClick={fetchData} className="w-full py-4 border border-dashed border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase rounded-xl hover:bg-blue-500/5 transition-all">
                  Manual Health Sync
               </button>
           </section>
        </div>

        {/* Console / Logs */}
        <div className="col-span-8 flex flex-col gap-6 overflow-hidden">
           <div className="flex-1 bg-black border border-emerald-500/10 rounded-2xl p-6 flex flex-col overflow-hidden relative shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <Terminal className="w-32 h-32" />
              </div>
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold uppercase text-emerald-500">Kernel Audit Stream</span>
                 </div>
                 <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] rounded font-bold uppercase">LIVE_TRACE</div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-4 text-[11px]">
                 {logs.length === 0 && <div className="text-white/10 uppercase italic">Waiting for lifecycle events...</div>}
                 {logs.map((log, i) => (
                    <div key={i} className="flex gap-4">
                       <span className="text-white/10 shrink-0">[{i}]</span>
                       <span className={log.includes('ERR') ? 'text-red-400' : 'text-emerald-400/80'}>{log}</span>
                    </div>
                 ))}
                 <div className="flex items-center gap-2 text-white/20 animate-pulse uppercase text-[9px]">
                    <span className="text-emerald-500 font-bold">{'>'}</span> SYSTEM LISTENING :: PORT 3000
                 </div>
              </div>
           </div>

           <div className="h-48 grid grid-cols-2 gap-6 shrink-0">
              <div className="bg-[#08090a] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                 <span className="text-[10px] font-bold text-white/30 uppercase">Infrastructure Load</span>
                 <div className="h-2 bg-white/5 rounded-full overflow-hidden mt-4">
                   <div className="h-full w-[12%] bg-emerald-500 rounded-full"></div>
                 </div>
                 <span className="text-[10px] text-white/20 mt-2">CPU USAGE: 12% :: MEMORY: 240MB</span>
              </div>
              <div className="bg-[#08090a] border border-emerald-500/10 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
                 <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <span className="text-[10px] font-bold text-emerald-500 uppercase">Architecture Report</span>
                 <p className="text-[10px] text-white/40 leading-relaxed mt-2">
                    STABLE :: Normalized Node.js Backend with MongoDB connectivity. Socket layer integrated.
                 </p>
                 <span className="text-[8px] text-white/10 font-black mt-auto">SECURITY LAYER ENFORCED</span>
              </div>
           </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}

function ServiceRow({ icon: Icon, label, status, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/2 rounded-xl border border-white/5">
       <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-white/20" />
          <span className="text-[10px] font-bold uppercase">{label}</span>
       </div>
       <span className={`text-[10px] font-black uppercase ${color}`}>{status}</span>
    </div>
  );
}
