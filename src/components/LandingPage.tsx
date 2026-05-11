import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Utensils, Clock, ShieldCheck, ArrowRight, Star, Instagram, Twitter, Facebook, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { trackEvent, getTrackingParams } from '../lib/tracking';
import { navigateToDomain } from '../lib/domains';

export default function LandingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', type: 'pro' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);

  useEffect(() => {
    trackEvent('visit');
    const fetchRestaurants = async () => {
      try {
        const res = await fetch('/api/restaurants');
        const data = await res.json();
        setRestaurants(data);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      }
    };
    fetchRestaurants();
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
            <a href="#features" className="hover:text-emerald-400 transition-colors">Fonctionnalités</a>
            <a href="#restaurants" className="hover:text-emerald-400 transition-colors">Restaurants</a>
            <a href="#join" className="hover:text-emerald-400 transition-colors">Partenaires</a>
            <button 
              onClick={() => navigateToDomain('admin', navigate)} 
              className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full hover:bg-emerald-500/20 transition-all font-bold"
            >
              Administration
            </button>
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
            Livraison Food Premium
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter max-w-4xl mx-auto leading-[0.9]"
          >
            Savourez l'Instant, <span className="text-emerald-400 italic">Livré Gratuitement.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-xl max-w-xl mx-auto font-light leading-relaxed"
          >
            Découvrez l'excellence culinaire locale, livrée à votre porte avec une précision clinique. Et oui, la livraison est offerte.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <button 
              onClick={() => navigateToDomain('app', navigate)}
              className="px-8 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-3 group"
            >
              Accéder à l'App <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#restaurants" className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              Explorer les Menus
            </a>
          </motion.div>
        </div>
      </section>

      {/* Categories / Restaurants Section */}
      <section id="restaurants" className="py-20 px-6 bg-[#08090a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">Explorez vos <span className="text-emerald-400">Favoris Locaux</span></h2>
              <p className="text-white/40 max-w-md">Une sélection rigoureuse des meilleures cuisines de votre ville. Livraison 0€.</p>
            </div>
            <div className="flex gap-2">
              {['Tous', 'Français', 'Japonais', 'Italien', 'Healthy'].map((cat) => (
                <button key={cat} className="px-4 py-2 rounded-full border border-white/10 text-xs font-medium hover:bg-white/5 transition-colors">
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.length > 0 ? (
              restaurants.map((res) => (
                <Link key={res._id} to={`/store/${res._id}`}>
                  <RestaurantCard 
                    name={res.name}
                    category={`${res.category} • Livraison Gratuite`}
                    rating={res.rating}
                    time={res.deliveryTime}
                    image={res.image}
                  />
                </Link>
              ))
            ) : (
              // Fallback cards if no data yet
              <>
                <RestaurantCard 
                  name="Le Gourmet Français"
                  category="French • $$$"
                  rating={4.8}
                  time="25-35 min"
                  image="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800"
                />
                <RestaurantCard 
                  name="Sushi Master"
                  category="Japanese • $$"
                  rating={4.9}
                  time="20-30 min"
                  image="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800"
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Lead Capture Section */}
      <section id="join" className="py-20 px-6 bg-[#0c0d0f] border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight">Devenez partenaire.</h2>
            <p className="text-white/50 text-lg leading-relaxed">
              Que vous soyez un restaurant haut de gamme ou un coursier professionnel, rejoignez notre écosystème premium.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-medium">Clients : Livraison gratuite illimitée</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">Restaurateurs : Commission fixe, pas de frais cachés</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium">Livreurs : Rémunération garantie à la course</span>
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
                  <label className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Nom Complet</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-colors"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Numéro de Téléphone</label>
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
                  {isSubmitting ? 'Envoi...' : 'Envoyer ma demande'}
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
            title="Livraison Express"
            description="Notre algorithme de livraison avancé garantit que vos plats arrivent chauds, frais et à l'heure."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-blue-400" />}
            title="Qualité Assurée"
            description="Nous ne collaborons qu'avec les meilleurs restaurants qui passent nos tests de qualité stricts."
          />
          <FeatureCard 
            icon={<Utensils className="w-6 h-6 text-purple-400" />}
            title="Menus de Chefs"
            description="Découvrez des menus exclusifs créés par des artistes culinaires de classe mondiale."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/5 bg-[#08090a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Utensils className="text-black w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight">LetsGo<span className="text-emerald-400">Food</span></span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                L'excellence culinaire locale livrée avec une précision clinique et une passion pour la perfection.
              </p>
              <div className="flex gap-4">
                <div className="p-2 bg-white/5 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 transition-all cursor-pointer">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="p-2 bg-white/5 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 transition-all cursor-pointer">
                  <Twitter className="w-4 h-4" />
                </div>
                <div className="p-2 bg-white/5 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 transition-all cursor-pointer">
                  <Facebook className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400">Applications Core</h4>
              <ul className="space-y-4">
                <li><button onClick={() => navigateToDomain('landing', navigate)} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-left w-full"><ArrowRight className="w-3 h-3 text-white/20" /> Acquisition (Marketing)</button></li>
                <li><button onClick={() => navigateToDomain('app', navigate)} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-left w-full"><ArrowRight className="w-3 h-3 text-white/20" /> Plateforme Client (Live)</button></li>
                <li><button onClick={() => navigateToDomain('merchant', navigate)} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-left w-full"><ArrowRight className="w-3 h-3 text-white/20" /> Merchant Interface</button></li>
                <li><button onClick={() => navigateToDomain('driver', navigate)} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-left w-full"><ArrowRight className="w-3 h-3 text-white/20" /> Driver Dispatch</button></li>
                <li><button onClick={() => navigateToDomain('saas', navigate)} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-left w-full"><ArrowRight className="w-3 h-3 text-white/20" /> SaaS Control Tower</button></li>
                <li><button onClick={() => navigateToDomain('crm', navigate)} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-left w-full"><ArrowRight className="w-3 h-3 text-white/20" /> CRM & Sales</button></li>
                <li><button onClick={() => navigateToDomain('admin', navigate)} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-left w-full"><ArrowRight className="w-3 h-3 text-white/20" /> Supervision Kernel</button></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-blue-400">Soutien</h4>
              <ul className="space-y-4">
                <li className="text-white/50 flex items-center gap-2 transition-colors hover:text-white cursor-pointer"><Send className="w-3 h-3 text-white/20" /> letsgofood@pro.fr</li>
                <li className="text-white/50 flex items-center gap-2 transition-colors hover:text-white cursor-pointer group"><Clock className="w-3 h-3 text-white/20" /> 07 46 33 61 97</li>
                <li><a href="#" className="text-white/50 hover:text-white transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-white/20" /> Ouvrir un ticket SAV</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-purple-400">Localisation</h4>
              <p className="text-white/50 text-sm leading-relaxed">
                Opérant actuellement à Lyon et ses environs. Expansion prévue pour 2025.
              </p>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Status Système</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-400 font-mono">OPÉRATIONNEL</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5">
            <div className="text-[10px] text-white/20 font-mono uppercase tracking-[0.3em]">
              © 2024 LETSGOFOOD CORP. TOUS DROITS RÉSERVÉS.
            </div>
            <div className="flex gap-8 text-[10px] text-white/20 font-mono uppercase tracking-[0.1em]">
              <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
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

function RestaurantCard({ name, category, rating, time, image }: { name: string, category: string, rating: number, time: string, image: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-4">
        <img src={image} alt={name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-emerald-400 border border-white/10 uppercase tracking-widest">
          {time}
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-white/90 rounded-md text-[10px] font-bold text-black shadow-lg">
          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {rating}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold group-hover:text-emerald-400 transition-colors">{name}</h3>
        <p className="text-sm text-white/40 font-medium">{category}</p>
      </div>
    </motion.div>
  );
}
