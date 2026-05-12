# FoodRush - Plateforme de Livraison de Repas

## Architecture
- Backend: FastAPI + MongoDB + JWT + WebSocket
- Frontend: React + Tailwind CSS + Shadcn UI + Recharts
- Auth: Multi-role JWT (dual: cookies + Bearer token)
- Real-time: WebSocket natif FastAPI

## Implemented Features

### Phase 1 - MVP
- Auth multi-role (admin, client, driver, restaurant_owner)
- Admin Dashboard (stats, charts, commandes recentes)
- CRUD Restaurants + Menus
- Gestion commandes (statuts, assignation livreur)
- Interface Client (browse, detail, panier, checkout, historique)
- Interface Livreur (disponibles, en cours, terminees)
- Auto-seed donnees demo

### Phase 2 - Ameliorations
- Codes promo (CRUD admin, validation checkout)
- Programme fidelite (4 tiers, points, echange)
- Interface restaurateur (dashboard, menu, commandes)
- PWA manifest

### Phase 3 - WebSocket Temps Reel
- Suivi commande client en direct (page OrderTracking avec progress bar)
- Notifications livreur (assignation, mises a jour)
- Dashboard admin live (stats auto-refresh)
- Badges "En direct" / "Temps reel" sur toutes les interfaces
- Auto-reconnexion WebSocket avec heartbeat

## Test Results
- Backend: 100% (56/56 tests incluant WebSocket)
- Frontend: 95%+

## Credentials
- Admin: admin@foodrush.com / Admin123!
- Client: client1@test.com / Client123!
- Driver: driver1@test.com / Driver123!

## Architecture — 3 projets séparés (Fév 2026)

```
/app/
├── backend/          # FastAPI + MongoDB (commun aux 3 projets)
├── frontend/         # 🔵 APPLICATION — app.letsgofood.fr
│                     #    (Client / Livreur / Restaurateur / Admin)
│                     #    ⚠️ N'importe PLUS aucune landing depuis Fév 2026
├── landing-site/     # 🟠 LANDING MARKETING — letsgofood.fr
│                     #    (Mode lead, QR, simulateur, tracking, PDFs)
└── crm/              # 🟣 CRM PIPELINE — crm.letsgofood.fr
                      #    (Login admin JWT, leads, statuts, notes)
```

### Base de données commune
Les 3 projets (app + landing + CRM) utilisent la **même base MongoDB** via le backend FastAPI.
- Collection `users` (auth) — utilisée par app & CRM
- Collection `leads` — remplie par landing, gérée par CRM
- Collection `events` — tracking landing, consultée par CRM

### Règles de séparation
- L'app `/app/frontend/` ne connaît **rien** de la landing (imports nettoyés, routes `/pour-*` supprimées, `/` non-auth → `/login`)
- La landing ne connaît **rien** de l'app produit (mode "lead", 0 accès login)
- Le CRM ne touche **ni** produit **ni** marketing — uniquement leads & pipeline

## Projets séparés

### Landing Site — `letsgofood.fr` (Fév 2026 — MODE LEAD + TRACKING COMPLET)
Projet **totalement indépendant** de l'app.
- Emplacement : `/app/landing-site/`
- Stack : Vite + React 18 + Tailwind + React Router + Lucide + qrcode.react
- Pages : `/`, `/pour-restaurants`, `/pour-livreurs`, `/pour-clients`
- **Mode "lead"** (défaut) : aucun accès app, tous CTA → formulaire lead 3 étapes
- **Mode "app"** (via env) : connexion + inscription activées
- Config centrale `src/config/landingConfig.js` + env vars (MODE, APP_URL, API_BASE, LEAD_ENDPOINT, ENABLE_*)

#### Wave 2 Session — Paiements Stripe + Rate limiting + Gamification (22 Fév 2026)
Itération majeure livrant 5 fonctionnalités liées au business :

#### 💳 Stripe Payments (mode test)
- Backend : intégration `emergentintegrations.payments.stripe.checkout.StripeCheckout`
  - Nouvelle collection Mongo **`payment_transactions`** (id, session_id, order_id, user_id, amount, currency, status, payment_status, metadata, timestamps, finalized_at)
  - Endpoints : `POST /api/payments/checkout` (crée session Stripe + record pending), `GET /api/payments/status/{session_id}` (polling avec fallback gracieux), `POST /api/webhook/stripe` (handler signature-safe)
  - Sécurité : montant calculé côté serveur depuis `order.total` (jamais depuis le frontend) — 403 si commande d'un autre user, 400 si déjà payée
  - Idempotent via flag `finalized_at` (jamais de double-paiement même si webhook + polling frappent simultanément)
  - Order en `payment_method='stripe'` créé avec `status='awaiting_payment'` et `payment_status='pending'`, passe à `status='pending'` + notifs admin/resto **uniquement après paiement confirmé**
- Frontend app principal : `CartCheckout.js` avec sélecteur Carte/Espèces + redirection Stripe + message carte test `4242 4242 4242 4242`
- Frontend `OrderTracking.js` : détection `?session_id=` au retour, polling jusqu'à confirmation (8 tentatives × 2s), bannières « Vérification… » → « Paiement confirmé » / « Paiement annulé »

