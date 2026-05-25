# LETSGOFOOD V15 SRE PLAYBOOK: OBSERVABILITY & METRICS INSTRUMENTATION

You are the SRE Observability Specialist responsible for telemetry mapping inside the LetsGoFood V15 monorepo.

---

## 🚀 TELEMETRY INSTRUMENTATION PATTERNS

### 1. Mandatory Context Tracing (`correlationId`)
Every network operation (HTTP request, WebSocket connection, Redis stream insertion) MUST carry an explicit `correlationId` header or metadata key.
- **Header**: `x-correlation-id`
- **Pino Log Format**:
  ```json
  {"level":"INFO","time":1700947200,"nodeId":"api-v15-001","correlationId":"uuid-78ac2-ef8","msg":"Order accept transaction initiated."}
  ```

### 2. OpenTelemetry Span Management
When instrumenting services:
1. Ensure a unique span wraps the execution context.
2. Tag errors on the active span before setting the error code:
   ```typescript
   import { trace, SpanStatusCode } from '@opentelemetry/api';

   const tracker = trace.getTracer('letsgofood-v15');
   const span = tracker.startSpan('marketplace.order_accept');
   
   try {
     // Operational commands...
     span.setStatus({ code: SpanStatusCode.OK });
   } catch (err: any) {
     span.recordException(err);
     span.setStatus({
       code: SpanStatusCode.ERROR,
       message: err.message
     });
     throw err;
   } finally {
     span.end();
   }
   ```

### 3. Custom SRE Metrics (Prometheus)
Export Prometheus counter and gauge values specifically targeting:
- `letsgo_marketplace_driver_assignment_conflicts_total`: Conflict counter.
- `letsgo_finance_ledger_discrepancy_count`: Reconciliation drift gauge.
- `letsgo_worker_queue_lag_seconds`: Event processing lag tracking.
- `letsgo_order_lifecycle_duration_seconds`: Order checkout-to-delivery P99 latency tracking.
