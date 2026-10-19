# DMI Music Shop — FINAL Master AI Coder Prompt (Auth0 + Entitlements + Vercel Blob)

You are implementing a production-quality DMI Music Shop inside an existing Next.js + TypeScript repository.

## IMPORTANT CONTEXT
- The existing site uses Prismic, but Prismic is completely unrelated to the shop. Do not put shop products, prices, users, orders, files, bundles or commerce data in Prismic. Do not create Prismic synchronization.
- Build the shop in the same repository as an isolated subsystem/module.
- Do NOT implement the player/device API in this task. Do design the database and secure file pipeline so the player API can be added later without redesigning commerce.
- The shop sells digital music ARRANGEMENTS for self-playing instruments. An Arrangement is the atomic licensed item. A Bundle/Collection is a discounted grouping of Arrangements.
- Purchasing a Bundle MUST grant an Entitlement to each included missing Arrangement.
- Customers must not accidentally pay twice for Arrangements they already have an ACTIVE Entitlement for. **Complete-the-collection pricing is required**: charge only for missing Arrangements using the bundle allocation algorithm below.
- Original MIDI/DMI/audio/video files are valuable private masters. Customers must NEVER receive these canonical masters directly.
- Customer/player DMI files will ultimately be generated/encoded/encrypted for a specific authorized player/device. The platform must model this pipeline now, but the player API endpoints themselves are out of scope.

## MANDATORY STACK
- Existing Next.js App Router + TypeScript conventions where present.
- PostgreSQL.
- Prisma ORM and migrations.
- Auth0 for authentication. Use Auth0 Universal Login and the current Auth0 Next.js SDK compatible with the repository's Next.js version. Do not hand-roll password hashing, verification, password reset or session management.
- PostgreSQL remains authoritative for business-side Customer, StaffAccount, Entitlement, order and authorization records. Link local records to Auth0 using the stable Auth0 `sub` claim stored as `authSubject`; do not use email as the identity key.
- Stripe in TEST/SANDBOX mode.
- Embedded on-site checkout using Stripe Payment Element + PaymentIntents. DO NOT use Stripe-hosted Checkout.
- Stripe webhook is the authority for paid fulfillment. Browser redirects/callbacks are never proof of payment.
- Vercel Blob as the initial object-storage implementation. Use **separate stores**: a Private Blob master store for canonical source MIDI/DMI/audio/video assets, a Private Blob delivery store for generated device-bound DMI artifacts, and a public (or deliberately signed/private) preview store for safe previews/artwork.
- Put Vercel Blob behind a small `StorageService` abstraction so the domain/database do not depend on Vercel URLs and can later move to S3/R2 without redesigning catalog, orders or entitlements.
- Production on Vercel should prefer Vercel/OIDC-backed server access to Private Blob where supported; browser access is granted only through short-lived operation/path-scoped signed URLs.
- Zod for request validation.

## ARCHITECTURE
Create a shop domain under `src/modules/shop` (adapt to existing repo aliases/conventions) and routes under `/shop`, `/account`, `/admin/shop` and `/api/shop`. Keep pricing, entitlement, publishing, refund, royalty and storage logic in services/domain functions, not React components.

Define a storage port such as `StorageService` with server-only methods similar to `createUploadUrl`, `head`, `createDownloadUrl`, `delete`/lifecycle operations and metadata lookup. Implement it initially with `VercelBlobStorageService`. Business rows store `storageProvider` + provider pathname/object key, not a permanent signed URL.

Auth0 owns authentication identity. The shop database owns business identity and authorization:

```text
Auth0 user (`sub`)
       |
       +--> Customer.authSubject  --> orders / entitlements / library
       |
       +--> StaffAccount.authSubject --> ADMIN / CATALOG_MANAGER / FINANCE
```

On first successful authentication, server-side code must upsert/find the local Customer by Auth0 `sub`. Email/name may be copied/synchronized as profile data but are not the stable key.

