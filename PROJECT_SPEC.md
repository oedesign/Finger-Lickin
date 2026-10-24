# Finger-Lickin Product Specification

**Status:** Product requirements remain planned; the Phase 1 application
foundation and a partial Phase 2 database foundation are present. No customer
ordering, authentication flow, restaurant operations, or provider integration
is implemented.

**Product:** Finger-Lickin  
**Product type:** Multi-restaurant food ordering and delivery marketplace

## 1. Product purpose and scope

Finger-Lickin connects customers with independent restaurants for online food
ordering and delivery coordinated through an external delivery provider. The
application comprises:

- A public customer storefront and authenticated customer account.
- A restaurant partner portal for restaurant owners and authorized staff.
- An administrator operations dashboard with explicit, auditable permissions.
- A server-side application, PostgreSQL database, secure file storage, payment
  integration, delivery-provider adapter, and operational tooling.

The initial architecture is a modular monolith. It is not a homepage-only
website, an in-house courier fleet, or a set of microservices.

## 2. Users and authorization boundaries

| Actor | Intended access |
|---|---|
| Public visitor | Browse published restaurants, menus, and food details; maintain an unauthenticated cart only if the final checkout policy allows it. |
| Customer | Manage their own account, addresses, favorites, carts, orders, reviews, and support requests. |
| Restaurant owner | Manage only restaurants explicitly assigned to them, their approved profile/menu, staff, and restaurant orders and reports. |
| Restaurant staff | Perform only the actions granted by their restaurant membership and role. |
| Administrator | Perform only platform operations granted by an explicit administrator permission set. |
| System integration | Execute narrow, authenticated server-side operations for payment, delivery, and notification providers. |

The backend is authoritative. UI visibility is not authorization. A user may
not access another customer's private data or another restaurant's
non-public data by changing an identifier in a URL or request.

## 3. Customer website requirements

### 3.1 Discovery and restaurant browsing

- Responsive landing page with a promotional hero, location/serviceability
  entry point, featured content, and clear restaurant discovery actions.
- Restaurant listing and cuisine/category browsing pages.
- Search across restaurants and, when supported by the query model, menu items.
- Sorting and filters for configured attributes such as cuisine, delivery
  availability, rating, price range, estimated delivery window, or promotions.
  Only filters backed by reliable data will be exposed.
- Restaurant cards communicate open/closed state and relevant delivery
  information without implying a guaranteed arrival time.
- Restaurant detail pages contain approved profile information, service hours,
  availability, full menu categories, item descriptions, prices, and
  availability state.
- Food detail pages present supported options, required/optional selections,
  quantity, notes where permitted, and a server-validated displayed price.
- Unavailable restaurants and sold-out items remain understandable and cannot
  be added to an order.

### 3.2 Cart and checkout

- Add, edit, increment/decrement, and remove items; expose chosen options and
  quantities in the cart.
- Enforce a single restaurant per checkout. Adding an item from another
  restaurant requires an explicit cart-replacement choice; never silently
  mix or discard a cart.
- Support the applicable delivery address, contact information, fulfillment
  notes, and delivery instructions only after their policies are decided.
- Recompute item prices, modifiers, discounts, delivery charge, service fee,
  taxes if applicable, and total on the server. A browser-submitted total is
  never authoritative.
- Show a clear line-item breakdown and currency at review and payment.
- Revalidate restaurant availability, menu versions/prices, address
  serviceability, promotion eligibility, and applicable fees immediately
  before order placement.
- Create a durable pending order/payment attempt before requesting payment;
  use idempotency to avoid duplicate orders/charges on retries.
- Show payment-pending, payment-failed, and confirmed states accurately.
  A redirect back from a processor is not proof of successful payment.
- Do not create a production-success response, paid order, or delivery booking
  from a simulated provider response.

### 3.3 Accounts and post-order experience

- Customer registration, sign-in, sign-out, password recovery, and profile
  management through Supabase Auth.
- Saved addresses, favorites, order history, reorder, and account settings.
- Reorder creates a fresh cart and revalidates present menu availability and
  prices; it does not replay historical charges or assume an item is still
  available.
- Order confirmation contains the canonical order reference and the latest
  verified payment/fulfillment state.
- Order tracking displays the order lifecycle and delivery status supplied by
  the provider, with clear handling for delayed or unavailable updates.
- Order ratings/reviews are associated with an eligible completed order;
  moderation and review visibility rules require launch decisions.
- Customer support entry points provide an auditable link to the relevant
  order without exposing other customers' information.

### 3.4 States, validation, and accessibility

Every interactive journey must have intentional loading, empty, validation,
success, pending, and error states. Errors must be actionable, must not leak
secrets or private records, and must not present an unconfirmed payment or
booking as successful.

Forms must be keyboard operable, label inputs, expose validation to assistive
technology, and preserve safe user-entered values after correctable errors.
Responsive behavior, semantic HTML, contrast, reduced-motion behavior, and
screen-reader status announcements are acceptance requirements, not
post-launch polish.

