# LetsGoFood V15: Chaos Engineering Suite

This suite provides the operational scripts to validate the platform's resilience in a **Hostile Production Environment**.

## 1. Scenario: PostgreSQL Primary Failover
**Goal**: Verify that Cloud Run services can survive a database restart/failover.

```bash
# Force a failover in Cloud SQL (requires gcloud SDK)
gcloud sql instances failover lgf-v15-master

# EXPECTATION:
# 1. API services throw 503 for ~5-10 seconds.
# 2. Connection poolers auto-reconnect once standby is promoted.
# 3. No orphan orders (verified by FinancialReconciler).
```

## 2. Scenario: Redis Partitioning (Event Loss Prevention)
**Goal**: Verify the "Outbox Pattern" kicks in when Redis is unreachable.

```yaml
# K8s NetworkPolicy to drop egress to Redis
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: block-redis-access
spec:
  podSelector:
    matchLabels:
      app: letsgo-api
  policyTypes:
  - Egress
  egress:
  - to:
    - ipBlock: # Assuming Redis Managed IP
        cidr: 10.0.0.1/32
    action: Deny
```

**Validation**:
```sql
-- Check that events are accumulating in SQL but not yet published
SELECT count(*) FROM "EventLog" WHERE published = false;
```

## 3. Scenario: Traffic Spike (Auto-scaling Stress)
**Goal**: Verify HPA triggers fast enough to prevent CPU saturation.

```bash
# Run k6 stress test
k6 run ./load-tests/k6-stress.js --vus 10000 --duration 5m

# OBSERVE (kubectl get hpa -w)
# Replicas should climb from 10 to 200 within 2 minutes.
```

## 4. Scenario: "The Night Shift" (Projection Drift Recovery)
**Goal**: Verify that a completely corrupted Firestore can be rebuilt from the SQL Source of Truth.

```bash
# Delete all Firestore collections
node ./scripts/chaos/wipe-firestore.js

# Trigger Rebuild
node ./scripts/rebuild-projection.js --all

# VALIDATION:
# onSnapshot listeners on client-side should receive the full state within minutes.
```
