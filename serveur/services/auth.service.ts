import jwt from 'jsonwebtoken';
import { adminAuth, adminDb } from '../lib/firebase-admin';
import { config } from '../config';

const SECRET = config.JWT_SECRET;

export interface JWTPayload {
  uid: string;
  email: string;
  role: string;
}

export class AuthService {
  /**
   * Verifies Firebase ID Token and returns a local application JWT.
   */
  static async authenticateFirebaseUser(idToken: string): Promise<{ token: string; user: JWTPayload }> {
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Authoritative role check from DB
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    const user: JWTPayload = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: userData?.role || 'customer'
    };

    const token = jwt.sign(user, SECRET, { expiresIn: '30m' });
    return { token, user };
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
