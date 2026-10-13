# Finger-Lickin Architecture

**Status:** Proposed architecture for Phase 1; no application code exists yet.

## 1. Architectural decisions

- **Application style:** modular monolith, deployed as one Next.js application
  with server-only modules and narrow provider adapters.
- **Web framework:** Next.js App Router and TypeScript strict mode.
- **UI:** Tailwind CSS, shadcn/ui, shared accessible components.
- **Data/auth/files:** Supabase PostgreSQL, Supabase Auth, Supabase Storage;
  Supabase Realtime only for selected useful, non-authoritative live updates.
- **Validation/forms:** Zod at trust boundaries and React Hook Form for
  interactive forms.
- **Testing:** Vitest for units/integration seams and Playwright for critical
  browser workflows. Database policy tests run against a controlled Supabase
  local/test environment.
- **Delivery:** GitHub and Vercel; production changes use migrations and
  environment-specific secrets/configuration.
- **Payments:** provider-neutral payment port. Paystack and Flutterwave both
  document hosted/redirect-style payment flows, server-side transaction
  verification, and webhook guidance. The actual provider remains unselected
  pending launch country, currency, merchant eligibility, settlement
  requirements, and contract review. See [docs/DECISIONS.md](docs/DECISIONS.md).
- **Delivery:** replaceable external-provider adapter. No provider is selected;
  no provider API, capability, or endpoint is assumed.
- **No microservices:** split only after demonstrated operational or scaling
  requirements justify the added consistency and deployment costs.

## 2. Proposed repository structure

```text
src/
  app/
    (storefront)/              # public and customer pages
    (partner)/                 # restaurant portal
    (admin)/                   # platform operations
    api/
      webhooks/
        payments/[provider]/   # provider-specific verified ingress
        delivery/[provider]/
  components/
    ui/                        # shadcn/ui primitives
    shared/                    # domain-neutral composition
  features/
    auth/
    discovery/
    restaurants/
    menus/
    cart/
    addresses/
    checkout/
    orders/
    partner/
    admin/
    payments/
    delivery/
    promotions/
    reviews/
    support/
  server/
    auth/                      # server-side identity and permission checks
    db/                        # Supabase server clients and repositories
    policies/                  # fees, commission, refunds, state transitions
    services/                  # application use cases and transactions
    integrations/
      payments/
        port.ts
        paystack/              # only after provider selection
        flutterwave/           # only after provider selection
      delivery/
        port.ts
        [provider]/            # only after provider selection
      notifications/
    observability/
  lib/
    validation/
    money/
    errors/
supabase/
  migrations/
  seed.sql
  tests/                       # RLS and database integration tests
tests/
  unit/
  integration/
  e2e/
```

The actual layout may be adjusted during bootstrap to fit Next.js and Supabase
conventions, but responsibility boundaries and server-only secret handling
must remain.

## 3. Module ownership

| Module | Owns |
|---|---|
| Identity and access | Supabase Auth integration, profile linkage, role and resource-scoped permission checks. |
| Marketplace catalog | Restaurant publication/availability, service locations, cuisine, menu categories, items, modifiers, image references. |
| Discovery | Public search/filter/sort and serviceability-aware restaurant listing. |
| Cart and pricing | Selected cart intent, canonical price calculation, promotion/fee/commission policy evaluation, price quote expiry/version. |
| Checkout and orders | Order creation, immutable snapshots, legal lifecycle transitions, cancellation and issue orchestration. |
| Payments | Provider-neutral initiation, verification, webhook event inbox, refund request and reconciliation records. |
| Delivery | Provider-neutral quote/book/cancel/track operations and external status normalization. |
| Partner operations | Restaurant onboarding, membership/staff access, menu management, incoming orders and reporting. |
| Administration | Applications, account operations, policy configuration, dispute/support tooling, audit and reports. |
| Notifications | Email/SMS/push adapter, templates, queue/retries and delivery logs; no authority over business state. |
| Reviews/promotions/support | Eligibility, moderation/promotion rules, customer case records and safe associations. |

Features may have UI in App Router route groups, but application services,
policy decisions, database access, and provider calls remain separate from
presentation. Server-side use cases own authorization and validation rather
than trusting components or client-side form schemas alone.

## 4. Data flow and trust boundaries

### 4.1 Read path

Browser → Next.js page/server component → authenticated server-side query
service/repository → PostgreSQL with RLS and explicit tenant predicates →
validated response/DTO → browser.

