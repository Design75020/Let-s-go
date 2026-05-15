import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Globe, BarChart3, Star, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { MotionContainer, itemFadeUp, staggerContainer } from '../../components/ui/Motion';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Globe, title: 'Live Platform', desc: 'Real-time marketplace for hungry customers.', color: 'text-emerald-500' },
    { icon: Zap, title: 'Unified Ecosystem', desc: 'Single source of truth for all actors.', color: 'text-blue-500' },
    { icon: ShieldCheck, title: 'Kernel Security', desc: 'Transaction integrity guaranteed by JULES.', color: 'text-purple-500' },
    { icon: BarChart3, title: 'SaaS Control', desc: 'Advanced analytics for growth.', color: 'text-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-[#08090a] text-white selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#08090a]/50 backdrop-blur-xl border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="text-xl md:text-2xl font-black italic tracking-tighter flex items-center gap-2">
            LETSGOFOOD<span className="text-emerald-500">.</span>
            <Badge variant="info">v10</Badge>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/login')} className="hidden sm:block text-[10px] font-black tracking-widest uppercase text-white/40 hover:text-white transition-colors">Sign In</button>
            <Button onClick={() => navigate('/login')} size="sm">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <MotionContainer>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-[0.2em] mb-8 uppercase">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              THE FUTURE OF FOOD-TECH
            </div>

            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter leading-[0.85] mb-8 uppercase">
              Premium <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Marketplace.</span>
            </h1>

            <p className="text-xl text-white/40 font-bold uppercase tracking-tight mb-12 max-w-2xl mx-auto leading-tight">
              A unified operating system for restaurants, drivers, and gourmets. Experience speed, scale, and intelligence.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button onClick={() => navigate('/app')} size="lg" className="px-12 py-6" rightIcon={<ArrowRight />}>
                Explore Live App
              </Button>
              <Button onClick={() => navigate('/login')} variant="secondary" size="lg" className="px-12 py-6">
                Merchant Portal
              </Button>
            </div>
          </MotionContainer>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((f, i) => (
            <motion.div key={i} variants={itemFadeUp}>
              <Card className="h-full p-10 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                <f.icon className={`w-10 h-10 ${f.color} mb-8 group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-black italic mb-4 uppercase tracking-tighter">{f.title}</h3>
                <p className="text-white/40 text-sm font-bold leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Live Preview / Stats */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-20">
          <div className="text-center">
            <p className="text-4xl font-black italic tracking-tighter mb-2 text-emerald-500">14ms</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Average Latency</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black italic tracking-tighter mb-2">99.9%</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Uptime SLA</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black italic tracking-tighter mb-2 text-emerald-500">50k+</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Daily Orders</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter mb-8">LETSGOFOOD.</h2>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest max-w-xs">
              Building the next generation of food delivery infrastructure. Scalable, secure, and blazingly fast.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-20">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Platforms</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li><button onClick={() => navigate('/app')} className="hover:text-emerald-500 transition-colors">Marketplace</button></li>
                <li><button onClick={() => navigate('/merchant')} className="hover:text-emerald-500 transition-colors">Merchant Portal</button></li>
                <li><button onClick={() => navigate('/driver')} className="hover:text-emerald-500 transition-colors">Driver App</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">Resources</h4>
              <ul className="space-y-3 text-sm font-bold text-white/40">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Status Page</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-8 border-t border-white/5 flex justify-between items-center">
          <p className="text-[10px] font-black text-white/10 tracking-[0.3em] uppercase">© 2026 LETSGOFOOD KERNEL V10.0.0</p>
          <div className="flex gap-6">
             <Globe className="w-4 h-4 text-white/10" />
             <ShieldCheck className="w-4 h-4 text-white/10" />
          </div>
        </div>
      </footer>
    </div>
  );
}
