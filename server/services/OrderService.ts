
import { eventStream, EventDomain } from './infrastructure/EventStream';
import { logger } from './infrastructure/Observability';
import { BusinessMonitor } from './bi/BusinessMonitor';
import { prisma } from '../lib/prisma';
import { IncidentResponse } from './infrastructure/IncidentResponse';

export class OrderService {
  /**
   * Create an order and emit side effects
   */
  public async createOrder(data: { userId: string, restaurantId: string, total: number, idempotencyKey?: string, clientName?: string, restaurantName?: string, items?: any[] }) {
    if (IncidentResponse.isSafeMode()) {
      throw new Error('System in Safe Mode: Order processing suspended');
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Idempotency Check
      if (data.idempotencyKey) {
        const existing = await tx.order.findUnique({ where: { idempotencyKey: data.idempotencyKey } });
        if (existing) return existing;
      }

      // Self-healing: Ensure user and restaurant exist in SQLite SSoT
      await tx.user.upsert({
        where: { id: data.userId },
        update: { name: data.clientName || 'Client' },
        create: {
          id: data.userId,
          email: data.userId.includes('@') ? data.userId : `${data.userId}@lgf.com`,
          name: data.clientName || 'Client',
          role: 'CUSTOMER'
        }
      });

      await tx.restaurant.upsert({
        where: { id: data.restaurantId },
        update: { name: data.restaurantName || 'Restaurant' },
        create: {
          id: data.restaurantId,
          name: data.restaurantName || 'Restaurant',
          location: 'Paris'
        }
      });

      // 2. Persistence (Canonical SSoT)
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          restaurantId: data.restaurantId,
          total: data.total,
          status: 'PENDING',
          idempotencyKey: data.idempotencyKey
        }
      });

      // 3. Financial Ledger (Initial Entry)
      await tx.ledgerEntry.create({
        data: {
          orderId: order.id,
          type: 'DEBIT',
          amount: data.total,
          purpose: 'PAYMENT',
          status: 'PENDING'
        }
      });

      logger.info({ orderId: order.id }, 'OrderService: Order persisted to Canonical SSoT');

      // 4. Emit High-Fidelity Event
      await eventStream.publish(EventDomain.MARKETPLACE, 'order.pending', {
        orderId: order.id,
        restaurantId: data.restaurantId,
        total: data.total,
        items: data.items
      });

      return order;
    });
  }

  /**
   * Merchant: Accept the order
   */
  public async acceptOrder(orderId: string) {
    const order = await prisma.order.update({
      where: { id: orderId, status: 'PENDING' },
      data: { status: 'ACCEPTED' }
    });

    await eventStream.publish(EventDomain.MARKETPLACE, 'order.accepted', { orderId });
    return order;
  }

  /**
   * Merchant: Food is ready for pickup
   */
  public async setReady(orderId: string) {
    const order = await prisma.order.update({
      where: { id: orderId, status: 'ACCEPTED' },
      data: { status: 'READY' }
    });

    await eventStream.publish(EventDomain.MARKETPLACE, 'order.ready', { orderId });
    return order;
  }

  /**
   * Driver: Atomic Claim (Assignment)
   * Eliminates race conditions via transactional "driverId IS NULL" check
   */
  public async claimOrder(orderId: string, driverId: string) {
    return await prisma.$transaction(async (tx) => {
      // Self-healing: Ensure driver user exists in SQLite SSoT
      await tx.user.upsert({
        where: { id: driverId },
        update: { role: 'DRIVER' },
        create: {
          id: driverId,
          email: driverId.includes('@') ? driverId : `${driverId}@letsgofood.fr`,
          name: driverId === 'driver_2' ? 'Sophie (Driver 2)' : 'Marco (Driver 1)',
          role: 'DRIVER'
        }
      });

      try {
        const updated = await tx.order.update({
          where: { 
            id: orderId,
            driverId: null,      // Strict conditional lock: Must currently have no driver assigned
            status: 'READY'      // Strict state progression gate: Must be in READY state
          },
          data: { 
            driverId,
            status: 'PICKED_UP'
          }
        });

        await eventStream.publish(EventDomain.MARKETPLACE, 'order.claimed', { orderId, driverId });
        return updated;
      } catch (err) {
        // Increment conflict metrics under concurrent storms
        try {
          const { marketplaceConflictsTotal } = await import('./infrastructure/Observability');
          marketplaceConflictsTotal.inc();
        } catch (mErr) {}
        
        throw new Error('Order not available for pickup or already claimed');
      }
    });
  }

  /**
   * Driver: Final delivery
   */
  public async completeDelivery(orderId: string) {
    const order = await prisma.order.update({
      where: { id: orderId, status: 'PICKED_UP' },
      data: { status: 'DELIVERED' }
    });

    // 5. Finalize Ledger
    await prisma.ledgerEntry.updateMany({
      where: { orderId, purpose: 'PAYMENT' },
      data: { status: 'COMPLETED' }
    });

    BusinessMonitor.trackOrder(order.total);
    await eventStream.publish(EventDomain.MARKETPLACE, 'order.delivered', { orderId });
    return order;
  }

  public async getOrder(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { ledgerEntries: true, user: true, restaurant: true, driver: true }
    });
  }

  public async getRecentOrders() {
    return prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: true, restaurant: true, driver: true }
    });
  }
}

export const orderService = new OrderService();
