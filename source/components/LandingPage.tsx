import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Globe, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Globe, title: 'Plateforme Live', desc: 'Marketplace temps réel pour les clients.' },
    { icon: Zap, title: 'Écosystème Unifié', desc: 'Une seule base de données pour tous les acteurs.' },
    { icon: ShieldCheck, title: 'Supervision Kernel', desc: 'Sécurité et intégrité des transactions garantie.' },
    { icon: BarChart3, title: 'SaaS Control', desc: 'Analytics avancés pour les restaurateurs.' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#ff385c] selection:text-white pb-10 md:pb-0 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20">
        <div className="container mx-auto px-6 md:px-12 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl md:text-2xl font-black italic tracking-tighter text-slate-900 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-[#ff385c] rounded-lg flex items-center justify-center shadow-lg shadow-[#ff385c]/20 rotate-3">
              <Globe className="text-white w-4 h-4" />
            </div>
            LETSGOFOOD<span className="text-[#ff385c]">.</span>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={() => navigate('/login')} className="hidden sm:block text-[10px] md:text-xs font-black tracking-widest uppercase text-slate-500 hover:text-[#ff385c] transition-colors">Connexion</button>
            <button onClick={() => navigate('/login')} className="px-5 md:px-8 py-2.5 md:py-3 bg-slate-900 text-white font-black italic rounded-full text-[10px] md:text-xs hover:scale-105 transition-all shadow-xl shadow-slate-900/10">DÉMARRER</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 md:pt-48 pb-12 md:pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[1200px] h-[500px] md:h-[700px] bg-gradient-to-b from-[#ff385c]/5 to-transparent blur-[100px] rounded-full -z-10" />
        
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black tracking-widest mb-8 uppercase text-slate-500 shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-[#ff385c]" />
            Le futur de la food-tech
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl sm:text-8xl md:text-9xl font-black italic tracking-tighter leading-[0.85] mb-8 text-slate-900"
          >
            LIVRÉ AVEC <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff385c] to-slate-400">PRÉCISION.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Le système d'exploitation ultime pour restaurants, livreurs et gourmets. Une infrastructure moderne pour une croissance sans limites.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6"
          >
            <button onClick={() => navigate('/app')} className="group px-10 py-5 bg-[#ff385c] text-white font-black italic rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-[#ff385c]/30">
              COMMANDER MAINTENANT <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/login')} className="px-10 py-5 bg-white border border-slate-200 text-slate-900 font-black italic rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              ESPACE RESTAURATEUR
            </button>
          </motion.div>
        </div>
      </section>

      {/* visual Showcase Section */}
      <section className="py-20 md:py-40 container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-6 text-slate-900 leading-none">VOTRE <span className="text-[#ff385c]">ÉCOSYSTÈME</span><br/>SIMPLIFIÉ.</h2>
            <p className="text-slate-400 text-xl font-medium">Une suite cohérente de protocoles interconnectés pour chaque acteur du goût.</p>
          </div>
          <div className="flex items-center gap-4 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 font-mono">NODE_STATUS: ONLINE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Client Node */}
          <motion.div 
            whileHover={{ y: -10 }}
            onClick={() => navigate('/app')}
            className="group cursor-pointer relative aspect-[3/4] bg-slate-100 rounded-[3rem] md:rounded-[4rem] border border-slate-100 overflow-hidden shadow-xl hover:shadow-2xl transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
              alt="Marketplace"
            />
            <div className="absolute bottom-10 left-10 z-20">
              <span className="px-4 py-1.5 bg-[#ff385c] text-white text-[9px] font-black rounded-lg uppercase tracking-widest mb-4 inline-block shadow-lg">CLIENT</span>
              <h3 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-2">Interface<br/>Gourmet</h3>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Le goût à portée de main</p>
            </div>
          </motion.div>

          {/* Merchant Node */}
          <motion.div 
            whileHover={{ y: -10 }}
            onClick={() => navigate('/merchant')}
            className="group cursor-pointer relative aspect-[3/4] bg-slate-100 rounded-[3rem] md:rounded-[4rem] border border-slate-100 overflow-hidden shadow-xl hover:shadow-2xl transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=600" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
              alt="Merchant"
            />
            <div className="absolute bottom-10 left-10 z-20">
              <span className="px-4 py-1.5 bg-white text-slate-900 text-[9px] font-black rounded-lg uppercase tracking-widest mb-4 inline-block">MERCHANT</span>
              <h3 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-2">Gestion<br/>Pro</h3>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Contrôlez votre croissance</p>
            </div>
          </motion.div>

          {/* Driver Node */}
          <motion.div 
            whileHover={{ y: -10 }}
            onClick={() => navigate('/driver')}
            className="group cursor-pointer relative aspect-[3/4] md:col-start-1 lg:col-start-3 bg-slate-100 rounded-[3rem] md:rounded-[4rem] border border-slate-100 overflow-hidden shadow-xl hover:shadow-2xl transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=600" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
              alt="Driver"
            />
            <div className="absolute bottom-10 left-10 z-20">
              <span className="px-4 py-1.5 bg-white/20 border border-white/40 text-white text-[9px] font-black rounded-lg uppercase tracking-widest mb-4 inline-block backdrop-blur-md">LOGISTICS</span>
              <h3 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-2">Livreur<br/>Nexus</h3>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Optimisation temps réel</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-20 md:py-32 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-white border border-slate-100 hover:shadow-xl transition-all group">
                <f.icon className="w-10 h-10 text-[#ff385c] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-black italic mb-4 text-slate-900 uppercase tracking-tighter">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white px-6 md:px-12 text-slate-900">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
          <div>
            <h4 className="text-xl font-black italic mb-8 uppercase tracking-tighter">Navigation</h4>
            <div className="space-y-4">
              <button onClick={() => navigate('/app')} className="block text-slate-400 hover:text-[#ff385c] font-black italic uppercase tracking-widest text-[10px]">Marketplace</button>
              <button onClick={() => navigate('/merchant')} className="block text-slate-400 hover:text-[#ff385c] font-black italic uppercase tracking-widest text-[10px]">Restaurateur</button>
              <button onClick={() => navigate('/driver')} className="block text-slate-400 hover:text-[#ff385c] font-black italic uppercase tracking-widest text-[10px]">Coursier</button>
              <button onClick={() => navigate('/admin')} className="block text-slate-400 hover:text-[#ff385c] font-black italic uppercase tracking-widest text-[10px]">Administration</button>
            </div>
          </div>
          <div className="md:col-span-2 text-left md:text-right flex flex-col justify-between">
             <div className="text-4xl md:text-7xl font-black italic text-slate-100 leading-none mb-8">DRIVEN BY PERFORMANCE</div>
             <div className="flex flex-col md:flex-row items-end md:items-center justify-end gap-6 text-[10px] font-black tracking-widest uppercase text-slate-400">
                <span>© 2026 LETSGOFOOD</span>
                <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200" />
                <span>ECO-SYSTEM CORE</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
