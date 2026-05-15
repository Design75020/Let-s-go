
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, getUserProfile, createUserProfile } from '../../lib/firebase';
import { syncAuth } from './authApi';

interface AuthContextType {
  user: any;
  loginWithGoogle: (role: string) => Promise<void>;
  loginAsEmail: (email: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          // Sync with backend to get valid app token
          try {
            await syncAuth(firebaseUser, profile.role);
          } catch (e) {
            console.error("Auth sync failed", e);
          }
          setUser({ ...profile, uid: firebaseUser.uid });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('lgf_token');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginAsEmail = async (email: string, role: string) => {
    // SECURITY: Backdoor removed. Dev login disabled in production.
    throw new Error('Login direct désactivé. Utilisez Google Auth.');
  };

  const loginWithGoogle = async (role: string) => {
    const result = await signInWithPopup(auth, googleProvider);

    let profile = await getUserProfile(result.user.uid);
    if (!profile) {
      // New users get the requested role (restricted by backend/rules later)
      profile = await createUserProfile(result.user, role);
    }

    // Sync with backend immediately after login
    await syncAuth(result.user, profile.role);
    setUser({ ...profile, uid: result.user.uid });
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginAsEmail, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
