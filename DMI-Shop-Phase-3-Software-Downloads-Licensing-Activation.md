# DMI Platform — Phase 3 Implementation
## Software Downloads, Trial Licensing, Activations & CRM Integration

Continue development of the existing DMI platform.

Phase 1 and Phase 2 are already implemented and working.

The platform has evolved from only a MIDI/DMI music store into:
- ecommerce platform
- customer account portal
- entitlement/music library
- CRM
- registered player management
- staff/admin management
- support ticketing system

This phase adds a new major domain: **SOFTWARE**.

Customers must be able to:
- browse our software
- create an account / sign in before downloading
- download software for free
- use software in trial mode
- purchase a permanent software license
- submit the registration code shown by installed software
- see activation progress
- receive notification when activation is ready
- retrieve/copy their activation key
- re-download current software versions later
- see all of their software and licenses in one intuitive account area

Admins/staff must be able to:
- create/manage software products
- upload new software releases
- manage versions
- see exactly which customers downloaded each software product
- see software history on the Customer CRM record
- see purchased licenses
- process pending activations
- enter/verify registration codes
- manually run the existing proprietary registration EXE externally
- enter generated activation keys
- approve/activate licenses
- suspend/revoke licenses where appropriate
- view software/installations/licenses per customer
- search by registration code
- see software activity in CRM timelines
- connect support tickets to software/licenses/installations

Do NOT automate the proprietary registration EXE in this phase.
Do NOT implement the future DMI Player API in this phase.
Do NOT replace Auth0.
Do NOT rewrite working Phase 1/2 functionality unnecessarily.

---

# 1. Core User Experience

User experience is a primary requirement.

The software workflow must feel simple to a non-technical customer.

```text
Browse Software
      ↓
Click Download
      ↓
Not logged in?
      ↓
Create Account / Sign In
      ↓
Return automatically to software
      ↓
Download installer
      ↓
Use software in Trial mode
      ↓
Optional: Buy License
      ↓
Payment successful
      ↓
License created
      ↓
"License purchased — activation required"
      ↓
Open installed software
      ↓
Copy Registration Code
      ↓
Submit Registration Code in account
      ↓
"Activation pending"
      ↓
Admin verifies request
      ↓
Admin runs proprietary registration EXE
      ↓
Admin enters Activation Key
      ↓
License becomes ACTIVE
      ↓
Customer receives email notification
      ↓
Customer opens account
      ↓
Copy Activation Key
      ↓
Enter key in software
      ↓
Software unlocked
```

The customer should always understand:
- What have I downloaded?
- Do I own a license?
- What do I need to do next?
- Are you waiting for me?
- Am I waiting for DMI?
- Is my license ready?
- Where do I find my activation key?

Avoid customer-facing internal terms like `SoftwareLicense entity`, `ActivationRequest`, `RegistrationIdentifier`, `manual fulfillment`, or storage terminology.

---

# 2. Software Is Separate from Music Arrangements

Do not model software as an Arrangement.

```text
MUSIC
    Work
    Arrangement
    Bundle
    Entitlement

SOFTWARE
    SoftwareProduct
    SoftwareRelease
    SoftwareDownload
    SoftwareLicense
    SoftwareActivationRequest
    SoftwareInstallation
```

They may share Customer, Order, Stripe, Billing, CRM, Support, Auth0, Vercel Blob, and AuditLog.

---

# 3. Software Product

Create:

```text
SoftwareProduct
id
slug
name
shortDescription
description
status
trialAvailable
licenseRequiredForFullUse
currentVersion?
licenseType
defaultLicensePriceCents?
currency?
coverImage?
icon?
sortOrder?
createdAt
updatedAt
publishedAt?
```

Statuses:
`DRAFT`, `ACTIVE`, `DISCONTINUED`, `ARCHIVED`.

Initial license type: `PERPETUAL`.

Initial software may include:
- DMI Player
- MIDI Mapper

Do not hard-code these names.

---

# 4. Public Software Catalog

Add:
- `/software`
- `/software/[slug]`

Anyone may browse software information without logging in.

The download itself requires authentication.

Example:

