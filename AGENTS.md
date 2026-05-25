# LETSGOFOOD V15 — AI AGENT OPERATING SYSTEM (AGENTS.md)
> "In codex we trust, in production we verify. Failure is the baseline."

This file is the authoritative playbook defining the execution boundaries, architectural mandates, and automated safety gates for all large-scale AI Coding Agents operating on the LetsGoFood V15 ecosystem (including OpenAI Codex, Copilot, and custom orchestrators).

---

## 🧭 MODULE 1: CORE ARCHITECTURE MANDATES

### 1.1 PostgreSQL Canonical Authority (SSoT)
- **Rule**: PostgreSQL is the ONLY source of truth for business states, user data, financials, and dispatch assignments.
- **Rule**: Firestore is STRICTLY a read-only projection-layer. No AI agent is permitted to write directly to Firestore from the customer/driver API unless it is inside a replay-safe projection worker handling verified SQL occurrences.
- **Verification**: All order flow state updates MUST run through Prisma transaction isolation blocks (`READ COMMITTED` or `SERIALIZABLE` depending on financial sensitivity).

### 1.2 Dispatch System Concurrency (No Double-Claiming)
- **Constraint**: Only one driver can accept an assignment under concurrent storms.
- **Enforcement**: Updates to assigning a driver must perform conditional mutations:
  ```sql
  UPDATE "Order" SET "status" = 'PICKED_UP', "driverId" = $driverId
  WHERE "id" = $orderId AND "driverId" IS NULL AND "status" = 'READY';
  ```
- **Prohibited**: Never fetch state checks into Node memory to validate drivers and then issue regular updates (`this.order.driverId = driverId; await db.save();`). This introduces race conditions.

### 1.3 Immutable Financial Ledger (Zero Risk Payouts)
- **Constraint**: Financial integrity is absolute. Double charge is an automatic NO-GO.
- **Enforcement**: 
  - Every order creation or transaction MUST insert a corresponding `LedgerEntry` inside the *same* database transaction as the order mutation.
  - All external credit/debit charges must require a unique, cryptographically secure `idempotencyKey` passed straight from the frontend client.

---

## ⚓ MODULE 2: MONOREPO BOUNDARIES & WORKER SEPARATION

The LetsGoFood V15 platform is configured as an enterprise monorepo:
```text
letsgofood-v15/
├── apps/
│   ├── api/                 # Stateless customer, driver, merchant, and admin API gateway
│   └── projection-worker/   # Passive high-scale consumers reading Redis Streams -> Updating Firestore
├── server/
│   ├── controllers/         # Request handling
│   ├── middleware/          # Security headers, rate limiting, and auth filters
│   ├── routes.ts            # Route registrations
│   └── services/            # Core marketplace operations
│       ├── ai-engineer/     # Operational AI helpers
│       ├── bi/              # BI tracking algorithms
│       └── infrastructure/  # Obs, event streams, reconcilers, safety gates
└── source/                  # React client frontend assets (Vite compiled)
```

### Agent Rules for File Location:
1. **Shared Interfaces**: Move state definitions, types, or enums to `/server/types.ts` or `/src/types.ts`. Do not duplicate definitions across the monorepo bounds.
2. **Stateless Modules**: API routes must not maintain internal states. Use Redis caching or database-backed locks.

---

## 🔒 MODULE 3: FIRESTORE & WEB_SOCKET PROTECTION RULES

- **Never mutate Firestore schemas or rules** bypass (`firestore.rules` must remain enforced).
- **Never disable onSnapshot realtime listeners** inside React components.
- **Realtime views are derived**: Stale projections are self-healing. Include a manual re-sync trigger or auto-reconciliation job rather than writing code to "force-sync" client states from client-side actions.

---

## 🛠️ MODULE 4: THE CODEX SYSTEM TOOLBOX & WORKFLOWS

To ensure that autonomous coding agents do not break production stability, use the following sequence before committing or testing changes:

```text
               🤖 CODEX AUTONOMOUS RUNNER PIPELINE
               
   +-------------------+      No      +-------------------+
   |  Write/Edit Code  |------------->|  Run tsx Compiler |
   +-------------------+              +-------------------+
             |                                  |
             v                                  v
   +-------------------+              +-------------------+
   |  Pre-Commit lint  |              |    Check Errors   |
   +-------------------+              +-------------------+
             |                                  |
             v                                  v
   +-------------------+              +-------------------+
   |   verify-live.js  |<-------------|   Resolve Issues  |
   +-------------------+  (Passes validation gate)
```