## AUTH0 REQUIREMENTS
- Use Auth0 Universal Login for signup/login/logout.
- Configure an Auth0 Database Connection for email/password accounts unless the existing tenant has a deliberate alternative.
- Auth0 handles credential storage, password recovery and email verification.
- Require `email_verified=true` before checkout preparation.
- If Terms/Privacy acceptance is not captured in Auth0, redirect first-time authenticated users to a local `/account/onboarding` step and require current legal acceptance before checkout.
- Do not store password hashes, password reset tokens or a second custom session system in PostgreSQL.
- Protect `/account`, checkout server actions/endpoints and all `/admin/shop` operations server-side.
- Staff authorization is local: `StaffAccount` is keyed by `authSubject`. Do not rely only on hidden UI or client-side role checks.
- Require MFA for staff/admin accounts in production through Auth0 policy/configuration.
- Keep the future player in mind: Auth0 Device Authorization Flow can later authenticate the player as a public/native client, but do NOT implement player routes in this task.

## DATA MODEL
Implement normalized Prisma models for at least:

### Identity/business profile
- `Customer`: id UUID, `authSubject` unique, email, firstName, lastName, countryCode, preferredCurrency, `stripeCustomerId?`, onboarding/legal state, timestamps.
- `StaffAccount`: id, `authSubject` unique, role, active, timestamps.
- `LegalAcceptance`: customerId, document type/version, acceptedAt, and only legally appropriate audit metadata.

### Music/catalog
- `Work` (underlying song/composition).
- `Arranger`.
- Genre/tag.
- `SystemProfile` and `ArrangementCompatibility`.
- `Arrangement`: id, SKU, work, displayTitle, subtitle, slug, arranger, description, status, currency, priceCents, duration, tempo/key/time signature/difficulty, release/published dates, featured, search keywords, compatibility notes, containsMidi/Audio/Video flags, DMI format version, internal notes, timestamps.
- Rights/compliance state: rightsStatus, territory/license reference/dates/notes/proof asset/review info. Do not make legal conclusions; this is workflow data.

### Master assets
- `Asset` and immutable `AssetVersion`.
- Asset kinds: `SOURCE_MIDI`, `SOURCE_DMI`, `SOURCE_AUDIO`, `SOURCE_VIDEO`, `PREVIEW_AUDIO`, `PREVIEW_VIDEO`, `COVER_IMAGE`, `DOCUMENT`.
- `AssetVersion`: id, assetId, version number, originalFilename (admin metadata only), generated private storage key, MIME, bytes, SHA-256, validation status/errors, uploader staff ID, uploadedAt, active/superseded state, technical metadata JSON.
- Every new upload creates a new immutable AssetVersion. Never overwrite a master in place.
- MIDI technical metadata should support format type, track count, PPQ, tempo/time/key signature data, SysEx presence, program/channel usage, duration, markers/lyrics. Parse safely when feasible and allow admin correction of curated storefront fields.

### Bulk import
- `ImportBatch`: id, createdByStaffId, status `DRAFT|UPLOADING|VALIDATING|REVIEW_REQUIRED|READY|COMPLETED|FAILED`, totalItems, uploadedItems, validItems, failedItems, createdAt, completedAt.
- `ImportBatchItem`: id, importBatchId, originalFilename, detectedAssetKind?, targetArrangementId?, targetSku?, blobPathname?, bytes?, sha256?, status `QUEUED|UPLOADING|UPLOADED|VALIDATING|READY|NEEDS_REVIEW|FAILED`, validation errors/warnings JSON, matched metadata row?, resultingAssetVersionId?, timestamps.
- Optional `ImportMetadataRow` JSON snapshot or equivalent parsed-row representation so the exact CSV/XLSX row used for an import remains auditable.
- Bulk import is not one giant database transaction. Each item progresses independently so failed files can be retried without re-uploading successful files.
- Never overwrite existing master versions during a bulk import. A replacement creates a new immutable AssetVersion and must be explicitly activated/reviewed.

