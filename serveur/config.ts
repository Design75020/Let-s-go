
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'lgf-v10-production-key-change-me',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  FIREBASE: {
    API_KEY: process.env.VITE_FIREBASE_API_KEY,
    AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
    STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    APP_ID: process.env.VITE_FIREBASE_APP_ID,
    FIRESTORE_DB_ID: process.env.VITE_FIREBASE_FIRESTORE_DB_ID,
  },
  GOOGLE_MAPS_KEY: process.env.VITE_GOOGLE_MAPS_KEY,
};
