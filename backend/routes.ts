
import { Router, Request, Response, NextFunction } from 'express';
import { getAI } from './ai';
import { AuthService } from './services/auth.service';
import { OrderService } from './services/order.service';
import { DispatchService } from './services/dispatch.service';
import { MerchantService } from './services/merchant.service';

const router = Router();

// Middleware to verify JWT
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = AuthService.verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// AUTH
router.post('/api/auth/login', async (req, res) => {
  const { idToken, role } = req.body;

  if (!idToken) return res.status(400).json({ error: 'Missing idToken' });

  try {
    const result = await AuthService.authenticateFirebaseUser(idToken);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: 'Authentication failed: ' + err.message });
  }
});

// ORDERS
router.post('/api/orders', authenticate, async (req, res) => {
  try {
    const result = await OrderService.placeOrder(req.body);
    res.status(201).json({ id: result.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/api/merchant/menu', authenticate, async (req, res) => {
  try {
    const { user } = req as any;
    if (user.role !== 'merchant') return res.status(403).json({ error: 'Unauthorized' });
    const id = await MerchantService.addMenuItem(user.uid, req.body);
    res.status(201).json({ id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/api/merchant/menu/:id', authenticate, async (req, res) => {
  try {
    const { user } = req as any;
    if (user.role !== 'merchant') return res.status(403).json({ error: 'Unauthorized' });
    await MerchantService.updateMenuItem(user.uid, req.params.id, req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/api/merchant/menu/:id', authenticate, async (req, res) => {
  try {
    const { user } = req as any;
    if (user.role !== 'merchant') return res.status(403).json({ error: 'Unauthorized' });
    await MerchantService.deleteMenuItem(user.uid, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// CLIENT EXTRAS
router.post('/api/orders/:id/tip', authenticate, async (req, res) => {
  try {
    await OrderService.addTip(req.params.id, req.body.amount);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/api/orders/:id/status', authenticate, async (req, res) => {
  try {
    const { user } = req as any;
    await OrderService.updateStatus(req.params.id, req.body.status, user.uid, user.role);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DISPATCH
router.patch('/api/drivers/location', authenticate, async (req, res) => {
  try {
    const { user } = req as any;
    if (user.role !== 'driver') return res.status(403).json({ error: 'Unauthorized' });

    const { orderId, location } = req.body;
    await DispatchService.updateLocation(user.uid, orderId, location);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/api/orders/:id/accept', authenticate, async (req, res) => {
  try {
    const { user } = req as any;
    if (user.role !== 'driver') return res.status(403).json({ error: 'Unauthorized' });

    await DispatchService.assignDriver(req.params.id, user.uid, req.body.driverName);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// MERCHANT API (Protected)
router.patch('/api/merchant/restaurant/status', authenticate, async (req, res) => {
  try {
    const { user } = req as any;
    if (user.role !== 'merchant') return res.status(403).json({ error: 'Unauthorized' });

    await MerchantService.updateRestaurantStatus(user.uid, req.body.status);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// AI HELPERS (The "AI-Powered" part of the platform - Protected)
router.post('/api/ai/optimize-menu', authenticate, async (req, res) => {
  const ai = getAI();
  if (!ai) return res.status(503).json({ error: 'AI not configured' });

  try {
    const result = await ai.models.generateContent(
      'Analyse ces produits et suggère des prix psychologiques : ' + JSON.stringify(req.body.items)
    );
    res.json({ advice: result.text });
  } catch (error) {
    (req as any).log.error(error);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

export default router;
