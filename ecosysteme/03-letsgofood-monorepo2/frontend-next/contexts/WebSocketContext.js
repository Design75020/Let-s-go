'use client';
import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);
const WS_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://letsgofood-monorepo2-production.up.railway.app')
  .replace(/^https/, 'wss').replace(/^http/, 'ws');

export function WebSocketProvider({ children }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const listenersRef = useRef({});

  const connect = useCallback(() => {
    if (!user) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('foodrush_token') : null;
      if (!token) return;
      const socket = new WebSocket(`${WS_URL}/api/ws?token=${token}`);
      socket.onopen = () => {
        setConnected(true);
        socket._heartbeat = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'ping' }));
        }, 25000);
      };
      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'pong') return;
          setLastEvent(data);
          Object.values(listenersRef.current).forEach((cb) => cb(data));
        } catch { /* noop */ }
      };
      socket.onclose = () => {
        setConnected(false);
        if (socket._heartbeat) clearInterval(socket._heartbeat);
        reconnectRef.current = setTimeout(() => { if (user) connect(); }, 3000);
      };
      socket.onerror = (err) => { console.warn('WS error:', err); socket.close(); };
      wsRef.current = socket;
    } catch (err) { console.warn('WS init error:', err); }
  }, [user]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  const subscribe = useCallback((id, callback) => {
    listenersRef.current[id] = callback;
    return () => { delete listenersRef.current[id]; };
  }, []);

  const contextValue = useMemo(() => ({ connected, lastEvent, subscribe }), [connected, lastEvent, subscribe]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext) || { connected: false, lastEvent: null, subscribe: () => () => {} };
}
