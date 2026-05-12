'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Clock, MapPin, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function RestaurantDetailClient({ restaurant, initialMenuItems }) {
  const [menuItems] = useState(initialMenuItems);
  const { addItem, itemCount } = useCart();

  const categories = useMemo(() => [...new Set(menuItems.map((i) => i.category))], [menuItems]);
  const itemsByCategory = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat] = menuItems.filter((i) => i.category === cat && i.available);
    });
    return map;
  }, [categories, menuItems]);

  const handleAddItem = (item) => {
    const added = addItem(
      { id: item.id, name: item.name, price: item.price, image_url: item.image_url },
      restaurant.id,
      restaurant.name,
      restaurant.delivery_fee
    );
    if (added) toast.success(`${item.name} ajouté au panier`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <Link
        href="/restaurants"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />Retour aux restaurants
      </Link>

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-56 sm:h-72 animate-fade-in">
        {restaurant.image_url && (
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>
            {restaurant.name}
          </h1>
          <p className="text-white/80 mb-3">{restaurant.description}</p>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            {restaurant.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                {restaurant.rating}
              </span>
            )}
            {restaurant.delivery_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />{restaurant.delivery_time}
              </span>
            )}
            {restaurant.delivery_fee !== undefined && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {restaurant.delivery_fee === 0 ? 'Livraison gratuite' : `${restaurant.delivery_fee.toFixed(2)} € livraison`}
              </span>
            )}
            {restaurant.cuisine_type && (
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                {restaurant.cuisine_type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating cart button */}
      {itemCount > 0 && (
        <Link
          href="/cart"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#FF6B00] text-white px-5 py-3 rounded-full shadow-lg hover:bg-[#E05E00] transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">{itemCount} article{itemCount > 1 ? 's' : ''}</span>
        </Link>
      )}

      {/* Menu sections */}
      {categories.map((cat) => (
        <div key={cat} className="mb-8 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2" style={{ fontFamily: 'Outfit' }}>
            {cat}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {itemsByCategory[cat].map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-white rounded-xl border border-border p-4 card-hover"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-24 h-24 rounded-lg object-cover shrink-0"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#FF6B00]">{item.price.toFixed(2)} €</span>
                    <button
                      onClick={() => handleAddItem(item)}
                      className="flex items-center gap-1 bg-[#FF6B00] hover:bg-[#E05E00] text-white h-8 px-3 text-xs rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3" />Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {categories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Le menu n'est pas encore disponible.</p>
        </div>
      )}
    </div>
  );
}
