
import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getAI } from './ai';
import { Cache } from './services/cache';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'lgf-v2-master-key';

// Middleware to verify JWT
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// AUTH
router.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Simulation - In production this would check MongoDB/Firestore via a service layer
  if (email && password) {
    const token = jwt.sign({ email, role: 'merchant' }, SECRET, { expiresIn: '24h' });
    return res.json({
      token,
      user: {
        id: 'u1',
        name: 'Restaurant La Gazelle',
        email,
        role: 'merchant'
      }
    });
  }
  res.status(401).json({ error: 'Identifiants invalides' });
});

// MERCHANT API (Protected)
router.get('/api/merchant/menu', authenticate, (req, res) => {
  res.json([
    { id: 1, name: 'Burger Signature', price: 15.90, category: 'Burgers' },
    { id: 2, name: 'Frites Maison', price: 4.50, category: 'Accompagnements' }
  ]);
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
    req.log.error(error);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

export default router;
