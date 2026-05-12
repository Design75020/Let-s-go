# Let's Go Food — CRM (crm.letsgofood.fr)

**Module indépendant** de l'application et de la landing.
Gestion des leads commerciaux uniquement — aucune fonctionnalité produit.

## Stack
- Vite + React 18 + Tailwind
- React Router (routes privées)
- Lucide icons
- Auth : JWT admin de l'application existante (`POST /api/auth/login`)

## Démarrage local
```bash
cd /app/crm
yarn install
yarn dev    # http://localhost:5174
```

## Build production
```bash
yarn build
# → /app/crm/dist/ déployable sur Vercel / Netlify / Cloudflare Pages
```

## Variables d'environnement
Copier `.env.example` en `.env` :

| Variable | Description | Défaut |
|---|---|---|
| `VITE_API_BASE_URL` | URL du backend de l'app (auth + leads) | `https://app.letsgofood.fr` |

## Routes
- `/login` — connexion admin
- `/` — dashboard (KPI, pipeline, sources, tracking)
- `/leads` — liste des leads + filtres + drawer détail

## Endpoints backend utilisés
- `POST /api/auth/login` — connexion
- `GET /api/leads` — liste (admin)
- `GET /api/leads/:id` — détail
- `PUT /api/leads/:id` — update `status` / `notes`
- `GET /api/leads/stats/summary` — funnel + total + today
- `GET /api/track/summary` — analytics events

## Déploiement
1. `yarn build`
2. Déployer `dist/` sur Vercel/Netlify sur le sous-domaine `crm.letsgofood.fr`
3. Définir `VITE_API_BASE_URL=https://app.letsgofood.fr` côté hébergeur

## Sécurité
- Route `/leads/*` requiert JWT admin
- Backend vérifie `role === "admin"` sur chaque endpoint sensible
- Pas d'accès landing ni app produit depuis ce module
- `robots: noindex, nofollow` sur `index.html`

## Connexion à la base
Identique à l'application (`MONGO_URL` + `DB_NAME` côté backend).
Collections utilisées :
- `leads` (créés par la landing via `POST /api/leads`)
- `events` (tracking analytics)
- `users` (auth admin)
