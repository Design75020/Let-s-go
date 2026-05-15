import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { config } from '../config';

const firebaseConfig = {
  apiKey: config.FIREBASE.API_KEY,
  authDomain: config.FIREBASE.AUTH_DOMAIN,
  projectId: config.FIREBASE.PROJECT_ID,
  storageBucket: config.FIREBASE.STORAGE_BUCKET,
  messagingSenderId: config.FIREBASE.MESSAGING_SENDER_ID,
  appId: config.FIREBASE.APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, config.FIREBASE.FIRESTORE_DB_ID);
