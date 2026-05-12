# 🚀 Guide de déploiement — Let's Go Food

Ce guide couvre le déploiement des **3 projets** en production :

| 🔵 App | 🟠 Landing | 🟣 CRM |
|---|---|---|
| `app.letsgofood.fr` | `letsgofood.fr` | `crm.letsgofood.fr` |
| `/app/frontend` + `/app/backend` | `/app/landing-site` | `/app/crm` |
| Déjà déployée (Emergent) | À déployer (Vercel) | À déployer (Vercel) |

Temps estimé total : **~30 min**

---

## 📋 Prérequis (5 min)

- [ ] Compte **Vercel** (gratuit) : https://vercel.com/signup
- [ ] Accès au DNS du domaine `letsgofood.fr` (OVH, Gandi, Cloudflare…)
- [ ] Repo Git contenant le code (Save to GitHub depuis Emergent)
- [ ] Clés existantes fonctionnelles :
  - ✅ `MONGO_URL` (Mongo Atlas, déjà en `/app/backend/.env`)
  - ✅ `BREVO_API_KEY` (email)
  - ✅ `TWILIO_*` (SMS)
  - ✅ `JWT_SECRET` (auth)

---

## 🔵 App — `app.letsgofood.fr` (déjà déployée)

**Aucune action** : l'app est déjà en ligne sur Emergent avec domaine custom.

### Vérifications à faire après déploiement landing + CRM

Dans `/app/backend/.env` (production) :

```env
# Autoriser les 3 domaines à appeler l'API
CORS_ORIGINS="https://app.letsgofood.fr,https://letsgofood.fr,https://crm.letsgofood.fr"

# Email où recevoir les leads de la landing
LEAD_NOTIFICATION_EMAIL="design75020@proton.me"
```

> ⚠️ **Sans CORS correct**, la landing et le CRM ne pourront pas appeler `/api/leads` ni `/api/track`.
> Actuellement : `CORS_ORIGINS="*"` → fonctionne mais pas recommandé en prod.

---

## 🟠 Landing Site — `letsgofood.fr` (15 min)

### Option A — Déploiement Vercel (recommandé)

#### 1. Push le code sur GitHub
Depuis Emergent : bouton **"Save to GitHub"** dans le chat.

#### 2. Importer le projet sur Vercel
1. https://vercel.com/new
2. **Import Git Repository** → choisir votre repo
3. **Configure Project** :
   - **Root Directory** : `landing-site`
   - **Framework Preset** : `Vite`
   - **Build Command** : `yarn build` (auto)
   - **Output Directory** : `dist` (auto)
   - **Install Command** : `yarn install` (auto)

#### 3. Variables d'environnement
Onglet **Environment Variables** :

| Clé | Valeur |
|---|---|
| `VITE_MODE` | `lead` |
| `VITE_APP_URL` | `https://app.letsgofood.fr` |
| `VITE_API_BASE_URL` | `https://app.letsgofood.fr` |
| `VITE_LEAD_ENDPOINT` | `/api/leads` |
| `VITE_PUBLIC_URL` | `https://letsgofood.fr` |
| `VITE_WHATSAPP_NUMBER` | `33746336197` |
| `VITE_PHONE_DISPLAY` | `+33 7 46 33 61 97` |
| `VITE_CONTACT_EMAIL` | `design75020@proton.me` |
| `VITE_ENABLE_URGENCY` | `true` |

Cliquer **Deploy**.

#### 4. Connecter le domaine `letsgofood.fr`
Une fois le déploiement réussi :
1. **Settings → Domains** → Add Domain → `letsgofood.fr`
2. Ajouter aussi `www.letsgofood.fr` (optionnel, redirection auto)
3. Vercel vous donne des enregistrements DNS → les copier chez votre registrar :

```
Type  Nom        Valeur
A     @          76.76.21.21
CNAME www        cname.vercel-dns.com
```

