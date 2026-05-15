# LetsGoFood Disaster Recovery Plan (DRP)

## 1. Rollback Procedures
### Backend (Cloud Run)
If a deployment fails health checks or introduces critical bugs:
```bash
# List previous revisions
gcloud run revisions list --service letsgofood-api --region europe-west1

# Rollback to specific stable revision
gcloud run services update-traffic letsgofood-api --to-revisions=STABLE_REVISION_ID=100
```

### Frontend (Vercel)
1. Navigate to **Deployments** for the project.
2. Find the last stable deployment.
3. Click **Instant Rollback**.

## 2. Database Backup (Firestore)
- **Automatic**: Use Firestore's Managed Backup (Daily).
- **Manual Export**:
```bash
gcloud firestore export gs://letsgofood-backups-prod
```

## 3. Incident Response
1. **Detection**: UptimeRobot alerts the #ops Slack channel.
2. **Triage**: Check `/health` endpoint and Cloud Logging (Pino errors).
3. **Communication**: Update `status.letsgofood.fr` (if configured) or notify stakeholders via email.
4. **Resolution**: Apply patch or rollback as defined above.

## 4. Key Contacts
- Tech Lead: [name@letsgofood.fr]
- GCP Admin: [admin@letsgofood.fr]
