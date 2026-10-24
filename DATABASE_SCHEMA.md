# Finger-Lickin Database Schema

**Status:** Phase 2 is in progress. The versioned migration implements the
profile, restaurant, membership, and menu foundation described below. Orders,
addresses, payments, delivery, administrator permissions, and other workflows
remain deferred where required business and authorization decisions are open.

## 1. Design rules

- Supabase PostgreSQL is the system of record.
- `auth.users.id` is the identity source. Application profiles reference it;
  authorization does not rely on editable profile text.
- Use UUID primary keys unless a provider requires its own identifier. Store
  provider identifiers separately and never use them as authorization keys.
- Store timestamps as `timestamptz` in UTC. Store currency explicitly on each
  order/payment/financial record and amounts as integer minor units using the
  configured currency exponent. No floating-point monetary columns.
- Persist a versioned financial breakdown and immutable order item/option
  snapshots at purchase time. Mutable catalog rows are not historical truth.
- Use foreign keys, unique/check constraints, and transactions for core
  integrity. Define deletion/retention policy before choosing cascades for
  personal or financial records.
- Enable RLS for client-exposed tables. Default to deny; policies must be
  exercised with anonymous, customer, restaurant-member, and administrator
  test identities.
- Tables below describe logical entities and important fields, not final
  column names or a complete migration unless explicitly marked implemented.

## 1.1 Phase 2 database foundation

Migration `supabase/migrations/20261013175000_phase_2_database_foundation.sql`
implements `profiles`, `restaurants`, `restaurant_memberships`,
`menu_categories`, and `menu_items`. It adds UUID keys, Auth/catalog foreign
keys, restaurant-slug and menu-order constraints, explicit three-letter
currency codes and non-negative integer minor-unit menu prices, and
`timestamptz` creation/update fields. Menu items use a composite
`(category_id, restaurant_id)` foreign key so a restaurant cannot attach an
item to another restaurant's category.

All five tables have RLS enabled. Customers may select/create/update their own
profile; they cannot alter its identity or delete it through the Data API.
Users can read only their own membership rows and cannot create, change, or
revoke memberships. Anonymous and authenticated users can read active
restaurants and published items in active categories; sold-out published
items remain visible with their availability flag. An active restaurant
membership additionally permits reading that restaurant's non-public record,
inactive categories, and unpublished items. Revoked memberships grant no
restaurant/catalog access. Catalog and restaurant writes are denied to
client-facing roles pending a trusted provisioning and partner-management
workflow.

The `public_restaurants`, `public_menu_categories`, and `public_menu_items`
views are narrow, `security_invoker` projections. Public columns are limited
to catalog information intended for browsing; private/profile tables are not
granted to anonymous users. The views do not bypass table RLS. No
`SECURITY DEFINER` function or service-role operation is introduced. The
private-schema `updated_at` trigger function uses a fixed `pg_catalog` search
path, does not run with elevated privileges, and is not exposed by the Data
API. Client roles receive no usage or execute grants on the private
schema/function; trigger execution continues through its trigger binding.

This is deliberately not a complete production schema. The migration does not
create any user-selectable role, administrator grant, address, order, payment,
delivery, or audit record, and it does not add policies that imply those
workflows are authorized. See `docs/DECISIONS.md` for blocking decisions and
the remaining model sections for deferred requirements.

## 2. Identity, role, and restaurant tenancy

### `profiles`

- **Implemented:** `user_id` UUID primary key and cascading FK to
  `auth.users(id)`; optional display name; creation/update timestamps.
- Contact details, locale/preferences, and account status are not included
  because their requirements are not defined.
- A profile can be read or edited only by its owning authenticated user.
- Do not duplicate auth credentials or store passwords.

### `customer_profiles`

- `user_id` PK/FK to profiles; optional customer-specific preferences.
- Customer existence/role is not granted solely by inserting this row.

### `restaurant_applications`

- Applicant user FK; submitted business/contact/location data; restricted
  onboarding/document references; review status, reviewer, reason,
  submission/review timestamps.
- Status check: `draft`, `submitted`, `under_review`, `approved`, `rejected`,
  `withdrawn` (final workflow may refine).
- Applicant may read/edit only permitted pre-review fields; authorized
  administrators may review. Submitted sensitive material has narrow access.

### `restaurants`

- **Implemented:** UUID ID, unique lowercase slug, name, public description,
  time zone, `draft`/`pending`/`active`/`suspended`/`closed` status, and
  creation/update timestamps.
- Contact fields, address/location, hours, operational availability, imagery,
  and onboarding source are deferred.
- Unique slug; only approved/published/active records are public.
- In this foundation, only `active` is public. Restaurant activation is not
  client-writable; who may approve or activate a restaurant remains unresolved.
