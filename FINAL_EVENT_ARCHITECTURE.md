# LetsGoFood V15: Final Event Architecture

Unified, Secure, and Deterministic.

```mermaid
graph TD
    subgraph "Publishers (Verified Producers)"
        Orders[OrderService]
        Economy[EconomyEngine]
        Predictive[V16 Predictive]
        Anomaly[AnomalyDetector]
    end

    subgraph "Core Event Backbone (Redis)"
        HMAC[HMAC Signing Layer]
        StreamBI{EventStream: letsgo:stream:bi}
        StreamOrders{EventStream: letsgo:stream:orders}
        DLQ[Dead Letter Queue]
    end

    subgraph "Consumers (Hardened Workers)"
        EcoWorker[EconomyWorker]
        AnomWorker[AnomalyWorker]
        CostWorker[CostWorker]
    end

    Orders --> StreamOrders
    Economy -- "migration.publish" --> HMAC
    Predictive -- "migration.publish" --> HMAC
    Anomaly -- "migration.publish" --> HMAC
    
    HMAC -- "Signed Events" --> StreamBI
    
    StreamBI -- "Verification" --> EcoWorker
    StreamBI -- "Verification" --> AnomWorker
    StreamBI -- "Verification" --> CostWorker
    
    StreamBI -- "Invalid Sigs" --> DLQ
```

## Security Invariants
1. **Source Verifiability**: All events carry an HMAC SHA-256 signature.
2. **Replay Protection**: Idempotency keys are checked for all state-changing worker actions.
3. **Auditability**: Correlation IDs are preserved globally through `AsyncLocalStorage`.
4. **Isolations**: Legacy `DurableEventStream` is completely isolated from production flows.
