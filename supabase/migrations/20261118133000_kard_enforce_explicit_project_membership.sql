-- Kard: enforce the confirmed rule that project access is always explicit.
-- Workspace ownership/admin status does not grant automatic project access.
begin;

create or replace function private.can_access_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
set row_security = off
as $function$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = (select auth.uid())
  );
$function$;

create or replace function private.can_manage_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
set row_security = off
as $function$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = (select auth.uid())
      and pm.role in ('owner','admin')
  );
$function$;

create or replace function private.can_write_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
set row_security = off
as $function$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = (select auth.uid())
      and pm.role in ('owner','admin','member')
  );
$function$;

drop policy if exists projects_update_project_admins on public.projects;
create policy projects_update_project_admins on public.projects
for update to authenticated
using ((select private.can_manage_project(id)))
with check ((select private.can_manage_project(id)));

drop policy if exists projects_delete_project_owners on public.projects;
create policy projects_delete_project_owners on public.projects
for delete to authenticated
using (
  exists (
    select 1
    from public.project_members pm
    where pm.project_id = projects.id
      and pm.user_id = (select auth.uid())
      and pm.role = 'owner'
  )
);

commit;
