# DISASTER RECOVERY AND ROLLBACK

## 1. Multi-Region Strategy
- **Primary**: GCP `europe-west1` (Belgium).
- **Secondary**: GCP `us-central1` (Iowa).
- **DNS Failover**: Cloudflare or Vercel Edge Steering.

## 2. RTO / RPO
- **RTO (Recovery Time)**: 30 minutes to pivot all traffic to secondary region.
- **RPO (Recovery Point)**: 1 minute (Maximum data loss allowed in disaster).

## 3. Data Integrity
- Continuous Firestore backups.
- Event Replay capability from Audit Logs to reconstruct world state.
