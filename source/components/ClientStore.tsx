import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, MapPin, Star, Clock, ChevronLeft, Plus, Minus, CheckCircle2, LogOut, Settings } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function ClientStore() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedResto, setSelectedResto] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [basket, setBasket] = useState<{[key: string]: any}>({});
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'ordering' | 'success'>('idle');
  const { user, logout } = useAuth();

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
    setBasket(prev => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + 1
      }
    }));
  };

  const removeFromBasket = (itemId: string) => {
    setBasket(prev => {
      const newBasket = { ...prev };
      if (newBasket[itemId].quantity > 1) {
        newBasket[itemId].quantity -= 1;
      } else {
        delete newBasket[itemId];
      }
      return newBasket;
    });
  };

  const basketArray = Object.values(basket);
  const totalPrice = basketArray.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const placeOrder = async () => {
    if (!user || basketArray.length === 0 || !selectedResto) return;
    setOrderStatus('ordering');
    try {
      await addDoc(collection(db, 'orders'), {
        clientId: user.uid,
        clientName: user.name,
        restaurantId: selectedResto.id,
        restaurantName: selectedResto.name,
        items: basketArray,
        total: totalPrice,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setBasket({});
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

  // Group items by category
  const categories = Array.from(new Set(menuItems.map(item => item.category || 'Gourmet')));

  if (selectedResto) {
    return (
      <div className="min-h-screen bg-[#08090a]">
        <button 
          onClick={() => { setSelectedResto(null); setBasket({}); }}
          className="fixed top-8 left-8 z-40 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="h-64 md:h-80 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090a] via-[#08090a]/50 to-transparent z-10" />
          <img 
            src={`https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1200`} 
            alt={selectedResto.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute bottom-12 left-6 md:left-12 z-20">
            <h1 className="text-5xl font-black italic tracking-tighter mb-4 uppercase">{selectedResto.name}</h1>
            <div className="flex items-center gap-6 text-white/40 font-bold">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 4.8</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 20-30 min</div>
              <div className="px-3 py-1 bg-[#ff385c]/10 text-[#ff385c] text-[10px] rounded-full border border-[#ff385c]/20 uppercase">Premium Partner</div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 md:px-12 py-8 md:py-12 flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            {categories.map(category => (
              <div key={category} className="mb-12">
                <h2 className="text-xl font-black italic mb-6 uppercase tracking-widest text-white/20">{category}</h2>
                <div className="grid grid-cols-1 gap-4">
                  {menuItems.filter(item => (item.category || 'Gourmet') === category).map((item) => (
                    <div key={item.id} className="p-4 md:p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl border border-white/10 flex-shrink-0 overflow-hidden">
                          <img 
                            src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200`} 
                            alt={item.name}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div>
                          <h4 className="text-base md:text-lg font-bold group-hover:text-[#ff385c] transition-colors">{item.name}</h4>
                          <p className="text-white/20 text-[10px] uppercase font-black tracking-widest mt-1">Recette Signature</p>
                          <p className="text-[#ff385c] font-black mt-2">{item.price?.toFixed(2)}€</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {basket[item.id] && (
                          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-1 border border-white/10">
                            <button onClick={() => removeFromBasket(item.id)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><Minus className="w-4 h-4" /></button>
                            <span className="font-black italic text-sm w-4 text-center">{basket[item.id].quantity}</span>
                            <button onClick={() => addToBasket(item)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><Plus className="w-4 h-4" /></button>
                          </div>
                        )}
                        {!basket[item.id] && (
                          <button 
                            onClick={() => addToBasket(item)}
                            className="p-3 md:p-4 bg-white/5 rounded-2xl hover:bg-[#ff385c] hover:text-white transition-all shadow-xl flex-shrink-0"
                          >
                            <Plus className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {menuItems.length === 0 && (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-[3rem]">
                <p className="text-white/20 font-bold italic uppercase tracking-widest text-xs">Le menu est en cours de mise à jour par le restaurateur</p>
              </div>
            )}
          </div>

          <div className="w-full lg:w-96">
            <div className="sticky top-24 glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5">
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#ff385c]" />
                Mon Panier
              </h3>
              
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {basketArray.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm tracking-tight">{item.name}</p>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{item.quantity}x {item.price?.toFixed(2)}€</p>
                    </div>
                    <span className="text-sm font-black italic">{(item.price * item.quantity).toFixed(2)}€</span>
                  </div>
                ))}
                {basketArray.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-white/20 text-xs font-black uppercase tracking-widest italic">Votre panier attend d'être rempli</p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/5 space-y-3 mb-8">
                <div className="flex justify-between items-center text-xs font-bold text-white/40">
                  <span>Sous-total</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-white/40">
                  <span>Frais de livraison</span>
                  <span>2.50€</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black italic pt-2">
                  <span>TOTAL</span>
                  <span className="text-[#ff385c]">{(totalPrice > 0 ? totalPrice + 2.50 : 0).toFixed(2)}€</span>
                </div>
              </div>

              <button 
                onClick={placeOrder}
                disabled={basketArray.length === 0 || orderStatus !== 'idle'}
                className="w-full py-5 bg-white text-black font-black italic rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/5 disabled:opacity-20 disabled:scale-100"
              >
                {orderStatus === 'ordering' ? 'TRAITEMENT...' : 'VALIDER LA COMMANDE'}
              </button>

              <AnimatePresence>
                {orderStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-500 text-[10px] font-black uppercase tracking-widest"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Commande transmise au Kernel
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const restoImages = [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=600'
  ];

  return (
    <div className="min-h-screen bg-[#08090a]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#08090a]/80 backdrop-blur-xl border-b border-white/5 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between gap-4">
          <div className="text-xl md:text-2xl font-black italic tracking-tighter flex-shrink-0">
            LGF<span className="text-[#ff385c]">.</span>
          </div>
          
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text"
              placeholder="Rechercher..."
              className="w-full h-10 md:h-12 bg-white/5 border border-white/10 rounded-full pl-10 md:pl-12 pr-4 text-sm focus:border-[#ff385c] outline-none transition-colors placeholder:text-white/10"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Kernel Online</span>
            </div>
            <div className="text-right hidden lg:block">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Votre Compte</p>
              <p className="text-xs font-bold truncate max-w-[100px]">{user?.name || 'Invité'}</p>
            </div>
            <button 
              onClick={() => setIsBasketOpen(true)}
              className="relative p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl hover:bg-white/10 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {basket.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff385c] text-[8px] font-black flex items-center justify-center rounded-full border-2 border-[#08090a]">{basket.length}</span>}
            </button>
            <button 
              className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl hover:bg-white/10 transition-colors"
              onClick={() => alert("Paramètres du compte client en cours de déploiement.")}
            >
              <Settings className="w-5 h-5 text-white/40" />
            </button>
            <button 
              onClick={logout}
              className="p-2 md:p-3 bg-red-500/10 border border-red-500/20 rounded-xl md:rounded-2xl text-red-500 hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Grid */}
      <section className="container mx-auto px-6 py-12 pb-32">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter">DÉCOUVRIR LE MEILLEUR<br/><span className="text-white/20 uppercase">AUTOUR DE VOUS</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {restaurants.map((shop) => (
            <motion.div 
              key={shop.id}
              whileHover={{ y: -8 }}
              onClick={() => setSelectedResto(shop)}
              className="group cursor-pointer"
            >
              <div className="aspect-[16/10] bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] mb-6 overflow-hidden relative group-hover:border-white/10 transition-all">
                <img 
                  src={restoImages[restaurants.indexOf(shop) % restoImages.length]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 md:top-6 right-4 md:right-6 px-3 py-1.5 md:px-4 md:py-2 bg-white text-black text-[9px] md:text-[10px] font-black rounded-full shadow-2xl">
                  {shop.status === 'open' ? 'OUVERT' : 'FERMÉ'}
                </div>
                <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 flex items-center gap-2">
                   <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-black text-white border border-white/10">
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
