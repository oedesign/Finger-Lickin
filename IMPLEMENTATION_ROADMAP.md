# Finger-Lickin Implementation Roadmap

The phases are ordered by dependency. The Phase 1 product and technical
specifications are preserved, and application-foundation and shared-UI
implementation now exists in the repository. Phase completion still requires
its tests, acceptance criteria, and definition of done to be satisfied.
Provider, market, and financial decisions in
[docs/DECISIONS.md](docs/DECISIONS.md) block the affected production behavior;
they must not be filled with mock successes.

## Phase 0 — Project foundation and development tooling

- **Prerequisites:** Phase 1 specification approved; establish project owner
  and target development environment.
- **Files/modules:** Next.js App Router scaffold; `package.json`,
  `tsconfig.json` with strict mode, lint/format/test configuration,
  `src/app/`, `src/lib/`, `supabase/config.toml`, `.env.example`,
  `.gitignore`, GitHub Actions baseline, Vercel project settings.
- **Tests required:** clean install; lint; TypeScript check; Vitest smoke test;
  production build; CI workflow validation.
- **Acceptance criteria:** app boots locally and in preview; no secrets in
  source; local and hosted config are distinct; required checks run from a
  clean checkout.
- **Definition of done:** documented reproducible setup, locked dependencies,
  strict typecheck/lint/test/build gates, GitHub repository and preview
  deployment established.

## Phase 1 — Design system and shared UI

- **Prerequisites:** Phase 0.
- **Files/modules:** `src/app/globals.css`, Tailwind/shadcn configuration,
  `src/components/ui/`, `src/components/shared/`, typography/color/spacing
  tokens, form/feedback primitives.
- **Tests required:** component/unit tests for shared controls; accessibility
  checks for keyboard/focus/labels; visual smoke checks at representative
  viewport widths.
- **Acceptance criteria:** consistent responsive tokens and accessible
  primitives; usable loading/empty/error/validation patterns; no product
  workflow depends on one-off unvalidated controls.
- **Definition of done:** documented reusable components, accessible baseline,
  and stable shell/nav patterns for public, partner, and admin areas.

## Phase 2 — Database migrations and access policies

- **Prerequisites:** Phase 0; initial entity/policy review of
  `DATABASE_SCHEMA.md`.
- **Files/modules:** `supabase/migrations/`, seed fixtures,
  `supabase/tests/`, `src/server/db/`, generated database types.
- **Tests required:** migration-from-empty; constraints/transaction tests;
  RLS matrix tests for anon/customer/cross-customer/restaurant-member/
  cross-restaurant/admin; storage policy tests.
- **Acceptance criteria:** schema supports profiles, restaurants, membership,
  catalog, orders, payment/delivery records, audit; tenant access is deny by
  default; history snapshots and idempotency keys are enforceable.
- **Definition of done:** repeatable migrations and seeds, reviewed policies,
  automated adversarial access tests, and no service-role credential exposed
  to browser code.

## Phase 3 — Authentication and role-based authorization

- **Prerequisites:** Phases 0–2; Supabase project configured for each
  environment.
- **Files/modules:** `src/features/auth/`, `src/server/auth/`, middleware or
  route guards where appropriate, profile/bootstrap handlers, permission
  helpers, auth UI.
- **Tests required:** registration/sign-in/password recovery/session expiry;
  unauthenticated redirects; customer ownership, restaurant membership,
  revoked membership, administrator permission tests.
- **Acceptance criteria:** Supabase Auth controls identity; no public admin
  self-grant; server and RLS checks enforce permissions; errors are safe and
  recoverable.
- **Definition of done:** all protected routes and mutations use shared
  authorization policy, documented recovery flow, and audited role assignment.

## Phase 4 — Customer storefront and restaurant discovery

- **Prerequisites:** Phases 1–3; public restaurant/cuisine data model and
  initial market/service-area decision sufficiently defined for discovery.
