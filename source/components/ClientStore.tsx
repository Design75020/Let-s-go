import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, MapPin, Star, Clock, ChevronLeft, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function ClientStore() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedResto, setSelectedResto] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [basket, setBasket] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'ordering' | 'success'>('idle');
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'restaurants'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRestaurants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedResto) return;
    const q = query(collection(db, 'restaurants', selectedResto.id, 'menuItems'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [selectedResto]);

  const addToBasket = (item: any) => {
    setBasket([...basket, item]);
  };

  const totalPrice = basket.reduce((acc, item) => acc + item.price, 0);

  const placeOrder = async () => {
    if (!user || basket.length === 0 || !selectedResto) return;
    setOrderStatus('ordering');
    try {
      await addDoc(collection(db, 'orders'), {
        clientId: user.uid,
        clientName: user.name,
        restaurantId: selectedResto.id,
        restaurantName: selectedResto.name,
        items: basket,
        total: totalPrice,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setBasket([]);
      setOrderStatus('success');
      setTimeout(() => {
        setOrderStatus('idle');
        setSelectedResto(null);
      }, 3000);
    } catch (err) {
      console.error(err);
      setOrderStatus('idle');
    }
  };

  if (selectedResto) {
    return (
      <div className="min-h-screen bg-[#08090a]">
        <button 
          onClick={() => setSelectedResto(null)}
          className="fixed top-8 left-8 z-40 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="h-80 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090a] to-transparent z-10" />
          <div className="w-full h-full bg-white/5 animate-pulse" />
          <div className="absolute bottom-12 left-12 z-20">
            <h1 className="text-5xl font-black italic tracking-tighter mb-4">{selectedResto.name}</h1>
            <div className="flex items-center gap-6 text-white/40 font-bold">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 4.8</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 20-30 min</div>
              <div className="px-3 py-1 bg-[#ff385c]/10 text-[#ff385c] text-[10px] rounded-full border border-[#ff385c]/20 uppercase">Premium</div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-12 py-12 flex gap-12">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-8">La Carte</h2>
            <div className="grid grid-cols-1 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10" />
                    <div>
                      <h4 className="text-lg font-bold">{item.name}</h4>
                      <p className="text-white/40 text-sm mb-2">{item.category}</p>
                      <p className="text-[#ff385c] font-black">{item.price.toFixed(2)}€</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => addToBasket(item)}
                    className="p-4 bg-white/5 rounded-2xl group-hover:bg-[#ff385c] group-hover:text-white transition-all shadow-xl"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              ))}
              {menuItems.length === 0 && <p className="text-white/20 italic">Ce restaurant n'a pas encore configuré son menu.</p>}
            </div>
          </div>

          <div className="w-96">
            <div className="sticky top-12 glass p-8 rounded-[2.5rem]">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#ff385c]" />
                Mon Panier
              </h3>
              
              <div className="space-y-4 mb-8 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                {basket.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-white/40">{item.price.toFixed(2)}€</span>
                  </div>
                ))}
                {basket.length === 0 && <p className="text-white/20 text-center py-8">Votre panier est vide</p>}
              </div>

              <div className="pt-6 border-t border-white/5 mb-8">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span className="text-[#ff385c]">{totalPrice.toFixed(2)}€</span>
                </div>
              </div>

              <button 
                onClick={placeOrder}
                disabled={basket.length === 0 || orderStatus !== 'idle'}
                className="w-full py-5 bg-white text-black font-black italic rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {orderStatus === 'ordering' ? 'TRAITEMENT...' : 'VALIDER LA COMMANDE'}
              </button>

              <AnimatePresence>
                {orderStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-500 text-xs font-black"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    COMMANDE ENREGISTRÉE !
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090a]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#08090a]/80 backdrop-blur-xl border-b border-white/5 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="text-2xl font-black italic tracking-tighter">
            LETSGOFOOD<span className="text-[#ff385c]">.</span>
          </div>
          
          <div className="flex-1 max-w-xl mx-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text"
              placeholder="Que voulez-vous manger ?"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-full pl-12 pr-4 text-sm focus:border-[#ff385c] outline-none transition-colors placeholder:text-white/10"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Votre Compte</p>
              <p className="text-xs font-bold">{user?.name || 'Invité'}</p>
            </div>
            <button className="relative p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Grid */}
      <section className="container mx-auto px-6 py-12 pb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-black italic tracking-tighter">DÉCOUVRIR LE MEILLEUR<br/><span className="text-white/20">AUTOUR DE VOUS</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {restaurants.map((shop) => (
            <motion.div 
              key={shop.id}
              whileHover={{ y: -8 }}
              onClick={() => setSelectedResto(shop)}
              className="group cursor-pointer"
            >
              <div className="aspect-[16/10] bg-white/[0.02] border border-white/5 rounded-[2.5rem] mb-6 overflow-hidden relative group-hover:border-white/10 transition-all">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-6 right-6 px-4 py-2 bg-white text-black text-[10px] font-black rounded-full shadow-2xl">
                  {shop.status === 'open' ? 'OUVERT' : 'FERMÉ'}
                </div>
                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                   <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/10">
                    {shop.category || 'Gourmet'}
                   </div>
                </div>
              </div>
              <div className="flex justify-between items-start px-2">
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#ff385c] transition-colors tracking-tight">{shop.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-white/40 text-xs font-bold">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      {shop.rating || '4.5'}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      25-35 min
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {restaurants.length === 0 && (
             <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                <p className="text-white/20 font-bold italic">Aucun restaurant n'est encore inscrit dans votre zone.</p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
}
