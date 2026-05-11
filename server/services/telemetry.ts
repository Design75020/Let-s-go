/**
 * LetsGoFood Cloud-Native Telemetry (OpenTelemetry Simulation)
 * Implements Distributed Tracing and System Metrics.
 */

interface Span {
  id: string;
  traceId: string;
  name: string;
  startTime: number;
  duration: number;
  service: string;
  metadata: any;
}

class TelemetryService {
  private static instance: TelemetryService;
  private spans: Span[] = [];

  private constructor() {}

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  /**
   * Record a trace span
   */
  public recordSpan(name: string, traceId: string, duration: number, service: string, metadata: any = {}) {
    const span = {
      id: Math.random().toString(36).substr(2, 9),
      traceId,
      name,
      startTime: Date.now() - duration,
      duration,
      service,
      metadata
    };
    this.spans.push(span);
    if (this.spans.length > 100) this.spans.shift(); // Keep only last 100
  }

  public getTrace(traceId: string) {
    return this.spans.filter(s => s.traceId === traceId).sort((a,b) => a.startTime - b.startTime);
  }

  public getAllSpans() {
    return this.spans;
  }
}

export const Telemetry = TelemetryService.getInstance();
