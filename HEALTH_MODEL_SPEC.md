# LetsGoFood V15: Health Model Specification

This specification defines the unified system health scoring algorithm used by the `HealthMonitor` for real-time observability and autonomous decision-making.

## 1. The Unified Health Score (UHS)
The UHS is a single integer representing system vitality.
**Range**: 0 (Crashed) to 100 (Perfect).

### Calculation Formula
```
Score = 100 
        - (ErrorRate * 5) 
        - (min(20, AvgLatency / 50)) 
        - (min(30, WorkerLag * 2)) 
        - (BreakersOpen * 25)
```

## 2. Scoring Components

| Component | Metric Source | Weighting | Threshold |
|-----------|---------------|-----------|-----------|
| **Error Rate** | `letsgo_http_requests_total{status="5xx"}` | High | > 2% impacts score |
| **API Latency** | P95 Response Time from Express Middleware | Moderate | > 500ms impacts score |
| **Worker Lag** | `letsgo:stream` consumer processing delay | High | > 5s impacts score |
| **Circuit State**| `CircuitBreaker` Status (OPEN = 1, CLOSED = 0) | Critical | 1 OPEN breaker = -25 pts |

## 3. Vitality Thresholds

### 🟢 90 - 100: OPTIMAL
- System is healthy.
- All circuit breakers closed.
- Autonomous optimizations (V16 Predictive) fully enabled.

### 🟡 70 - 89: DEGRADED
- Partial latency or slight worker lag.
- Ops Dashboard triggers "Yellow" alert.
- Throttled AI logic may engage to preserve compute.

### 🟠 50 - 69: UNSTABLE
- High error rate or one major circuit breaker open.
- **Safe Mode Recommended.**
- Autonomous pool expansion paused.

### 🔴 < 50: CRITICAL
- Multiple breakers open or critical worker lag (> 30s).
- **AUTOMATIC SAFE MODE ACTIVATION.**
- All non-essential writes blocked.
- P1 Incident declared.

## 4. Autonomous Response
The `SelfHealer` and `DecisionEngine` use the UHS to bound their actions:
- **Heal Threshold**: Any score `< 85` triggers a diagnostic scan.
- **Safe Mode**: Any score `< 50` triggers mandatory isolation.
- **Recovery**: Score must be `> 90` for 5 consecutive minutes to exit Safe Mode.

## 5. Metric Collection
- **Frequency**: Every 10 seconds via `HealthMonitor.recalculate()`.
- **Persistence**: Exported to Prometheus via `letsgo_system_health_score` gauge.
