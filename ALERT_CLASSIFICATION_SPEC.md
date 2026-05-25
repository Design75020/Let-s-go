# LetsGoFood V15: Alert Classification Specification

This document defines the severity levels, thresholds, and lifecycle of alerts within the V15 production environment.

## 1. Severity Levels (P1–P4)

| Severity | Level | Description | Escalation Target |
|----------|-------|-------------|-------------------|
| **EMERGENCY**| **P1** | Platform-wide outage, Data breach, Checkout failure. | On-call SRE + C-Level |
| **CRITICAL** | **P2** | 25%+ latent degradation, Major circuit breaker OPEN, UHS < 50. | Senior DevOps / SRE |
| **WARNING**  | **P3** | High worker lag (>10s), AI budget throttling, Supply imbalance > 30%. | Ops Lead |
| **INFO**     | **P4** | Minor error rate spike, Successful autonomous healing, Low AOV. | Developer Log / Audit |

## 2. Metric Thresholds (Example)

| Metric | P4 (Info) | P3 (Warning) | P2 (Critical) | P1 (Emergency) |
|--------|-----------|--------------|---------------|----------------|
| **UHS Score** | 90–95 | 70–89 | 50–69 | < 50 |
| **Error Rate** | 0.5% | 2.0% | 5.0% | > 10.0% |
| **API p99 Latency** | 300ms | 800ms | 2,000ms | > 5,000ms |
| **Redis Stream Lag** | 2s | 5s | 15s | > 60s |
| **AI Budget** | 75% | 90% | 100% | > 110% (Overrun) |

## 3. Deduplication & Cooldown Logic
To prevent operator fatigue, the system enforces strict deduplication:

- **Key Construction**: `alert:{source}:{type}:{optional_resource_id}`.
- **Deduplication Window**: 5 minutes. If the same alert fires within 5 minutes, it is "stacked" rather than re-dispatched.
- **Cooldown (Quiet Period)**: After an alert is "Acknowledged" or "Healed", the same alert type is suppressed for 10 minutes unless the severity increases.

## 4. Lifecycle States
1. **PENDING**: Detected but within deduplication window.
2. **FIRING**: Dispatched to Dashboard and Notifications.
3. **ACKNOWLEDGED**: Human operator has acknowledged receipt.
4. **RESOLVED**: Metric has returned to baseline for 2 consecutive cycles.
5. **SUPPRESSED**: Manually silenced by operator.

## 5. Auto-Resolution
The engine automatically marks an alert as `RESOLVED` if the underlying metric stays below the `P4` threshold for `300 seconds`.