- Provider-specific service coverage is deferred rather than represented by
  an invented geospatial provider contract.

### `restaurant_memberships`

- **Implemented:** UUID ID, restaurant and Auth-user FKs, `active`/`revoked`
  state, creation/update timestamps, and nullable revocation time. There is
  one retained membership row per restaurant/user pair.
- No owner/staff role, permission set, inviter, or administrator grant is
  present. Membership rows cannot be inserted or changed by client roles.
- Active membership is checked against the database relation in RLS; a
  user-supplied role or restaurant ID does not confer access.

### `admin_memberships` or equivalent protected role assignment

- User FK, explicit permission set, grant/revoke actors and timestamps.
- No public self-assignment; changes audited.
- Prefer constrained role/permission records over a user-editable
  `is_admin` profile boolean.

## 3. Catalog and media

### `cuisines` and `restaurant_cuisines`

- Curated cuisine taxonomy and many-to-many restaurant assignments.
- Unique normalized cuisine key; only active taxonomy entries appear publicly.

### `menu_categories`

- **Implemented:** UUID ID, restaurant FK, name, optional description,
  non-negative display order, active flag, and creation/update timestamps.
- Public rows require an active restaurant and active category. A member of
  that restaurant can also read inactive categories.
- An index orders categories by restaurant, display order, and ID.

### `menu_items`

- **Implemented:** UUID ID, restaurant and category references, name,
  optional description, non-negative `bigint` base price in integer minor
  units, explicit uppercase three-letter currency code, published and
  available flags, non-negative display order, and creation/update
  timestamps. The composite category FK enforces matching restaurant
  ownership.
- Public reads exclude unpublished items, inactive categories, and
  non-active restaurants. Published sold-out items remain visible.
- No currency set, currency exponent, search strategy, or price calculation
  is implied by the three-letter format check.
- Image references, modifiers, and catalog versioning are deferred.

### `modifier_groups` and `modifier_options`

- Group belongs to a menu item; name, required flag, minimum/maximum choices,
  display order, active state.
- Option belongs to a group; label, price delta, availability, display order.
- Constraints: minimum is non-negative; maximum is at least minimum; option
  ownership follows the parent item's restaurant. Application validation
  additionally ensures submitted choice count and availability are valid.

### `storage_objects` or controlled object references

- Store object path, owner scope, content type/size metadata, purpose, and
  status only if needed beyond Supabase Storage metadata.
- Storage policies prevent unauthorized uploads/replacements and cross-tenant
  writes. Public access is limited to approved published assets.
- Do not store executable uploads; validate content, not only filename.

## 4. Customer addresses, favorites, and cart

### `customer_addresses`

- Deferred. Customer user FK; recipient/contact fields, address lines, locality,
  postal/region/country fields needed by the confirmed market, optional
  coordinates only with explicit privacy/retention rules, delivery notes,
  label/default flag, validation/serviceability metadata, timestamps.
- Address is private to its owner and authorized fulfillment operations.
- At most one default address per customer, enforced transactionally or with a
  partial unique index.

### `favorites`

- Customer FK and restaurant FK; unique pair; customer-only access.

### `carts` and `cart_items` (if carts are persisted)

- Cart owner/session policy to be decided; restaurant FK, currency, status,
  expiry/version; items reference menu item and store quantity and selected
  modifier intent.
- Unique active cart as appropriate. Enforce one restaurant per cart.
- A cart is intent, not a financial record. Recalculate all prices from current
  canonical menu/policy records at quote and checkout.
- If guest carts are not approved, carts require a customer identity.

### `price_quotes` (optional persisted quote)

- Owner/session, restaurant, currency, item/fee/discount breakdown, policy and
  menu versions, expiry, generated time, and eligibility context.
- Quote is not a guarantee after expiry or final revalidation.
- Avoid retaining unnecessary address data in quote rows.

## 5. Orders and fulfillment

### `orders`

- Deferred. Unique public reference; customer FK (nullable only if approved guest
  checkout); restaurant FK; address/contact snapshot appropriate for fulfillment;
  currency; immutable item subtotal, discount, delivery fee, service/platform
  fee, applicable tax/tip, grand total; policy versions; order, payment,
  restaurant-acceptance, preparation, and delivery states; created/updated and
  lifecycle timestamps.
- Each order references exactly one restaurant.
- Check non-negative monetary components and validate the complete arithmetic
  in one shared server-side money policy. Avoid brittle SQL assumptions if
  fee semantics vary; record both component values and calculation version.
- Customer can read only own orders; restaurant members can read only their
  restaurant's operationally necessary fields; administrator access is
  permission-scoped and audited.

### `order_items`

- Order FK; nullable catalog item reference for historical association; item
  name/description snapshot, unit base price, quantity, line total, currency,
  and any required catalog identifiers.
