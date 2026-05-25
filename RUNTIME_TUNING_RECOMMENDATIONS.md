# LetsGoFood V15: Runtime Tuning Recommendations

**Revision**: 2.0  
**Authority**: Staff+ SRE Lead

Based on real runtime observation, the following tuning parameters are recommended for immediate adjustment:

## 1. Alerting & Observation
- **REDUCE** `emitPulse` interval from 30s to 15s in `BatchProcessor.ts` for faster signal visibility.
- **INCREASE** `AnomalyDetector` error threshold to 25 / 30s to filter transient baseline noise.
- **ADJUST** `UHS` error coefficient from 5 to 2 to make the score less reactive to single-request failures.

## 2. Worker Concurrency
- **INCREASE** `CostWorker` concurrency to 5 (from 2) to handle end-of-hour BI batch spikes.
- **STABILIZE** `EconomyWorker` retry limits: move from 3 to 5 for transient network errors.

## 3. Infrastructure
- **REDIS POOL**: Increase `max_connections` to 30.
- **LOG LEVEL**: Set global level to `warn` for high-frequency workers; keep `info` for `OrderService`.

## 4. Marketplace Heat
- **COOL-OFF**: Increase supply-shortage cooldown to 10 minutes to prevent pricing flip-flops for drivers.

**NO ARCHITECTURE CHANGES REQUIRED.** These are pure parameter tunings based on observed steady-state metrics.