```text
DMI PLAYER

Play your DMI music library.

Current version
4.2.1

Windows 10 / 11

✓ Free download
✓ Trial mode included
✓ License available

[ Download Free ]
[ Buy License ]
```

---

# 5. Login Required for Download

Software installers must not have unrestricted public URLs.

If logged out and clicking Download:

```text
Create a free account to download DMI Player.

Your account also gives you access to:
• software downloads
• purchased licenses
• your music library
• registered software
• support

[ Create Account ]
[ Sign In ]
```

After signup/login, automatically return to the software page using a safe return URL.

No purchase is required for trial software.

---

# 6. Private Installer Storage

Use the existing Vercel Blob storage abstraction.

Suggested private namespace:

```text
software/
  products/
    software_product_id/
      releases/
        release_id/
          installer.exe
```

Do not place installers in `/public`.
Do not expose permanent unrestricted Blob URLs.

Download flow:

```text
Authenticated Customer
        ↓
Click Download
        ↓
Server validates Auth0 session
        ↓
Resolve Customer
        ↓
Create SoftwareDownload record
        ↓
Create short-lived signed download URL
        ↓
Browser downloads directly from Blob
```

Do not proxy large installers through Next.js unnecessarily.

---

# 7. Software Releases

Create:

```text
SoftwareRelease
id
softwareProductId
version
platform
architecture
releaseChannel
releaseNotes?
storageProvider
storageKey
originalFilename
fileSizeBytes
sha256
isCurrent
isDownloadable
minimumOsVersion?
createdAt
publishedAt?
createdByStaffId?
```

Platforms may initially be `WINDOWS`.
Architectures may be `X64`, `X86`, `ARM64`, `UNIVERSAL`.
Release channels: `STABLE`, `BETA`, `LEGACY`.

Normal customers default to current STABLE.

Software releases are immutable. Do not overwrite old binaries.

---

# 8. Software Admin

Add:
- `/admin/software`
- `/admin/software/[softwareProductId]`
- `/admin/software/activations`

Admins can:
- create/edit products
- set pricing
- upload installers
- create releases
- enter release notes
- publish release
- mark release current
- archive old release
- inspect download history
- inspect licenses
- inspect activations

Uploading must record filename, size, SHA-256, uploader, upload timestamp, and Blob key.

Uploading does not automatically publish.

---

# 9. Software Download Tracking

Create:

```text
SoftwareDownload
id
customerId
softwareProductId
softwareReleaseId
downloadedAt
source?
```

Possible source:
`SOFTWARE_PAGE`, `ACCOUNT`, `ADMIN`, `OTHER`.

A download is not proof of ownership. It only means the customer downloaded the installer.

Avoid invasive telemetry.

---

# 10. Customer Software Area

Add:
- `/account/software`
- `/account/software/[slug]`

This is the customer's central software hub.

Statuses should clearly distinguish:
- Downloaded
- Trial
- License purchased
- Registration code needed
- Waiting for DMI
- Action required
- Licensed

Example:

```text
MY SOFTWARE

DMI PLAYER
Latest version: 4.2.1
Status: Licensed

[ Download Latest ]
[ View License ]

MIDI MAPPER
Latest version: 2.6.0
Status: Trial

[ Download Latest ]
[ Buy License ]
```

Do not force customers to reconstruct their status from orders.

---

# 11. Software License Purchase

Use the existing Stripe commerce system:
- Stripe Payment Element
- PaymentIntent
- Order
- Billing
- VAT
- billing snapshots
- Stripe webhook fulfillment

Do not create a separate checkout flow.

If necessary extend OrderItem types:

```text
ARRANGEMENT
BUNDLE
SOFTWARE_LICENSE
```

Do not force software into Arrangement IDs.

Store product/price/tax snapshots on the order item.

---

# 12. Software License Model

Create:

```text
SoftwareLicense
id
customerId
softwareProductId
orderId?
orderItemId?
status
licenseType
maxActivations
licenseSource
purchasedAt
activatedAt?
suspendedAt?
revokedAt?
createdAt
updatedAt
```

Statuses:
- `PENDING_ACTIVATION`
- `ACTIVE`
- `SUSPENDED`
- `REVOKED`

