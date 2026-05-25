
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logger } from './Observability';

const JWT_SECRET = process.env.JWT_SECRET || 'v15-super-secret-key-stable';
const EVENT_SIGNING_SECRET = process.env.EVENT_SIGNING_SECRET || 'v15-event-stable-secret';

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  RESTAURANT = 'restaurant',
  CUSTOMER = 'customer'
}

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
}

export class Security {
  /**
   * JWT Management
   */
  public static generateToken(user: AuthUser): string {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  }

  public static verifyToken(token: string): AuthUser {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthUser;
    } catch (err) {
      logger.error({ err }, 'Security: Invalid token');
      throw new Error('Unauthorized: Invalid or expired token');
    }
  }

  /**
   * Password Hashing
   */
  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Event Integrity (Signing)
   */
  public static signPayload(payload: any): string {
    const data = JSON.stringify(payload);
    return crypto.createHmac('sha256', EVENT_SIGNING_SECRET).update(data).digest('hex');
  }

  public static verifyPayload(payload: any, signature: string): boolean {
    const expected = this.signPayload(payload);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  /**
   * PII Redaction
   */
  public static redactPII(data: any): any {
    if (!data) return data;
    const redacted = { ...data };
    const sensitiveKeys = ['email', 'phone', 'address', 'password', 'token', 'creditCard'];
    
    Object.keys(redacted).forEach(key => {
      if (sensitiveKeys.includes(key)) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = this.redactPII(redacted[key]);
      }
    });
    
    return redacted;
  }
}
