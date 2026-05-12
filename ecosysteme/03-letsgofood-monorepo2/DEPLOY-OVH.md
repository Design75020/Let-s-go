# 🌐 Configuration du domaine `letsgofood.fr` (OVH → Vercel)

Ce guide explique comment connecter ton domaine **letsgofood.fr** (acheté chez OVH)
à ton déploiement Vercel de la landing page.

## 📋 Pré-requis

- Un compte Vercel avec le projet `landing-site` déjà déployé
- L'accès à l'**espace client OVH** avec gestion de la zone DNS de `letsgofood.fr`
- ~15 minutes de propagation DNS (parfois jusqu'à 24h pour certains FAI)

---

## ⚙️ Étape 1 — Ajouter le domaine dans Vercel

1. Va sur https://vercel.com/dashboard
2. Sélectionne le projet **landing-site**
3. **Settings → Domains**
4. Ajoute successivement :
   - `letsgofood.fr` (domaine apex, principal)
   - `www.letsgofood.fr` (redirigera vers le principal)

Vercel va te proposer automatiquement de **rediriger www → apex**. Accepte.

Vercel t'affichera alors les valeurs DNS à configurer. Elles sont constantes, tu peux
passer directement à l'étape 2 avec les valeurs ci-dessous.

---

## ⚙️ Étape 2 — Configurer la zone DNS chez OVH

1. Connecte-toi sur https://www.ovh.com/manager/
2. **Web Cloud → Noms de domaine → `letsgofood.fr`**
3. Onglet **Zone DNS → Ajouter une entrée**

Ajoute ces **2 entrées** (et supprime les entrées A/CNAME `@` et `www` existantes
si OVH en a créé par défaut) :

| Type | Sous-domaine | Cible | TTL |
|---|---|---|---|
| `A` | _(vide / @)_ | `76.76.21.21` | 3600 |
| `CNAME` | `www` | `cname.vercel-dns.com.` | 3600 |

> ⚠️ Respecte bien **le point final** dans `cname.vercel-dns.com.` — OVH l'exige
> pour les CNAME FQDN.

### ✅ Entrées à conserver
- Les enregistrements `MX` (emails) — ne les touche surtout pas
- Les enregistrements `TXT` SPF / DKIM / DMARC (anti-spam mails) — ne les touche pas

### ❌ Entrées à supprimer si présentes
- Ancien `A @ → <IP OVH Start>` (hébergement par défaut)
- Ancien `CNAME www → letsgofood.fr.`
- Ancien `AAAA @ → <IPv6>` (Vercel gère l'IPv6 différemment)

---

## ⚙️ Étape 3 — Attendre & vérifier

1. La propagation DNS prend **5 à 60 minutes** dans la plupart des cas
2. Tu peux suivre l'état sur : https://dnschecker.org/#A/letsgofood.fr
3. Sur Vercel, les domaines passent de `Invalid Configuration` à `Valid` quand
   la propagation est terminée

Vérifie dans ton navigateur :
- `https://letsgofood.fr/` → doit afficher la landing
- `https://www.letsgofood.fr/` → doit rediriger vers `letsgofood.fr/`
- `https://letsgofood.fr/pour-restaurants` → page restaurateur
- `https://letsgofood.fr/brochure/restaurateur` → viewer PDF tracké

---

## ⚙️ Étape 4 — Variables d'environnement Vercel

Dans Vercel, **Settings → Environment Variables** du projet `landing-site`, configure :

| Nom | Valeur | Notes |
|---|---|---|
| `VITE_PUBLIC_URL` | `https://letsgofood.fr` | URL publique finale |
| `VITE_APP_URL` | `https://app.letsgofood.fr` | Sous-domaine de l'app principale |
| `VITE_API_BASE_URL` | `https://app.letsgofood.fr` | Backend FastAPI |
| `VITE_MODE` | `lead` | ou `app` si tu veux exposer login/signup |
| `VITE_WHATSAPP_NUMBER` | `33746336197` | Ton numéro WhatsApp (format int'l sans +) |
| `VITE_CONTACT_EMAIL` | `design75020@proton.me` | Email contact |

Après avoir modifié les variables, **redéploie le projet** (`Deployments → ⋯ → Redeploy`).

---

## ⚙️ Étape 5 — Sous-domaines additionnels (optionnel)

Si tu veux séparer app.letsgofood.fr et crm.letsgofood.fr :

| Sous-domaine | Type | Cible | Usage |
|---|---|---|---|
| `app` | `CNAME` | `cname.vercel-dns.com.` | Application principale (React frontend) |
| `crm` | `CNAME` | `cname.vercel-dns.com.` | Dashboard CRM admin |
| `api` | `CNAME` | `cname.vercel-dns.com.` | Backend FastAPI (si déployé sur Vercel Functions) ou ton hébergeur backend |

Puis dans Vercel, ajoute le sous-domaine correspondant dans **chaque projet** :
- Projet `landing-site` → `letsgofood.fr` + `www.letsgofood.fr`
- Projet `frontend` → `app.letsgofood.fr`
- Projet `crm` → `crm.letsgofood.fr`

---

## 🔒 HTTPS automatique

Vercel émet un certificat **Let's Encrypt** automatiquement dès que le DNS est valide.
Aucune action manuelle requise côté SSL. Tous les accès HTTP sont redirigés vers HTTPS.

---

## 🆘 Dépannage

### Le domaine reste en "Invalid Configuration" sur Vercel
- Vérifie la zone DNS OVH : l'entrée `A @` doit bien pointer sur `76.76.21.21`
- Attends 1h de plus — la première propagation est parfois lente sur OVH
- Purge ton cache navigateur + `ipconfig /flushdns` (Windows) / `dscacheutil -flushcache` (macOS)

### Les emails letsgofood.fr ne fonctionnent plus
- Tu as probablement supprimé les entrées `MX` par erreur. Restaure-les depuis l'historique OVH.

### letsgofood.fr affiche une page blanche
- Vérifie que le build Vercel ne contient pas d'erreur dans les variables d'env
- Vérifie que `VITE_PUBLIC_URL` n'est pas `https://letsgofood.fr/` (sans slash final)

---

Questions ? Contacte-moi via le chat Emergent ou ouvre un ticket OVH sur support@ovh.com.