- Quantity is positive; all historical display/pricing fields are immutable
  after order acceptance/creation except through an explicit audited correction
  record.

### `order_item_options`

- Order item FK; option/group labels and price deltas captured as text/value
  snapshots plus optional source IDs; selection quantity where supported.
- Preserves chosen options even if catalog records are renamed or deleted.

### `order_status_events`

- Order FK; prior/new state, reason, actor type/ID, source (user, restaurant,
  administrator, provider, system), safe metadata, timestamp, correlation ID.
- Append-only for ordinary application roles. State transition is validated
  before event and current-state update commit together.

### `delivery_jobs` / `delivery_attempts` / `delivery_events`

- Internal order FK; provider key, request/attempt ID, provider delivery
  reference, quote/cost/currency and expiry, requested/accepted/cancelled state,
  tracking reference/URL only if safe and documented, normalized status,
  timestamps, error category, retry count.
- Unique provider reference/idempotency scope where supported.
- Never claim booked/collected/delivered without verified provider result.
- Keep raw provider payloads only when necessary, access-restricted, redacted,
  and retained according to a defined schedule.

## 6. Payments and financial records

### `payment_attempts`

- Deferred. Order FK; provider, unique internal/provider reference, expected amount and
  currency, status (`created`, `initializing`, `pending`, `succeeded`,
  `failed`, `cancelled`, `unknown`, `refunded` as a summary), provider
  transaction ID, safe metadata, timestamps.
- A reference is unique in the provider/account scope. Expected amount/currency
  is copied from the persisted order snapshot and cannot be taken from browser
  input.
- Keep provider transaction status separate from order and fulfillment status.

### `payment_webhook_events`

- Provider/account scope, provider event ID or stable deduplication key,
  received time, signature verification result, event type, associated
  provider reference, processing status, attempts, redacted payload or secure
  payload reference, processed time/error category.
- Unique `(provider, account_scope, provider_event_id)` where the provider
  supplies a stable event identifier; otherwise use a documented dedupe design.
- Unverified event data never mutates financial state. Acknowledge/retry
  behavior follows the selected provider's current webhook contract.

### `refunds`

- Order/payment attempt FK; internal idempotency key, amount/currency, reason,
  requested/approved actors, provider refund reference, state, timestamps.
- Positive amount no greater than remaining refundable amount; serialize or
  otherwise guard concurrent refunds. Approval threshold/dual control is a
  launch decision.
- Refund request, provider acceptance, and completed refund are distinct states.

### `financial_ledger_entries`

- Immutable accounting-style entries linked to order, payment, refund,
  commission/fee rule, or settlement. Direction/type, amount/currency, effective
  time, reference, creator/source, and reconciliation status.
- Corrections are compensating entries, not destructive edits.
- Final double-entry structure, chart of accounts, tax handling, and accounting
  export requirements require finance review before implementation.

### `commission_rules` and `fee_rules`

- Rule type, restaurant/market scope, percentage/fixed value and currency,
  effective interval, priority, active state, version, creator/approver.
- Resolve one unambiguous applicable rule for a new order; snapshot rule/version
  and computed result on order. Do not retroactively rewrite historical orders.
- Exact commission base and platform fee payer are launch decisions.

### `restaurant_settlements` and `settlement_lines`

- Restaurant, currency, period, payable amount, withheld/refunded/adjustment
  amounts, payout method reference (restricted), state, provider payout
  reference, approval, timestamps, and linked ledger entries.
- Settlement totals reconcile to source entries and cannot silently include
  unreconciled transactions.
- Cadence, threshold, reserves, payout rail, compliance, and dispute treatment
  must be defined before production payouts.

## 7. Promotions, reviews, support, and audit

### `promotions`, `promotion_redemptions`

- Code/rule, scope, validity interval, usage limits, eligibility, discount
  method/value/cap, funding party, currency/market restrictions, active state.
- Redemptions have unique customer/order or campaign/order constraints to
  prevent concurrent reuse. Server-calculated discount and rule version are
  snapshotted to the order.

### `reviews`

- Order/customer/restaurant references, rating, text, moderation state,
  timestamps; eligibility must require the relevant completed order.
- Enforce review count policy (for example, at most one per order) only after
  moderation/product policy is confirmed. Private customer data is not public.

### `support_cases` and `support_messages`

- Customer/order/restaurant association as needed, category, status, assigned
  admin, timestamps, access scope, message author and body.
- Enforce participant scope and redact sensitive data from notifications/logs.

### `audit_logs`

- Actor, permission/action, target type/ID, timestamp, request/correlation ID,
  outcome, and redacted before/after or safe change summary.
- Append-only to application roles; restrict access and define retention.
- Do not log credentials, payment secrets, full card data, or unnecessary
  personal information.

