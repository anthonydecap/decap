# DMI Music Shop

Digital arrangements for self-playing instruments, sold from this site. The shop is an isolated
subsystem: it does not read from or write to Prismic. Specification: [DMI-Shop-AI-Coder-Prompt.md](DMI-Shop-AI-Coder-Prompt.md).
Visual design follows [DESIGN.md](DESIGN.md) / [BRAND_STYLE.md](BRAND_STYLE.md) (Light theme, no gradient).

## Where things live

| Area | Path |
|---|---|
| Database schema + migrations | `prisma/schema.prisma`, `prisma/migrations/` |
| Pure domain logic (pricing, bundle allocation, royalties, publish rules, MIDI parser, import plan) | `src/modules/shop/domain/` |
| Services (catalog, cart, checkout, fulfillment, refunds, entitlements, assets, imports, encoding, audit) | `src/modules/shop/services/` |
| Auth0 + customer/staff mapping, permissions | `src/modules/shop/auth/` |
| Storage port + Vercel Blob / local / memory drivers | `src/modules/shop/storage/` |
| Storefront | `src/app/[lang]/shop/**` (`/en/shop`, `/fr/shop`) |
| Admin | `src/app/admin/shop/**` |
| APIs | `src/app/api/shop/**`, `src/app/api/admin/shop/**`, `src/app/api/stripe/webhook` |
| Auth0 routes | `/auth/login`, `/auth/logout`, `/auth/callback` (mounted in `src/proxy.ts`) |
| Tests | `tests/unit`, `tests/integration`, `tests/e2e` |

The storefront lives under the locale prefix (`/en/shop`) like the rest of the site; `/shop` redirects there.

## Local setup

```bash
npm install                                # also runs `prisma generate`
createdb decap_shop && createdb decap_shop_test
cp .env.example .env.local                 # fill in, see below
npm run shop:migrate                       # apply migrations to SHOP_DATABASE_URL
npm run shop:seed                          # sample catalog (generated MIDI, no copyrighted files)
npm run next:dev
npm run stripe:listen                      # second terminal: forwards webhooks, prints STRIPE_WEBHOOK_SECRET
```

Minimal `.env.local` for development:

```
SHOP_DATABASE_URL="postgresql://<you>@localhost:5432/decap_shop"
SHOP_STORAGE_DRIVER="local"                # files go to .shop-storage/ (gitignored)
SHOP_UPLOAD_TICKET_SECRET="<openssl rand -hex 32>"
STRIPE_WEBHOOK_SECRET="whsec_…"            # from `npm run stripe:listen`
```

Give yourself admin access (find your `user_id` in Auth0 → User Management → Users):

```bash
npm run shop:staff -- --sub "auth0|xxxxxxxx" --role ADMIN --name "Your Name"
```

Roles: `ADMIN` (everything), `CATALOG_MANAGER` (catalog, files, imports), `FINANCE` (orders, refunds, customers, royalties).

## Auth0

1. Application type **Regular Web Application**.
2. Allowed Callback URLs: `http://localhost:3000/auth/callback`, `https://<domain>/auth/callback`.
   Allowed Logout URLs: `http://localhost:3000`, `https://<domain>`.
3. A **Database connection** (email + password) enabled for the app. Auth0 handles passwords, reset and email verification. Checkout requires `email_verified = true`.
4. **MFA for staff:** enable MFA in the tenant and add a Post-Login Action that requires it for staff users (for example by role or app metadata). The admin login link asks for MFA via `acr_values`, and the server rejects staff sessions without `amr: ["mfa"]` in production (`SHOP_REQUIRE_STAFF_MFA`).
5. Terms/Privacy acceptance is recorded locally at `/{lang}/shop/account/onboarding`; bumping `SHOP_TERMS_VERSION` / `SHOP_PRIVACY_VERSION` asks everyone to accept again before their next checkout.

Customers and staff are linked to Auth0 by the `sub` claim only, never by email.

## Stripe (test mode)

