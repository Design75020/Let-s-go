# LetsGoFood V15: Incident Response Runbook

Operational procedures for detecting, classifying, and resolving incidents in the V15 Hardened Platform.

## 1. Incident Classification

| Tier | Severity | Description | SLA (Detection) | SLA (Resolution) |
|------|----------|-------------|-----------------|------------------|
| **P1** | **CRITICAL** | Total checkout failure, Global Safe Mode, Data Breach. | < 2 min | < 1 hour |
| **P2** | **HIGH** | Major circuit breaker open, Worker lag > 30s, 10% Error rate. | < 5 min | < 4 hours |
| **P3** | **MEDIUM** | Surge multiplier stuck, V16 drift > 15%, Degradation in UI. | < 15 min | < 24 hours |
| **P4** | **LOW** | Metric drift, Log anomalies, Minor UI styling issues. | < 60 min | < 3 days |

## 2. Detection Signals
- **Automated**: `AnomalyDetector` tracks error spikes and publishes `ANOMALY_DETECTED`.
- **Manual**: Ops Dashboard health score drop below 70.
- **External**: Merchant or Customer feedback surge via Support channel.

## 3. Safe Mode Protocol
**Trigger**: UHS < 50 or `IncidentSeverity.CRITICAL`.

### Activation Procedure
1. `IncidentResponse.activateSafeMode()` called.
2. `DecisionEngine` freezes all autonomous scaling.
3. UI displays "System Maintenance: Service Throttled".
4. `SelfHealer` attempts emergency restarts (Gateway/Cache).

### Recovery Procedure
1. Verify UHS > 80 for 10 minutes.
2. Review `AuditLog` for the root cause of the incident.
3. `IncidentResponse.deactivateSafeMode()` manually (human verification required).
4. Gradually resume V16 Predictive actions.

## 4. Escalation Paths
1. **L1 Support**: Initial triage of UI/Frontend issues.
2. **L2 Ops (SRE)**: Marketplace liquidity, Redis lag, Worker health.
3. **L3 Engineering**: DB corruption, Signature verification failures, Core Engine crashes.
4. **C-Level**: Financial loss > €10k, Major PII leak.

## 5. Rollback Procedures
**Target Execution**: < 2 minutes.

- **Config**: Revert environment variables to the previous stable JSON config.
- **Code**: Deploy previous stable container digest via CI/CD.
- **Data**: Restore Redis snapshot (if stream corruption is detected).

## 6. Communication
- **Internal**: Slack channel `#v15-war-room`.
- **Public**: `status.letsgofood.fr` updated via BatchProcessor health hooks.
