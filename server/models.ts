import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'merchant', 'driver', 'crm'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: Array,
  amount: Number,
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  stripeSessionId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,
  category: String,
  rating: { type: Number, default: 0 },
  deliveryTime: String,
  deliveryFee: Number,
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);

const dishSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  category: String,
  available: { type: Boolean, default: true },
});

export const Dish = mongoose.model('Dish', dishSchema);

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
  severity: { type: String, enum: ['info', 'warning', 'error'], default: 'info' }
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
