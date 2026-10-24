# Finger-Lickin Supabase workspace

This directory contains the local Supabase CLI configuration, reviewed SQL
migrations, and pgTAP database tests. It is configured for local development;
it does not identify, link, or connect to a hosted Supabase project.

- `migrations/`: ordered `YYYYMMDDHHMMSS_description.sql` migrations.
- `tests/database/`: transactional pgTAP schema, integrity, and RLS tests.
- `config.toml`: local project identifier and explicit disabled seed setting.

## Prerequisites and local setup

- Node.js 24 LTS and npm, as required by the application.
- The project-local Supabase CLI, included as a development dependency after
  `npm ci`. Standalone installation options are in
  [the official instructions](https://supabase.com/docs/guides/cli).
- Docker Desktop installed and running.

From the repository root, run:

```powershell
npx supabase --version
npx supabase start
npx supabase db reset
npx supabase test db
```

`npx supabase db reset` drops and recreates the **local** development database,
then applies every migration in order. It is destructive to that local
database; confirm the CLI is operating locally before running it. Do not link
this repository to production or run reset commands against hosted projects.
Local migrations and the database tests contain no real accounts or personal
data. No seed is enabled: restaurant activation and membership provisioning
are intentionally not available until their authority and onboarding rules
are decided.

To stop local services after development, run `npx supabase stop`.

## Migration workflow

Create a new timestamped migration with the CLI:

```powershell
npx supabase migration new descriptive_change
```

Review the generated SQL before use. Keep schema changes in ordered,
version-controlled migrations; do not rely on dashboard edits. Test new
migrations and relevant RLS behavior from an empty database using the commands
above before marking a phase complete. Never edit an already-applied migration
to change an environment; create a follow-up migration instead.

The current migration implements only profiles, restaurants, memberships,
menu categories, and menu items. The remaining schema and policies are
documented as deferred in `../DATABASE_SCHEMA.md` and `../docs/DECISIONS.md`.

## Trusted server-side operations

Client-facing Supabase roles cannot create or change restaurants,
memberships, or catalog records. A future trusted server-side workflow must
authenticate and authorize restaurant setup, membership grants/revocations,
approvals, and catalog writes. Future order creation, pricing, payment
verification, delivery, administrative actions, and financial operations
must also be implemented behind appropriately authorized server-side
operations; none are provided by this migration. Never expose a Supabase
service-role key to browser code or use it as a substitute for server-side
authorization.
