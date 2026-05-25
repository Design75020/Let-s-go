# LetsGoFood V15 Deployment & CI/CD Guide

## 1. Environment Configuration
Add the following variables to your production environment (Vercel/Cloud Run):

```env
NODE_ENV=production
LOG_LEVEL=info
BI_DAILY_COST_LIMIT=50.0
PORT=3000
# AI Keys (Managed via Secrets)
GEMINI_API_KEY=your_key
```

## 2. Infrastructure Scaling
- **WebSocket Gateway:** The system uses `socket.io`. For multi-instance deployments, use the Redis Adapter to sync events across containers.
- **Database:** Firestore is used for persistence. Ensure indexes are created for `orders` collection (status + driverId).
- **Batch Processing:** Uses `node-cron`. In highly distributed systems, move this to a dedicated "Worker" instance or use a Cloud Scheduler to trigger a `/api/cron` endpoint.

## 3. GitHub Actions CI/CD
The project is configured with a standard Vite + Node pipeline:
1. **Lint & Test:** `npm run lint` and `npm run test`
2. **Build:** `npm run build` (Builds React SPA + Bundles Server)
3. **Deploy:** Pushes `dist/` to Vercel or Cloud Run.

## 4. Safety Constraints
- **Safe Mode:** Triggered via the BI Dashboard or automatic Anomaly Detection.
- **Rollback:** Every autonomous decision emits an event that can be reversed via the `Manual Override` button in the SaaS Hub.
- **Validation:** Destructive actions (e.g., clearing pools) require a 2FA-equivalent token validation in a production environment.
