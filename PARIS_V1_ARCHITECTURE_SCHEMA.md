# PARIS V1 ARCHITECTURE SCHEMA

## 1. Request Flow (End-to-End)
```mermaid
graph TD
    Client[Client App] -->|POST /api/orders| API[Express API - Cloud Run]
    API -->|Validate ZipCode| DB[(Firestore)]
    API -->|Emit| Log[Structured Logs]

    Worker[Dispatch Worker] -->|Poll/Listen| DB
    Worker -->|Assign| Driver[Driver App]

    JULES[JULES Light] -->|Advice| API
```

## 2. Infrastructure Stack (Pragmatic)
- **Frontend**: Vercel (Edge Network).
- **Backend**: GCP Cloud Run (Region: europe-west1).
- **Storage**: Firestore (Regional).
- **Security**: JWT + Firestore RBAC rules.
