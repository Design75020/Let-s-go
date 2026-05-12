# JULES SDK ARCHITECTURE :: RUNTIME CORE

## 1. Pipeline Execution Model
Le runtime JULES suit un pipeline déterministe et auditable pour chaque événement entrant dans le bus.

**Pipeline Stages:**
1. **Context Building**: Extraction des données de la mémoire opérationnelle (Firestore) et sémantique.
2. **Policy Guard**: Validation par le `Policy Engine` pour prévenir les actions non autorisées ou risquées.
3. **Orchestration**: Sélection de l'agent expert et génération d'un plan d'exécution (DAG).
4. **Execution**: Appel des outils (Firestore, Stripe, Notifications) dans une sandbox tracée.
5. **Memory Update**: Persistance des résultats et mise à jour du contexte pour les futures décisions.

## 2. Event-Driven Architecture (Industrial Grade)
Transition vers un modèle de stream asynchrone :
- **Versioning**: Tous les événements portent un tag de version (v1, v2) pour la compatibilité ascendante.
- **DLQ (Dead Letter Queue)**: Les événements échoués sont isolés pour analyse et rejeu manuel.
- **Idempotence**: Chaque événement possède un `correlationId` unique pour éviter les doubles exécutions.

## 3. Observabilité & Audit
- **Correlation Tracking**: Propagation du `correlationId` de l'UI jusqu'aux outils d'exécution.
- **Audit Log (Immutable)**: Enregistrement de chaque étape du pipeline dans Firestore.
