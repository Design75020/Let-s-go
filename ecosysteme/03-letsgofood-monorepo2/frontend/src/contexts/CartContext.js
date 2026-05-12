import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart_items") || "[]"); } catch { return []; }
  });
  const [restaurantId, setRestaurantId] = useState(() => localStorage.getItem("cart_restaurant_id") || null);
  const [restaurantName, setRestaurantName] = useState(() => localStorage.getItem("cart_restaurant_name") || null);
  const [deliveryFee, setDeliveryFee] = useState(() => parseFloat(localStorage.getItem("cart_delivery_fee") || "0"));

  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
    localStorage.setItem("cart_restaurant_id", restaurantId || "");
    localStorage.setItem("cart_restaurant_name", restaurantName || "");
    localStorage.setItem("cart_delivery_fee", String(deliveryFee));
  }, [items, restaurantId, restaurantName, deliveryFee]);

  const addItem = useCallback((item, restId, restName, fee) => {
    if (restaurantId && restaurantId !== restId) {
      if (!window.confirm("Votre panier contient des articles d'un autre restaurant. Vider le panier ?")) return false;
      setItems([]);
    }
    setRestaurantId(restId);
    setRestaurantName(restName);
    setDeliveryFee(fee);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...item, quantity: 1 }];
    });
    return true;
  }, [restaurantId]);

  const removeItem = useCallback((itemId) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== itemId);
      if (next.length === 0) { setRestaurantId(null); setRestaurantName(null); setDeliveryFee(0); }
      return next;
    });
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) { removeItem(itemId); return; }
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setDeliveryFee(0);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const contextValue = useMemo(() => ({
    items, restaurantId, restaurantName, deliveryFee, addItem, removeItem,
    updateQuantity, clearCart, subtotal, total, itemCount
  }), [items, restaurantId, restaurantName, deliveryFee, addItem, removeItem,
    updateQuantity, clearCart, subtotal, total, itemCount]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
