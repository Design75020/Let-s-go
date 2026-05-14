# PRODUCTION ARCHITECTURE TOPOLOGY :: LETSGOFOOD

## 1. Global Request Flow
User → Vercel (Edge) → API Gateway (Cloud Run) → Event Bus (Redis Streams) → JULES Runtime (Cloud Run) → DAG Executor (Cloud Run Workers) → Tools → Memory (Redis/Firestore).

## 2. Infrastructure Components
### Frontend (Vercel)
- React SPA with hostname-based routing.
- Edge caching for static restaurant data.

### API Gateway (GCP Cloud Run)
- Rate limiting per IP/Tenant.
- Auth validation (Firebase Auth Admin SDK).

### Event Backbone (Redis Streams / PubSub)
- High throughput ingestion.
- Tenant-based partitioning for isolation.

### JULES Runtime (Isolated Service)
- LLM planning & policy validation.
- Stateless and horizontally scalable.

### Tool Execution (Secure Sandbox)
- Isolated Node.js runtime per execution.
- Mandatory audit logging to Firestore.
