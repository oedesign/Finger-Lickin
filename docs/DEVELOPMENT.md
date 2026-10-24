# Development foundation

For a fresh-machine setup, see the
[transfer guide](TRANSFER_TO_NEW_COMPUTER.md).

## Environment variables

The root layout validates optional public Supabase configuration at startup.
Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be
provided together. The values are validated but are not used to connect to a
Supabase project in this phase. Keep local values in the ignored `.env.local`.

Never put service-role keys, database passwords, payment secrets, delivery
credentials, or webhook secrets in browser-visible variables.

## Testing

- Vitest and Testing Library cover the design preview, shared control
  semantics, accessible form feedback, and responsive workspace shell markup
  without requiring a database.
- Playwright checks the built production app, keyboard navigation, modal
  behavior, five viewport widths, horizontal overflow, and axe-core WCAG 2.1
  A/AA rules at mobile/desktop widths and with the dialog open.
- Install Chromium once with `npx playwright install chromium` after
  dependencies are installed. Automated accessibility scans supplement, but
  do not replace, screen-reader and visual manual review.
- CI builds the production app before running the browser test.
- Database and RLS tests run separately from npm tests with `npx supabase
test db` against the controlled local Supabase stack.

## Local Supabase database workflow

The repository contains local CLI configuration, versioned SQL migrations in
`supabase/migrations/`, and transactional pgTAP tests in
`supabase/tests/database/`. The supported migration filename format is
`YYYYMMDDHHMMSS_description.sql`; use `npx supabase migration new
descriptive_change` to create the next file.

The CLI is included as a development dependency and is available through
`npx` after `npm ci`; standalone installation options are in the
[official instructions](https://supabase.com/docs/guides/cli). Run Docker
Desktop. From the repository root:

```powershell
npx supabase --version
npx supabase start
npx supabase db reset
npx supabase test db
```

`npx supabase db reset` drops and rebuilds the local development database and
replays every migration. It is destructive to local data; use it only against
the local CLI stack, never a hosted project. `npx supabase stop` stops that
local stack. Do not link this phase to production.

Database tests use synthetic identities and rollback their fixtures. They
cover only the schema and policies currently implemented. There is no
development seed because restaurant activation, account/restaurant
provisioning, and membership grants lack approved authorities.

## Database authorization boundary

The current migration establishes profiles, restaurants, restaurant
memberships, categories, and menu items. Client-facing roles can read only
their own profile/membership and permitted catalog data; they cannot create
restaurants, grant memberships, activate a restaurant, or write menus. No
order, address, payment, delivery, administrator, or Storage policy exists.

Restaurant onboarding, membership changes, catalog writes, future checkout
and order creation, price calculations, payment verification/refunds,
delivery calls, and administrator/financial operations must later be
implemented in trusted server-side workflows with independent authorization.
Never expose a Supabase service-role key in browser code, and never treat it
as a replacement for server-side authorization. Unresolved prerequisites are
tracked in `docs/DECISIONS.md`.

## Dependency audit note

Reviewed 2026-10-13. `npm audit` reports five high-severity dependency records
for the reviewed GitHub advisory
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
also identified as CVE-2026-93687. The advisory describes stack exhaustion
from deeply nested brace patterns, rates it CVSS 7.5 (High), and marks every
published `braces` version through 3.0.3 as affected. No first patched version
is listed; 3.0.3 is also the latest version published to npm at review time.

The dependency is not direct and is not included in production dependencies.
The locked development-only path is:
`eslint-config-next@16.4.0` → `@next/eslint-plugin-next@16.4.0` →
`fast-glob@3.3.1` → `micromatch@4.0.8` → `braces@3.0.3`.
`fast-glob` is imported by the Next plugin's `no-html-link-for-pages` rule.
That rule only passes a `settings.next.rootDir` pattern to the globber when
that setting is configured; this repository's ESLint configuration does not
set it. The vulnerable library is therefore installed for development/lint,
but the application's current production runtime does not use it. Avoid
untrusted brace patterns in any future Next ESLint `rootDir` configuration.

`npm audit fix` has no safe fix. npm offers a fix only with `--force`, which
would downgrade `eslint-config-next` to 14.2.35, incompatible with the
Next.js 16.4 application and its ESLint 9 setup. Do not force that downgrade
or add a blind override: no patched `braces` version is published. Recheck
the advisory and dependency path on future dependency updates. The production
dependency audit reports no vulnerabilities.

The Next.js 16.4 ESLint preset's compatible setup uses ESLint 9. ESLint 10
does not satisfy peer ranges for its React plugins, so keep ESLint 9 until the
preset supports the newer major. npm currently emits a deprecation warning
for the selected ESLint 9 release.
