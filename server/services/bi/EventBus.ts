
import { EventEmitter } from 'events';
import { logger } from '../infrastructure/Observability';

class GlobalEventBus extends EventEmitter {
  private static instance: GlobalEventBus;

  private constructor() {
    super();
    this.setMaxListeners(50);
  }

  public static getInstance(): GlobalEventBus {
    if (!GlobalEventBus.instance) {
      GlobalEventBus.instance = new GlobalEventBus();
    }
    return GlobalEventBus.instance;
  }

  emit(event: string | symbol, ...args: any[]): boolean {
    logger.info(`[EVENT] ${String(event)}`, args[0]?.type || '');
    return super.emit(event, ...args);
  }
}

export const eventBus = GlobalEventBus.getInstance();

export enum BIEvents {
  ORDER_CREATED = 'order.created',
  ANOMALY_DETECTED = 'anomaly.detected',
  PRICE_ADJUSTED = 'price.adjusted',
  SYSTEM_HEALED = 'system.healed',
  AI_THROTTLED = 'ai.throttled',
  ECONOMY_SNAPSHOT = 'economy.snapshot',
  METRICS_TICK = 'metrics.tick'
}
