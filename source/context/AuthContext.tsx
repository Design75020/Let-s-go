
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db, getUserProfile, createUserProfile } from '../lib/firebase';

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
          setUser({ ...profile, uid: firebaseUser.uid });
        } else {
          // Fallback for cases where profile might be missing but user is logged in
          setUser({ uid: firebaseUser.uid, role: 'client' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Dev accounts: email → password mapping for direct login
  const DEV_ACCOUNTS: Record<string, { password: string; role: string }> = {
    'admin@letsgofood.fr':    { password: 'v15stable', role: 'admin' },
    'admin@lgf.com':          { password: 'v15stable', role: 'admin' },
    'merchant@lgf.com':       { password: 'v15stable', role: 'merchant' },
    'driver@lgf.com':         { password: 'v15stable', role: 'driver' },
    'client@lgf.com':         { password: 'v15stable', role: 'client' },
    'letsgofood26@gmail.com': { password: 'v15stable', role: 'admin' },
    'u6860348073@id.gle':     { password: 'v15stable', role: 'admin' },
  };

  const loginAsEmail = async (email: string, role: string) => {
    setLoading(true);
    try {
      const devAccount = DEV_ACCOUNTS[email];
      const password = devAccount?.password || 'v15stable';
      const effectiveRole = devAccount?.role || role;

      let firebaseUser: any;
      try {
        // FIX: Use signInWithEmailAndPassword instead of disabled signInAnonymously
        const result = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = result.user;
      } catch (signInErr: any) {
        // Auto-create account if it doesn't exist yet
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          firebaseUser = result.user;
        } else {
          throw signInErr;
        }
      }

      const isDevEmail = !!devAccount;
      const profile = {
        name: email.split('@')[0],
        email,
        role: effectiveRole,
        isDev: isDevEmail,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
      setUser({ ...profile, uid: firebaseUser.uid });
    } catch (err) {
      console.error('Email login failed', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (role: string) => {
    const result = await signInWithPopup(auth, googleProvider);
    let effectiveRole = role;
    
    const profile = await getUserProfile(result.user.uid);
    if (!profile) {
      const newProfile = await createUserProfile(result.user, effectiveRole);
      setUser({ ...newProfile, uid: result.user.uid });
    } else {
      const isDevEmail = result.user.email === 'letsgofood26@gmail.com' || 
                         result.user.email === 'admin@lgf.com' || 
                         result.user.email === 'u6860348073@id.gle';
                         
      if (isDevEmail) {
        // Dev users can switch roles on the fly via login buttons
        profile.role = effectiveRole;
        await updateDoc(doc(db, 'users', result.user.uid), { role: effectiveRole });
      }
      setUser({ ...profile, uid: result.user.uid });
    }
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
