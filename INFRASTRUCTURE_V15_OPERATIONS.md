# LetsGoFood V15 Infrastructure Operations

## 1. Redis Cluster Strategy
For a production autonomous system, we deploy a high-availability Redis Cluster (3 primary, 3 replica).
- **Persistence**: We enable `AOF` (Append Only File) with `fsync everysec` to ensure no lost events during the transition between Economy Engine snapshots.
- **Streams**: We use consumer groups named `bi_engine_pool`. This allows us to scale the `V15-Worker` pods horizontally without double-processing events.

## 2. Idempotency Store
All autonomous actions are checked against a Redis key with a 24-hour TTL:
`SET action_idempotency:{action_id} "processed" NX EX 86400`
This prevents 're-healing' or 're-pricing' a market tick if a worker restarts mid-operation.

## 3. Circuit Breaker States
The system monitors failure rates on Postgres and Gemini API.
- **OPEN**: If > 5 failures/min, the circuit opens.
- **Action**: The backend immediately returns the last cached market snapshot to users and stops making outbound API calls.
- **Recovery**: Transition to HALF-OPEN after 30s to test a single request.

## 4. Scaling Rules (HPA)
- **Backend**: Scale on CPU > 70% or Request Count > 200/sec per pod.
- **Workers**: Scale based on `XPENDING` count in Redis Streams. If backlog > 1000 events, spin up 2 new workers.
- **WebSockets**: Utilize a Redis Adapter (`socket.io-redis`) to broadcast across pods.

## 5. Rollback & Recovery
- **Canary Deploy**: Deploy only 20% of traffic initially. If `http_requests_total` with status `500` spikes > 1%, the GitHub Action triggers an immediate `kubectl rollout undo`.
- **Safe Mode**: Can be toggled via Dashboard or autonomously if Health Score < 40. Safe mode forces all multipliers to 1.0 and stops dynamic pricing.

## 6. Observability
- **Prometheus**: Scrapes `/metrics` every 15s.
- **Health Score**: A custom metric (0-100) combining CPU, Latency, Error Rate, and Anomaly frequency.
- **Audit Log**: Every autonomous decision is persisted in `audit_logs` table in PostgreSQL for human review.
