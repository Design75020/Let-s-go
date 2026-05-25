
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Cpu, 
  Wind, 
  BarChart3, 
  AlertTriangle,
  RefreshCcw,
  CheckCircle2,
  Server,
  Bike,
  Package
} from 'lucide-react';
import { io } from 'socket.io-client';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- UI Components ---
const MetricCard = ({ title, value, unit, icon: Icon, trend, color = "blue" }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 p-8 opacity-5 text-${color}-500/10`}>
      <Icon className="w-16 h-16" />
    </div>
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-xl bg-${color}-50 text-${color}-600`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
        {title}
      </span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-black italic text-slate-900 tracking-tighter">{value}</span>
      <span className="text-xs font-bold text-slate-400 uppercase italic">{unit}</span>
    </div>
    {trend && (
      <div className={`mt-4 text-[10px] font-black uppercase italic ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend > 0 ? '+' : ''}{trend}% vs snapshot
      </div>
    )}
  </motion.div>
);

const Indicator = ({ label, active }: { label: string; active: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`} />
    <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-slate-900' : 'text-slate-400'}`}>
      {label}
    </span>
  </div>
);

// --- Main Dashboard ---
export default function BIDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [systemState, setSystemState] = useState({
    socketConnected: false,
    healthScore: 100,
    safeMode: false,
    loading: true,
    lastUpdate: new Date()
  });
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/monitoring');
      if (!res.ok) throw new Error('Polling failure');
      const data = await res.json();
      
      setMetrics((prev: any) => ({
        ...prev,
        economy: {
          activeDrivers: data.market.supply,
          pendingOrders: data.market.demand,
          surgeMultiplier: data.market.avgDeliveryTime > 30 ? 1.5 : 1.0, // Heuristic if missing
          avgDeliveryTime: data.market.avgDeliveryTime
        },
        business: data.business,
        health: data.health
      }));

      setSystemState(s => ({ 
        ...s, 
        healthScore: data.health.uhs,
        loading: false,
        lastUpdate: new Date()
      }));

      // Update chart if not using sockets
      if (!systemState.socketConnected) {
        setChartData(prev => [...prev, {
            time: new Date().toLocaleTimeString(),
            drivers: data.market.supply,
            orders: data.market.demand,
            surge: (data.market.avgDeliveryTime > 30 ? 1.5 : 1.0) * 10
        }].slice(-20));
      }
    } catch (err) {
      console.warn('Dashboard: Metric refresh failed', err);
    }
  };

  useEffect(() => {
    const socket = io(window.location.origin);

    socket.on('connect', () => {
      setSystemState(s => ({ ...s, socketConnected: true }));
      fetchMetrics();
    });

    socket.on('disconnect', () => setSystemState(s => ({ ...s, socketConnected: false })));

    socket.on('bi:metrics', (data) => {
      setMetrics((prev: any) => ({ ...prev, economy: data.economy, ai: data.ai || prev?.ai }));
      setChartData(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          drivers: data.economy.activeDrivers,
          orders: data.economy.pendingOrders,
          surge: data.economy.surgeMultiplier * 10
      }].slice(-20));
      setSystemState(s => ({ ...s, lastUpdate: new Date() }));
    });

    socket.on('bi:metrics:batch', (batch: any[]) => {
       const latest = batch[batch.length - 1];
       // Check if latest has economy property or is the economy snapshot itself
       const economy = latest.economy || latest;
       setMetrics((prev: any) => ({ ...prev, economy }));
       setSystemState(s => ({ ...s, lastUpdate: new Date() }));
    });

    // Fallback polling
    const pollingInterval = setInterval(() => {
      fetchMetrics();
    }, 5000);

    socket.on('bi:anomaly', (data) => {
      setAnomalies(prev => [data, ...prev].slice(0, 5));
      setLogs(prev => [`[ANOMALY] ${data.message}`, ...prev].slice(0, 50));
      setSystemState(s => ({ ...s, healthScore: Math.max(0, s.healthScore - 10) }));
    });

    socket.on('bi:recovery', (data) => {
      setLogs(prev => [`[HEAL] System restored from anomaly ${data.anomalyId}`, ...prev].slice(0, 50));
    });

    socket.on('bi:economy', (data) => {
      setLogs(prev => [`[ECONOMY] Surge updated to ${data.surgeMultiplier}x`, ...prev].slice(0, 50));
    });

    return () => {
      socket.disconnect();
      clearInterval(pollingInterval);
    };
  }, []);

  const aiCostPercentage = metrics?.ai ? (metrics.ai.spending / metrics.ai.limit) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic">
              Level 16 Global Autonomous
            </div>
            <Indicator label="V16 Predictor" active={true} />
            <Indicator label="Global Sync" active={true} />
            <div className="flex items-center gap-2 ml-4">
              <span className="text-[10px] font-black text-slate-400 uppercase">System Score</span>
              <span className={`text-sm font-black italic ${systemState.healthScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {systemState.healthScore}%
              </span>
            </div>
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter text-slate-900 leading-none">
            GLOBAL <span className="text-slate-300">INTELLIGENCE</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic mt-2">
            LETSGOFOOD GLOBAL OPERATING SYSTEM V16.0.0-PREDICTIVE
          </p>
        </div>

        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 px-6 py-4 rounded-2xl flex items-center gap-3 hover:bg-slate-50 transition-all">
            <RefreshCcw className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Manual Override</span>
          </button>
          <button className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
            <Wind className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Export BI Data</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Real-time Stats */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              title="Autonomous Supply" 
              value={metrics?.economy.activeDrivers || '--'} 
              unit="Active Units" 
              icon={Bike}
              color="blue"
            />
            <MetricCard 
              title="Real-time Demand" 
              value={metrics?.economy.pendingOrders || '--'} 
              unit="Pending Req" 
              icon={Package}
              trend={12}
              color="indigo"
            />
            <MetricCard 
              title="Economic Surge" 
              value={metrics?.economy.surgeMultiplier ? metrics.economy.surgeMultiplier.toFixed(2) : '1.00'} 
              unit="x Multiplier" 
              icon={TrendingUp}
              color="rose"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard 
              title="Daily GMV" 
              value={metrics?.business?.gmv ? `$${(metrics.business.gmv / 1000).toFixed(1)}k` : '--'} 
              unit="Gross Vol" 
              icon={TrendingUp}
              color="emerald"
            />
            <MetricCard 
              title="Success Rate" 
              value={metrics?.business?.conversionRate ? `${(metrics.business.conversionRate * 100).toFixed(1)}%` : '--'} 
              unit="Conversion" 
              icon={CheckCircle2}
              color="blue"
            />
            <MetricCard 
              title="Cancellations" 
              value={metrics?.business?.cancellations || '0'} 
              unit="Dropped" 
              icon={AlertTriangle}
              color="rose"
            />
            <MetricCard 
              title="API Errors" 
              value={metrics?.health?.errorRate || '0'} 
              unit="Requests/m" 
              icon={ShieldAlert}
              color="amber"
            />
          </div>

          {/* Main Chart */}
          <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black italic text-slate-900 uppercase">Market Velocity</h3>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Supply / Demand Intersect (Last 20 ticks)</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-blue-500" />
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider italic">Supply</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-rose-500" />
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider italic">Demand</span>
                 </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDrivers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                  />
                  <Area type="monotone" dataKey="drivers" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorDrivers)" />
                  <Area type="monotone" dataKey="orders" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-slate-900 text-white p-8 rounded-[3rem] overflow-hidden relative">
                <BarChart3 className="absolute -bottom-10 -right-10 w-48 h-48 opacity-5" />
                <h3 className="text-xl font-black italic mb-6">SYSTEM TELEMETRY</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Market Breaker', val: metrics?.economy?.circuit?.state || 'CLOSED', status: 'optimal' },
                    { label: 'Decision Latency', val: '4ms', status: 'optimal' },
                    { label: 'V16 AI Confidence', val: '92%', status: 'optimal' },
                    { label: 'Predicted Heat (15m)', val: '+12%', status: 'nominal' },
                    { label: 'Self-Heal Operator', val: 'Ready', status: 'ready' }
                  ].map(stat => (
                    <div key={stat.label} className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</span>
                      <span className={`text-[10px] font-black italic uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg ${stat.val === 'OPEN' ? 'text-rose-400' : 'text-sky-400'}`}>
                        {stat.val}
                      </span>
                    </div>
                  ))}
                </div>
             </div>

             <div className="bg-white border border-slate-100 p-8 rounded-[3rem]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black italic">ANOMALY FEED</h3>
                  <div className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[8px] font-black uppercase tracking-widest">
                    Live Guard
                  </div>
                </div>
                <div className="space-y-4">
                  <AnimatePresence>
                    {anomalies.length > 0 ? anomalies.map((anomaly) => (
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        key={anomaly.id}
                        className="flex gap-4 p-4 bg-rose-50/50 rounded-2xl border border-rose-100"
                      >
                        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                        <div>
                          <p className="text-xs font-black italic text-slate-900 uppercase leading-none mb-1">{anomaly.type}</p>
                          <p className="text-[10px] font-medium text-slate-500">{anomaly.message}</p>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="py-12 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-100 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No anomalies detected in last 24h</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: AI & Global Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black italic uppercase italic">AI ORCHESTRATOR</h3>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Session Cost Density</span>
                <span className="text-2xl font-black italic text-slate-900 tracking-tighter">${metrics?.ai.spending.toFixed(2) || '0.00'}</span>
              </div>
              <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${aiCostPercentage}%` }}
                  className={`h-full rounded-full ${aiCostPercentage > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Budget Start</span>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Threshold: ${metrics?.ai.limit || '50'}.00</span>
              </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
              <div className="flex items-center gap-3 mb-4">
                <Zap className={`w-4 h-4 ${metrics?.ai.isThrottled ? 'text-amber-400' : 'text-indigo-400'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Current Strategy</span>
              </div>
              <p className="text-xl font-bold leading-tight mb-4 italic tracking-tight">
                {metrics?.ai.mode === 'aggressive' 
                  ? "DETERMINISTIC FALLBACK (COST CRITICAL)" 
                  : metrics?.ai.mode === 'soft'
                  ? "HEURISTIC MODE (BUDGET WARNING)"
                  : "AUTONOMOUS PROFIT MAXIMIZATION ACTIVE"
                }
              </p>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest">Low Latency</div>
                <div className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest">Optimized</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
             <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-3">
               <Activity className="w-4 h-4 text-emerald-500" />
               Raw Control Log
             </h3>
             <div className="h-[400px] overflow-y-auto font-mono text-[10px] text-slate-600 bg-slate-50 p-6 rounded-[1.5rem] space-y-2 border border-slate-100/50">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 border-b border-slate-200/50 pb-2 last:border-0">
                    <span className="text-slate-400 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className="font-bold">{log}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                   <div className="h-full flex items-center justify-center opacity-20">
                     SYSTEM IDLE...
                   </div>
                )}
             </div>
          </div>

          <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem]">
            <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-widest italic mb-4">Emergency Core Shutdown</h4>
            <p className="text-[10px] text-rose-400 font-bold leading-relaxed mb-6 uppercase">
              Immediate termination of all autonomous agents. System will revert to L1 static logic. 
              THIS ACTION IS LOGGED & IRREVERSIBLE.
            </p>
            <button className="w-full bg-rose-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Initiate Safe Mode
            </button>
          </div>
        </div>

      </div>

      {/* Footer / Meta */}
      <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-grayscale duration-500">
        <div className="flex items-center gap-6">
          <Server className="w-8 h-8 text-slate-400" />
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Architecture Node</p>
            <p className="text-[12px] font-black italic text-slate-900 uppercase">EU-WEST-1-PRIMARY</p>
          </div>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
          &copy; 2026 LETSGOFOOD DATA CORP - AUTONOMOUS BI V15
        </div>
      </div>
    </div>
  );
}
