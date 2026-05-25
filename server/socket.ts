
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { eventBus, BIEvents } from './services/bi/EventBus';
import { logger } from './services/infrastructure/Observability';
import { Security } from './services/infrastructure/Security';

export let io: Server;

export function setupSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { 
      origin: process.env.NODE_ENV === 'production' 
        ? [/letsgofood\.fr$/] 
        : "*",
      methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // 1. WebSocket Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Missing token'));
    }

    try {
      const user = Security.verifyToken(token);
      (socket as any).user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    logger.info({ socketId: socket.id, userId: user.id }, 'BI Console connected (Authenticated)');
    
    // 2. Per-socket Rate Limiting (Flood Protection)
    let msgCount = 0;
    const MAX_MSG_PER_SEC = 10;
    const throttleInterval = setInterval(() => msgCount = 0, 1000);

    socket.onAny(() => {
      msgCount++;
      if (msgCount > MAX_MSG_PER_SEC) {
        logger.warn({ socketId: socket.id, userId: user.id }, 'Security: WebSocket FLOOD detected. Dropping message.');
        socket.disconnect(true);
      }
    });

    socket.on('join-order', (orderId) => {
      // Basic input validation
      if (typeof orderId === 'string' && orderId.length < 100) {
        socket.join(`order-${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      clearInterval(throttleInterval);
      logger.info({ socketId: socket.id }, 'BI Console disconnected');
    });
  });

  // Batching BI Events to prevent dashboard flood
  let metricsBuffer: any[] = [];
  const BATCH_INTERVAL = 100; // 100ms batching

  setInterval(() => {
    if (metricsBuffer.length > 0) {
      io.emit('bi:metrics:batch', metricsBuffer);
      metricsBuffer = [];
    }
  }, BATCH_INTERVAL);

  // Relay BI Events
  eventBus.on(BIEvents.METRICS_TICK, (data) => {
    // data is aggregated { timestamp, economy, ai, type }
    metricsBuffer.push(data);
    io.emit('bi:metrics', data); // Real-time priority
  });

  eventBus.on(BIEvents.ANOMALY_DETECTED, (data) => io.emit('bi:anomaly', data));
  eventBus.on(BIEvents.SYSTEM_HEALED, (data) => io.emit('bi:recovery', data));
  eventBus.on(BIEvents.PRICE_ADJUSTED, (data) => io.emit('bi:economy', data));
  eventBus.on(BIEvents.AI_THROTTLED, (data) => io.emit('bi:alert', data));

  return io;
}