- **Files/modules:** `src/app/(storefront)/`, `src/features/discovery/`,
  restaurant/cuisine queries, search/filter/sort validation, SEO metadata.
- **Tests required:** query/filter/sort units; public-data access tests;
  Playwright homepage/listing/search/responsive/empty/error journeys.
- **Acceptance criteria:** responsive hero, cuisine discovery, restaurant
  listings/detail entry points; only approved/public content is shown; filters
  reflect real fields; serviceability uncertainty is explicit.
- **Definition of done:** browse/search journeys meet spec and accessibility
  baseline without requiring sign-in for approved public content.

## Phase 5 — Menus, food customizations, and images

- **Prerequisites:** Phases 2–4; restaurant publication rules.
- **Files/modules:** `src/features/menus/`, menu/category/item/modifier pages
  and services, Storage policies, image upload/validation, partner menu
  editor foundation.
- **Tests required:** modifier minimum/maximum/availability and price tests;
  ownership/RLS/storage tests; image validation; Playwright menu and item
  customization flows.
- **Acceptance criteria:** complete published menu browsing and food detail
  options; sold-out items cannot be added; prices/options are canonical and
  visible; images are safely scoped.
- **Definition of done:** menu lifecycle, option validation, and safe media
  behavior operate against migrations and policy tests.

## Phase 6 — Cart, address management, and checkout preparation

- **Prerequisites:** Phases 2–5; guest-checkout decision; launch location,
  currency, service-area/address, delivery quote and fee definitions.
- **Files/modules:** `src/features/cart/`, `src/features/addresses/`,
  `src/features/checkout/`, `src/server/policies/pricing`,
  `src/lib/money/`, price quote and address/serviceability models.
- **Tests required:** money rounding/exponent tests; single-restaurant cart;
  tampered price/modifier/discount/fee tests; address ownership and
  serviceability; promotion limits/concurrency if enabled; checkout quote
  expiry tests.
- **Acceptance criteria:** all totals recomputed on server, one restaurant per
  cart, explicit cart-replacement choice, address access is private, visible
  line breakdown matches server quote.
- **Definition of done:** policy-approved pricing and serviceability behavior
  is deterministic, tested, versioned, and ready to feed transactional order
  creation. If decisions remain open, implement only the neutral boundaries
  and keep launch checkout disabled.

## Phase 7 — Transactional order processing and order lifecycle

- **Prerequisites:** Phases 2–6; approved cancellation/acceptance lifecycle
  and minimum payment-before-acceptance policy.
- **Files/modules:** `src/features/orders/`, server order use cases/state
  transitions, order snapshots, status event records, idempotency, outbox/job
  processing, support-safe order reference.
- **Tests required:** database transaction/rollback; duplicate request
  idempotency; concurrent inventory/availability and quote revalidation;
  immutable snapshots; legal/illegal status transition; failure/retry
  integration tests.
- **Acceptance criteria:** one committed order and payment attempt per
  idempotent checkout; snapshots preserve purchased values; external calls are
  outside DB transactions; pending/unknown outcomes remain explicit.
- **Definition of done:** order lifecycle and exception handling are
  auditable, recoverable, concurrency-tested, and do not claim unverified
  payment/delivery success.

## Phase 8 — Restaurant partner dashboard

- **Prerequisites:** Phases 2, 3, 5, and 7; onboarding/approval and staff
  permission policy.
- **Files/modules:** `src/app/(partner)/`, `src/features/partner/`,
  restaurant application/review, profile/hours/availability, staff
  management, menu maintenance, incoming orders and reports.
- **Tests required:** application approval; staff role matrix; cross-restaurant
  denial; accept/reject/preparation transitions; order exception tests;
  Playwright owner/staff flows.
- **Acceptance criteria:** only assigned restaurant data and actions are
  accessible; unapproved restaurants cannot publish; paid-order lifecycle and
  menu availability are operational.
- **Definition of done:** core onboarding-to-order workflows and permissions
  pass end-to-end tests; financial summaries define their inputs.

