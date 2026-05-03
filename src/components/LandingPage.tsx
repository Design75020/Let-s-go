import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Utensils, Clock, ShieldCheck, ArrowRight, Star, Instagram, Twitter, Facebook, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEvent, getTrackingParams } from '../lib/tracking';

export default function LandingPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', type: 'pro' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    trackEvent('visit');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const params = getTrackingParams();
    
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...params
        })
      });
      setSubmitted(true);
      trackEvent('lead', { src: 'landing_form' });
    } catch (err) {
      console.error('Lead submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-white selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08090a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Utensils className="text-black w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">LetsGo<span className="text-emerald-400">Food</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#menu" className="hover:text-emerald-400 transition-colors">Menu</a>
            <a href="#delivery" className="hover:text-emerald-400 transition-colors">Delivery</a>
            <Link to="/admin" className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full hover:bg-emerald-500/20 transition-all">
              Monitor
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-widest"
          >
            <Star className="w-3 h-3 fill-current" />
            Premium Food Delivery
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter max-w-4xl mx-auto leading-[0.9]"
          >
            Savor the Moment, <span className="text-emerald-400 italic">Delivered.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-xl max-w-xl mx-auto font-light leading-relaxed"
          >
            Experience the finest local cuisine from top-tier chefs, brought straight to your doorstep with clinical precision.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <button className="px-8 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-3 group">
              Order Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              View Menu
            </button>
          </motion.div>
        </div>
      </section>

      {/* Lead Capture Section */}
      <section id="join" className="py-20 px-6 bg-[#0c0d0f] border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight">Partner with us.</h2>
            <p className="text-white/50 text-lg leading-relaxed">
              Whether you're a high-end restaurant looking to expand your reach or a professional courier wanting to join our fleet, we've got you covered.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-medium">Real-time order tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">Advanced logistics platform</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium">Weekly professional payments</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="text-emerald-500 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Successfully Submitted</h3>
                <p className="text-white/40 text-sm italic">Our team will reach out to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="text-emerald-400 text-xs font-mono uppercase tracking-widest hover:underline">Submit another one</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-lg border border-white/5 mb-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'pro' })}
                    className={`text-xs py-2 rounded-md transition-all font-mono uppercase tracking-widest ${formData.type === 'pro' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40'}`}
                  >
                    Restaurant
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'rider' })}
                    className={`text-xs py-2 rounded-md transition-all font-mono uppercase tracking-widest ${formData.type === 'rider' ? 'bg-blue-500/20 text-blue-400' : 'text-white/40'}`}
                  >
                    Courier
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-colors"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <button 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Send Inquiry'}
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 border-t border-white/5 bg-[#0a0b0d]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Clock className="w-6 h-6 text-emerald-400" />}
            title="Express Delivery"
            description="Our advanced delivery algorithm ensures your food arrives hot, fresh, and on time."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-blue-400" />}
            title="Quality Assured"
            description="We only partner with top-rated restaurants that pass our strict quality audits."
          />
          <FeatureCard 
            icon={<Utensils className="w-6 h-6 text-purple-400" />}
            title="Chef Curated"
            description="Discover exclusive seasonal menus created by world-class culinary artists."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-[#08090a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Utensils className="text-black w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">LetsGo<span className="text-emerald-400">Food</span></span>
            </div>
            <p className="text-white/40 max-w-xs">Elevating the standard of online food delivery services worldwide.</p>
          </div>
          <div className="flex gap-8">
            <Instagram className="w-6 h-6 text-white/40 hover:text-emerald-400 cursor-pointer transition-colors" />
            <Twitter className="w-6 h-6 text-white/40 hover:text-emerald-400 cursor-pointer transition-colors" />
            <Facebook className="w-6 h-6 text-white/40 hover:text-emerald-400 cursor-pointer transition-colors" />
          </div>
          <div className="text-sm text-white/30 font-mono">
            © 2024 LETSGOFOOD CORP. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-white/40 leading-relaxed font-light">{description}</p>
    </div>
  );
}
