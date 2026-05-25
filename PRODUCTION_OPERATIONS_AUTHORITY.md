# LetsGoFood V15: Production Operations Authority

**Operational Revision**: 2026.05.17-FINAL  
**Lead Authority**: Staff+ Production Engineer / SRE Lead  
**Scope**: Production Reliability, Scaling, and Incident Response

---

## 🟢 1. SYSTEM STATE CLASSIFICATION

The platform health is categorized into four distinct operational states based on telemetry.

| State | Metrics | Mode
|-------|---------|------|
| **HEALTHY** | UHS ≥ 90, p95 < 300ms, Lag < 2s, Error < 1% | **FULL PERFORMANCE** |
| **DEGRADED** | UHS 70–89, Latency ⬆️, Worker Lag ⬆️ | **OBSERVATIONAL** |
| **CRITICAL** | UHS 40–69, Backlog ⬆️, Error Spikes | **INTERVENTIONAL** |
| **SAFE MODE** | UHS < 40, Cascading Failures, Breakers OPEN | **PROTECTIVE (ISOLATED)** |

---

## 🚨 2. INCIDENT RESPONSE RUNBOOK

### P4 (INFO) - Informational
- **Signals**: Minor log anomalies, successful self-healing.
- **Action**: Log to `AuditLog`. No operator intervention.

### P3 (WARNING) - Targeted Resource Adjustment
- **Signals**: Worker lag > 5s, Surge multiplier stuck.
- **Actions**: 
  - Increment worker count by 1 (Small scale).
  - Reduce batch processing sizes.
  - Monitor trend for 10 minutes.

### P2 (CRITICAL) - System Pressure Mitigation
- **Signals**: UHS < 70, p99 > 2s, Circuit Breaker OPEN.
- **Actions**:
  - **Throttle API**: Reject non-essential requests (e.g., analytics, previews).
  - **Reduce Concurrency**: Lower worker thread limits to prevent DB saturation.
  - **Enable Fallbacks**: Switch to static pricing/recommendations.

### P1 (EMERGENCY) - Platform Survival
- **Signals**: UHS < 40, Total checkout failure, Signature mismatch spikes.
- **Actions**:
  - **Activate Safe Mode**: Trigger `IncidentResponse.activateSafeMode()`.
  - **Freeze Workers**: Stop all non-essential event processing (Marketing, BI).
  - **Deployment Freeze**: Block all CI/CD pipelines.
  - **Rollback**: Immediately revert to previous stable digest if deployment-correlated.

---

## 🧠 3. SAFE MODE RULES (HARD PRIORITY)

Safe Mode is the final safety net for order integrity.

- **Trigger**: UHS < 40 OR `REDIS_LAG > 10s` sustained.
- **Behavior**:
  - **Order Integrity**: Order processing is isolated; non-order events (Analytics, BI) are dropped.
  - **Decision Freeze**: All `DecisionEngine` and `V16Predictive` loops are SHUT DOWN.
  - **Deterministic Pricing**: Surge pricing reverts to a safe static `1.0x` baseline.
  - **Verification**: Mandatory HMAC re-validation on all orders.

---

## 📈 4. LOAD TESTING STRATEGY (K6 MODEL)

Performance boundaries are validated monthly via K6 simulation.

1. **NORMAL LOAD**: 500 RPS baseline. 0% Error rate goal.
2. **BURST LOAD**: 500 ➡️ 2,500 RPS in 60s. Target: 100% Circuit Breaker activation for auxiliary services.
3. **STRESS LOAD**: 1,500 RPS sustained for 30 min. Target: Monitor Redis memory growth and log volume.
4. **CHAOS LOAD**: Randomly drop 20% of `EconomyWorker` threads. Target: Verify event replay and idempotency logic.

---

## 🔥 5. BOTTLENECK DETECTION LOGIC

| Bottleneck | Signal | Detection Trigger |
|------------|--------|-------------------|
| **API Saturation** | RPS Ceiling | 5xx Errors > 5% / min |
| **Redis Fatigue** | Stream Backlog | `XLEN letsgo:stream:bi` > 5,000 |
| **DB Exhaustion** | Pool Usage | `Prisma` connection pool > 90% |
| **Worker Starvation** | Queue Delay | Time-in-queue > 5s |
| **Memory Pressure** | Node RSS | Heap usage > 85% |

---

## ⚖️ 6. AUTO-SCALING RULES (ANTI-FLAPPING)

- **Scale UP**: Triggered if `CPU > 70%` OR `QueueLag > 2s` for 3 consecutive samples.
- **Scale DOWN**: Triggered if `CPU < 30%` and `Lag < 0.5s` for 10 minutes.
- **Cooldown**: 10 minutes between any scaling events to prevent resource flapping.
- **Restriction**: NO AUTO-SCALING allowed during Incident P1/P2.

---

## 🏪 7. MARKETPLACE STABILITY MODEL

The marketplace remains in equilibrium via the heat-sensing engine.

- **Detection**: Cancellation rate > 2% triggers instant regional surge.
- **Equilibrium**: Dispatch priority given to "Long-Idle" drivers to prevent churn.
- **Stabilization**: If delivery time > 45 min, the system throttles order intake for that specific zone.

---

## 💰 8. COST PROTECTION LAYER

- **Redis**: Automatic `XTRIM` on all streams to 1,000 messages.
- **Logs**: Verbosity switched to `ERROR` only if logging egress > 50GB/day.
- **AI/Gemini**: Hard spending cap at 110% of daily budget. Total AI shutoff on overrun.

---

## 🔁 9. DEPLOYMENT SAFETY (CI/CD)

- **Incident Lock**: Deployment blocked if Health Score < 80.
- **Canary Strategy**: 5% traffic for 10 minutes. Auto-rollback if `ErrorRate` increments > 0.5%.
- **Verification**: All deployments must pass `AuditLog` integrity checks before final cutover.

---

## 📊 10. DECISION PRIORITY MATRIX

When systems conflict, decisions follow this immutable hierarchy:

1. **Order Integrity** (Never lose or corrupt an active order).
2. **System Stability** (Protect the core API and Database).
3. **Marketplace Continuity** (Ensure orders continue to flow).
4. **Performance Optimization** (Reduce latency).
5. **Cost / Feature optimization**.

---

## 🧭 11. FINAL OPERATING PRINCIPLE

> "If the system is unstable, do less.
> If the system is stable, observe more.
> If the system is scaling, constrain aggressively."