## Phase 9 — Payment integration and webhook verification

- **Prerequisites:** Phases 2, 3, 6, and 7; confirmed legal market, currency,
  merchant account, provider, payment methods, refund support, fees, and
  provider contract; current official docs reviewed.
- **Files/modules:** `src/server/integrations/payments/port.ts`, selected
  provider adapter, checkout routes, payment event inbox, webhook route,
  verification/reconciliation jobs, `.env.example` key names (not values).
- **Tests required:** provider contract/unit tests; sandbox initialization,
  verification, webhook signature and replay tests; amount/currency/reference
  mismatch; pending/failed/timeout; duplicate delivery; refund reconciliation;
  secret-leak scan.
- **Acceptance criteria:** server-computed payment values; verified status
  requires matching transaction/reference/order/amount/currency/merchant;
  browser redirect alone cannot settle; webhook handling is authenticated,
  idempotent, and observable; no production fake success.
- **Definition of done:** selected provider's documented production and test
  flows pass in staging; operational reconciliation and refund procedures are
  approved. Until then, production payment is disabled.

## Phase 10 — External delivery integration and tracking

- **Prerequisites:** Phases 6–9; confirmed launch area, delivery provider,
  account/contract, supported quote/booking/cancellation/tracking operations,
  service levels, prices, fallback, and data terms.
- **Files/modules:** `src/server/integrations/delivery/port.ts`, selected
  adapter, delivery quote/attempt/event tables and migrations, webhook or
  polling ingress as documented, operational status UI.
- **Tests required:** provider contract/sandbox; quote expiry and price
  mismatch; booking timeout/retry/idempotency; cancellation; webhook
  authentication/replay; outage/manual resolution; status mapping.
- **Acceptance criteria:** no unsupported endpoint/capability is assumed;
  delivery status is distinct from restaurant/payment state; failures remain
  explicit and recoverable; fees/ETAs match confirmed terms.
- **Definition of done:** real staging quote-to-booking-to-tracking path and
  exception runbook work; production bookings remain disabled until approved.

## Phase 11 — Notifications and customer order history

- **Prerequisites:** Phases 3, 7, 9, and 10; selected notification channels
  and consent/retention rules.
- **Files/modules:** `src/features/orders/` customer history/tracking,
  notification templates/adapters, outbox workers, preference/consent records.
- **Tests required:** notification retry/dedupe; safe template rendering;
  ownership and personal-data minimization; history pagination; Playwright
  confirmation/history/tracking/error journeys.
- **Acceptance criteria:** customer sees only own orders; notification conveys
  persisted state, not inferred success; provider and app tracking statuses
  are clearly distinguished.
- **Definition of done:** supported status transitions generate deduplicated
  notifications with retry/monitoring and customer-safe history.

## Phase 12 — Administrator dashboard and marketplace operations

- **Prerequisites:** Phases 3, 7, 8, 9, and 10; administrator permission
  matrix, support/dispute procedures, audit requirements.
- **Files/modules:** `src/app/(admin)/`, `src/features/admin/`, application
  review, account controls, order exception queue, delivery/payment monitoring,
  support and audit views.
- **Tests required:** administrator permission-by-action; unauthorized role
  escalation; cross-tenant access; audit completeness; operational
  exception workflows; Playwright administrator flows.
- **Acceptance criteria:** no public admin registration; each sensitive
  operation is permission-checked and audited; unresolved integration and
  financial exceptions cannot be hidden by status toggles.
- **Definition of done:** least-privilege admin workflows, audit/search limits,
  and safe operational reporting are reviewed and tested.

## Phase 13 — Commissions, refunds, settlements, and reconciliation

- **Prerequisites:** Phases 7, 9, and 12; finance/legal-approved commission
  base, fee payer, refund/cancellation rules, payout rail/cadence, accounting
  and tax policy, reserves/disputes and approval thresholds.
- **Files/modules:** versioned fee/commission policies, immutable ledger
  entries, refunds, settlement batches/lines, reconciliation imports/reports,
  finance role permissions.
