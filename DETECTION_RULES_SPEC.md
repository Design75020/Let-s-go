# LetsGoFood V15: Detection Rules Specification

Algorithmic definitions for the real-time detection of anomalies and performance degradation.

## 1. Detection Algorithms

### A. Static Thresholding
Used for binary/absolute limits (e.g., Budget, Memory).
- **Rule**: `Value > Threshold`
- **Application**: AI Spending, Max Redis Memory.

### B. Moving Average (SMA/EMA)
Used for smoothing jitter in latency and worker lag.
- **Window**: 60 seconds.
- **Rule**: `Current_SMA > (Baseline_SMA * 1.5)`
- **Application**: API Latency, Worker Processing Time.

### C. Rate of Change (Velocity)
Detects rapid spikes before thresholds are breached.
- **Interval**: 10 seconds.
- **Rule**: `(Value_t0 - Value_t-10) / 10 > Delta_Threshold`
- **Application**: Order creation bursts, Error count spikes.

### D. Sustained Degradation (Time-at-Level)
Prevents alerts on transient blips.
- **Rule**: `Metric > Threshold` for `N` consecutive samples.
- **N Values**: P1 (1 sample), P2 (3 samples), P3 (6 samples).

## 2. Advanced Multi-Metric Correlation
The engine identifies complex failure modes by correlating multiple signals:

| Syndrome | Metrics | Resulting Alert |
|----------|---------|-----------------|
| **Database Saturation** | Latency ⬆️ + Connection Pool % ⬆️ | DB_LOAD_CRITICAL (P2) |
| **Worker Starvation** | CPU ⬆️ + Worker Lag ⬆️ | WORKER_RESOURCES_LOW (P2) |
| **Market Collapse** | Pending Orders ⬆️ + Heat > 1.2 | MARKET_LIQUIDITY_EMERGENCY (P1) |
| **Auth Attack** | Login Failures ⬆️ + Latency ⬆️ | SECURITY_BRUTE_FORCE (P1) |

## 3. Threshold Seasonality (Optional Phase)
The engine may adjust thresholds based on time-of-day:
- **Peak Hour (Fri 19:00 - 21:00)**: Thresholds for latency and heat are widened by 20% to accommodate expected scale.
- **Night Mode (01:00 - 05:00)**: Thresholds are tightened to catch quiet-period malfunctions.

## 4. Rule Evaluation Frequency
Rules are evaluated inside the `BatchProcessor` or `AnomalyWorker` loop every **10 seconds**.
