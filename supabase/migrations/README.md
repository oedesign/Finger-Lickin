# SQL migrations

Reviewed, ordered Supabase migrations live in this directory and use the
`YYYYMMDDHHMMSS_description.sql` naming convention. Create new files with
`npx supabase migration new descriptive_change` and apply/replay the complete
history on a clean local database with `npx supabase db reset`.

Do not edit an already-applied migration to change an environment; add a new
migration. See `../README.md` for local prerequisites, reset safety, and the
trusted-server boundary.
