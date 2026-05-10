import React, { createContext, useContext, useState, useEffect } from 'react';

type AuthStatus = 'INIT' | 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

interface AuthContextType {
  token: string | null;
  user: any | null;
  status: AuthStatus;
  login: (token: string, user: any) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);
  const [status, setStatus] = useState<AuthStatus>('INIT');

  useEffect(() => {
    const validateSession = async () => {
      if (!token) {
        setStatus('UNAUTHENTICATED');
        return;
      }

      setStatus('LOADING');
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setStatus('AUTHENTICATED');
        } else {
          throw new Error('Session invalide');
        }
      } catch (e) {
        console.error("Session Sync Failure:", e);
        logout();
      }
    };

    validateSession();
  }, [token]);

  const login = (newToken: string, userData: any) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setStatus('AUTHENTICATED');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setStatus('UNAUTHENTICATED');
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      status, 
      login, 
      logout, 
      isLoading: status === 'INIT' || status === 'LOADING' 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
