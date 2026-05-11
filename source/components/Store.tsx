import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ShoppingCart, Plus, Minus, Trash2, Star, Clock, Info } from 'lucide-react';

interface Dish {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  featured?: boolean;
}

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
}

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function Store() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<{ dish: Dish; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, dRes, revRes] = await Promise.all([
          fetch(`/api/restaurants`), 
          fetch(`/api/restaurants/${id}/dishes`),
          fetch(`/api/restaurants/${id}/reviews`)
        ]);
        const restaurants = await rRes.json();
        const dishesData = await dRes.json();
        const reviewsData = await revRes.json();
        
        const found = restaurants.find((r: any) => r._id === id);
        setRestaurant(found);
        setDishes(dishesData);
        setReviews(reviewsData);
      } catch (err) {
        console.error('Failed to fetch store data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish._id === dish._id);
      if (existing) {
        return prev.map(item => 
          item.dish._id === dish._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.dish._id === dishId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (dishId: string) => {
    setCart(prev => prev.filter(item => item.dish._id !== dishId));
  };

  const total = cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
  const finalTotal = total;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    try {
      const amountInCents = Math.round(total * 100);
      const items = cart.map(item => ({
        dishId: item.dish._id,
        name: item.dish.name,
        price: item.dish.price,
        quantity: item.quantity
      }));

      const response = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: amountInCents,
          items,
          restaurantId: id
        })
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Erreur lors de la création de la session de paiement.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) return <div className="h-screen bg-[#08090a] flex items-center justify-center text-emerald-400 font-mono">LOADING STORE...</div>;

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#08090a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              {cart.reduce((s, i) => s + i.quantity, 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
            {total > 0 && <span className="text-sm font-bold text-emerald-400">{total.toFixed(2)}€</span>}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-16 h-[300px] relative overflow-hidden">
        <img src={restaurant?.image} className="w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090a] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8">
          <div className="max-w-7xl mx-auto space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">{restaurant?.name}</h1>
            <div className="flex items-center gap-6 text-sm font-medium text-white/60">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                <span className="text-white">{restaurant?.rating}</span>
                <span>(500+)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{restaurant?.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Info className="w-4 h-4" />
                <span>More info</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          
          {/* Featured Items */}
          {dishes.some(d => d.featured) && (
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <h2 className="text-xl font-bold">Featured Items</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {dishes.filter(d => d.featured).map((dish) => (
                  <motion.div 
                    key={dish._id}
                    whileHover={{ y: -5 }}
                    className="flex-shrink-0 w-64 bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all"
                  >
                    <div className="h-32 relative overflow-hidden">
                      <img src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={dish.name} />
                      <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-emerald-400">
                        <Star className="w-3 h-3 fill-emerald-400" />
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-sm">{dish.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">{dish.price.toFixed(2)}€</span>
                        <button 
                          onClick={() => addToCart(dish)}
                          className="w-8 h-8 flex items-center justify-center bg-emerald-500 rounded-lg text-black hover:bg-emerald-400 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Regular Menu */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dishes.filter(d => !d.featured).map((dish) => (
                <motion.div 
                  key={dish._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 border border-white/10 p-4 rounded-xl flex gap-4 group"
                >
                  <div className="flex-1 space-y-2">
                    <h3 className="font-bold">{dish.name}</h3>
                    <p className="text-xs text-white/40 line-clamp-2">{dish.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-bold text-emerald-400">{dish.price.toFixed(2)}€</span>
                      <button 
                        onClick={() => addToCart(dish)}
                        className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {dish.image && <img src={dish.image} className="w-24 h-24 rounded-lg object-cover" alt="" />}
                </motion.div>
              ))}
            </div>
          </section>

          {/* Reviews Section */}
          <section className="space-y-6 pt-12 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Customer Reviews</h2>
              <div className="flex items-center gap-1 text-emerald-400">
                <Star className="w-4 h-4 fill-emerald-400" />
                <span className="font-bold">{restaurant?.rating}</span>
                <span className="text-xs text-white/40 font-normal">avg. rating</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div key={review._id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{review.userName}</p>
                        <p className="text-[10px] text-white/30">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-emerald-400 text-emerald-400' : 'text-white/10'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed italic">"{review.comment}"</p>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="col-span-full py-8 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                  <p className="text-sm text-white/20 italic">No reviews yet. Be the first to order and share your experience!</p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Cart Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Your Order
            </h2>
            
            {cart.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingCart className="w-5 h-5 text-white/20" />
                </div>
                <p className="text-sm text-white/30 italic">Start adding items from the menu.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-start text-sm">
                        <div className="space-y-1">
                          <p className="font-bold">{item.dish.name}</p>
                          <p className="text-xs text-white/40">{(item.dish.price * item.quantity).toFixed(2)}€</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.dish._id)}
                          className="p-1 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.dish._id, -1)}
                            className="p-1.5 hover:bg-white/10 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.dish._id, 1)}
                            className="p-1.5 hover:bg-white/10 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Sous-total</span>
                      <span>{total.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Frais de livraison</span>
                      <span className="text-emerald-400 font-bold uppercase text-[10px]">Gratuit</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2">
                      <span>Total</span>
                      <span className="text-emerald-400">{total.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
                >
                  {isCheckingOut ? 'Redirecting...' : 'Go to Checkout'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
