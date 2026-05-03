import express from 'express';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from './config';
import { User, Order, Agent, Lead, Event } from './models';
import { SocketManager } from './socket';

const router = express.Router();
const stripe = new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27' as any });

// --- CRM & Tracking Endpoints ---

router.post('/events', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/leads', async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    // Track lead event automatically
    await Event.create({
      type: 'lead',
      ref: req.body.ref,
      src: req.body.src,
      zone: req.body.zone
    });
    SocketManager.getInstance().broadcast('NEW_LEAD', lead);
    res.status(201).json(lead);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));

    const [
      totalOrders,
      ordersToday,
      totalLeads,
      leadsToday,
      totalVisits,
      recentOrders,
      recentLeads,
      agentPerformance,
      zonePerformance
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: todayStart } }),
      Event.countDocuments({ type: 'visit' }),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Lead.find().sort({ createdAt: -1 }).limit(5),
      Event.aggregate([
        { $match: { ref: { $ne: null } } },
        { $group: { _id: "$ref", tasks: { $sum: 1 }, orders: { $sum: { $cond: [{ $eq: ["$type", "order"] }, 1, 0] } } } },
        { $sort: { orders: -1 } }
      ]),
      Event.aggregate([
        { $group: { _id: "$zone", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const conversion = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : 0;

    res.json({
      kpis: {
        totalOrders,
        ordersToday,
        totalLeads,
        leadsToday,
        conversion: conversion.toFixed(2)
      },
      recent: {
        orders: recentOrders,
        leads: recentLeads
      },
      analytics: {
        agents: agentPerformance,
        zones: zonePerformance
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/agents', async (req, res) => {
  const agents = await Agent.find();
  res.json(agents);
});

// --- Auth ---
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // Simplified for demo
  const token = jwt.sign({ email }, config.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// --- Payments ---
router.post('/payments/create-session', async (req, res) => {
  try {
    const { amount } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Commande LetsGoFood' },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${config.APP_URL}/success`,
      cancel_url: `${config.APP_URL}/cancel`,
    });
    res.json({ id: session.id, url: session.url });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Webhook ---
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, config.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('💰 Payment successful:', session.id);
    SocketManager.getInstance().broadcast('PAYMENT_SUCCESS', { sessionId: session.id });
  }

  res.json({ received: true });
});

// --- Health ---
router.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'error';
  res.json({
    status: 'ok',
    db: dbStatus,
    version: '2.4.0',
    timestamp: new Date()
  });
});

export default router;
