
export interface SLO {
  name: string;
  target: number;
  current: number;
  unit: 'ms' | '%' | 'count';
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

  startSpan(name: string, correlationId: string) {
    const startTime = Date.now();
    console.log(`[TELEMETRY] [SPAN-START] ${name} | correlationId: ${correlationId}`);

    return {
      end: () => {
        const duration = Date.now() - startTime;
        console.log(`[TELEMETRY] [SPAN-END] ${name} | duration: ${duration}ms | correlationId: ${correlationId}`);
        if (name.includes('pipeline')) {
          this.validateSLO('latency_p95', duration);
        }
      }
    };
  }

  recordMetric(name: string, value: number, labels: Record<string, string> = {}) {
    console.log(`[TELEMETRY] [METRIC] ${name}: ${value} | labels: ${JSON.stringify(labels)}`);
  }

  private validateSLO(id: string, value: number) {
    const slo = this.slos.get(id);
    if (slo && value > slo.target) {
      this.triggerAlert(`SLO Violation: ${slo.name} (Value: ${value}${slo.unit} > Target: ${slo.target}${slo.unit})`);
    }
  }

  private triggerAlert(message: string) {
    console.error(`[ALERT-ENGINE] [CRITICAL] ${message}`);
    // Future: Integration with PagerDuty / Slack Webhooks
  }

  recordSLI(name: string, value: number, target: number) {
    const isWithinTarget = value <= target;
    console.log(`[TELEMETRY] [SLI] ${name}: ${value} | target: ${target} | status: ${isWithinTarget ? 'OK' : 'FAIL'}`);
  }

  trackUptime(serviceName: string, status: 'UP' | 'DOWN') {
    console.log(`[TELEMETRY] [UPTIME] service: ${serviceName} | status: ${status}`);
    if (status === 'DOWN') {
      this.triggerAlert(`Service ${serviceName} is DOWN`);
    }
  }
}

export const telemetry = JulesTelemetry.getInstance();
