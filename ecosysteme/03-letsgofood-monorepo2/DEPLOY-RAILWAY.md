# 🚂 Déploiement Railway — Let's Go Food

Railway est **mieux adapté que Vercel pour ton cas** : tu peux déployer les **3 services + MongoDB** au même endroit, avec une vraie structure monorepo. Pas besoin de 3 comptes/projets séparés.

## 🗂️ Architecture cible sur Railway

Dans **un seul projet Railway** tu vas créer **4 services** :

| Service | Rôle | Stack | URL finale |
|---|---|---|---|
| 🍃 **MongoDB** | Base de données | Plugin Railway | (interne) |
| 🐍 **backend** | API FastAPI + WebSockets | Python/Nixpacks | `api.letsgofood.fr` |
| 🌐 **landing-site** | Marketing/SEO | Vite static | `letsgofood.fr` |
| 🎛️ **crm** | Dashboard admin | Vite static | `crm.letsgofood.fr` |

⚠️ **Le frontend principal (`app.letsgofood.fr`)** sera dans un 5ème service si tu veux. On peut aussi le garder sur Vercel/Emergent — il n'est pas bloqué comme la landing.

---

## 📋 Pré-requis

- ✅ Repo GitHub contenant les dossiers `landing-site/`, `backend/`, `crm/`
- ✅ Compte Railway (https://railway.app) — **$5 de crédit gratuit** pour commencer, Hobby Plan à $5/mois ensuite
- ✅ Domaine `letsgofood.fr` chez OVH (tu l'as déjà)

---

## ⚙️ Étape 1 — Créer le projet Railway

1. Va sur https://railway.app/new
2. **Deploy from GitHub repo** → autorise Railway à accéder à ton repo
3. Sélectionne ton repo `letsgofood-landing` (ou autre)
4. Railway crée automatiquement un premier service — **NE FAIS RIEN** encore, on va tout configurer proprement

---

## ⚙️ Étape 2 — Ajouter la base MongoDB

1. Dans ton projet Railway → **+ New** → **Database** → **Add MongoDB**
2. Railway provisionne une MongoDB instantanément
3. Clique dessus → onglet **Variables** → copie la valeur de `MONGO_URL` (elle ressemble à `mongodb://...railway.internal:27017`)

Tu l'utiliseras à l'étape 3 pour le backend.

---

## ⚙️ Étape 3 — Déployer le Backend (FastAPI)

1. **+ New** → **GitHub Repo** → choisis le même repo
2. Une fois le service créé, clique dessus → **Settings**
3. Configure :

| Champ | Valeur |
|---|---|
| **Service Name** | `backend` |
| **Root Directory** | `backend` |
| **Watch Paths** | `backend/**` |
| **Build Command** | *(vide — Nixpacks auto-détecte)* |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |

4. Onglet **Variables** → ajoute :

```
MONGO_URL=${{MongoDB.MONGO_URL}}
DB_NAME=letsgofood
JWT_SECRET_KEY=<génère une clé aléatoire de 64 chars>
CORS_ORIGINS=https://letsgofood.fr,https://www.letsgofood.fr,https://crm.letsgofood.fr,https://app.letsgofood.fr
STRIPE_API_KEY=sk_test_...  # ton Stripe key (mode test)
BREVO_API_KEY=<ta clé Brevo si utilisée>
```

> 💡 `${{MongoDB.MONGO_URL}}` est la **syntaxe Railway** pour référencer une variable d'un autre service. Pas besoin de copier-coller manuellement.

5. **Settings → Networking → Generate Domain** → Railway te donne une URL temporaire (`backend-production-xyz.up.railway.app`)
6. **Deploy** — attends 2-3 min

### 🧪 Vérification backend
```bash
curl https://backend-production-xyz.up.railway.app/api/restaurants
# Doit retourner du JSON
```

---

## ⚙️ Étape 4 — Déployer la Landing-site (static)

1. **+ New** → **GitHub Repo** → même repo
2. **Settings** → configure :

| Champ | Valeur |
|---|---|
| **Service Name** | `landing-site` |
| **Root Directory** | `landing-site` |
| **Build Command** | `yarn install && yarn build` |
| **Start Command** | `yarn preview --host 0.0.0.0 --port $PORT` |

3. **Variables** :

```
VITE_API_BASE_URL=https://api.letsgofood.fr
VITE_APP_URL=https://app.letsgofood.fr
VITE_PUBLIC_URL=https://letsgofood.fr
VITE_MODE=lead
VITE_WHATSAPP_NUMBER=33746336197
VITE_CONTACT_EMAIL=design75020@proton.me
NODE_ENV=production
```

4. **Generate Domain** puis **Deploy**

---

## ⚙️ Étape 5 — Déployer le CRM (static)

Même logique que landing-site :

| Champ | Valeur |
|---|---|
| **Service Name** | `crm` |
| **Root Directory** | `crm` |
| **Build Command** | `yarn install && yarn build` |
| **Start Command** | `yarn preview --host 0.0.0.0 --port $PORT` |

**Variables** :
```
VITE_API_BASE_URL=https://api.letsgofood.fr
```

---

## ⚙️ Étape 6 — Connecter tes domaines OVH → Railway

Pour chaque service (backend, landing-site, crm) :

1. Railway → ton service → **Settings → Networking → Custom Domain**
2. Ajoute le domaine souhaité (ex : `letsgofood.fr` pour landing-site)
3. Railway te donne **un CNAME unique** par service (ex : `xyz.up.railway.app`)

### Chez OVH — Zone DNS

| Type | Sous-domaine | Cible | Pour |
|---|---|---|---|
| `CNAME` | `@` (ou `letsgofood.fr.`) | `xyz.up.railway.app.` | Landing |
| `CNAME` | `www` | `xyz.up.railway.app.` | Redirection www |
| `CNAME` | `api` | `abc.up.railway.app.` | Backend |
| `CNAME` | `crm` | `def.up.railway.app.` | CRM |
| `CNAME` | `app` | `ghi.up.railway.app.` | Frontend principal (optionnel) |

> ⚠️ **Apex domain** : certains registrars refusent CNAME sur `@`. Si OVH te bloque, utilise :
> - `A @ → 76.76.21.98` (IP fixe Railway) *(à confirmer dans les docs Railway au moment T)*
> - Ou garde `letsgofood.fr` = apex vide et utilise `www.letsgofood.fr` comme URL principale

**Propagation** : 15 min → 24h.  
Railway émet automatiquement un certificat HTTPS Let's Encrypt dès que le DNS est valide.

---

## ⚙️ Étape 7 — Configuration CORS côté backend

Mets à jour la variable `CORS_ORIGINS` du service backend sur Railway avec tous tes domaines finaux, puis clique **Redeploy** :

```
CORS_ORIGINS=https://letsgofood.fr,https://www.letsgofood.fr,https://crm.letsgofood.fr,https://app.letsgofood.fr
```

---

## 💰 Coût estimé Railway

- **Hobby Plan** : $5/mois (1 seul utilisateur, suffisant pour MVP)
- **Usage** pour Let's Go Food :
  - MongoDB : ~$3/mois
  - 3 services web (backend + 2 statics) : ~$5-8/mois
  - **Total estimé** : $8-13/mois pour tout

Compare à Vercel Pro ($20/mois) + MongoDB Atlas ($9/mois) = $29/mois minimum.

---

## 🆘 Dépannage

### `Error: Command "landing-site" exited with 127`
C'est le bug Vercel. **N'arrive pas sur Railway** si tu as bien configuré **Root Directory = `landing-site`** (pas Build Command).

### Vite preview ne démarre pas (exit code 1)
Railway ne devine pas `yarn preview` par défaut pour les sites Vite. Assure-toi que ton `package.json` du landing-site contient bien :
```json
"scripts": {
  "preview": "vite preview"
}
```

### Le backend démarre mais ne se connecte pas à Mongo
Vérifie que `MONGO_URL` pointe bien sur `${{MongoDB.MONGO_URL}}` (variable Railway dynamique) et pas sur `mongodb://localhost:27017`.

### CORS error depuis la landing
Ajoute l'URL exacte (avec https://) dans `CORS_ORIGINS` du backend et redéploie.

### Le build tourne mais retourne 404 sur /pour-restaurants
C'est un problème de **SPA fallback** avec `vite preview`. Ajoute dans `landing-site/` un fichier `railway.json` :
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npx serve -s dist -l $PORT",
    "restartPolicyType": "ON_FAILURE"
  }
}
```
Puis `yarn add -D serve` dans `landing-site/`. `serve -s` gère le SPA fallback nativement.

---

## 🎯 Ordre d'opérations recommandé

1. ✅ Créer projet Railway + MongoDB (5 min)
2. ✅ Déployer backend → tester `/api/restaurants` (10 min)
3. ✅ Déployer landing-site → tester l'URL `.up.railway.app` (10 min)
4. ✅ Déployer CRM → tester l'URL `.up.railway.app` (5 min)
5. ✅ Connecter domaines OVH (DNS + attente propagation)
6. ✅ Mettre à jour CORS_ORIGINS avec les domaines finaux
7. ✅ Tester end-to-end : commande → Stripe → CRM attribution

---

Questions ? Dis-moi à quelle étape tu bloques et j'interviens précisément.
