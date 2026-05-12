'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, MapPin, Search, ChefHat } from 'lucide-react';

export default function RestaurantsClient({ initialRestaurants }) {
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');

  const cuisines = useMemo(() => {
    const set = new Set(initialRestaurants.map((r) => r.cuisine_type).filter(Boolean));
    return Array.from(set).sort();
  }, [initialRestaurants]);

  const filtered = useMemo(() => {
    return initialRestaurants.filter((r) => {
      const matchSearch = !search ||
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine_type?.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase());
      const matchCuisine = !selectedCuisine || r.cuisine_type === selectedCuisine;
      return matchSearch && matchCuisine;
    });
  }, [initialRestaurants, search, selectedCuisine]);

  return (
    <>
      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher un restaurant, une cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30"
          />
        </div>
        <select
          value={selectedCuisine}
          onChange={(e) => setSelectedCuisine(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30"
        >
          <option value="">Toutes les cuisines</option>
          {cuisines.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Restaurant grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Aucun restaurant trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/restaurants/${restaurant.id}`}
              className="group bg-white rounded-2xl border border-border overflow-hidden card-hover block"
              aria-label={`Commander chez ${restaurant.name}`}
            >
              {/* Image */}
              <div className="relative h-48 bg-muted overflow-hidden">
                {restaurant.image_url ? (
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                {!restaurant.is_open && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">Fermé</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h2 className="font-semibold text-base leading-tight" style={{ fontFamily: 'Outfit' }}>
                    {restaurant.name}
                  </h2>
                  {restaurant.rating && (
                    <span className="flex items-center gap-1 text-xs font-medium text-[#F59E0B] shrink-0 ml-2">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                      {restaurant.rating}
                    </span>
                  )}
                </div>
                {restaurant.cuisine_type && (
                  <p className="text-xs text-muted-foreground mb-2">{restaurant.cuisine_type}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {restaurant.delivery_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {restaurant.delivery_time}
                    </span>
                  )}
                  {restaurant.delivery_fee !== undefined && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {restaurant.delivery_fee === 0 ? 'Livraison gratuite' : `${restaurant.delivery_fee.toFixed(2)} € livraison`}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