### Device-bound delivery preparation
Player endpoints are out of scope, but model the protected-delivery pipeline:
- `ProtectionProfile`: version/name/config reference for the proprietary encoding/encryption scheme. Do not store raw cryptographic keys in ordinary DB fields.
- `EncodingJob`: id, arrangementId, sourceAssetVersionId, customerId, future deviceId/registration reference, encoderVersion, protectionProfileVersion, status `QUEUED|RUNNING|SUCCEEDED|FAILED`, attemptCount, sanitized errorCode/errorMessage, timestamps.
- `DeliveryArtifact`: id, arrangementId, sourceAssetVersionId, customerId, future deviceId/registration reference, encoderVersion, protectionProfileVersion, private outputObjectKey, bytes, SHA-256, createdAt, optional regeneratedFromArtifactId.
- A DeliveryArtifact is derived/private output, NOT the master.

### Commerce
- `Bundle` and `BundleItem` with ordered arrangement membership.
- `Cart` and `CartItem`.
- `Order`, `OrderItem` and `OrderItemAllocation` immutable financial snapshots.
- `Entitlement`: unique `(customerId, arrangementId)`, status `ACTIVE|REVOKED`, firstGrantedAt, updatedAt.
- `EntitlementSource`: each origin that grants the entitlement. Fields should include id, entitlementId, sourceType `PURCHASE|BUNDLE|ADMIN_GRANT|PROMOTION|LEGACY_IMPORT`, source reference/order allocation reference, grantedAt, revokedAt?, revokeReason?.
- `Refund`.
- `StripeEvent` idempotency table.
- `RoyaltyLedgerEntry` and optional `PayoutBatch`.
- `AuditLog`.
- Shop settings/feature flags if useful.

## ENTITLEMENT RULES
An Entitlement answers: **what Arrangement is this Customer allowed to use?** An Order answers: **how did they pay/acquire it?** Never make the future player reconstruct ownership from Order history.

Rules:
1. `(customerId, arrangementId)` is unique at the Entitlement level.
2. An Entitlement may have multiple EntitlementSource rows.
3. Buying an individual Arrangement adds a PURCHASE source.
4. Buying a Bundle adds a BUNDLE source for every newly acquired Arrangement allocation.
5. An admin grant adds an ADMIN_GRANT source; do not create fake paid orders.
6. Legacy imports add LEGACY_IMPORT sources.
7. Refund/revocation revokes only the affected EntitlementSource.
8. Entitlement remains ACTIVE while at least one valid source remains.
9. If no valid source remains, mark Entitlement REVOKED.
10. Customer library = all ACTIVE Entitlements joined to published/available arrangement metadata.

## MONEY
- Store monetary values as integer cents plus ISO currency code. Start with EUR.
- Never trust a client-provided price. Recompute server-side immediately before PaymentIntent creation.

## BUNDLE RULE
1. Load current published bundle items.
2. Exclude Arrangements for which the customer already has an ACTIVE Entitlement.
3. If none remain, reject purchase as `ALREADY_OWNED`.
4. Calculate each Arrangement's proportional share of normal retail value.
5. Allocate the configured bundle price proportionally.
6. Charge only the allocated price of missing items.
7. Round deterministically in cents and allocate any remainder predictably.
8. Snapshot exact arrangement/revenue/royalty allocation on the order so later bundle edits never change history.
9. If an individual Arrangement and a Bundle containing it are both in the cart, deduplicate and choose a coherent customer-friendly payable result.

## STOREFRONT
- `/shop` landing page: featured/new Arrangements and Collections, browse dimensions.
- Search by title, original artist, arranger, SKU and keywords.
- Filters: genre, arranger, artist/work, compatibility, price, era/year, MIDI/audio/video flags.
- Arrangement page: title/work, arranger, price, preview, duration, genre, compatibility, content flags, collections containing it, entitlement/owned state, add-to-cart.
- Bundle page: list items, normal total, bundle price/saving, owned markers, “you own X of Y”, calculated complete-collection price.
- Cart is server-authoritative; explain removed already-owned items and price changes.

