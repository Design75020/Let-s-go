
import { migrationManager } from '../infrastructure/EventMigration';
import { EventDomain } from '../infrastructure/EventStream';
import { anomalyDetector } from './AnomalyDetector';
import { logger } from '../infrastructure/Observability';
import { IdempotencyManager } from '../infrastructure/Hardening';

export class AnomalyWorker {
  constructor() {
    this.start();
  }

  private async start() {
    logger.info('AnomalyWorker: Initializing specialized threshold consumer (Migration Mode)...');

    await migrationManager.consume(EventDomain.ANOMALY, 'anomaly_group', 'anomaly-worker-v15', async (event: any) => {
      const processed = await IdempotencyManager.isProcessed(event.id, 'anomaly-worker');
      if (processed) return;

      if (event.type === 'system.error') {
         anomalyDetector.trackError();
      }
    });
  }
}

export const anomalyWorker = new AnomalyWorker();
