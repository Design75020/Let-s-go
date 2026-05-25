# LetsGoFood V15: Architecture Risk Assessment

This audit identifies critical stability and reliability risks within the V15 Autonomous Platform.

## 1. High-Priority Risks

### [RISK-01] Event System Fragmentation
**Description**: The system uses two distinct event implementations: `EventStream` (Hardened) and `DurableEventStream` (Simplified).
- **Impact**: Inconsistent security posture. Events in `DurableEventStream` lack HMAC signatures, making them vulnerable to injection. Fragmented error handling patterns (DLQ vs no-DLQ) lead to unpredictable message loss.
- **Recommended Action**: Consolidate all event publishing/consumption into the hardened `EventStream` implementation.

### [RISK-02] Simulation vs. Real-World Disconnect
**Description**: `EconomyEngine` and `V16Engine` operate on simulated drift and snapshots that are not fully reconciled with actual high-frequency order data in real-time.
- **Impact**: `EconomyWorker` updates "demand models" but these models do not currently feedback into the `EconomyEngine`'s calculation which still uses `setInterval` drift. This creates a "Control Gap" where autonomous actions might be based on stale or inaccurate simulations.
- **Recommended Action**: Bind `EconomyEngine` state updates directly to `EconomyWorker` event processing.

### [RISK-03] Unbounded Self-Healing Loops
**Description**: `SelfHealer` executes actions like `RESTART_GATEWAY_INSTANCES` upon critical anomalies.
- **Impact**: If the restart action itself causes a latency spike or error (cold start), it can trigger a new `ANOMALY_DETECTED` event, leading to an infinite "Healing Loop" that eventually crashes the infrastructure.
- **Recommended Action**: Implement a mandatory `coolOffPeriod` (e.g., 5 minutes) in `SelfHealer` during which no further actions can be taken for the same subsystem.

### [RISK-04] Distributed Idempotency Latency
**Description**: `IdempotencyManager` uses Redis for cross-node coordination.
- **Impact**: In high-concurrency scenarios, a race condition during `NX` set could allow dual execution of a "Heal" action if two workers process the same anomaly simultaneously and Redis latency is high.
- **Recommended Action**: Use a distributed lock (Redlock) or a Lua script for strictly atomic `check-and-set` operations for healing orchestration.

## 2. Performance Bottlenecks

### [BOT-01] Event Stream Polling Overhead
The 100ms `setTimeout` in `EventStream.consume` creates unnecessary CPU overhead during idle periods and provides suboptimal throughput during spikes compared to blocking `XREADGROUP`.

### [BOT-02] Metric Recalculation Frequency
`HealthMonitor.recalculate()` is called on every metric report. In a busy system, this could lead to excessive calculation cycles. 

## 3. Reliability Gaps

| Gap | Description | Severity |
|-----|-------------|----------|
| No Backpressure | If Redis Streams grow indefinitely, workers don't currently signal backpressure to the API layer. | Medium |
| Partial Sig Verification | If an event is missing a signature in `EventStream`, it is quarantined, but `DurableEventStream` doesn't check signatures at all. | High |
| Sync Auth Dependency | `OrderController` waits for JWT verification; if the Auth service is slow, Order creation latency spikes. | Low |
