
# LetsGoFood V15 Stable: Security Production Checklist

Harden the system before Go-Live with this mandatory checklist.

## 1. API Security
- [ ] JWT_SECRET is rotated and not using default values.
- [ ] Rate limits are tuned to production traffic patterns.
- [ ] Helmet headers are verifying CSP (Content Security Policy).
- [ ] Payload size limits are enforced (10kb for JSON).
- [ ] RBAC roles are correctly assigned in the database.

## 2. Infrastructure & Secrets
- [ ] Secrets are injected via Environment Variables (K8s Secrets / Secret Manager).
- [ ] No secrets are checked into the repository (verified by SecretLint).
- [ ] DATABASE_URL uses a least-privilege user (not owner/superuser).
- [ ] Redis uses `requirepass` and is TLS-enabled where applicable.

## 3. Event System
- [ ] EVENT_SIGNING_SECRET is unique and rotated.
- [ ] Invalid signatures trigger quarantine flow immediately.
- [ ] Retry limits (max 3) prevent infinite loops and resource exhaustion.

## 4. Workers & BI
- [ ] Workers execute in an isolated namespace/environment.
- [ ] Action allowlist is verified for all active workers.
- [ ] Execution timeouts (5s) are monitored for "hung" workers.

## 5. Persistence
- [ ] DB Backups are encrypted at rest.
- [ ] Prisma connection pooling is configured (`?connection_limit=20`).
- [ ] DESTRICTUVE queries are blocked by DB role permissions.

## 6. Access & Admin
- [ ] `/metrics` and `/monitoring` are behind ADMIN authentication.
- [ ] PII in logs is redacted (email, phone, address).
- [ ] Correlation IDs are propagating across all services.

## 7. Incident Response
- [ ] Emergency Safe Mode is tested via mock incident.
- [ ] Operator notifications are configured for HIGH/CRITICAL incidents.
- [ ] Audit trail captures all RBAC changes.
