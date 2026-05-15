# 🔎 RAPPORT D'AUDIT ARCHITECTURE SENIOR :: LetsGoFood
**Auteur :** Jules (Principal Staff Engineer / Architecte)
**Date :** Mai 2025
**Statut :** ⚠️ Stabilisé mais Fragmenté (Pre-Monorepo State)

---

## 🏗️ 1. ÉTAT DES LIEUX DE L'ARCHITECTURE

### Structure du Repository
- **Type :** Pseudo-monorepo "par dossiers" (Legacy). Le projet actuel est un mélange entre une application Vite principale (`source/`) et des résidus de versions précédentes stockés dans `ecosysteme/`.
- **Couplage :** Très fort entre le frontend et Firestore. La logique métier "Kernel" commence à être centralisée (`source/kernel`), mais reste trop dépendante du client.
- **Backend :** Présence d'un backend Node (`serveur/`) et d'un backend Python (`ecosysteme/03.../backend`). Cette dualité est une source de dette technique majeure.

### Analyse par Couche

#### 🌐 Frontend (React / Vite)
- **Points Forts :** Stack moderne (Vite, Tailwind 4, Motion). Isolation des sous-domaines via Kernel Guard.
- **Points Faibles :** Duplication massive de composants entre les différentes applications (Client vs Merchant). Absence d'un Design System partagé (Shared UI Lib).
- **UX :** Cohérente graphiquement, mais instable sur les redirections cross-domaines.

#### ⚙️ Backend (Node.js / Express)
- **Points Forts :** API REST simplifiée et robuste.
- **Points Faibles :** Manque de séparation stricte (Layered Architecture). Le code de dispatch est mélangé aux routes. Absence de gestionnaire d'événements industriel (Kafka/RabbitMQ simulé par Firestore).

#### 🤖 AI Agent (JULES V10/Light)
- **État :** Actuellement en version "Light" (Server-side via Gemini 1.5).
- **Capacités :** Orchestration de base (Planification DAG simple).
- **Limites :** Pas d'état persistant entre les sessions (Stateless). Pas de boucle de feedback réelle ("Chain of Thought" limitée).

---

## 🚨 2. PROBLÈMES CRITIQUES & ANTI-PATTERNS

1. **Fragmentation Sévère :** Le dossier `ecosysteme/` contient 4 versions différentes du projet. Cela crée une confusion totale pour les nouveaux développeurs. (Priorité P0)
2. **Dette de Persistence :** Utilisation directe de Firestore pour la logique métier complexe. Pas d'abstraction (Repository Pattern).
3. **Double Backend :** Coexistence Node.js / Python non justifiée pour un MVP.
4. **Build Vercel :** La structure actuelle nécessite des rewrites complexes pour supporter les sous-domaines sur un seul déploiement Vercel.

---

## 📈 3. GAP ANALYSIS (Vers Uber Eats Level)

| Feature | État Actuel | Cible (Production-Grade) | Gap |
| :--- | :--- | :--- | :--- |
| **Routing** | Hostname Switch | API Gateway / Edge Routing | Moyen |
| **Data** | Firestore Direct | PostgreSQL + Prisma + Redis Cache | Élevé |
| **Logic** | Client-Side Heavy | Microservices / Serverless Workers | Élevé |
| **Agent** | JULES Light | JULES V10 Autonomous (Durable Workflows) | Moyen |
| **Scaling** | Manuel | Kubernetes / Auto-scaling Cloud Run | Moyen |

---

## 🗺️ 4. PLAN DE TRANSFORMATION (ROADMAP 2025)

### P0 : Unification Industrielle (Semaine 1-2)
- Migrer vers un **vrai Monorepo** (Turborepo ou Nx).
- Extraire la logique commune dans `@lgf/shared-ui` et `@lgf/shared-logic`.
- Supprimer `ecosysteme/` après extraction des assets utiles.

### P1 : Hardening Backend (Semaine 3-4)
- Implémenter **Prisma** avec une DB relationnelle pour les transactions financières.
- Déployer un **Event Bus** réel (Redis Streams).
- Centraliser l'Auth via une Gateway (OIDC/Auth0 ou Firebase Admin centralisé).

### P2 : IA & Autonomie (Semaine 5-8)
- Passer JULES Light en **JULES V10 (Stateful)**.
- Implémenter des **Durable Workflows** (Temporal.io) pour le suivi de commande.
- Dashboard d'observabilité IA (Tracing des décisions).

---

## 📝 CONCLUSION ARCHITECTE
Le projet a une base visuelle et une intention technologique excellente. Cependant, la structure actuelle est celle d'un prototype avancé, pas d'une marketplace scalable. L'effort doit porter sur la **consolidation du monorepo** et la **dé-corrélation du frontend vis-à-vis de la DB** pour atteindre un niveau "Production-Grade".
