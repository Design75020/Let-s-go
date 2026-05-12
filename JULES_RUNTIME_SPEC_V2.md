# JULES RUNTIME SPECIFICATION V2

## Pipeline d'Exécution Industriel
Chaque événement métier traverse les couches suivantes :

1. **Broker Ingestion**: Publication dans le `JulesEventBroker`.
2. **Idempotency Check**: Validation du `correlationId`.
3. **Resilience Layer**: Passage par le `Circuit Breaker`.
4. **Context building**: Récupération de la mémoire opérationnelle.
5. **Policy evaluation**: Validation sécuritaire et métier.
6. **DAG Planning**: Orchestration des tâches par l'agent expert.
7. **Atomic Execution**: Mise à jour des systèmes via transactions Firestore et tools sandboxés.

## Composants de Résilience
- **Exponential Backoff**: Stratégie de retry automatique (1s, 2s, 4s...).
- **Circuit Breaker**: Coupure automatique des flux vers un service défaillant (Reset 30s).
- **Dead Letter Queue (DLQ)**: Isolation des erreurs fatales pour analyse post-mortem.
