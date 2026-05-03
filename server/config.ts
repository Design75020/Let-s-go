import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/letsgofood',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key_123',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  ENV: process.env.NODE_ENV || 'development',
};

export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URL);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    // In production, we might want to exit
    if (config.ENV === 'production') process.exit(1);
  }
};
