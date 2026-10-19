# DMI Platform — Phase 4 Full Flow Overhaul
## Player-Centric Music Licensing, Unified “My DMI” Experience, Commerce, CRM & Admin Redesign

Continue development of the existing DMI platform. Phases 1–3 are already implemented and working. Preserve the existing stack and working functionality: Next.js/TypeScript, PostgreSQL/Prisma, Auth0, Stripe, music shop, bundles, CRM, staff/admin roles, support tickets, software downloads/licensing/activation, Vercel Blob, customer activity, and audit logging.

This phase is a **major domain and UX overhaul**. Do not treat it as a database-only patch.

The product must move from:

```text
Customer owns arrangement
      ↓
Customer can generate it for any present/future player
```

to:

```text
Customer manages one or more DMI players
      ↓
Music is licensed to a specific registered player
      ↓
Generated DMI is encoded/encrypted for that player
```

This affects the public shop, product pages, bundles, pricing, cart, checkout, order fulfillment, account, music library, software/player views, CRM, support, admin tools, delivery authorization, migrations, wording, and future Player API readiness.

The final UX must become **simpler and more intuitive** for the customer even though the backend licensing model becomes stricter.

---

# 1. Core Business Rule

The system must consistently enforce:

> A music purchase does not grant unlimited generation for every present and future player on a customer account.

Instead:

> A playable music license is assigned to a specific registered DMI player. Additional players require an additional license or an authorized transfer/replacement workflow.

The customer should think:

```text
This is my player.
This music is licensed for this player.
This player has 284 songs.
I can add more music to this player.
If I replace this player, DMI Support can help transfer the library.
```

Do not expose internal terminology such as EntitlementSource, MusicLicense IDs, DeliveryArtifact, EncodingJob, or database ownership rules to normal customers.

---

# 2. Why the Model Is Changing

The old account-level model allows this:

```text
Customer buys all music
      ↓
Downloads/encodes for Player A
      ↓
Sells Player A with the music still working offline
      ↓
Buys Player B
      ↓
Account still owns all songs
      ↓
Downloads/encodes all music again for Player B
```

Because Player A may remain permanently offline, the server cannot reliably erase those existing files.

Therefore commercial acquisition history must be separated from player-specific playback authorization.

---

# 3. Keep Entitlements, Change Their Meaning

Do not remove the existing Entitlement architecture.

An Entitlement should mean:

```text
The customer commercially acquired this arrangement through
PURCHASE / BUNDLE / ADMIN_GRANT / PROMOTION / LEGACY_IMPORT.
```

Use Entitlement for purchase/acquisition history, reporting, royalty/accounting linkage, bundle source history, admin grants, legacy imports, and duplicate-awareness.

However, Entitlement alone must no longer mean:

```text
This arrangement may be generated for every player on the account.
```

---

# 4. Add Player-Specific MusicLicense

Create a first-class playback license model.

Suggested:

```text
MusicLicense
id
customerId
arrangementId
entitlementId?
licensedPlayerId
status
licenseSource
orderId?
orderItemId?
entitlementSourceId?
originalMusicLicenseId?
pricePaidCents?
currency?
assignedAt
activatedAt?
retiredAt?
transferredAt?
createdAt
updatedAt
```

Suggested statuses:

```text
ACTIVE
TRANSFER_PENDING
RETIRED
REVOKED
```

Optionally support `UNASSIGNED` only where genuinely needed for “buy now, assign later”.

A MusicLicense means:

> This arrangement may be delivered/encoded for this specific registered player.

---

# 5. Canonical Player / Device Target

Before schema work, inspect the current implementation of:

```text
RegisteredPlayer
PlayerType
SoftwareProduct
SoftwareLicense
SoftwareInstallation
```

Do not create another duplicate device concept without understanding what already exists.

Identify one canonical domain record meaning:

> The registered DMI playback environment to which music can be licensed and encoded.

Reuse the current model if it already fits. Possible internal names include `PlaybackDevice`, `SoftwareInstallation`, or `RegisteredPlayer`.

The canonical player target must support at least:

```text
id
customerId
softwareProductId/playerTypeId
registrationCode
registrationIdentifier
status
activatedAt
retiredAt?
friendlyName?
```

Customer-facing term: **Player**.

Never use email, Auth0 subject, order ID, or activation key as player identity.

---

# 6. Friendly Player Names

Support customer-friendly labels such as:

```text
Living Room Piano
Studio Organ
Theatre Drums
Main DMI Player
```

Display:

```text
Living Room Piano
DMI Player
Registration ••••91PL
```

Friendly name may be customer-editable if safe, but customers must never edit registration code, registration identifier, activation key, player type/product, status, ownership, or security identifiers.

---

# 7. “My DMI” Becomes the Account Center

Redesign `/account` into a coherent DMI dashboard.

Recommended navigation:

```text
My DMI
Music
Software
Orders
Support
Profile
```

Example dashboard:

