import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Package, ChefHat, Bike, CheckCircle2, Clock, MapPin } from 'lucide-react';

const statuses = [
  { id: 'pending', label: 'Commande reçue', icon: Package, color: 'text-blue-400' },
  { id: 'preparing', label: 'En préparation', icon: ChefHat, color: 'text-amber-400' },
  { id: 'out_for_delivery', label: 'En cours de livraison', icon: Bike, color: 'text-emerald-400' },
  { id: 'delivered', label: 'Livré', icon: CheckCircle2, color: 'text-emerald-500' }
];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        setOrder(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      }
    };

    fetchOrder();

    // Setup WebSocket for live updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'order_update' && payload.data.orderId === id) {
          setOrder((prev: any) => prev ? { ...prev, status: payload.data.status } : null);
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [id]);

  if (loading) return <div className="h-screen bg-[#08090a] flex items-center justify-center text-emerald-400 font-mono">CONNEXION AU TRACKER...</div>;

  const currentStatusIndex = statuses.findIndex(s => s.id === order?.status);

  return (
    <div className="min-h-screen bg-[#08090a] text-white p-6">
      <div className="max-w-2xl mx-auto space-y-8 pt-12">
        <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Commande <span className="text-emerald-400 text-lg opacity-50">#{id?.slice(-6)}</span></h1>
          <p className="text-white/40 text-sm">Suivez votre livraison en temps réel</p>
        </div>

        {/* Live Status Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Clock className="w-24 h-24" />
          </div>

          <div className="flex flex-col gap-8 relative z-10">
            {statuses.map((s, index) => {
              const Icon = s.icon;
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={s.id} className="flex gap-6 relative">
                  {index < statuses.length - 1 && (
                    <div className={`absolute left-6 top-12 w-0.5 h-12 ${index < currentStatusIndex ? 'bg-emerald-500' : 'bg-white/10'} transition-colors duration-500`} />
                  )}
                  
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isCurrent ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                    isActive ? 'bg-emerald-500 border-emerald-500 text-black' : 
                    'bg-white/5 border-white/10 text-white/20'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 pt-2">
                    <p className={`font-bold transition-colors ${isActive ? 'text-white' : 'text-white/20'}`}>
                      {s.label}
                    </p>
                    {isCurrent && (
                      <motion.p 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-emerald-400 mt-1 font-medium"
                      >
                        Mise à jour : Étape actuelle
                      </motion.p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
              <MapPin className="w-3 h-3" /> Adresse
            </div>
            <p className="text-sm font-medium">123 Rue du Marché, Apt 4B</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
              <Clock className="w-3 h-3" /> Temps estimé
            </div>
            <p className="text-sm font-medium">15 - 20 mins</p>
          </div>
        </div>
      </div>
    </div>
  );
}