## 4. Restaurant partner portal

### 4.1 Application, onboarding, and access

- Restaurant application captures the minimum business, contact, location,
  hours, menu, and payout information required by the approved launch process.
- Application states and required documents are visible to applicant and
  authorized reviewers; sensitive submitted data is access-restricted.
- An application cannot publish a restaurant until an authorized administrator
  approves it and required onboarding checks are complete.
- Restaurant owners can invite/manage staff and assign supported permissions.
  Membership checks are enforced server-side on every operation.
- Staff access is scoped to an active membership in the selected restaurant;
  revocation takes effect promptly.

### 4.2 Restaurant and menu management

- Edit approved restaurant profile, location, service hours, and open/closed
  availability. Changes that require renewed review follow an explicit
  approval rule.
- Manage menu categories, item names/descriptions, images, prices, ordering,
  item availability, sold-out state, and supported customization groups/options.
- Validate required selections, selection limits, modifier prices, currency,
  and ownership of every edited record.
- Use Supabase Storage with controlled upload types/size, non-executable
  content, scoped write access, and public delivery only for intentionally
  published imagery.
- Historical order snapshots never change when a menu is edited or an image is
  replaced.

### 4.3 Orders, reporting, and issues

- List incoming orders only for the authorized restaurant and expose actionable
  accept/reject decisions according to the configured timing and cancellation
  policy.
- Show payment status separately from acceptance and preparation status.
- Update preparation lifecycle with server-checked legal transitions.
- Prevent acceptance of unpaid orders unless the approved payment method and
  policy expressly permit another flow.
- Handle rejection, cancellation, unavailability, and issues with recorded
  reason, actor, time, and resulting refund/settlement action.
- Provide date-bounded sales and financial summaries with definitions for
  gross sales, discounts, platform charges, refunds, and net payable.
- Reports must be derived from persisted, reconciled transactions rather than
  client-calculated values.

## 5. Administrator dashboard

- Strongly protected administrator sign-in and separately granted
  permissions; no public administrator self-registration.
- Review restaurant applications, approve/reject with reason, and review
  required onboarding status.
- Search and manage customer, restaurant, and staff accounts with safe
  suspension/reactivation flows and audit records.
- Monitor orders across restaurants; investigate exceptions, cancellations,
  refunds, disputes, and customer/restaurant support cases.
- Configure and version commission, service fee, promotion, and settlement
  rules. A rule change must not rewrite an already placed order's financial
  snapshot.
- View payment initialization, verification, webhook-event, refund, and
  reconciliation records; distinguish provider state from internal state.
- Monitor delivery quotations, booking attempts, cancellations, tracking
  updates, and provider availability.
- Manage promotions/coupons and platform settings with validation, effective
  dates, scoped access, and audit trails.
- Export or view operational reports only for authorized administrators and
  avoid unnecessary personal or payment data.
- Audit sensitive actions, configuration changes, impersonation if ever
  supported, and financial actions. Impersonation is not in the initial scope
  absent an approved, constrained design.

## 6. Backend and integration requirements

- Supabase Auth establishes identity; server-side authorization checks
  customer ownership, restaurant membership, and administrator permissions.
- Zod validates all untrusted input at API/server-action boundaries. Database
  constraints remain the final guard for invariants.
- PostgreSQL migrations are versioned and reviewed. Supabase Row Level Security
  (RLS) is enabled for exposed tables; policies are tested with authenticated,
  anonymous, cross-customer, cross-restaurant, and administrator cases.
- The current Phase 2 migration implements profiles, restaurants,
  memberships, menu categories, and menu items only. The policy tests cover
  this implemented subset. Addresses, orders, payments, delivery, audit,
  administrator permissions, and Storage policies are deferred; no launch or
  administrator authorization is implied.
- Use server-only database/service credentials. Do not expose Supabase service
  role keys or payment/delivery secrets to browser bundles.
- Cart pricing uses canonical active menu data and versioned policy/config.
  Persist the accepted breakdown and item/modifier snapshots in the order.
- Order creation is transactional, idempotent, and concurrency-aware. Payment
  and delivery HTTP calls are outside the database transaction; persisted
  states and retry/reconciliation workflows bridge those systems.
- Payment initialization uses a server-computed amount, currency, and unique
  provider reference. Verify the transaction server-to-server and compare
  reference, expected amount, currency, status, and expected merchant/order.
- Webhooks must be authenticated according to the selected provider's current
  documentation, persisted before acknowledgement where appropriate,
  de-duplicated, and safe under retry/reordering. A browser redirect is never
  authoritative.
- Refunds are idempotent, permission-controlled, linked to original payment
  and order, and reconciled against provider records.
- Delivery is behind a replaceable adapter for serviceability/quote, booking,
  cancellation, and tracking. Implement only operations and guarantees
  documented by the selected provider and supported by its commercial
  agreement.
- Notifications are queued/retryable and do not control order/payment truth.
- Apply rate limits and abuse controls to authentication, search, checkout,
  coupon attempts, review submissions, and integrations. Log correlation IDs
  and state transitions without logging secrets, payment credentials, or
  unnecessary personal data.

