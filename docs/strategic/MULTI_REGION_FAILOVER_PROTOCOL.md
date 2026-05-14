# MULTI-REGION FAILOVER PROTOCOL

## 1. Détection d'Anomalie
Le `JulesTelemetry` détecte une violation SLO continue (> 5 min) ou une perte d'Uptime sur la région primaire.

## 2. Processus de Basculement
1. **Pivoting API Gateway**: Mise à jour des routes Cloud Run vers la région Standby.
2. **Event Bus Re-routing**: Redirection du `JulesEventBroker` vers le cluster Kafka/Redis secondaire.
3. **Storage Promotion**: Passage de la base de données secondaire en mode Read/Write (si applicable).

## 3. Validation de Santé
Vérification via le `RegionManager` du retour à une latence P95 nominale sur la nouvelle région.