### 1. Pre-deployment Static Gates
Before any agent turn completes, run:
```bash
npm run lint
```
This verifies:
- Type safety compliance.
- Absence of credentials / secrets in plain-text (tested via `secretlint`).
- Compatibility with ESM/CJS build systems.

### 2. High-Fidelity SRE Gating
Run the local live verifier before checking in code:
```bash
node scripts/verify-live.js
```
The verifier runs simulated cold starts, WS handshakes, and latencies. Any score reporting a "**FAIL (BLOCK DEPLOY)**" triggers an automatic block of the CI/CD pipeline.

---

## 💬 MODULE 5: PRODUCTION-GRADE PROMPT LIBRARY (UBER EATS SPEC)

Use these exact system prompts when orchestrating Codex workflows:

### 5.1 Real-Time Incident Response (SEV1/SEV0 Critical Post-mortem)
```text
[SYSTEM ACTION: INCIDENT_RESPONSE]
You are acting as the Lead Incident Commander responding to a SEV1 / SEV0 production outage in the LetsGoFood V15 billing loop.
Context: Payment confirmation webhooks from Stripe are experiencing a 15% duplicate rate causing duplicate LedgerEntries and potential double charges.
Task:
1. Isolate the affected transaction queue.
2. Draft a transaction check filter that guarantees payment ledger mutations are fully idempotent by checking duplicate Stripe transaction IDs.
3. Design a non-blocking background sweeper that aggregates discrepancies for manual audit.
4. Provide the exact recovery command to rollback state projections without wiping order history.
Constraints: No data-loss, zero-downtime, non-blocking lock pattern only.
```

### 5.2 Chaos Engineering Simulation & Validation
```text
[SYSTEM ACTION: CHAOS_SIMULATION]
You are a Distributed Systems Chaos Engineer.
Scenario: PostgreSQL read replicas have fallen 12 seconds out of sync during peak dinner hour (8,000 orders/minute). Stale metadata is displaying on driver tracking displays.
Task:
1. Design an adaptive fallback middleware in the API layer that detects read replica lag via a timestamp mismatch.
2. If lag > 5 seconds, degrade gracefully by routing read requests back to the primary instance for critical state models (Order, LedgerEntry).
3. Create a circuit breaker around Firestore projection workers to prevent them from reading stale read replicas and writing incorrect updates to client channels.
```

### 5.3 Performance Optimizations & 100k+ CCU Scaling
```text
[SYSTEM ACTION: HIGH_SCALE_TUNING]
You are a Principal Cloud Performance Architect optimizing LetsGoFood V15 to handle a sustained 100k+ concurrent users (CCU).
Task:
1. Identify memory leak leak hot-spots inside Express middleware (e.g. tracking closures, persistent database contexts, leak arrays).
2. Configure PgBouncer pool sizing limits (max_client_conn, default_pool_size) to align with Cloud Run's horizontal autoscaling.
3. Replace slow transactional reads on static restaurant catalog queries with Redis hash stores configured with a 300s TTL.
```

### 5.4 SRE Monitoring & Alerts Integration
```text
[SYSTEM ACTION: METRIC_INSTRUMENTATION]
You are an SRE Observability Specialist.
Task:
1. Add an OpenTelemetry tracer span inside server.ts wrapping order checkout pipelines.
2. Set custom Prometheus telemetry attributes matching `restaurantRegion`, `driverClaimLatency`, and `paymentStatus`.
3. Generate standard alert validation schemas matching alerts.yaml constraints.
```

---

## 🔄 MODULE 6: AUTOMATED ROLLBACKS & EMERGENCY BRAKES

If a deployment fails Canary SRE Gates (`scripts/verify-live.js` yields errors/timeouts):
1. **Traffic Intercept**: Instantly reset the current traffic split on Cloud Run:
   ```bash
   gcloud run services update-traffic letsgofood-v15 --to-revisions PREVIOUS_STABLE=100
   ```
2. **Database Isolation**: If deep corruption or ledger drift behaves abnormally:
   - Call `/api/admin/maintenance/safe-mode` to freeze write endpoints.
   - Run PITR to recover state limits safely.
   - Rebuild views using `scripts/rebuild-projection.js`.
