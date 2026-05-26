
import { economyEngine } from './EconomyEngine';
import { anomalyDetector, selfHealer } from './AnomalyDetector';
import { decisionEngine, costController } from './DecisionEngine';
import { batchProcessor } from './BatchProcessor';
import { eventBus, BIEvents } from './EventBus';
import { v16Engine } from './V16Engine';
import { economyWorker } from './EconomyWorker';
import { anomalyWorker } from './AnomalyWorker';
import { costWorker } from './CostWorker';
import { logger } from '../infrastructure/Observability';

export function initializeAutonomousSystem() {
  logger.info('🤖 Initializing V15/V16 Hardened Production Platform...');
  
  // They are already initialized as singletons, but we call them to ensure execution
  [
    economyEngine, anomalyDetector, selfHealer, 
    decisionEngine, costController, batchProcessor, 
    v16Engine, economyWorker, anomalyWorker, costWorker
  ];
  
  logger.info('✅ Hardened Autonomous System Online.');
}

export {
  economyEngine,
  anomalyDetector,
  selfHealer,
  decisionEngine,
  costController,
  batchProcessor,
  eventBus,
  BIEvents,
  v16Engine
};
