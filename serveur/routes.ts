
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getAI } from './ai';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'lgf-paris-prod-key';

// AUTH ENDPOINT
router.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  
  // Real-world: Check against DB. For now, simulation.
  const token = jwt.sign({ email, role: 'client', tenantId: 'paris-01' }, SECRET, { expiresIn: '24h' });
  res.json({ token, user: { email, role: 'client', tenantId: 'paris-01' } });
});

// ORDERS ENDPOINT
router.post('/api/orders', async (req, res) => {
  const { items, total, restaurantId, tenantId } = req.body;
  if (!items || !total || !restaurantId) return res.status(400).json({ error: 'Données de commande incomplètes' });

  // Logic to save to Firestore/DB
  console.log(`[ORDER] New order created for tenant ${tenantId || 'paris-default'}`);
  res.status(201).json({ status: 'pending', id: 'ord_' + Date.now() });
});

router.get('/api/orders/:id', (req, res) => {
  res.json({ id: req.params.id, status: 'preparing', items: [] });
});

// RESTAURANTS ENDPOINT
router.get('/api/restaurants', (req, res) => {
  // Filtered by Paris region in production
  res.json([
    { id: 'r1', name: 'Le Gourmet Paris', category: 'Français', region: 'Paris' },
    { id: 'r2', name: 'LGF Burger IDF', category: 'Burgers', region: 'IDF' }
  ]);
});

// DRIVERS ENDPOINT
router.get('/api/drivers/available', (req, res) => {
  res.json([{ id: 'd1', name: 'Jean Expert', status: 'online' }]);
});

// JULES LIGHT (AI Powered orchestration)
router.post('/api/jules/plan', async (req, res) => {
  const { event } = req.body;
  const ai = getAI();
  if (!ai) return res.status(503).json({ error: 'AI Orchestrator offline' });

  const result = await ai.models.generateContent(
    `Act as JULES Light. Event: ${event}. Provide a single JSON action from: ["ASSIGN_DRIVER", "NOTIFY_USER", "REJECT_ORDER"].`
  );

  // Policy Guard (whitelist)
  const allowed = ["ASSIGN_DRIVER", "NOTIFY_USER", "REJECT_ORDER"];
  const action = allowed.find(a => result.text.includes(a)) || "NOTIFY_USER";

  res.json({ action, timestamp: new Date().toISOString() });
});

export default router;
