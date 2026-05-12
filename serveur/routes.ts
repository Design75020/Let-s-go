
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getAI } from './ai';
import { Cache } from './services/cache';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'lgf-v2-master-key';

// AUTH
router.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Simulation - In production this would check MongoDB/Firestore
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

// MERCHANT API
router.get('/api/merchant/menu', (req, res) => {
  res.json([
    { id: 1, name: 'Burger Signature', price: 15.90, category: 'Burgers' },
    { id: 2, name: 'Frites Maison', price: 4.50, category: 'Accompagnements' }
  ]);
});

// AI HELPERS (The "AI-Powered" part of the platform)
router.post('/api/ai/optimize-menu', async (req, res) => {
  const ai = getAI();
  if (!ai) return res.status(503).json({ error: 'AI not configured' });

  const result = await ai.models.generateContent(
    'Analyse ces produits et suggère des prix psychologiques : ' + JSON.stringify(req.body.items)
  );
  res.json({ advice: result.text });
});

export default router;
