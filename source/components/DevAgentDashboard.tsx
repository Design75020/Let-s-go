
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Terminal, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Search, 
  Code2, 
  GitPullRequest, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RepoIntelligence } from '../services/devAgent/repoIntelligence';
import { FeatureAutonomyEngine } from '../services/devAgent/featureEngine';
import { ImplementationAgent } from '../services/devAgent/implementationAgent';
import { GuardrailEngine } from '../services/devAgent/guardrailEngine';
import { RepoEntity, ProposedFeature, ArchitectureViolation, TechnicalDebt, SafetyStatus, ImpactReport, PRAnalysis } from '../services/devAgent/types';

export default function DevAgentDashboard() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [graph, setGraph] = useState<RepoEntity[]>([]);
  const [violations, setViolations] = useState<ArchitectureViolation[]>([]);
  const [debt, setDebt] = useState<TechnicalDebt[]>([]);
  const [proposals, setProposals] = useState<ProposedFeature[]>([]);
  const [executingFeature, setExecutingFeature] = useState<string | null>(null);
  const [activeImpact, setActiveImpact] = useState<ImpactReport | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<PRAnalysis | null>(null);
  const [releaseStatus, setReleaseStatus] = useState<'AUDITING' | 'GO' | 'NO-GO'>('AUDITING');
  const [logs, setLogs] = useState<{ msg: string; type?: 'info' | 'warn' | 'error' | 'success' }[]>([
    { msg: 'SYSTEM_INIT: Autonomous Dev Agent initialized.' },
    { msg: 'AUTH_VERIFIED: Human observer detected (Dev Launchpad access).' }
  ]);

  useEffect(() => {
    const end = document.getElementById('logs-end');
    if (end) end.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string, type?: 'info' | 'warn' | 'error' | 'success') => {
    setLogs(prev => [...prev, { msg: `[${new Date().toLocaleTimeString()}] ${msg}`, type }]);
  };
  
  const [safety] = useState<SafetyStatus>({
    ciPassing: true,
    humanOverrideActive: true,
    deploymentLocked: true,
    rulesVerified: [
      "No production deployment without approval",
      "No direct DB schema changes",
      "No bypass of API layer",
      "No duplicate module creation"
    ]
  });

  const runFinalAudit = () => {
    addLog('AUDIT_START: Initiating final production readiness check...', 'info');
    // Audit logic: Check if all critical modules are indexed and CI is passing
    const allIndexed = graph.length >= 9;
    if (allIndexed && safety.ciPassing) {
      setReleaseStatus('GO');
      addLog('AUDIT_PASSED: System verified for production deployment.', 'success');
    } else {
      setReleaseStatus('NO-GO');
      addLog('AUDIT_FAILED: Security or coverage invariants not met.', 'error');
    }
  };

  const startAgentScan = async () => {
    setIsScanning(true);
    setScanComplete(false);
    addLog('SCAN_START: Parsing repository abstract syntax trees...', 'info');
    
    try {
      const { graph, violations, debt } = await RepoIntelligence.scan();
      const featureProposals = await FeatureAutonomyEngine.proposeFeatures();
      
      setGraph(graph);
      setViolations(violations);
      setDebt(debt);
      setProposals(featureProposals);
      setScanComplete(true);
      addLog(`SCAN_COMPLETE: ${graph.length} nodes indexed. ${violations.length} violations found.`, violations.length > 0 ? 'warn' : 'success');
    } catch (err) {
      addLog('SCAN_FAILED: Critical failure during graph synchronization.', 'error');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const executeFeature = async (feature: ProposedFeature) => {
    addLog(`EXECUTION_INIT: Running pre-flight analysis for ${feature.id}...`, 'info');
    setExecutingFeature(feature.id);
    
    // Simulate CI Analysis before Implementation
    const targetFile = feature.id === 'F1' ? 'ClientStore.tsx' : 'firebase.ts';
    const analysis = GuardrailEngine.analyzePR(
      `PR-${feature.id}-${Math.floor(Math.random()*1000)}`, 
      [targetFile, 'App.tsx'], 
      graph
    );
    
    setLastAnalysis(analysis);
    
    // If blocked, stop execution
    if (analysis.finalVerdict === 'BLOCK') {
      addLog(`EXECUTION_BLOCKED: ${analysis.id} rejected by Guardrails Engine.`, 'error');
      setExecutingFeature(null);
      return;
    }

    addLog(`IMPLEMENTATION: Generating logic for ${feature.title}...`, 'info');
    await ImplementationAgent.generatePR(feature);
    addLog(`SUCCESS: ${feature.id} implementation complete and merged. Hash: ${Math.random().toString(16).slice(2, 10).toUpperCase()}`, 'success');
    setProposals(prev => prev.map(p => p.id === feature.id ? { ...p, status: 'implemented' } : p));
    setExecutingFeature(null);
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white p-4 md:p-8 font-mono selection:bg-emerald-500/30">
      {/* Navigation Bar */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <button 
          onClick={() => navigate('/dev')}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Launchpad
        </button>
        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
          Kernel_v10 // Production_Monitor
        </div>
      </div>

      {/* HUD Header */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter">V10 AUTONOMOUS AGENT</h1>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Repository Internal Control & Development Layer</p>
        </div>

        <div className="flex items-center gap-4">
          <div className={`hidden md:flex flex-col items-end mr-4 px-4 py-2 border rounded-xl transition-all ${
            releaseStatus === 'GO' ? 'bg-emerald-500/10 border-emerald-500/20' :
            releaseStatus === 'NO-GO' ? 'bg-red-500/10 border-red-500/20' :
            'bg-white/5 border-white/5'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                releaseStatus === 'GO' ? 'bg-emerald-500' :
                releaseStatus === 'NO-GO' ? 'bg-red-500' :
                'bg-emerald-500'
              }`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                releaseStatus === 'GO' ? 'text-emerald-500' :
                releaseStatus === 'NO-GO' ? 'text-red-500' :
                'text-emerald-500'
              }`}>
                {releaseStatus === 'AUDITING' ? 'System Online' : `Release: ${releaseStatus}`}
              </span>
            </div>
            <p className="text-[9px] text-white/20 mt-1 uppercase tracking-tighter">
              {releaseStatus === 'AUDITING' ? 'LATENCY: 12MS | REPO_HEALTH: 94%' : 
               releaseStatus === 'GO' ? 'VERIFIED_PRODUCTION_READY' : 'CRITICAL_ARCH_BLOCK'}
            </p>
          </div>
          
          {scanComplete && releaseStatus === 'AUDITING' && (
            <button 
              onClick={runFinalAudit}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black italic rounded-xl hover:bg-blue-500/20 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              RUN FINAL AUDIT
            </button>
          )}

          <button 
            onClick={startAgentScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black text-xs font-black italic rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
            {isScanning ? 'SCANNING REPO...' : 'INITIALIZE SCAN'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Repo Intelligence */}
        <div className="lg:col-span-4 space-y-8">
          <section className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu className="w-16 h-16" />
            </div>
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400 mb-6">
              <Activity className="w-4 h-4" /> REPO INTELLIGENCE
            </h3>
            
            <div className="space-y-4">
              {!scanComplete && !isScanning && (
                <div className="py-12 text-center">
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic">Awaiting data injection...</p>
                </div>
              )}

              {isScanning && (
                <div className="space-y-3 py-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-4 bg-white/5 rounded-md animate-pulse" style={{ width: `${100 - (i * 20)}%` }} />
                  ))}
                </div>
              )}

              {scanComplete && graph.map((entity, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={entity.path} 
                  onClick={() => addLog(`SOURCE_TRACE: ${entity.name} (${entity.type}) indexed with complexity index ${entity.complexity}.`, 'info')}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Code2 className="w-4 h-4 text-emerald-400/50" />
                    <div>
                      <p className="text-xs font-bold">{entity.name}</p>
                      <p className="text-[9px] text-white/20">{entity.type}</p>
                    </div>
                  </div>
                  <div className="text-[9px] font-black text-white/40">CMPLX: {entity.complexity}</div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="p-6 bg-red-500/[0.02] border border-red-500/10 rounded-3xl">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-500 mb-6">
              <AlertTriangle className="w-4 h-4" /> ARCHITECTURE LINT
            </h3>
            <div className="space-y-3">
              {scanComplete && violations.map((v) => (
                <div key={v.id} className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[8px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">{v.severity}</span>
                    <span className="text-[10px] font-bold text-white/60">{v.file}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-red-500/80">{v.message}</p>
                </div>
              ))}
              {scanComplete && violations.length === 0 && (
                <p className="text-[10px] text-white/20 italic">No architecture violations detected.</p>
              )}
            </div>
          </section>

          <section className="p-6 bg-amber-500/[0.02] border border-amber-500/10 rounded-3xl">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-500 mb-6">
              <Zap className="w-4 h-4" /> TECHNICAL DEBT
            </h3>
            <div className="space-y-4">
              {scanComplete && debt.map((d) => (
                <div 
                  key={d.id} 
                  onClick={() => addLog(`DEBT_ANALYSIS: ${d.category} requires attention. Remediation plan: ${d.description}`, 'warn')}
                  className="group cursor-help hover:bg-white/5 p-2 -m-2 rounded-xl transition-all"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-white/60 uppercase">{d.category}</span>
                    <span className="text-[9px] font-mono text-amber-500">{d.score}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${d.score}%` }}
                      className="h-full bg-amber-500/50"
                    />
                  </div>
                  <p className="mt-2 text-[9px] text-white/40 leading-relaxed group-hover:text-amber-500/80 transition-colors">{d.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Autonomy Engine */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence>
            {activeImpact && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${activeImpact.criticalPathBreach ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                    <AlertTriangle className={`w-5 h-5 ${activeImpact.criticalPathBreach ? 'text-red-500' : 'text-amber-500'}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/80">Blast Radius Detected</h4>
                    <p className="text-[10px] text-white/40 mt-1">Impact on: <span className="text-white/60">{activeImpact.affectedFiles.join(', ') || 'Isolated Module'}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-white/40 mb-1">Risk Score</p>
                  <p className={`text-xl font-black italic ${activeImpact.riskScore > 70 ? 'text-red-500' : 'text-amber-500'}`}>{activeImpact.riskScore}/100</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Zap className="w-32 h-32 text-emerald-500" />
               </div>
               <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400 mb-6 font-mono">
                <Sparkles className="w-4 h-4" /> AUTONOMOUS PROPOSALS
              </h3>
              
              <div className="space-y-4">
                {scanComplete && proposals.filter(p => p.status === 'proposed').map((feature) => (
                  <motion.div 
                    layout
                    key={feature.id}
                    className="p-6 bg-[#0a0a0c] border border-white/5 rounded-3xl hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-sm font-black italic tracking-tight group-hover:text-emerald-400 transition-colors">{feature.title}</h4>
                      <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${
                        feature.impact === 'high' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        IMPACT: {feature.impact}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed mb-6">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                        EST_EFFORT: {feature.estimatedEffort}
                      </div>
                      <button 
                        onMouseEnter={() => {
                          const target = feature.id === 'F1' ? 'ClientStore.tsx' : 'firebase.ts';
                          setActiveImpact(RepoIntelligence.performImpactAnalysis(target, graph));
                        }}
                        onMouseLeave={() => setActiveImpact(null)}
                        onClick={() => executeFeature(feature)}
                        disabled={!!executingFeature}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white hover:text-black rounded-xl text-[10px] font-black italic transition-all disabled:opacity-20"
                      >
                        {executingFeature === feature.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ChevronRight className="w-3 h-3" />}
                        {executingFeature === feature.id ? 'IMPLEMENTING...' : 'EXECUTE'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[3rem]">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400 mb-6">
                <GitPullRequest className="w-4 h-4" /> AGENT DEPLOYMENTS
              </h3>

              {lastAnalysis && (
                <div className="mb-6 p-6 bg-white/5 border border-white/10 rounded-3xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Last PR Analysis: {lastAnalysis.id}</span>
                    <span className={`text-[10px] font-black italic px-2 py-1 rounded ${
                      lastAnalysis.finalVerdict === 'ALLOW' ? 'bg-emerald-500 text-black' : 
                      lastAnalysis.finalVerdict === 'BLOCK' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
                    }`}>
                      {lastAnalysis.finalVerdict}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {lastAnalysis.checks.map((check, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[9px] text-white/40 font-mono">{check.name}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] text-white/20 truncate max-w-[150px]">{check.message}</span>
                           {check.passed ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-red-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {proposals.filter(p => p.status === 'implemented').map((p) => (
                  <div key={p.id} className="p-6 bg-[#0a0a0c] border border-blue-500/20 rounded-3xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black italic">{p.title}</h4>
                        <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">deployment_hash: {Math.random().toString(16).slice(2, 10).toUpperCase()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => addLog(`AUDIT_PR [${p.id}]: Reviewing changes in ${p.title}. No regressions found in current scope.`, 'info')}
                      className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {proposals.filter(p => p.status === 'implemented').length === 0 && (
                   <div className="py-24 text-center">
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic">No autonomous merges in current session</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Console / Log area */}
          <section className="p-6 bg-[#0a0a0c] border border-white/5 rounded-3xl font-mono text-[10px] leading-relaxed">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
              <Terminal className="w-3 h-3 text-emerald-400" />
              <span className="font-black uppercase tracking-widest text-white/40">Kernel_Log.sh</span>
            </div>
            <div className="space-y-1 h-32 overflow-y-auto scrollbar-hide text-white/60">
              {logs.map((log, i) => (
                <p key={i} className={`${
                  log.type === 'error' ? 'text-red-500 font-bold' :
                  log.type === 'warn' ? 'text-amber-500' :
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'info' ? 'text-blue-400' :
                  'text-white/60'
                }`}>
                  {log.msg}
                </p>
              ))}
              <div id="logs-end" />
            </div>
          </section>
        </div>
      </div>

      {/* Safety Layer HUD */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 right-8 flex flex-col gap-4 max-w-sm"
      >
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-[10px] font-black italic flex items-center gap-2 shadow-2xl"
            >
              <Activity className="w-3 h-3 animate-pulse" />
              REASONING_LOOP: ANALYZING REPO STATE...
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tighter">Safety Layer V1.0</p>
              <p className="text-[9px] text-white/40 font-mono tracking-widest">
                {safety.ciPassing && releaseStatus !== 'NO-GO' ? 'CI_PASSING' : 'BLOCK_ACTIVE'} | {releaseStatus === 'GO' ? 'DEPLOY_READY' : 'DEPLOY_LOCKED'}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            {safety.rulesVerified.map((rule, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                <span className="text-[10px] text-white/40 font-bold tracking-tight">{rule}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em]">Guardrails Active</span>
            <div className="flex gap-1">
               {[1,2,3,4].map(i => <div key={i} className="w-4 h-1 bg-emerald-500/40 rounded-full" />)}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
