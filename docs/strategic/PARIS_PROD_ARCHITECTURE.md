# PARIS V1 ARCHITECTURE :: LETSGOFOOD

## 1. Topologie de Déploiement
- **Frontend (Vercel)**: React SPA déployée en mode multi-sous-domaine (app, merchant, driver, admin).
- **Backend (GCP Cloud Run)**: API REST Node.js déployée dans la région `europe-west1` (Belgique), offrant une latence optimale pour Paris/IdF.
- **Base de données (Firestore)**: Mode multi-tenant natif avec isolation logique par `tenantId`.

## 2. Flux de Données (Pragmatique)
1. Le client passe commande via `app.letsgofood.fr`.
2. L'API backend valide la zone géographique (CP en 75, 92, etc.).
3. La commande est persistée dans Firestore avec le `tenantId` correspondant.
4. Un Dispatch worker simple (polling/trigger) identifie un livreur disponible.
5. Notification Push/Log et mise à jour en temps réel de l'état.

## 3. JULES Light (AI)
Module server-side utilisant Gemini 1.5 pour le support d'aide à la décision (ex: suggestion d'assignation) avec validation stricte par Policy Guard (Whitelist).
