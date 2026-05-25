# V16 Global Kafka Streaming Architecture

## 1. Partitioning Strategy
- **Topic: `letsgo.global.events`**
- **Partitions**: 100+ partitions per topic, keyed by `region` or `marketId`.
- **Ordering**: Strict ordering is guaranteed within a partition (e.g., all events for Market: Paris-Centre stay in order).

## 2. Cross-Region Replication (MirrorMaker 2)
Events published in `eu-west-1` are asynchronously replicated to `us-east-1` clusters.
- **Latency Target**: < 500ms global reconciliation loop.
- **Failover**: If regional Kafka is down, producers write to a local "Emergency Buffer" (local Redis) until connectivity resumes.

## 3. Exactly-Once Processing (EOP)
- **Producer**: Uses `idempotence: true` to prevent duplicates from network retries.
- **Consumer**: Transactions wrap the "Read-Process-Write" loop. Results aren't committed to the next topic/DB until the offset is handled.

## 4. Dead Letter Queue (DLQ)
- Events that fail validation or processing 3 times are moved to `letsgo.dlq.{region}`.
- Alerts are sent to the SRE Dashboard.
- Support for "Human-in-the-loop" fix-and-resubmit.
