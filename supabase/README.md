# Supabase project — Kard

Project ref: `cdkcgdyvpohknybkxhqq` (region `eu-west-1`, PostgreSQL 17).

## Current remote state

The remote project already contains the Phase 01 schema and three applied migration-history entries:

- `20261117172303_kard_phase_01_core_schema_and_rls`
- `20261117172334_kard_phase_01_foreign_key_indexes`
- `20261117172522_kard_phase_01_lock_down_default_grants`

The repository currently contains the latter two SQL files, but not the original core migration. Those two migrations depend on the core tables and therefore **must not be run against an empty local database before a baseline exists**.

## Safe VS Code onboarding — do not skip the history check

From the repository root:

1. Check that your working tree is clean and switch to `feat/phase-01-supabase-foundation`.
2. Install/use the Supabase CLI and Docker Desktop.
3. Run `supabase init` if `supabase/config.toml` does not exist.
4. Run `supabase login`.
5. Link the project:

   ```bash
   supabase link --project-ref cdkcgdyvpohknybkxhqq
   ```

6. Inspect migration history:

   ```bash
   supabase migration list
   ```

**Stop here and review the output before running `supabase db pull`, `supabase db reset`, or `supabase db push`.** The local migration chain is incomplete; the initial remote baseline must be reconciled first. Do not apply the two existing SQL migrations to an empty database.

After the baseline is reconciled, test the complete chain against the local Supabase stack with `supabase start` and `supabase db reset`. Only deploy future schema changes through reviewed migration files.

## Application credentials

- Browser: only the Supabase project URL and publishable key.
- Server-only: secret key (never prefix it with `NEXT_PUBLIC_`, commit it, or expose it in browser code).
- Keep local credentials in `.env.local`; the repository ignores `.env*` except `.env.example`.

Never commit project secrets or real user data.
