
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, getUserProfile, createUserProfile } from '../lib/firebase';

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
        setUser(profile ? { ...profile, uid: firebaseUser.uid } : null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginAsEmail = async (email: string, role: string) => {
    // SECURITY NOTE: This is an emergency bypass for the preview environment 
    // when Google Auth popups are blocked by browser/domain restrictions.
    if (email === 'letsgofood26@gmail.com' || email === 'admin@lgf.com') {
      const mockUid = 'dev-uid-' + email.split('@')[0];
      const profile = {
        name: 'Sidi (Dev)',
        email,
        role,
        uid: mockUid,
        isDev: true
      };
      setUser(profile);
      setLoading(false);
      return;
    }
    throw new Error('Non autorisé.');
  };

  const loginWithGoogle = async (role: string) => {
    // If we're bypassing Google Auth for the specific tester email
    // This is handled partly in Login.tsx, but here we enforce the logic
    const result = await signInWithPopup(auth, googleProvider);
    let effectiveRole = role;
    
    // Explicitly grant admin role to the provided tester email
    if (result.user.email === 'letsgofood26@gmail.com') {
      effectiveRole = 'admin';
    }

    const profile = await getUserProfile(result.user.uid);
    if (!profile) {
      const newProfile = await createUserProfile(result.user, effectiveRole);
      setUser({ ...newProfile, uid: result.user.uid });
    } else {
      // If user logs in with a specific role via the portal buttons, 
      // we might want to update their role for easier testing
      if (profile.role !== effectiveRole && (result.user.email === 'letsgofood26@gmail.com' || result.user.email === 'admin@lgf.com')) {
        profile.role = effectiveRole;
        await createUserProfile(result.user, effectiveRole); // Update role in DB
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
