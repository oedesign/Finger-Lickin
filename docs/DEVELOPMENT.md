# Development foundation

## Environment variables

The root layout validates optional public Supabase configuration at startup.
Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be
provided together. The values are validated but are not used to connect to a
Supabase project in this phase. Keep local values in the ignored `.env.local`.

Never put service-role keys, database passwords, payment secrets, delivery
credentials, or webhook secrets in browser-visible variables.

## Testing

- Vitest and Testing Library cover the rendered foundation and environment
  validation without requiring a database.
- Playwright covers a production-server browser smoke test. Install Chromium
  with `npx playwright install chromium` after dependencies are installed.
- CI builds the production app before running the browser test.
- Database and RLS tests are deferred until a reviewed migration and controlled
  local Supabase environment exist.

## Supabase boundary

No project credentials, local CLI configuration, database schema, or provider
integration are present. Supabase CLI setup and migrations must be completed
in a later approved phase; do not connect this foundation to production.

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
