import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Map as MapIcon, 
  Package, 
  AlertCircle, 
  TrendingUp, 
  Bike, 
  Clock, 
  CheckCircle2,
  Zap,
  Globe,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface LiveEvent {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

export default function SaaSDashboard() {
  const { token } = useAuth();
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [stats, setStats] = useState({
    activeOrders: 12,
    delayedOrders: 2,
    activeDrivers: 8,
    systemUptime: '99.9%'
  });

  useEffect(() => {
    // Note: SaaS Control Tower consumes event streams only
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle Order Lifecycle Events
        if (data.type?.startsWith('ORDER_')) {
          setEvents(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            type: data.type,
            message: `Order ${data.data._id?.substring(0, 8)} status: ${data.data.status}`,
            timestamp: new Date(),
            severity: (data.data.status === 'cancelled' || data.data.status === 'delayed') ? 'high' : 'low'
          }, ...prev].slice(0, 15));

          // Update real-time counts based on events
          if (data.type === 'ORDER_CREATED') setStats(s => ({ ...s, activeOrders: s.activeOrders + 1 }));
          if (data.type === 'ORDER_DELIVERED') setStats(s => ({ ...s, activeOrders: Math.max(0, s.activeOrders - 1) }));
        }

        // Handle System Health Events
        if (data.type === 'PAYMENT_SUCCESS') {
           setEvents(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            type: 'PAYMENT_SECURED',
            message: `Transaction processed: ${data.data.sessionId?.substring(0, 12)}...`,
            timestamp: new Date(),
            severity: 'low'
          }, ...prev].slice(0, 15));
        }
      } catch (e) {
        console.error('SaaS Signal Error:', e);
      }
    };

    return () => ws.close();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 overflow-hidden flex flex-col gap-6">
      {/* Header */}
      <header className="flex justify-between items-center bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Globe className="text-black w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight uppercase tracking-widest">SaaS <span className="text-emerald-400">Control Center</span></h1>
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-[0.2em]">Live Operation Feedback Loop</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-mono text-emerald-400">SYSTEM STABLE : 1.2ms LATENCY</span>
          </div>
          <Bell className="w-5 h-5 text-white/20 hover:text-white cursor-pointer transition-colors" />
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Stats */}
        <div className="col-span-3 space-y-6">
          <KpiCard label="ACTIVE ORDERS" value={stats.activeOrders} icon={Package} color="text-blue-400" />
          <KpiCard label="DELAYED" value={stats.delayedOrders} icon={AlertCircle} color="text-red-400" />
          <KpiCard label="DRIVERS LIVE" value={stats.activeDrivers} icon={Bike} color="text-emerald-400" />
          <KpiCard label="UPTIME" value={stats.systemUptime} icon={Activity} color="text-purple-400" />
        </div>

        {/* Center Map Placeholder */}
        <div className="col-span-6 bg-[#0a0a0a] border border-white/5 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05)_0%,_transparent_70%)]"></div>
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }}></div>
          
          <div className="absolute top-6 left-6 z-10">
            <div className="px-4 py-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3">
              <MapIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-widest uppercase">Live Dispatch View</span>
            </div>
          </div>

          {/* Interactive Map Elements would go here */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-center space-y-4">
                <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">Waiting for GPS streams...</p>
             </div>
          </div>
        </div>

        {/* Right Sidebar - Event Loop */}
        <div className="col-span-3 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 flex flex-col overflow-hidden">
            <h3 className="text-xs font-bold tracking-widest uppercase mb-6 flex items-center justify-between">
              Event Loop
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/40">LIVE</span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
              <AnimatePresence initial={false}>
                {events.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/10 italic text-sm">
                    No active events...
                  </div>
                ) : (
                  events.map(event => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-4 rounded-xl border ${
                        event.severity === 'high' ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold font-mono ${
                          event.severity === 'high' ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {event.type}
                        </span>
                        <span className="text-[8px] text-white/20">{event.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">{event.message}</p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="h-48 bg-[#101010] border border-emerald-500/10 rounded-3xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-20 h-20 text-emerald-500" />
             </div>
             <p className="text-[10px] text-emerald-400/60 font-mono mb-2 uppercase tracking-widest">Efficiency index</p>
             <h4 className="text-4xl font-black text-emerald-400 tracking-tighter">94.2</h4>
             <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-400/40">
                <Zap className="w-3 h-3" />
                OPTIMAL STATE
             </div>
          </div>
        </div>
      </div>

      {/* Footer Pipeline */}
      <footer className="h-24 bg-[#0a0a0a] border border-white/5 p-4 rounded-3xl flex items-center justify-between px-8">
        <PipelineStep label="CREATED" count={2} active icon={Clock} />
        <PipelineArrow />
        <PipelineStep label="PAID" count={4} active icon={CheckCircle2} />
        <PipelineArrow />
        <PipelineStep label="PREPARING" count={3} active icon={Activity} />
        <PipelineArrow />
        <PipelineStep label="READY" count={1} icon={CheckCircle2} />
        <PipelineArrow />
        <PipelineStep label="ON DELIVERY" count={3} active icon={Bike} />
        <PipelineArrow />
        <PipelineStep label="DELIVERED" count={45} icon={CheckCircle2} />
      </footer>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl group hover:border-white/10 transition-all">
      <div className="flex justify-between items-center mb-4">
        <div className={`p-2 rounded-lg bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Realtime</span>
      </div>
      <h4 className="text-3xl font-black tracking-tight">{value}</h4>
      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

function PipelineStep({ label, count, active, icon: Icon }: any) {
  return (
    <div className={`flex flex-col items-center gap-1 ${active ? 'opacity-100' : 'opacity-20'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[8px] font-bold tracking-widest uppercase text-white/40">{label}</span>
      {active && <span className="text-[10px] font-black">{count}</span>}
    </div>
  );
}

function PipelineArrow() {
  return <div className="h-[1px] flex-1 bg-white/5 mx-4 max-w-[40px]"></div>;
}