```text
MY DMI

YOUR PLAYERS

Living Room Piano
DMI Player
Active
284 music licenses
Software licensed
[ Open Player ]

Studio Organ
DMI Player
Active
73 music licenses
Software licensed
[ Open Player ]

MUSIC
357 licensed arrangements across 2 players
[ Browse Music ]

SOFTWARE
DMI Player — Licensed
MIDI Mapper — Trial
[ My Software ]

SUPPORT
1 request waiting for our reply
[ View Support ]
```

Prioritize useful next actions, not decorative statistics.

---

# 8. Player Detail Page

Create/redesign:

```text
/account/players/[playerId]
```

Example:

```text
LIVING ROOM PIANO

DMI Player
Registration ••••91PL
Status: Active

MUSIC
284 arrangements licensed
[ View Music ]
[ Add Music ]

SOFTWARE
DMI Player — Licensed
[ Download Latest ]
[ View Software License ]

SUPPORT
2 previous requests
[ Get Help With This Player ]
```

Do not display activation secrets by default.

---

# 9. Player-Specific Music Library

Preferred route:

```text
/account/players/[playerId]/music
```

Example:

```text
LIVING ROOM PIANO
Music Library

284 arrangements
Search library...

Dancing Queen — ABBA — Licensed
Waterloo — ABBA — Licensed
My Way — Frank Sinatra — Licensed
```

This view must use ACTIVE MusicLicense records for the player, not customer Entitlement alone.

---

# 10. Global “My Music” View

Keep a global view if useful:

```text
/account/music
```

Example:

```text
MY MUSIC
Player: [ All Players ▼ ]

Dancing Queen
Licensed on:
• Living Room Piano
• Studio Organ

Waterloo
Licensed on:
• Living Room Piano
```

This gives account-wide visibility without implying free portability between players.

---

# 11. Shop Becomes Player-Aware

When a logged-in user shops for music, establish a persistent player context.

Example:

```text
Buying music for:
[ Living Room Piano ▼ ]
```

Catalog cards and product pages use this context.

If already licensed for selected player:

```text
✓ Already licensed for this player
```

If not:

```text
€8.95
[ Add to Cart ]
```

The selected player should persist during the shopping session. Pricing and eligibility remain server-authoritative.

---

# 12. Logged-Out Store

Logged-out visitors may browse freely.

Example product CTA:

```text
€8.95

Music licenses are activated for one registered DMI player.

[ Sign In to Buy ]
```

Keep this short and link to a dedicated “How music licensing works” page.

---

# 13. One-Player Customer UX

If a customer has exactly one eligible ACTIVE player, avoid unnecessary dialogs.

```text
Dancing Queen
€8.95
For: Living Room Piano
[ Add to Cart ]
```

---

# 14. Multi-Player Customer UX

If multiple eligible players exist, require a target before adding music.

```text
Which player is this music for?

○ Living Room Piano
  DMI Player · ••••91PL

○ Studio Organ
  DMI Player · ••••83KA

[ Continue ]
```

Remember the selection for the session.

---

# 15. No-Player Customer UX

Do not create a dead end.

```text
You need a registered DMI Player before this music can be activated.

Already have DMI Player?
[ View My Software / Registration ]

Need the player software?
[ Download DMI Player ]

Prefer to buy now?
[ Buy Now — Assign Later ]
```

Make “Assign Later” configurable.

Recommended initial rule:
- if eligible player exists: require target selection
- if no player exists: optionally allow UNASSIGNED purchase

If UNASSIGNED is supported, first assignment may be customer-controlled; after assignment, lock it.

---

# 16. Customers Cannot Reassign Active Licenses

Once a MusicLicense is assigned to a player, the customer must not have a normal “Change Player” button.

Reassignment is a staff-controlled transfer/replacement workflow.

---

# 17. Reusable Player Selector

Build one shared player selector used by shop, arrangement page, bundle page, cart, My Music filters, and Add Music flow.

It must:
- list only eligible ACTIVE players
- show friendly name
- show masked registration
- show product/type
- remember current selection
- auto-select one-player accounts
- handle no-player state
- work well on mobile

---

# 18. Player Eligibility

Not every software installation is a music playback target. MIDI Mapper must not appear as a music destination.

Add an explicit capability such as:

```text
SoftwareProduct.supportsMusicLibrary = true
```

or equivalent.

Only eligible ACTIVE players may receive MusicLicenses.

---

# 19. Compatibility Validation

Before allowing purchase, confirm the arrangement is compatible with the selected player/profile.

Validate on product page, add-to-cart, cart recalculation, checkout preparation, and final server validation.

If incompatible:

```text
This arrangement is not available for Studio Organ.
```

Do not accept payment and fail later during encoding.

---

# 20. Cart Overhaul

Group cart items by target player.

```text
YOUR CART

FOR LIVING ROOM PIANO
Dancing Queen        €8.95
Waterloo             €8.95
ABBA Essentials     €39.00

FOR STUDIO ORGAN
My Way               €8.95
```

The same arrangement may legitimately appear for two different players. Deduplicate only within the same customer + arrangement + target player.

---

# 21. Duplicate Purchase Rules

If selected player already has an ACTIVE MusicLicense:

```text
Already licensed for Living Room Piano
```

Prevent accidental repurchase.

If arrangement is licensed on Player A but not Player B:

