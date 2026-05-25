
import cron from 'node-cron';
import { eventBus, BIEvents } from './EventBus';
import { economyEngine } from './EconomyEngine';
import { costController } from './DecisionEngine';

export class BatchProcessor {
  private history: any[] = [];

  constructor() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.processBatch();
    });

    // Also a frequent "Pulse" for real-time aggregation (every 15s)
    setInterval(() => this.emitPulse(), 15000);
  }

  private processBatch() {
    const snapshot = economyEngine.getSnapshot();
    const cost = costController.getStats();
    
    const aggregated = {
      timestamp: new Date(),
      economy: snapshot,
      ai: cost,
      type: 'BATCH_5M'
    };

    console.log('[BATCH] Processing 5-minute BI aggregation...');
    this.history.push(aggregated);
    if (this.history.length > 100) this.history.shift();

    eventBus.emit(BIEvents.METRICS_TICK, aggregated);
  }

  private emitPulse() {
    const snapshot = economyEngine.getSnapshot();
    eventBus.emit(BIEvents.METRICS_TICK, {
      timestamp: new Date(),
      economy: snapshot,
      type: 'PULSE_15S'
    });
  }

  public getHistory() {
    return this.history;
  }
}

export const batchProcessor = new BatchProcessor();
