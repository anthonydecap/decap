# CLAUDE.md — decap website + webshop

Two parts in one repo, two owners (Decap-System, README "Eigenaars", 2026-11-07):

- **Website** (Prismic, `content/`, `customtypes/`, `src/slices/`, the public pages): **Anthony**.
- **Webshop** (`src/app/(shop)`, `src/app/admin`, `src/app/api/shop|admin|stripe`, `src/shop` / shop services, `prisma/`):
  **Tony + Claude**. Do not change the other part without asking its owner.

## Webshop: security rules (hard limits — contract C7 in TD-organ/Decap-System)

1. **No secret key online.** The Decap signing key, the escrow key and the song content keys (`nummers.txt`) stay offline
   in Tony's vault. Never in Vercel env, Neon, Blob, git or a chat.
2. The shop stores only **public** player data (player ID, public key) and files that are **already encrypted or signed**
   (`.dvo`, `.decaplic`).
3. Readable masters (MIDI/audio) only in the **private** Blob store; customers only ever get `.dvo`.
4. Every download goes through an API route that checks **Auth0 session + right**; never a raw Blob URL in a page.
5. The shop never creates licences or encrypts content itself: it keeps the **licence queue**; Tony signs offline (`decaplic`).

Player registration = upload of the player's `.decapreq`; check `id == hex(BLAKE2b-128(publicKey))` (see C7 §1).

## Running locally (Windows)

- `.env` (git-ignored) holds the dev credentials. The shop reads ONLY `SHOP_DATABASE_URL` (not `DATABASE_URL`); Vercel needs
  it too, plus `SHOP_UPLOAD_TICKET_SECRET`, `SHOP_ACTIVATION_KEY_SECRET`, `APP_BASE_URL` (see `.env.example`).
  Vercel does NOT run migrations: `npm run shop:deploy-migrations` against the database Vercel uses. There is no production yet; all data is test data.
- Tests use their own database: `SHOP_TEST_DATABASE_URL` (must contain "test"; Neon database `decap_shop_test`).
  Vitest does not read `.env`: run with the variables loaded, e.g. in Git Bash `set -a; . ./.env; set +a; npm test`.
- Baseline 2026-11-07: `npm test` 147/147, `tsc --noEmit` clean, `next build` OK (one lint error in a website slice).
- `next build` fetches Prismic; on a flaky connection set `NODE_OPTIONS=--dns-result-order=ipv4first`.
- Schema changes only via Prisma migrations in the repo (`npm run shop:migrate`), never by hand in the database.

## Before production (checklist — do not go live without it)

- Auth0: the **Default App** (customer login, its secret is also in Vercel) has ALL Management API rights, granted
  temporarily during development (Tony, 2026-11-07). Remove that grant; give automation its own Machine-to-Machine app
  with only `read/create/update/delete:users` (`AUTH0_MGMT_CLIENT_ID` / `AUTH0_MGMT_CLIENT_SECRET`).
- Rotate every secret that was pasted in a chat (Neon, Blob, Stripe, Auth0, Sendcloud, Resend).
- Staff MFA was removed from the shop on purpose (Tony, 2026-11-07). If it is wanted again, enforce it in Auth0
  (tenant MFA policy), not in the shop code.
- Delete the e2e test users (`e2e-*@decapremote.com`) or move testing to a separate Auth0 tenant.