- **Tests required:** decimal/exponent and rounding; partial/full refund
  boundaries; concurrent refund/payout; ledger invariants; duplicate provider
  records; period close; discrepancy and reversal scenarios.
- **Acceptance criteria:** every amount traces to order/provider/approved
  policy; historical policies remain fixed; payout totals reconcile; uncertain
  provider outcomes are not retried blindly; sensitive financial actions are
  dual-controlled if required.
- **Definition of done:** finance signs off reconciliation, exception and
  correction workflows; tested settlement reports reconcile to source records.

## Phase 14 — Reviews, promotions, support, and account features

- **Prerequisites:** Phases 3, 7, 11, 12, and 13 as applicable; moderation,
  promotion funding/eligibility, review, privacy, and support policies.
- **Files/modules:** `src/features/reviews/`, `promotions/`, `support/`,
  customer profile/favorites/reorder/saved-address pages, moderation and
  operational tools.
- **Tests required:** review eligibility/moderation; promotion concurrency and
  abuse; favorite privacy; reorder revalidation; support participant access;
  Playwright account and support journeys.
- **Acceptance criteria:** feature eligibility is server-enforced; promotions
  and reviews cannot bypass order/usage constraints; reorder uses current menu
  and price; customer data is scoped and deletable according to policy.
- **Definition of done:** approved account, engagement, and support features
  have complete loading/empty/error/accessibility behavior and test coverage.

## Phase 15 — Automated testing and security hardening

- **Prerequisites:** Phases 0–14; launch threat model and data inventory.
- **Files/modules:** Vitest suites, Playwright E2E suite, Supabase RLS tests,
  dependency/security workflows, rate-limit middleware, CSP/headers, audit and
  incident response documentation.
- **Tests required:** critical journey suite; authorization/RLS adversarial
  suite; webhook spoof/replay; abuse/rate-limit; dependency and secret scans;
  backup restore and incident exercises; load tests based on expected traffic.
- **Acceptance criteria:** no known critical/high release blockers; all money,
  authorization, and side-effect invariants are test-enforced; logs and alerts
  detect operational failures.
- **Definition of done:** security review and remediation completed, CI gates
  enforced, operational owners and incident procedures confirmed.

## Phase 16 — Performance, accessibility, and SEO

- **Prerequisites:** stable customer and partner workflows through Phase 14.
- **Files/modules:** image optimization, caching/query plans, pagination,
  metadata/structured data where valid, accessibility fixes, route loading
  boundaries, bundle analysis.
- **Tests required:** Lighthouse or agreed performance budgets; keyboard and
  automated accessibility checks plus manual assistive-technology review;
  SEO metadata/canonical/indexing tests; representative load/query tests.
- **Acceptance criteria:** agreed measurable performance/accessibility targets
  pass on representative devices and routes; private account/admin content is
  not indexed; public listings have accurate metadata.
- **Definition of done:** budgets and regression checks are documented and
  operationally sustainable.

## Phase 17 — Deployment, monitoring, backups, and launch readiness

- **Prerequisites:** Phases 9–16; signed business/provider decisions and
  operational runbooks.
- **Files/modules:** production GitHub/Vercel/Supabase configuration, migration
  pipeline, monitoring/alerts, backups/restore validation, secret rotation,
  status/rollback runbooks, provider webhook setup and launch checklist.
- **Tests required:** production-like smoke/E2E; migration rollback/forward
  rehearsal; backup restore; alert delivery; payment/delivery sandbox
  end-to-end; security and performance release gates.
- **Acceptance criteria:** isolated environments; reviewed deploy approvals;
  correct verified webhook endpoints; secrets protected; support, finance,
  incident, rollback, privacy, and restore owners ready; no unresolved
  critical/high risks.
- **Definition of done:** documented go/no-go approval and evidence of
  successful rehearsals; production transactions enabled only after provider
  approval and all launch decisions are signed off.
