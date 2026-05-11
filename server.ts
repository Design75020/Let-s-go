import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { config } from './server/config';
import { createApp } from './server/app';
import { SocketManager } from './server/socket';

async function startServer() {
  const app = await createApp();
  const server = http.createServer(app);

  // Auto-setup admin & seed for demo
  const { User, Restaurant, Dish } = await import('./server/models');
  const bcrypt = await import('bcryptjs');
  
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@letsgofood.fr',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Default admin account created: admin@letsgofood.fr / admin123');
    }

    const restaurantCount = await Restaurant.countDocuments();
    if (restaurantCount === 0) {
      console.log('🌱 Seeding initial restaurant data...');
      const r1 = await Restaurant.create({
        name: "Le Gourmet Français",
        description: "Authentic French experience.",
        image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
        category: "French",
        rating: 4.8,
        deliveryTime: "25-30 min",
        deliveryFee: 2.50
      });
      await Dish.create({ restaurantId: r1._id, name: "Boeuf Bourguignon", price: 22.0, category: "Mains" });
      console.log('✅ Seeding complete');
    }
  } catch (err) {
    console.error('Seed/Setup warning:', err);
  }

  // Socket initialization
  SocketManager.getInstance().init(server);

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
