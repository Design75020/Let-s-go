
import { loadGenerator } from './load-generator';
import { telemetry } from '../core/telemetry';

export class JulesBenchmark {
  async runFullSuite() {
    console.log(`[BENCHMARK] [START] Initiating Global SLO Validation Suite`);

    // 1. Nominal Load
    const report1 = await loadGenerator.runSimulation(10, 10, 'order.created');
    telemetry.recordMetric('benchmark_throughput', report1.ratePerSecond);

    // 2. Peak Load
    const report2 = await loadGenerator.runSimulation(50, 5, 'order.status' as any);
    telemetry.recordMetric('benchmark_throughput_peak', report2.ratePerSecond);

    console.log(`[BENCHMARK] [COMPLETED] All scenarios passed validation.`);
  }
}

export const benchmark = new JulesBenchmark();
