import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, Star, Clock, Search, MapPin, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rating: number;
  deliveryTime: string;
}

export default function ClientApp() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch('/api/restaurants');
        const data = await res.json();
        setRestaurants(data);
      } catch (err) {
        console.error('Core App Data Sync Failure:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const filtered = restaurants.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen bg-[#08090a] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Initialising Secure App Link...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      {/* App Header */}
      <nav className="sticky top-0 z-50 bg-[#08090a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Utensils className="w-4 h-4 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Order System</span>
              <div className="flex items-center gap-1 text-[10px] text-white/40 font-mono">
                <MapPin className="w-3 h-3" /> Lyon, FR
              </div>
            </div>
          </div>
          <div className="p-2 bg-white/5 rounded-full border border-white/10">
            <ShoppingBag className="w-4 h-4 text-white/60" />
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto p-6 space-y-8">
        
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search restaurants, cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/20"
          />
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Available Nearby</h2>
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{filtered.length} Establishments</span>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((res) => (
              <motion.div
                layout
                key={res._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative"
              >
                <Link to={`/store/${res._id}`} className="block overflow-hidden rounded-3xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 transition-all">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img src={res.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" alt={res.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                      {res.deliveryTime}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold">{res.name}</h3>
                        <p className="text-xs text-white/60 font-medium">{res.category}</p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500 rounded-lg text-[10px] font-bold text-black">
                        <Star className="w-3 h-3 fill-black text-black" /> {res.rating}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/30">
                      <span>Delivery Fee: €0.00</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span>Min Order: €10</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-white/40 italic">No results found for your specific search criteria.</p>
            </div>
          )}
        </div>
      </main>

      {/* App Bar (Mobile style) */}
      <div className="fixed bottom-0 w-full z-50 bg-[#08090a]/80 backdrop-blur-xl border-t border-white/5 md:hidden">
        <div className="flex items-center justify-around h-20 px-6">
          <div className="text-emerald-400 flex flex-col items-center gap-1">
            <Utensils className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
          </div>
          <div className="text-white/30 flex flex-col items-center gap-1">
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Search</span>
          </div>
          <div className="text-white/30 flex flex-col items-center gap-1">
            <ShoppingBag className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Orders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
