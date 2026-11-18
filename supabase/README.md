# Supabase — Kard

Project ref: `cdkcgdyvpohknybkxhqq`  
Region: `eu-west-1`  
Database: PostgreSQL 17

## Versioned migrations

The four migrations below are recorded in the remote Kard project and are versioned in this repository:

1. `20261117172303_kard_phase_01_core_schema_and_rls.sql` — initial schema, RLS, private Storage buckets and policies.
2. `20261117172334_kard_phase_01_foreign_key_indexes.sql` — foreign-key lookup indexes.
3. `20261117172522_kard_phase_01_lock_down_default_grants.sql` — least-privilege grants.
4. `20261118134101_kard_enforce_explicit_project_membership.sql` — explicit project membership enforcement.

The initial migration was recovered byte-for-byte from the applied migration history in `supabase_migrations.schema_migrations`; do not recreate it manually or change its historical contents. Later architectural corrections belong in new migrations.

## Local verification

From the project root, after installing the Supabase CLI and authenticating:

```bash
supabase link --project-ref cdkcgdyvpohknybkxhqq
supabase migration list
supabase db pull
```

Compare local and remote migration history before applying any further schema changes. Never run a reset against the hosted project.

## Security rules

- Workspace is the tenant boundary, but project access always requires explicit membership in `public.project_members`.
- Supabase Storage buckets `project-assets` and `avatars` are private.
- Do not expose `SUPABASE_SECRET_KEY` or legacy `service_role` keys to browser code.
- Keep schema changes in versioned migrations and verify them with Supabase Advisors.
