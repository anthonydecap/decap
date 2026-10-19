# DMI Shop — Phase 2 Implementation
## Customer CRM, Registered Players, Staff/Admin Management & Support Ticketing

Continue development of the existing DMI Shop platform.

Phase 1 is already implemented and working. Preserve the existing architecture and functionality wherever possible.

Existing core stack:

- Next.js
- TypeScript
- PostgreSQL
- Prisma
- Auth0
- Stripe
- Entitlements
- Vercel Blob
- Existing catalog / arrangements / bundles / checkout / admin functionality

This phase must extend the platform into a proper operational system for managing:

- customers
- business customers
- billing information
- registered DMI players
- player types
- staff/employees/admin users
- permissions
- customer support tickets
- CRM notes
- customer activity
- staff tasks/follow-ups
- customer communication history

Do not unnecessarily rewrite working Phase 1 functionality.

The Player API is still **out of scope**.

However, the database must be prepared for the future Player API.

---

# 1. Architectural Principles

Keep these concepts separate:

```text
Auth0
    Identity / Authentication

Customer
    Business/customer CRM record

StaffAccount
    Employee/admin authorization

RegisteredPlayer
    Physical/software player belonging to customer

Entitlement
    What arrangements customer owns

Order
    What customer purchased and paid for

SupportTicket
    Customer service conversation

CustomerActivity
    CRM history/timeline
```

Auth0 answers:

```text
Who is this person?
```

Our PostgreSQL database answers:

```text
Is this person a customer?
Is this person an employee/admin?
What permissions do they have?
What players belong to them?
What music do they own?
What orders have they placed?
What support history exists?
```

Do not store commerce/CRM authorization state inside Auth0 unless technically necessary.

Use the Auth0 `sub` as the stable external identity reference.

---

# 2. Auth0 Identity Relationship

A person may be:

```text
Customer only
Staff only
Customer AND Staff
```

Do not assume these are mutually exclusive.

For example, an employee might also personally own a DMI player and purchase music.

Conceptually:

```text
Auth0 Identity
sub = auth0|abc123
       │
       ├── Customer
       │
       └── StaffAccount
```

The same Auth0 identity may therefore have both records.

Do not duplicate Auth0 users.

Do not create a second authentication system for administrators.

---

# 3. Enhanced Customer Model

The Customer model becomes the central CRM entity.

It must support both:

```text
INDIVIDUAL
BUSINESS
```

Suggested fields:

```text
Customer

id
authSubject

accountType

email
firstName
lastName
phone?

companyName?
companyRegistrationNumber?
vatNumber?
vatCountryCode?

stripeCustomerId?

preferredLanguage?
preferredCurrency?

crmStatus
customerSource?

marketingConsent
marketingConsentAt?

createdAt
updatedAt
archivedAt?
```

Suggested CRM statuses:

```text
PROSPECT
CUSTOMER
ACTIVE
INACTIVE
ARCHIVED
```

Do not use CRM status to determine entitlement ownership.

CRM status is operational information.

---

# 4. Customer Profile / Signup Flow

Auth0 remains responsible for signup credentials.

Do not try to put all billing/business fields into Auth0.

Recommended flow:

```text
Auth0 Sign Up
    ↓
First successful login
    ↓
Create/find Customer
    ↓
Complete Customer Profile
```

Customer profile should collect normal ecommerce information.

For an Individual:

```text
First name
Last name
Email
Phone
Billing address
Country
```

For a Business:

```text
Contact first name
Contact last name
Company name
Company registration number if applicable
VAT number
VAT country
Email
Phone
Billing address
Country
```

The customer can change these fields later through:

```text
/account/profile
```

---

# 5. Billing Address

Use structured addresses.

Suggested model:

```text
CustomerAddress

id
customerId

type
BILLING | OTHER

name?
companyName?

addressLine1
addressLine2?

postalCode
city
stateOrProvince?
countryCode

isDefault

createdAt
updatedAt
```

