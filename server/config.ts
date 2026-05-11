import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 3000,
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/letsgofood',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key_123',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  ENV: process.env.NODE_ENV || 'development',
};

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  
  try {
    // Disable command buffering globally so queries fail fast if DB is down
    mongoose.set('bufferCommands', false);
    
    await mongoose.connect(config.MONGO_URL, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    isConnected = true;
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    if (config.ENV === 'production') process.exit(1);
  }
};

