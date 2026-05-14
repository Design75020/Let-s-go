# INDUSTRIAL LOAD TESTING GUIDE :: LETSGOFOOD

## 1. Objectifs de Charge
- **Ingestion**: 10,000 événements par seconde (EPS).
- **Orchestration (JULES)**: 1,000 plans par seconde simultanés.
- **Tools**: 5,000 opérations Firestore/Stripe par seconde.

## 2. Scénarios de Test
### Scenario A: Lunch Peak
Simulation d'un pic de charge massif à 12h00 (+500% de trafic en 5 min).

### Scenario B: Regional Outage
Coupure forcée d'une région primaire pour valider la transition vers la région secondaire via le `JulesRegionManager`.

### Scenario C: Noisy Neighbor
Simulation d'un tenant unique saturant le broker pour valider l'isolation multi-tenant.

## 3. KPI de Validation
- Consommation du budget d'erreurs (< 0.01%).
- Temps de recovery après crash (RTO < 15 min).