Use ISO country codes.

Do not store the full address as one text field.

---

# 6. Historical Order Billing Snapshot

Existing orders must never dynamically depend on the customer's current address.

When an order is created, store an immutable billing snapshot.

Example:

```text
OrderBillingSnapshot

orderId

customerName
companyName?
vatNumber?

email

addressLine1
addressLine2?
postalCode
city
stateOrProvince?
countryCode
```

If a customer changes their address next year, historical invoices/orders must still show the original billing information.

---

# 7. Customer Account Pages

Customer account should eventually contain:

```text
/account
/account/profile
/account/orders
/account/library
/account/players
/account/support
```

Keep the design consistent with the existing shop.

---

# 8. Player Registration Concept

The existing DMI player registration mechanism remains offline.

Current process:

```text
Player generates Registration Code
        ↓
Customer sends Registration Code to us
        ↓
Admin enters code into proprietary EXE
        ↓
EXE generates Activation Key
        ↓
Admin gives Activation Key to customer
        ↓
Customer enters key into player
        ↓
Player validates locally
        ↓
Player is registered
```

Do not replace this process.

Do not reverse-engineer the EXE.

Do not recreate the activation algorithm in Next.js.

Do not automatically call the EXE in this phase.

The CRM only stores and manages the registration information.

---

# 9. Registration Terminology

Use consistent terminology.

## registrationCode

Code generated/displayed by the player.

Customer provides this to us.

Admin enters this into the proprietary EXE.

## activationKey

Key generated by the proprietary EXE.

Customer enters this into their player.

Treat this as sensitive information.

## registrationIdentifier

Stable identifier that will eventually be provided by the player when connecting to the future Player API.

Initially this may equal `registrationCode`.

Do not make future online validation depend on `activationKey`.

The activation key exists primarily for offline activation.

---

# 10. Player Types

Create:

```text
PlayerType

id
code
name
description?

active

createdAt
updatedAt
```

Examples might eventually include:

```text
DMI Classic
DMI Organ
DMI Drums
DMI Player Generation 2
```

Do not hard-code these as an enum.

Admins must be able to manage Player Types from:

```text
/admin/player-types
```

Admin can:

```text
create
edit
activate
deactivate
```

Do not delete Player Types already referenced by players.

---

# 11. Registered Player Model

Create:

```text
RegisteredPlayer

id

customerId
playerTypeId

registrationCode
registrationIdentifier

activationKeyEncrypted?

serialNumber?
adminLabel?

status

purchaseDate?
warrantyUntil?
dealerName?

registeredAt?
activatedAt?
suspendedAt?
retiredAt?

createdByStaffId?
updatedByStaffId?

createdAt
updatedAt
```

Recommended statuses:

```text
PENDING
ACTIVE
SUSPENDED
RETIRED
```

A customer can have unlimited RegisteredPlayer records.

Do not put registration fields directly on Customer.

Wrong:

```text
Customer.registrationCode
```

Correct:

```text
Customer
    ├── RegisteredPlayer
    ├── RegisteredPlayer
    └── RegisteredPlayer
```

---

# 12. Player Uniqueness

Normally enforce:

```text
registrationCode UNIQUE
registrationIdentifier UNIQUE
```

If legacy data prevents strict uniqueness, investigate before weakening this rule.

A RegisteredPlayer belongs to one customer at a time.

---

# 13. Admin Player Workflow

Inside:

```text
/admin/customers/{customerId}
```

add a Players section/tab.

Example:

```text
PLAYERS

DMI Classic
Registration: A8F2-73KD-91PL
Status: Active
Registered: 12 Mar 2026

DMI Organ
Registration: FF23-AB91-XD82
Status: Active
Registered: 7 Sep 2026

[ Add Player ]
```

Add Player form:

```text
Player Type
Registration Code
Registration Identifier
Serial Number
Purchase Date
Warranty Until
Dealer
Admin Label
Internal Notes
Status
```

Registration workflow:

