# LetsGoFood V15: Cost & Performance Control Spec

Governance model for managing infrastructure expenses and operational overhead in the V15 platform.

## 1. Cost Dimensions

| Domain | Tracking Hook | Unit Cost (Est) | Daily Budget |
|--------|---------------|-----------------|--------------|
| **Redis** | `RedisClient` command count | €0.01 / 10k ops | €5.00 |
| **AI (Gemini)**| `CostController.trackUsage` | €0.0001 / token | €20.00 |
| **Compute** | Worker process uptime (3 nodes) | €0.15 / hour | €10.00 |
| **Network** | WebSocket egress (Socket.io) | €0.05 / GB | €5.00 |

## 2. AI Spending Throttling
Controlled by `CostController.ts`.

| Spending Level | Mode | Action |
|----------------|------|--------|
| < 75% Budget | `none` | Full V15 Prediction / Menu Optimization active. |
| 75% - 94% | `soft` | Frequency of V16 Predictive cycles reduced to 2 min. |
| > 95% | `aggressive`| AI menu suggestions disabled. Switch to static heuristics. |
| 100% | `shutoff` | All AI requests blocked via `AI_THROTTLED` event. |

## 3. Log Volume Control
- **Production Level**: `info` (Redacts PII via `Security.redactPII`).
- **Telemetry**: Audit logs stored in DB, operational logs to `pino` stream.
- **Capping**: `pino-http` limits payload logging to 10kb to prevent egress spikes during error loops.

## 4. Redis Stream Hardening
- **Retention**: Max stream length `1,000` messages via `XTRIM` (handled by DurableEventStream/EventStream).
- **Idle Checks**: Consumers automatically `ACK` stale messages to prevent group bloat.

## 5. Anomaly Cost Detection
The `AnomalyDetector` monitors for "Cost Spikes":
- Any single API route exceeding €2.00 spending in 1 hour.
- Any 10x increase in Redis ops per second compared to the rolling baseline.

**Response**: Automatic `CircuitBreaker` OPEN for the offending service.
