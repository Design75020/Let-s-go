# LetsGoFood Production Deployment Checklist

## 1. Domain & DNS Configuration
- [ ] Add `letsgofood.fr` to Vercel (Frontend) and Cloud Run (Custom Domain).
- [ ] Configure Subdomains in DNS provider:
  - `www`, `app`, `merchant`, `driver`, `admin` -> Vercel CNAME
  - `api.letsgofood.fr` -> Cloud Run A Record
- [ ] Verify SSL/TLS certificates for ALL subdomains.

## 2. Environment Variables & Secret Manager
- [ ] Transition from `.env` to Google Secret Manager for `GEMINI_API_KEY` and `JWT_SECRET`.
- [ ] Set `NODE_ENV` to `production` in all environments.
- [ ] Verify `FIREBASE_CONFIG` points to the Production Project (and not the Sandbox).

## 3. Deployment & CI/CD
- [ ] Merged `main` branch to trigger GitHub Actions.
- [ ] Smoke test on `https://app.letsgofood.fr/health`.
- [ ] Verify Docker container startup time is < 5 seconds.

## 3. Security Hardening
- [ ] CORS: Restricted to `letsgofood.fr` subdomains.
- [ ] Helmet: Active with production CSP headers.
- [ ] Rate Limiting: Configured on API endpoints.
- [ ] Auth: Google Auth redirect URIs updated to production domains.

## 4. Mobile & Hybrid Integration
- [ ] Capacitor/Android: `server.url` updated to `app.letsgofood.fr`.
- [ ] Push Notifications: FCM production certificates uploaded.

## 5. Monitoring & Ops
- [ ] UptimeRobot/Pingdom: Configured for `https://app.letsgofood.fr/health`.
- [ ] Cloud Logging (Pino): Verified streaming to GCP Logs Explorer.
- [ ] Error Tracking: Sentry/LogRocket initialized (optional).

## 6. Cleanup
- [ ] GPS Simulator: Disabled or restricted to `/dev` with admin auth.
- [ ] Debug logs removed from frontend.
- [ ] `.env.example` verified for clarity.

---
**Status:** Ready for Pilot Rollout.
