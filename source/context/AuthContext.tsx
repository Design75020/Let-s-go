
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, getUserProfile, createUserProfile } from '../lib/firebase';

interface AuthContextType {
  user: any;
  loginWithGoogle: (role: string) => Promise<void>;
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
        setUser(profile ? { ...profile, uid: firebaseUser.uid } : null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (role: string) => {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = await getUserProfile(result.user.uid);
    if (!profile) {
      const newProfile = await createUserProfile(result.user, role);
      setUser({ ...newProfile, uid: result.user.uid });
    } else {
      setUser({ ...profile, uid: result.user.uid });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
