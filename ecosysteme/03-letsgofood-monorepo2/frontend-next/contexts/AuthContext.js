'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api, { setAuthToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.access_token) setAuthToken(data.access_token);
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.access_token) setAuthToken(data.access_token);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (err) { console.warn('Logout error:', err); }
    setAuthToken(null);
    setUser(false);
  }, []);

  const contextValue = useMemo(() => ({
    user, loading, login, register, logout, checkAuth
  }), [user, loading, login, register, logout, checkAuth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
