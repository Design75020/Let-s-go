
export interface SLO {
  name: string;
  target: number;
  current: number;
  unit: 'ms' | '%' | 'count';
}

// Aligned with OpenTelemetry SpanContext
export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  traceFlags?: number;
}

export class JulesTelemetry {
  private static instance: JulesTelemetry;
  private slos: Map<string, SLO> = new Map();

  private constructor() {
    this.slos.set('availability', { name: 'Availability', target: 99.9, current: 100, unit: '%' });
    this.slos.set('latency_p95', { name: 'P95 Latency', target: 500, current: 0, unit: 'ms' });
  }

  public static getInstance(): JulesTelemetry {
    if (!JulesTelemetry.instance) {
      JulesTelemetry.instance = new JulesTelemetry();
    }
    return JulesTelemetry.instance;
  }

  createContext(parent?: TraceContext): TraceContext {
    return {
      traceId: parent?.traceId || crypto.randomUUID().replace(/-/g, ''), // OTel format (hex)
      spanId: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      parentSpanId: parent?.spanId,
      traceFlags: 1 // Sampled
    };
  }

  startSpan(name: string, context: TraceContext) {
    const startTime = Date.now();
    console.log(`[OTEL] [SPAN-START] ${name} | traceId: ${context.traceId} | spanId: ${context.spanId}`);

    return {
      end: () => {
        const duration = Date.now() - startTime;
        console.log(`[OTEL] [SPAN-END] ${name} | duration: ${duration}ms | traceId: ${context.traceId}`);
        if (name.includes('pipeline')) {
          this.validateSLO('latency_p95', duration);
        }
      }
    };
  }

  recordMetric(name: string, value: number, labels: Record<string, string> = {}) {
    console.log(`[OTEL] [METRIC] ${name}: ${value} | labels: ${JSON.stringify(labels)}`);
  }

  private validateSLO(id: string, value: number) {
    const slo = this.slos.get(id);
    if (slo && value > slo.target) {
      this.triggerAlert(`SLO Violation: ${slo.name} (Value: ${value}${slo.unit} > Target: ${slo.target}${slo.unit})`);
    }
  }

  private triggerAlert(message: string) {
    console.error(`[ALERT-ENGINE] [CRITICAL] ${message}`);
  }

  recordSLI(name: string, value: number, target: number) {
    const isWithinTarget = value <= target;
    console.log(`[OTEL] [SLI] ${name}: ${value} | target: ${target} | status: ${isWithinTarget ? 'OK' : 'FAIL'}`);
  }

  trackUptime(serviceName: string, status: 'UP' | 'DOWN') {
    console.log(`[OTEL] [UPTIME] service: ${serviceName} | status: ${status}`);
    if (status === 'DOWN') {
      this.triggerAlert(`Service ${serviceName} is DOWN`);
    }
  }
}

export const telemetry = JulesTelemetry.getInstance();
