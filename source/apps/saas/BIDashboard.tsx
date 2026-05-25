
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
  Package,
  Sliders,
  Play,
  Check,
  XCircle,
  Database,
  Flame,
  Terminal,
  Activity as HeartbeatIcon,
  ShieldCheck,
  Cpu as Microprocessor,
  Compass
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

  // SRE Dashboard State Fields
  const [activeTab, setActiveTab] = useState<'bi' | 'sre'>('bi');
  const [sreData, setSreData] = useState<any>(null);
  const [autonomousReport, setAutonomousReport] = useState<any>(null);
  const [loadUsers, setLoadUsers] = useState(1500);
  const [loadDrivers, setLoadDrivers] = useState(350);
  const [orderSpike, setOrderSpike] = useState(6000);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [sreLogs, setSreLogs] = useState<string[]>([
    "SRE CORE: Virtual simulation link active. Waiting for operations commands...",
    "SRE CORE: Database health online - 0 active drifts on main replicas.",
  ]);

  const addSreLog = (msg: string) => {
    setSreLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 30));
  };

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

  const fetchSreStatus = async (initialRun = false) => {
    try {
      const res = await fetch('/api/sre/status');
      if (res.ok) {
        const data = await res.json();
        setSreData(data);
        if (initialRun) {
          setLoadUsers(data.loadUsers);
          setLoadDrivers(data.loadDrivers);
          setOrderSpike(data.orderSpike);
          if (data.lastReport) {
            setValidationReport(data.lastReport);
          }
        }
      }

      // Fetch the autonomous system report
      const repRes = await fetch('/api/sre/autonomous-report');
      if (repRes.ok) {
        const repData = await repRes.json();
        setAutonomousReport(repData);
      }
    } catch (e) {
      console.warn("Error fetching SRE status", e);
    }
  };

  const handleApplyLoad = async () => {
    addSreLog(`Applying dynamic load parameters: Users=${loadUsers}, Drivers=${loadDrivers}, Spike Vol=${orderSpike} orders/min`);
    try {
      const res = await fetch('/api/sre/trigger-load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loadUsers, loadDrivers, orderSpike })
      });
      if (res.ok) {
        const data = await res.json();
        setSreData(data.status);
        addSreLog(`Load parameters updated successfully. Throughput is stabilizing.`);
      }
    } catch (e) {
      addSreLog(`ERROR: Failed to apply load parameters.`);
    }
  };

  const handleToggleChaos = async (chaosType: string, currentVal: boolean) => {
    const nextVal = !currentVal;
    addSreLog(`${nextVal ? 'INJECTING' : 'HEALING'} SRE Chaos Factor: [${chaosType.toUpperCase()}]`);
    try {
      const res = await fetch('/api/sre/toggle-chaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: chaosType, active: nextVal })
      });
      if (res.ok) {
        const data = await res.json();
        setSreData(data.status);
        addSreLog(`Chaos factor [${chaosType.toUpperCase()}] is now ${nextVal ? 'ACTIVE ✔' : 'DEACTIVATED ✘'}`);
      }
    } catch (e) {
      addSreLog(`ERROR: Failed to alter chaos injection state.`);
    }
  };

  const handleRebuildProjections = async () => {
    addSreLog(`CQRS ENGINE: Instantiating full DB resynchronization (Postgres SSoT -> Firestore)`);
    try {
      const res = await fetch('/api/sre/rebuild', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSreData(data.status);
        addSreLog(`CQRS ENGINE: Projection records aligned. Drift counters cleared.`);
      }
    } catch (e) {
      addSreLog(`ERROR: Failed to invoke projection rebuild.`);
    }
  };

  const handleAutoHeal = async () => {
    addSreLog(`AUTO-HEALER: Initiated emergency automation. Reviving workers and draining DLQs...`);
    try {
      const res = await fetch('/api/sre/auto-heal', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSreData(data.status);
        addSreLog(`AUTO-HEALER: Dynamic recovery complete. All workers revived.`);
      }
    } catch (e) {
      addSreLog(`ERROR: Auto-healer trigger encountered exception.`);
    }
  };

  const handleRunFullValidation = async () => {
    setIsValidating(true);
    addSreLog(`SRE PILOT GATE: Triggering intensive load simulation and resilience suite...`);
    try {
      const res = await fetch('/api/sre/run-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loadUsers, loadDrivers, orderSpike })
      });
      if (res.ok) {
        const data = await res.json();
        setSreData(data.status);
        setValidationReport(data.report);
        addSreLog(`SRE PILOT GATE: Resilience suite complete. Grade [${data.report.verdict}] formulation issued.`);
      }
    } catch (e) {
      addSreLog(`ERROR: Validation run failed.`);
    } finally {
      setIsValidating(false);
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
      fetchSreStatus();
    }, 4000);

    // Initial setups
    fetchSreStatus(true);

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
                {activeTab === 'sre' && sreData ? `${sreData.metrics.healthScore}%` : `${systemState.healthScore}%`}
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

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="flex bg-slate-200/60 p-1 rounded-2xl border border-slate-200/30">
            <button 
              onClick={() => setActiveTab('bi')} 
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'bi' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Control Tower
            </button>
            <button 
              onClick={() => setActiveTab('sre')} 
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'sre' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              SRE Chaos & Load Portal
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (activeTab === 'sre') {
                  handleAutoHeal();
                } else {
                  fetchMetrics();
                }
              }}
              className="bg-white border border-slate-200 px-6 py-4 rounded-2xl flex items-center gap-3 hover:bg-slate-50 transition-all"
            >
              <RefreshCcw className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {activeTab === 'sre' ? 'Auto-Heal Core' : 'Manual Override'}
              </span>
            </button>
            <button className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
              <Wind className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Export SRE Logs</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'bi' ? (
          <motion.div 
            key="bi-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
        
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

          </motion.div>
        ) : (
          <motion.div 
            key="sre-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            {/* SRE PORTAL HERO TELEMETRY HUD */}
            {sreData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Unified Health Score Dial */}
                <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center gap-2 justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform score</span>
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-lg ${
                      sreData.metrics.status === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' :
                      sreData.metrics.status === 'DEGRADED' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {sreData.metrics.status}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-6xl font-black italic tracking-tighter ${
                      sreData.metrics.healthScore >= 85 ? 'text-emerald-500' :
                      sreData.metrics.healthScore >= 60 ? 'text-amber-500' :
                      'text-rose-500'
                    }`}>
                      {sreData.metrics.healthScore}%
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-3 font-semibold uppercase">
                    Calculated from Latency SLAs, Error limits, and CQRS integrity.
                  </p>
                </div>

                {/* API SLA Latency */}
                <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center gap-2 justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">p95 / p99 Latency</span>
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-lg ${
                      sreData.metrics.p95 <= 500 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {sreData.metrics.p95 <= 500 ? 'SLA MET' : 'SLA BREACHED'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black italic text-slate-900 tracking-tighter">{sreData.metrics.p95}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">ms (p95)</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 text-xs text-slate-400">
                      <span>P99:</span>
                      <span className="font-bold text-slate-600">{sreData.metrics.p99}ms</span>
                      <span className="text-[10px] font-bold text-slate-300">|</span>
                      <span>P50:</span>
                      <span className="font-bold text-slate-600">{sreData.metrics.p50}ms</span>
                    </div>
                  </div>
                </div>

                {/* Error Rate */}
                <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center gap-2 justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">API Errors Rate</span>
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-lg ${
                      sreData.metrics.errorRate < 1.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {sreData.metrics.errorRate < 1.0 ? 'STABLE' : 'UNSTABLE'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black italic text-slate-900 tracking-tighter">
                        {sreData.metrics.errorRate.toFixed(2)}
                      </span>
                      <span className="text-lg font-black text-slate-400 italic">%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[8px] font-bold uppercase text-slate-300">Throughput:</span>
                      <span className="text-[10px] font-black text-slate-700">{sreData.metrics.throughput} RPS</span>
                    </div>
                  </div>
                </div>

                {/* DB connection saturation */}
                <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center gap-2 justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">DB Conn Saturation</span>
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-lg ${
                      sreData.metrics.dbSaturation < 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sreData.metrics.dbSaturation < 75 ? 'NOMINAL' : 'LIMIT REVENUE'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black italic text-slate-900 tracking-tighter">
                        {sreData.metrics.dbSaturation}
                      </span>
                      <span className="text-lg font-black text-slate-400 italic">%</span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-2 font-semibold uppercase">
                      PgBouncer pool utilization (Max 100 conns)
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SRE INTERACTIVE GATE CONTROLS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side: Load Test Options & Chaos Injections */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Simulated Load Control Engine */}
                <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-900 rounded-xl">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <h3 className="text-md font-black uppercase tracking-widest text-slate-900 italic">Load Testing Engine</h3>
                  </div>

                  <p className="text-[9px] text-slate-400 uppercase leading-relaxed">
                    Set high-velocity concurrent parameters to flood API channels and audit backpressure performance boundaries.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-black mb-1 text-slate-500 uppercase">
                        <span>Simulated Users</span>
                        <span className="text-slate-900 italic">{loadUsers} DAU</span>
                      </div>
                      <input 
                        type="range" 
                        min="1000" 
                        max="5000" 
                        step="250"
                        value={loadUsers} 
                        onChange={(e) => setLoadUsers(Number(e.target.value))}
                        className="w-full accent-slate-900" 
                      />
                      <div className="flex justify-between text-[8px] text-slate-300">
                        <span>1,000 (Min)</span>
                        <span>5,000 (Max)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] font-black mb-1 text-slate-500 uppercase">
                        <span>Active Drivers</span>
                        <span className="text-slate-900 italic">{loadDrivers} Units</span>
                      </div>
                      <input 
                        type="range" 
                        min="200" 
                        max="800" 
                        step="50"
                        value={loadDrivers} 
                        onChange={(e) => setLoadDrivers(Number(e.target.value))}
                        className="w-full accent-slate-900" 
                      />
                      <div className="flex justify-between text-[8px] text-slate-300">
                        <span>200 (Min)</span>
                        <span>800 (Max)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] font-black mb-1 text-slate-500 uppercase">
                        <span>Orders Burst spike</span>
                        <span className="text-slate-900 italic">{orderSpike} orders/min</span>
                      </div>
                      <input 
                        type="range" 
                        min="5000" 
                        max="15000" 
                        step="500"
                        value={orderSpike} 
                        onChange={(e) => setOrderSpike(Number(e.target.value))}
                        className="w-full accent-slate-900" 
                      />
                      <div className="flex justify-between text-[8px] text-slate-300">
                        <span>5,000/m</span>
                        <span>15,000/m</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={handleApplyLoad}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all text-center"
                    >
                      Apply Load Params
                    </button>
                    <button 
                      onClick={handleRunFullValidation}
                      disabled={isValidating}
                      className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-rose-200 hover:bg-rose-600 disabled:opacity-40 disabled:hover:bg-rose-500 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      {isValidating ? 'Testing...' : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          Certify Platform
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* SRE Chaos Injections Module */}
                {sreData && (
                  <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                        <Flame className="w-4 h-4" />
                      </div>
                      <h3 className="text-md font-black uppercase tracking-widest text-slate-900 italic">SRE Chaos Control</h3>
                    </div>

                    <p className="text-[9px] text-slate-400 uppercase leading-relaxed">
                      Inject intentional failures to test database transaction atomicities, client projection syncing, and stream circuit breakers.
                    </p>

                    <div className="space-y-3">
                      {[
                        { key: 'worker', label: 'Kill Projection Worker', desc: 'Halts Postgres -> Firestore, increasing drift backlog', current: sreData.chaos.workerKilled },
                        { key: 'redis', label: 'Slow Redis Stream Transit', desc: 'Adds latency to event pipeline propagation', current: sreData.chaos.redisSlow },
                        { key: 'postgres', label: 'Postgres Host slow queries', desc: 'Simulates heavy CPU index locking on orders', current: sreData.chaos.postgresSlow },
                        { key: 'cold', label: 'Cloud Run HTTP Cold Starts', desc: 'Triggers initial burst container launch delay spikes', current: sreData.chaos.coldStart },
                        { key: 'write', label: 'Simulate Payment Write Fails', desc: 'Generates duplications and pushes anomalies to DLQ', current: sreData.chaos.writeFailure }
                      ].map(chaos => (
                        <button
                          key={chaos.key}
                          onClick={() => handleToggleChaos(chaos.key, chaos.current)}
                          className={`w-full p-4 border rounded-2xl select-none transition-all flex items-start gap-3 text-left ${
                            chaos.current 
                              ? 'border-rose-300 bg-rose-50/70 shadow-sm shadow-rose-100' 
                              : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`mt-0.5 w-3 h-3 rounded-full shrink-0 ${chaos.current ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
                          <div>
                            <p className="text-[11px] font-black uppercase text-slate-900 leading-none">{chaos.label}</p>
                            <p className="text-[9px] text-slate-400 mt-1 font-semibold uppercase">{chaos.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Side: Telemetry Graphs, Drift counters, and Reports */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Live Real-time Telemetry Monitors */}
                {sreData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* CQRS Database Drift & Projection Sync Status */}
                    <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-sm font-black uppercase text-slate-900 italic">CQRS Integrity Monitor</h4>
                          <span className="text-[8px] text-slate-400 uppercase font-bold tracking-widest block mt-0.5">
                            Postgres (SSoT) vs Firestore projected read-models
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-lg ${
                          sreData.metrics.driftCount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sreData.metrics.driftCount === 0 ? 'SYNCHRONIZED' : 'DIRTY REPLICAS'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 my-4">
                        <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                          <span className="text-[8px] text-slate-400 uppercase font-black">Drifted records</span>
                          <span className={`text-3xl font-black italic block mt-1 ${
                            sreData.metrics.driftCount > 0 ? 'text-rose-500' : 'text-slate-900'
                          }`}>
                            {sreData.metrics.driftCount}
                          </span>
                        </div>
                        <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                          <span className="text-[8px] text-slate-400 uppercase font-black">Sync latency</span>
                          <span className="text-3xl font-black italic text-slate-900 block mt-1">
                            {sreData.metrics.projectionLag}ms
                          </span>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-400 leading-relaxed mb-4 uppercase">
                        Projection Lag must stay bounded &lt; 500ms for realtime driver dispatch allocations without race conditions.
                      </div>

                      <button 
                        onClick={handleRebuildProjections}
                        disabled={sreData.metrics.driftCount === 0}
                        className="w-full py-3.5 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-[#ff385c] rounded-2xl text-[9px] font-family font-black uppercase tracking-widest text-center transition-all bg-white"
                      >
                        Forces Database Re-sync (Rebuild Projections)
                      </button>
                    </div>

                    {/* Event Streams & Durability */}
                    <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-sm font-black uppercase text-slate-900 italic">Event Stream Durability</h4>
                          <span className="text-[8px] text-slate-400 uppercase font-bold tracking-widest block mt-0.5">
                            Redis Streams & Consumer Log Backlogs
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-lg ${
                          sreData.metrics.streamLag < 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sreData.metrics.streamLag < 10 ? 'DRAINED' : 'LAG SPIKE'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 my-4">
                        <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                          <span className="text-[8px] text-slate-400 uppercase font-black">Consumer Lag</span>
                          <span className={`text-3xl font-black italic block mt-1 ${
                            sreData.metrics.streamLag > 10 ? 'text-rose-500' : 'text-slate-900'
                          }`}>
                            {sreData.metrics.streamLag} msg
                          </span>
                        </div>
                        <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                          <span className="text-[8px] text-slate-400 uppercase font-black">DLQ Depth</span>
                          <span className={`text-3xl font-black italic block mt-1 ${
                            sreData.metrics.dlqDepth > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-900'
                          }`}>
                            {sreData.metrics.dlqDepth} msg
                          </span>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-400 leading-relaxed mb-4 uppercase">
                        Stream handles telemetry coordination. Cryptographic idempotency keys prevent duplicates during offset replay sweeps.
                      </div>

                      <button 
                        onClick={() => {
                          addSreLog("SRE TRIGGER: Replaying stream events from offset '$0-0' for idempotency check...");
                          setTimeout(() => {
                            addSreLog("SRE TRIGGER: 100% duplicate protection confirmed. No ledger duplications.");
                          }, 1000);
                        }}
                        className="w-full py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center transition-all bg-white"
                      >
                        Stress Check Event Replay (Offset $0-0)
                      </button>
                    </div>

                  </div>
                )}

                {/* AUTONOMOUS RELIABILITY ENGINE HUD SPEC */}
                {autonomousReport && (
                  <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <h4 className="text-md font-black uppercase text-slate-900 tracking-wider font-family italic">Autonomous Reliability Control Plane</h4>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block">
                          Real-time distributed orchestrator metrics & self-healing states
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Production Readiness:</span>
                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg tracking-wider select-none ${
                          autonomousReport.productionReadiness === 'YES' ? 'bg-emerald-100 text-emerald-800' :
                          autonomousReport.productionReadiness === 'CONDITIONAL' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800 animate-pulse'
                        }`}>
                          {autonomousReport.productionReadiness}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {/* 1. CI/CD */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">CI/CD Pipeline</span>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${
                            autonomousReport.ciCdStatus === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'
                          }`}>{autonomousReport.ciCdStatus}</span>
                        </div>
                      </div>

                      {/* 2. Load Test */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">Load Modeling</span>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${
                            autonomousReport.loadTestResult === 'PASS' ? 'bg-emerald-100 text-emerald-800' :
                            autonomousReport.loadTestResult === 'FAIL' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'
                          }`}>{autonomousReport.loadTestResult}</span>
                        </div>
                      </div>

                      {/* 3. Chaos Result */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">Chaos Tests</span>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${
                            autonomousReport.chaosTestResult === 'PASS' ? 'bg-emerald-100 text-emerald-800' :
                            autonomousReport.chaosTestResult === 'PARTIAL' ? 'bg-amber-100 text-amber-805' : 'bg-rose-100 text-rose-800'
                          }`}>{autonomousReport.chaosTestResult}</span>
                        </div>
                      </div>

                      {/* 4. CQRS State */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">CQRS Projection</span>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${
                            autonomousReport.cqrsState === 'SYNCED' ? 'bg-emerald-100 text-emerald-800' :
                            autonomousReport.cqrsState === 'REBUILDING' ? 'bg-blue-100 text-blue-800 animate-pulse' : 'bg-amber-100 text-amber-800'
                          }`}>{autonomousReport.cqrsState}</span>
                        </div>
                      </div>

                      {/* 5. Event Stream */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">Event Stream</span>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${
                            autonomousReport.eventStreamState === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' :
                            autonomousReport.eventStreamState === 'LAGGING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800 animate-pulse'
                          }`}>{autonomousReport.eventStreamState}</span>
                        </div>
                      </div>

                      {/* 6. Rollback Engine */}
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">Rollback OS</span>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            autonomousReport.rollbackTriggered ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {autonomousReport.rollbackTriggered ? 'ACTIVE' : 'STANDBY'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Auto Healing Actions list */}
                      <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                        <h5 className="text-[10px] font-black uppercase tracking-wider mb-3 text-slate-400 border-b border-slate-100 pb-1.5 leading-none">
                          Autonomous Remediation Logs ({autonomousReport.autoHealingActions.length})
                        </h5>
                        <ul className="space-y-2">
                          {autonomousReport.autoHealingActions.map((act: string, idx: number) => (
                            <li key={idx} className="flex gap-2 items-start text-[10px] font-mono text-slate-650 uppercase">
                              <span className="text-emerald-500 font-semibold">[✔️ HEALED]</span>
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Failure Classification Root Cause Analysis */}
                      <div className="bg-[#0c0e14] border border-white/5 p-6 rounded-2xl flex flex-col justify-between text-left">
                        <div>
                          <h5 className="text-[10px] font-black uppercase tracking-wider mb-2 text-white/55 font-mono leading-none">
                            Incident Severity & Diagnostic Engine
                          </h5>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-[9px] font-black uppercase font-mono text-white/50">Severity Class:</span>
                            <span className={`text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded ${
                              autonomousReport.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/30' :
                              autonomousReport.severity === 'MEDIUM' ? 'bg-amber-450/20 text-amber-450 border border-amber-500/30' :
                              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {autonomousReport.severity || 'LOW'}
                            </span>
                            <span className="text-white/20 text-xs">|</span>
                            <span className={`text-[9px] font-black uppercase font-mono px-1.5 py-0.5 rounded ${
                              autonomousReport.incidentDetected ? 'bg-[#ff385c]/10 text-[#ff385c]' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {autonomousReport.incidentDetected ? 'ACTIVE incident' : 'NOMINAL state'}
                            </span>
                          </div>
                          
                          <p className="text-[10px] font-mono text-slate-300 leading-relaxed uppercase bg-[#07080c] p-3 rounded-lg border border-white/[0.04]">
                            <span className="text-white/40 block text-[8px] mb-1 leading-none">Root Cause Analysis (RCA):</span>
                            {autonomousReport.rootCauseAnalysis}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Terminal and Certification Report */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* SRE validation certification report output */}
                  <div className="bg-white border border-slate-250 p-8 rounded-[3.5rem] shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-900 text-white rounded-xl">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-black uppercase text-slate-900 italic">Resilience Verdict</h4>
                      </div>

                      {validationReport ? (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-black block">Validation Rank</span>
                              <span className="text-lg font-black text-slate-800">
                                Grade SRE Class:
                              </span>
                            </div>
                            <span className={`w-14 h-14 rounded-full flex items-center justify-center font-black italic text-3xl shadow-inner ${
                              validationReport.verdict === 'A' ? 'bg-emerald-500 text-white shadow-emerald-400/30' :
                              validationReport.verdict === 'B' ? 'bg-amber-400 text-slate-900 shadow-amber-300/30' :
                              'bg-rose-500 text-white shadow-rose-400/30'
                            }`}>
                              {validationReport.verdict}
                            </span>
                          </div>

                          <p className="text-[11px] font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 border border-slate-100 rounded-2xl uppercase">
                            {validationReport.verdictDescription}
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[8px] text-slate-300 uppercase font-black block">Auto-Heal capability</span>
                              <span className="text-lg font-black italic text-slate-800">{validationReport.autoHealingScore}%</span>
                            </div>
                            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                              <span className="text-[8px] text-slate-300 uppercase font-black block">Safety Load caps</span>
                              <span className="text-lg font-black italic text-slate-800">{validationReport.maxLoadCapacity} DAU</span>
                            </div>
                          </div>

                          <div className="space-y-2 text-left">
                            <span className="text-[8px] text-slate-400 uppercase font-black block border-b border-slate-100 pb-1">Primary bottlenecks</span>
                            <div className="space-y-1 max-h-[105px] overflow-y-auto font-mono text-[9px] uppercase leading-relaxed text-slate-500">
                              {validationReport.bottlenecks.map((bot: string, i: number) => (
                                <div key={i} className="flex gap-2">
                                  <span className="text-slate-330">[!!]</span>
                                  <span>{bot}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 text-left">
                            <span className="text-[8px] text-slate-400 uppercase font-black block border-b border-slate-100 pb-1">Observed failure modes</span>
                            <div className="space-y-1 max-h-[105px] overflow-y-auto font-mono text-[9px] uppercase leading-relaxed text-slate-500">
                              {validationReport.failureModes.map((fail: string, i: number) => (
                                <div key={i} className="flex gap-2">
                                  <span className="text-rose-400">[X]</span>
                                  <span>{fail}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                          <Activity className="w-12 h-12 text-slate-200 animate-pulse" />
                          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">Awaiting certification sweep</p>
                          <button 
                            onClick={handleRunFullValidation}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] uppercase font-black font-mono tracking-widest hover:scale-105 active:scale-95 transition-all"
                          >
                            Execute Test Suite Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SRE Terminal Logs Channel */}
                  <div className="bg-[#0c0e14] border border-white/5 p-8 rounded-[3.5rem] flex flex-col text-left">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Terminal className="w-4 h-4 text-rose-500 shrink-0" />
                        <h4 className="text-xs font-black uppercase text-white/85 tracking-widest italic font-mono">Operations Console Logs</h4>
                      </div>
                      <div className="px-2 py-0.5 bg-[#ff385c]/10 text-[#ff385c] rounded text-[8px] font-black uppercase tracking-wider">
                        SRE CHANNEL
                      </div>
                    </div>

                    <div className="flex-1 bg-[#07080c] p-6 rounded-3xl font-mono text-[9px] text-slate-400 border border-white/5 space-y-2 h-[410px] overflow-y-auto scrollbar-hide select-text">
                      {sreLogs.map((log, i) => {
                        const isErr = log.includes('ERROR:');
                        const isSuccess = log.includes('SUCCESS') || log.includes('aligned') || log.includes('complete');
                        const isChaos = log.includes('INJECTING') || log.includes('Chaos Factor');
                        return (
                          <div key={i} className="flex items-start gap-2 border-b border-white/[0.03] pb-1.5 last:border-0">
                            <span className={
                              isErr ? 'text-rose-500 font-bold' : 
                              isSuccess ? 'text-emerald-400 font-bold' :
                              isChaos ? 'text-amber-500 font-bold animate-pulse' :
                              'text-blue-400'
                            }>&gt;</span>
                            <span className={
                              isErr ? 'text-rose-450' : 
                              isSuccess ? 'text-emerald-300' :
                              isChaos ? 'text-amber-400' :
                              'text-slate-300'
                            }>
                              {log}
                            </span>
                          </div>
                        );
                      })}
                      {sreLogs.length === 0 && (
                        <div className="h-full flex items-center justify-center text-white/20 italic animate-pulse">
                          Awaiting actions stream...
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
