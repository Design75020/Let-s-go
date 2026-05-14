/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// SECURITY POLICY: Configuration MUST be provided via Environment Variables.
// Legacy JSON import has been removed to prevent secret leakage in frontend bundles.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID
};

// Guard clause for missing configuration
if (!firebaseConfig.apiKey) {
  console.error("CRITICAL SECURITY ERROR: Firebase API Key is missing. Please configure VITE_FIREBASE_API_KEY in Environment Variables.");
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function getUserProfile(uid: string) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data() : null;
}

export async function createUserProfile(user: User, role: string) {
  const profile = {
    name: user.displayName || 'Utilisateur',
    email: user.email,
    role: role,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', user.uid), profile);
  return profile;
}
