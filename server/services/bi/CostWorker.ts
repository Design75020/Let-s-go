
import { migrationManager } from '../infrastructure/EventMigration';
import { EventDomain } from '../infrastructure/EventStream';
import { costController } from './DecisionEngine';
import { logger } from '../infrastructure/Observability';
import { IdempotencyManager } from '../infrastructure/Hardening';

export class CostWorker {
  constructor() {
    this.start();
  }

  private async start() {
    logger.info('CostWorker: Initializing specialized budget consumer (Migration Mode)...');

    await migrationManager.consume(EventDomain.COST, 'cost_group', 'cost-worker-v15', async (event: any) => {
      const processed = await IdempotencyManager.isProcessed(event.id, 'cost-worker');
      if (processed) return;

      if (event.type === 'ai.usage.tracked') {
         costController.trackUsage(event.payload.cost, event.payload.module);
      }
    });
  }
}

export const costWorker = new CostWorker();