```text
1. Admin receives Registration Code.
2. Admin creates/opens player's CRM record.
3. Admin copies Registration Code.
4. Admin manually enters it into proprietary EXE.
5. EXE returns Activation Key.
6. Admin enters Activation Key in CRM.
7. Admin marks player ACTIVE.
8. CRM records the activity.
```

---

# 14. Activation Key Security

Activation keys are sensitive.

If stored, encrypt them at application level.

Use authenticated encryption with a server-side secret.

Do not store them using a one-way password hash because support staff may need to retrieve an existing key.

Requirements:

```text
never log activationKey
never return it in generic APIs
never expose it to customer-facing pages
do not preload it in admin tables
only reveal through explicit privileged action
audit reveal/copy actions where practical
```

UI:

```text
Activation Key

••••-••••-••••-••••

[ Reveal ] [ Copy ]
```

---

# 15. Customer Player Page

Add:

```text
/account/players
```

Customers may view their registered players.

Example:

```text
MY PLAYERS

DMI Classic

Registration
****-****-91PL

Status
Active

Registered
12 March 2026
```

Customer cannot:

```text
add player
delete player
edit player
change registration
change type
change status
see activation key
transfer player
```

It is read-only.

---

# 16. Player History

Do not delete old players.

Replacing a player's hardware should generally create a new RegisteredPlayer record and retire the old record.

This history is important for support.

---

# 17. Player Transfer

Do not implement casual reassignment.

Changing a player from one customer to another should eventually be a dedicated transfer action.

For now:

- restrict transfer to SUPER_ADMIN
- require explicit confirmation
- require a reason
- create audit/activity record

Never silently edit `customerId`.

---

# 18. Future Player API Preparation

Do not implement the Player API yet.

But design for this future check:

```text
Auth0 identifies Customer A

Player sends:
registrationIdentifier = XYZ789

Server verifies:

RegisteredPlayer.customerId == Customer A
AND
RegisteredPlayer.registrationIdentifier == XYZ789
AND
RegisteredPlayer.status == ACTIVE
```

If yes, the player belongs to the customer. Otherwise reject.

This is why customers may not attach arbitrary players themselves.

---

# 19. Staff / Employee Accounts

Implement a proper Staff system.

Do NOT use:

```text
Customer.isAdmin = true
```

Do NOT use a single generic `isAdmin` boolean as the authorization model.

Create:

```text
StaffAccount

id
authSubject

displayName?
email

status

createdAt
updatedAt

createdByStaffId?
```

Suggested statuses:

```text
ACTIVE
SUSPENDED
DISABLED
```

Staff authorization belongs in our database.

Auth0 remains the authentication provider.

---

# 20. Staff Roles

Implement role-based access control.

Recommended built-in roles:

```text
SUPER_ADMIN
ADMIN
SUPPORT
CATALOG_MANAGER
FINANCE
```

## SUPER_ADMIN

Can access everything.

Only SUPER_ADMIN can manage staff accounts, promote users to staff, remove staff access, change staff roles, manage highly sensitive settings, and transfer players between customers.

There should always be at least one active SUPER_ADMIN.

Do not allow the final SUPER_ADMIN to remove their own super-admin access accidentally.

## ADMIN

Employee with access to most operational functionality, including customers, CRM, players, orders, entitlements, support, catalog, arrangements, bundles, imports and basic reporting.

ADMIN should not automatically manage SUPER_ADMIN users, critical platform configuration or infrastructure secrets.

## SUPPORT

May access customers, customer contact data, registered players, support tickets, customer notes, customer activity, orders read-only and entitlements read-only.

May reply to tickets, add CRM notes and create follow-up tasks.

## CATALOG_MANAGER

May access works, arrangements, bundles, arrangers, assets, bulk imports and publishing.

Should have limited customer access and no automatic access to activation keys/private CRM information.

## FINANCE

May access orders, payments, refund workflows, billing data, VAT information, arranger royalties and financial reporting.