Sources:
- `PURCHASE`
- `ADMIN`
- `LEGACY_IMPORT`
- `PROMOTION`

Default `maxActivations` may initially be 1.

---

# 13. License Creation After Payment

Create a purchased SoftwareLicense only after authoritative Stripe webhook confirmation.

```text
Payment
  ↓
Stripe webhook
  ↓
Order PAID
  ↓
SoftwareLicense created
  ↓
PENDING_ACTIVATION
```

Never activate based only on browser success.

---

# 14. Post-Purchase UX

After successful payment:

```text
PAYMENT SUCCESSFUL

Your DMI Player license has been purchased.

One more step is required.

1. Open DMI Player.
2. Go to Registration.
3. Copy the Registration Code.
4. Enter it below.

[ Enter Registration Code ]

You can also do this later from My Account → Software.
```

The customer must understand why the software is still in trial after payment.

---

# 15. Activation Requests

The customer does not directly edit the authoritative installation.

Submitting a registration code creates:

```text
SoftwareActivationRequest
id
requestNumber
softwareLicenseId
softwareProductId
customerId
registrationCode
status
submittedAt
reviewedByStaffId?
reviewedAt?
adminNotes?
rejectionReason?
softwareInstallationId?
createdAt
updatedAt
```

Statuses:
- `SUBMITTED`
- `IN_REVIEW`
- `WAITING_FOR_CUSTOMER`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

Use customer-friendly labels:
- Registration code needed
- Waiting for DMI
- Being processed
- We need information from you
- Licensed
- Activation needs attention

---

# 16. Activation Submission UX

Example:

```text
ACTIVATE DMI PLAYER

Open DMI Player → Settings → Registration.

Copy the Registration Code shown there.

Registration Code
[________________________]

[ Submit for Activation ]
```

After submit:

```text
ACTIVATION REQUEST RECEIVED

DMI Player
Registration: ****91PL

Status:
Waiting for DMI

We received your registration code.
We will email you when your activation key is ready.

[ View License ]
```

Do not provide fake timing promises.

---

# 17. Admin Activation Queue

`/admin/software/activations`

Show:

```text
Customer
Software
License
Registration
Status
Assigned Staff
Submitted
```

Useful filters:
- New
- In Review
- Waiting for Customer
- Approved
- Rejected
- My Activations
- Software Product

The default view should prioritize work requiring staff action.

---

# 18. Activation Processing

Example admin screen:

```text
ACTIVATION REQUEST

Customer
John Smith
john@example.com

Software
DMI Player

License
LIC-10482

Order
ORD-8291

Registration Code
A8F2-73KD-91PL

[ Copy Registration Code ]

PROCESS

1. Copy Registration Code
2. Open proprietary registration EXE
3. Generate Activation Key
4. Paste Activation Key below

Activation Key
[________________________]

[ Approve & Activate ]

[ Request More Information ]
[ Reject Request ]
```

Do not automate the proprietary EXE yet.

---

# 19. Software Installation

On approval create/finalize:

```text
SoftwareInstallation
id
customerId
softwareProductId
softwareLicenseId
registrationCode
registrationIdentifier
activationKeyEncrypted
status
activatedAt
createdAt
updatedAt
createdByStaffId?
updatedByStaffId?
```

Statuses:
- `ACTIVE`
- `SUSPENDED`
- `DEACTIVATED`
- `RETIRED`

`registrationCode` and `registrationIdentifier` remain separate even if initially equal.

Future APIs must not depend on the activation key as the identity.

---

# 20. Activation Key Security

Activation keys are sensitive.

Store encrypted at application level using authenticated encryption.

Never:
- log activation keys
- store plaintext in audit logs
- expose them in generic list endpoints
- put them into analytics
- expose them to unrelated customers

Only decrypt after explicit authorization.

The owning customer may reveal/copy the key on a protected license page after approval.

Server must verify:

```text
softwareLicense.customerId === authenticatedCustomer.id
```

Prefer fetching/decrypting only on explicit reveal.

---

# 21. Activation Completion Email

When approved:

```text
Your DMI Player license is ready.

Sign in to your account to view your activation key.

[ View My Software ]
```

Do not send the activation key directly in email.

---

# 22. Downloads, Trials, Licenses, Installations Are Separate

