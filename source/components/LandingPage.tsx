import React from 'react';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-[#08090a] text-white selection:bg-[#ff385c] selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#08090a]/50 backdrop-blur-xl border-b border-white/5 h-20">
        <div className="container mx-auto px-12 h-full flex items-center justify-between">
          <div className="text-2xl font-black italic tracking-tighter">
            LETSGOFOOD<span className="text-[#ff385c]">.</span>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/login')} className="text-xs font-black tracking-widest uppercase hover:text-[#ff385c] transition-colors">Connexion</button>
            <button onClick={() => navigate('/login')} className="px-8 py-3 bg-white text-black font-black italic rounded-full text-xs hover:scale-105 transition-all">REJOINDRE L'ÉCOSYSTÈME</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#ff385c]/10 blur-[120px] rounded-full -z-10" />
        
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-[0.2em] mb-8 uppercase"
          >
            <Sparkles className="w-3 h-3 text-[#ff385c]" />
            Le futur de la food-tech est ici
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-8xl font-black italic tracking-tighter leading-[0.9] mb-8"
          >
            L'ARCHITECTURE <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20 uppercase">Omniprésente.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/40 font-medium mb-12 max-w-2xl mx-auto"
          >
            Un système d'exploitation unifié pour restaurateurs, livreurs et gourmets. Gérez votre croissance sans limites techniques.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <button onClick={() => navigate('/app')} className="group px-10 py-5 bg-[#ff385c] text-white font-black italic rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-[#ff385c]/30">
              EXPLORER LE LIVE <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/login')} className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black italic rounded-2xl hover:bg-white/10 transition-all">
              INTERFACE MERCHANT
            </button>
          </motion.div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-32 container mx-auto px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
              <f.icon className="w-10 h-10 text-[#ff385c] mb-6" />
              <h3 className="text-xl font-bold italic mb-4">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / CTA Access */}
      <section className="py-32 border-t border-white/5">
        <div className="container mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-20">
          <div>
            <h4 className="text-2xl font-black italic mb-8">ACCÈS DIRECTS</h4>
            <div className="space-y-4">
              <button onClick={() => navigate('/merchant')} className="block text-white/40 hover:text-[#ff385c] font-bold">Portail Restaurateur</button>
              <button onClick={() => navigate('/driver')} className="block text-white/40 hover:text-[#ff385c] font-bold">Driver App</button>
              <button onClick={() => navigate('/admin')} className="block text-white/40 hover:text-[#ff385c] font-bold">SaaS Control Tower (Admin)</button>
            </div>
          </div>
          <div className="md:col-span-2 text-right">
             <div className="text-5xl font-black italic text-white/5 mb-4">DRIVEN BY PERFORMANCE</div>
             <p className="text-white/20 text-xs font-black tracking-widest uppercase">© 2026 LETSGOFOOD ECO-SYSTEM • KERNEL V2.5.4</p>
          </div>
        </div>
      </section>
    </div>
  );
}
