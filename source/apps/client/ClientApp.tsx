
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, MapPin, Star, Clock, ChevronLeft, Plus, Minus, CheckCircle2, LogOut, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { OrdersAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { OrderApiService } from '../../services/orderApiService';
import { Card, Button, SectionTitle } from '../../shared/ui';

export default function ClientApp({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedResto, setSelectedResto] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [basket, setBasket] = useState<{[key: string]: any}>({});
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'ordering' | 'success'>('idle');
  const [activeView, setActiveView] = useState<'discovery' | 'orders'>('discovery');
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const basketArray = Object.values(basket) as any[];
  const totalPrice = basketArray.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 0)), 0);

  useEffect(() => {
    const q = query(collection(db, 'restaurants'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRestaurants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // FIX (Split Brain): User orders are now fetched from the backend API (canonical SSoT)
  useEffect(() => {
    if (!user || activeView !== 'orders') return;
    const fetchUserOrders = async () => {
      try {
        const allOrders = await OrdersAPI.list();
        // Filter orders belonging to this user (by userId or clientId)
        const myOrders = allOrders.filter((o: any) =>
          o.userId === user.uid || o.clientId === user.uid
        );
        setUserOrders(myOrders);
      } catch (err) {
        console.error('User orders fetch error:', err);
      }
    };
    fetchUserOrders();
    const interval = setInterval(fetchUserOrders, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [user, activeView]);

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
      [item.id]: { ...item, quantity: (prev[item.id]?.quantity || 0) + 1 }
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
      const order = await OrderApiService.createOrder({
        userId: user.uid,
        restaurantId: selectedResto.id,
        restaurantName: selectedResto.name,
        merchantId: selectedResto.ownerId,
        items: basketArray.map(item => ({
          id: item.id || item.name,
          price: item.price,
          quantity: item.quantity || 1,
          name: item.name
        })),
        total: totalPrice,
        clientName: user.name || user.email || 'Client'
      });
      setBasket({});
      setOrderStatus('success');
      setTimeout(() => {
        setOrderStatus('idle');
        setIsBasketOpen(false);
        setSelectedResto(null);
        setActiveView('orders');
      }, 2000);
    } catch (err) {
      console.error(err);
      setOrderStatus('idle');
      alert("Erreur lors de la commande. Veuillez réessayer.");
    }
  };

  const handleRating = async (orderId: string, restaurantId: string, score: number, feedback: string) => {
    try {
      await OrderApiService.submitRating({ orderId, restaurantId, score, feedback });
      alert("Merci pour votre avis !");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (selectedResto) {
    return (
      <div className="min-h-screen bg-white text-slate-900 pb-20">
        <header className="p-8 border-b border-slate-50 flex items-center justify-between">
           <button onClick={() => setSelectedResto(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <ChevronLeft className="w-4 h-4" /> Retour
           </button>
           <h2 className="text-xl font-black italic tracking-tighter uppercase">{selectedResto.name}</h2>
           <div className="w-10 h-10" />
        </header>

        <main className="container mx-auto px-6 py-12 max-w-4xl">
           <div className="grid grid-cols-1 gap-6">
              {menuItems.map(item => (
                <Card key={item.id} className="flex justify-between items-center bg-slate-50 border-none p-6">
                   <div>
                      <h4 className="text-lg font-black italic uppercase tracking-tight">{item.name}</h4>
                      <p className="text-[#ff385c] font-black italic">€{item.price?.toFixed(2)}</p>
                   </div>
                   <Button onClick={() => addToBasket(item)}>Ajouter</Button>
                </Card>
              ))}
           </div>
        </main>

        <AnimatePresence>
          {basketArray.length > 0 && (
            <motion.div 
               initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
               className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50"
            >
               <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between">
                  <div>
                    <p className="text-white font-black italic text-xl">€{totalPrice.toFixed(2)}</p>
                    <p className="text-white/30 text-[9px] font-black uppercase">{basketArray.length} ARTICLES</p>
                  </div>
                  <Button onClick={placeOrder} disabled={orderStatus === 'ordering'} className="bg-white text-slate-900 border-none">
                    {orderStatus === 'ordering' ? 'PAIEMENT...' : 'COMMANDER'}
                  </Button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 pb-32">
       <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <SectionTitle 
            title={activeView === 'discovery' ? "Exploration" : "Mes Commandes"} 
            subtitle={activeView === 'discovery' ? "Découvrez les meilleures saveurs" : "Historique de vos livraisons"} 
          />
          <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
             <button 
               onClick={() => setActiveView('discovery')}
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'discovery' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Explorer
             </button>
             <button 
               onClick={() => setActiveView('orders')}
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'orders' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Commandes
             </button>
          </div>
       </header>

       <AnimatePresence mode="wait">
         {activeView === 'discovery' ? (
           <motion.div 
             key="discovery"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
           >
              {restaurants.map(shop => (
                <Card key={shop.id} onClick={() => setSelectedResto(shop)} className="cursor-pointer group">
                   <div className="aspect-video bg-slate-100 rounded-3xl mb-6 overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                         <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                         <span className="text-[10px] font-black text-slate-900">{(shop.rating || 5).toFixed(1)}</span>
                      </div>
                   </div>
                   <h3 className="text-xl font-black italic uppercase tracking-tighter mb-1">{shop.name}</h3>
                   <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
                      <span>{shop.category || 'GOURMET'}</span>
                      {shop.ratingCount > 0 && (
                        <>
                           <span>•</span>
                           <span>{shop.ratingCount} AVIS</span>
                        </>
                      )}
                   </div>
                </Card>
              ))}
              {restaurants.length === 0 && (
                <div className="col-span-full py-48 text-center bg-white border border-slate-100 rounded-[3rem]">
                   <Globe className="w-16 h-16 text-slate-100 mx-auto mb-6 animate-pulse" />
                   <p className="text-slate-400 font-black italic uppercase text-[10px] tracking-widest">Initialisation de la Marketplace...</p>
                </div>
              )}
           </motion.div>
         ) : (
           <motion.div 
             key="orders"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="grid grid-cols-1 gap-8 max-w-4xl mx-auto"
           >
              {userOrders.map(order => (
                <Card key={order.id} className="p-8">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">COMMANDE #{order.id.slice(-6)}</p>
                         <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">{order.restaurantName}</h3>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {order.status}
                      </span>
                   </div>

                   <div className="space-y-2 mb-8 border-y border-slate-50 py-6">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs font-bold uppercase italic">
                           <span className="text-slate-400">{item.quantity}x {item.name}</span>
                           <span className="text-slate-900">€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-4 mt-2 border-t border-slate-50 text-slate-900 font-black italic text-sm">
                         <span>TOTAL</span>
                         <span>€{order.total?.toFixed(2)}</span>
                      </div>
                   </div>

                   {order.status === 'delivered' && !order.rated && (
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Évaluer votre commande</p>
                        <RatingForm 
                          orderId={order.id} 
                          restaurantId={order.restaurantId} 
                          onSubmit={handleRating} 
                        />
                     </div>
                   )}

                   {order.rated && (
                     <div className="flex items-center gap-2 p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                       <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Vous avez déjà noté cette commande</span>
                     </div>
                   )}
                </Card>
              ))}
              {userOrders.length === 0 && (
                <div className="text-center py-32">
                   <ShoppingBag className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                   <p className="text-slate-300 font-black italic uppercase text-sm tracking-widest">Aucune commande trouvée</p>
                </div>
              )}
           </motion.div>
         )}
       </AnimatePresence>

       <button onClick={logout} className="fixed bottom-8 right-8 p-5 bg-white border border-slate-100 text-slate-400 rounded-full shadow-xl hover:text-red-500 transition-all active:scale-90">
         <LogOut className="w-5 h-5" />
       </button>
    </div>
  );
}

function RatingForm({ orderId, restaurantId, onSubmit }: { orderId: string, restaurantId: string, onSubmit: any }) {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (score === 0) return;
    setIsSubmitting(true);
    await onSubmit(orderId, restaurantId, score, feedback);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 text-emerald-500 font-black italic text-xs uppercase tracking-widest">
         <CheckCircle2 className="w-5 h-5" /> Merci pour votre avis !
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map(s => (
            <button 
              key={s} 
              onClick={() => setScore(s)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${score >= s ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/20' : 'bg-white border border-slate-100 text-slate-300'}`}
            >
              <Star className={`w-5 h-5 ${score >= s ? 'fill-white' : ''}`} />
            </button>
          ))}
       </div>
       <textarea 
         placeholder="Optionnel : Partagez votre expérience..."
         value={feedback}
         onChange={(e) => setFeedback(e.target.value)}
         className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-xs font-bold font-sans outline-none focus:border-slate-900 transition-all min-h-[80px]"
       />
       <Button 
         onClick={handleSubmit} 
         disabled={score === 0 || isSubmitting}
         className="w-full h-12"
       >
         {isSubmitting ? 'ENVOI...' : 'PUBLIER'}
       </Button>
    </div>
  );
}

