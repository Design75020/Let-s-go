
import { redis } from './RedisClient';
import { logger, HealthMonitor } from './Observability';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private requestLog: { timestamp: number; success: boolean; latency: number }[] = [];
  
  private readonly threshold = 5;
  private readonly latencyThreshold = 2000; // 2s
  private readonly resetTimeout = 30000; // 30s
  private readonly windowSize = 20;

  constructor(private readonly serviceName: string) {}

  public async execute<T>(action: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        logger.info({ service: this.serviceName }, 'Circuit HALF-OPEN: Testing recovery');
      } else {
        return fallback();
      }
    }

    const start = Date.now();
    try {
      const result = await action();
      const latency = Date.now() - start;
      this.recordRequest(true, latency);
      
      if (this.state === CircuitState.HALF_OPEN) {
        this.onSuccess();
      }
      return result;
    } catch (error) {
      const latency = Date.now() - start;
      this.recordRequest(false, latency);
      this.onFailure();
      return fallback();
    }
  }

  private recordRequest(success: boolean, latency: number) {
    this.requestLog.push({ timestamp: Date.now(), success, latency });
    if (this.requestLog.length > this.windowSize) this.requestLog.shift();
    
    // Periodically update health monitor (rolling average)
    if (this.requestLog.length > 5) {
      const avgLatency = this.requestLog.reduce((acc, r) => acc + r.latency, 0) / this.requestLog.length;
      const errorCount = this.requestLog.filter(r => !r.success).length;
      HealthMonitor.reportMetric('avgLatency', avgLatency);
      HealthMonitor.reportMetric('errorRate', errorCount);
    }
  }

  private isLatencyDegraded(): boolean {
    if (this.requestLog.length < 5) return false;
    const p95 = [...this.requestLog].sort((a,b) => a.latency - b.latency)[Math.floor(this.requestLog.length * 0.95)]?.latency || 0;
    return p95 > this.latencyThreshold;
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
    logger.info({ service: this.serviceName }, 'Circuit CLOSED: Restored');
    HealthMonitor.reportMetric('breakersOpen', 0);
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold || this.isLatencyDegraded()) {
      this.state = CircuitState.OPEN;
      logger.error({ 
        service: this.serviceName, 
        failures: this.failureCount,
        p95Latency: this.isLatencyDegraded() ? 'DEGRADED' : 'OK'
      }, 'Circuit OPEN: Service failure threshold or latency reached');
      HealthMonitor.reportMetric('breakersOpen', 1);
    }
  }

  public getStatus() {
    return {
      state: this.state,
      failures: this.failureCount,
      lastFailureAt: this.lastFailureTime
    };
  }
}

export class IdempotencyManager {
  private static TTL = 60 * 60 * 24; // 24 hours

  public static async isProcessed(id: string, context: string): Promise<boolean> {
    const key = `idempotency:${context}:${id}`;
    const result = await redis.set(key, 'processed', 'EX', this.TTL, 'NX');
    return result !== 'OK';
  }
}
