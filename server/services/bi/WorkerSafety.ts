
import { logger } from '../infrastructure/Observability';

const ALLOWED_ACTIONS = [
  'economy.surge.update',
  'anomaly.threshold.adjust',
  'cost.budget.throttle',
  'order.process.completed',
  'system.health.recalculate'
];

export class WorkerSafety {
  public static isActionAllowed(type: string): boolean {
    if (ALLOWED_ACTIONS.includes(type)) {
      return true;
    }
    
    logger.fatal({ actionType: type }, 'WorkerSafety: UNEXPECTED ACTION ATTEMPTED! Blocking execution.');
    return false;
  }

  public static async executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('WorkerSafety: Action execution TIMEOUT')), timeoutMs);
    });
    
    return Promise.race([promise, timeout]);
  }
}
