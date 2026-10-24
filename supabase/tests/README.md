# Database and policy tests

`database/` contains pgTAP tests for the local Supabase migration set. Tests
create synthetic identities and catalog fixtures inside a transaction and
roll them back; they do not create seeded or privileged user accounts.

With Docker Desktop running and npm dependencies installed, run
`npx supabase start`, `npx supabase db reset`, and `npx supabase test db` from
the repository root. The RLS tests cover public catalog visibility, customer
profile identity and customer isolation, cross-restaurant access, active
membership revocation, public-view security options, client self-grant/write
restrictions, catalog constraints, and the `updated_at` trigger. The test
runner must be able to assume the local Supabase `postgres`, `anon`, and
`authenticated` roles; fixtures use the database owner for setup/revocation
and `SET LOCAL ROLE` plus Auth JWT claim settings for RLS assertions.

There are intentionally no order, address, payment, delivery, administrator,
or Storage policy tests yet: the corresponding schema and authority rules
remain unresolved and those objects are not implemented.
