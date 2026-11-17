# Supabase project migrations

Project ref: `cdkcgdyvpohknybkxhqq` (Kard, eu-west-1).

The initial core schema and RLS migration was applied directly to the remote project on 2026-11-17 and is recorded remotely as version `20261117172303` (`kard_phase_01_core_schema_and_rls`). Its authoritative SQL must be pulled from the linked project before this branch is merged; do not replace it with a hand-written approximation.

From a local checkout with Supabase CLI installed:

```bash
supabase link --project-ref cdkcgdyvpohknybkxhqq
supabase db pull kard_phase_01_core_schema_and_rls --local --yes
supabase migration list --local
```

The foreign-key index migration is included as `20261117172334_kard_phase_01_foreign_key_indexes.sql`. It was also applied to the remote project. Confirm the pulled baseline and index migration order before using `supabase db push` against any other environment.

Never commit project secrets. Use a publishable key in the browser and keep `SUPABASE_SECRET_KEY` server-side only.