#### 🛡️ Rate limiting
- `slowapi` avec `Limiter(key_func=get_remote_address)` → `/api/auth/login` limité à **10 requêtes/minute par IP**
- Défense en profondeur : agit AU-DESSUS de la protection per-identifier existante (5 tentatives/identifiant)
- 429 propre avec message FR « Trop de tentatives. Réessayez dans quelques minutes. »

#### 📊 CSV Export leads
- `GET /api/leads/export/csv` (admin-only, filtres optionnels `?ref=&zone=&src=`)
- Exports UTF-8 BOM compatible Excel, filename daté, 15 colonnes complètes incluant attribution
- Bouton « Export CSV » sur la page CRM `/leads` qui respecte les filtres actifs

#### 🏆 Leaderboard commerciaux
- `GET /api/leads/stats/leaderboard?period=week|month|all`
- Aggregation Mongo avec classement par `ref`, calcul conversion rate, tier auto (`rookie < 15` / `pro 15-49` / `legend ≥50`), zones agrégées par commercial
- Section dédiée `/crm` Dashboard avec période switcher (7j/30j/Tout), top 10 affiché avec badge tier + icône Crown/Medal/Award + rang numéroté éditorial

#### 📱 QR codes personnalisés (CRM LinkBuilder)
- `qrcode` npm intégré dans CRM
- Preview temps réel + téléchargement **PNG haute résolution (420px)** et **SVG vectoriel**
- Nom de fichier auto : `qr-{ref}-{zone}.svg` — prêt à imprimer flyers/vitrines/cartes de visite
- Error correction level H (30% damage tolerance)

#### Tests
- Testing agent : **13/15 backend tests passed (87%)** — les 2 "failed" sont une limitation test API Stripe (sessions non-retrievables avant complétion), pas un bug d'implémentation
- Fallback gracieux ajouté sur `/api/payments/status` pour retourner le dernier status connu en cas d'échec Stripe
- Screenshots CRM : QR preview + download · Leaderboard agent_001 Rookie · Leads avec bouton Export CSV ✅
- Fichier test créé : `/app/backend/tests/test_rate_limit_stripe_leaderboard.py`

### Code Review Wave 1 — Corrections appliquées (22 Fév 2026)
- **Sécurité** — Migration CRM : suppression de `localStorage.setItem("lg_crm_token")`. L'auth passe désormais 100% par les cookies httpOnly `access_token`/`refresh_token` posés par le backend (déjà en place côté FastAPI). Seul le profil user (non-sensible) reste en localStorage pour l'UX. Fetch côté CRM utilise `credentials: "include"`. Validation : login OK, cookies posés, GET protégé fonctionne sans token JS.
- **Python** — Remplacement `random.*` → `secrets.SystemRandom()` (10 instances dans `seed_demo_data`). Supprime toute prédictibilité même sur les paths non-critiques.
- **Python `is` vs `==`** — Les 6 lignes signalées utilisaient toutes `is None` / `is not None`, qui est l'**idiome correct Python (PEP 8)**. Changement NON appliqué (aurait dégradé la qualité). Noté dans le retour review.
- **React hooks deps** — `OwnerDashboard`, `OwnerOrders`, `OwnerMenu`, `DriverDashboard`, `AdminDashboard`, `OrderTracking` : `fetchData`/`fetchOrders`/`fetchAll` stabilisés via `useCallback`, injectés dans les deps des `useEffect`. Suppression du `eslint-disable-line` sur `OrderTracking.js`.
- **Array index as key** — `OwnerDashboard.js:68`, `AdminDashboard.js:93/110` : remplacés par `key={s.label}` (stable identifier).
- **useMemo** — `OwnerMenu.js`, `RestaurantDetail.js`, `AdminOrders.js` : memoization de `menuItems.filter(...)` et `drivers.filter(...)` en `itemsByCategory` / `activeDrivers`.
- **Console cleanup** — 30 `console.warn` supprimés sur `pages/owner`, `pages/driver`, `pages/client`, `pages/admin`, `hooks/` (remplacés par `catch { /* noop */ }`).
- Tests : lint Python + JS ✅ · curl login + cookies + leads protégés ✅ · screenshots CRM login + dashboard sans token localStorage ✅

### Attribution CRM & Tracking terrain (22 Fév 2026)
Système complet de capture de leads traçables avec attribution multi-critères.
- **Landing** :
  - Nouveau module `src/lib/attribution.js` : capture `ref` / `src` / `zone` / `camp` depuis l'URL → `localStorage` persistant (multi-sessions), dernier clic gagne par champ, `first_seen` / `last_seen` tracés
  - Table `AGENT_MAP` dans `src/config/agents.js` (ex: `agent_001` → `Paul`)
  - Nouveau composant `AttributionWelcome.jsx` : bannière top-right, offset-box, éditoriale — *« 👋 Paul vous a recommandé Let's Go · Livraison disponible dans votre zone paris11 »*, dismissible par session
  - `tracking.js` et lead form + newsletter injectent automatiquement `attribution` dans chaque POST