```text
Already licensed on Living Room Piano.
Not yet licensed on Studio Organ.
```

Purchasing for Player B is valid.

---

# 22. Checkout Overhaul

Checkout must make target players explicit.

```text
ORDER SUMMARY

Living Room Piano
Dancing Queen
Waterloo
ABBA Essentials

Studio Organ
My Way

Total
€...
```

Before payment, the customer must understand exactly which player receives each license.

---

# 23. Order Snapshots

Historical Order/OrderItem data must preserve player targeting at purchase time.

Snapshot at least:

```text
arrangementId
arrangementTitleSnapshot
targetPlayerId
targetPlayerDisplayNameSnapshot
targetRegistrationMaskedSnapshot
priceSnapshot
currency
bundle allocation data
```

If a player is later renamed, retired, or transferred, historical orders remain understandable.

---

# 24. Stripe Fulfillment

Continue using Stripe webhook as fulfillment authority.

On authoritative payment success:

```text
Order → PAID
Entitlement/EntitlementSource → create/update
MusicLicense → create for arrangement + target player
Royalty allocation → snapshot
CustomerActivity → record
```

Use idempotent processing. Never create playback licenses from browser success callbacks.

---

# 25. MusicLicense Sources

Use structured sources such as:

```text
PURCHASE
BUNDLE
ADDITIONAL_PLAYER_PURCHASE
ADMIN_GRANT
PROMOTION
PLAYER_STARTER_PACK
LEGACY_IMPORT
LEGACY_MIGRATION
TRANSFER
REPLACEMENT_TRANSFER
```

Do not rely on free-text source notes.

---

# 26. Additional-Player Pricing

Support discounted additional-player licenses without hard-coding one commercial rule.

Possible strategies:

```text
NO_DISCOUNT
ADDITIONAL_PERCENTAGE
ADDITIONAL_FIXED_PRICE
```

Examples:

```text
First player: full price
Second player: 50%
```

or:

```text
First player: €8.95
Additional player: €3.95
```

Pricing may initially be platform-wide, but architecture should allow future per-arrangement/bundle/arranger policy.

All calculations must be server-authoritative.

---

# 27. Additional-Player Customer UX

If Dancing Queen is already on Living Room Piano and customer selects Studio Organ:

```text
Dancing Queen

Already licensed on:
Living Room Piano

Add to:
Studio Organ

Additional-player price
€3.95

[ Add to Studio Organ ]
```

Prefer “Add to another player” rather than “Buy this song again”.

---

# 28. Bundle Licensing

Bundles remain commercial groupings. Buying a bundle for Player ABC123 creates atomic MusicLicenses for each newly licensed arrangement.

Do not create one opaque bundle playback license.

---

# 29. Complete-the-Collection Is Player-Specific

Old logic:

```text
Does customer own arrangement?
```

New playback logic:

```text
Does selected player already have an ACTIVE MusicLicense for arrangement?
```

Example:

```text
ABBA Essentials
25 arrangements

Living Room Piano already has 8
17 remaining

Complete this collection for Living Room Piano
€39.50
```

A different player may have a different completion price.

---

# 30. Bundle UI

```text
ABBA ESSENTIALS

For:
Living Room Piano ▼

25 arrangements

✓ 8 already licensed
+ 17 will be added

Regular remaining value: €...
Your collection price: €...

[ Complete Collection ]
```

Switching player must recalculate server-side.

---

# 31. Free Music

Free arrangements must still create MusicLicense records tied to the target player.

Free does not mean globally downloadable source material.

---

# 32. Starter Libraries

Support optional starter music tied to eligible player products.

When a player becomes ACTIVE:

```text
Player activated
      ↓
Starter policy evaluated
      ↓
MusicLicense records created
```

Use source such as `PLAYER_STARTER_PACK`. Do not create fake paid orders.

---

# 33. Purchase From Player Context

A primary UX flow should be:

```text
Living Room Piano
284 songs

[ Add Music ]
```

This opens the shop already scoped to that player.

---

# 34. Buy for Another Player

From an owned arrangement:

```text
Dancing Queen

Licensed on:
Living Room Piano

[ Add to Another Player ]
```

Then:

```text
Studio Organ
Additional-player price €3.95

[ Continue ]
```

Do not force the customer to search the catalog again.

---

# 35. Order History

Orders remain account-level commercial records.

Order detail should show the original target player:

```text
Order ORD-10482

Dancing Queen
For: Living Room Piano

Waterloo
For: Living Room Piano

My Way
For: Studio Organ
```

If a license later transfers, the original order snapshot must not change.

---

# 36. SoftwareLicense vs MusicLicense

Never confuse these concepts.

```text
SoftwareLicense
= right to unlock/use DMI Player or MIDI Mapper software
```

```text
MusicLicense
= right to play one arrangement on one specific registered DMI player
```

A player may therefore have:

```text
DMI Player SoftwareLicense: ACTIVE
MusicLicenses: 284
```

---

# 37. Optional Software-License Requirement for Music

Make this a configurable business policy:

```text
requireActiveSoftwareLicenseForMusic = true/false
```