- Embedded Payment Element + PaymentIntents. The server reprices the cart and snapshots an immutable order before creating the intent.
- **Only the webhook fulfills.** Configure an endpoint at `https://<domain>/api/stripe/webhook` with events
  `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `refund.created`, `refund.updated`, `refund.failed`, `charge.refunded`.
- Test card `4242 4242 4242 4242`, any future date, any CVC. `4000 0025 0000 3155` triggers 3-D Secure.
- Live keys are refused unless `SHOP_ALLOW_LIVE_STRIPE=true`.
- **Not handled yet:** VAT/OSS calculation for EU digital sales. Prices are shown "VAT included where applicable". Stripe Tax can be added to the PaymentIntent step when you are ready.

## Vercel Blob (production storage)

**Current setup: one private store** linked to the project (`BLOB_STORE_ID` + `BLOB_READ_WRITE_TOKEN`).
All three roles below share it under the `masters/`, `deliveries/` and `previews/` prefixes; because the store is
private, Vercel itself refuses public writes, and previews are served through short-lived signed URLs.

Optionally, split into **three** stores later:

| Store | Access | Holds |
|---|---|---|
| `masters` | **Private** | canonical SOURCE_MIDI / DMI / audio / video masters, rights documents |
| `deliveries` | **Private** | generated device-bound DMI files (future player) |
| `previews` | Public (or private + `SHOP_PREVIEWS_ACCESS=private`) | cover art, short previews |

Set `BLOB_<STORE>_STORE_ID` for each (production uses Vercel OIDC, no long-lived tokens), plus
`BLOB_PREVIEWS_PUBLIC_BASE_URL`. For local work against real Blob use the `BLOB_<STORE>_READ_WRITE_TOKEN` variables.

How uploads work: the admin asks the server for an upload; the server creates an `UPLOADING` AssetVersion
with a random key and returns a signed **ticket** (5 to 15 minutes, one pathname, one content type, exact size).
The browser calls `uploadPresigned`, whose handshake (`/api/admin/shop/uploads/blob`) re-checks the staff
session and ticket and mints a PUT-only Blob token for that single path. Finalize then verifies existence, size,
magic bytes, SHA-256 and MIDI structure before the version can become `VALID`. Nothing is ever overwritten;
replacing a master is a new version plus an explicit "Make active".

Keep an independent backup/export of the `masters` store; version history in the database is not a backup.

## Bulk import

`/admin/shop/imports` → New import: optional metadata CSV (download the template from the imports page) plus
files or a whole folder. The dry run shows new drafts, matched SKUs, unmatched files, duplicates (name and
checksum) and missing references before anything is created. Uploads run in a bounded queue (1 to 6 at a time);
each file is verified on its own, failures are retried individually, and a reload can be resumed by re-selecting
the files. Apply creates **DRAFT** arrangements only; publishing still goes through the publish checks.

## Device-bound delivery (next phase)

`EncodingJob`, `DeliveryArtifact` and `ProtectionProfile` are modelled and `src/modules/shop/services/encoding.ts`
runs jobs through an `EncoderAdapter` (wrap the existing encoder EXE in a worker that implements it). Output is
written only to the `deliveries` store. There are deliberately **no** `/api/player/*` routes yet; the future player
API should authenticate the device (Auth0 Device Authorization Flow), check the ACTIVE entitlement, then issue a
short-lived download URL for the matching artifact.

Refunds and revocations stop future delivery. A file already delivered to an offline device cannot be erased remotely.

## Tests

```bash
npm test                 # unit + integration (needs local Postgres; uses decap_shop_test)
npx playwright install chromium
npm run test:e2e         # against a running server; purchase/admin specs need E2E_* Auth0 test users
```

## Deploying

1. Set all variables from `.env.example` in Vercel (Production + Preview), with a **separate** Postgres for the shop.
2. `npm run shop:deploy-migrations` (uses `SHOP_DATABASE_URL_UNPOOLED`, the direct Neon connection).
3. Register the Stripe webhook endpoint and set `STRIPE_WEBHOOK_SECRET`.
4. Add a "Shop" link to the site navigation in Prismic (Settings → navigation) pointing to `/en/shop`.
