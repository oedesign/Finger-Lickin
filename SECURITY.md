# Finger-Lickin Security Requirements

**Status:** Security baseline for a planned application; not evidence of a
completed security review. The initial Phase 2 migration implements only the
profile, restaurant, membership, and catalog controls described below; its
database tests have not yet run in this environment.

## 1. Security objectives

Protect customer identity, addresses, order history, restaurant onboarding and
business data, payment/delivery records, administrator actions, and the
integrity of money and order state. Enforce confidentiality, integrity,
availability, least privilege, and traceability across browser, Next.js,
Supabase, and external providers.

## 2. Authentication and session security

- Supabase Auth is the identity provider. Never store passwords or implement a
  parallel credential store.
- Configure production-appropriate email confirmation, password recovery,
  session expiry/refresh, redirect allowlists, and account recovery; verify
  settings per environment.
- Protect cookies/session tokens using framework/Supabase-supported secure
  mechanisms; never put access tokens in URLs or logs.
- Do not create administrator accounts through public registration. Provision
  administrators through controlled invitation/bootstrap and audited grants.
- Require stronger authentication/MFA for privileged operators if supported
  by the selected Supabase Auth plan and operational policy; confirm actual
  plan capability before claiming it.
- Apply rate limits and abuse detection to registration, login, reset, and
  sensitive account operations. Avoid user-enumeration responses.

## 3. Authorization and tenant isolation

- Deny by default. Every server action, API route, data query, file operation,
  and Realtime subscription validates current identity and resource scope.
- Customer access is limited to the customer's own profile, addresses,
  favorites, carts, orders, reviews, and support cases.
- Restaurant access requires an active membership for the exact restaurant
  plus permission for the action. Never authorize using client-supplied
  `restaurant_id` alone.
- Administrator access uses explicit permissions and least privilege.
  Financial/refund/settlement actions require separate finance permissions and
  may require approval separation under policy.
- Supabase RLS is enabled for all client-exposed tables. Test policies using
  anonymous, customer A/B, members in restaurant A/B, revoked staff, and
  constrained administrator identities.
- Current database policies cover profiles, restaurant memberships,
  restaurants, categories, and items. There are no address, order, payment,
  delivery, administrator-membership, audit, or Storage tables/policies yet.
- Client roles cannot create or update restaurants, grant/revoke memberships,
  or write catalog data. A future trusted server-side workflow must authorize
  these operations; no self-service owner/admin bootstrap is provided.
- Public catalog views use `security_invoker` and expose only the catalog
  projection. Anonymous clients have no profile or membership table access.
- The only private-schema function is a non-`SECURITY DEFINER` timestamp
  trigger; it uses a fixed `pg_catalog` search path, performs no privileged
  reads/writes, receives no client-role usage/execute grants, and is not
  exposed through the Supabase Data API.
- Supabase service-role keys bypass RLS. Keep them server-only; require
  application-level authorization and narrow use cases for every privileged
  operation.
- Keep public catalog fields separate from personal, financial, onboarding,
  and operational fields. Avoid returning full database records to clients.

## 4. Secrets, environments, and data handling

- Keep Supabase service-role keys, database credentials, payment secrets,
  delivery credentials, webhook secrets, and notification-provider credentials
  in managed environment secrets. Never commit values or expose secrets with a
  `NEXT_PUBLIC_` prefix.
- `.env.example` contains names and safe placeholders only. Separate local,
  preview/staging, and production credentials/accounts.
- Restrict CI/Vercel secret access by environment and role; rotate compromised
  credentials and document rotation.
- Collect the minimum personal data needed for service. Do not store card
  numbers, CVV, or raw payment credentials; use provider-hosted/approved
  collection flows as confirmed in provider docs and contracts.
- Minimize and redact provider payloads, addresses, contact data, access
  tokens, and payment metadata in logs and error reports.
- Define retention, deletion/anonymization, legal hold, backup, and data
  residency policies before launch. Restrict production data in support and
  developer environments.
- Validate file type/content and size, use safe image processing, and prevent
  executable upload paths. Publicly readable storage is only for intentionally
  published assets.

## 5. Input, application, and browser protections

- Validate every untrusted request with Zod on the server; enforce database
  constraints as well. Normalize/limit search, notes, filenames, codes, IDs,
  and rich text; encode output to prevent injection.
- Use parameterized database access; avoid arbitrary SQL string construction.
- Protect mutations against CSRF using framework-supported protections and
  same-site/Origin checks where applicable. Restrict CORS to required origins.
- Apply Content Security Policy and security headers after validating Next.js,
  Supabase Auth redirect, hosted payment, and image requirements.
- Avoid open redirects. Validate provider checkout URLs against the expected
  destination policy while honoring documented provider redirect behavior.
- Rate-limit high-risk routes and apply quotas/anti-automation protections for
  login, checkout, coupons, reviews, search, and webhooks.
