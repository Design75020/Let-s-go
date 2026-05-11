import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  history: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearHistory: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [history, setHistory] = useState<Notification[]>([]);

  const addNotification = useCallback((n: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNote = { ...n, id };
    setNotifications((prev) => [...prev, newNote]);
    setHistory((prev) => [newNote, ...prev].slice(0, 20)); // Keep last 20
    setTimeout(() => removeNotification(id), 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    let socket: WebSocket;

    const connect = () => {
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type.startsWith('ORDER_')) {
            const orderData = payload.data?.data || payload.data;
            const status = orderData?.status || 'updated';
            
            addNotification({
              type: 'info',
              title: `Order Update`,
              message: `Your order is now: ${status.replace('_', ' ')}`
            });
          }
        } catch (err) {
          console.error('WS parsing error:', err);
        }
      };

      socket.onclose = () => {
        setTimeout(connect, 3000); // Reconnect logic
      };
    };

    connect();
    return () => socket?.close();
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, history, addNotification, removeNotification, clearHistory }}>
      {children}
      <div className="fixed bottom-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-80">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto bg-[#1a1c1e]/90 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl flex gap-4"
            >
              <div className="shrink-0 pt-1">
                {n.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
                {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {n.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-white">{n.title}</h4>
                <p className="text-xs text-white/50">{n.message}</p>
              </div>
              <button 
                onClick={() => removeNotification(n.id)}
                className="shrink-0 p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/20" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
