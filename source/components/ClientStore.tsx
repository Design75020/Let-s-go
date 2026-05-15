import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, MapPin, Star, Clock, ChevronLeft, Plus, Minus, CheckCircle2, LogOut, Settings, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
import { useAuth } from '../context/AuthContext';

export default function ClientStore({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedResto, setSelectedResto] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [basket, setBasket] = useState<{[key: string]: any}>({});
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'ordering' | 'success'>('idle');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const basketArray = Object.values(basket) as any[];
  const totalPrice = basketArray.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 0)), 0);

  useEffect(() => {
    const q = query(collection(db, 'restaurants'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRestaurants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'restaurants');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedResto) return;
    const q = query(collection(db, 'restaurants', selectedResto.id, 'menuItems'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `restaurants/${selectedResto.id}/menuItems`);
    });
    return () => unsubscribe();
  }, [selectedResto]);

  useEffect(() => {
    if (menuItems.length > 0 && !activeCategory) {
      setActiveCategory(menuItems[0].category || 'Gourmet');
    }
  }, [menuItems, activeCategory]);

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

  const placeOrder = async () => {
    if (!user || basketArray.length === 0 || !selectedResto) return;
    setOrderStatus('ordering');
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        clientId: user.uid,
        clientName: user.name,
        restaurantId: selectedResto.id,
        restaurantName: selectedResto.name,
        merchantId: selectedResto.ownerId,
        items: basketArray,
        total: totalPrice,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setBasket({});
      setOrderStatus('success');
      setTimeout(() => {
        if (isEmbedded) {
          setOrderStatus('idle');
          setIsBasketOpen(false);
          setSelectedResto(null);
        } else {
          navigate(`/tracking/${docRef.id}`);
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setOrderStatus('idle');
    }
  };

  // Group items by category
  const categories = Array.from(new Set(menuItems.map(item => item.category || 'Gourmet')));

  if (selectedResto) {
    return (
      <div className={`min-h-screen ${isEmbedded ? 'bg-transparent' : 'bg-white'} text-slate-900`}>
        <button 
          onClick={() => { setSelectedResto(null); setBasket({}); }}
          className={`fixed ${isEmbedded ? 'top-6' : 'top-10'} left-6 md:left-10 z-40 p-4 bg-white/80 border border-slate-200 rounded-2xl hover:bg-white transition-all backdrop-blur-3xl group shadow-lg`}
        >
          <ChevronLeft className="w-6 h-6 text-slate-900 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="h-80 md:h-96 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent z-10" />
          <img 
            src={`https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1200`} 
            alt={selectedResto.name}
            className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute bottom-16 left-6 md:left-12 z-20 max-w-2xl">
            <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter mb-6 uppercase italic text-slate-900 drop-shadow-sm">{selectedResto.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-900 font-black italic uppercase text-xs tracking-widest">
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 
                <span>4.8 RATING</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <Clock className="w-4 h-4 text-slate-400" /> 
                <span>15-25 MIN</span>
              </div>
              <div className="px-5 py-2 bg-[#ff385c] text-white text-[10px] rounded-xl border border-white/20 uppercase shadow-lg shadow-[#ff385c]/20">
                PREMIUM
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col lg:flex-row gap-16">
          <div className="flex-1 space-y-20">
            {categories.map(category => (
              <div key={category} className="space-y-10">
                <div className="flex items-center gap-6">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 uppercase italic">{category}</h2>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {menuItems.filter(item => (item.category || 'Gourmet') === category).map((item) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-[#ff385c]/30 hover:bg-white hover:shadow-xl transition-all"
                    >
                      <div className="flex items-center gap-8">
                        <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-[2rem] border border-slate-200 flex-shrink-0 overflow-hidden relative shadow-inner">
                          <img 
                            src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200`} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div>
                          <h4 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-slate-800 transition-colors">{item.name}</h4>
                          <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mt-2 italic">Standard Edition</p>
                          <div className="mt-4 flex items-center gap-4">
                            <span className="text-2xl font-black italic text-[#ff385c]">{item.price?.toFixed(2)}€</span>
                            <div className="h-4 w-px bg-slate-200" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Stock</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {basket[item.id] && (
                          <div className="flex items-center gap-4 bg-white rounded-[2rem] p-2 border border-slate-200 shadow-sm">
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromBasket(item.id)} 
                              className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-2xl transition-colors text-slate-500"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <motion.span 
                              key={basket[item.id].quantity}
                              initial={{ scale: 1.2, color: "#ff385c" }}
                              animate={{ scale: 1, color: "#0f172a" }}
                              className="font-black italic text-xl w-6 text-center text-slate-900"
                            >
                              {basket[item.id].quantity}
                            </motion.span>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => addToBasket(item)} 
                              className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-2xl transition-colors text-slate-500"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                        {!basket[item.id] && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addToBasket(item)}
                            className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 text-white rounded-[2.5rem] hover:bg-[#ff385c] transition-all shadow-lg flex items-center justify-center"
                          >
                            <Plus className="w-6 h-6 md:w-8 md:h-8" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
            {menuItems.length === 0 && (
              <div className="py-32 text-center border-2 border-dashed border-slate-200 rounded-[4rem]">
                <Globe className="w-16 h-16 text-slate-200 mx-auto mb-8 animate-pulse" />
                <p className="text-slate-400 font-black italic uppercase tracking-[0.3em] text-xs">Synchronisation du menu...</p>
              </div>
            )}
          </div>

          <div className="w-full lg:w-[30rem]">
            <div className="sticky top-12 bg-white p-10 rounded-[4rem] border border-slate-200 shadow-2xl relative overflow-hidden group">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-12 flex items-center gap-6 italic text-slate-900">
                <ShoppingBag className="w-8 h-8 text-[#ff385c]" />
                COMMANDE
              </h3>
              
              <div className="space-y-8 mb-12 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                <AnimatePresence initial={false}>
                  {basketArray.map((item: any) => (
                    <motion.div 
                      key={item.id} 
                      layout
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      className="flex justify-between items-start group/item"
                    >
                      <div className="flex-1">
                        <p className="font-black italic text-lg tracking-tight uppercase text-slate-800 group-hover/item:text-[#ff385c] transition-colors">{item.name}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.quantity} UNITS @ {item.price?.toFixed(2)}€</p>
                          <button onClick={() => removeFromBasket(item.id)} className="text-[10px] font-black text-[#ff385c] uppercase tracking-widest hover:underline">Retirer</button>
                        </div>
                      </div>
                      <span className="text-xl font-black italic text-slate-900">{( (item.price || 0) * (item.quantity || 0) ).toFixed(2)}€</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {basketArray.length === 0 && (
                  <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed">
                    <p className="text-slate-300 text-[11px] font-black uppercase tracking-[0.3em] italic">Panier vide</p>
                  </div>
                )}
              </div>

              <div className="pt-10 border-t border-slate-100 space-y-6 mb-12">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  <span>SOUS-TOTAL</span>
                  <span className="text-slate-500">{totalPrice?.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  <span>LIVRAISON</span>
                  <span className="text-slate-500">2.50€</span>
                </div>
                <div className="flex justify-between items-center text-4xl font-black italic pt-4 text-slate-900">
                  <span className="tracking-tighter">TOTAL</span>
                  <span className="text-[#ff385c]">{(totalPrice > 0 ? (totalPrice + 2.50) : 0).toFixed(2)}€</span>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={placeOrder}
                disabled={basketArray.length === 0 || orderStatus !== 'idle'}
                className="w-full py-8 bg-slate-900 text-white font-black italic rounded-[2.5rem] shadow-xl disabled:opacity-30 disabled:scale-100 transition-all uppercase tracking-[0.2em] text-[13px]"
              >
                {orderStatus === 'ordering' ? 'TRAITEMENT...' : 'COMMANDER'}
              </motion.button>

              <AnimatePresence>
                {orderStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mt-10 p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] flex items-center gap-6 text-emerald-600 text-[11px] font-black uppercase tracking-[0.2em] shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-slate-900">SUCCÈS</p>
                      <p className="text-emerald-600/60 mt-1">Commande envoyée</p>
                    </div>
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
    <div className={`min-h-screen ${isEmbedded ? 'bg-transparent' : 'bg-slate-50'} text-slate-900`}>
      {/* Header */}
      {!isEmbedded && (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100 py-4">
          <div className="container mx-auto px-6 md:px-12 flex items-center justify-between gap-8">
            <div 
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 bg-[#ff385c] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff385c]/20 rotate-3 transition-transform hover:rotate-0">
                <Globe className="text-white w-6 h-6" />
              </div>
              <div className="text-xl font-black italic tracking-tighter uppercase text-slate-900">
                LGF<span className="text-[#ff385c]">.</span>EATS
              </div>
            </div>
            
            <div className="hidden md:flex flex-1 max-w-xl relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Rechercher des saveurs..."
                className="w-full h-12 bg-slate-100 border border-transparent rounded-xl pl-12 pr-6 text-sm font-medium focus:bg-white focus:border-[#ff385c]/20 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsBasketOpen(true)}
                className="relative w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-[#ff385c] transition-all shadow-md group"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {basketArray.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff385c] text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {basketArray.reduce((acc, curr) => acc + curr.quantity, 0)}
                  </span>
                )}
              </button>
              
              {!isEmbedded && (
                <div className="flex items-center gap-3 ml-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter truncate max-w-[120px]">{user?.name || 'Invité'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Connecté</p>
                  </div>
                  <button 
                    onClick={logout}
                    className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Hero / Promo Section */}
      <section className="container mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="mb-16">
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none uppercase text-slate-900">
            LES MEILLEURES <br/>
            <span className="text-[#ff385c]">SAVEURS EN DIRECT.</span>
          </h2>
          <div className="flex items-center gap-4 mt-8">
            <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-wider text-slate-500 shadow-sm">LIVRAISON EN 20MIN</div>
            <div className="px-6 py-3 bg-[#ff385c]/5 text-[#ff385c] rounded-2xl text-[11px] font-black uppercase tracking-wider border border-[#ff385c]/10">OFFRES SPÉCIALES</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {restaurants.map((shop) => (
            <motion.div 
              key={shop.id}
              whileHover={{ y: -8 }}
              onClick={() => setSelectedResto(shop)}
              className="group cursor-pointer"
            >
              <div className="aspect-[16/10] bg-slate-200 rounded-[2.5rem] mb-6 overflow-hidden relative shadow-md hover:shadow-xl transition-all border border-slate-100">
                <img 
                  src={restoImages[restaurants.indexOf(shop) % restoImages.length]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute top-6 right-6 px-4 py-2 bg-white text-slate-900 text-[10px] font-black rounded-xl shadow-lg uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  COMMANDER
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                   <div className="flex items-center gap-2 mb-3">
                      {shop.status === 'open' ? (
                        <div className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-lg uppercase shadow-lg shadow-emerald-500/20">OUVERT</div>
                      ) : (
                        <div className="px-3 py-1 bg-slate-400 text-white text-[9px] font-black rounded-lg uppercase">FERMÉ</div>
                      )}
                      <div className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] font-black rounded-lg uppercase">
                        {shop.category || 'GOURMET'}
                      </div>
                   </div>
                   <h3 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter">{shop.name}</h3>
                   <div className="flex items-center gap-4 text-white/90 text-[10px] font-black uppercase tracking-wider mt-1">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {shop.rating || '4.8'}
                      </div>
                      <span className="opacity-40">•</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-white/60" />
                        25-35 MIN
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
          {restaurants.length === 0 && (
             <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
                <Globe className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <p className="text-slate-300 font-black uppercase tracking-widest text-xs">Recherche de restaurants...</p>
             </div>
          )}
        </div>
      </section>

      {/* Basket Modal/Sidebar */}
      <AnimatePresence>
        {isBasketOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBasketOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-slate-900">
                  <ShoppingBag className="w-8 h-8 text-[#ff385c]" />
                  PANIER
                </h3>
                <button 
                  onClick={() => setIsBasketOpen(false)}
                  className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-6 h-6 rotate-180" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
                {basketArray.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start gap-4 p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:bg-white hover:shadow-lg transition-all">
                    <div className="flex-1">
                      <p className="font-black italic text-lg uppercase text-slate-800">{item.name}</p>
                      <div className="flex items-center gap-4 mt-3">
                         <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-slate-200">
                            <button onClick={() => removeFromBasket(item.id)} className="w-7 h-7 flex items-center justify-center bg-slate-50 rounded-md hover:bg-slate-100 transition-colors text-slate-500"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="text-sm font-black italic w-5 text-center text-slate-900">{item.quantity}</span>
                            <button onClick={() => addToBasket(item)} className="w-7 h-7 flex items-center justify-center bg-slate-50 rounded-md hover:bg-slate-100 transition-colors text-slate-500"><Plus className="w-3.5 h-3.5" /></button>
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.price?.toFixed(2)}€</span>
                      </div>
                    </div>
                    <p className="font-black italic text-lg text-slate-900">{( (item.price || 0) * (item.quantity || 0) ).toFixed(2)}€</p>
                  </div>
                ))}
                {basketArray.length === 0 && (
                  <div className="text-center py-24 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                    <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-[10px] text-slate-300">Votre panier est vide</p>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-4 mt-8">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>SOUS-TOTAL</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center text-3xl font-black italic pt-2 mb-8 text-slate-900">
                  <span className="tracking-tighter">TOTAL</span>
                  <span className="text-[#ff385c]">{(totalPrice > 0 ? totalPrice + 2.5 : 0).toFixed(2)}€</span>
                </div>

                <button 
                  onClick={() => { setIsBasketOpen(false); if (selectedResto) placeOrder(); else alert("Sélectionnez un restaurant."); }}
                  disabled={basketArray.length === 0 || orderStatus !== 'idle'}
                  className="w-full py-6 bg-slate-900 text-white font-black italic rounded-2xl shadow-xl disabled:opacity-20 transition-all uppercase tracking-widest text-xs active:scale-95"
                >
                  {orderStatus === 'ordering' ? 'TRAITEMENT...' : 'COMMANDER MAINTENANT'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

