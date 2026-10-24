# Transfer to a new computer

## Requirements

- Node.js 24 LTS and its bundled npm. Node 24 is the version used by the CI
  workflow; the lockfile uses npm's lockfile version 3.
- Git, to clone and update the repository.
- Supabase CLI and Docker Desktop only when running database migrations and
  database tests. These are not required for frontend-only work. The Supabase
  CLI is included as a development dependency and is available through `npx`
  after `npm ci`; see the [official Supabase CLI installation guide](https://supabase.com/docs/guides/cli)
  for standalone installation options.

## Clone and install

Replace `<OWNER>` with the GitHub account or organization that owns the private
repository:

```powershell
git clone https://github.com/<OWNER>/finger-lickin.git
cd finger-lickin
npm ci
```

`npm ci` restores the exact dependency versions from the committed
`package-lock.json`. If the repository is private, authenticate with GitHub
using your normal Git credential manager; do not put a token in the clone URL.

## Local environment

The current application foundation runs without environment variables. If
local Supabase URL/key validation is needed, create an ignored local file:

```powershell
Copy-Item .env.example .env.local
```

Set both variables in `.env.local`, or leave both unset:

- `NEXT_PUBLIC_SUPABASE_URL` — the Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the browser-safe anon/publishable key for
  that same project.

For a hosted project, obtain these values from its Supabase dashboard under
**Project Settings → API** (the project URL and anon/publishable key). For
local-only database work, no hosted project credentials are needed. These
variables are currently validated by the app but are not used to connect to
Supabase. Never put a service-role key, database password, or other secret in
a `NEXT_PUBLIC_` variable. `.env.local` is ignored by Git and must not be
committed.

## Run the application and checks

```powershell
npm run dev
```

Open <http://localhost:3000>. Available checks:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

The Playwright end-to-end test needs Chromium installed once and a production
build:

```powershell
npx playwright install chromium
npm run build
npm run test:e2e
```

The test runner starts the built app locally. The frontend unit and browser
tests do not require a Supabase project.

## Local database migrations and tests

Database validation requires Docker Desktop running and the Supabase CLI
available through the installed development dependencies. No hosted
Supabase project or hosted credentials are required:

```powershell
npx supabase --version
npx supabase start
npx supabase db reset
npx supabase test db
npx supabase stop
```

`db reset` destructively rebuilds the **local** Supabase database and replays
all migrations. Confirm the CLI is operating against its local stack; do not
use reset against a hosted project.

Current database artifacts:

- `supabase/migrations/20261013175000_phase_2_database_foundation.sql`
  creates profiles, restaurants, restaurant memberships, menu categories,
  menu items, public catalog views, and their initial grants and RLS policies.
- `supabase/tests/database/001_foundation_rls.test.sql` contains pgTAP schema,
  constraint, trigger, role-grant, and row-level-security checks for that
  foundation.

The migration and tests cover only this partial database foundation. Orders,
addresses, payments, deliveries, administrator workflows, and Storage
policies are not implemented. Database tests must be run locally with the
commands above before claiming that migrations or RLS behavior have been
validated on a new computer; frontend tests do not run them.

## External services and remaining setup

No external service account is needed to run the current app or the local
database stack. A Supabase project is needed only if you choose to configure
the optional public URL/key variables or later connect the application to a
hosted database. Obtain credentials directly from the service dashboard and
store them only in an ignored local environment file or a secure secret
manager. Do not create or use payment or delivery credentials for this
foundation; those integrations are not implemented.

Review the [README](../README.md), [development notes](DEVELOPMENT.md), and
[Supabase setup guide](../supabase/README.md) for project status and security
boundaries.
