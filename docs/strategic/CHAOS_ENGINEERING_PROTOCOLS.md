# CHAOS ENGINEERING PROTOCOLS

## 1. Failure Scenarios
- **Service Latency**: Injection de 5s de délai sur le `JulesEventBroker`.
- **RBAC Denial**: Simulation d'erreurs d'autorisation sur les Tools critiques.
- **Workflow Interruption**: Crash forcé pendant l'exécution d'un DAG.

## 2. Recovery Verification
Le protocole de test valide que :
1. Le disjoncteur (`CircuitBreaker`) s'ouvre après 5 échecs.
2. Le `JulesWorkflowEngine` reprend l'exécution à partir du dernier `checkpoint`.
3. La télémétrie (`OTEL`) enregistre précisément la cascade d'erreurs.