If enabled and customer selects an unlicensed/trial player:

```text
A full DMI Player license is required before music can be activated for this player.

[ Buy Player License ]
```

Do not hard-code until business policy is final.

---

# 38. Player Sale / Ownership Transfer

Support a controlled staff workflow for transferring a player between customers. Customers must not self-transfer.

Example:

```text
Transfer Player

From:
John Smith

To:
Sarah Jones

Player:
Living Room Piano
Registration ••••91PL
```

Require an explicit music policy.

Support configurable policies such as:

```text
PLAYER_AND_LIBRARY
PLAYER_ONLY
ADMIN_DECIDES
```

Do not bury resale policy in scattered conditionals.

---

# 39. Player-and-Library Transfer

If policy is `PLAYER_AND_LIBRARY`, active playback rights attached to that player must move coherently to the new customer/player owner.

The original purchaser must not then be able to use old account Entitlements to regenerate that same library for a new player.

Preserve original Orders and acquisition history. Commercial history is separate from current playback authorization.

---

# 40. Player Replacement / Hardware Failure

Create a dedicated admin workflow:

```text
Replace Player
```

Example:

```text
Old Player
ABC123
284 music licenses

New Player
XYZ789
```

Require reason:

```text
HARDWARE_FAILURE
WARRANTY_REPLACEMENT
COMPUTER_REPLACEMENT
UPGRADE
OTHER
```

On approval:

```text
old player → RETIRED
old player licenses → transferred/reissued according to policy
new player → ACTIVE
```

Preserve complete history.

---

# 41. Whole-Library Transfer

Admin needs a first-class operation:

```text
Transfer Music Library
```

Modes:

```text
MOVE LICENSES
CREATE ADDITIONAL LICENSES
```

`MOVE LICENSES` is for legitimate replacement/migration.

`CREATE ADDITIONAL LICENSES` is for music that should remain on both players. This requires valid payment/order or an explicit privileged admin grant with reason.

Never silently clone a paid library.

---

# 42. Transfer History

Create explicit business records.

Suggested:

```text
MusicLicenseTransfer
id
fromPlayerId
toPlayerId
customerId
newCustomerId?
type
reason
status
createdByStaffId
approvedByStaffId?
createdAt
completedAt?
notes?
```

Types may include:

```text
HARDWARE_REPLACEMENT
WARRANTY_REPLACEMENT
CUSTOMER_PLAYER_TRANSFER
PLAYER_RESALE
ADMIN_CORRECTION
OTHER
```

Do not rely on generic AuditLog alone for this history.

---

# 43. Per-License History

Every MusicLicense should be traceable.

Example:

```text
Dancing Queen

12 Mar 2026
Purchased for Living Room Piano

8 Oct 2028
Transferred by Peter
Reason: Hardware replacement
ABC123 → XYZ789
```

---

# 44. Offline Reality

Moving or revoking a server-side license does not guarantee already-downloaded DMI files disappear from an offline machine.

Do not claim otherwise.

Server-side controls apply to future generation, future downloads, future sync, future replacements, and future online services.

Permanent offline playback remains an intentional product property.

---

# 45. No Periodic Phone-Home Lease

Do not introduce mandatory 7-day/30-day renewal, remote kill switch, or periodic online check in this phase.

Do not damage offline usability just to solve resale risk.

---

# 46. Delivery / Encoding Authorization

Delivery generation must check MusicLicense, not only Entitlement.

Before generating protected DMI, verify:

```text
Player belongs to / is managed by Customer
AND
Player is ACTIVE
AND
MusicLicense exists
AND
MusicLicense.arrangementId matches
AND
MusicLicense.licensedPlayerId == target Player
AND
MusicLicense.status == ACTIVE
```

Only then may a delivery artifact be generated or reused.

---

# 47. DeliveryArtifact Relationship

Generated protected DMI should reference:

```text
arrangementId
musicLicenseId
sourceAssetVersionId
playerId
registrationIdentifier
encoderVersion
protectionProfileVersion
```

Never reuse one device-bound artifact for another player.

---

# 48. Master Files Remain Private

No change to source security.

Customers never receive SOURCE_MIDI, SOURCE_DMI, canonical source files, or unprotected masters.

Only authorized player-specific delivery output may be exposed.

---

# 49. Arrangement Page Redesign

Logged-in example:

```text
DANCING QUEEN

Arrangement by ...
Compatible with DMI Player

€8.95

For:
Living Room Piano ▼

[ Add to Cart ]
```

Already licensed:

```text
✓ Licensed for Living Room Piano
[ View in My Music ]
```

Licensed only on another player:

```text
Licensed on:
Studio Organ

Add to Living Room Piano
Additional-player price €3.95

[ Add to This Player ]
```

---

# 50. Shop Listing Cards

Keep cards concise.

Examples:

```text
Dancing Queen
ABBA
€8.95
✓ Licensed
```

or:

```text
Dancing Queen
ABBA
€3.95 for this player
[ Add ]
```

Do not overload every card with policy text.

---

# 51. Customer-Facing Licensing Help

Add a friendly page such as:

```text
/help/music-licensing
```

