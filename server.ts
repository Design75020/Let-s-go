
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pino from 'pino-http';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import apiRoutes from './backend/routes';
import { AuthService } from './backend/services/auth.service';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  genReqId: (req) => req.headers['x-request-id'] || uuidv4(),
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { error: 'Too many login attempts, please try again later' }
});

const orderLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 order attempts per minute
  message: { error: 'Order creation rate exceeded' }
});

async function start() {
  const app = express();
  const httpServer = createServer(app);
  
  // Security Hardening
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com"],
        connectSrc: ["'self'", "https://*.firebaseio.com", "https://*.googleapis.com", "wss://*.letsgofood.fr"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.googleusercontent.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }));

  app.use(compression());
  app.use(logger);

  const io = new Server(httpServer, {
    cors: { 
      origin: process.env.NODE_ENV === 'production' 
        ? [
            "https://app.letsgofood.fr",
            "https://merchant.letsgofood.fr",
            "https://driver.letsgofood.fr",
            "https://admin.letsgofood.fr"
          ]
        : "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket Auth Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const user = AuthService.verifyToken(token);
      (socket as any).user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [
          "https://app.letsgofood.fr",
          "https://merchant.letsgofood.fr",
          "https://driver.letsgofood.fr",
          "https://admin.letsgofood.fr",
          "https://letsgofood.fr"
        ]
      : "*",
  }));
  
  app.use(express.json());

  // Rate Limiting
  app.use('/api/auth/login', authLimiter);
  app.use('/api/orders', orderLimiter);

  // Health Check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      version: '2.5.4-STABLE',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Socket logic
  io.on('connection', (socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user.uid} (${user.role})`);

    // Role-based channel isolation
    if (user.role === 'driver') socket.join('dispatch-stream');
    if (user.role === 'merchant') socket.join(`merchant-${user.uid}`);

    socket.on('join-order', (orderId) => {
      // Basic isolation check could go here if needed
      socket.join(`order-${orderId}`);
    });
  });

  // API Routes
  app.use(apiRoutes);

  // Vite / Static
  if (process.env.NODE_ENV !== 'production') {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error("Vite server initialization error:", e);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    (req as any).log.error(err);
    res.status(500).json({ 
      error: 'Internal Server Error',
      requestId: req.id,
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 LetsGoFood Platform Hardened & Running on port ${PORT}`);
  });
}

start().catch(err => {
  console.error("Critical server startup failure:", err);
  process.exit(1);
});
