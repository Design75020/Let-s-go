# LetsGoFood V15 Production Operations & Rollback Strategy

## 1. Cloud Run Deployment Model
We utilize **Revision-based traffic splitting** on Google Cloud Run. 

### Deployment Command
```bash
gcloud run deploy lgf-api \
  --image gcr.io/PROJECT_ID/lgf-api:TAG \
  --no-traffic \
  --tag canary \
  --region europe-west1
```

### Canary Promotion (10%)
```bash
gcloud run services update-traffic lgf-api --to-revisions canary=10 --region europe-west1
```

---

## 2. Automatic Rollback Policy
The CI/CD pipeline (`.github/workflows/production.yml`) executes `scripts/verify-live.js` against the canary revision.

**Rollback triggers:**
- `verify-live.js` returns **FAIL**.
- HTTP 5xx error rate > 0.1% for 1 minute.
- P95 Latency > 250ms on canary revision.

### Automated Rollback Command (in Workflow)
```bash
gcloud run services update-traffic lgf-api --to-revisions LATEST=0 --region europe-west1
```

---

## 3. Manual Emergency Rollback
If a SEV1 incident is detected post-deployment (e.g., database deadlock or financial drift):

**Command:**
```bash
# Force traffic back to the previous stable revision
gcloud run services update-traffic lgf-api --to-revisions PREVIOUS_STABLE_REV=100 --region europe-west1
```

---

## 4. Observability & SRE Verification
All logs are emitted in JSON format via `Pino` with:
- `nodeId`: Cloud Run revision ID or local identifier.
- `correlationId`: For distributed tracing.
- `severity`: Standardized SEV0 (Emergency) to SEV3 (Info).

**Verification Link:**
- [GCP Cloud Logging Dashboard](https://console.cloud.google.com/logs/query)
- [GCP Cloud Monitoring SLOs](https://console.cloud.google.com/monitoring/services)
