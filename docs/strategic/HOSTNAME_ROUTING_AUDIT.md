# 🔍 Hostname Routing Audit (Paris V1)

Ce rapport valide l'isolation stricte des applications par sous-domaine pour LetsGoFood.

---

## 🚦 1. MAPPING DE PRODUCTION

| Hostname | Application Rendu | Validation |
| :--- | :--- | :--- |
| `letsgofood.fr` | `LandingPage` | ✅ PASS |
| `app.letsgofood.fr` | `ClientStore` | ✅ PASS |
| `merchant.letsgofood.fr` | `MerchantPortal` | ✅ PASS |
| `driver.letsgofood.fr` | `DriverApp` | ✅ PASS |
| `admin.letsgofood.fr` | `AdminPortal` | ✅ PASS |
| `saas.letsgofood.fr` | `AdminPortal` | ✅ PASS |
| `crm.letsgofood.fr` | `AdminPortal` | ✅ PASS |

---

## 🛡️ 2. RÈGLES DE NORMALISATION (getAppType)

1. **Suppression WWW** : `www.app.letsgofood.fr` → `app.letsgofood.fr`
2. **Développement** : `localhost`, `vercel.app`, `stackblitz.io` → Mode Multi-routeur (accès via `/app`, `/merchant`, etc.)
3. **Fallback Strict** : Tout domaine `.letsgofood.fr` non listé ou domaine tiers → `UnauthorizedDomain`.

---

## 🔄 3. NAVIGATION INTER-DOMAINES

Pour éviter les fuites de contexte (ex: Landing essayant de naviguer vers `/merchant` via React Router alors que le Hostname est `letsgofood.fr`), une redirection par URL absolue a été implémentée :

- `navigate('/merchant')` → `window.location.href = 'https://merchant.letsgofood.fr/'`

---

## 📝 CONCLUSION SRE
L'isolation est désormais garantie au niveau applicatif. Toute requête sur un sous-domaine spécifique ne pourra charger QUE le bundle correspondant à ce domaine, éliminant le risque de "ClientApp omniprésente".
