# LLM OPERATIONAL COST PLAN

## 1. Modèle de Coûts par Tenant
- **Tier Free**: 10k tokens / jour.
- **Tier Business**: 1M tokens / jour.
- **Tier Enterprise**: Unlimited (avec quota dynamique).

## 2. Optimisations Actives
- **Smart Caching**: Réutilisation des plans sémantiques (économie estimée: 40%).
- **Model Tiering**: Routage automatique vers `Gemini 1.5 Flash` pour les tâches non critiques.
- **Batching**: Groupement des événements de notification pour un appel LLM unique.

## 3. Monitoring Financier
Suivi en temps réel via le `TokenBudgetManager` avec alertes automatiques à 80% de consommation du budget tenant.
