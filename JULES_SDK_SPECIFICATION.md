# JULES SDK :: TECHNICAL SPECIFICATION

## Structure du SDK
```
/source/lib/jules-sdk
├── core/         # Runtime pipeline logic
├── orchestrator/ # Agent selection & DAG planning
├── policy/       # Security & Business rules
├── events/       # Event ingestion & Bus logic
├── tools/        # External system integrations
├── memory/       # Context & State management
└── types/        # Unified type definitions
```

## Agents Supportés
- **DISPATCH**: Optimisation logistique.
- **CRM**: Engagement client post-livraison.
- **SUPPORT**: Résolution automatique de tickets.
- **FINANCE**: Gestion des flux monétaires et remboursements.
- **OPS**: Monitoring et santé système.

## Tools Supportés
- **FirestoreTool**: Lecture/Écriture base de données.
- **StripeTool**: Encaissement et remboursement.
- **NotificationTool**: Push, Email, SMS.
