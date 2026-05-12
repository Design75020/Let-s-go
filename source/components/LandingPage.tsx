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
    <div className="min-h-screen bg-[#08090a] text-white selection:bg-[#ff385c] selection:text-white pb-10 md:pb-0">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#08090a]/50 backdrop-blur-xl border-b border-white/5 h-20">
        <div className="container mx-auto px-6 md:px-12 h-full flex items-center justify-between">
          <div className="text-xl md:text-2xl font-black italic tracking-tighter">
            LETSGOFOOD<span className="text-[#ff385c]">.</span>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={() => navigate('/login')} className="hidden sm:block text-[10px] md:text-xs font-black tracking-widest uppercase hover:text-[#ff385c] transition-colors">Connexion</button>
            <button onClick={() => navigate('/login')} className="px-5 md:px-8 py-2.5 md:py-3 bg-white text-black font-black italic rounded-full text-[10px] md:text-xs hover:scale-105 transition-all">REJOINDRE</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-12 md:pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[1000px] h-[400px] md:h-[600px] bg-[#ff385c]/10 blur-[80px] md:blur-[120px] rounded-full -z-10" />
        
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/5 border border-white/10 rounded-full text-[8px] md:text-[10px] font-black tracking-[0.2em] mb-6 md:mb-8 uppercase"
          >
            <Sparkles className="w-2.5 md:w-3 h-2.5 md:h-3 text-[#ff385c]" />
            Le futur de la food-tech
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black italic tracking-tighter leading-[0.9] mb-6 md:mb-8"
          >
            L'ARCHITECTURE <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20 uppercase">Omniprésente.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-white/40 font-medium mb-10 md:mb-12 max-w-2xl mx-auto"
          >
            Un système d'exploitation unifié pour restaurateurs, livreurs et gourmets. Gérez votre croissance sans limites techniques.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6"
          >
            <button onClick={() => navigate('/app')} className="group px-8 md:px-10 py-4 md:py-5 bg-[#ff385c] text-white font-black italic rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-[#ff385c]/30">
              EXPLORER LE LIVE <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/login')} className="px-8 md:px-10 py-4 md:py-5 bg-white/5 border border-white/10 text-white font-black italic rounded-2xl hover:bg-white/10 transition-all">
              INTERFACE MERCHANT
            </button>
          </motion.div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-20 md:py-32 container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff385c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <f.icon className="w-8 md:w-10 h-8 md:h-10 text-[#ff385c] mb-6" />
                <h3 className="text-lg md:text-xl font-bold italic mb-4">{f.title}</h3>
                <p className="text-white/40 text-xs md:text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / CTA Access */}
      <section className="py-20 md:py-32 border-t border-white/5 px-6 md:px-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
          <div>
            <h4 className="text-xl md:text-2xl font-black italic mb-6 md:mb-8">ACCÈS DIRECTS</h4>
            <div className="space-y-4">
              <button onClick={() => navigate('/merchant')} className="block text-white/40 hover:text-[#ff385c] font-bold text-sm">Portail Restaurateur</button>
              <button onClick={() => navigate('/driver')} className="block text-white/40 hover:text-[#ff385c] font-bold text-sm">Driver App</button>
              <button onClick={() => navigate('/admin')} className="block text-white/40 hover:text-[#ff385c] font-bold text-sm">SaaS Control Tower (Admin)</button>
            </div>
          </div>
          <div className="md:col-span-2 text-left md:text-right">
             <div className="text-2xl sm:text-4xl md:text-5xl font-black italic text-white/5 mb-4">DRIVEN BY PERFORMANCE</div>
             <p className="text-white/20 text-[8px] md:text-[10px] font-black tracking-widest uppercase">© 2026 LETSGOFOOD ECO-SYSTEM • KERNEL V2.5.4</p>
          </div>
        </div>
      </section>
    </div>
  );
}
