/**
 * /source/components/OpsDashboard.tsx
 *
 * High-performance SRE Operations & AI Agents Factory monitoring environment.
 * Enables live prompt trigger execution, pipeline state tracing, and artifact code inspections.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Bot, 
  Cpu, 
  Layers, 
  Settings, 
  Zap, 
  Github, 
  ExternalLink, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  RefreshCw, 
  Search, 
  Sparkles, 
  History,
  FileCode,
  ArrowRight,
  Database,
  CloudLightning,
  Boxes,
  MapPin,
  FileCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PipelineLog {
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success';
}

interface PipelineRun {
  id: string;
  prompt: string;
  status: 'PENDING' | 'MANUS_COMPLETED' | 'CODEX_COMPLETED' | 'GITHUB_PUSHED' | 'DEPLOYING' | 'SUCCESS' | 'FAILED';
  manusOutput?: {
    architectureStyle: string;
    services: {
      name: string;
      description: string;
      endpoints: { method: string; path: string; description: string }[];
    }[];
    dataPlane: {
      primaryDatabase: string;
      cache: string;
      messageBroker: string;
    };
    deploymentTarget: {
      platform: string;
      healthCheckPath: string;
    };
    constraints: string[];
  };
  codexOutput?: {
    status: 'ok' | 'error';
    filesGenerated: { path: string; content: string }[];
    buildLog?: string;
  };
  githubRepo?: string;
  cloudRunUrl?: string;
  errorMessage?: string;
  logs: PipelineLog[];
  timestamp: string;
}

export default function OpsDashboard() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
  const [activeFileTab, setActiveFileTab] = useState<string>('');
  const [activeFileContent, setActiveFileContent] = useState<string>('');
  
  // Status check filters
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'SUCCESS' | 'FAILED'>('ALL');

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 4000); // Continuous polling for ops monitor updates
    return () => clearInterval(interval);
  }, []);

  const fetchRuns = async () => {
    try {
      const res = await fetch('/api/agents/runs');
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
        // Sync selected run if open to show real-time logs
        if (selectedRun) {
          const updated = data.find((r: PipelineRun) => r.id === selectedRun.id);
          if (updated) {
            setSelectedRun(updated);
            // Default select first file if none selected
            if (updated.codexOutput?.filesGenerated?.length && !activeFileTab) {
              setActiveFileTab(updated.codexOutput.filesGenerated[0].path);
              setActiveFileContent(updated.codexOutput.filesGenerated[0].content);
            }
          }
        }
      }
    } catch (e) {
      console.error("OpsDashboard: Runs fetch failed", e);
    }
  };

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    // Optimistically set running
    const originalPrompt = prompt;
    setPrompt('');

    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: originalPrompt })
      });

      if (response.ok) {
        // Refresh running status
        await fetchRuns();
      } else {
        alert("Failed to initiate run. Please verify your internet connection or try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting orchestrator.");
    } finally {
      setIsRunning(false);
    }
  };

  const selectRun = (run: PipelineRun) => {
    setSelectedRun(run);
    if (run.codexOutput?.filesGenerated?.length) {
      setActiveFileTab(run.codexOutput.filesGenerated[0].path);
      setActiveFileContent(run.codexOutput.filesGenerated[0].content);
    } else {
      setActiveFileTab('');
      setActiveFileContent('');
    }
  };

  const filteredRuns = runs.filter(r => {
    if (filter === 'ACTIVE') return r.status !== 'SUCCESS' && r.status !== 'FAILED';
    if (filter === 'SUCCESS') return r.status === 'SUCCESS';
    if (filter === 'FAILED') return r.status === 'FAILED';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#06070a] text-white p-6 font-mono selection:bg-[#ff385c]/30">
      
      {/* Upper Navigation HUD */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dev')}
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#ff385c] transition-all"
          >
            ← Launchpad
          </button>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            V15_FACTORY_OPS // CENTRAL_CONTROL
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] uppercase font-black tracking-widest">SRE_SYSTEM_ACTIVE</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Pipeline Trigger & Tracing History */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Section: Product prompt submit */}
          <div className="p-6 bg-[#0c0e14] border border-white/5 rounded-3xl shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-[#ff385c]" />
              <h2 className="text-xs font-black uppercase tracking-widest text-white/80">Launch Agent Pipeline</h2>
            </div>
            
            <form onSubmit={handleTrigger} className="space-y-4">
              <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-normal">
                Input dynamic software prompt below. Manus will build the spec sheet, Codex will build the containerized files, and Deploy will push branch overlays to Cloud Run.
              </p>
              
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Build an auto-scaling orders matching dispatch engine with a health gateway and live telemetry routes."
                  rows={4}
                  className="w-full bg-[#07080c] border border-white/10 text-xs text-white/90 p-3 rounded-2xl focus:outline-none focus:border-[#ff385c] transition-colors resize-none placeholder:text-white/20"
                />
              </div>

              <button
                type="submit"
                disabled={isRunning || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff385c] hover:bg-[#e0304f] disabled:opacity-20 disabled:hover:bg-[#ff385c] text-white text-[11px] font-black italic rounded-2xl transition-all cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    RUNNING PIPELINE CARRIERS...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    TRIGGER SOFTWARE FACTORY
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Section: Live runs index tracker */}
          <div className="p-6 bg-[#0c0e14] border border-white/5 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#ff385c]/80" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Execution History</h3>
              </div>
              
              <div className="flex gap-1">
                {(['ALL', 'ACTIVE', 'SUCCESS'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-[8px] font-black px-1.5 py-0.5 rounded transition-all ${
                      filter === f ? 'bg-[#ff385c] text-white' : 'bg-white/5 text-white/40 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 dark:scrollbar-hide max-h-[360px] overflow-y-auto pr-1">
              {filteredRuns.map((run) => {
                const isSelected = selectedRun?.id === run.id;
                const date = new Date(run.timestamp);
                
                let badgeColor = 'bg-amber-500/20 text-amber-500';
                if (run.status === 'SUCCESS') badgeColor = 'bg-emerald-500/20 text-emerald-400';
                if (run.status === 'FAILED') badgeColor = 'bg-red-500/20 text-red-500';

                return (
                  <motion.div
                    key={run.id}
                    onClick={() => selectRun(run)}
                    className={`p-4 bg-[#07080c] border rounded-2xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#ff385c] bg-[#ff385c]/5 shadow-[0_0_15px_rgba(255,56,92,0.15)]' 
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-white/40">RUN_ID: #{run.id}</span>
                        <div className="text-[9px] text-white/20 uppercase tracking-tighter">
                          {date.toLocaleString()}
                        </div>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${badgeColor}`}>
                        {run.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/65 line-clamp-2 leading-relaxed">
                      {run.prompt}
                    </p>
                  </motion.div>
                );
              })}

              {filteredRuns.length === 0 && (
                <div className="py-12 text-center text-white/25 text-[10px] italic">
                  No execution runs matched filter criteria.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Pipeline Inspection Hub */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedRun ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                
                {/* HUD Panel for Selected Execution */}
                <div className="p-6 bg-[#0c0e14] border border-white/5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-black text-[#ff385c]">EXECUTION ACTIVE STATE</h2>
                      <span className="h-4 w-px bg-white/10" />
                      <span className="text-[11px] font-bold text-white/60">ID: #{selectedRun.id}</span>
                    </div>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] mt-1">
                      System prompts: "{selectedRun.prompt}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedRun.githubRepo && (
                      <a
                        href={selectedRun.githubRepo}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-all"
                      >
                        <Github className="w-3.5 h-3.5" />
                        GitHub Commit
                        <ExternalLink className="w-2.5 h-2.5 text-white/40" />
                      </a>
                    )}
                    
                    {selectedRun.cloudRunUrl && (
                      <a
                        href={selectedRun.cloudRunUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff385c]/10 hover:bg-[#ff385c]/20 border border-[#ff385c]/30 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#ff385c] transition-all"
                      >
                        <CloudLightning className="w-3.5 h-3.5" />
                        Live App Preview
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Panel 1: Manus Systems Architect Outline */}
                  <div className="p-6 bg-[#0c0e14] border border-[#ff385c]/10 rounded-3xl shadow-xl space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4.5 h-4.5 text-[#ff385c]" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Manus Systems Design</h3>
                    </div>
                    
                    {selectedRun.manusOutput ? (
                      <div className="space-y-4 font-sans max-h-[350px] overflow-y-auto pr-1">
                        <div className="bg-[#07080c] p-3 rounded-2xl border border-white/5">
                          <span className="text-[9px] font-mono font-black text-[#ff385c] uppercase block">Architecture Pattern</span>
                          <span className="text-xs font-bold text-white/90">{selectedRun.manusOutput.architectureStyle}</span>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[9px] font-mono font-black text-white/40 uppercase block">Configured micro services</span>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedRun.manusOutput.services.map((srv, i) => (
                              <div key={i} className="bg-[#07080c] p-3 rounded-2xl border border-white/5 space-y-1">
                                <span className="text-xs font-black text-white/80 font-mono">■ {srv.name.toUpperCase()} Service</span>
                                <p className="text-[10px] text-white/50 leading-relaxed font-sans">{srv.description}</p>
                                <div className="pt-1 flex flex-wrap gap-1">
                                  {srv.endpoints.map((ep, j) => (
                                    <span key={j} className="text-[8px] font-mono bg-white/5 text-[#ff385c]/95 px-1.5 py-0.5 rounded-md border border-white/5">
                                      {ep.method} {ep.path}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[9px] font-mono font-black text-white/40 uppercase block">Persistence & Network planes</span>
                          <div className="grid grid-cols-3 gap-2 text-[10px]">
                            <div className="bg-[#07080c] p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
                              <Database className="w-4 h-4 text-white/40 mb-1" />
                              <span className="text-[8px] text-white/30 truncate max-w-full">SQL Store</span>
                              <span className="font-bold truncate max-w-full">{selectedRun.manusOutput.dataPlane.primaryDatabase}</span>
                            </div>
                            <div className="bg-[#07080c] p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
                              <Boxes className="w-4 h-4 text-white/40 mb-1" />
                              <span className="text-[8px] text-white/30 truncate max-w-full">Cache Layer</span>
                              <span className="font-bold truncate max-w-full">{selectedRun.manusOutput.dataPlane.cache}</span>
                            </div>
                            <div className="bg-[#07080c] p-2 rounded-xl border border-white/5 flex flex-col items-center text-center">
                              <CloudLightning className="w-4 h-4 text-white/40 mb-1" />
                              <span className="text-[8px] text-white/30 truncate max-w-full">Message Bus</span>
                              <span className="font-bold truncate max-w-full">{selectedRun.manusOutput.dataPlane.messageBroker}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-24 text-center text-white/20 text-[10px] italic font-sans animate-pulse">
                        Awaiting Manus architectural planning step...
                      </div>
                    )}
                  </div>

                  {/* Panel 2: Live Log-stream Console */}
                  <div className="p-6 bg-[#0c0e14] border border-white/5 rounded-3xl shadow-xl flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <Terminal className="w-4.5 h-4.5 text-[#ff385c]" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Active Log Console</h3>
                    </div>

                    <div className="flex-1 bg-[#07080c] border border-white/5 rounded-2xl p-4 font-mono text-[10px] leading-relaxed overflow-y-auto max-h-[350px] scrollbar-hide space-y-2">
                      {selectedRun.logs.map((log, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-white/20">[{log.timestamp}]</span>
                          <span className={
                            log.type === 'error' ? 'text-red-500 font-bold' :
                            log.type === 'warn' ? 'text-amber-500' :
                            log.type === 'success' ? 'text-emerald-400 font-bold' :
                            'text-blue-400'
                          }>
                            {log.message}
                          </span>
                        </div>
                      ))}
                      
                      {selectedRun.status !== 'SUCCESS' && selectedRun.status !== 'FAILED' && (
                        <div className="flex items-center gap-2 text-white/40 animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Streaming live run coordinates...</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Panel 3: Codex Implementation Inspector */}
                <div className="p-6 bg-[#0c0e14] border border-white/5 rounded-3xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4.5 h-4.5 text-[#ff385c]" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Codex File-System Output</h3>
                    </div>
                    {selectedRun.codexOutput?.filesGenerated?.length && (
                      <span className="text-[10px] font-bold text-white/40">
                        {selectedRun.codexOutput.filesGenerated.length} MODULE FILES COMPILED
                      </span>
                    )}
                  </div>

                  {selectedRun.codexOutput && selectedRun.codexOutput.filesGenerated?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[350px]">
                      
                      {/* Code file listing tree */}
                      <div className="md:col-span-4 h-[350px] overflow-y-auto border-r border-white/5 pr-2 space-y-1 text-left">
                        {selectedRun.codexOutput.filesGenerated.map((f, idx) => {
                          const isCurrent = activeFileTab === f.path;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setActiveFileTab(f.path);
                                setActiveFileContent(f.content);
                              }}
                              className={`w-full text-left px-3 py-2 text-[10px] font-black tracking-normal rounded-xl transition-all truncate text-ellipsis ${
                                isCurrent 
                                  ? 'bg-[#ff385c]/10 text-[#ff385c] border border-[#ff385c]/20' 
                                  : 'text-white/50 border border-transparent hover:text-white hover:bg-white/5'
                              }`}
                            >
                              📁 {f.path}
                            </button>
                          );
                        })}
                      </div>

                      {/* Code frame layout */}
                      <div className="md:col-span-8 flex flex-col h-[350px] bg-[#07080c] border border-white/5 rounded-2xl overflow-hidden relative">
                        <div className="bg-[#0b0c10] px-4 py-2 border-b border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-white/50">{activeFileTab || "Selected Code View"}</span>
                          <span className="text-[9px] font-black text-[#ff385c]/80 uppercase">V15 COMPLIANT</span>
                        </div>
                        <pre className="flex-1 p-4 overflow-auto text-[10px] leading-relaxed text-emerald-400 font-mono scrollbar-hide select-text">
                          <code>{activeFileContent || "// Awaiting code generation outputs..."}</code>
                        </pre>
                      </div>

                    </div>
                  ) : (
                    <div className="py-24 text-center text-white/20 text-[10px] italic font-sans animate-pulse">
                      Awaiting Codex code builder & validation execution...
                    </div>
                  )}
                </div>

              </motion.div>
            ) : (
              <div className="min-h-[500px] flex flex-col items-center justify-center p-12 bg-[#0c0e14] border border-white/5 rounded-3xl text-center gap-6 shadow-2xl backdrop-blur-3xl">
                <div className="p-4 bg-[#ff385c]/15 rounded-full border border-[#ff385c]/30 shadow-2xl">
                  <Bot className="w-10 h-10 text-[#ff385c] animate-pulse" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-sm font-black italic tracking-widest text-white">AWAITING SELECTION</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-normal leading-relaxed">
                    Choose an autonomous factory execution run from the left history block to inspect systems engineering designs, logs stream, and source files directories.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
