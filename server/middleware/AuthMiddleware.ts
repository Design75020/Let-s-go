
import { Request, Response, NextFunction } from 'express';
import { Security, UserRole, AuthUser } from '../services/infrastructure/Security';
import { logger } from '../services/infrastructure/Observability';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const user = Security.verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const authorize = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn({ 
        userId: req.user.id, 
        role: req.user.role, 
        requiredRoles: roles 
      }, 'Security: Access DENIED (RBAC)');
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }

    next();
  };
};