Explain in plain language:

- music is licensed per registered player
- why a player must be selected
- how to add music to another player
- what happens when replacing a player
- what to do before selling/transferring a player
- how support can help

Keep legal Terms separate from the product explanation.

---

# 52. Resale Messaging

Until the commercial/legal policy is finalized, use wording such as:

```text
If you plan to sell or transfer a DMI player, contact DMI Support first.
Your music library is linked to that registered player, and we will explain the available transfer options.
```

Do not automatically promise that purchased music transfers to the buyer.

---

# 53. CRM Overhaul

Recommended customer CRM tabs:

```text
Overview
Players
Music
Software
Orders
Support
Notes & Activity
Tasks
```

Players should be one of the most prominent areas.

---

# 54. CRM Overview

Show:

```text
Active Players
Total active MusicLicenses
Software Licenses
Pending Activations
Open Support Tickets
Lifetime Spend
Last Order
Last Activity
Next Task
```

Also show important customer flags.

---

# 55. CRM Players Tab

Example:

```text
PLAYERS

Living Room Piano
DMI Player
Registration ••••91PL
ACTIVE
284 music licenses
[ Open ]

Studio Organ
DMI Player
Registration ••••83KA
ACTIVE
73 music licenses
[ Open ]
```

Actions depending on permission:

```text
Register Player
Retire Player
Replace Player
Transfer Player
Transfer Library
Add Music License
View Software License
View Support History
```

Sensitive actions require explicit confirmation.

---

# 56. Admin Player Detail

Build a complete operational page with sections:

```text
Identity
Software Registration
Music Library
License History
Deliveries
Orders
Support
Activity
```

Show customer, player product/type, registration, status, license count, and support context.

Provide search/filter inside the player music library.

---

# 57. Admin Manual Music Grant

Authorized staff may manually grant music to a player.

Require:

```text
Arrangement
Target Player
Reason
Source
```

Sources may include:

```text
ADMIN_GRANT
PROMOTION
LEGACY_IMPORT
CUSTOMER_SERVICE
```

Create proper EntitlementSource/MusicLicense history. Do not create fake Stripe orders.

---

# 58. Manual Additional Licenses

If staff duplicates a license to another player without payment, require:

- explicit reason
- staff identity
- audit record

Examples include goodwill, dealer/demo unit, migration correction, or warranty exception.

Never allow silent cloning.

---

# 59. CRM Music Tab

Customer-wide staff view:

```text
Arrangement        Players
Dancing Queen      Living Room, Studio
Waterloo           Living Room
My Way             Studio
```

Filters:

- all players
- specific player
- active licenses
- retired licenses
- source
- purchase date

---

# 60. Global Admin Search

Search by:

```text
customer name
customer email
friendly player name
registration code
registration identifier
serial number
software license number
arrangement
order number
ticket number
```

Registration-code search should be fast and land on the exact player.

---

# 61. Support Flow Overhaul

Customer support form should ask:

```text
What is this about?

○ My Player
○ Music
○ Software
○ Order / Payment
○ Account
○ Other
```

If Player, ask which player.

If Music, ask which player and optionally which arrangement.

Only show resources belonging to the authenticated customer.

---

# 62. Player Support Shortcut

Player detail should include:

```text
[ Get Help With This Player ]
```

This opens support with player context prefilled.

Use similar contextual support shortcuts from software/license pages.

---

# 63. Support Admin Context

Ticket detail should show linked context where available:

```text
Customer
Player
Registration
Software license
Music license / arrangement
Order
```

Do not force staff to navigate five screens just to understand a support case.

Activation keys still require explicit permission.

---

# 64. New Player Onboarding

After player activation/registration:

```text
YOUR DMI PLAYER IS READY

Living Room Piano
Registration ••••91PL

Next steps:
1. Explore your starter music
2. Browse arrangements
3. View your player

[ Browse Music ]
[ Open My Player ]
```

If starter music exists, show it immediately.

---

# 65. Customer Cannot Self-Transfer

No customer-facing controls for moving a library, changing registration, transferring ownership, retiring a player with migration, or moving active music licenses.

Instead:

```text
Replacing this player?
If your computer or player has been replaced, contact DMI Support.
We can review transferring your library to the replacement player.

[ Request Help ]
```

---

# 66. Resale Policy Configuration

Centralize resale policy.

Possible values:

```text
PLAYER_AND_LIBRARY
PLAYER_ONLY
ADMIN_DECIDES
```

Do not scatter policy decisions through route/UI conditionals.

---

# 67. Replacement Policy Configuration

Prepare a central replacement policy such as:

```text
FREE_ADMIN_APPROVED
PAID_TRANSFER
MANUAL_DECISION
```

Do not force a fee until business policy is finalized.

---

# 68. Optional Library Transfer Fee

Architect so a future service/order can exist, for example:

```text
DMI Library Transfer
€25
```

but do not require it in the initial implementation.

Warranty replacement may be free.

---

# 69. Royalty Accounting

Every paid player-specific music license remains royalty-accountable.

For discounted additional-player copies, royalty calculations should use the actual paid/allocated amount according to the configured royalty basis.