- Keep dependencies updated and scan for vulnerable packages, leaked secrets,
  and unsafe build/deploy configuration.

## 6. Pricing, orders, and financial integrity

- Treat every browser-submitted amount, discount, fee, order state, role, and
  provider status as untrusted.
- Compute all prices and totals server-side with exact integer/minor-unit
  arithmetic and an explicit currency exponent. Reject unsupported currencies.
- Create order and payment-attempt records transactionally; enforce unique
  idempotency references. Handle concurrent submissions and stale prices.
- Persist immutable item, option, fee, discount, and policy snapshots. Use
  audited compensating records rather than rewriting historical financial
  facts.
- Validate payment status from the selected provider server-to-server:
  expected reference, merchant/account, order, amount, currency, and successful
  state must all match. Define over/underpayment handling before enabling
  production.
- Separate order, payment, refund, restaurant acceptance, preparation, and
  delivery state machines. A UI redirect or client event cannot mark a payment
  successful.
- Authorize refund and settlement operations narrowly. Guard remaining
  refundable balance and concurrent payouts; reconcile provider data and make
  discrepancies visible.

## 7. Webhook security and idempotency

- Implement only the selected provider's documented signature/authentication
  scheme and current version. Do not invent IP allowlists, headers, algorithms,
  or endpoints.
- Verify signatures against the exact raw request body or documented canonical
  payload before parsing/processing where required. Use constant-time
  comparison where applicable and reject invalid/missing signatures.
- Do not rely solely on source IP if provider guidance says addresses are
  dynamic. Re-verify event transaction data with the provider when required by
  its documentation and our financial threat model.
- Persist verified event identity and processing state. Enforce uniqueness,
  deduplicate replays, tolerate retries/reordering, and avoid side effects
  before durable acceptance.
- Acknowledge only according to the provider's retry contract. Keep processing
  idempotent if acknowledgement is lost and provider retries.
- Bound request size/time, rate-limit safely, log correlation/event IDs only,
  and alert on signature failures, event backlog, repeated retries, and state
  mismatches.
- Never use webhook payload alone as an unverified source for a refund,
  settlement, order total, or ownership change.

## 8. External delivery and notification security

- Use credentials only server-side and only for approved provider operations.
- Validate callback authenticity per current provider documentation. Bind
  external IDs to an internal order/attempt and reject mismatched or stale
  updates.
- Use idempotency and bounded retries for booking/cancellation; reconcile
  ambiguous timeouts before retrying a potentially duplicate side effect.
- Do not expose sensitive tracking/address details in public URLs or
  notifications. Use short-lived or access-controlled links when supported.
- Escape/validate provider-supplied text and URLs. Avoid arbitrary remote URL
  fetches that could enable SSRF; allowlist hosts and redirect behavior where
  remote retrieval is required.

## 9. Audit, monitoring, and incident response

- Record administrator grants/revocations, restaurant approval, account
  suspension, pricing-policy changes, refunds, settlements, support access,
  order state changes, webhook verification/processing, and delivery actions.
- Logs include actor, action, target, timestamp, outcome, and correlation ID;
  never store secrets, full payment data, or unnecessarily complete personal
  data. Restrict access and establish retention.
- Alert on suspicious access patterns, repeated denied tenant access,
  authentication abuse, payment amount/currency mismatches, webhook failures,
  duplicate financial side effects, delivery anomalies, and reconciliation
  gaps.
- Define incident severity, owner/on-call escalation, provider contacts,
  customer communication, evidence preservation, credential rotation, and
  recovery/rollback. Exercise a tabletop before launch.
- Maintain backups and test restoration. Backups must have access controls,
  encryption, retention, and recovery objectives approved for the service.

## 10. Required security verification gates

Before launch:

1. Threat model covers account takeover, cross-customer/restaurant access,
   administrator misuse, price manipulation, duplicate order/charge/refund,
   webhook spoof/replay, delivery event spoofing, and data exfiltration.
2. RLS and Storage tests prove tenant isolation, including revoked membership
   and anonymous access.
3. Payment adapter tests include forged/invalid signatures, replay, duplicate
   events, pending/failure, reference/amount/currency/merchant mismatch, and
   timeout/reconciliation.
4. Security headers, CSRF/origin behavior, rate limits, dependency scan, secret
   scan, and safe error handling are verified in deployed preview.
5. Authorization and high-risk financial flows receive independent review;
   no known critical/high release blockers remain.
6. Restore, rollback, incident, key rotation, and provider outage procedures
   are rehearsed with named owners.

## 11. Provider documentation dependency

Security semantics are provider- and API-version-specific. Review the selected
provider's current official authentication, webhook signature, transaction
verification, refund, idempotency, rate-limit, and retry documentation before
implementation. See the source links and limitations in
[ARCHITECTURE.md](ARCHITECTURE.md) and the unresolved payment decision in
[docs/DECISIONS.md](docs/DECISIONS.md).
