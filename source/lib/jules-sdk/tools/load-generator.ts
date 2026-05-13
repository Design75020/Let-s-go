
import { broker, BusinessEvent } from '../../events';

export interface LoadReport {
  totalPublished: number;
  ratePerSecond: number;
  durationSeconds: number;
  eventType: BusinessEvent;
}

export class JulesLoadGenerator {
  async runSimulation(ratePerSecond: number, durationSeconds: number, eventType: BusinessEvent): Promise<LoadReport> {
    console.log(`[LOAD-GEN] Starting industrial simulation: ${ratePerSecond} eps for ${durationSeconds}s (${eventType})`);

    const totalEvents = ratePerSecond * durationSeconds;
    const intervalMs = 1000 / ratePerSecond;

    for (let i = 0; i < totalEvents; i++) {
      broker.publish({
        type: eventType,
        actorId: `sim_user_${i}`,
        actorRole: 'simulation',
        resourceId: `res_${crypto.randomUUID().slice(0, 8)}`,
        data: { isSimulated: true, loadTier: 'high' }
      });

      if (i % ratePerSecond === 0) {
        console.log(`[LOAD-GEN] Progress: ${i}/${totalEvents} events published.`);
      }

      await new Promise(res => setTimeout(res, intervalMs));
    }

    console.log(`[LOAD-GEN] Simulation complete.`);
    return {
      totalPublished: totalEvents,
      ratePerSecond,
      durationSeconds,
      eventType
    };
  }
}

export const loadGenerator = new JulesLoadGenerator();
