import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Package, 
  ChefHat, 
  Bike, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Navigation, 
  Star,
  Coins,
  Heart,
  Loader2
} from 'lucide-react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { db, handleFirestoreError } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Directions Component Implementation (Refactored to use Routes API v3)
function RouteDisplay({ origin, destination }: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = React.useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;
    
    // Clear previous route
    polylinesRef.current.forEach(p => p.setMap(null));

    routesLib.Route.computeRoutes({
      origin: origin,
      destination: destination,
      travelMode: 'DRIVING',
      fields: ['path', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach(p => {
          p.setOptions({
            strokeColor: '#ff385c',
            strokeWeight: 6,
            strokeOpacity: 0.8,
            clickable: false
          });
          p.setMap(map);
        });
        polylinesRef.current = newPolylines;
        
        // Initial fit bounds only
        if (routes[0].viewport) {
          map.fitBounds(routes[0].viewport, 80);
        }
      }
    }).catch(err => console.error('Routes API Error:', err));

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination]);

  return null;
}

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

const statuses = [
  { id: 'accepted', label: 'Commande acceptée', icon: CheckCircle2, color: 'text-blue-500' },
  { id: 'preparing', label: 'En cuisine', icon: ChefHat, color: 'text-amber-500' },
  { id: 'ready', label: 'Prêt pour enlèvement', icon: Package, color: 'text-purple-500' },
  { id: 'picked_up', label: 'En cours de livraison', icon: Bike, color: 'text-[#ff385c]' },
  { id: 'delivered', label: 'Livré ! Bon appétit', icon: CheckCircle2, color: 'text-emerald-500' }
];