## CHECKOUT
- Build `/shop/checkout` with `@stripe/react-stripe-js` Payment Element.
- `POST /api/shop/checkout/prepare` authenticates customer through Auth0, requires verified email + completed local onboarding/legal acceptance, reloads/reprices cart, validates publish state and ACTIVE Entitlements, creates a pending Order snapshot, then creates a Stripe PaymentIntent with internal order/customer identifiers in metadata and returns `client_secret`.
- Use `stripe.confirmPayment`; use `redirect='if_required'` where appropriate while keeping a return URL for payment methods requiring redirect.
- Implement `/api/stripe/webhook` using raw body signature verification.
- Record every Stripe event ID and make handler idempotent.
- `payment_intent.succeeded` transaction: lock/load order; if already fulfilled exit safely; mark paid; create/upsert Entitlement rows and EntitlementSource rows from the immutable allocations; create royalty ledger entries; mark fulfilled; enqueue/send receipt.
- Success page reads server order state; it never fulfills payment.

## ADMIN
Create protected `/admin/shop` UI:
- Dashboard metrics/recent activity.
- Work CRUD.
- Arranger CRUD incl. default royalty basis/rate.
- Compatibility profile CRUD.
- Arrangement CRUD with publishing validator.
- Arrangement `Files` tab for canonical source/master uploads, preview uploads, immutable version history, active-version selection, validation status and audited secure admin re-download when needed.
- Bundle CRUD with search/select/reorder arrangements, total value, bundle discount and publish validation.
- Orders: search/view/refund.
- Customers: search, view ACTIVE Entitlements/orders, manual grant/revoke with reason.
- Royalty report by arranger/date.
- Audit log.
- Optional encoder health/test page if the legacy encoder worker is available; never expose this publicly.
- **Bulk Import center** at `/admin/shop/imports`: drag/drop many files, folder selection where browser support permits it, optional metadata CSV, resumable/retryable upload queue, per-file progress, mapping/review screen, validation errors, and import history.
- Bulk import must support both: (a) attach files to existing Arrangements by SKU/mapping and (b) create new Arrangement drafts from metadata rows. Imported items are never auto-published; publish validation still applies.
- Provide a downloadable CSV template and a dry-run/preview step before creating new catalog records. Suggested columns: `sku`, `title`, `workTitle`, `originalArtist`, `arranger`, `price`, `currency`, `genre`, `compatibility`, `sourceMidiFilename`, `sourceDmiFilename`, `sourceAudioFilename`, `sourceVideoFilename`, `previewAudioFilename`, `previewVideoFilename`, `coverFilename`.
- Use a bounded client upload queue (target ~4–6 concurrent uploads, configurable). A user may select hundreds of files, but the browser must not attempt hundreds of simultaneous PUTs.
- Support “retry failed”, “revalidate”, “remap”, and “resume review” without restarting the entire batch.

## MASTER FILE VAULT — REQUIRED SECURITY DESIGN
The admin uploads original MIDI/DMI/audio/video files here. These originals are the canonical assets and must be strongly protected.

Required initial storage topology:
1. **Vercel Blob `masters` private store** — canonical SOURCE_* assets.
2. **Vercel Blob `deliveries` private store** — generated device-bound DMI outputs.
3. **Vercel Blob `previews` store** — public for deliberately public artwork/short previews, or private + signed GET if the product owner wants preview access controlled.

Do not store permanent Blob URLs as business identifiers. Store provider + pathname/object key and resolve access through `StorageService`.

