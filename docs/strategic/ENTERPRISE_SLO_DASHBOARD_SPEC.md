# ENTERPRISE SLO DASHBOARD SPECIFICATION

## 1. Vue Supervision (Live)
- **Status Hub**: Uptime de chaque sous-système (Broker, JULES, Workflows).
- **Latency Heatmap**: Distribution des latences de pipeline par type d'événement.
- **Error Rate**: Taux d'échec global et par agent (Dispatch, Finance).

## 2. Vue SLO Compliance
- **Availability Gauge**: Score sur 30 jours (Cible 99.9%).
- **P95 Latency Tracker**: Alerte visuelle si > 500ms.
- **Budget d'Erreur**: Consommation du quota d'erreurs autorisé.

## 3. Alerts Log
- Liste chronologique des violations de seuils avec lien direct vers le `correlationId` et l'Audit Log Firestore.
