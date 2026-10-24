# Finger-Lickin Decisions

This register distinguishes agreed project constraints from product/business
decisions that remain open. No unresolved item below is implicitly resolved by
the proposed architecture.

## Confirmed decisions

| ID | Decision | Rationale / consequence |
|---|---|---|
| D-001 | Product is a multi-restaurant marketplace named Finger-Lickin. | Establishes multi-tenant restaurant ownership and cross-restaurant discovery. |
| D-002 | Use Next.js App Router, TypeScript strict mode, Tailwind CSS, shadcn/ui, Supabase PostgreSQL/Auth/Storage, Supabase Realtime where useful, Zod, React Hook Form, Vitest, Playwright, GitHub, and Vercel. | User-approved stack; exact versions/hosting regions are selected during bootstrap and launch planning. |
| D-003 | Start as a modular monolith; do not introduce microservices without demonstrated need. | Reduces operational and distributed-consistency complexity. |
| D-004 | Public browsing is allowed where appropriate; checkout is single-restaurant. | Catalog can be public; cart and order invariants remain restaurant-scoped. |
| D-005 | Delivery is provided externally; Finger-Lickin does not operate an in-house rider fleet. | Delivery integration must be replaceable and provider-dependent. |
| D-006 | Customer and restaurant access is scoped to owned/authorized records; administrators have explicit permissions. | Requires server authorization, RLS, and access tests. |
| D-007 | Server values govern price, fees, discounts, totals, payment, and order state. | Prevents client tampering and success-shaped fake flows. |
| D-008 | Historical orders retain purchased item names, options, quantities, and prices. | Requires immutable order snapshots independent of mutable menus. |
| D-009 | Restaurant commission, platform fees, and settlement policies are configurable. | Requires effective-dated rules and per-order financial snapshots. |
| D-010 | Production payment or delivery success must never be simulated. | Test/sandbox mode must be visibly separated from live state. |
| D-011 | Phase 1 documented the whole-project plan without implementing product workflows. | Product behavior remains governed by the approved specifications and unresolved decisions. |
| D-012 | Phase 2 provisions only a least-privilege database foundation; browser-facing roles cannot create restaurants, grant memberships, or write catalog records. | No restaurant-onboarding or permission-assignment authority is confirmed; keep those writes closed until a trusted server-side provisioning flow is designed. |

## Unresolved launch decisions requiring owner approval

Items are recorded as open; implementation may establish neutral interfaces but
must not launch the dependent behavior without a decision.

| ID | Decision needed | Why it matters / what must be specified | Blocks |
|---|---|---|---|
| U-001 | Launch country, initial city/service area, and legal operating entity | Determines laws, tax, consumer protections, provider availability, addresses, delivery coverage, data residency, and compliance. | Provider selection, serviceability, checkout, launch |
| U-002 | Customer/order currency and supported currency set | Determines display, currency exponent/rounding, provider support, financial reporting, and settlement. | Pricing, payment, settlement |
| U-003 | Payment provider: Paystack or Flutterwave (or another approved provider) | Decide using launch market and legal entity eligibility, supported payment methods/currencies, merchant approval, fees, settlement, refunds/disputes, webhook semantics, availability, and contract. | Live payment adapter and launch |
| U-004 | Payment method and charge/refund policy | Hosted/redirect or other documented flow; authorize/capture behavior if applicable; over/underpayment, pending timeout, duplicate charge, partial refund, dispute, and cancellation policies. | Checkout, payment lifecycle, support |
| U-005 | External delivery provider and commercial model | Confirm launch-area coverage, API access/docs, quote/booking/cancel/tracking capabilities, webhooks/polling, idempotency, availability/SLA, pricing, liability, and data terms. | Delivery quote, booking, tracking, launch |
| U-006 | Delivery pricing and serviceability | Flat, distance/zone, provider quote, minimums, customer/platform/restaurant contribution, failed quote fallback, delivery-area boundaries, and whether checkout can proceed without a quote. | Checkout, order totals |
| U-007 | Commission structure | Percentage/fixed/hybrid; base (food subtotal, discounts/tax, etc.); restaurant/campaign funding; effective dates; exceptions; negative/net floor rules. | Reports, restaurant net, settlement |
| U-008 | Platform/service fees and tax treatment | Fee payer, calculation/rounding, disclosure, tax registration/inclusion, invoice/receipt obligations, and local accounting advice. | Checkout display, ledger, reporting |
| U-009 | Restaurant payout model | Payout rail/provider, cadence, minimum, reserves, holdbacks, fees, failed payout recovery, reconciliation, approvals, tax/compliance checks. | Production settlement |
| U-010 | Refund, cancellation, rejection, and dispute policy | Who may cancel and when; full/partial amounts; delivery/food preparation liability; fees/commission reversal; complaint/chargeback handling and timelines. | Order lifecycle, refunds, operations |
| U-011 | Customer account and checkout policy | Guest checkout or mandatory sign-in; age/phone/email verification; account deletion and order retention. | Cart ownership and checkout |
| U-012 | Delivery address and location data policy | Required fields, map/geocoding source, precision, retention, supported regions/postcodes, location permission, serviceability authority. | Address forms and delivery adapter |
| U-013 | Restaurant onboarding requirements | Legal/business verification, documents, who reviews, approval SLA, reapproval, suspension, and sensitive document retention. | Partner launch |
| U-014 | Marketplace hours, availability, and order acceptance SLA | Time zones, scheduled orders, auto-rejection/timeout, restaurant closed behavior, preparation estimates, escalation. | Discovery and order lifecycle |
| U-015 | Promotions, reviews, support and moderation rules | Funding party, stacking/usage limits, fraud controls, review eligibility/moderation, support coverage and response targets. | Customer engagement and operations |
| U-016 | Privacy, retention, data residency, and legal obligations | Applicable laws, subprocessors, access/deletion requests, retention periods for financial/audit/support data, backup geography and incident reporting. | Production data handling and deployment |
| U-017 | Operational support model | On-call/coverage, provider escalation, manual delivery/payment exception path, incident ownership, support channels. | Launch readiness |
| U-018 | Performance, traffic, availability, and recovery targets | Expected load, performance budgets, uptime objectives, RPO/RTO, monitoring region and budget. | Hosting, queue, database sizing |
| U-019 | Administrator provisioning and permission matrix | Define who may grant/revoke admin access, available permissions, approval/audit requirements, and separation of financial privileges. No administrator table, policy, or self-grant path is implemented. | Administrator authorization, support, finance, production operations |
| U-020 | Restaurant creation, approval, ownership, and membership provisioning | Define trusted initiators, owner/staff roles and permissions, invitation/acceptance, revocation, review authority, and recovery when the final owner leaves. Current client roles cannot create restaurants or modify memberships/catalog. | Partner onboarding, restaurant activation, catalog management |
| U-021 | Public restaurant/menu publication meaning | Confirm which review, availability, and publishing checks are prerequisites for the `active` state and public visibility. The database currently exposes only `active` restaurants, active categories, and published items; activation has no client write path. | Public discovery and restaurant onboarding |
| U-022 | Currency set and exponent rules | Confirm supported currency codes and each currency's minor-unit exponent, rounding, and provider representation. Menu prices store non-negative integer minor units and a three-letter uppercase code, but the format check does not validate ISO membership or exponent. | Price display, checkout, payments, financial reporting |
| U-023 | Customer-address fields, access, and retention | Define required address/contact fields for the launch region, restaurant fulfillment access, precision, deletion, and retention. No address table exists. | Address management, checkout, order fulfillment |
| U-024 | Order creation, customer/restaurant read scope, and lifecycle | Define guest eligibility, immutable financial/address snapshots, customer access, restaurant operational fields, data minimization, and validated state transitions. No order or order-item table/policy exists. | Checkout, order history, partner operations |
| U-025 | Payment/delivery database access and server authority | After provider/currency and operational policies are approved, define trusted writers, customer-safe status projections, restaurant visibility, webhook inbox access, and retention. No payment or delivery record/function/policy exists. | Payment, delivery, refunds, reconciliation |
| U-026 | Personal-data and financial-record deletion/retention | Define retention, deletion/anonymization, legal hold, backups, and the effect of deleting Auth users on restaurant and financial records. Profile deletion currently cascades; deleting a user with a membership is restricted pending approved transfer/retention behavior. No order/financial history exists. | Production identity lifecycle and compliance |

