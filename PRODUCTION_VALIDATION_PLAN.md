# LetsGoFood V15: Uber-Level Production Validation Plan

**Author**: Principal SRE / Reliability Authority
**Standard**: Uber/Deliveroo Operational Excellence (Tier-1)
**Decision Logic**: Automated Gating based on EMPIRICAL EVIDENCE.

---

## 1. Official Service Level Objectives (SLOs)
| Metric Type | SLI (Indicator) | Target (Objective) | Decision Threshold |
|-------------|-----------------|--------------------|--------------------|
| **Latency** | P95 Request Duration | < 150ms | > 250ms = NO-GO |
| **Latency** | P99 Request Duration | < 350ms | > 500ms = NO-GO |
| **Reliability**| HTTP 5xx Error Rate | < 0.1% | > 0.5% = NO-GO |
| **Marketplace**| Double Assignment Rate | 0.00% | > 0% = CRITICAL FAIL |
| **Finance** | Ledger Drift (Audit) | 0.00 EUR | > 0.01 EUR = NO-GO |
| **Real-time** | Projection Lag (P99) | < 100ms | > 500ms = WARNING |

---

## 2. Multi-Phase Load Validation (k6)
Deployments MUST pass the following load phases in the **Staging-Mirror** environment:

| Phase | Duration | Traffic Type | CCU (Concurrent) | Success Criteria |
|-------|----------|--------------|------------------|------------------|
| **Warm-up** | 10 mins | Linear Ramp | 0 -> 500 | P95 < 100ms |
| **Sustained** | 8 hours | Constant Soak | 3,000 | No Memory Leaks |
| **Spike** | 1 min | Flash Surge | 10,000 | No Cascade Failure |
| **Recovery** | 5 mins | Cooldown | 3,000 -> 100 | Queue Drain < 30s |

---

## 3. Chaos Engineering Gates (Failure Survival)
The system is only GO if it recovers autonomously from the following injections:

### Scenario A: PostgreSQL Primary Failover
- **Injection**: `kill -9` on Primary PG Pod.
- **Expectation**: Read-only mode < 5s; Full write recovery < 30s; Zero data loss.
- **Validation**: `FinancialReconciler` confirms 0 drift after recovery.

### Scenario B: Redis Cluster Partition
- **Injection**: Network drop between API and Redis.
- **Expectation**: API remains operational (Command path). Events queued in PostgreSQL Outbox.
- **Validation**: Events auto-replay to Redis once connectivity is restored.

### Scenario C: Projection Worker Death
- **Injection**: All Projection Workers killed simultaneously.
- **Expectation**: No impact on Order Creation or Payments.
- **Validation**: Workers restart, re-read from last ACK in Redis Stream, and catch up to real-time.

---

## 4. Automated Decision Gate (sre-score.js)
The CI/CD pipeline executes the `sre-score.js` script which pulls data from the Monitoring API.
- **Score >= 95**: **GREEN** -> Automatic Canary Deploy.
- **Score 85 - 94**: **YELLOW** -> Manual SRE Review Required.
- **Score < 85**: **RED** -> Pipeline Blocked. Rollback Staging.

---

## 5. Certification Statement
Certification is NOT a state; it is a behavior. If the system fails a single financial audit or allows a single double-driver-assignment during the 8-hour soak test, the release is **VOID**.
