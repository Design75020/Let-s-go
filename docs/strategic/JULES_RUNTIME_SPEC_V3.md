# JULES RUNTIME SPECIFICATION V3 :: INDUSTRIAL ORCHESTRATION

## 1. Durable Workflow Engine
Le JULES Runtime intègre désormais une machine d'état durable (`JulesWorkflowEngine`) permettant l'orchestration asynchrone sur de longues périodes.
- **Persistence**: Sauvegarde systématique de l'état à chaque transition.
- **Récupération**: Capacité de reprendre un workflow après un crash serveur.

## 2. Pluggable Event Broker
L'architecture événementielle a été refactorisée pour être agnostique du transport.
- **IEventBroker**: Interface standard pour la publication et l'abonnement.
- **Migration Path**: Support natif pour passer de Firestore à Kafka ou Redis Streams sans modification de la logique métier.

## 3. Sandboxed Executions
Les outils sont isolés via le `JulesToolRegistry`, garantissant que chaque action est tracée et soumise au `Policy Engine`.
