
import { Request, Response } from 'express';
import { orderService } from '../services/OrderService';
import { logger, httpRequestsTotal } from '../services/infrastructure/Observability';
import { OrderSchema } from '../schemas/OrderSchema';

export class OrderController {
  public async create(req: Request, res: Response) {
    try {
      // 1. Zod Validation (API Security Hardening)
      const validated = OrderSchema.parse(req.body);
      
      const order = await orderService.createOrder(validated);
      
      httpRequestsTotal.inc({ method: 'POST', path: '/orders', status: 201 });
      res.status(201).json(order);
    } catch (err: any) {
      if (err.name === 'ZodError') {
         logger.warn({ errors: err.errors }, 'OrderController: Validation failed');
         return res.status(422).json({ error: 'Validation failed', details: err.errors });
      }
      logger.error(err, 'OrderController: Create failed');
      res.status(400).json({ error: err.message });
    }
  }

  public async getOne(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const order = await orderService.getOrder(id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public async listRecent(req: Request, res: Response) {
    try {
      const orders = await orderService.getRecentOrders();
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public async accept(req: Request, res: Response) {
    try {
      const order = await orderService.acceptOrder(req.params.id);
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async setReady(req: Request, res: Response) {
    try {
      const order = await orderService.setReady(req.params.id);
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async claim(req: Request, res: Response) {
    try {
      const { driverId } = req.body;
      const order = await orderService.claimOrder(req.params.id, driverId);
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async complete(req: Request, res: Response) {
    try {
      const order = await orderService.completeDelivery(req.params.id);
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const orderController = new OrderController();
