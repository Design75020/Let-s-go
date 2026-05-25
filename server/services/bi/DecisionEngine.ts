
import { eventBus, BIEvents } from './EventBus';
import { logger, HealthMonitor } from '../infrastructure/Observability';

export class CostController {
  private dailyLimit = 50.0;
  private currentSpending = 0.0;
  private throttlingMode: 'none' | 'soft' | 'aggressive' = 'none';

  public trackUsage(cost: number, moduleName: string) {
    this.currentSpending += cost;
    
    // Progressive Throttling
    if (this.currentSpending > this.dailyLimit * 0.95) {
       this.setThrottling('aggressive');
    } else if (this.currentSpending > this.dailyLimit * 0.75) {
       this.setThrottling('soft');
    }

    logger.debug({ module: moduleName, cost, total: this.currentSpending }, 'AI Usage Tracked');
  }

  private setThrottling(mode: 'soft' | 'aggressive') {
    if (this.throttlingMode !== mode) {
      this.throttlingMode = mode;
      eventBus.emit(BIEvents.AI_THROTTLED, { 
        spending: this.currentSpending, 
        limit: this.dailyLimit,
        mode 
      });
    }
  }

  public getStats() {
    return {
      spending: this.currentSpending,
      limit: this.dailyLimit,
      isThrottled: this.throttlingMode !== 'none',
      mode: this.throttlingMode
    };
  }
}

export const costController = new CostController();

export class DecisionEngine {
  private static isFrozen = false;

  public static setFreeze(frozen: boolean) {
    this.isFrozen = frozen;
    logger.info({ frozen }, 'DecisionEngine: Global decision freeze state updated');
  }

  constructor() {
    eventBus.on(BIEvents.ECONOMY_SNAPSHOT, (state) => this.evaluateEconomy(state));
    eventBus.on(BIEvents.AI_THROTTLED, (data) => this.safeguardSystem(data));
  }

  private async evaluateEconomy(state: any) {
    if (DecisionEngine.isFrozen) {
       logger.debug('DecisionEngine: Decision skipped - Engine is FROZEN for migration');
       return;
    }

    const start = Date.now();
    
    try {
      if (state.marketHeat > 0.9) {
        logger.info('[DECISION] High Market Heat! Executing autonomous pool expansion.');
        // Implementation logic...
      }
    } finally {
      HealthMonitor.reportMetric('avgLatency', Date.now() - start);
    }
  }

  private safeguardSystem(data: any) {
    logger.warn({ mode: data.mode }, '[DECISION] AI Circuit Breaker active. Transitioning to static heuristics.');
  }
}

export const decisionEngine = new DecisionEngine();
DecisionEngine.setFreeze(false);
