# V16 Event Sourcing & CQRS Design

## 1. The Immutable Event Store
Every state change in LetsGoFood V16 is treated as a discrete, immutable event.

```typescript
interface DomainEvent {
  id: string;          // UUID v4
  type: string;        // e.g., 'ORDER_PLACED', 'SURGE_MODIFIED'
  version: number;     // Schema version
  region: string;      // source region
  aggregateId: string; // ID of the entity (e.g., orderId)
  payload: object;     // Data payload
  metadata: {
    userId: string;
    authContext: string;
    timestamp: string;
    correlationId: string;
  }
}
```

## 2. CQRS Separation
- **Writes (API / Logic)**: Only interact with the Event Stream. No direct DB updates.
- **Reads (Materialized Views)**: Optimized PostgreSQL tables or Redis hashes updated by "Projectors".
- **Benefits**: Scalability of reads independently of writes; full audit trail; point-in-time recovery.

## 3. Projection Engine
The "Projectors" listen to specific Kafka topics and update the read-optimized store.
- **Near-term Projector**: Updates real-time metrics for the dashboard.
- **Analytics Projector**: Batches events into BigQuery/Snowflake for long-term BI.

## 4. State Replay & Hydration
If a query service crashes or needs a new schema:
1. A new Projection Service is started.
2. It requests a replay of all events from `t=0` or the latest `Snapshot`.
3. The query-side database is rebuilt without affecting the write-side availability.
