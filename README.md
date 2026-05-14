# 🚀 LetsGoFood Platform

Plateforme SaaS multi-tenant de livraison food premium, conçue pour une mise à l'échelle industrielle. LetsGoFood unifie les clients, les restaurateurs et les livreurs au sein d'un écosystème hautement performant.

## 🏗️ Architecture Multi-App

Le projet utilise une architecture de micro-frontends intégrés, isolés par sous-domaines via un routage dynamique au niveau du Kernel React.

- **letsgofood.fr** : Landing Page & Vitrine Marketing.
- **app.letsgofood.fr** : Marketplace Client (Expérience type Uber Eats).
- **merchant.letsgofood.fr** : Dashboard Restaurateur (Gestion de menus & commandes).
- **driver.letsgofood.fr** : Interface Livreur (Logistique & Dispatch).
- **admin.letsgofood.fr** : SaaS Control Tower (Supervision, SRE & Multi-tenancy).

## 🛠️ Stack Technique

- **Frontend** : React 19, Vite, TypeScript, Tailwind CSS, Framer Motion.
- **Backend** : Node.js (Express), JULES Light (AI Orchestration via Gemini 1.5).
- **Database** : Firebase Firestore (Temps réel & Isolation multi-tenant).
- **Observabilité** : OpenTelemetry (OTel) compatible tracing & metrics.
- **Déploiement** : Vercel (Edge Frontend) & Google Cloud Run (Backend API).

## 🚀 Démarrage Rapide

### Installation
```bash
npm install
```

### Développement
```bash
npm run dev
```

### Build Production
```bash
npm run build
```

## 🌍 Configuration des Domaines (Vercel)

Pour le fonctionnement multi-app, assurez-vous que les domaines suivants pointent vers le déploiement Vercel :
- `letsgofood.fr`
- `*.letsgofood.fr` (Wildcard recommandé)

## 🔒 Sécurité & Multi-tenancy

- Isolation logique stricte via `tenantId` dans Firestore.
- Règles de sécurité Firebase atomiques basées sur les rôles (RBAC).
- Routage par hostname empêchant les fuites de contexte inter-applications.

## 📈 Monitoring & SRE

Consultez les rapports internes pour plus de détails :
- `PLATFORM_MAPPING.md` : Inventaire complet des routes et endpoints.
- `SRE_LINK_AUDIT_REPORT.md` : Certification de readiness production.
- `HOSTNAME_ROUTING_AUDIT.md` : Validation de l'isolation par domaine.

---
© 2025 LetsGoFood Eco-System • Kernel V2.5.4
