
import express from 'express';
import cors from 'cors';
import { config, connectDB } from './config';
import apiRoutes from './routes';

export async function createApp() {
  const app = express();

  // Connect to DB (cached by Mongoose if already connected)
  await connectDB();

  // Middleware
  app.use(cors());
  
  app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhook/stripe') {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  // API Routes
  app.use('/api', apiRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', domain: req.hostname });
  });

  return app;
}
