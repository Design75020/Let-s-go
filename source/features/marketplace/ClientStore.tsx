import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingBag, MapPin, Clock, Star,
  ChevronRight, Filter, Zap, ArrowRight,
  User, Bell, LogOut, Menu as MenuIcon
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useCartStore } from '../../store/useCartStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { MotionContainer, staggerContainer, itemFadeUp } from '../../components/ui/Motion';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function ClientStore() {
  const { user, signOut } = useAuth();
  const { items, addItem, removeItem, getTotal, getItemCount } = useCartStore();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'restaurants'));
    const unsub = onSnapshot(q, (snapshot) => {
      setRestaurants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const categories = ['All', 'Fast Food', 'Italian', 'Japanese', 'Healthy', 'Pastry'];

  return (
    <div className="min-h-screen bg-[#08090a] text-white selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#08090a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black italic tracking-tighter text-emerald-500">LETSGOFOOD</h1>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              <MapPin className="w-3 h-3 text-emerald-500" />
              <span>Paris, France</span>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-white/60" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#08090a]" />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 p-[2px] hover:scale-105 transition-transform"
              >
                <div className="w-full h-full rounded-full bg-[#08090a] flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-500" />
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-48 bg-[#121417] border border-white/10 rounded-2xl p-2 shadow-2xl"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs font-black truncate">{user?.email}</p>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Gold Member</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                      <LogOut className="w-3 h-3" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <section className="mb-12 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                  ${selectedCategory === cat
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Hero Banner */}
        <section className="mb-16">
          <Card className="relative h-[300px] border-none overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-900 opacity-80" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070')] bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-1000" />
            <div className="relative h-full flex flex-col justify-center p-12">
              <Badge variant="success" className="mb-4">Limited Offer</Badge>
              <h2 className="text-5xl font-black italic tracking-tighter mb-4 leading-none">FREE DELIVERY<br />ON YOUR FIRST ORDER</h2>
              <p className="text-white/60 max-w-md font-bold uppercase text-[10px] tracking-[0.2em] mb-8">
                Enjoy the best restaurants in Paris delivered to your doorstep in minutes.
              </p>
              <Button size="lg" className="w-fit" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Order Now
              </Button>
            </div>
          </Card>
        </section>

        {/* Featured Restaurants */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black italic tracking-tighter">FEATURED RESTAURANTS</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">
              View All
            </button>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {loading ? (
              Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              restaurants.map(resto => (
                <motion.div key={resto.id} variants={itemFadeUp}>
                  <Card hover className="group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={resto.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070'}
                        alt={resto.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge variant="success">Best Seller</Badge>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                        <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                        <span className="text-[10px] font-black italic">4.8</span>
                      </div>
                    </div>
                    <CardContent>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-black italic tracking-tighter leading-tight uppercase">{resto.name}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-white/40 mb-6">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-bold">15-25 min</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] font-bold">€2.99 Delivery</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full group-hover:bg-emerald-500 group-hover:text-black">
                        View Menu
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </section>
      </main>

      {/* Floating Cart */}
      <AnimatePresence>
        {getItemCount() > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
          >
            <div className="bg-[#121417] border border-emerald-500/30 rounded-3xl p-4 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Your Basket</p>
                  <p className="text-sm font-black italic">{getItemCount()} Items • {getTotal().toFixed(2)} €</p>
                </div>
              </div>
              <Button className="bg-emerald-500 text-black" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Checkout
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