Do not use full retail price unless contracts explicitly require it.

Keep immutable order allocation snapshots.

---

# 70. Bundle Royalty Accounting

For player-specific bundle completion:

- only missing licenses are sold
- only the actual paid amount is allocated
- allocations remain immutable
- refunds create negative ledger entries

Do not recalculate old royalties from current catalog prices.

---

# 71. Refunds

Refunding a purchase must:

- preserve Order history
- preserve MusicLicense history
- update/revoke server-side rights according to policy
- prevent future delivery if no valid source remains
- never claim already-downloaded offline content was erased

A later transfer never changes historical financial attribution.

---

# 72. Customer Activity Timeline

Create readable events such as:

```text
Music purchased for Living Room Piano
ABBA Essentials added to Living Room Piano
Dancing Queen added to Studio Organ
Library transferred: Living Room Piano → Replacement Player
Player transferred
Starter music added
```

Keep internal metadata structured but display customer/admin-friendly wording.

---

# 73. Admin Permissions

Extend permissions, for example:

```text
MUSIC_LICENSE_READ
MUSIC_LICENSE_GRANT
MUSIC_LICENSE_REVOKE
MUSIC_LICENSE_TRANSFER
PLAYER_TRANSFER
PLAYER_LIBRARY_TRANSFER
PLAYER_REPLACEMENT
MUSIC_LICENSE_MIGRATION
DELIVERY_READ
DELIVERY_REGENERATE
```

Sensitive transfers should require appropriate ADMIN/SUPER_ADMIN permission.

Server-side checks are mandatory.

---

# 74. Audit Requirements

Audit:

```text
music license created
music license transferred
music license retired
music license revoked
library transfer started
library transfer completed
player ownership transferred
replacement processed
additional license manually granted
migration assignment changed
```

Never log activation keys, cryptographic keys, or protected DMI contents.

---

# 75. Site-Wide Terminology Audit

Review all existing customer-facing wording.

Preferred terms:

```text
My DMI
Player
My Music
Licensed for
Add to Player
Buy License
Trial
Activation
Support
```

Avoid customer-facing internal terms:

```text
Entitlement
EntitlementSource
MusicLicense ID
SoftwareInstallation
DeliveryArtifact
EncodingJob
licensedPlayerId
```

Use “Purchased” for commercial history and “Licensed for [Player]” for playback rights.

---

# 76. Empty States

No players:

```text
You don't have a registered DMI Player yet.
[ Download DMI Player ]
[ Learn How Registration Works ]
```

Player with no music:

```text
This player doesn't have any music yet.
[ Browse Music ]
```

No software:

```text
You haven't downloaded DMI software yet.
[ Browse Software ]
```

No support tickets:

```text
No support requests.
Need help?
[ Contact Support ]
```

Do not use empty data tables as the primary UX.

---

# 77. Shared Status Components

Use consistent customer-facing statuses.

Player:

```text
Active
Pending
Suspended
Retired
```

Music:

```text
Licensed
Transfer Pending
Retired
No Longer Active
```

Software:

```text
Trial
Activation Required
Waiting for DMI
Licensed
```

Support:

```text
Waiting for DMI
Waiting for You
In Progress
Resolved
```

Do not expose raw enum values to customers.

---

# 78. UX Principle: Context Before Configuration

Good:

```text
Living Room Piano
[ Add Music ]
```

Bad:

```text
Select entitlement target entity
Choose license allocation
Confirm registration identifier
```

Infer safely wherever possible.

---

# 79. UX Principle: One Obvious Primary Action

Examples:

```text
Player with no music → [ Browse Music ]
Trial software → [ Buy License ]
Software purchased but not activated → [ Enter Registration Code ]
Support waiting for customer → [ Reply ]
```

Avoid multiple equally prominent primary actions.

---

# 80. UX Principle: No Checkout Surprises

Before payment clearly show:

- arrangements being purchased
- target player
- additional-player pricing if relevant
- existing licenses excluded from charge
- total price
- one-player licensing rule

Use concise explanatory text:

```text
This music license is for Living Room Piano.
It can be delivered/encoded for this registered player.
```

---

# 81. Mobile & Accessibility

All customer flows must work cleanly on mobile.

Pay special attention to player selector, grouped cart, bundle completion, player cards, support forms, and activation state.

Use semantic controls, labels, keyboard accessibility, sufficient contrast, and never use color alone for important status.

---

# 82. Existing Data Migration Is Critical

Before destructive changes, inspect:

```text
Customer
Entitlement
EntitlementSource
Order
OrderItem
Bundle allocations
RegisteredPlayer
PlayerType
SoftwareProduct
SoftwareLicense
SoftwareInstallation
DeliveryArtifact
EncodingJob
SupportTicket
CustomerActivity
AuditLog
```

Produce a migration plan first. No data loss.

---

# 83. Existing Music Purchase Migration Rules

Existing customers may already have active Entitlements under the account-level model.

Do not arbitrarily assign them.

## Exactly one eligible ACTIVE player

Create MusicLicense records for existing active Entitlements against that player using source `LEGACY_MIGRATION`. Preserve original EntitlementSource.

