import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

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
