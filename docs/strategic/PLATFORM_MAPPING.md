# 🗺️ LetsGoFood : Cartographie de la Plateforme (Paris V1)

Ce document répertorie tous les points d'accès, routes et endpoints de la plateforme LetsGoFood pour les phases de test et de production.

---

## 🌐 1. SOUS-DOMAINES ET HOSTNAMES (MAPPING HOSTNAME → APP)

| Hostname | Application React | Rôle Métier |
| :--- | :--- | :--- |
| `letsgofood.fr` | `LandingPage` | Portail public / Vitrine |
| `app.letsgofood.fr` | `ClientStore` | Marketplace Client (Uber Eats) |
| `merchant.letsgofood.fr` | `MerchantPortal` | Gestion Restaurateur |
| `driver.letsgofood.fr` | `DriverApp` | Interface Livreur |
| `admin.letsgofood.fr` | `AdminPortal` | Contrôle global / SRE Dashboard |
| `saas.letsgofood.fr` | `AdminPortal` | Configuration Multi-tenant |
| `crm.letsgofood.fr` | `AdminPortal` | Support et Logistique |
| `localhost` / `127.0.0.1` | `Toutes` | Développement local |

---

## 🛣️ 2. ROUTES FRONTEND (REACT)

### Routes Critiques
- `/login` : Point d'entrée unique authentifié
- `/app` : Portail Marketplace
- `/merchant/*` : Dashboard restaurateur (sous-routes incluses)
- `/driver/*` : Interface de livraison (sous-routes incluses)
- `/admin/*` : Control Tower (sous-routes incluses)

### Pages Spécifiques Détectées
- **Client** : Checkout, Order Tracking (Live), Restaurant Menus.
- **Admin** : System Logs, SLO Monitoring, Tenant Management.

---

## 🔌 3. BACKEND API (ENDPOINTS REST)

**Base URL** : `https://api.letsgofood.fr` (ou local port `3000`)

| Méthode | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Login & JWT Issue | Non |
| `POST` | `/api/orders` | Création commande | JWT |
| `GET` | `/api/orders/:id` | Status commande | JWT |
| `GET` | `/api/restaurants` | List restaurants (IDF) | Non |
| `GET` | `/api/drivers/available` | Livreurs dispo | JWT |
| `POST` | `/api/jules/plan` | Orchestration IA | JWT |

---

## 🔄 4. SCÉNARIOS D’ACCÈS (USER FLOWS)

### 🧺 Flow Client
1. Naviguer vers `app.letsgofood.fr`
2. Login via `/login`
3. Sélection restaurant → `/restaurant/:id`
4. Panier → Checkout → `/checkout`
5. Suivi → `/order/:id/track`

### 👨‍🍳 Flow Restaurateur
1. Naviguer vers `merchant.letsgofood.fr`
2. Dashboard → Gestion commandes entrantes.

### 🚚 Flow Livreur
1. Naviguer vers `driver.letsgofood.fr`
2. Acceptation mission → Tracking trajet.

---

## 🏗️ 5. ENVIRONNEMENTS ET PORTS
- **Production** : Vercel (Edge) + GCP Cloud Run.
- **Preview** : `letsgofood.vercel.app`
- **Local** : `localhost:5173` (Frontend) & `localhost:3000` (Backend).
