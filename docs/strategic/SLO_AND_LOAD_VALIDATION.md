# SLO AND LOAD VALIDATION :: PRODUCTION TARGETS

## 1. Service Level Objectives (SLO)
| Indicateur | Cible (Target) | Période |
| :--- | :--- | :--- |
| Disponibilité | 99.9% | Mensuel |
| Latence Ingestion | < 100ms | P95 |
| Latence JULES (Planning) | < 500ms | P95 |
| Taux d'erreur | < 0.1% | Global |

## 2. Load Testing Strategy
- **Outil**: k6 / Locust.
- **Scénarios**:
  - *Baseline*: 100 req/s.
  - *Peak*: 1000 req/s (ex: heure du déjeuner).
  - *Stress*: 5000 req/s jusqu'à rupture.

## 3. Performance Validation
- Utilisation de `recordSLI` dans la télémétrie pour valider en temps réel le respect des objectifs.
