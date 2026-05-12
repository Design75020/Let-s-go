import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Search, Star, Clock, MapPin, Zap, Navigation, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const CUISINES = ["Tous", "Francais", "Japonais", "Italien", "Indien", "Americain"];

export default function ClientHome() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [geoStatus, setGeoStatus] = useState("loading"); // loading, granted, denied

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setGeoStatus("granted");
      },
      () => {
        setGeoStatus("denied");
        // Default to Paris center if denied
        setUserLat(48.8566);
        setUserLng(2.3522);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const fetchRestaurants = useCallback(async () => {
    try {
      const params = { status: "active" };
      if (search) params.search = search;
      if (cuisine !== "Tous") params.cuisine_type = cuisine;
      if (userLat !== null) params.lat = userLat;
      if (userLng !== null) params.lng = userLng;
      const { data } = await api.get("/restaurants", { params });
      setRestaurants(data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [search, cuisine, userLat, userLng]);

  useEffect(() => {
    if (userLat === null && geoStatus === "loading") return;
    const debounce = setTimeout(fetchRestaurants, 300);
    return () => clearTimeout(debounce);
  }, [fetchRestaurants, geoStatus, userLat]);

  return (
    <div data-testid="client-home" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: 'Outfit' }}>
          Envie de quoi <span className="text-[#FF6B00]">aujourd'hui</span> ?
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-base sm:text-lg">Livraison gratuite en 20 min</p>
          {geoStatus === "granted" && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-medium">
              <Navigation className="w-3 h-3" />Position activee
            </span>
          )}
          {geoStatus === "denied" && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium">
              <AlertCircle className="w-3 h-3" />Position par defaut
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-lg animate-fade-in stagger-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          data-testid="restaurant-search"
          placeholder="Rechercher un restaurant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 text-base rounded-xl border-border bg-white"
        />
      </div>

      {/* Cuisine filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in stagger-2">
        {CUISINES.map((c) => (
          <button
            key={c}
            data-testid={`cuisine-filter-${c.toLowerCase()}`}
            onClick={() => setCuisine(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              cuisine === c
                ? "bg-[#FF6B00] text-white shadow-md"
                : "bg-white text-foreground/70 border border-border hover:border-[#FF6B00]/30 hover:text-[#FF6B00]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Restaurant grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border h-72 animate-pulse" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">Aucun restaurant trouve</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r, idx) => {
            const isFast = r.fast_delivery;
            const isFree = r.free_delivery;
            const outOfZone = r.in_zone === false;

            return (
              <Link
                key={r.id}
                to={outOfZone ? "#" : `/restaurant/${r.id}`}
                data-testid={`restaurant-card-${r.id}`}
                onClick={(e) => { if (outOfZone) { e.preventDefault(); toast.error("Ce restaurant est hors de votre zone de livraison 20 min"); } }}
                className={`group bg-white rounded-xl border overflow-hidden card-hover animate-fade-in stagger-${Math.min(idx + 1, 4)} ${
                  outOfZone ? "border-border opacity-60" : isFast ? "border-[#10B981]/30" : "border-border"
                }`}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={r.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {isFast && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#10B981] text-white text-[11px] font-bold shadow-md" data-testid={`fast-badge-${r.id}`}>
                        <Zap className="w-3 h-3" />20 min
                      </span>
                    )}
                    {isFree && (
                      <span className="px-2.5 py-1 rounded-full bg-[#FF6B00] text-white text-[11px] font-bold shadow-md">
                        Livraison gratuite
                      </span>
                    )}
                  </div>
                  <Badge className="absolute top-3 right-3 bg-white/90 text-foreground backdrop-blur-sm border-0">
                    <Star className="w-3 h-3 mr-1 text-[#F59E0B] fill-[#F59E0B]" />
                    {r.rating}
                  </Badge>
                  {outOfZone && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="bg-white/90 px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground">Hors zone</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-base" style={{ fontFamily: 'Outfit' }}>{r.name}</h3>
                    <Badge variant="outline" className="text-[10px] shrink-0">{r.cuisine_type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{r.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {r.distance_km !== null && r.distance_km !== undefined && (
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <MapPin className="w-3 h-3 text-[#FF6B00]" />{r.distance_km} km
                      </span>
                    )}
                    {r.delivery_min !== null && r.delivery_min !== undefined && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{r.delivery_min} min
                      </span>
                    )}
                    <span className={`font-medium ${isFree ? "text-[#10B981]" : ""}`}>
                      {isFree ? "Gratuit" : `${r.delivery_fee.toFixed(2)} EUR`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
