import { eventStream, EventDomain, AppEvent } from './EventStream';
import { adminDb } from '../../firebaseAdmin';
import { prisma } from '../../lib/prisma';
import { logger } from './Observability';

export class ProjectionWorker {
  constructor() {
    this.start();
  }

  public async start() {
    logger.info('ProjectionWorker: Starting Marketplace -> Firestore Projection');
    
    // Subscribe to all marketplace events with a dedicated group
    eventStream.consume(EventDomain.MARKETPLACE, 'projection_group', 'projection_worker_1', async (event: AppEvent) => {
      const { orderId, items } = event.payload;
      if (!orderId) return;

      await this.syncOrder(orderId, items);
    });
  }

  /**
   * Canonically sync a single order from PostgreSQL to Firestore
   */
  public async syncOrder(orderId: string, items?: any[]) {
    try {
      // 1. Fetch Authoritative State from SQL
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { 
          user: true, 
          restaurant: true, 
          driver: true,
          ledgerEntries: true 
        }
      });

      if (!order) {
        logger.warn({ orderId }, 'ProjectionWorker: Order not found in SQL, skipping sync');
        return;
      }

      // 2. Project to Firestore (Read-Only Cache for Clients)
      const firestoreRef = adminDb.collection('orders').doc(orderId);
      
      const payload: any = {
        id: order.id,
        clientId: order.userId,
        clientName: order.user.name,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurant.name,
        driverId: order.driverId,
        driverName: order.driver?.name || null,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: new Date().toISOString(),
        // We include a version or timestamp to help clients with reconciliation
        _canonicalVersion: order.updatedAt.getTime()
      };

      if (items) {
        payload.items = items;
      }
      
      await firestoreRef.set(payload, { merge: true });

      logger.debug({ orderId, status: order.status }, 'ProjectionWorker: Successfully synced to Firestore');
    } catch (err) {
      logger.error(err, 'ProjectionWorker: Failed to sync order');
      throw err; // Trigger retry in EventStream
    }
  }
}

export const projectionWorker = new ProjectionWorker();
