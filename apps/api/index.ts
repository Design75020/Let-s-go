import { start } from '../../server';
import { logger } from '../../server/services/infrastructure/Observability';

logger.info('API_START: Initializing LetsGoFood API Node...');
start().catch(err => {
    logger.fatal(err, 'API_FATAL: API Server failed to start');
    process.exit(1);
});
