
# LetsGoFood V15 Production Architecture

## 1. System Overview
```text
[ CLIENTS (DASHBOARDS) ]
       ^  |
       |  v
[ LOAD BALANCER / API GATEWAY ]
       |
       +-----> [ OBSERVABILITY: Pino / Prometheus / Health ]
       |
       +-----> [ DISTRIBUTED WEBSOCKET LAYER (Socket.io + Redis Adapter) ]
       |           |
       |           v
[ DISTRIBUTED SERVICES PLANE ]
       |           |
       |           +---> [ IDEMPOTENCY STORE (Redis) ]
       |           |
       |           +---> [ CIRCUIT BREAKER MGR ]
       |
[ EVENT STREAMING PLANE (Redis Streams / Kafka) ]
       |           |
       |           +---> [ EVENT PERSISTENCE ]
       |           |
       |           +---> [ CONSUMER GROUPS ]
       |           |
       |           +---> [ DEAD LETTER QUEUE (DLQ) ]
       |
[ V15 AUTONOMOUS CORE ]
       |           |
       |           +---> [ ECONOMY ENGINE ] (Durable / Stateless)
       |           |
       |           +---> [ ANOMALY MGR ] (Distributed Detection)
       |           |
       |           +---> [ SELF-HEALER ] (Cluster-aware recovery)
       |
[ PERSISTENCE LAYER ]
       |
       +-----> [ POSTGRESQL (Prisma) ]
       +-----> [ FIRESTORE (Global Cache) ]
```

## 2. Distributed Event Flow
1. **Source**: An order or sensor data triggers a `publish`.
2. **Persistence**: The event is written to `Redis Stream` (AOF/RDB persisted).
3. **Distribution**: Consumer groups pick up events for `Economy` or `Anomaly` processing.
4. **Idempotency**: Before processing, the `IdempotencyManager` checks the deduplication store.
5. **Execution**: The V15 Engine executes the policy. If it fails, the `Circuit Breaker` opens.
6. **Alerting**: Failure events or anomalies are real-time streamed to the `SaaS Dashboard`.

## 3. Deployment Strategy (Production)
- **Containerization**: All services run in Docker containers.
- **Orchestration**: Kubernetes or ECS manages scaling based on CPU/Memory and Event Backlog.
- **Horizontal Scaling**: The WebSocket layer and V15 worker pool can be scaled independently.
- **Redis Strategy**: High-availability Redis Cluster with Sentinel for both Event Streaming and Idempotency.
- **Monitoring**: Datadog or Prometheus/Grafana scrape the `/metrics` endpoint.
- **Zero Downtime**: Rolling updates with Blue/Green deployment using health-check verification.