const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#f8fafc" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f8fafc" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#e2e8f0" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f1f5f9" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#f1f5f9" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e2e8f0" }] }
];

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTipping, setIsTipping] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'orders', id), (snapshot) => {
      if (snapshot.exists()) {
        setOrder({ id: snapshot.id, ...snapshot.data() });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `orders/${id}`);
    });
    return () => unsubscribe();
  }, [id]);

  const handleTip = async (amount: number) => {
    if (!id) return;
    setIsTipping(true);
    try {
      await updateDoc(doc(db, 'orders', id), {
        tip: increment(amount)
      });
    } catch (err) {
      console.error('Tip Error:', err);
    } finally {
      setIsTipping(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-10 h-10 text-[#ff385c] animate-spin" />
      <div className="text-slate-900 font-black italic uppercase tracking-tighter text-lg">Dispatcher v2.0...</div>
    </div>
  );

  if (!order) return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center text-slate-900">
      <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-200">
        <Package className="w-10 h-10 text-slate-300" />
      </div>
      <h2 className="text-3xl font-black italic mb-2 uppercase tracking-tighter">Mission Introuvable</h2>
      <p className="text-slate-400 mb-8 font-medium">L'ordre demandé n'existe pas ou a été archivé.</p>
      <Link to="/app" className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl italic shadow-xl shadow-slate-900/10 uppercase text-xs tracking-widest">Retour au Menu</Link>
    </div>
  );

  const currentStatusIndex = statuses.findIndex(s => s.id === order.status);
  const displayStatusIndex = currentStatusIndex === -1 ? (order.status === 'pending' ? -1 : 0) : currentStatusIndex;
  const isPickedUp = order.status === 'picked_up';
  const driverLocation = order.driverLocation;
  // Fallback destination for demo
  const userLocation = { lat: 48.8566, lng: 2.3522 };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-12 pb-32">
      <div className="max-w-7xl mx-auto space-y-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-4 text-slate-400 hover:text-slate-900 transition-all group">
          <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="font-black uppercase text-[10px] tracking-widest italic">Quitter le Dispatch</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Left Side: Status Steps */}
          <div className="w-full lg:w-[500px] space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-slate-200 font-black italic text-xl tracking-tighter">#{id?.slice(-6).toUpperCase()}</span>
                <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse transition-all" />
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Kernel_Connected</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                Tracking <span className="text-[#ff385c]">Live</span>
              </h1>
            </div>

            <div className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="flex flex-col gap-12 relative z-10">
                {statuses.map((s, index) => {
                  const Icon = s.icon;
                  const isActive = index <= displayStatusIndex;
                  const isCurrent = index === displayStatusIndex;

                  return (
                    <div key={s.id} className="flex gap-10 relative">
                      {index < statuses.length - 1 && (
                        <div className={`absolute left-7 top-14 w-1 h-14 ${index < displayStatusIndex ? 'bg-[#ff385c]' : 'bg-slate-50'} transition-all duration-700 rounded-full`} />
                      )}
                      
                      <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border-2 transition-all duration-700 shadow-sm ${
                        isCurrent ? 'bg-white border-[#ff385c] text-[#ff385c] scale-110 shadow-xl shadow-[#ff385c]/10 z-10' :
                        isActive ? 'bg-slate-900 border-slate-900 text-white' : 
                        'bg-slate-50 border-slate-100 text-slate-200'
                      }`}>
                        <Icon className="w-7 h-7" />
                      </div>

                      <div className="flex-1 pt-3">
                        <p className={`text-base md:text-lg font-black italic uppercase tracking-tighter transition-all ${isActive ? 'text-slate-900' : 'text-slate-200'}`}>
                          {s.label}
                        </p>
                        {isCurrent && (
                          <motion.p 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[10px] font-black text-[#ff385c] uppercase tracking-widest mt-1 italic"
                          >
                            Synchronisation par satellite
                          </motion.p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 text-slate-300 text-[10px] font-black uppercase tracking-widest italic leading-none">
                  <MapPin className="w-4 h-4 text-[#ff385c]" /> Destination
                </div>
                <p className="text-xs font-black italic uppercase tracking-tight text-slate-900 leading-relaxed">{order.clientName}<br/>123 Rue du Marché, Paris</p>
              </div>
              <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 text-slate-300 text-[10px] font-black uppercase tracking-widest italic leading-none">
                  <Clock className="w-4 h-4 text-slate-900" /> Estimation
                </div>
                <p className="text-2xl font-black italic tracking-tighter text-slate-900 leading-none">15-20 MIN</p>
              </div>
            </div>
          </div>

          {/* Right Side: Map */}
          <div className="flex-1 min-h-[500px] lg:min-h-[700px] relative">
            {(isPickedUp || driverLocation) && API_KEY ? (
              <div className="h-full w-full rounded-[4rem] overflow-hidden border border-slate-100 shadow-2xl relative">
                <APIProvider apiKey={API_KEY}>
                    <Map
                      defaultCenter={driverLocation || userLocation}
                      defaultZoom={15}
                      mapId="LGF_TRACKER_LIGHT"
                      disableDefaultUI={true}
                      style={{ width: '100%', height: '100%' }}
                    >
                    {driverLocation && (
                      <RouteDisplay 
                        origin={driverLocation} 
                        destination={userLocation} 
                      />
                    )}

                    {driverLocation && (
                      <AdvancedMarker position={driverLocation}>
                        <div className="relative group/bike">
                          <div className="absolute inset-0 bg-[#ff385c]/10 blur-2xl rounded-full scale-150 animate-pulse" />
                          <div className="w-16 h-16 bg-[#ff385c] rounded-[1.5rem] flex items-center justify-center border-4 border-white shadow-2xl relative z-10">
                            <Bike className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </AdvancedMarker>
                    )}

                    <AdvancedMarker position={userLocation}>
                      <div className="relative scale-110">
                        <div className="absolute inset-0 bg-[#ff385c]/10 blur-xl rounded-full animate-ping" />
                        <MapPin className="w-12 h-12 text-[#ff385c] relative z-10 drop-shadow-lg" />
                      </div>
                    </AdvancedMarker>
                  </Map>
                </APIProvider>

                {/* Driver Info Floating Card */}
                {order.driverName && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-10 left-10 right-10 bg-white border border-slate-100 p-8 rounded-[3rem] flex items-center justify-between shadow-2xl"
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center overflow-hidden border border-slate-100">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.driverName}`} alt="Driver" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                          <Navigation className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-4">
                          <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">{order.driverName}</h4>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full uppercase tracking-widest italic border border-emerald-100 shadow-sm">Courier Pro</span>
                        </div>
                        <div className="flex items-center gap-6 mt-3">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-[#ff385c] text-[#ff385c]" />
                            <span className="text-[11px] font-black text-slate-400 italic">4.9/5 Excellent</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <button className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all active:scale-95 shadow-xl shadow-slate-900/10 italic">Contacter</button>
                    </div>
                  </motion.div>
                )}

                {/* Tips Section */}
                {isPickedUp && !order.tip && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-10 left-10 w-96 bg-white p-10 rounded-[3.5rem] space-y-8 shadow-2xl z-40 border border-[#ff385c]/10"
                  >
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-[#ff385c]/5 rounded-2xl">
                        <Coins className="w-6 h-6 text-[#ff385c]" />
                       </div>
                       <div>
                        <h4 className="text-base font-black uppercase tracking-tighter text-slate-900 italic leading-none">Encourager {order.driverName?.split(' ')[0] || 'votre livreur'} ?</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Soutenez les héros de la route</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[2, 5, 10].map((amt) => (
                        <button
                          key={amt}
                          disabled={isTipping}
                          onClick={() => handleTip(amt)}
                          className="py-5 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-black italic text-slate-900 hover:bg-[#ff385c] hover:text-white transition-all disabled:opacity-50 shadow-sm"
                        >
                          {amt}€
                        </button>
                      ))}
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center gap-3">
                      <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                      <p className="text-[10px] text-emerald-600 italic font-black uppercase tracking-widest">100% reversés au livreur</p>
                    </div>
                  </motion.div>
                )}

                {order.tip > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-10 right-10 bg-[#ff385c] px-6 py-3 rounded-full flex items-center gap-3 z-40 shadow-xl shadow-[#ff385c]/20 border-2 border-white"
                  >
                    <Heart className="w-4 h-4 text-white fill-white animate-pulse" />
                    <span className="text-[11px] font-black uppercase text-white tracking-widest italic">Tip de {order.tip}€ confirmé !</span>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="h-full w-full rounded-[4rem] bg-white border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-16 space-y-8">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100">
                  <ChefHat className="w-12 h-12 text-slate-200" />
                </div>
                <div className="space-y-4 max-w-sm">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Préparation...</h3>
                  <p className="text-sm text-slate-400 font-bold italic leading-relaxed uppercase tracking-tight">Le restaurant prépare vos spécialités. La carte s'activera dès le départ du coursier.</p>
                </div>
                {!API_KEY && (
                  <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-full">
                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest italic leading-none">System_Alert: Google_Maps_Engine_Offline</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