Do not merge these concepts:

```text
SoftwareDownload
  = installer download event

Trial
  = downloaded software without active purchased license

SoftwareLicense
  = commercial right to use full product

SoftwareActivationRequest
  = customer submits registration code for processing

SoftwareInstallation
  = approved activated installation

ActivationKey
  = local unlock key
```

A download does not equal a license.

A license does not equal an installation.

---

# 23. Re-downloads and Versions

Logged-in customers can re-download current stable releases.

Record each SoftwareDownload.

Do not unnecessarily limit re-downloads.

Customers should default to the latest STABLE version.

Admins may manage historical versions.

---

# 24. Multiple Products and Licenses

Architecture must support multiple products and multiple licenses/installations.

```text
Customer
  ├── DMI Player
  │    ├── License
  │    └── Installation
  └── MIDI Mapper
       ├── License
       └── Installation
```

Do not hard-code DMI Player-specific licensing logic.

---

# 25. Existing RegisteredPlayer Migration

Phase 2 may already have `RegisteredPlayer` and `PlayerType`.

Before changing anything:
1. inspect current schema and usage
2. determine whether those models represent software installs or physical devices
3. preserve all existing data

Preferred target where appropriate:

```text
Old:
RegisteredPlayer

New:
SoftwareProduct = DMI Player
SoftwareLicense
SoftwareInstallation
```

If existing RegisteredPlayer contains physical-machine information that does not belong on SoftwareInstallation, preserve that separately.

Do not blindly delete or repurpose data.

---

# 26. CRM Integration

Add a Software tab to Customer CRM.

Show:
- downloaded products
- latest downloaded version
- license status
- license number
- activation status
- installation history
- registration code
- protected activation key reveal
- related order
- related support tickets

Customer timeline events:
- SOFTWARE_DOWNLOADED
- SOFTWARE_LICENSE_PURCHASED
- SOFTWARE_ACTIVATION_REQUESTED
- SOFTWARE_ACTIVATION_IN_REVIEW
- SOFTWARE_ACTIVATION_WAITING_FOR_CUSTOMER
- SOFTWARE_ACTIVATION_APPROVED
- SOFTWARE_LICENSE_SUSPENDED
- SOFTWARE_INSTALLATION_RETIRED
- SOFTWARE_RELEASE_DOWNLOADED

Never put activation keys in timeline metadata.

---

# 27. Support Integration

Extend SupportTicket with optional relations:

```text
softwareProductId?
softwareLicenseId?
softwareInstallationId?
softwareActivationRequestId?
```

From `/account/software/[slug]` provide:

```text
Need help with this software?
[ Contact Support ]
```

Prefill related software/license/install information when possible.

Only expose resources belonging to the authenticated customer.

---

# 28. Admin Search

Search should support:
- customer name/email/company
- order number
- ticket number
- software product
- license number
- activation request number
- registration code
- registration identifier

Registration-code search should be fast and lead directly to customer/license/installation context.

---

# 29. Roles and Permissions

Extend existing permissions with:

```text
SOFTWARE_READ
SOFTWARE_WRITE
SOFTWARE_RELEASE_READ
SOFTWARE_RELEASE_WRITE
SOFTWARE_RELEASE_PUBLISH
SOFTWARE_DOWNLOAD_READ
SOFTWARE_LICENSE_READ
SOFTWARE_LICENSE_WRITE
SOFTWARE_ACTIVATION_READ
SOFTWARE_ACTIVATION_PROCESS
SOFTWARE_ACTIVATION_KEY_READ
```

Every server action must enforce permissions server-side.

Recommended:
- SUPER_ADMIN: all access
- ADMIN: most operational software functions
- SUPPORT: view customer software/license/activation state; process if permission granted
- CATALOG_MANAGER: manage products/releases without customer activation secrets
- FINANCE: view purchases/refunds without activation secrets

---

# 30. Legacy Customers

Support legacy customers without requiring repurchase.

Admins may create:

```text
SoftwareLicense
source = LEGACY_IMPORT
```

and existing:

```text
SoftwareInstallation
registrationCode
activationKeyEncrypted
```

Do not create fake Stripe orders for old licenses.

