'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';

export default function PrivateProviders({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}
