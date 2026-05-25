import { projectionWorker } from '../../server/services/infrastructure/ProjectionWorker';
import { logger } from '../../server/services/infrastructure/Observability';

async function startWorker() {
  logger.info('WORKER_START: Initializing Projection Worker Node...');
  // Only start the projection worker loop
  await projectionWorker.start();
}

startWorker().catch(err => {
  logger.error(err, 'WORKER_FATAL: Projection Worker crashed');
  process.exit(1);
});
