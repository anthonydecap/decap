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
- **The webhook fulfills.** Configure an endpoint at `https://<domain>/api/stripe/webhook` with events
  `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `refund.created`, `refund.updated`, `refund.failed`, `charge.refunded`.
- **Local development:** run `npm run shop:stripe` next to `npm run dev`. It forwards Stripe events to
  `localhost:3000/api/stripe/webhook`; its signing secret is the `STRIPE_WEBHOOK_SECRET` in `.env`.
- **Safety net for missed webhooks:** the server asks Stripe directly (never trusting the browser) when the
  customer returns from payment, before a new checkout cancels older pending orders, and when staff open an
  order. A paid order is fulfilled, never cancelled. `npm run shop:reconcile-payments` checks all pending orders.
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
API should authenticate the customer, resolve the exact player from its `registrationIdentifier`, check it belongs
to the customer and is ACTIVE, and return / deliver only that player's ACTIVE music licenses
(`authorizeDelivery` in `encoding.ts`, `playerLibrary` in `music-licenses.ts`). An account-level entitlement never
authorizes delivery on its own.

Refunds and revocations stop future delivery. A file already delivered to an offline device cannot be erased remotely.

## Phase 2: CRM, players, staff and support

| Area | Where |
|---|---|
| Customer profile (individual / business, VAT, billing address) | `/{lang}/shop/account/profile`; collected at onboarding; required before checkout |
| Order billing snapshot | written with every order (`OrderBillingSnapshot`), never recomputed |
| Customer support | `/{lang}/shop/account/support` (new request, conversation, attachments) |
| Staff support inbox | `/admin/shop/support` |
| CRM workspace | `/admin/shop/customers/{id}` (overview, contact and billing, players, orders, library, support, notes and activity, tasks, documents) |
| Tasks | `/admin/shop/tasks` and the dashboard |
| Staff and invitations | `/admin/shop/staff` (SUPER_ADMIN) |

- **Roles:** SUPER_ADMIN, ADMIN, SUPPORT, CATALOG_MANAGER, FINANCE, mapped to capabilities in `src/modules/shop/auth/session.ts`. Every route checks its capability server-side.
- **First SUPER_ADMIN:** `npm run shop:staff -- --sub "<auth0 user_id>" --role SUPER_ADMIN`. Everything after that is done in `/admin/shop/staff`.
- **Invitations:** a SUPER_ADMIN invites an email address; the person signs in with their own Auth0 account and accepts at the link. Access is only created when their *verified* email matches. Links expire after 7 days; only a hash of the token is stored.
- **Activation keys** are encrypted with `SHOP_ACTIVATION_KEY_SECRET` (AES-256-GCM), revealed only through an explicit, audited action, never shown to customers.
- **Attachments and documents** live in private `support/` and `documents/` namespaces, separate from music. Allowed: PDF, JPEG, PNG, WebP, text and MIDI, at most 4 MB per message (serverless request limit).
- **Email** is notification only: set `RESEND_API_KEY` and `SHOP_EMAIL_FROM` to send real mail; otherwise messages are logged and invitation links are shown in the admin for manual sharing. Replies happen in the account, never by email.

## Phase 3: software downloads, licenses and activation

| Area | Where |
|---|---|
| Public software pages | `/{lang}/software`, `/{lang}/software/{slug}` (old WordPress links can redirect to `/software/dmi-player`, which forwards to `/en/...`) |
| Download | `/api/shop/software/{slug}/download`: sign-in required; records a download and redirects to a 5-minute signed URL |
| Customer hub | `/{lang}/shop/account/software` and `/{slug}`: status, re-download, enter registration code, reveal/copy activation key |
| Admin | `/admin/shop/software` (products + releases), `/activations` (queue), `/licenses`, `/downloads`; CRM customer Software tab |

- **Separate concepts:** a download is not a license; a license (`LIC-n`) is the right to use the product; an activation request (`ACT-n`) is a submitted registration code; an installation is an approved, activated machine with its encrypted activation key.
- **Buying:** licenses use the normal cart and Stripe checkout. The license is created by the webhook only, as *pending activation*, and the customer is guided to submit the code from the software.
- **Manual activation:** staff copy the registration code into the proprietary EXE (outside this system), paste the resulting key and approve. The key is encrypted (`SHOP_ACTIVATION_KEY_SECRET`), never emailed or logged, and revealed only on explicit request by the owner or by staff with `software:activation-key`. Each request also creates a CRM task.
- **Conflicts and replacements:** a code already active elsewhere is flagged for review; moving it from another customer needs a SUPER_ADMIN. Replacing a computer retires the old installation; history is never overwritten.
- **Releases** are immutable (new version = new row + new private key). Upload verifies size, SHA-256 and the installer signature (EXE/MSI/ZIP/PKG) and creates a draft; *publish* and *mark current* are separate actions. Nothing uploaded is executed.
- **Refunds** revoke the license and block new activations; orders and installation history are kept. Already activated offline copies keep their local license state.
- **RegisteredPlayer** (Phase 2) stays the registry of physical DMI players; a software installation can optionally point at the player it runs on.

## Phase 4: player-bound music licensing

**A player is software.** Software is bought, downloaded and activated the same way for every
product (Virtual Orchestrion €899, MIDI Mapper €150 in the seed). A product that a music-capable
player type points at (Virtual Orchestrion) is a *player program*: every activated copy becomes a
player automatically (`services/player-sync.ts`), and the music a customer buys is licensed to it.
Retiring / suspending / refunding the installation does the same to the player; an approved
computer replacement moves its music. MIDI Mapper is a tool and never receives music. Music can
only be bought signed in and for an active player (`allowAssignLater` is off by default); without
one, the shop shows what to get or finish activating instead of an Add button.

Music is licensed **per registered player**. `Entitlement` stays the account's acquisition history (purchase,
bundle, grant, legacy); `MusicLicense` is the right to deliver one arrangement to one player. Delivery, the
player library, duplicate checks and pricing read `MusicLicense` only.

| Area | Where |
|---|---|
| Customer | `/{lang}/shop/account` (My DMI), `/account/players/{id}`, `/account/players/{id}/music`, `/account/music`, `/{lang}/shop/help/music-licensing` |
| Shopping | "Buying music for" player context (cookie `dmi_player`, `?player=`), player-aware cards, product, collection, cart (grouped per player) and checkout |
| Admin | `/admin/shop/players`, `/admin/shop/players/{id}`, `/admin/shop/music`, `/admin/shop/music/transfers`, `/admin/shop/music/migration`, `/admin/shop/settings/music-policy`, CRM customer Players and Music tabs |
| Services | `services/music-licenses.ts` (players as targets, licenses, grants, assignment, starter music), `music-transfers.ts` (move / copy / replace / ownership), `music-shop.ts` (storefront context), `music-admin.ts`, `music-policy.ts` |

- **One live license per player + arrangement** (partial unique index). History rows (RETIRED / REVOKED) are never deleted; moves create a continuation row (`originalMusicLicenseId`) plus `MusicLicenseEvent`s and one `MusicLicenseTransfer` (`TRF-n`).
- **Cart:** each music line has a target player. One eligible player: chosen automatically. Several: the customer must choose. None: "assign later" when the policy allows it (the license is `UNASSIGNED` and the customer places it once; after that only staff can move it). Free music goes through the same fulfillment without Stripe.
- **Pricing:** per player. Already on that player = excluded; on another of the customer's players (or bought for another player in the same cart) = additional-player price; not compatible with the player type's system profiles = not sold. Collections complete per player. Royalties use the amount actually paid.
- **Policy** (`ShopSetting music.policy`, edited in the admin): additional-player strategy (`NO_DISCOUNT` default, percentage or fixed price), allow assign later, require an active software license for music, resale policy (`ADMIN_DECIDES` default), replacement policy (`MANUAL_DECISION` default). No transfer fee is charged yet.
- **Staff workflows** (customers cannot self-transfer): replace player (library moves, old RETIRED, new ACTIVE), transfer library (MOVE, or COPY = unpaid additional licenses that need `music:grant` and a reason), move a player to another customer (library follows the resale policy), grant music to a player, revoke a license. All audited and on the CRM timeline. Offline copies already delivered are not erased by any of these.
- **Starter music:** a player type can name a starter collection; activating a player of that type licenses it once (`PLAYER_STARTER_PACK`, no order).
- **Player types:** `supportsMusicLibrary` (MIDI Mapper style tools off), linked software product, starter collection, compatible system profiles (none = everything is compatible).

### Legacy migration

```bash
npm run shop:migrate-music              # dry run: report only, writes nothing (JSON report in the repo root, git-ignored)
npm run shop:migrate-music -- --apply   # idempotent; re-running creates nothing new
```

Rules: one eligible ACTIVE player = licensed to it (`LEGACY_MIGRATION`); several players = a player-bound delivery
artifact for exactly one of them decides, otherwise **needs review** (never guessed); no player = waiting, and the
music lands on the customer's first player when it is activated. Review items are resolved in
`/admin/shop/music/migration`. Take a Neon backup / branch before `--apply` on production.

Applied to the Neon database on 2026-10-12 (1 customer, 2 legacy purchases, both assigned). On 2026-10-13 the Neon
shop database was reset and reseeded for the player-is-software model (CSV backup of every table taken first).

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