Should not automatically access sensitive player activation keys.

---

# 21. Permission Model

Do not rely only on UI hiding.

Every server action/API route must check permissions server-side.

Prefer capability-based checks internally, for example:

```text
CUSTOMER_READ
CUSTOMER_WRITE

PLAYER_READ
PLAYER_WRITE
PLAYER_ACTIVATION_KEY_READ

SUPPORT_READ
SUPPORT_REPLY
SUPPORT_ASSIGN

CATALOG_READ
CATALOG_WRITE
CATALOG_PUBLISH

ORDER_READ
REFUND_CREATE

ENTITLEMENT_READ
ENTITLEMENT_GRANT
ENTITLEMENT_REVOKE

STAFF_READ
STAFF_MANAGE

FINANCE_READ
```

Roles map to permissions.

---

# 22. Staff Management UI

Add:

```text
/admin/staff
```

SUPER_ADMIN can:

```text
view employees
add/promote employee
assign role(s)
change permissions where supported
suspend employee
remove staff access
review staff activity
```

---

# 23. Promote Existing User to Staff

SUPER_ADMIN must be able to search an existing authenticated customer/user and grant staff access.

Creating StaffAccount must not remove or alter their Customer account.

A person may remain both Customer and StaffAccount.

---

# 24. Invite New Employee

If practical with the existing Auth0 setup, support an Invite Employee flow.

The employee receives an invitation to create/sign into an Auth0 identity.

After successful login, connect that `authSubject` to the pre-created StaffAccount.

Do not create or store employee passwords.

If invitation functionality is too invasive, it is acceptable to require the employee to first create an ordinary Auth0 account and then let SUPER_ADMIN promote that account.

---

# 25. Admin Navigation

Admin navigation must adapt to staff permissions.

Example:

```text
Dashboard
Customers
Support
Orders
Catalog
Arrangements
Bundles
Imports
Arrangers
Royalties
Staff
Settings
```

Do not show inaccessible sections.

UI hiding is convenience only. Server-side authorization is mandatory.

---

# 26. MFA for Staff

Strongly prefer MFA for staff/admin accounts.

At minimum:

```text
SUPER_ADMIN → MFA required
ADMIN → MFA strongly recommended / required if existing Auth0 configuration supports it
```

Use Auth0 capabilities. Do not implement custom MFA.

---

# 27. CRM Customer Detail Page

Make the customer detail page the main CRM workspace.

Suggested tabs:

```text
Overview
Contact & Billing
Players
Orders
Library
Support
Notes & Activity
Tasks
```

---

# 28. CRM Overview

Show customer name, company, account type, CRM status, tags, email, phone, customer since, lifetime spend, order count, owned arrangements, active players, open support tickets, last purchase, last activity and next task.

Avoid expensive repeated calculations where possible.

---

# 29. Customer Tags

Create CustomerTag and CustomerTagAssignment models.

Examples:

```text
VIP
Dealer
Legacy Customer
Organ Customer
Drum Customer
Needs Follow-up
Special Configuration
```

Tags have no authentication or entitlement meaning.

---

# 30. Important CRM Flags

Allow important internal alerts such as:

```text
⚠ Special player configuration
⚠ Do not retire old registration
⚠ Requires manual DMI encoding
⚠ Important dealer account
```

These should appear prominently on the CRM customer overview.

---

# 31. Internal CRM Notes

Create CustomerNote with customerId, body, createdByStaffId, createdAt and optional updatedAt.

Customer notes are internal and must never be shown to customers.

---

# 32. Staff Tasks / Follow-ups

Create CustomerTask with customerId, optional registeredPlayerId/supportTicketId, title, description, status, priority, assignedStaffId, dueAt, completedAt, createdByStaffId and timestamps.

Statuses:

```text
OPEN
IN_PROGRESS
DONE
CANCELLED
```

Admin dashboard should have My Tasks, Overdue Tasks, Due Today and Upcoming.

---

# 33. Communication Log