## 7. Core user journeys

### Customer: discover to delivery

1. Customer selects or enters a service location; the server determines
   serviceability using configured coverage rules and, where appropriate, a
   delivery-provider quote.
2. Customer browses/searches available restaurants and a restaurant's menu.
3. Customer configures food options. The server validates availability and
   returns canonical price details.
4. Customer adds items from that restaurant, updates quantities, and reviews
   the cart. Cross-restaurant selection requires an explicit replace-cart
   confirmation.
5. Customer signs in or follows the approved guest-checkout policy, selects a
   serviceable address, and receives a final server-calculated breakdown.
6. Customer confirms. The server revalidates and atomically creates a
   pending order plus financial/item snapshots and payment attempt.
7. The server initializes payment with the chosen provider. The customer
   completes payment using the provider's documented flow.
8. The server verifies the payment directly or processes an authenticated,
   idempotent webhook. The order changes to paid/confirmed only on verified
   evidence.
9. Restaurant accepts and updates preparation state. The server requests
   external delivery at the policy-defined point, persists booking/tracking
   identifiers, and processes provider updates.
10. Customer sees current status, notification history as appropriate, and a
    completed order eligible for history, support, rating, and reorder.

### Restaurant: apply to fulfill an order

1. Applicant submits restaurant information and required onboarding evidence.
2. Administrator reviews and records approval or rejection.
3. Approved owner configures profile, operating hours, menu, images, prices,
   options, and staff permissions.
4. Restaurant becomes discoverable only when approved, configured, and
   available for the selected service area.
5. Authorized staff receive/list a paid incoming order, accept/reject it under
   policy, and progress preparation status.
6. Restaurant handles exceptions using reasoned, audited actions; the
   customer/payment/delivery state is updated through server-side workflows.
7. Owner views financial summaries and settlement status derived from
   reconciled records.

### Administrator: application to reconciliation

1. Authorized administrator reviews applications and account risk/eligibility.
2. Approvals, configuration changes, and account actions require the
   appropriate permission and create audit records.
3. Operations staff monitor order/payment/delivery exceptions and perform
   permitted resolution actions.
4. Finance staff reconcile provider collections/refunds, fees/commission, and
   restaurant settlement obligations.
5. Reports expose consistent definitions and scoped data; unresolved records
   remain visible as exceptions rather than being silently marked complete.

## 8. Acceptance criteria

The product is not launch-ready until all applicable criteria pass in staging
with real provider test/sandbox flows and production-like policy configuration:

1. Public visitors can browse only published, available marketplace content.
2. Search, filters, sorting, currency display, and serviceability reflect
   configured and actually supported data.
3. A cart and checkout cannot contain items from multiple restaurants.
4. Client-manipulated prices, modifiers, discounts, fees, totals, status, and
   ownership are rejected or ignored in favor of server values.
5. Menu changes do not alter historical item, option, price, or financial
   snapshots.
6. Duplicate submissions/retries do not create duplicate orders or duplicate
   financial side effects.
7. Payment is confirmed only after provider-backed verification with matching
   reference, amount, currency, and expected order; webhook replay is safe.
8. Test, missing, mismatched, pending, failed, and timed-out payment outcomes
   never appear as paid production orders.
9. Customer and restaurant actors cannot access another tenant's private
   records through UI, API, database, or storage paths.
10. Restaurant approval, staff permissions, and administrator permissions are
    enforced and audited.
11. Delivery operations are recorded with explicit pending/failure/retry
    states; no simulated success appears as a real booking/tracking result.
12. Refunds and settlement entries are authorized, linked, idempotent, and
    reconcilable with provider records.
13. Every major flow has loading, empty, validation, failure, and recovery
    states with accessible feedback.
14. Automated unit, integration, RLS/authorization, provider-contract, and
    browser tests cover the critical order/payment lifecycle.
15. Monitoring, alerting, backups/restore, privacy/retention, incident response,
    and deployment rollback are documented and exercised before launch.

## 9. Business rules and launch decisions

Confirmed starting rules:

- Multi-restaurant marketplace; a checkout is single-restaurant.
- Public browsing is allowed where information is public.
- External delivery provider; Finger-Lickin does not operate its own fleet.
- Customer, restaurant, staff, and administrator access is explicitly scoped.
- Server-side values and provider verification are authoritative.
- Historical orders preserve item names, selected options, quantities, and
  prices as purchased.
- Commission, platform fees, and settlements are configurable.
- Production payment and delivery actions are never faked as successful.

Unresolved items are tracked in [docs/DECISIONS.md](docs/DECISIONS.md). They
include launch country/service area, currency, legal entity and tax treatment,
payment provider/account eligibility, delivery provider and commercial
capabilities, fee/commission policy, refund/cancellation rules, delivery
pricing, payout cadence/method, guest checkout, operational SLAs, review
moderation, and data-retention requirements. The implementation must not
silently invent these policies.