## Multiple eligible ACTIVE players

Do not guess. Put them into a migration-review/unassigned state.

## No eligible player

Preserve Entitlement. Do not create an active MusicLicense until assignment policy is satisfied.

---

# 84. Existing Delivery Evidence During Migration

If a trustworthy player-bound DeliveryArtifact exists for an arrangement and player, it may be used as deterministic evidence for assigning a corresponding MusicLicense.

Do not infer ownership from filenames or weak heuristics.

---

# 85. Legacy Migration Queue

If needed, add:

```text
/admin/music-license-migration
```

Example:

```text
Customer       Entitlements   Players   Status
John Smith     284            1         Auto-assigned
Sarah Jones    120            3         Needs review
Peter Brown    45             0         Waiting for player
```

Allow staff to resolve ambiguous cases safely.

---

# 86. Existing Bundles and Admin Grants

Historical bundle purchases and admin grants must remain intact.

Migrate each arrangement into the new MusicLicense layer according to deterministic player assignment rules.

Preserve Orders, OrderItems, EntitlementSources, royalty allocations, bundle snapshots, and admin grant history.

Do not create fake orders.

---

# 87. Database Constraints

Ensure there is normally only one current ACTIVE playback license for the same arrangement on the same player.

Because historical RETIRED/REVOKED records must remain, implement uniqueness carefully.

---

# 88. Performance

A player may have hundreds or thousands of arrangements.

Use indexed queries, server-side filtering/search, pagination or virtualization where useful, avoid N+1 Prisma queries, and do not load DeliveryArtifacts for basic library lists.

Likely indexes include:

```text
MusicLicense.customerId
MusicLicense.licensedPlayerId
MusicLicense.arrangementId
MusicLicense.status
Player.customerId
Player.registrationIdentifier
Player.status
Order.customerId
Entitlement.customerId
```

Adapt to the actual schema.

---

# 89. Security / IDOR Prevention

Never trust browser-provided customerId, playerId, or musicLicenseId.

For customer actions verify:

```text
player.customerId === authenticatedCustomer.id
AND
player.status === ACTIVE
AND
player supports music licensing
```

Explicitly test that a customer cannot select another customer's player in cart, view another player's library, buy/assign music for another customer, access another player's delivery, initiate another customer's transfer, or access another customer's support context.

UI hiding is not security.

---

# 90. Transaction Safety

Music purchase fulfillment should create/update Order state, EntitlementSource, MusicLicense, royalty allocation, and CustomerActivity in an idempotent transactional workflow where practical.

A failed bundle fulfillment must be safely recoverable.

---

# 91. Migration Safety

Before production migration:

- create database backup
- dry-run migration
- validate row counts
- produce migration report
- do not delete old ownership fields until new behavior is verified
- use temporary dual-read only if necessary

Do not perform an irreversible all-at-once refactor.

---

# 92. Feature Flag / Staged Rollout

If practical, use a temporary flag such as:

```text
PLAYER_BOUND_MUSIC_LICENSING
```

for staging validation.

Do not leave two contradictory ownership models active indefinitely.

---

# 93. Test Fixtures

Create representative fixtures:

```text
Customer A
- 1 player
- 20 licenses

Customer B
- 2 players
- overlapping licenses

Customer C
- no player
- legacy entitlements

Customer D
- 3 players
- bundle purchases
- additional-player copies

Customer E
- retired player + replacement
```

---

# 94. Required Tests

At minimum test:

```text
one-player customer can buy with minimal friction
multi-player customer must choose target
customer cannot target another customer's player
same-player duplicate purchase is prevented
same arrangement may be licensed to a second player
additional-player price is server-authoritative
bundle completion is calculated per player
bundle purchase creates atomic MusicLicense rows
Stripe fulfillment is idempotent
Entitlement alone cannot authorize delivery for unrelated player
ACTIVE MusicLicense authorizes only its licensed player
customer cannot self-transfer
admin can transfer library with permission
transfer history is preserved
replacement retires old player and moves/reissues licenses correctly
historical order target snapshot remains unchanged after transfer
starter content creates MusicLicense
legacy one-player account migrates deterministically
legacy multi-player account is not guessed
software license remains separate from music license
support shows only customer's own players
activation secrets remain protected
future delivery lookup uses player-specific MusicLicense
```

Preserve all Phase 1–3 tests.

---

# 95. Future Player API Contract

Do not implement the Player API in this phase unless it is already part of separate work.

Future API must be able to:

```text
authenticate Customer
+
receive registrationIdentifier
      ↓
resolve exact player
      ↓
verify player belongs to Customer and is ACTIVE
      ↓
return only ACTIVE MusicLicenses for that player
```

Do not return every Customer Entitlement as the player library.

---

# 96. Future Player Sync

Architecture must support:

```text
Player login
      ↓
validate customer + player registration
      ↓
fetch player-specific library
      ↓
compare local files
      ↓
request missing licensed arrangements
      ↓
select/generate protected DMI
      ↓
download
      ↓
permanent offline playback
```

---

# 97. Recommended Routes

Adapt existing routes rather than duplicating them.

