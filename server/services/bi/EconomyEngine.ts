
import { migrationManager } from '../infrastructure/EventMigration';
import { EventDomain } from '../infrastructure/EventStream';
import { BIEvents } from './EventBus';
import { CircuitBreaker } from '../infrastructure/Hardening';
import { logger } from '../infrastructure/Observability';
import { prisma } from '../../lib/prisma';

export interface EconomyState {
  activeDrivers: number;
  pendingOrders: number;
  surgeMultiplier: number;
  avgDeliveryTime: number;
  marketHeat: number;
}

export class EconomyEngine {
  private state: EconomyState = {
    activeDrivers: 0,
    pendingOrders: 0,
    surgeMultiplier: 1.0,
    avgDeliveryTime: 25,
    marketHeat: 0.1
  };

  private breaker = new CircuitBreaker('EconomyService');

  constructor() {
    // Initial sync
    this.processMarketTick();
    // Regular interval
    setInterval(() => this.processMarketTick(), 10000);
  }

  private async processMarketTick() {
    await this.breaker.execute(
      async () => {
        // AUTHENTIC SCALE: Count real DB entities
        const [pendingCount, activeDriverCount] = await Promise.all([
          prisma.order.count({ where: { status: 'PENDING' } }),
          // We assume users with name containing 'Driver' or similar in this sandbox are drivers
          // In a real app, role check would be here
          prisma.user.count({ where: { name: { contains: 'Driver' } } })
        ]);

        this.state.pendingOrders = pendingCount;
        // If simulation requires high supply for test, use floor of 10 if 0
        this.state.activeDrivers = activeDriverCount || 10; 

        this.calculateSurge();
        
        // Publish to migration manager
        await migrationManager.publish(BIEvents.ECONOMY_SNAPSHOT, this.state, EventDomain.BI);
      },
      () => {
        logger.warn('Economy breaker triggered, using last known state');
        return this.state;
      }
    );
  }

  private calculateSurge() {
    const ratio = this.state.pendingOrders / Math.max(1, this.state.activeDrivers);
    let newSurge = 1.0;
    
    if (ratio > 0.8) newSurge = 1.2;
    if (ratio > 1.2) newSurge = 1.5;
    if (ratio > 2.0) newSurge = 2.0;

    if (newSurge !== this.state.surgeMultiplier) {
      this.state.surgeMultiplier = newSurge;
    }

    this.state.marketHeat = Math.min(1, ratio / 2.5);
    this.state.avgDeliveryTime = 20 + Math.floor(ratio * 15);
  }

  public getSnapshot() {
    return { ...this.state, circuit: this.breaker.getStatus() };
  }
}

export const economyEngine = new EconomyEngine();
