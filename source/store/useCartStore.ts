import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: Record<string, CartItem>;
  restaurantId: string | null;
  addItem: (item: CartItem, restaurantId: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: {},
  restaurantId: null,

  addItem: (item, restaurantId) => set((state) => {
    // If adding from a different restaurant, clear previous cart
    const items = state.restaurantId !== restaurantId ? {} : { ...state.items };

    if (items[item.id]) {
      items[item.id] = {
        ...items[item.id],
        quantity: items[item.id].quantity + 1
      };
    } else {
      items[item.id] = { ...item, quantity: 1 };
    }

    return { items, restaurantId };
  }),

  removeItem: (itemId) => set((state) => {
    const items = { ...state.items };
    if (items[itemId]) {
      if (items[itemId].quantity > 1) {
        items[itemId].quantity -= 1;
      } else {
        delete items[itemId];
      }
    }
    return { items, restaurantId: Object.keys(items).length === 0 ? null : state.restaurantId };
  }),

  clearCart: () => set({ items: {}, restaurantId: null }),

  getTotal: () => {
    const { items } = get();
    return Object.values(items).reduce((acc, item) => acc + item.price * item.quantity, 0);
  },

  getItemCount: () => {
    const { items } = get();
    return Object.values(items).reduce((acc, item) => acc + item.quantity, 0);
  }
}));