Security rules:
- Create `masters` and `deliveries` as Private Blob stores. Never mint a public URL for objects in those stores.
- Never put masters under Next.js `/public`.
- Never return master object keys or raw private URLs in storefront/customer JSON.
- The application server and trusted encoder worker use least-privilege storage access. On Vercel, prefer short-lived OIDC-backed access for production server functions where supported rather than long-lived credentials.
- Use TLS in transit.
- Rely on Vercel Blob/provider-managed encryption at rest for storage transport/storage protection. DMI purchaser/device binding is a separate application-layer protection concern handled by the proprietary encoder; storage encryption is not a substitute for DMI protection.
- Application-level AssetVersion rows are immutable and every upload gets a new random Blob pathname. Maintain an independent backup/export/retention plan for valuable canonical masters; do not assume an overwritten pathname is your version history.
- Original filenames are stored only as admin metadata. Generated object keys use UUID/random identifiers and must not contain emails, customer names or registration numbers.
- Vercel Blob signed admin upload URLs must be short-lived (roughly 5–15 minutes), single-operation (`PUT`) and scoped to one generated pathname. Apply content-length/type constraints where supported. Never expose store credentials to the browser.
- Browser uploads directly to Vercel Blob using signed PUT URLs. Use multipart uploads for large media where appropriate; large source files must not be buffered through Next.js server memory.
- Finalization must verify the object exists, byte size/type/signature, checksum and safe parse results before AssetVersion can become VALID/ACTIVE.
- Optional admin master downloads must use short-lived signed URLs and be audit logged.
- A storage key or signed URL is never the business authorization check by itself.

## DEVICE-SPECIFIC DMI ENCODING / ENCRYPTION PIPELINE
The future customer download is NOT `SOURCE_MIDI` or `SOURCE_DMI`.

Conceptual flow:

```text
canonical SOURCE_MIDI / SOURCE_DMI AssetVersion
                  +
authorized customer + authorized player/device registration
                  +
encoder version + protection profile
                  |
                  v
        trusted encoder worker
                  |
                  v
 device-bound encrypted/protected DMI
                  |
                  v
      private DeliveryArtifact
```

Rules:
- The existing proprietary encoder EXE may be retained and wrapped behind an `EncodingService`/worker adapter. Do not reverse engineer it as part of this task.
- The EXE/algorithm is server/worker-side only. Never ship the encoder, command line or secrets to the browser.
- Master file access happens only from trusted back-end/worker identities.
- The worker should use an ephemeral workspace, fetch the selected immutable source AssetVersion, produce output, upload the output to `deliveries`, verify checksum, and delete temporary local files on success/failure.
- Do NOT use Auth0 `sub`, customer ID, order ID or a human-readable registration number directly as an encryption key. The legacy encoder may use registration number as a binding input, but cryptographic secrets remain protected server-side.
- Store cryptographic/protection secrets in KMS/secret manager or the encoder's protected configuration, never source control, normal DB text columns or `NEXT_PUBLIC_*` variables.
- Generated DeliveryArtifacts are private derived data. They may be cached by source-version/device/encoder-version tuple or regenerated later.
- A future player API may issue a short-lived download URL only after authenticating the customer, confirming an ACTIVE Entitlement, confirming the authorized device, and selecting/generating the correct DeliveryArtifact.
- Do not implement `/api/player/*` in this task.

## UPLOAD WORKFLOW
1. Admin creates/opens an Arrangement draft.
2. In the Files tab choose asset kind: SOURCE_MIDI, SOURCE_DMI, SOURCE_AUDIO, SOURCE_VIDEO, PREVIEW_AUDIO, PREVIEW_VIDEO, COVER_IMAGE.
3. Admin UI requests authenticated presign from server.
4. Server verifies StaffAccount permission, validates kind/type/size policy, creates an UPLOADING AssetVersion and generated object key in the correct bucket.
5. Browser uploads directly to storage.
6. Client calls finalize endpoint.
7. Server/worker HEADs/verifies object, validates signature/type/size/checksum, parses MIDI metadata where applicable, virus-scans generic documents/media where feasible, then marks VALID or INVALID.
8. Admin sees extracted metadata/errors and chooses the ACTIVE version.
9. Never overwrite the old version.
10. Publishing is blocked when required master/metadata validation fails.


