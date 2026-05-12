# Let's Go Food — Landing Site (letsgofood.fr)

Site marketing **indépendant** de l'application `app.letsgofood.fr`.
Stratégie : acquisition 100% lead — aucun accès produit en mode "lead".

## Stack
- Vite + React 18 + Tailwind CSS
- React Router · Lucide icons
- Aucun backend embarqué (utilise l'API de l'app pour envoyer les leads)

## Démarrage local
```bash
cd /app/landing-site
yarn install
yarn dev         # http://localhost:5173
```

## Build production (statique)
```bash
yarn build
# → /app/landing-site/dist/ déployable sur Vercel / Netlify / Cloudflare Pages / S3
```

## Configuration centrale

Tout le comportement du site se pilote depuis :
**`src/config/landingConfig.js`** — textes, CTA, flags, mode…

Les valeurs sensibles se surchargent via variables d'environnement
(fichier `.env` à la racine, copier `.env.example`) :

| Variable | Rôle | Défaut |
|---|---|---|
| `VITE_MODE` | `lead` (acquisition) ou `app` (accès activé) | `lead` |
| `VITE_APP_URL` | URL de l'application pour les redirections | `https://app.letsgofood.fr` |
| `VITE_API_BASE_URL` | URL du backend recevant les leads | = `VITE_APP_URL` |
| `VITE_LEAD_ENDPOINT` | Chemin du POST lead | `/api/leads` |
| `VITE_ENABLE_CONNEXION` | Forcer l'affichage du bouton Connexion | suit MODE |
| `VITE_ENABLE_SIGNUP` | Forcer l'affichage du bouton Rejoindre | suit MODE |
| `VITE_ENABLE_URGENCY` | Bandeau urgence en haut de page | `true` |

### Comportement selon le mode

**`VITE_MODE=lead`** (défaut) :
- ❌ Bouton Connexion caché
- ❌ Bouton "Rejoindre" caché
- ✅ CTA unique dans la nav : **Être rappelé** → formulaire lead
- ✅ Tous les CTA principaux redirigent vers le formulaire 3 étapes
- ✅ Trois CTAs autorisés : Être rappelé / Recevoir une démo / Planifier un RDV

**`VITE_MODE=app`** :
- ✅ Connexion visible → `{VITE_APP_URL}/login`
- ✅ Rejoindre visible → `{VITE_APP_URL}/register`
- Les CTA des sous-pages redirigent vers l'inscription

Basculer entre modes = changer **une seule ligne** d'env, pas de refactor.

## Endpoint backend

Le formulaire POST sur `${VITE_API_BASE_URL}${VITE_LEAD_ENDPOINT}`
avec le payload JSON :
```json
{
  "restaurant": "Chez Paul",
  "phone": "+33600000000",
  "city": "Lyon",
  "cuisine": "Pizza",
  "preference": "callback",
  "source": "letsgofood.fr"
}
```

Le backend de l'app expose **`POST /api/leads`** (public) qui :
1. Enregistre dans MongoDB (collection `leads`)
2. Envoie un email de notif via Brevo à l'admin (fallback : `BREVO_SENDER_EMAIL`)
3. Retourne `{ success: true, id: "uuid" }`

Admin peut lister les leads via `GET /api/leads` (JWT admin requis).

## Parcours utilisateur (mode lead)

```
Landing (mode lead)
   ↓  tous les CTA
Formulaire 3 étapes (restaurant / emplacement / préférence contact)
   ↓  POST /api/leads
Mongo + email admin Brevo → contact humain / CRM
```

## Déploiement sur `letsgofood.fr`
1. `yarn build` → dossier `dist/`
2. Uploader sur Vercel / Netlify / Cloudflare Pages (ou tout hébergeur statique)
3. Pointer le DNS `letsgofood.fr` vers l'hébergeur
4. Définir les variables d'environnement côté hébergeur (`VITE_MODE=lead`, `VITE_APP_URL=…`)

> ⚠️ Aucun code de paiement dans ce projet.
> Aucun login fonctionnel en mode lead.
> Séparation stricte landing / application.

## Structure
```
src/
  config/landingConfig.js    # ⚙️  CONFIG CENTRALE
  components/LandingNav.jsx
  pages/
    LandingPage.jsx          # /
    LandingRestaurants.jsx   # /pour-restaurants
    LandingDrivers.jsx       # /pour-livreurs
    LandingClients.jsx       # /pour-clients
```
