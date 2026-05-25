
import { migrationManager } from '../infrastructure/EventMigration';
import { EventDomain } from '../infrastructure/EventStream';
import { economyEngine } from './EconomyEngine';
import { logger } from '../infrastructure/Observability';
import { IdempotencyManager } from '../infrastructure/Hardening';

export class EconomyWorker {
  constructor() {
    this.start();
  }

  private async start() {
    logger.info('EconomyWorker: Initializing specialized scaling consumer (Migration Mode)...');

    await migrationManager.consume(EventDomain.ECONOMY, 'economy_group', 'economy-worker-v15', async (event: any) => {
      const processed = await IdempotencyManager.isProcessed(event.id, 'economy-worker');
      if (processed) return;

      if (event.type === 'order.created') {
         // Process demand spikes
         logger.info({ orderId: event.payload.orderId }, 'EconomyWorker: Updating demand models');
      }
    });
  }
}

export const economyWorker = new EconomyWorker();