Public catalog reads expose only intentionally public fields and approved,
published records. Customer, restaurant, and administrator reads apply both
application authorization and database RLS. Realtime subscriptions are
filtered to an authorized scope and never replace a canonical server read.

### 4.2 Write path

Browser form/action/API → request identity and rate limit → Zod validation →
resource authorization → application use case/policy → transactional
repository/database operation → audit/outbox record as needed → response.

Sensitive service-role operations run only in server code, with narrow
functions, validated inputs, and explicit authorization. Do not use a broad
admin client as a substitute for tenant checks.

### 4.3 Order and payment path

1. Server reads active menu/options and current pricing policies; validates
   restaurant, item availability, address, promotion, and currency.
2. Server calculates a quote and persists order lines/options as immutable
   snapshots plus a pending payment attempt within a database transaction.
3. After commit, a worker/server use case initializes the selected payment
   provider using a server-generated unique reference and exact computed
   amount/currency.
4. Provider response is persisted. Customer is redirected to the returned
   documented checkout URL or completes the selected provider flow.
5. Return URL only identifies a possible result; server verifies directly
   against provider records. Authenticated webhook events are verified,
   persisted, deduplicated, and reconciled.
6. A guarded transition marks payment successful only when provider status,
   reference, amount, currency, merchant account, and expected internal order
   match. Discrepancies become exceptions for review, not success.
7. Restaurant acceptance/preparation and delivery booking progress through
   separately persisted lifecycle states. Calls to outside systems are
   retryable, correlated, and not made inside database transactions.

Database transactions cannot atomically commit with a payment or delivery API.
Use a persisted state machine, idempotency keys, an inbox for inbound events,
an outbox/job record for outbound work, and reconciliation to handle timeouts,
duplicate events, late replies, and partial failure.

### 4.4 Money and price representation

Persist currency with every monetary snapshot. Store amounts as integer minor
units where the selected currency's exponent and provider representation
support that representation; centralize ISO/provider currency exponent
handling and reject unsupported currencies. Never use floating-point for
financial arithmetic. Keep distinct records/fields for item subtotal,
modifier subtotal, discount, delivery fee, service/platform fee, tax if
applicable, tip if adopted, grand total, captured amount, refund amount,
commission, and restaurant net payable. Their business definitions remain
configurable and must be decided before launch.

## 5. Provider adapters

### 5.1 Payments

Define a typed provider port for the minimum confirmed use cases, for example:

- `initializePayment(input)` → provider reference, documented checkout
  destination/instructions, and raw provider correlation metadata.
- `verifyPayment(input)` → normalized verified status, amount, currency,
  provider reference, and safe metadata.
- `verifyWebhook(request)` → authenticated normalized event or explicit
  verification failure.
- `requestRefund(input)` and refund status/reconciliation operations only
  after provider and policy capabilities are confirmed.

The adapter owns provider payload mapping and documented signature semantics.
The application service owns order/amount/reference validation, idempotency,
authorization, transitions, and audit records. Retain only required
provider metadata; redact secrets and minimize personal data.

Provider selection is deferred. The public docs reviewed for this specification
describe Paystack payment initialization/checkout, verification, webhooks, and
refund/split-payment topics, and Flutterwave Standard hosted payment, server
verification, webhooks, and split-payment topics. Documentation does not
establish our eligibility, merchant-country support, settlement timing, fees,
or suitability. Confirm those with the provider and the intended business
entity before coding the concrete adapter.

### 5.2 Delivery

Define a typed delivery port only for capabilities selected and confirmed for
the chosen operating market:

- serviceability/quote;
- booking/dispatch;
- cancellation;
- tracking/status retrieval or verified webhook receipt;
- normalized failure and retry information.

Provider IDs are mapped to internal order/delivery IDs. Store quotations,
booking requests/results, cancellation outcomes, and timestamped tracking
events. The adapter must not claim a guaranteed ETA, operation, or status
without provider documentation and contract support. A provider outage leaves
an explicit pending/exception state and invokes an approved operational
fallback; do not fabricate a booking.

## 6. Database access and consistency

- Supabase Auth user IDs are foreign-keyed to application profiles.
- RLS is enabled for tables accessible through client-facing Supabase APIs.
- Policies use ownership or active restaurant membership and narrowly granted
  administrator roles. Tables with sensitive financial/onboarding data may be
  accessible only through constrained server functions.
