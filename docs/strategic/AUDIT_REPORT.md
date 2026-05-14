# RAPPORT D'AUDIT TECHNIQUE - LETSGOFOOD

**Date** : 2024-05-22
**Statut** : Audit Complet Réalisé
**Projet** : LetsGoFood (SaaS Multi-tenant)

## 1. ANALYSE DE L'ARCHITECTURE

L'architecture actuelle repose sur une application React unique avec un routage basé sur le `hostname`.
- **Forces** : Isolation logique simple, code partagé, déploiement unique.
- **Faiblesses** : Le `switch(window.location.hostname)` actuel est mélangé avec des conditions `includes`, ce qui fragilise la sécurité de l'isolation.

## 2. ÉTAT DES LIEUX (CHECKLIST)

### ✅ Ce qui fonctionne
- Build Vite (après installation des dépendances).
- Structure de base des composants (Landing, Login, Portails).
- Connexion Firebase (Config présente).
- Styles Tailwind CSS 4.0.
- Dashboard Admin (UI très propre).

### ❌ Ce qui ne fonctionne pas
- **Erreur Runtime Critique** : Dans `ClientStore.tsx`, `basket.length` est appelé sur un objet, provoquant un crash au clic ou à l'affichage du badge.
- **Authentification Dev** : La fonction `loginAsEmail` n'est pas passée dans le Provider de `AuthContext.tsx`, rendant le bouton "GO" inopérant.
- **Routage Strict** : Le routage dans `App.tsx` n'est pas encore assez rigoureux (présence de `includes` pour les domaines de preview).
- **Suivi de Commande** : Manque une interface de suivi en temps réel côté client.

### ⚠️ Ce qui est partiellement fonctionnel
- **Merchant Portal** : Les graphiques utilisent des données statiques. La gestion du menu est basique.
- **Driver App** : Le filtrage des commandes est rudimentaire.
- **Responsive** : Globalement bon mais quelques débordements sur les tableaux admin en mobile.

### 🚨 Bloquants pour la Production
1. Le crash `basket.length`.
2. L'absence de validation stricte du domaine (Risque de "leak" entre apps).
3. Le bypass d'auth dev qui doit être sécurisé ou désactivé en prod.

## 3. COMPOSANTS ET PAGES MANQUANTES

- **ClientApp** :
  - Page de suivi de commande détaillée.
  - Historique des commandes.
  - Sélection de géolocalisation réelle (actuellement simulée).
- **Merchant** :
  - Gestion des horaires d'ouverture.
  - Rapports de ventes exportables.
- **Driver** :
  - Navigation (Lien vers Google Maps).

## 4. ANALYSE VERCEL

- `vercel.json` est présent avec un rewrite global vers `/`. C'est correct pour une SPA.
- Attention aux domaines : Vercel doit être configuré pour accepter les wildcards ou chaque sous-domaine doit être ajouté manuellement.

## 5. RECOMMANDATIONS IMMÉDIATES

1. Corriger l'accès à `basket.length` par `Object.keys(basket).length`.
2. Exposer `loginAsEmail` dans le contexte d'authentification.
3. Durcir le `switch` dans `App.tsx`.
4. Implémenter une vue `OrderTracking` dynamique.
