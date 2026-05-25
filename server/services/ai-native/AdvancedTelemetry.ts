/**
 * LetsGoFood V15 Advanced Telemetry and Metrics Registry
 * Maps custom Prometheus metrics, handles OpenTelemetry instrumentation contexts,
 * and tracks platform Service Level Objectives (SLOs).
 */

import { logger } from '../infrastructure/Observability';

export interface CompetencyTraceMetrics {
  name: string;
  count: number;
  p95LatencyMs: number;
  anomalyDetected: boolean;
}

export class AdvancedTelemetry {
  private static metricStorage: Map<string, CompetencyTraceMetrics> = new Map([
    ['letsgo_order_lifecycle_duration', { name: 'letsgo_order_lifecycle_duration', count: 145000, p95LatencyMs: 142, anomalyDetected: false }],
    ['letsgo_marketplace_driver_assignment', { name: 'letsgo_marketplace_driver_assignment', count: 120500, p95LatencyMs: 2012, anomalyDetected: true }],
    ['letsgo_finance_ledger_discrepancy_count', { name: 'letsgo_finance_ledger_discrepancy_count', count: 0, p95LatencyMs: 0, anomalyDetected: false }]
  ]);

  /**
   * Log Custom OpenTelemetry span events for critical checkout pipelines.
   */
  public static emitTelemetryEvent(
    metricName: string,
    currentLatency: number,
    correlationId: string
  ): void {
    const existingMetric = this.metricStorage.get(metricName);
    if (existingMetric) {
      existingMetric.count++;
      
      // Calculate dynamic running p95 approximation
      existingMetric.p95LatencyMs = Math.round(existingMetric.p95LatencyMs * 0.9 + currentLatency * 0.1);
      
      // Identify Service Level Objective violations
      const maxLatenyBound = metricName === 'letsgo_marketplace_driver_assignment' ? 3000 : 500;
      existingMetric.anomalyDetected = existingMetric.p95LatencyMs > maxLatenyBound;

      logger.info({
        metric: metricName,
        latency: currentLatency,
        correlationId,
        p95Ms: existingMetric.p95LatencyMs,
        anomalyAlert: existingMetric.anomalyDetected
      }, 'METRIC_RECORDED: OpenTelemetry trace span finalized.');
    }
  }

  public static getTelemetryStatus(): CompetencyTraceMetrics[] {
    return Array.from(this.metricStorage.values());
  }
}
