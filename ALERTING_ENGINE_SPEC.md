# LetsGoFood V15: Alerting Engine Specification

The Alerting Engine is a distributed processing layer responsible for evaluating system telemetry against defined thresholds and publishing prioritized alerts to the Ops Ecosystem.

## 1. Engine Core Pipeline
The engine operates as a "Reactive Observer" on the `EventStream` and `Observability` metrics.

1. **Ingest**: Aggregates signals from `Prometheus`, `HealthMonitor`, and `EventStream` (ANOMALY domain).
2. **Evaluate**: Applies logic defined in `DETECTION_RULES_SPEC.md`.
3. **Classify**: Assigns severity according to `ALERT_CLASSIFICATION_SPEC.md`.
4. **Deduplicate**: Suppresses repetitive signals via Redis-backed rolling windows.
5. **Publish**: Dispatches `bi:alert` events via `Socket.io` and writes to `AuditLog`.

## 2. Ingested Signal Matrix
| Signal | Source | Category | Sampling Frequency |
|--------|--------|----------|--------------------|
| **UHS Score** | `HealthMonitor` | Stability | 10s |
| **API Latency** | Express Middleware / Metrics | Performance | Real-time (p95 window) |
| **Stream Lag** | `EventStream` Info | Reliability | 30s |
| **Worker Backlog** | Redis `XLEN` | Reliability | 30s |
| **Error Rate** | Prometheus Counter | Quality | 10s |
| **Supply/Demand Gap**| `EconomyEngine` | Economics | 10s |
| **Cost Spike** | `CostController` | Financial | Real-time |

## 3. Distributed State Management
The engine uses **Redis** for inter-worker coordination:
- **Alert Registry**: Tracks active alerts to prevent "Alert Storms".
- **Suppression Keys**: `alert:suppress:{userId}:{alertType}` (TTL: 15-60m).
- **Incident Lock**: Prevents multiple `SelfHealer` cycles for the same root cause.

## 4. Execution Model
- **Synchronous (Emergency)**: Direct calls from `Security` or `Hardening` modules for binary failures (e.g., Auth failure spikes).
- **Asynchronous (Standard)**: `AnomalyWorker` processing the `letsgo:stream:anomaly` stream.

## 5. Persistence & Traceability
- All triggered alerts must be logged in the `AuditLog` with a `security: true` or `alert: true` flag.
- Alerts must carry the `correlationId` from the triggering request to enable deep-dive debugging.
