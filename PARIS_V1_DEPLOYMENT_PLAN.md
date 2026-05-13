# PARIS V1 DEPLOYMENT PLAN

## Étape 1 : Provisionnement (Jour 1)
- Création du projet GCP et déploiement de Cloud Run.
- Configuration des domaines Vercel pour app, merchant, driver et admin.

## Étape 2 : Configuration Sécurité (Jour 2)
- Déploiement des `firestore.rules` durcies avec isolation tenantId.
- Configuration de Sentry pour le tracking d'erreurs en production.

## Étape 3 : Go-Live Alpha (Jour 3)
- Ouverture du service sur un périmètre restreint (Paris 75 uniquement).
- Test du flow complet : Commande -> Marchand -> Livreur.

## Étape 4 : Monitoring (Continu)
- Validation des SLO de latence (< 800ms) et de dispatch (< 5s).