## BULK IMPORT WORKFLOW — MVP REQUIREMENT
1. Admin creates a new ImportBatch and selects files (multi-select and folder selection where supported) and optionally a metadata CSV.
2. Server parses/validates the CSV schema, normalizes rows, and returns a dry-run summary: new Arrangement drafts, matched existing SKUs, unmatched files, duplicate filenames/checksums, invalid rows and warnings.
3. Admin confirms the dry run. For each accepted file the server creates an ImportBatchItem plus an UPLOADING AssetVersion (when the target arrangement is known) and returns a short-lived Vercel Blob signed PUT URL/path.
4. Browser uploads directly to the correct Blob store using a bounded queue. Track progress per item. Use multipart when appropriate for large audio/video.
5. Each successful upload is finalized independently. The server verifies the private object, size/type/checksum, parses MIDI metadata where applicable, and updates ImportBatchItem/AssetVersion status.
6. Mapping screen lets admin resolve unknown filenames, duplicate candidates, missing arranger/work/price/compatibility fields and validation failures.
7. If the CSV creates catalog items, create them as `DRAFT`; never publish automatically.
8. Batch reaches READY/COMPLETED only when all required items are valid or intentionally skipped. Failed items remain retryable.
9. Record an audit trail of who imported, mapped, activated versions and published resulting arrangements.
10. Do not accept arbitrary ZIP extraction as the primary bulk-import mechanism in V1; folder/multi-file + CSV is safer and easier to validate. If ZIP import is later added, defend against zip-slip, zip bombs and nested archives.

## PUBLISH VALIDATOR
Block `PUBLISHED` unless required Work, SKU/slug, arranger, price, at least one VALID playable master, compatibility/generic marker, acceptable rights workflow state and required preview policy are satisfied.

## REFUNDS
- Implement Stripe test refunds from admin.
- Full/item refunds create Refund + negative royalty ledger entries.
- Revoke only the EntitlementSource rows created by the refunded acquisition/allocation.
- Keep Entitlement ACTIVE if another valid source remains.
- Never delete paid Order history.
- A revoked server entitlement prevents future delivery/re-delivery, but a permanently offline already-generated file cannot be remotely erased; do not pretend otherwise.

## BULK IMPORT SERVER ACTIONS / ROUTES
Names may be adapted to repo conventions, but capabilities are required:
- `POST /api/admin/shop/imports` — create ImportBatch and optionally parse metadata manifest.
- `POST /api/admin/shop/imports/{id}/dry-run` — return mapping/validation plan without mutating catalog beyond staging rows.
- `POST /api/admin/shop/imports/{id}/items/presign` — issue scoped signed PUT URLs for selected ImportBatchItems after StaffAccount authorization.
- `POST /api/admin/shop/imports/{id}/items/{itemId}/finalize` — verify Blob object and run validation/metadata extraction.
- `PATCH /api/admin/shop/imports/{id}/items/{itemId}` — map/remap to SKU/Arrangement/asset kind and resolve warnings.
- `POST /api/admin/shop/imports/{id}/apply` — create/update DRAFT catalog records and attach valid AssetVersions according to the reviewed plan.
- `GET /api/admin/shop/imports/{id}` — batch status/details for resumable admin review.

## SECURITY
- Zod validate all mutations.
- Rate-limit login-sensitive shop endpoints, checkout preparation and upload presign/finalize.
- Verify Stripe webhook signatures.
- No Auth0/Stripe/storage/encoder secrets in logs.
- Prevent IDOR on order/account/admin resources.
- Audit sensitive admin actions, grants/revocations, refunds and master-file accesses.
- Vercel Blob master/delivery stores are private; no storefront/customer route may expose canonical master access.
- Do not expose raw master filenames/keys/hashes on storefront APIs.
- Server-side permission checks are mandatory even when routes/components are hidden.

