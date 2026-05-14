# EVENT SOURCING AND REPLAY STRATEGY

## 1. Single Source of Truth
L'Audit Log Firestore agit comme un **Event Store**. Chaque événement métier est la source de vérité de l'état du système.

## 2. Replay Capabilities
Le `JulesEventBroker` supporte le rejeu de séquences par `correlationId`.
- **Cas d'usage**: Correction d'un bug de logique et recalcul de l'état final.
- **Intégrité**: Utilisation des versions d'événements (v1, v2) pour gérer les schémas évolutifs.