Attendre la propagation DNS (5-30 min). HTTPS sera automatique (Let's Encrypt).

### Option B — Déploiement Netlify

Similaire à Vercel :
- **Base directory** : `landing-site`
- **Build command** : `yarn build`
- **Publish directory** : `landing-site/dist`
- Mêmes variables d'environnement que ci-dessus

### 🔍 Vérifier que la landing fonctionne
- Ouvrir https://letsgofood.fr → doit afficher la landing
- Cliquer sur un CTA → scroll vers formulaire lead ✅
- Remplir le formulaire → vérifier que le lead arrive dans le CRM
- Scanner le QR code avec un mobile → doit charger avec `?source=qr_landing`

---

## 🟣 CRM — `crm.letsgofood.fr` (10 min)

#### 1. Importer sur Vercel
1. https://vercel.com/new
2. Import le **même repo** que la landing
3. **Root Directory** : `crm`
4. **Framework Preset** : `Vite`

#### 2. Variables d'environnement

| Clé | Valeur |
|---|---|
| `VITE_API_BASE_URL` | `https://app.letsgofood.fr` |

C'est tout. Le CRM utilise le JWT admin existant pour l'auth.

#### 3. Connecter le sous-domaine `crm.letsgofood.fr`
1. **Settings → Domains** → Add Domain → `crm.letsgofood.fr`
2. DNS chez le registrar :

```
Type   Nom   Valeur
CNAME  crm   cname.vercel-dns.com
```

#### 4. Tester le CRM
- Ouvrir https://crm.letsgofood.fr
- Se connecter avec un compte admin (voir `/app/memory/test_credentials.md`)
- Vérifier Dashboard (KPI + pipeline) + page Leads

---

## 🔐 Sécurité — Checklist post-déploiement

- [ ] `CORS_ORIGINS` restreint (pas de `*`) sur le backend prod
- [ ] CRM `robots: noindex, nofollow` activé (déjà dans `index.html` ✅)
- [ ] Mot de passe admin changé (ne pas laisser `Admin123!` en prod)
- [ ] `JWT_SECRET` unique et long (32+ caractères aléatoires)
- [ ] HTTPS forcé sur les 3 domaines (Vercel le fait automatiquement)
- [ ] Env vars `.env` **non commitées** dans Git (déjà dans `.gitignore` ✅)
- [ ] Brevo : vérifier que `design75020@proton.me` reçoit bien les leads
- [ ] Twilio : vérifier que le numéro expéditeur est vérifié

---

## 🔄 Mise à jour des projets

Chaque `git push` sur la branche `main` déclenche un re-deploy automatique sur Vercel pour les 2 projets (landing + CRM).

L'app sur Emergent se met à jour via le bouton "Deploy" Emergent.

---

## 📞 Récap des variables d'env par projet

### Backend (`/app/backend/.env`) — déjà configuré sur Emergent
```env
MONGO_URL=mongodb+srv://...
DB_NAME=letsgofood
JWT_SECRET=...
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=design75020@proton.me
BREVO_SENDER_NAME=Let's Go Food
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM=+33...
LEAD_NOTIFICATION_EMAIL=design75020@proton.me
CORS_ORIGINS=https://app.letsgofood.fr,https://letsgofood.fr,https://crm.letsgofood.fr
```

### Landing (`/app/landing-site/.env` sur Vercel)
```env
VITE_MODE=lead
VITE_APP_URL=https://app.letsgofood.fr
VITE_API_BASE_URL=https://app.letsgofood.fr
VITE_LEAD_ENDPOINT=/api/leads
VITE_PUBLIC_URL=https://letsgofood.fr
VITE_WHATSAPP_NUMBER=33746336197
VITE_PHONE_DISPLAY=+33 7 46 33 61 97
VITE_CONTACT_EMAIL=design75020@proton.me
```

### CRM (`/app/crm/.env` sur Vercel)
```env
VITE_API_BASE_URL=https://app.letsgofood.fr
```

---

## 🆘 Dépannage

### Le formulaire lead renvoie "Envoi impossible"
→ `CORS_ORIGINS` backend ne contient pas `https://letsgofood.fr`
→ Ajoutez-le et redéployez l'app.

### Le CRM affiche "Failed to fetch"
→ `VITE_API_BASE_URL` pointe vers une URL invalide
→ Vérifier dans Vercel > Settings > Environment Variables
→ **Après toute modification d'env var : redéployer** (Vercel ne hot-reload pas les env)

### Le QR code pointe vers localhost
→ `VITE_PUBLIC_URL` n'est pas défini au build
→ Re-déployer en ayant bien défini `VITE_PUBLIC_URL=https://letsgofood.fr`

### Les leads n'arrivent pas par email
→ Vérifier `LEAD_NOTIFICATION_EMAIL` dans `/app/backend/.env`
→ Vérifier les logs backend : `tail -f /var/log/supervisor/backend.out.log`
→ Tester Brevo avec un curl direct

### Un sous-domaine ne résout pas
→ Attendre la propagation DNS (jusqu'à 24h)
→ Vérifier : `dig letsgofood.fr` ou https://dnschecker.org

---

## 📝 Architecture finale en production

```
                    ┌──────────────────────────┐
                    │   MongoDB Atlas (commune)│
                    │    users / leads / events│
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Backend FastAPI        │
                    │  app.letsgofood.fr/api  │
                    └─┬──────────┬───────────┬┘
                      │          │           │
         ┌────────────┘          │           └────────────┐
         │                       │                         │
    ┌────▼────────┐      ┌───────▼───────┐       ┌────────▼────────┐
    │  🔵 App     │      │ 🟠 Landing    │       │ 🟣 CRM          │
    │  (Vercel)   │      │ (Vercel)      │       │ (Vercel)        │
    │  app.       │      │ letsgofood.fr │       │ crm.            │
    │  letsgo...  │      │               │       │ letsgo...       │
    └─────────────┘      └───────────────┘       └─────────────────┘
     Client/Resto/         Visiteurs →             Équipe
     Livreur/Admin         leads commerciaux        commerciale
```

Chaque projet est **indépendant** côté code et déploiement, mais partage la même base de données via le backend FastAPI.