- Never trust a caller-supplied `restaurant_id`, `customer_id`, role, price,
  or status without deriving/validating it against the session and persisted
  records.
- Use database foreign keys, unique constraints, check constraints, and
  transactions to enforce invariants. State transitions use guarded updates.
- Keep payment events and processed idempotency keys unique by provider/event
  identity; keep order/payment references unique in their required scope.
- Use migration-managed schema only; do not rely on undocumented dashboard
  mutations.
- Avoid broad realtime table access; subscribe only to the minimum status
  records and re-check access on reconnect.

The proposed entity model and key constraints are in
[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

## 7. Error handling and observability

- Use explicit domain errors for invalid transitions, stale quotes, unavailable
  menus, authorization failures, and provider failures.
- Retry only transient, idempotent operations with bounded attempts,
  exponential backoff/jitter, and an observable terminal/dead-letter state.
- Never catch and suppress an unknown exception or return success-shaped
  defaults.
- Correlate request, order, payment attempt, delivery attempt, webhook event,
  and background job IDs.
- Emit structured operational logs and metrics without auth tokens, secrets,
  full payment credentials, or unnecessary addresses/contact information.
- Alert on webhook verification failure spikes, pending payment/order aging,
  booking failures, refund/reconciliation mismatches, queue backlog, and
  operational error rates.

## 8. Deployment topology

- GitHub is the source-control and review system; Vercel hosts the Next.js
  application subject to confirmation of region, runtime, timeout, and data
  residency requirements.
- Supabase provides managed PostgreSQL/Auth/Storage and optional Realtime.
- Long-running retries/reconciliation may require a durable job/queue facility;
  choose it only after verifying Vercel runtime constraints and Supabase
  capabilities. Do not rely on a short-lived request handler for durable work.
- Separate local, preview/staging, and production projects/credentials.
- Apply migrations through a controlled deployment step; use backward-compatible
  changes for rolling deployments.
- Configure provider webhooks against stable HTTPS production/staging
  endpoints and verify signatures before processing.
- Configure monitoring, backup/restore, retention, and incident contacts before
  production launch.

## 9. Architecture risks and mitigations

| Risk | Mitigation |
|---|---|
| Unknown launch market makes payment, currency, legal, and delivery decisions impossible to finalize. | Keep policies configurable; block provider adapter and production fee/tax implementation until decisions are approved. |
| External provider timeout after a successful side effect. | Unique references/idempotency where supported, persist attempts, verify/reconcile before retry, and handle uncertain outcomes explicitly. |
| RLS policy mistakes expose cross-tenant data. | Deny by default, test adversarial identities against real PostgreSQL, use constrained server access, and review policy changes. |
| Fees or menu prices change during checkout. | Expiring/versioned quote, final server revalidation, and immutable accepted order snapshots. |
| Delivery provider's API/commercial offering differs by region. | Provider port plus contract/document review; implement only market-confirmed operations. |
| Vercel request lifecycle is unsuitable for durable tasks. | Use durable queue/job execution appropriate to verified platform limits; monitor and reconcile persisted pending work. |
| Refund/commission/payout arithmetic creates financial liability. | Finance-approved definitions, immutable ledger-style entries, reconciliation, least-privilege approvals, and testable invariants. |

## 10. Documentation references reviewed

- Paystack official documentation index: https://paystack.com/docs/llms.txt
- Paystack official payment acceptance:
  https://paystack.com/docs/payments/accept-payments/
- Paystack official verification:
  https://paystack.com/docs/payments/verify-payments/
- Paystack official webhooks:
  https://paystack.com/docs/payments/webhooks/
- Paystack official refunds and split payments:
  https://paystack.com/docs/payments/refunds/ and
  https://paystack.com/docs/payments/split-payments/
- Flutterwave official documentation index: https://developer.flutterwave.com/llms.txt
- Flutterwave Standard hosted checkout:
  https://developer.flutterwave.com/docs/flutterwave-standard-1.md
- Flutterwave transaction verification:
  https://developer.flutterwave.com/docs/transaction-verification.md
- Flutterwave webhooks:
  https://developer.flutterwave.com/docs/webhooks.md
- Flutterwave payment methods, split payments, and refunds are indexed in the
  official documentation; current detailed eligibility and semantics must be
  reviewed again for the selected market before implementation.

Provider documentation is dynamic. Recheck exact API versions, signature
algorithms, event semantics, supported currencies/countries, and merchant
eligibility immediately before implementing and again before launch.
