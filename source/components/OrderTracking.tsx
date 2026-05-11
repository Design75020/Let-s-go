import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  Heart
} from 'lucide-react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';

// Directions Component Implementation
function Directions({ driverLocation, destination }: { driverLocation: any, destination: any }) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#10b981',
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !driverLocation) return;

    // Use string literal to avoid crash if google.maps is not fully initialized in global scope
    const travelMode = (window as any).google?.maps?.TravelMode?.DRIVING || 'DRIVING';

    directionsService.route({
      origin: driverLocation,
      destination: destination,
      travelMode: travelMode as any
    }).then(response => {
      directionsRenderer.setDirections(response);
    }).catch(err => {
      console.error('Directions request failed:', err);
    });
  }, [directionsService, directionsRenderer, driverLocation, destination]);

  return null;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const statuses = [
  { id: 'paid', label: 'Paiement validé', icon: CheckCircle2, color: 'text-blue-400' },
  { id: 'preparing', label: 'En cuisine', icon: ChefHat, color: 'text-amber-400' },
  { id: 'ready', label: 'Prêt pour enlèvement', icon: Package, color: 'text-purple-400' },
  { id: 'picked_up', label: 'En cours de livraison', icon: Bike, color: 'text-emerald-400' },
  { id: 'delivered', label: 'Livré ! Bon appétit', icon: CheckCircle2, color: 'text-emerald-500' }
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
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [isTipping, setIsTipping] = useState(false);

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
  
  const handleTip = async (amount: number) => {
    try {
      setIsTipping(true);
      const res = await fetch(`/api/orders/${id}/tip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrder(updatedOrder);
        setSelectedTip(amount);
      }
    } catch (err) {
      console.error('Tip Error:', err);
    } finally {
      setIsTipping(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // Poll for status updates
    
    // WS for real-time location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'driver_location' && payload.data.orderId === id) {
          setDriverLocation(payload.data.location);
        }
        if (payload.type === 'order_update' && payload.data.orderId === id) {
          fetchOrder();
        }
      } catch (err) {
        console.error('WS Error:', err);
      }
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [id]);

  if (loading) return <div className="h-screen bg-[#08090a] flex items-center justify-center text-emerald-400 font-mono">CONNEXION AU TRACKER...</div>;

  const currentStatusIndex = statuses.findIndex(s => s.id === order?.status);
  const displayStatusIndex = currentStatusIndex === -1 ? (order?.status === 'pending' ? -1 : 0) : currentStatusIndex;
  const isPickedUp = order?.status === 'picked_up';

  if (!hasValidKey) {
    return (
      <div className="min-h-screen bg-[#08090a] flex flex-col items-center justify-center p-8 text-center text-white">
        <h2 className="text-2xl font-black italic mb-4">MAPS CONFIGURATION REQUIRED</h2>
        <p className="text-white/40 mb-6 max-w-sm">Please add GOOGLE_MAPS_PLATFORM_KEY to secrets in AI Studio settings to enable real-time tracking.</p>
        <Link to="/" className="px-6 py-3 bg-emerald-500 text-black font-black rounded-xl">Back to App</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-white p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-8 pt-12">
        <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side: Status Steps */}
          <div className="flex-1 space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Commande <span className="text-emerald-400 text-lg opacity-50">#{id?.slice(-6)}</span></h1>
              <p className="text-white/40 text-sm">Suivez votre livraison en temps réel</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="flex flex-col gap-8 relative z-10">
                {statuses.map((s, index) => {
                  const Icon = s.icon;
                  const isActive = index <= displayStatusIndex;
                  const isCurrent = index === displayStatusIndex;

                  return (
                    <div key={s.id} className="flex gap-6 relative">
                      {index < statuses.length - 1 && (
                        <div className={`absolute left-6 top-12 w-0.5 h-12 ${index < displayStatusIndex ? 'bg-emerald-500' : 'bg-white/10'} transition-colors duration-500`} />
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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

          {/* Right Side: Map */}
          <div className="flex-1 min-h-[400px] md:min-h-0 relative">
            {(isPickedUp || driverLocation) ? (
              <div className="h-full w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative">
                <APIProvider apiKey={API_KEY} version="weekly">
                    <Map
                      defaultCenter={driverLocation || { lat: 45.76, lng: 4.83 }}
                      defaultZoom={15}
                      mapId="DEMO_MAP_ID"
                      options={{
                        styles: mapStyle,
                        disableDefaultUI: true,
                        zoomControl: false,
                        keyboardShortcuts: false
                      }}
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      style={{ width: '100%', height: '100%' }}
                    >
                    {/* Route Line Rendering */}
                    {driverLocation && (
                      <Directions 
                        driverLocation={driverLocation} 
                        destination={{ lat: 45.75, lng: 4.85 }} 
                      />
                    )}

                    {driverLocation && (
                      <AdvancedMarker position={driverLocation}>
                        <div className="relative group/bike">
                          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150 animate-pulse" />
                          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center border-2 border-black shadow-2xl transition-transform duration-500 hover:rotate-12 relative z-10">
                            <Bike className="w-6 h-6 text-black" />
                          </div>
                        </div>
                      </AdvancedMarker>
                    )}
                    {/* User Destination Marker */}
                    <AdvancedMarker position={{ lat: 45.75, lng: 4.85 }}>
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-md rounded-full animate-ping" />
                        <MapPin className="w-8 h-8 text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                      </div>
                    </AdvancedMarker>
                  </Map>
                </APIProvider>

                {/* Driver Info Floating Card */}
                {driverLocation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-6 left-6 right-6 bg-[#1a1c1e]/90 backdrop-blur-3xl border border-white/10 p-5 rounded-3xl flex items-center justify-between shadow-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center overflow-hidden border border-emerald-500/20">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marc" alt="Driver" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#1a1c1e] flex items-center justify-center">
                          <Navigation className="w-3 h-3 text-black" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black uppercase tracking-tight">Marc</h4>
                          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-500 text-[8px] font-bold rounded uppercase">Vérifié</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span className="text-[10px] font-black text-white/40">4.9</span>
                          </div>
                          <span className="text-[10px] font-bold text-white/20">• Toyota Corolla</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Arrivée dans</span>
                        <span className="text-2xl font-black italic tracking-tighter text-white">~4 MIN</span>
                      </div>
                      <button className="mt-2 text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-emerald-500 transition-colors">Appeler</button>
                    </div>
                  </motion.div>
                )}

                {/* Tips Section */}
                {driverLocation && !order?.tip && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-6 left-6 right-6 bg-black/40 backdrop-blur-3xl border border-white/10 p-6 rounded-3xl space-y-4 shadow-2xl z-40"
                  >
                    <div className="flex items-center gap-2">
                       <Coins className="w-4 h-4 text-emerald-500" />
                       <h4 className="text-xs font-black uppercase tracking-widest text-white">Encourager Marc ?</h4>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 5, 10].map((amt) => (
                        <button
                          key={amt}
                          disabled={isTipping}
                          onClick={() => handleTip(amt)}
                          className="py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-50"
                        >
                          {amt}€
                        </button>
                      ))}
                      <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black hover:bg-white/10 transition-all opacity-50">Custom</button>
                    </div>
                    <p className="text-[10px] text-white/30 italic text-center">100% des pourboires vont au livreur.</p>
                  </motion.div>
                )}

                {order?.tip > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-6 right-6 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 z-40"
                  >
                    <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Pourboire de {order.tip}€ ajouté</span>
                  </motion.div>
                )}
                {!driverLocation && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-center p-6 bg-gradient-to-t from-[#08090a] to-transparent">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                        <Bike className="w-6 h-6 text-white animate-pulse" />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-widest text-emerald-500">Waiting for driver location...</p>
                      <p className="text-[10px] text-white/40">The driver is currently picking up your order.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full w-full rounded-[2.5rem] bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12 space-y-4">
                <ChefHat className="w-12 h-12 text-white/10" />
                <div>
                  <h3 className="font-bold text-white/60">Preparation in Progress</h3>
                  <p className="text-xs text-white/20">The map will activate once the courier picks up your package.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