### `outbox_jobs` (or equivalent durable queue record)

- Job type, aggregate reference, idempotency key, safe payload, availability
  time, attempt count, lease/lock, completion/error state, created/updated time.
- Unique idempotency key; retries are bounded and visible for manual recovery.
- This is not a replacement for a durable queue if hosting/runtime limits make
  database polling unsuitable; choose after deployment constraints are verified.

## 8. Relationship summary

```text
auth.users 1—1 profiles
profiles 1—0/1 customer_profiles
profiles 1—many restaurant_memberships many—1 restaurants
profiles 1—many restaurant_applications
restaurants 1—many menu_categories 1—many menu_items
menu_items 1—many modifier_groups 1—many modifier_options
profiles 1—many customer_addresses / carts / favorites / orders
restaurants 1—many orders
orders 1—many order_items 1—many order_item_options
orders 1—many status_events / payment_attempts / delivery_attempts
payment_attempts 1—many webhook_events / refunds / ledger entries
orders 1—many promotion_redemptions / support references / reviews
restaurants 1—many settlement periods 1—many settlement_lines
```

## 9. Important indexes and constraints

Implement and measure indexes based on actual queries; anticipated indexes:

- Unique restaurant slug; `(status, published_at)` for public restaurant
  discovery; location/serviceability index appropriate to the decided model.
- `(restaurant_id, display_order, active)` for categories and menu items.
- Search index for published restaurant/menu text using a chosen PostgreSQL
  strategy; verify language/cuisine and typo-tolerance requirements before
  selecting full-text/trigram/external search.
- `(customer_id, created_at desc)` for addresses/orders/favorites as relevant.
- `(restaurant_id, status, created_at)` for partner incoming orders.
- Unique payment provider reference and provider transaction identity in the
  proper account scope.
- Unique webhook deduplication key; index `(processing_status, received_at)`.
- Unique provider delivery reference where present; `(order_id, created_at)`
  for delivery events.
- `(status, available_at)` for background jobs and retry queues.
- `(restaurant_id, period_start, currency, status)` for settlements.
- Foreign keys for every relationship; checks for positive quantities,
  non-negative values, valid status vocabularies, and sensible time ranges.
- Partial uniqueness for one default address and one applicable active policy
  only if the final policy semantics permit such a constraint.

Avoid indexes on every field. Verify representative query plans and migration
locking behavior as data volume grows.

## 10. RLS and access matrix

| Data | Anonymous | Customer | Restaurant member | Administrator |
|---|---|---|---|---|
| Published restaurant/menu | Read approved public subset | Same | Read public subset plus own management records | Permission-scoped |
| Application/onboarding | None | Own allowed application fields | Own assigned records only | Review permission |
| Customer profile/address | None | Own only | Minimum order fulfillment fields for own restaurant when required | Support/finance permission, audited |
| Cart | None or approved guest-scoped cart | Own | None | Normally none |
| Order | None | Own, privacy-filtered | Own restaurant operational subset | Explicit operational/financial permission |
| Payment/refund/settlement | None | Own safe status | Own restaurant summaries only | Finance permission |
| Audit/webhook raw data | None | None | None | Narrow operational/security permission |
| Storage | Published images only | Own permitted uploads if offered | Own restaurant paths | Explicit moderation/support access |

This matrix is a target, not a substitute for per-table policy design. Test
policies through the same access paths used in production, including API
routes, server actions, Storage, and Realtime. Service-role access bypasses RLS
and therefore requires an independently enforced server authorization check.

Implemented Phase 2 policy coverage is limited to profiles, restaurants,
restaurant memberships, menu categories, and menu items as described in
section 1.1. Customer addresses, orders, payment/delivery records,
administrator permissions, Storage, and Realtime do not yet exist in the
migration. The matrix rows for those entities are targets, not claims of
implemented or tested policy behavior.

## 11. Migration and lifecycle requirements

- Create migrations in source control and run them in CI against a clean
  database. Local migration and test commands are documented in
  `supabase/README.md`.
- Migration files use `YYYYMMDDHHMMSS_description.sql` under
  `supabase/migrations/`. Use `supabase db reset` only with a local Supabase
  stack; it drops and recreates the local database before replaying migrations.
- There is no production link, seed data, or hosted-project migration in this
  phase. Synthetic pgTAP fixtures are transaction-scoped and rolled back.
- Seed only non-sensitive test fixtures; never production credentials or
  personal data.
- Use expand/contract migrations for production changes and avoid destructive
  schema changes until dependent deployments/data are handled.
- Document retention, deletion/anonymization, legal hold, backup, and restore
  behavior before production. Financial/audit records may have different legal
  retention requirements from profiles or support text.
- Keep provider payload schema/version metadata where necessary for safe
  reprocessing; redact or minimize sensitive fields.
