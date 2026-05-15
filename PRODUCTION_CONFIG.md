# LetsGoFood Production DNS & Secret Management

## 1. DNS Routing Table (Subdomains)
Configure these records in your DNS provider (Cloudflare/Google Domains):

| Type  | Name      | Content / Destination              | Purpose               |
|-------|-----------|------------------------------------|-----------------------|
| CNAME | `www`     | `cname.vercel-dns.com`            | Landing Page          |
| CNAME | `app`     | `cname.vercel-dns.com`            | Client Orders App     |
| CNAME | `merchant`| `cname.vercel-dns.com`            | Merchant Dashboard   |
| CNAME | `driver`  | `cname.vercel-dns.com`            | Driver Dispatch      |
| A     | `api`     | `[Cloud Run Static IP]`           | Unified Backend API   |
| TXT   | `@`       | `v=spf1 include:_spf.google.com ~all` | Email Security (SPF) |

## 2. Secret Manager Integration (GCP)
Do not store production secrets in `.env`. Use Google Secret Manager:

1. **Create Secrets**:
   - `prod_gemini_key`
   - `prod_jwt_secret`
   - `prod_firebase_sa` (Service Account JSON)

2. **Mount in Cloud Run**:
   In the Cloud Run Console, map Environment Variables to Secrets:
   - `GEMINI_API_KEY` -> `prod_gemini_key:latest`
   - `JWT_SECRET` -> `prod_jwt_secret:latest`

3. **IAM Permissions**:
   Ensure the Cloud Run Service Account has `Secret Manager Secret Accessor` role.