Allow staff to manually record communication outside the ticket system.

Types:

```text
PHONE_CALL
EMAIL
WHATSAPP
IN_PERSON
OTHER
```

This is for recording external contact and is not a replacement for SupportTicket messages.

---

# 34. Customer Activity Timeline

Create an aggregated chronological CRM timeline.

Important events should appear automatically, including account created, billing updated, orders paid/refunded, entitlements granted/revoked, players added/activated/suspended/retired, support events, notes, tasks and communications.

Store machine-readable event types plus metadata.

---

# 35. Customer Support System

Implement first-class customer support inside the account at:

```text
/account/support
```

Logged-in customers should be encouraged to use this instead of emailing directly.

---

# 36. New Support Request

Route:

```text
/account/support/new
```

Fields:

```text
Subject
Category
Related Player?
Related Order?
Related Arrangement?
Message
Attachments?
```

Customer should not need to enter their own name/email again.

---

# 37. Support Categories

Suggested internal categories:

```text
PLAYER_REGISTRATION
PLAYER_PROBLEM
MUSIC_DOWNLOAD
MUSIC_PLAYBACK
ORDER_PAYMENT
ARRANGEMENT_QUESTION
ACCOUNT
BILLING
REFUND_REQUEST
OTHER
```

Use friendly customer-facing labels.

---

# 38. Link Ticket to Player

Customer can optionally choose one of their own players.

Customer cannot type an arbitrary registration ID.

Validate ownership server-side.

---

# 39. Link Ticket to Order

Customer may select one of their orders.

Server must verify the order belongs to the authenticated customer.

---

# 40. Link Ticket to Arrangement

Customer may select an arrangement from their library/entitlements.

Server must verify appropriate ownership/access.

---

# 41. Support Ticket Model

Create SupportTicket with:

```text
id
ticketNumber
customerId
registeredPlayerId?
orderId?
arrangementId?
category
subject
status
priority
assignedStaffId?
createdAt
updatedAt
firstResponseAt?
lastCustomerReplyAt?
lastStaffReplyAt?
resolvedAt?
closedAt?
```

Ticket number should be human-friendly, e.g. `SUP-1042`.

---

# 42. Ticket Statuses

Use:

```text
OPEN
IN_PROGRESS
WAITING_FOR_CUSTOMER
WAITING_FOR_SUPPORT
RESOLVED
CLOSED
```

Use customer-friendly status labels.

---

# 43. Ticket Priority

Internal priorities:

```text
LOW
NORMAL
HIGH
URGENT
```

Customers generally do not choose priority.

---

# 44. Ticket Messages

Create SupportMessage with ticketId, authorType, customerId/staffId, visibility, body and timestamps.

Ticket conversation must not be one editable text field.

Messages should form an immutable chronological conversation.

---

# 45. Customer Ticket View

Make the UX friendly and conversational.

Customers should see ticket number, subject, status, related player/order/arrangement, customer-visible conversation, reply box and attachments.

---

# 46. Ticket Attachments

Store support attachments in a separate private Vercel Blob namespace, not with music masters, DMI delivery files or public previews.

Use file type allowlists and reasonable size limits.

---

# 47. Admin Support Inbox

Route:

```text
/admin/support
```

Columns:

```text
Ticket
Customer
Subject
Player
Status
Priority
Assigned To
Last Activity
Age
```

Useful filters include Needs staff reply, Unassigned, My tickets, In progress, Waiting for customer, High priority, Registration, Player problem, Billing, Resolved and Closed.

---

# 48. Ticket Assignment

Staff with permission can assign tickets.

Support users should have My Tickets.

Track assignment changes.

---

# 49. Internal Ticket Notes

Staff needs two actions:

```text
Reply to Customer
Add Internal Note
```

Never expose internal notes to customers.

---

# 50. Ticket Status Automation

Use sensible automatic transitions:

- customer creates ticket → WAITING_FOR_SUPPORT
- staff asks customer for information → WAITING_FOR_CUSTOMER
- customer replies → WAITING_FOR_SUPPORT
- staff starts work → IN_PROGRESS
- staff resolves → RESOLVED
- recent resolved ticket can reopen on customer reply
- CLOSED normally remains closed

---

# 51. Ticket Creation Confirmation

After submitting, show a proper confirmation containing ticket number, subject, current status, link to view request and explanation that the customer will be notified of replies.

---

# 52. Support Email Notifications

The ticket system is the source of truth.

Email is notification only.

Send customer notifications for ticket creation, staff reply, information request and resolution.

Email should direct the customer back to the ticket in their account.

Reuse existing transactional email infrastructure. If none exists, implement an EmailService abstraction.

---

# 53. No Inbound Email Parsing Yet

Do not build email-to-ticket reply processing in this phase.

Customer clicks email notification, signs in, opens ticket and replies there.

---

# 54. Support in CRM

Customer CRM page must show support history.

Support events must also appear in Customer Activity.

---

# 55. Support on Player Record

Registered Player detail should show its related tickets to create a complete service history per machine.

---

# 56. Customer Dashboard Support Card

Customer account dashboard should show open ticket count and recent support requests.

---

# 57. CRM Search

Admin customer search should support where practical:

```text
name
email
company
VAT number
phone
registration code
registration identifier
serial number
order number
ticket number
```

Searching a player registration and reaching the correct customer quickly is particularly important.

---

# 58. CRM Saved Filters / Views

Provide useful views such as Business customers, Customers with active players, Customers with no player, Customers with open tickets, Customers requiring follow-up, Customers with overdue tasks, Inactive customers, Recent customers and High-value customers.

---

# 59. Customer Source

Support optional customerSource values:

```text
WEBSITE
DIRECT_SALE
DEALER
REFERRAL
TRADE_SHOW
LEGACY_IMPORT
OTHER
```

---

# 60. Customer Documents

Optionally support internal customer/player attachments such as service documents, registration paperwork, invoice copies, machine photos and configuration documents.

Store privately and separately from music/support files.

---

# 61. Privacy / GDPR

Track where needed:

```text
marketingConsent
marketingConsentAt
termsAcceptedAt?
privacyPolicyAcceptedAt?
```

Do not assume a customer account equals marketing consent.

Design so data export/anonymization can be added later.

---

# 62. Audit Logging

Important admin/staff actions must be auditable, including staff role changes, staff suspension, customer changes, player changes, activation key reveals, entitlement changes, refunds and support administration.

Do not store secrets such as activation keys in audit metadata.

---

# 63. Admin Dashboard

Enhance dashboard with operational information:

```text
Support
Tasks
Customers
Recent Orders
Player registrations
```

Keep this operational rather than building a BI platform.

---

# 64. Security Rules

Customer-facing routes must always derive Customer from authenticated Auth0 identity.

Never trust customerId/player ownership/ticket ownership from browser input.

Admin authorization requires:

```text
Auth0 authenticated
+
active StaffAccount
+
required permission
```

No authorization should rely solely on frontend state.

---

# 65. Staff Session Security

If an Auth0 user is authenticated but has no active StaffAccount, `/admin/*` must be denied.

If StaffAccount is SUSPENDED or DISABLED, deny admin access immediately.

---

# 66. Bootstrap First SUPER_ADMIN

Implement one safe controlled mechanism for establishing the first SUPER_ADMIN.

After bootstrap, staff management should happen through the admin UI.

Do not permanently authorize admins through a hard-coded email list.

---

# 67. Database Indexes

Add indexes for common customer, staff, player, support, task, activity, order and entitlement lookups.

Registration codes/identifiers should be indexed and normally unique.

---

# 68. Existing Data Migration

Do not break existing users.

Preserve existing Auth0 accounts, Customer records, orders, entitlements and Stripe customer links.

Backfill new optional CRM fields safely.

Existing legacy players can be entered manually or imported later.

---

