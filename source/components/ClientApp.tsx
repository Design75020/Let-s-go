import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Star, 
  Clock, 
  Search, 
  MapPin, 
  ChevronRight, 
  ShoppingBag,
  Flame,
  Coffee,
  Pizza,
  Fish,
  Soup,
  Filter,
  User,
  Heart,
  Bell,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rating: number;
  deliveryTime: string;
}

const CATEGORIES = [
  { name: 'All', icon: Flame },
  { name: 'French', icon: Utensils },
  { name: 'Italian', icon: Pizza },
  { name: 'Japanese', icon: Fish },
  { name: 'Healthy', icon: Soup },
  { name: 'Cafe', icon: Coffee },
];

export default function ClientApp() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const { history, clearHistory } = useNotifications();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch('/api/restaurants');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRestaurants(data);
      } catch (err: any) {
        setError(err.message || 'Unknown Error');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const filtered = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                         r.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="h-screen bg-[#08090a] flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black italic text-emerald-500">LG</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08090a] text-white font-sans selection:bg-emerald-500 selection:text-black">
      {/* Dynamic Header */}
      <nav className="sticky top-0 z-50 bg-[#08090a]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-500">
                <Utensils className="w-5 h-5 text-black" />
              </div>
              <div className="hidden sm:block">
                <span className="font-black italic tracking-tighter text-xl block leading-none">LetsGoFood</span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">Order App</span>
              </div>
            </Link>
            
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:border-white/20 transition-all cursor-pointer">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-white/60">Paris, France</span>
            </div>
          </div>

          <div className="flex-1 max-w-lg relative group hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Hungry for something?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:bg-white/[0.05] focus:border-emerald-500/30 outline-none transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-white/60" />
                {history.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-[#08090a]" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowNotifications(false)}
                      className="fixed inset-0 z-[-1]"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 bg-[#1a1c1e] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Notifications</span>
                        <button 
                          onClick={clearHistory}
                          className="p-1 hover:bg-white/5 rounded text-white/20 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto no-scrollbar">
                        {history.length === 0 ? (
                          <div className="p-8 text-center text-white/20 text-xs italic">
                            No recent updates
                          </div>
                        ) : (
                          history.map((n) => (
                            <div key={n.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">{n.title}</h4>
                              <p className="text-xs text-white/60 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <ShoppingBag className="w-5 h-5 text-white/60" />
            </button>
            <button className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center hover:bg-emerald-500 shadow-md transition-all group">
              <User className="w-5 h-5 text-emerald-500 group-hover:text-black" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-32 space-y-12">
        
        {/* Categories Bar */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Filter by category</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition-all shrink-0 ${
                  selectedCategory === cat.name 
                    ? 'bg-emerald-500 border-emerald-500 text-black font-black shadow-lg shadow-emerald-500/10' 
                    : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                }`}
              >
                <cat.icon className="w-5 h-5" />
                <span className="text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Home Hero (Promo) */}
        {!search && selectedCategory === 'All' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-64 sm:h-80 rounded-[2.5rem] overflow-hidden bg-emerald-500 group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 group-hover:scale-110 transition-transform duration-[2s]"
              alt="Promo"
            />
            <div className="relative z-20 h-full flex flex-col justify-center px-8 sm:px-12 space-y-6">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.2em] inline-block border border-white/20">Summer Offer</span>
                <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter leading-[0.9]">CRAVING<br />AUTHENTICITY?</h1>
              </div>
              <p className="text-white/60 max-w-md text-sm sm:text-base leading-relaxed">
                Discover local delights curated for your taste. Free delivery on your first 3 orders across Paris.
              </p>
              <button className="px-10 py-4 bg-white text-black font-black rounded-2xl w-fit hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 uppercase italic tracking-tighter">
                Explore Best Sellers
              </button>
            </div>
          </motion.div>
        )}

        {/* Restaurants Grid */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black italic tracking-tighter">POPULAR NEARBY</h2>
            <div className="flex items-center gap-4">
              <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 group transition-all">
                <Filter className="w-5 h-5 text-white/40 group-hover:text-emerald-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((res) => (
                <motion.div
                  layout
                  key={res._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8 }}
                  className="group relative"
                >
                  <Link to={`/store/${res._id}`} className="block h-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-emerald-500/20 transition-all duration-500">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img src={res.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" alt={res.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      
                      {/* Heart Button Overlay */}
                      <button className="absolute top-6 right-6 w-10 h-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors group/heart">
                        <Heart className="w-5 h-5 text-white/60 group-hover/heart:text-black group-hover/heart:fill-black" />
                      </button>

                      <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <div className="px-3 py-1 bg-emerald-500 rounded-lg text-[10px] font-black text-black uppercase tracking-widest">
                          {res.deliveryTime}
                        </div>
                        {res.rating >= 4.9 && (
                          <div className="px-3 py-1 bg-amber-500 rounded-lg text-[10px] font-black text-black uppercase tracking-widest">
                            Top Rated
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                            {res.category}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black italic text-white tracking-tight uppercase leading-tight">{res.name}</h3>
                      </div>
                    </div>
                    
                    <div className="p-6 flex items-center justify-between bg-white/[0.01]">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Pricing</span>
                          <span className="text-xs text-white/60">Free Delivery</span>
                        </div>
                        <div className="w-px h-6 bg-white/5" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Rating</span>
                          <div className="flex items-center gap-1 text-sm font-black text-emerald-400">
                            <Star className="w-3 h-3 fill-emerald-500" /> {res.rating}
                          </div>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-500">
                        <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-black group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Floating App Bar (Mobile style) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full px-8 py-4 shadow-2xl shadow-black/40 flex items-center gap-10 md:hidden">
        <button className="flex flex-col items-center gap-1 text-emerald-500">
          <Utensils className="w-6 h-6" />
          <span className="text-[8px] font-bold uppercase">Discover</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/30">
          <Search className="w-6 h-6" />
          <span className="text-[8px] font-bold uppercase">Search</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/30">
          <ShoppingBag className="w-6 h-6" />
          <span className="text-[8px] font-bold uppercase">Cart</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white/30">
          <User className="w-6 h-6" />
          <span className="text-[8px] font-bold uppercase">Profile</span>
        </button>
      </div>
    </div>
  );
}

