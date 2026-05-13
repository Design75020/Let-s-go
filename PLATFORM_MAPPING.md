# 🗺️ LetsGoFood : Cartographie de la Plateforme (Paris V1)

Ce document répertorie tous les points d'accès, routes et endpoints de la plateforme LetsGoFood pour les phases de test et de production.

---

## 🌐 1. SOUS-DOMAINES ET HOSTNAMES

La plateforme utilise une isolation stricte par domaine. En production, les accès sont :

| Application | URL Production | Description |
| :--- | :--- | :--- |
| **Landing Page** | `https://letsgofood.fr` | Vitrine publique, présentation et liens d'accès |
| **Client App** | `https://app.letsgofood.fr` | Marketplace, menus, commandes (Uber Eats style) |
| **Merchant Portal** | `https://merchant.letsgofood.fr` | Gestion des menus, commandes et stocks restaurateurs |
| **Driver App** | `https://driver.letsgofood.fr` | Interface livreur, missions et navigation |
| **Admin Panel** | `https://admin.letsgofood.fr` | SaaS Control Tower, monitoring global, logs |
| **SaaS Dashboard** | `https://saas.letsgofood.fr` | Alias de l'Admin Panel (Configuration multi-tenant) |
| **CRM Panel** | `https://crm.letsgofood.fr` | Alias de l'Admin Panel (Support client) |

---

## 🛣️ 2. ROUTES FRONTEND (REACT)

### Accès Universels (Tous domaines)
- `/login` : Point d'entrée unique pour l'authentification (basé sur le rôle).

### Mode Développement Local (`localhost:5173`)
En local, toutes les applications sont accessibles via des préfixes de chemin :
- `/` : Landing Page
- `/app` : Client Store (Protégé)
- `/merchant` : Portail Restaurateur (Protégé)
- `/driver` : Driver App (Protégé)
- `/admin` : Admin Portal (Protégé)

### Routes Internes par Application

#### **Client App (`app.`)**
- `/` (ou `/app`) : Marketplace (Liste des restaurants)
- `/restaurant/:id` : Menu dynamique du restaurant
- `/checkout` : Validation de panier
- `/order/:id/track` : Suivi temps réel (Live Tracking)
- `/history` : Historique des commandes

#### **Merchant Portal (`merchant.`)**
- `/dashboard` : Vue d'ensemble
- `/orders` : Gestion des commandes entrantes
- `/menu` : Éditeur de carte
- `/settings` : Profil établissement

#### **Driver App (`driver.`)**
- `/tasks` : Liste des livraisons disponibles
- `/active` : Course en cours (Navigation)
- `/earnings` : Historique des revenus

#### **Admin Panel (`admin.` / `saas.`)**
- `/overview` : Métriques globales (SLO, Uptime)
- `/tenants` : Gestion des instances (Paris-75, etc.)
- `/system-logs` : Audit logs immuables (Audit Trail)
- `/jules-control` : Monitoring de l'IA (Orchestration)

---

## 🔌 3. ENDPOINTS BACKEND (API REST)

| Méthode | Endpoint | Description | Sécurité |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authentification et génération de JWT | Public |
| `POST` | `/api/orders` | Création de commande (Validation Paris/IDF) | Client JWT |
| `GET` | `/api/orders/:id` | Récupération du statut d'une commande | Propriétaire |
| `GET` | `/api/restaurants` | Liste des restaurants par zone | Public |
| `GET` | `/api/drivers/available` | Liste des livreurs en ligne | Admin/Merchant |
| `POST` | `/api/jules/plan` | Orchestration IA via JULES Light | Admin Only |

---

## 🔑 4. SCÉNARIOS DE TEST RAPIDE

### Test Client (Paris)
1. Aller sur `app.letsgofood.fr` (ou `localhost:5173/app`)
2. Se connecter
3. Saisir un code postal Parisien (ex: 75001)
4. Choisir un restaurant et commander.

### Test Admin
1. Aller sur `admin.letsgofood.fr`
2. Identifiant : `admin@letsgofood.fr`
3. Vérifier le Dashboard SLO et les logs système.

---

## 🏗️ 5. ENVIRONNEMENTS DISPONIBLES

- **Production** : Vercel + Google Cloud Run (GCP)
- **Staging** : `*.run.app` / `*.vercel.app` (Previews)
- **Local** : Node.js (Vite) sur port `5173` ou `5174` (si collision).