# 69. Explicit Non-Goals

Do NOT implement yet:

```text
Player API
/api/player/v1/*
Auth0 Device Authorization for player
automatic player login
automatic library synchronization
automatic DMI download
automatic player ownership validation over API
automatic activation EXE invocation
automatic activation-key generation
device-specific DMI encoder integration
marketing automation
newsletter campaigns
AI support agents
email reply parsing
complex sales pipeline / opportunity management
```

---

# 70. Testing Requirements

Add tests for critical security and authorization behavior, including customer isolation, player immutability from customer UI, activation-key secrecy, admin role restrictions, staff suspension, support internal-note privacy, attachment authorization and billing snapshot immutability.

Preserve existing Phase 1 tests.

---

# 71. Final Customer CRM Experience

Opening a customer in admin should answer, from one place:

```text
Who is this customer?
Private or business?
What are their contact and billing details?
What players do they own?
What are the registration details?
What music do they own?
What have they purchased?
How much have they spent?
What support issues have they had?
What happened to each player?
What notes have staff made?
What communication has happened?
Is there anything we need to follow up on?
Who on our staff is handling it?
```

This is the purpose of the CRM.

---

# 72. Final Staff Experience

An employee with ADMIN access should be able to sign in with their normal Auth0 identity and access most daily operational features.

The system should feel like one internal application:

```text
ADMIN DASHBOARD

Customers
Players
Support
Orders
Entitlements
Catalog
Bundles
Imports
Arrangers
Royalties
Tasks
```

SUPER_ADMIN additionally receives:

```text
Staff
Permissions
Sensitive platform administration
```

Employee access is granted and revoked by SUPER_ADMIN.

No employee should need a separate admin password.

---

# 73. Implementation Approach

Before changing code:

1. Inspect the existing repository.
2. Inspect the existing Prisma schema.
3. Inspect current Auth0 integration.
4. Inspect current admin authorization.
5. Inspect existing Customer/Address/Order/Entitlement models.
6. Reuse existing concepts where appropriate.
7. Do not duplicate models unnecessarily.
8. Create migrations incrementally.
9. Preserve existing data.
10. Add server-side authorization before exposing new admin features.
11. Reuse the existing application's design system.
12. Implement in small testable stages.

Suggested implementation order:

```text
1. Customer/profile schema enhancements
2. Address + billing snapshot improvements
3. StaffAccount + roles + permissions
4. Staff management/admin security
5. PlayerType
6. RegisteredPlayer
7. Customer CRM page
8. Notes/tags/activity
9. Tasks/communication log
10. Customer read-only Players page
11. SupportTicket models
12. Customer support portal
13. Admin support inbox
14. Ticket notifications
15. Dashboard integration
16. Audit/security review
17. Tests
```

Do not rewrite working Phase 1 functionality simply to match naming in this prompt.

Where equivalent models already exist, extend them.

---

# 74. Definition of Done

Phase 2 is complete when:

- customers have proper personal/business CRM profiles
- billing addresses are stored correctly
- historical orders retain billing snapshots
- a customer may own multiple Registered Players
- admins manage all player registrations
- customers only see their linked players read-only
- registration codes and activation keys are distinct
- activation keys are protected
- Player Types are manageable
- player history is preserved
- staff use the same Auth0 identity platform
- SUPER_ADMIN can promote existing users to staff
- employees can be assigned roles
- normal ADMIN employees can access most operational features
- permissions are enforced server-side
- staff access can be revoked immediately
- customer CRM contains notes, tags, timeline and tasks
- logged-in customers can submit support requests
- customers receive ticket numbers and visible status
- customers can reply to their tickets
- staff have a central support inbox
- staff can assign, reply, add internal notes and resolve tickets
- ticket emails notify customers of activity
- support history is visible on customer and player records
- important staff/customer actions are audited
- existing shop, Stripe, Auth0, catalog, orders, entitlements and checkout remain functional
- database structure is ready for the future Player API without implementing it now
