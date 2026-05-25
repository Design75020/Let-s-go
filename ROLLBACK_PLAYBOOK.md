# Production Security & Rollback Playbook (LetsGoFood V15)

## 🔐 1. Security Production Checklist
- [x] **Rate Limiting**: Globally enforced at 100 req/15m per IP on `/api`.
- [x] **Payload Limits**: Max 10kb on JSON bodies to prevent ReDoS/DoS.
- [x] **Helmet**: CSP, HSTS, and X-Frame-Options configured.
- [x] **Non-Root User**: Dockerfile runs as `letsgo` user (UID 1001).
- [x] **Secrets**: `redact` policy on logging for passwords and tokens.
- [ ] **SQL Injection**: Prisma used as primary ORM for all marketplace logic.
- [ ] **Dependency Audit**: `npm audit` integrated in CI/CD.

## 🔁 2. Instant Rollback Playbook
### Case A: Canary Failure (verify-live.js FAIL)
The pipeline automatically halts and reverts traffic to 0% on the new revision.
**Action**: None required (Automatic).

### Case B: Post-Promotion Stability Issue
If P99 latency spikes or error rates climb > 1% on the promoted revision.
**Action**:
```bash
# Get the previous stable revision name
PREV_REV=$(gcloud run revisions list --service lgf-api --limit 2 --format='value(name)' | tail -n 1)

# Route 100% traffic back
gcloud run services update-traffic lgf-api --to-revisions ${PREV_REV}=100 --region europe-west1
```

### Case C: Database Data Corruption
If a faulty migration or logic error corrupted the Source of Truth.
**Action**:
1. **CUTOVER**: Set platform to `SAFE_MODE=true` (Read-only).
2. **RESTORE**: Restore PostgreSQL from PITR (Point-In-Time) to the minute before the incident.
3. **REPLAY**: Use `scripts/rebuild-projection.js` to heal the Firestore layer.

## 📡 3. Observability Baseline
- **Trace ID**: Check `x-correlation-id` in response headers for incident reconstruction.
- **Node ID**: Check `nodeId` in logs to find the specific instance/revision causing issues.
