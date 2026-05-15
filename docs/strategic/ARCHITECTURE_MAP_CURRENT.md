# 🗺️ ARCHITECTURE MAP :: LetsGoFood (Current State)

## 1. Physical Layout (Pseudo-Monorepo)
```
/ (Root)
├── source/          # Main React/Vite Frontend (Kernel + Portals)
├── serveur/         # Node.js Express Backend (REST API + JULES Light)
├── ecosysteme/      # Legacy Fragments (Multiple redundant versions)
│   ├── 01-let-s-go/
│   ├── 02-letsgofood-api/
│   └── 03-letsgofood-monorepo2/  # Contains Python Backend
└── dist/            # Build Artifacts
```

## 2. Component Logic Flow
- **Entry:** `source/main.tsx` -> Kernel Guard (Domain Check).
- **Routing:** `source/App.tsx` -> Hostname-based application portal selection.
- **Data Access:** Directly from Components via `firebase/firestore` (High Coupling).
- **AI Integration:** Components -> Express API -> Gemini 1.5 Flash.

## 3. Deployment Topology
- **Frontend:** Vercel (SPA mode).
- **Backend:** Google Cloud Run (Manual container deployments).
- **DB:** Firebase Firestore (Logical multi-tenancy via tenantId).

---

# 📈 GAP ANALYSIS (Production Uber Eats Grade)

## A. DATA LAYER (Critical)
- **Current:** Schemaless NoSQL (Firestore) with direct frontend writes.
- **Target:** Schema-first (Prisma/Postgres) + Write-ahead logs for transactions.
- **Gap:** Requires complete extraction of Firebase SDK from components into a Service Layer.

## B. SERVICE ORCHESTRATION
- **Current:** Monolithic Express API.
- **Target:** Hexagonal Architecture (Domain-Driven Design).
- **Gap:** No unit/integration tests detected for business logic.

## C. AI AGENT (JULES)
- **Current:** Stateless prompt wrapper (JULES Light).
- **Target:** Autonomous Agent (JULES V10) with Vector Memory and Tool-Calling feedback loops.
- **Gap:** Missing "Durable Execution" for long-running delivery workflows.

---

# 🛑 CRITICAL DEBT & ANTI-PATTERNS
1. **Frontend-to-DB Leakage:** 18+ direct Firestore calls identified in UI components. This bypasses backend security and validation.
2. **Ambiguous Truth:** Multiple `package.json` and `requirements.txt` files across the repo create versioning conflicts.
3. **Implicit RBAC:** Security rules rely heavily on `tenantId` without a robust API Gateway verification layer.
