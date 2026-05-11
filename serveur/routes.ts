import express from 'express';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { User, Order, Agent, Lead, Event, Restaurant, Dish, AuditLog } from './models';
import { SocketManager } from './socket';
import { getAI } from './ai';
import { rateLimiter } from './services/gateway';
import { Cache } from './services/cache';
import { Queue } from './services/queue';
import { Replay } from './services/replay';
import { Discovery } from './services/discovery';
import { K8s } from './services/orchestrator';
import { Geo } from './services/region';
import { Telemetry } from './services/telemetry';
import { Chaos } from './services/chaos';

const router = express.Router();
const stripe = new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' as any });

// --- Correlation & Observability Middleware ---
const correlationMiddleware = (req: any, res: any, next: any) => {
  req.correlationId = req.headers['x-correlation-id'] || `lgf-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
};

router.use(correlationMiddleware);
// Apply Global Rate Limiting (API Gateway Logic)
router.use(rateLimiter);

// --- RBAC Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (roles: string[]) => (req: any, res: any, next: any) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Restricted access' });
  }
  next();
};

// --- Lifecycle Event & Audit Helper (Event Store) ---
const emitEvent = async (type: string, data: any, userId?: string, correlationId?: string) => {
  const eventPayload = { 
    type, 
    data, 
    correlationId: correlationId || `sys-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date() 
  };

  // Real-time broadcast (Message Bus)
  SocketManager.getInstance().broadcast(type, eventPayload);
  
  // Event Store (Persistence)
  try {
    await AuditLog.create({
      userId,
      action: type,
      details: {
        ...data,
        correlationId: eventPayload.correlationId
      },
      severity: type.includes('ERROR') || type.includes('CANCELLED') ? 'warning' : 'info'
    });
  } catch (err) {
    console.error('CRITICAL: Event Store Sync Failure', err);
  }
};

// --- Order Lifecycle (Normalized) ---

router.post('/orders', authenticate, async (req, res) => {
  try {
    const order = await Order.create({ ...req.body, userId: (req as any).user.userId });
    await emitEvent('ORDER_CREATED', order, (req as any).user.userId, (req as any).correlationId);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/orders/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status, updatedAt: new Date() }, 
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Broadcast & Audit specialized events
    const eventType = `ORDER_${status.toUpperCase()}`;
    await emitEvent(eventType, order, (req as any).user.userId, (req as any).correlationId);
    
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/orders/:id', authenticate, authorize(['admin', 'crm']), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: new Date() }, 
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await emitEvent('ORDER_UPDATED', order, (req as any).user.userId, (req as any).correlationId);
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Events & Leads ---
router.post('/events', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/leads', async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    // Track lead event automatically
    await Event.create({
      type: 'lead',
      ref: req.body.ref,
      src: req.body.src,
      zone: req.body.zone
    });
    SocketManager.getInstance().broadcast('NEW_LEAD', lead);
    res.status(201).json(lead);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/agents', async (req, res) => {
  const agents = await Agent.find();
  res.json(agents);
});

// --- Auth ---
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && password !== 'admin123') { // Fallback for demo
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role }, 
      config.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/auth/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById((req as any).user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ email: user.email, role: user.role });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper for initial admin creation