### Decisions to request first

To unblock checkout and integrations, the first required set is:

1. Initial launch country/city and legal entity.
2. Customer currency.
3. Payment provider and merchant/payment-method requirements.
4. Delivery provider and confirmed operating capabilities/area.
5. Delivery price/serviceability model.
6. Commission, service fee/tax, refund/cancellation, and payout policy.

Other policy choices can be approved as the corresponding roadmap phase
approaches. No answer is required to complete this Phase 1 specification.

## Integration research notes

The following are documentation observations, not provider selection or
commercial approval. Public docs can change and do not confirm that the
Finger-Lickin business entity will be approved or receive a specific capability.

### Paystack

- Official documentation index: https://paystack.com/docs/llms.txt
- Official docs list payment acceptance methods, payment verification,
  webhooks, refunds, split payments, and transfers.
- The documentation states that transactions should be verified server-side
  before value is delivered and that webhook signatures should be validated
  using the secret key.
- Official docs list multiple African operating markets and supported
  currencies/payment channels; exact eligibility must be checked for the
  selected legal entity and market.
- The HTML documentation pages returned HTTP 403 to the research fetcher in
  this Phase 1 session. The official documentation index was readable, but
  detailed current endpoint/signature/settlement semantics must be rechecked
  directly by the implementer before coding.

### Flutterwave

- Official documentation index: https://developer.flutterwave.com/llms.txt
- Flutterwave Standard docs describe server-side payment creation, a hosted
  payment link, redirect, and webhook notification.
- Transaction verification docs instruct the merchant to compare provider
  transaction reference, status, currency, and amount against expectations.
- Webhook docs describe server POST notifications, verification requirements,
  retries/use cases, and recommend signature verification rather than strict
  IP allowlisting because their IP addresses may change.
- Docs also index payment-method and split-payment/refund material; exact
  currency, country, merchant, settlement, and refund terms still require
  confirmation for the selected market/account.

Sources:

- https://developer.flutterwave.com/docs/flutterwave-standard-1.md
- https://developer.flutterwave.com/docs/transaction-verification.md
- https://developer.flutterwave.com/docs/webhooks.md
- https://developer.flutterwave.com/llms.txt

### Assessment

Both providers document a server-initiated payment path, a way to verify
transactions, and webhook guidance. These common integration primitives are
compatible with a provider adapter. This evidence is not sufficient to choose
one: availability in the actual launch market, merchant eligibility, checkout
methods, fees, payout/settlement, refund/dispute behavior, operational support,
and contractual terms remain unknown. Split-payment documentation must not be
treated as proof that marketplace restaurant payouts satisfy local law or
Finger-Lickin's settlement model.

## Change control

Record a decision here with date, owner/approver, rationale, alternatives,
affected policies, and migration/rollout implications when an unresolved item
is settled. Changes to a decision must not silently rewrite historical order
or financial snapshots.
