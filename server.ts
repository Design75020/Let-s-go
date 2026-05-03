import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { config, connectDB } from './config';
import apiRoutes from './routes';
import { SocketManager } from './socket';

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Connect to DB
  await connectDB();

  // Socket initialization
  SocketManager.getInstance().init(server);

  // Middleware
  app.use(cors());
  
  // Note: Webhook needs raw body, we handle it inside the route or before general json parser
  app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhook/stripe') {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  // API Routes
  app.use('/api', apiRoutes);

  // Vite integration for development
  if (config.ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(config.PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${config.PORT}`);
  });
}

startServer();