Customer:

```text
/account
/account/players
/account/players/[playerId]
/account/players/[playerId]/music
/account/music
/account/software
/account/orders
/account/support
/account/profile
/shop
/shop/arrangements/[slug]
/shop/bundles/[slug]
```

Admin:

```text
/admin/customers
/admin/customers/[id]
/admin/players
/admin/players/[id]
/admin/music-licenses
/admin/music-license-transfers
/admin/music-license-migration
/admin/orders
/admin/software
/admin/support
```

Use current route conventions where appropriate.

---

# 98. Site-Wide UX Review Is Mandatory

Do not only add new pages.

Review and update:

- main navigation
- account navigation
- account dashboard
- breadcrumbs
- shop CTAs
- arrangement pages
- bundle pages
- player selectors
- cart
- checkout
- purchase confirmation
- order details
- music library
- software pages
- support forms
- CRM
- admin navigation
- search
- empty states
- errors
- status badges
- mobile layout

Remove contradictory old wording such as “You own this song” where the real meaning is “Licensed for Living Room Piano”.

---

# 99. Suggested Implementation Order

Implement deliberately:

```text
1. Audit current schema/domain/UI
2. Decide canonical player target model
3. Add MusicLicense + transfer/history models
4. Build migration tooling
5. Migrate unambiguous legacy ownership
6. Build player-aware service/query layer
7. Update server-side pricing
8. Update cart model
9. Update checkout preparation
10. Update Stripe fulfillment
11. Build reusable PlayerSelector
12. Redesign shop/product/bundle views
13. Redesign My DMI dashboard
14. Redesign player detail + player library
15. Redesign global My Music
16. Update order views/emails
17. Update CRM customer + player views
18. Build replacement/library transfer workflows
19. Update support integration
20. Update delivery/encoding authorization
21. Add permissions/audit
22. Build legacy migration review UI if needed
23. Site-wide terminology cleanup
24. Mobile/accessibility pass
25. Security testing
26. Full regression testing
```

Do not start with cosmetic UI work before understanding the domain and migration rules.

---

# 100. Definition of Done

This overhaul is complete when:

- the canonical DMI player/device model is clear
- each playable arrangement is authorized by a player-specific MusicLicense
- Entitlements remain acquisition history rather than unlimited device authorization
- one-player customers can shop with minimal friction
- multi-player customers clearly choose a target player
- cart and checkout clearly show target players
- bundles work per player
- complete-the-collection works per player
- additional-player pricing is supported
- same-player duplicate purchases are prevented
- legitimate second-player licenses are allowed
- account is redesigned around My DMI / My Players
- every player has a clear music library
- customers can add music naturally from a player page
- global My Music shows which players have each arrangement
- customers cannot self-transfer licenses
- admins can perform controlled replacement/library transfers
- transfer history is preserved
- resale behavior follows a centralized configurable policy
- software licensing remains separate from music licensing
- support is player-aware
- CRM is player-centric
- admin search finds players by registration
- delivery/encoding requires an ACTIVE player-specific MusicLicense
- historical orders remain immutable
- existing purchases are migrated safely
- ambiguous legacy customers are never guessed
- site terminology is coherent and customer-friendly
- mobile/accessibility UX is polished
- all prior music shop, CRM, software, support, Auth0, Stripe, and entitlement functionality still works
- future Player API can fetch a player-specific library without another ownership redesign

---

# Final Customer Experience

The customer should see:

```text
MY DMI

Living Room Piano
284 songs
DMI Player licensed
[ View Player ]
[ Add Music ]

Studio Organ
73 songs
DMI Player licensed
[ View Player ]
[ Add Music ]
```

Buying music:

```text
Dancing Queen

For:
Living Room Piano

€8.95

[ Add to Cart ]
```

Already licensed:

```text
✓ Already on Living Room Piano
```

Licensed only on another player:

```text
Already on Studio Organ

Add to Living Room Piano
Additional-player price €3.95

[ Add to This Player ]
```

Replacing hardware:

```text
Need to replace this player?
[ Contact Support ]
```

The customer never needs to understand entitlement tables, transfer records, encryption artifacts, or backend licensing mechanics.

---

# Final Admin Experience

Admin opens a customer and immediately sees:

```text
PLAYERS

Living Room Piano
Registration ••••91PL
284 music licenses
ACTIVE

Studio Organ
Registration ••••83KA
73 music licenses
ACTIVE
```

Opening a player provides:

```text
Identity
Software
Music Library
License History
Orders
Deliveries
Support
Activity
```

Authorized staff can add music, inspect source, retire/replace/transfer player, transfer a full library, create legitimate additional licenses, and see support history.

Every sensitive action must be permission-checked and audited.

---

# Final Product Goal

The stricter licensing rule must feel **simple and fair**, not bureaucratic.

The platform should naturally communicate:

> Your music library is licensed to the DMI player it was purchased for.

> If you own another player, you can add the music to that player under the applicable additional-player pricing.

> If your player is replaced, DMI Support can move your library through a controlled replacement process.

This player-centric model becomes the foundation for the storefront, customer account, CRM, delivery security, and future Player API.
