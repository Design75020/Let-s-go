
import { logger } from '../infrastructure/Observability';
import { economyEngine } from './EconomyEngine';
import { prisma } from '../../lib/prisma';

export interface BusinessMetrics {
  gmv: number;
  orders: number;
  conversionRate: number;
  cancellations: number;
}

export class BusinessMonitor {
  private static cachedMetrics: BusinessMetrics = {
    gmv: 0,
    orders: 0,
    conversionRate: 0,
    cancellations: 0
  };

  public static trackOrder(total: number) {
    // We no longer strictly need this for SSoT if we query DB,
    // but we can increment local cache for ultra-low latency before next sync
    this.cachedMetrics.orders++;
    this.cachedMetrics.gmv += total;
    logger.debug({ total, gmv: this.cachedMetrics.gmv }, 'BusinessMonitor: Order tracked (Cache updated)');
  }

  public static async syncFromDB() {
    try {
      const gmvResult = await prisma.order.aggregate({
        _sum: { total: true },
        _count: { id: true },
        where: { status: { not: 'CANCELLED' } }
      });

      const totalOrders = gmvResult._count.id;
      const totalGmv = gmvResult._sum.total || 0;

      const cancelledCount = await prisma.order.count({
        where: { status: 'CANCELLED' }
      });

      this.cachedMetrics = {
        gmv: totalGmv,
        orders: totalOrders,
        conversionRate: totalOrders > 0 ? (totalOrders / (totalOrders + 50)) : 0.65, // 50 is a mock "bounce" constant
        cancellations: cancelledCount
      };
      
      logger.info(this.cachedMetrics, 'BusinessMonitor: Successfully synced metrics from Prisma');
    } catch (err) {
      logger.error(err, 'BusinessMonitor: Failed to sync metrics from DB');
    }
  }

  public static getMetrics(): BusinessMetrics {
    return { ...this.cachedMetrics };
  }

  public static getMarketMetrics() {
    const snapshot = economyEngine.getSnapshot();
    return {
      demand: snapshot.pendingOrders,
      supply: snapshot.activeDrivers,
      avgDeliveryTime: snapshot.avgDeliveryTime
    };
  }
}