## TESTS
Add unit tests for bundle allocation/rounding, cart dedupe, royalties, Entitlement/EntitlementSource behavior, refund source revocation, permission guards and publish validation.
Add integration tests for Auth0 session/user mapping (mocked/test-safe where necessary), checkout preparation, webhook signature/idempotency, fulfillment transaction, private upload presign/finalize, and refunds.
Add tests proving a customer cannot obtain a SOURCE_* master URL/key.
Add tests proving admin upload URLs are short-lived/scoped and non-admins cannot create them.
Add tests for bulk-import CSV parsing/dry-run, SKU/file mapping, bounded queue behavior at the UI/service layer, duplicate checksum handling, partial failure/retry, and proof that a failed item does not roll back successful batch items.
If the encoder worker adapter is available, test job state transitions and that output is written only as a DeliveryArtifact, not as a master.
Add Playwright flows for signup/login/onboarding, individual purchase, bundle purchase, partial-owned bundle completion purchase, admin catalog publish and unauthorized admin/order access.
Use Stripe test cards and document local webhook testing.

## ENVIRONMENT / SECRETS
Provide `.env.example` with names only, no real secrets. Expected groups:
- Auth0: domain, client ID, client secret, session secret/base URL values required by the installed Auth0 Next.js SDK.
- Database URL.
- Stripe secret/publishable keys + webhook secret.
- Vercel Blob store configuration. Production should use Vercel/OIDC-backed private-store access where available; local development may require server-only Blob credentials/tokens. Configure separate master, delivery and preview stores/identifiers. Never expose a Blob write credential in `NEXT_PUBLIC_*`.
- Transactional email provider values if needed outside Auth0.
- Encoder worker endpoint/queue/secret references if encoder integration is enabled.
Never put server secrets into `NEXT_PUBLIC_*` variables.

## SEED / DX
- Commit Prisma migrations.
- Add safe seed data: local Customer/StaffAccount test fixtures as appropriate, genres/profiles, sample catalog and bundles. Do not commit real copyrighted MIDI/DMI.
- Add README setup for Auth0 tenant/application configuration, local database, Stripe test/webhook, Vercel Blob private/public stores, local Blob development credentials if required, and optional encoder worker.

## WORKING METHOD
1. First inspect the existing repo: package manager, exact Next.js version/App Router structure, existing auth/database/component/testing conventions and environment handling.
2. Use the current Auth0 Next.js SDK integration pattern compatible with that exact Next.js version. Do not blindly copy legacy Auth0 v3 route/middleware examples into a newer app.
3. Reuse existing repo conventions where they satisfy this spec. Do not introduce duplicate frameworks.
4. If an existing auth/database layer conflicts with the mandatory choices, adapt carefully and avoid destructive migrations.
5. Implement in small coherent phases, keeping the app runnable.
6. Run typecheck, lint, unit/integration tests and relevant Playwright tests after each major phase.
7. Do not leave core checkout, webhook, entitlement, admin authorization or master-file security as TODOs.
8. Player API is out of scope. Do not create `/api/player` routes.

## DEFINITION OF DONE
The implementation is complete when:
- a new customer can authenticate/register through Auth0, satisfy email verification + local onboarding/legal acceptance, browse and preview the catalog, buy an individual Arrangement or Bundle through an embedded Stripe test-mode Payment Element, receive webhook-fulfilled Entitlements, and see ACTIVE Entitlements in their library;
- an ADMIN can manage Works/Arrangers/compatibility/Arrangements, upload/version private canonical MIDI/DMI/audio/video masters individually **and in bulk**, review/import batches, create Bundles, publish catalog items, inspect customers/orders/entitlements, issue a test refund and view royalty allocation;
- SOURCE_* masters are never publicly exposed or delivered to customers;
- an ADMIN can import a large catalog batch using multi-file/folder selection plus optional CSV, see per-file progress/errors, retry only failures, resolve mappings, and create DRAFT arrangements without exposing private masters;
- the database/storage model is ready to generate device-bound DeliveryArtifacts later through the proprietary encoder without changing the commerce model;
- automated tests cover the critical security and commerce flows.
