# LetsGoFood V15: Root Cause Analysis & Target Architecture

## 1. Root Cause Analysis (Legacy V14 Failures)
| Failure Mode | Impact | Core Reason |
|--------------|--------|-------------|
| **Race Discovery** | Double driver assignment | Client-side Firestore writes lacked atomic verification. |
| **State Drift** | SQL says 'Pending', UI says 'Ready' | No CDC between Firestore and the Main DB. |
| **Financial Risk** | Potential double-charges | No server-side idempotency in the ordering flow. |
| **Operational Opacity** | Failed orders disappear | No persistent event log or correlation IDs. |

## 2. Target Architecture (V15 Redesign)

### Canonical Data Flow
1. **COMMAND**: Client → API (POST /patch) → `OrderService`
2. **STRICT DB TRANSACTION**: PostgreSQL Transaction (Prisma)
   - Update `Order` state (Atomic predicate check)
   - Append `LedgerEntry`
3. **EVENT PUB**: `EventStream.publish(MARKETPLACE, 'order.ready')` -> Redis Stream
4. **ASYNC PROJECTION**: `ProjectionWorker` (Server)
   - Read canonical row from SQL
   - Update Firestore Documentation (Read View)
5. **REAL-TIME UPDATE**: Firestore → Real-time subscription → Client UI

### Real-Time Integrity Guarantees
- **At Least Once Delivery**: Redis Streams handle retries for projection.
- **Zero Drift**: Firestore is a one-way projection of PostgreSQL. If a conflict occurs, the projection overwrites the cache with the canonical truth.
- **Atomic Dispatch**: Managed by `PRISMA.$transaction`.

## 3. Deployment Topology
- **Primary DB**: Managed PostgreSQL (Standard Instance).
- **In-Memory Transport**: Redis 7+ (Streams enabled).
- **Mobile Read-View**: Firebase Realtime/Firestore.
- **Worker Plane**: Auto-scaling Node.js containers.