---

# 31. Registration Conflicts

If a submitted registration code already belongs to another active installation:
- do not automatically move it
- flag conflict
- require staff review
- show customer a friendly “We need to review this registration” state

Only privileged staff can resolve transfers.

---

# 32. Replacing a Computer / Installation

Support:

```text
old installation → RETIRED
release activation slot if policy allows
new activation request
new registration code
new activation key
new installation → ACTIVE
```

Never overwrite the old record.

Preserve full history.

---

# 33. Refunds and Offline Reality

If software license is refunded:
- preserve Order
- preserve SoftwareLicense
- change status according to policy
- block future activations
- preserve historical installations
- create CRM/audit events

Do not falsely promise that server revocation instantly disables already activated offline software.

Offline software may continue to work according to the current local licensing mechanism.

---

# 34. Email Notifications

Use existing EmailService.

Send for:
- license purchased
- activation request received
- more information required
- activation approved

Do not send email for every normal download.

Do not send activation keys directly in email.

---

# 35. Private Installer Security

Protect against:
- unauthenticated downloads
- permanent public URLs
- directory enumeration
- indefinitely reusable signed URLs

Use short-lived signed URLs.

The installer is free/trial, so it does not need customer-specific encryption.

Paid protection comes from the license/activation mechanism.

---

# 36. Installer Integrity and Publishing

Store:
- original filename
- file size
- SHA-256
- uploaded by
- uploaded at
- release/version

Do not execute uploaded EXEs on Next.js.

Uploading creates a draft release.

Publishing and “mark current” are explicit admin actions.

---

# 37. Customer-Friendly Status Flow

Use clear status language.

Examples:

```text
Trial
License purchased
Registration code needed
Waiting for DMI
Being processed
Action required
Licensed
License suspended
```

Avoid exposing database enum names or internal terms.

A simple activation progress view may show:

```text
✓ License purchased
✓ Registration code submitted
● Waiting for DMI
○ Activation ready
```

After approval:

```text
✓ License purchased
✓ Registration code submitted
✓ Activation processed
✓ Licensed
```

No fake progress or fake ETA.

---

# 38. Customer Account Navigation

Customer account should feel like one unified DMI portal:

```text
Overview
Music Library
Software
Orders
Support
Profile
```

If physical Players/Devices remain a separate real-world concept, keep that page as well.

Do not expose CRM terminology to customers.

---

# 39. Admin Navigation

Add Software as a grouped admin area:

```text
Software
  Products
  Releases
  Activations
  Licenses
  Downloads
```

Avoid cluttering top-level navigation unnecessarily.

Admin dashboard can show:
- pending activations
- activations waiting for customer
- recent software downloads
- licenses sold

Keep analytics simple.

---

# 40. Audit Logging

Audit:
- product created/edited
- release uploaded/published/archived
- manual license creation
- license suspension/revocation
- activation request status changes
- registration code edits by staff
- activation key entry
- activation approval/rejection
- staff activation-key reveal
- installation retirement

Never include plaintext activation keys in audit metadata.

---

# 41. Customer Activity / CRM Tasks

Software events should appear on CustomerActivity.

Activation requests may relate to CustomerTask so staff can manage manual fulfillment work.

Example task:

```text
Generate DMI Player activation for John Smith
Assigned to Peter
Due today
```

Use the existing CRM task system rather than inventing another task mechanism.

---

# 42. Existing WordPress Migration

The old WordPress site currently has unrestricted direct installer downloads.

The new platform becomes the authoritative download location.

Prepare public software pages and authenticated downloads so WordPress links can later redirect to:
- `/software/dmi-player`
- `/software/midi-mapper`

Do not modify WordPress unless this repository controls it.

---

# 43. Privacy

Account creation for download does not equal marketing consent.

Do not set `marketingConsent = true` automatically.

Software download history is operational/account history, not marketing permission.

---

# 44. Testing Requirements

At minimum test:

