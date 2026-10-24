# Finger-Lickin

Finger-Lickin is a multi-restaurant food ordering and delivery marketplace.
This repository currently contains the application foundation and Phase 1
design system only. Customer ordering, restaurant operations, administration,
authentication, database migrations, payments, and delivery booking are not
implemented.

## Project status

- Phase 1 product, architecture, database, security, decisions, and roadmap
  documents are maintained alongside the implementation.
- The application uses Next.js App Router, TypeScript, Tailwind CSS, and npm.
- A partial Phase 2 Supabase database foundation is version-controlled under
  `supabase/`; customer ordering, restaurant operations, administrator
  workflows, payment/delivery records, and authentication UI are not
  implemented.
- Shared accessible UI primitives and separate customer, partner, and
  administrator shell patterns are available for future routes.
- The home page is a design preview, not a live ordering service.
- Supabase credentials are not configured and no production database is
  connected.
- Payment processing and delivery-provider integrations are not enabled.

## Requirements

- Node.js 24 LTS (npm is included).
- The Supabase CLI is included as a development dependency; Docker Desktop is
  required only if you choose to run database migrations and policy tests
  locally. Neither is required to run the web app.

## Install and run

```powershell
npm ci
npm run dev
```

Open <http://localhost:3000>. The application can run without environment
variables. If configuring a local Supabase project, copy `.env.example` to
`.env.local` and replace both placeholders with that project's public URL and
anon/publishable key. Do not place service-role keys or other secrets in
`NEXT_PUBLIC_` variables or commit `.env.local`.

## Quality checks

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

`npm run format` applies the configured Prettier formatter. Phase 1 documents
are excluded so foundation setup does not rewrite the approved specifications.

## Browser tests

Install the Chromium browser once, then run the Playwright smoke test:

```powershell
npx playwright install chromium
npm run build
npm run test:e2e
```

The browser test starts the production server on `127.0.0.1:3000`. The GitHub
Actions workflow installs Chromium and runs this test after the build.

## Supabase preparation

The committed `supabase/config.toml` and ordered migration support local
development only. After `npm ci`, the project-local Supabase CLI is available
through `npx`. Start Docker Desktop, then run these commands from the
repository root:

```powershell
npx supabase --version
npx supabase start
npx supabase db reset
npx supabase test db
```

`npx supabase db reset` destructively recreates the local database before
reapplying migrations. Never point reset commands at a hosted project. No
production project is linked and no hosted project should be connected for
this phase. Migration naming, clean reset, test scope, and trusted-server
boundaries are described in [supabase/README.md](supabase/README.md).
Application scripts are unchanged; run database tests separately with
`npx supabase test db`.

## Project documentation

- [Product requirements and journeys](PROJECT_SPEC.md)
- [Application architecture](ARCHITECTURE.md)
- [Proposed database model](DATABASE_SCHEMA.md)
- [Ordered implementation roadmap](IMPLEMENTATION_ROADMAP.md)
- [Security requirements](SECURITY.md)
- [Confirmed and unresolved decisions](docs/DECISIONS.md)
- [Development and integration boundaries](docs/DEVELOPMENT.md)
- [Design system and shared UI](docs/DESIGN_SYSTEM.md)
- [Supabase setup notes](supabase/README.md)
- [Transfer and setup on a new computer](docs/TRANSFER_TO_NEW_COMPUTER.md)

## Initial structure

```text
.github/workflows/       CI checks
docs/                    Phase 1 decisions and development notes
src/app/                 Next.js routes, layout, styles, and shell tests
src/components/ui/       Shared accessible controls and surface primitives
src/components/shared/   Brand, responsive headers, and workspace shells
src/features/            Reserved for future domain modules
src/lib/                 Shared helpers and environment validation
src/server/              Reserved for server-only business logic
src/types/               Reserved for shared types
supabase/config.toml     Local Supabase CLI configuration
supabase/migrations/     Ordered, reviewed SQL migrations
supabase/tests/database/ pgTAP schema and RLS policy tests
tests/e2e/               Playwright browser smoke test
```

## Business decisions

The launch country/service area, currency, payment and delivery providers,
fees, commission, refunds/cancellations, and payouts remain undecided. The
application must not invent these values or present simulated provider
operations as real success. See [docs/DECISIONS.md](docs/DECISIONS.md).
