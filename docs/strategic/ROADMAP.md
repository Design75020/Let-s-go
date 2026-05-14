# 🗺️ Roadmap Let's Go Food

Ce document suit l'évolution de l'application vers une solution de livraison professionnelle.

## 🟢 Niveau 1 : Fondations & Sécurité (Priorité Haute)
- [ ] **Authentification (JWT) :** Sécuriser le CRM et créer des comptes Clients/Restos/Livreurs.
- [ ] **Espace Client :** Page "Mon Profil" et historique des commandes.
- [ ] **Gestionnaire de Menu :** Interface Admin pour ajouter/éditer restaurants et plats.
- [ ] **Sauvegarde Panier :** Utilisation du localStorage pour ne pas perdre la sélection.

## 🟡 Niveau 2 : Automatisation & UX (Priorité Moyenne)
- [ ] **Alertes Notifications :** Envoi automatique d'Emails (Brevo) ou SMS (Twilio) lors du changement de statut.
- [ ] **Calcul de Distance :** Intégration Google Maps pour les frais de livraison dynamiques.
- [ ] **Recherche & Filtres :** Barre de recherche et tags de catégories fonctionnels.
- [ ] **Paiement Réel :** Finalisation de l'intégration Stripe (Webhooks pour valider la commande).

## 🔴 Niveau 3 : Écosystème de Livraison (Vision Long Terme)
- [ ] **Vue Livreur :** Interface mobile optimisée pour les coursiers (GPS + validation).
- [ ] **Avis & Notes :** Système de feedback client après chaque repas.
- [ ] **Dashboards Partenaires :** Accès restreint pour chaque restaurant à ses propres stats de vente.
- [ ] **Support Live :** Chat en direct entre le client et l'admin/livreur.
