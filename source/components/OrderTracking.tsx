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
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';

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
  { id: 'accepted', label: 'Commande acceptée', icon: CheckCircle2, color: 'text-blue-400' },
  { id: 'preparing', label: 'En cuisine', icon: ChefHat, color: 'text-amber-400' },
  { id: 'ready', label: 'Prêt pour enlèvement', icon: Package, color: 'text-purple-400' },
  { id: 'picked_up', label: 'En cours de livraison', icon: Bike, color: 'text-[#ff385c]' },
  { id: 'delivered', label: 'Livré ! Bon appétit', icon: CheckCircle2, color: 'text-green-500' }
];

const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
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
    <div className="h-screen bg-[#08090a] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-[#ff385c] animate-spin" />
      <div className="text-white font-black italic uppercase tracking-widest text-[10px]">Connexion au tracker letsgofood...</div>
    </div>
  );

  if (!order) return (
    <div className="h-screen bg-[#08090a] flex flex-col items-center justify-center p-8 text-center text-white">
      <h2 className="text-2xl font-black italic mb-4 uppercase">Commande introuvable</h2>
      <Link to="/app" className="px-6 py-3 bg-white text-black font-black rounded-xl italic">Retour au Store</Link>
    </div>
  );

  const currentStatusIndex = statuses.findIndex(s => s.id === order.status);
  const displayStatusIndex = currentStatusIndex === -1 ? (order.status === 'pending' ? -1 : 0) : currentStatusIndex;
  const isPickedUp = order.status === 'picked_up';
  const driverLocation = order.driverLocation;
  // Fallback destination for demo
  const userLocation = { lat: 48.8566, lng: 2.3522 };

  return (
    <div className="min-h-screen bg-[#08090a] text-white p-4 md:p-12 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-white/40 hover:text-white transition-colors group">
          <div className="p-2 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="font-bold uppercase text-[10px] tracking-widest">Retour</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Side: Status Steps */}
          <div className="w-full lg:w-[450px] space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                Tracking <span className="text-[#ff385c]">Live</span>
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-white/20 font-black italic">#{id?.slice(-6).toUpperCase()}</span>
                <div className="flex items-center gap-3 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Connected</span>
                </div>
              </div>
            </div>

            <div className="glass p-8 md:p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden">
              <div className="flex flex-col gap-10 relative z-10">
                {statuses.map((s, index) => {
                  const Icon = s.icon;
                  const isActive = index <= displayStatusIndex;
                  const isCurrent = index === displayStatusIndex;

                  return (
                    <div key={s.id} className="flex gap-8 relative">
                      {index < statuses.length - 1 && (
                        <div className={`absolute left-6 top-14 w-0.5 h-14 ${index < displayStatusIndex ? 'bg-[#ff385c]' : 'bg-white/10'} transition-colors duration-700`} />
                      )}
                      
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 ${
                        isCurrent ? 'bg-[#ff385c]/10 border-[#ff385c] text-[#ff385c] rotate-6 shadow-[0_0_30px_rgba(255,56,92,0.3)]' :
                        isActive ? 'bg-[#ff385c] border-[#ff385c] text-white' : 
                        'bg-white/5 border-white/10 text-white/20'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1 pt-2">
                        <p className={`text-sm md:text-base font-black italic uppercase tracking-tight transition-colors ${isActive ? 'text-white' : 'text-white/20'}`}>
                          {s.label}
                        </p>
                        {isCurrent && <p className="text-[10px] font-bold text-[#ff385c] uppercase tracking-widest mt-1">Mise à jour en direct</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                  <MapPin className="w-4 h-4 text-[#ff385c]" /> Destination
                </div>
                <p className="text-xs font-bold leading-relaxed">{order.clientName}<br/>123 Rue du Marché, Paris</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                  <Clock className="w-4 h-4" /> Estimation
                </div>
                <p className="text-xl font-black italic">15-20 MIN</p>
              </div>
            </div>
          </div>

          {/* Right Side: Map */}
          <div className="flex-1 min-h-[500px] lg:min-h-0 relative">
            {(isPickedUp || driverLocation) && API_KEY ? (
              <div className="h-full w-full rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl relative">
                <APIProvider apiKey={API_KEY}>
                    <Map
                      defaultCenter={driverLocation || userLocation}
                      defaultZoom={15}
                      mapId="LGF_TRACKER_DARK"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      options={{
                        styles: mapStyle,
                        disableDefaultUI: true,
                        zoomControl: false,
                        keyboardShortcuts: false
                      }}
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
                          <div className="absolute inset-0 bg-[#ff385c]/20 blur-xl rounded-full scale-150 animate-pulse" />
                          <div className="w-14 h-14 bg-[#ff385c] rounded-2xl flex items-center justify-center border-2 border-black shadow-2xl relative z-10">
                            <Bike className="w-7 h-7 text-white" />
                          </div>
                        </div>
                      </AdvancedMarker>
                    )}

                    <AdvancedMarker position={userLocation}>
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-md rounded-full animate-ping" />
                        <MapPin className="w-10 h-10 text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                      </div>
                    </AdvancedMarker>
                  </Map>
                </APIProvider>

                {/* Driver Info Floating Card */}
                {order.driverName && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-8 left-8 right-8 bg-[#08090a]/90 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] flex items-center justify-between shadow-2xl"
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.driverName}`} alt="Driver" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[#08090a] flex items-center justify-center">
                          <Navigation className="w-3 h-3 text-white fill-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-black uppercase italic tracking-tight">{order.driverName}</h4>
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[8px] font-black rounded uppercase tracking-widest">Courier Pro</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#ff385c] text-[#ff385c]" />
                            <span className="text-[10px] font-black text-white/40">4.9/5</span>
                          </div>
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">• LetsGo Logistics</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <button className="px-5 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform active:scale-95 shadow-xl">Appeler</button>
                    </div>
                  </motion.div>
                )}

                {/* Tips Section */}
                {isPickedUp && !order.tip && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-8 left-8 right-8 md:right-auto md:w-80 glass p-8 rounded-[2rem] space-y-6 shadow-2xl z-40 border-[#ff385c]/10"
                  >
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-[#ff385c]/10 rounded-lg">
                        <Coins className="w-5 h-5 text-[#ff385c]" />
                       </div>
                       <h4 className="text-xs font-black uppercase tracking-widest">Encourager {order.driverName || 'le livreur'} ?</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[2, 5, 10].map((amt) => (
                        <button
                          key={amt}
                          disabled={isTipping}
                          onClick={() => handleTip(amt)}
                          className="py-4 bg-white/5 border border-white/10 rounded-xl text-sm font-black italic hover:bg-[#ff385c] transition-all disabled:opacity-50"
                        >
                          {amt}€
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-white/30 italic text-center font-bold tracking-tight">100% du pourboire lui sera reversé.</p>
                  </motion.div>
                )}

                {order.tip > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-8 right-8 bg-[#ff385c]/10 backdrop-blur-xl border border-[#ff385c]/20 px-4 py-2 rounded-full flex items-center gap-2 z-40"
                  >
                    <Heart className="w-3 h-3 text-[#ff385c] fill-[#ff385c]" />
                    <span className="text-[10px] font-black uppercase text-[#ff385c] tracking-widest">Pourboire de {order.tip}€ ajouté</span>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="h-full w-full rounded-[3rem] bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                  <ChefHat className="w-10 h-10 text-white/10 group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black italic uppercase tracking-tight">Préparation en cours</h3>
                  {!API_KEY && <p className="text-[10px] text-red-500/60 font-medium uppercase tracking-widest">Attention: Clé Google Maps manquante</p>}
                  <p className="text-xs text-white/20 font-bold max-w-xs mx-auto">La carte s'activera automatiquement dès que le coursier aura récupéré votre colis.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
