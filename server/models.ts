import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Should be hashed normally
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: Array,
  amount: Number,
  status: { type: String, enum: ['pending', 'paid', 'delivered'], default: 'pending' },
  stripeSessionId: String,
  createdAt: { type: Date, default: Date.now },
});

export const Order = mongoose.model('Order', orderSchema);

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  zone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Agent = mongoose.model('Agent', agentSchema);

const leadSchema = new mongoose.Schema({
  type: { type: String, enum: ['pro', 'rider'], required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  zone: String,
  ref: String, // agent ref
  src: String, // flyer, qr, etc
  createdAt: { type: Date, default: Date.now },
});

export const Lead = mongoose.model('Lead', leadSchema);

const eventSchema = new mongoose.Schema({
  type: { type: String, enum: ['visit', 'click', 'lead', 'order'], required: true },
  ref: String,
  src: String,
  zone: String,
  createdAt: { type: Date, default: Date.now },
});

export const Event = mongoose.model('Event', eventSchema);