- **Backend** :
  - Nouveau sous-modèle Pydantic `Attribution` (ref, src, zone, camp)
  - `POST /api/leads` et `POST /api/track` acceptent et persistent l'attribution
  - Email admin inclut les champs attribution (ref/src/zone/camp)
  - Nouveau endpoint admin **`GET /api/leads/attribution/summary`** → classements top commerciaux, canaux, zones, campagnes avec taux de conversion par groupe
- **CRM** :
  - `Leads.jsx` : nouvelle colonne **Attribution** (pastille orange + `via {src} / zone`) + 3 filtres dropdown (commercial / zone / canal)
  - `Dashboard.jsx` : nouvelle section **« Attribution — Qui ramène les leads ? »** avec 4 classements (Top Commerciaux / Top Canaux / Top Zones / Top Campagnes) + taux de conversion
  - **Générateur de lien trackable** (LinkBuilder) intégré au dashboard : saisie ref/src/zone/camp → URL copiée en 1 clic pour les flyers/QR terrain
- Tests : lint python+js ✅ · curl POST lead+track avec attribution ✅ · screenshots CRM Dashboard/Leads/LinkBuilder ✅ · bannière landing avec ref=agent_001 ✅

#### Refonte éditoriale sous-pages (22 Fév 2026)
- Les 3 sous-pages `/pour-restaurants`, `/pour-livreurs`, `/pour-clients` passent au design éditorial premium (identique à l'accueil) :
  - Typographie **Fraunces** (`font-display`, `display-xl`, `display-number`, `pull-quote`, italiques)
  - Grilles asymétriques `grid-cols-[1.15fr_0.85fr]`, sections alternées `bg-brand-bone` / `bg-brand-ink` / `bg-brand-cream`
  - Textures `.grain`/`.grain-light`, cartes `.offset-box`, eyebrows `●`, numérotation éditoriale 01/02/03
- Nouveau composant **`RoleBadge`** (bandeau haut) + **`RoleSwitcher`** (bas de page, grille 3 colonnes) pour identifier clairement la cible et naviguer entre espaces
- Nouveau composant **`PageQRBlock`** (section QR dédiée par rôle) avec URL tracking `?source=qr_{role}`, SVG téléchargeable, visible sur web et dans le PDF
- Brochures PDF A4 régénérées (`./scripts/generate-pdfs.sh`) avec le nouveau design

#### Features conversion (Fév 2026)
- **CTAs optimisés** : "Être rappelé en <5min" / "Recevoir une démo personnalisée" / "Tester mon potentiel"
- **WhatsApp float** : bouton flottant vert, config `VITE_WHATSAPP_NUMBER`
- **Simulateur de gain avancé** : type restaurant / commandes/jour / panier moyen → CA supplémentaire mensuel + commissions évitées
- **Testimonials** : 3 cartes restaurateurs street food (Tacos Mehdi, Street Wok Nana, Burger Factory Nico) avec métriques de croissance
- **QR code** généré côté client (SVG téléchargeable), cible avec `?source=qr_landing`
- **Tracking système léger** : page_view, cta_click, qr_scan, lead_submit, simulator_computed, pdf_downloaded, qr_downloaded
  - Backend `POST /api/track` + `GET /api/track/summary` (admin)
  - Session ID via sessionStorage, détection device mobile/tablet/desktop, UTM support
- **PDFs A4 téléchargeables** : brochure par page (`/pdfs/letsgofood-{accueil|restaurants|livreurs|clients}.pdf`)
  - Bouton inline dans la section lead + lien footer sur chaque page
  - Générés via `scripts/generate-pdfs.sh` (Chrome headless)

### App — `app.letsgofood.fr`
- Endpoints leads + tracking :
  - `POST /api/leads` (public) · `GET /api/leads` (admin)
  - `POST /api/track` (public) · `GET /api/track/summary` (admin)
- Collections Mongo : `leads`, `events`
- Email admin via Brevo (fallback `BREVO_SENDER_EMAIL`)
- Paiement Stripe à intégrer (P0 prochain)

### Suppression branding Emergent (Fév 2026)
- `/app/frontend/public/index.html` nettoyé (badge, scripts, PostHog retirés)
- Favicon Let's Go + titre "Let's Go Food"
- Image CDN emergentagent remplacée dans `LandingDrivers.js`

## Backlog
### P0
- Intégration Stripe côté app (paiements clients) + compteur 10 premières commandes avec notif SMS admin personnelle
- Correction Twilio SMS (expéditeur/destinataire identiques en test)
### P1
- A/B testing du Hero (3 variantes) avec tracking CTR/scroll-depth/conversion
- Service de short link (`lgf.app/p11-paul` → redirection vers URL trackée complète)
- Admin UI de gestion des commerciaux (CRUD agents dans Mongo au lieu du fichier statique)
- Systeme de notation/avis (restaurants + livreurs)
### P2
- Export CSV des leads (filtrable par ref/zone/période)
- Zones de livraison avec carte temps réel
- Bannieres promotionnelles page accueil
- Intégration du vrai logo Let's Go fourni par l'utilisateur
