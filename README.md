# Finger-Lickin

Finger-Lickin is a multi-restaurant food ordering and delivery marketplace.
This repository currently contains the Phase 2 application foundation only;
customer ordering, restaurant operations, administration, authentication,
database migrations, payments, and delivery booking are not implemented.

## Project status

- Phase 1 product, architecture, database, security, decisions, and roadmap
  documents are preserved below.
- The application uses Next.js App Router, TypeScript, Tailwind CSS, and npm.
- Supabase credentials are not configured and no production database is
  connected.
- Payment processing and delivery-provider integrations are not enabled.

## Requirements

- Node.js 24 LTS (npm is included).
- Supabase CLI only if you choose to work on local Supabase later; it is not
  required to run this foundation.

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

The Supabase CLI is not currently installed and no Supabase project is linked.
To use a local project later, install the Supabase CLI using its official
installation instructions, run `supabase init` in this project, and use
`supabase start` after reviewing the generated local configuration. No CLI
configuration or database schema is included in this phase. Do not link or
modify a production project.

## Project documentation

- [Product requirements and journeys](PROJECT_SPEC.md)
- [Application architecture](ARCHITECTURE.md)
- [Proposed database model](DATABASE_SCHEMA.md)
- [Ordered implementation roadmap](IMPLEMENTATION_ROADMAP.md)
- [Security requirements](SECURITY.md)
- [Confirmed and unresolved decisions](docs/DECISIONS.md)
- [Development and integration boundaries](docs/DEVELOPMENT.md)
- [Supabase setup notes](supabase/README.md)

## Initial structure

```text
.github/workflows/       CI checks
docs/                    Phase 1 decisions and development notes
src/app/                 Next.js routes, layout, styles, and shell tests
src/components/ui/       Reusable accessible UI primitives
src/features/            Reserved for future domain modules
src/lib/                 Shared helpers and environment validation
src/server/              Reserved for server-only business logic
src/types/               Reserved for shared types
supabase/migrations/     Reserved for reviewed future migrations
supabase/tests/          Reserved for future database and policy tests
tests/e2e/               Playwright browser smoke test
```

## Business decisions

The launch country/service area, currency, payment and delivery providers,
fees, commission, refunds/cancellations, and payouts remain undecided. The
application must not invent these values or present simulated provider
operations as real success. See [docs/DECISIONS.md](docs/DECISIONS.md).
