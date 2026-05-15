
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pino from 'pino-http';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRoutes from './server/routes';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

async function start() {
  const app = express();
  const httpServer = createServer(app);
  
  // Security Hardening
  app.use(helmet({
    contentSecurityPolicy: false, // Vite needs some flexibility in dev; configure properly for prod if needed
  }));
  app.use(compression());
  app.use(logger);

  const io = new Server(httpServer, {
    cors: { 
      origin: process.env.NODE_ENV === 'production' 
        ? ["https://app.letsgofood.fr", "https://merchant.letsgofood.fr", "https://driver.letsgofood.fr"] 
        : "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [/letsgofood\.fr$/] 
      : "*",
  }));
  
  app.use(express.json());

  // Health Check
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Socket logic
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join-order', (orderId) => socket.join(`order-${orderId}`));
  });

  // API Routes
  app.use(apiRoutes);

  // Vite
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
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
    });
  });

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LetsGoFood Platform Hardened & Running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error("Critical server startup failure:", err);
  process.exit(1);
});
