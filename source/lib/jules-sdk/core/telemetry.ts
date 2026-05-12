
export class JulesTelemetry {
  private static instance: JulesTelemetry;

  private constructor() {}

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
      }
    };
  }

  recordMetric(name: string, value: number, labels: Record<string, string> = {}) {
    console.log(`[TELEMETRY] [METRIC] ${name}: ${value} | labels: ${JSON.stringify(labels)}`);
  }
}

export const telemetry = JulesTelemetry.getInstance();
