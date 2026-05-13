
import { broker, BusinessEvent } from '../../events';

export class JulesLoadGenerator {
  async runSimulation(ratePerSecond: number, durationSeconds: number, eventType: BusinessEvent) {
    console.log(`[LOAD-GEN] Starting simulation: ${ratePerSecond} eps for ${durationSeconds}s (${eventType})`);

    const totalEvents = ratePerSecond * durationSeconds;
    const intervalMs = 1000 / ratePerSecond;

    for (let i = 0; i < totalEvents; i++) {
      broker.publish({
        type: eventType,
        actorId: `sim_user_${i}`,
        actorRole: 'simulation',
        resourceId: `res_${crypto.randomUUID().slice(0, 8)}`,
        data: { isSimulated: true }
      });

      if (i % ratePerSecond === 0) {
        console.log(`[LOAD-GEN] Progress: ${i}/${totalEvents} events published.`);
      }

      await new Promise(res => setTimeout(res, intervalMs));
    }

    console.log(`[LOAD-GEN] Simulation complete.`);
  }
}

export const loadGenerator = new JulesLoadGenerator();