- logged-out user cannot download installer
- login/signup returns user safely to software download
- authenticated user can download current release
- download is recorded
- customer cannot access another customer's license
- customer cannot access another customer's activation request
- customer cannot retrieve another customer's activation key
- customer cannot edit authoritative installation data
- license created only after Stripe webhook confirmation
- purchased license starts pending activation
- customer can submit registration code for own license
- duplicate registration code cannot silently transfer ownership
- staff without permission cannot approve activation
- authorized staff can approve
- activation key is encrypted at rest
- activation key does not appear in list APIs/logs/audit metadata
- approval creates/finalizes SoftwareInstallation
- customer can reveal own approved key
- private installer flow requires auth
- draft/archived release cannot accidentally become current
- installation history is preserved
- refunds do not delete license/install history
- CRM reflects software activity
- support ticket links only to customer's own software resources

Preserve all Phase 1 and Phase 2 tests.

---

# 45. Security Requirements

Customer routes:

```text
Auth0 session
  ↓
resolve Customer
  ↓
verify resource.customerId === Customer.id
```

Admin routes:

```text
Auth0 session
  ↓
active StaffAccount
  ↓
required permission
```

Activation key:

```text
encrypted at rest
explicit authorization before decrypt
never logged
```

Never trust customer IDs or ownership IDs coming from the browser.

---

# 46. Explicit Non-Goals

Do NOT implement in this phase:
- future DMI Player API
- Auth0 Device Authorization inside desktop software
- automatic player login
- automatic music-library synchronization
- automatic DMI downloading
- automatic invocation of proprietary registration EXE
- online desktop activation service
- remote revocation of offline software
- subscription licensing
- automatic license transfers
- computer fingerprinting
- software auto-update client
- AI support agent

---

# 47. Suggested Implementation Order

```text
1. Inspect existing Phase 2 schema and flows
2. SoftwareProduct
3. SoftwareRelease
4. Private authenticated downloads
5. SoftwareDownload tracking
6. Public software pages
7. Customer My Software
8. Order/cart integration
9. SoftwareLicense
10. Post-purchase activation UX
11. SoftwareActivationRequest
12. Admin activation queue
13. SoftwareInstallation
14. Secure activation-key storage/reveal
15. Activation email notifications
16. CRM integration
17. Support-ticket integration
18. Roles/permissions
19. RegisteredPlayer/PlayerType migration where appropriate
20. Activity/audit integration
21. Tests/security review
```

Create safe incremental Prisma migrations and preserve existing data.

---

# 48. Definition of Done

Phase 3 is complete when:

- Software is a first-class domain
- admins can create DMI Player, MIDI Mapper, and future software products
- admins can upload and publish immutable releases
- installers are private
- account/login is required before download
- downloads are tracked against Customer
- customer has intuitive My Software area
- Trial/License/Activation states are obvious
- software licenses use existing Stripe checkout
- paid software creates pending SoftwareLicense after webhook
- customer is clearly guided through activation
- registration submission creates ActivationRequest
- admin has a pending activation queue
- admin can manually use the proprietary EXE
- activation keys are encrypted
- approval creates/finalizes SoftwareInstallation
- customer is notified and can securely reveal/copy key
- customer can re-download software
- CRM shows downloads/licenses/installations/activation history
- support can link directly to software/license/install
- roles protect sensitive operations
- existing RegisteredPlayer data is safely generalized/migrated where appropriate
- existing music shop, CRM, Auth0, Stripe, entitlements, support, and admin functionality remain working
- future automatic activation and Player API can be added without redesigning the domain

---

# Final Product Goal

The customer should experience one coherent DMI account:

```text
My Account
  ├── My Music
  ├── My Software
  ├── My Orders
  ├── My Support
  └── My Profile
```

For software, the experience should feel like:

```text
"I found the software."
"I signed in."
"I downloaded it."
"I can try it."
"I bought the license."
"I know exactly how to activate it."
"I submitted my code."
"I can see DMI received it."
"I got notified when it was ready."
"I copied my key."
"My software is licensed."
"If I need support, DMI already knows which software and license I have."
```

The admin experience should feel like:

```text
"I know who downloaded our software."
"I know who purchased licenses."
"I can see every pending activation."
"I can process registrations with the existing EXE."
"I can find a customer from a registration code."
"I can see their software, music, orders, CRM history, and support in one place."
```

That unified, intuitive customer/account/CRM experience is the primary objective of this phase.
