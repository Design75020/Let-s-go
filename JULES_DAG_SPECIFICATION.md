# JULES DAG SPECIFICATION :: V7 ARCHITECTURE

## 1. Structure du Graphe
Chaque plan généré par l'IA est un DAG (Directed Acyclic Graph) structuré en JSON.

```json
{
  "id": "uuid-v4",
  "tasks": [
    {
      "id": "node_1",
      "agent": "OPS",
      "action": "VALIDATE_ADDRESS",
      "payload": { "lat": 48.85, "lng": 2.35 }
    },
    {
      "id": "node_2",
      "agent": "FINANCE",
      "action": "AUTH_PAYMENT",
      "dependsOn": ["node_1"]
    }
  ]
}
```

## 2. Validation Runtime
Le `JulesAIPlanner` valide l'intégrité structurelle (cycles, dépendances orphelines) avant de transmettre le DAG au `JulesRuntime`.