router.post('/auth/setup', async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) return res.status(400).json({ error: 'Setup already done' });

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@letsgofood.fr',
      password: hashedPassword,
      role: 'admin'
    });

    res.json({ message: 'Admin account created. Login with: admin@letsgofood.fr / admin123' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/stats', authenticate, authorize(['admin', 'crm']), async (req, res) => {
  try {
    const [totalOrders, totalLeads, agents] = await Promise.all([
      Order.countDocuments(),
      Lead.countDocuments(),
      Order.aggregate([{ $group: { _id: '$agentId', orders: { $sum: 1 } } }])
    ]);
    
    // Recent activity
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    
    res.json({
      kpis: {
        totalOrders,
        totalLeads,
        conversion: totalLeads > 0 ? Math.round((totalOrders / totalLeads) * 100) : 0
      },
      recent: {
        orders: recentOrders
      },
      analytics: {
        agents
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Core Business Discovery (Cached) ---
router.get('/restaurants', async (req, res) => {
  try {
    const cached = Cache.get('list_restaurants');
    if (cached) return res.json(cached);

    if (mongoose.connection.readyState !== 1) {
      if (config.ENV !== 'production') {
        console.warn('⚠️ DB not connected, returning mock data for development');
        return res.json([
          {
            _id: 'mock-1',
            name: "Le Gourmet Français (DÉMO)",
            description: "Authentic French experience.",
            image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
            category: "French",
            rating: 4.8,
            deliveryTime: "25-30 min",
            deliveryFee: 2.50
          },
          {
            _id: 'mock-2',
            name: "Sushi Master (DÉMO)",
            description: "Fresh and premium sushi.",
            image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800",
            category: "Japanese",
            rating: 4.9,
            deliveryTime: "20-35 min",
            deliveryFee: 1.00
          }
        ]);
      }
      throw new Error('Database disconnected');
    }

    const restaurants = await Restaurant.find();
    Cache.set('list_restaurants', restaurants, 30000);
    res.json(restaurants);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/restaurants/:id/dishes', async (req, res) => {
  try {
    const cacheKey = `dishes_${req.params.id}`;
    const cached = Cache.get(cacheKey);
    if (cached) return res.json(cached);

    if (mongoose.connection.readyState !== 1) {
      if (config.ENV !== 'production') {
        return res.json([
          { _id: 'd1', name: "Plat du jour (DÉMO)", description: "Une délicieuse surprise du chef.", price: 15.50, category: "Mains", available: true },
          { _id: 'd2', name: "Entrée Maison (DÉMO)", description: "Frais et léger.", price: 8.00, category: "Starters", available: true }
        ]);
      }
      throw new Error('Database disconnected');
    }

    const dishes = await Dish.find({ restaurantId: req.params.id });
    Cache.set(cacheKey, dishes, 60000);
    res.json(dishes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Role-Based Operations ---

// MERCHANT: Get restaurant orders
router.get('/merchant/orders', authenticate, authorize(['merchant', 'admin']), async (req, res) => {
  try {
    // In production, merchantId would be in token. Here we simulate for individual restaurants.
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DRIVER: Available deliveries
router.get('/driver/available', authenticate, authorize(['driver', 'admin']), async (req, res) => {
  try {
    const orders = await Order.find({ status: 'ready' });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Seed data for demo
router.post('/seed', async (req, res) => {
  try {
    await Restaurant.deleteMany({});
    await Dish.deleteMany({});
    Cache.invalidatePattern('restaurants');
    Cache.invalidatePattern('dishes');

    const r1 = await Restaurant.create({
      name: "Le Gourmet Français",
      description: "Traditional French cuisine with a modern twist.",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
      category: "French",
      rating: 4.8,
      deliveryTime: "25-35 min",
      deliveryFee: 2.99,
      featured: true
    });

    const r2 = await Restaurant.create({
      name: "Sushi Master",
      description: "Authentic sushi and Japanese delicacies.",
      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800",
      category: "Japanese",
      rating: 4.9,
      deliveryTime: "20-30 min",
      deliveryFee: 1.50
    });

    await Dish.create([
      { restaurantId: r1._id, name: "Escargots de Bourgogne", description: "Snails in garlic butter", price: 12.50, category: "Starters" },
      { restaurantId: r1._id, name: "Boeuf Bourguignon", description: "Slow-cooked beef in red wine", price: 24.00, category: "Mains" },
      { restaurantId: r2._id, name: "Salmon Nigiri", description: "Fresh Atlantic salmon over rice", price: 6.50, category: "Sushi" },
      { restaurantId: r2._id, name: "Miso Ramen", description: "Hearty broth with noodles and pork", price: 14.00, category: "Hot Dishes" }
    ]);

    res.json({ message: "Seeded successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Payments ---
router.post('/payments/create-session', async (req, res) => {
  try {
    const { amount } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Commande LetsGoFood' },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${config.APP_URL}/success`,
      cancel_url: `${config.APP_URL}/cancel`,
    });
    res.json({ id: session.id, url: session.url });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Webhook ---
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, config.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('💰 Payment successful:', session.id);
    
    // Offload heavy processing to Async Queue
    await Queue.push('PROCESS_PAYMENT_RECEIPT', { sessionId: session.id });
    
    SocketManager.getInstance().broadcast('PAYMENT_SUCCESS', { sessionId: session.id });
  }

  res.json({ received: true });
});

// --- AI (Backend Only) ---
router.post('/ai/chat', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const ai = getAI();
    if (!ai) return res.status(503).json({ error: 'AI Service Offline' });

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "Tu es l'assistant intelligent de LetsGoFood. Aide l'utilisateur avec précision. " + (context || "")
      }
    });
    res.json({ response: result.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Health & Observability (SRE Section) ---
router.get('/admin/metrics', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const [auditCount, errorCount, systemLogs] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ severity: 'error' }),
      AuditLog.find().sort({ timestamp: -1 }).limit(20)
    ]);
    res.json({
      metrics: {
        totalEvents: auditCount,
        criticalAlarms: errorCount,
        healthScore: errorCount === 0 ? 100 : Math.max(0, 100 - (errorCount * 5))
      },
      registry: Discovery.getRegistry(),
      infra: {
        cluster: K8s.getClusterStatus(),
        regions: Geo.getRegions(),
        telemetryCount: Telemetry.getAllSpans().length
      },
      trace: systemLogs
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/chaos/start', authenticate, authorize(['admin']), (req, res) => {
  Chaos.startChaosExperiment();
  res.json({ message: 'Chaos experiment started' });
});

router.post('/admin/chaos/stop', authenticate, authorize(['admin']), (req, res) => {
  Chaos.stopChaos();
  res.json({ message: 'Chaos experiment stopped' });
});

router.post('/admin/replay', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { correlationId, days } = req.body;
    if (correlationId) {
      const logs = await Replay.replayCorrelation(correlationId);
      return res.json({ correlationId, logs });
    }
    
    const count = await Replay.replayRange(
      new Date(Date.now() - (days || 1) * 24 * 60 * 60 * 1000), 
      new Date()
    );
    res.json({ status: 'replay_triggered', eventsProcessed: count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'error';
  res.json({
    status: 'ok',
    db: dbStatus,
    ai: !!config.GEMINI_API_KEY,
    version: '2.4.0',
    timestamp: new Date()
  });
});

export default router;
