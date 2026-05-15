import admin from 'firebase-admin';
import { config } from '../config';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: config.FIREBASE.PROJECT_ID,
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
