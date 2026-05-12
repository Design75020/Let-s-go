# JULES INTEGRATION GUIDE

## 1. Principes d'intégration
JULES ne remplace pas la logique métier, il l'orchestre. L'intégration se fait via l'écoute passive des événements et l'action active via des APIs dédiées.

## 2. Emission d'événements
Tous les composants doivent utiliser `emitEvent` dans `source/lib/events.ts` pour chaque action significative.

## 3. Actions JULES
JULES peut intervenir sur :
- **Dispatch** : Assignation automatique optimisée des livreurs.
- **CRM** : Réponse automatique aux questions clients basées sur le contexte de commande.
- **Opérations** : Alerte en cas de retard de préparation détecté.

## 4. Sécurité
Chaque action JULES passe par le `Policy Engine` pour valider les limites opérationnelles (ex: ne pas rembourser plus de X€ sans validation humaine).
