# UNIFIED OBSERVABILITY ARCHITECTURE :: JULES V6

## 1. Trace Propagation
Utilisation du `TraceContext` injecté dans chaque événement. Chaque étape du pipeline (Context, Policy, Planning, Execution) ajoute un Span enfant au traceId parent.

## 2. Metrics & SLIs
- **System**: CPU, Memory, Concurrency.
- **Business**: Order success rate, Dispatch latency, Payment failure rate.
- **AI**: LLM token usage, Model tier selection (FAST vs SMART).

## 3. Tooling Stack
- **Tracing**: Jaeger / Honeycomb.
- **Metrics**: Prometheus / Grafana.
- **Logs**: ELK Stack / Datadog.
