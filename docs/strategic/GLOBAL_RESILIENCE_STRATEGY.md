# GLOBAL RESILIENCE STRATEGY :: LETSGOFOOD

## 1. Multi-Region Deployment
- **Frontend**: Vercel Edge Network (Global by default).
- **Backend**: Firestore Multi-region configuration (`eur3` for EU).
- **IA Runtime**: K8s clusters répartis sur 3 zones de disponibilité.

## 2. Disaster Recovery (DR)
- **RTO (Recovery Time Objective)**: < 15 minutes.
- **RPO (Recovery Point Objective)**: < 1 minute (via continuous Firestore backup).

## 3. Fault Tolerance
- **Circuit Breaker**: Désactivation automatique des intégrations tierces (Stripe/Maps) en cas d'erreurs répétées.
- **DLQ Replay**: Capacité de rejouer manuellement les événements ayant échoué après correction du bug.
