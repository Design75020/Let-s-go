/**
 * LetsGoFood API Gateway Layer
 * Handles Rate Limiting, Security Enforcement, and Traffic Control.
 */

interface RateLimit {
  count: number;
  reset: number;
}

const rateStore = new Map<string, RateLimit>();

export const rateLimiter = (req: any, res: any, next: any) => {
  const ip = req.ip;
  const userId = req.user?.userId || 'anonymous';
  const role = req.user?.role || 'public';
  const key = `${ip}:${userId}`;

  const limitConfig: Record<string, number> = {
    'admin': 1000,
    'crm': 500,
    'merchant': 300,
    'driver': 200,
    'user': 100,
    'public': 30
  };

  const now = Date.now();
  const isProd = process.env.NODE_ENV === 'production';
  const currentLimit = isProd ? (limitConfig[role] || 30) : 5000;
  const windowMs = 60000; // 1 minute

  let record = rateStore.get(key);

  if (!record || now > record.reset) {
    record = { count: 0, reset: now + windowMs };
  }

  record.count++;
  rateStore.set(key, record);

  res.setHeader('X-RateLimit-Limit', currentLimit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, currentLimit - record.count));

  if (record.count > currentLimit) {
    console.warn(`[GATEWAY] Rate limit exceeded for ${key} (${role})`);
    return res.status(429).json({ 
      error: 'Too many requests', 
      retryAfter: Math.ceil((record.reset - now) / 1000) 
    });
  }

  next();
};
