
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';
import { logger } from './services/infrastructure/Observability';

let projectId = process.env.FIREBASE_PROJECT_ID || 'letsgofood-v10';
let databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.projectId) projectId = config.projectId;
    if (config.firestoreDatabaseId) databaseId = config.firestoreDatabaseId;
  }
} catch (e: any) {
  logger.warn("Failed to load firebase config from json file, using env fallbacks:", e.message);
}

let app: admin.app.App;

try {
  if (!admin.apps.length) {
    app = admin.initializeApp({
      projectId: projectId
    });
    logger.info({ projectId }, 'Firebase Admin initialized with projectId');
  } else {
    app = admin.app();
  }
} catch (error) {
  logger.error({ error }, 'Firebase Admin initialization error');
  app = admin.apps[0] || admin.initializeApp({ projectId });
}

export const adminDb = databaseId && databaseId !== '(default)' 
  ? getFirestore(app, databaseId) 
  : getFirestore(app);
export const adminAuth = admin.auth();


