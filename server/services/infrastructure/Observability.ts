
import client from 'prom-client';
import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';

// Context for Correlation IDs
export const contextStorage = new AsyncLocalStorage<{ correlationId: string }>();

// Initialize Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestsTotal = new client.Counter({
  name: 'letsgo_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status']
});

export const workerLagGauge = new client.Gauge({
  name: 'letsgo_worker_lag_seconds',
  help: 'Worker processing lag in seconds',
  labelNames: ['worker_type']
});

export const healthScoreGauge = new client.Gauge({
  name: 'letsgo_system_health_score',
  help: 'Unified system health score (0-100)'
});

export const marketplaceConflictsTotal = new client.Counter({
  name: 'letsgo_marketplace_driver_assignment_conflicts_total',
  help: 'Total number of atomic dispatch race condition attempts prevented'
});

export const financeDiscrepancyGauge = new client.Gauge({
  name: 'letsgo_finance_ledger_discrepancy_count',
  help: 'Current number of financial drift discrepancies detected'
});

// Production SRE requirements: Realtime metrics
export const httpRequestDurationSeconds = new client.Histogram({
  name: 'letsgo_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

export const activeOrdersGauge = new client.Gauge({
  name: 'letsgo_active_orders_count',
  help: 'Current active order dispatch queue load count'
});

export const dispatchLatencyGauge = new client.Gauge({
  name: 'letsgo_dispatch_latency_seconds',
  help: 'Average driver dispatch completion claim latency in seconds'
});

export const redisConsumerLagGauge = new client.Gauge({
  name: 'letsgo_redis_consumer_lag_count',
  help: 'Calculated number of buffered/pending events unprocessed in Redis event stream'
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(workerLagGauge);
register.registerMetric(healthScoreGauge);
register.registerMetric(marketplaceConflictsTotal);
register.registerMetric(financeDiscrepancyGauge);
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(activeOrdersGauge);
register.registerMetric(dispatchLatencyGauge);
register.registerMetric(redisConsumerLagGauge);

export const metrics = {
  register,
  getMetrics: () => register.metrics()
};

const nodeId = process.env.K_REVISION || `local-${Math.random().toString(36).substring(7)}`;

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { nodeId },
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
    log(object) {
      const context = contextStorage.getStore();
      if (context) {
        return { ...object, correlationId: context.correlationId };
      }
      return object;
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

export class HealthMonitor {
  private static metrics = {
    errorRate: 0,
    avgLatency: 0,
    workerLag: 0,
    breakersOpen: 0
  };

  public static reportMetric(key: keyof typeof HealthMonitor.metrics, value: number) {
    this.metrics[key] = value;
    this.recalculate();
  }

  private static currentScore = 100;

  private static recalculate() {
    // Formula: 100 - (errors * 2) - (latency/50) - (lag * 2) - (breakers * 25)
    let score = 100;
    score -= (this.metrics.errorRate * 2);
    score -= Math.min(20, this.metrics.avgLatency / 50);
    score -= Math.min(30, this.metrics.workerLag * 2);
    score -= (this.metrics.breakersOpen * 25);

    this.currentScore = Math.max(0, Math.min(100, score));
    healthScoreGauge.set(this.currentScore);
  }

  public static getScore(): number {
    return this.currentScore;
  }

  public static getMetrics() {
    return { ...this.metrics, uhs: this.currentScore };
  }
}
