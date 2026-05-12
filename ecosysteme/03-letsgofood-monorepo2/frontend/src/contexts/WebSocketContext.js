import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { getAuthToken } from "../lib/api";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { user } = useAuth();
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const listenersRef = useRef({});

  const connect = useCallback(() => {
    const token = getAuthToken();
    if (!user || !token) return;

    const wsUrl = process.env.REACT_APP_BACKEND_URL
      .replace("https://", "wss://")
      .replace("http://", "ws://");

    try {
      const socket = new WebSocket(`${wsUrl}/api/ws/${token}`);

      socket.onopen = () => {
        setConnected(true);
        // Heartbeat every 30s
        const heartbeat = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send("ping");
          }
        }, 30000);
        socket._heartbeat = heartbeat;
      };

      socket.onmessage = (event) => {
        if (event.data === "pong") return;
        try {
          const data = JSON.parse(event.data);
          setLastEvent({ ...data, _ts: Date.now() });
          Object.values(listenersRef.current).forEach((cb) => {
            try { cb(data); } catch (err) { console.warn("WS listener error:", err); }
          });
        } catch (err) { console.warn("WS message parse error:", err); }
      };

      socket.onclose = () => {
        setConnected(false);
        if (socket._heartbeat) clearInterval(socket._heartbeat);
        reconnectRef.current = setTimeout(() => {
          if (user) connect();
        }, 3000);
      };

      socket.onerror = (err) => {
        console.warn("WS connection error:", err);
        socket.close();
      };

      wsRef.current = socket;
    } catch (err) { console.warn("WS init error:", err); }
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

  const contextValue = useMemo(() => ({
    connected, lastEvent, subscribe
  }), [connected, lastEvent, subscribe]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext) || { connected: false, lastEvent: null, subscribe: () => () => {} };
}
