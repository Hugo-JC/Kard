
-- Kard Phase 01 / foundation schema
-- Workspace is the tenant boundary. Project access is ALWAYS explicit via project_members,
-- except workspace owners/admins who have workspace-wide administrative access.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create type public.workspace_role as enum ('owner','admin','member','guest');
create type public.invitation_status as enum ('pending','accepted','revoked','expired');
create type public.plan_tier as enum ('free','pro','business');
create type public.subscription_status as enum ('active','trialing','past_due','canceled','expired','incomplete');
create type public.project_status as enum ('backlog','in_progress','on_hold','completed');
create type public.task_stage as enum ('todo','in_progress','review','done');
create type public.task_priority as enum ('urgent','high','medium','low','no_priority');
create type public.storage_scope as enum ('internal','deliverable','cover','avatar');
create type public.member_presence as enum ('online','in_meeting','focused','offline');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'New member' check (char_length(display_name) between 1 and 80),
  avatar_path text,
  locale text not null default 'pt' check (locale in ('pt','en')),
  presence_status public.member_presence not null default 'offline',
  status_note text check (status_note is null or char_length(status_note) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+([a-z0-9-]*[a-z0-9])?$' and char_length(slug) <= 60),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workspaces_owner_id_idx on public.workspaces(owner_id);

create table public.workspace_subscriptions (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  plan_tier public.plan_tier not null default 'free',
  status public.subscription_status not null default 'active',
  max_active_projects integer not null default 3 check (max_active_projects >= 0),
  max_storage_bytes bigint not null default 104857600 check (max_storage_bytes >= 0),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.workspace_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (workspace_id,user_id),
  unique (workspace_id,id)
);
create index workspace_members_user_workspace_idx on public.workspace_members(user_id,workspace_id);
create index workspace_members_workspace_role_idx on public.workspace_members(workspace_id,role);

create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null check (char_length(email) between 3 and 320),
  role public.workspace_role not null check (role <> 'owner'),
  token_hash text not null unique,
  invited_by uuid not null references public.profiles(id) on delete restrict,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index workspace_invitations_pending_email_idx
  on public.workspace_invitations(workspace_id,lower(email))
  where status = 'pending';
create index workspace_invitations_workspace_status_idx
  on public.workspace_invitations(workspace_id,status);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  slug text not null check (slug ~ '^[a-z0-9]+([a-z0-9-]*[a-z0-9])?$' and char_length(slug) <= 60),
  description text check (description is null or char_length(description) <= 500),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,id),
  unique (workspace_id,slug)
);
create index teams_workspace_id_idx on public.teams(workspace_id);

create table public.team_members (
  workspace_id uuid not null,
  team_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (team_id,user_id),
  foreign key (workspace_id,team_id) references public.teams(workspace_id,id) on delete cascade,
  foreign key (workspace_id,user_id) references public.workspace_members(workspace_id,user_id) on delete cascade
);
create index team_members_user_workspace_idx on public.team_members(user_id,workspace_id);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  team_id uuid,
  created_by uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 120),
  client_company text check (client_company is null or char_length(client_company) <= 120),
  description text check (description is null or char_length(description) <= 5000),
  status public.project_status not null default 'in_progress',
  priority public.task_priority not null default 'medium',
  is_archived boolean not null default false,
  due_date date,
  cover_asset_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,id),
  foreign key (workspace_id,team_id) references public.teams(workspace_id,id) on delete set null (team_id)
);
create index projects_workspace_archive_idx on public.projects(workspace_id,is_archived);
create index projects_workspace_team_idx on public.projects(workspace_id,team_id);
create index projects_created_by_idx on public.projects(created_by);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  project_id uuid not null,
  user_id uuid not null,
  role public.workspace_role not null default 'member',
  added_by uuid not null references public.profiles(id) on delete restrict,
  joined_at timestamptz not null default now(),
  unique (project_id,user_id),
  foreign key (workspace_id,project_id) references public.projects(workspace_id,id) on delete cascade,
  foreign key (workspace_id,user_id) references public.workspace_members(workspace_id,user_id) on delete cascade
);
create index project_members_user_project_idx on public.project_members(user_id,project_id);
create index project_members_workspace_project_idx on public.project_members(workspace_id,project_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  project_id uuid not null,
  parent_task_id uuid,
  task_number integer not null default 0 check (task_number >= 0),
  title text not null check (char_length(trim(title)) between 1 and 240),
  description_md text not null default '',
  stage public.task_stage not null default 'todo',
  priority public.task_priority not null default 'medium',
  completed boolean not null default false,
  due_at timestamptz,
  position numeric(18,6) not null default 0,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,id),
  unique (workspace_id,project_id,id),
  unique (project_id,task_number),
  foreign key (workspace_id,project_id) references public.projects(workspace_id,id) on delete cascade,
  foreign key (workspace_id,project_id,parent_task_id) references public.tasks(workspace_id,project_id,id) on delete cascade
);
create index tasks_project_stage_position_idx on public.tasks(project_id,stage,position);
create index tasks_workspace_due_idx on public.tasks(workspace_id,due_at) where due_at is not null;
create index tasks_parent_task_idx on public.tasks(parent_task_id) where parent_task_id is not null;
create index tasks_created_by_idx on public.tasks(created_by);

create table public.task_assignees (
  workspace_id uuid not null,
  task_id uuid not null,
  user_id uuid not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (task_id,user_id),
  foreign key (workspace_id,task_id) references public.tasks(workspace_id,id) on delete cascade,
  foreign key (workspace_id,user_id) references public.workspace_members(workspace_id,user_id) on delete cascade
);
create unique index task_assignees_one_primary_idx on public.task_assignees(task_id) where is_primary;
create index task_assignees_user_idx on public.task_assignees(user_id,task_id);

create table public.storage_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid,
  task_id uuid,
  bucket_id text not null check (bucket_id in ('project-assets','avatars')),
  object_path text not null unique,
  scope public.storage_scope not null,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (char_length(mime_type) <= 150),
  size_bytes bigint not null check (size_bytes > 0),
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (workspace_id,id),
  foreign key (workspace_id,project_id) references public.projects(workspace_id,id) on delete cascade,
  foreign key (workspace_id,task_id) references public.tasks(workspace_id,id) on delete cascade,
  check (task_id is null or project_id is not null)
);
create index storage_assets_workspace_project_idx on public.storage_assets(workspace_id,project_id);
create index storage_assets_task_idx on public.storage_assets(task_id) where task_id is not null;

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null check (char_length(action) between 1 and 100),
  entity_type text not null check (char_length(entity_type) between 1 and 80),
  entity_id text not null check (char_length(entity_id) between 1 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_workspace_created_idx on public.audit_logs(workspace_id,created_at desc);

-- Internal authorization helpers. They are deliberately outside exposed schemas.
create or replace function private.is_workspace_member(p_workspace_id uuid)
returns boolean language sql stable security definer
set search_path = '' set row_security = off
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = p_workspace_id and wm.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_workspace_role(p_workspace_id uuid,p_roles public.workspace_role[])
returns boolean language sql stable security definer
set search_path = '' set row_security = off
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = (select auth.uid())
      and wm.role = any(p_roles)
  );
$$;

create or replace function private.is_project_member(p_project_id uuid,p_user_id uuid)
returns boolean language sql stable security definer
set search_path = '' set row_security = off
as $$
  select exists (
    select 1 from public.project_members pm
    where pm.project_id = p_project_id and pm.user_id = p_user_id
  );
$$;

create or replace function private.can_access_project(p_project_id uuid)
returns boolean language sql stable security definer
set search_path = '' set row_security = off
as $$
  select exists (
    select 1
    from public.projects p
    join public.workspace_members wm
      on wm.workspace_id = p.workspace_id
     and wm.user_id = (select auth.uid())
    where p.id = p_project_id
      and (
        wm.role in ('owner','admin')
        or exists (
          select 1 from public.project_members pm
          where pm.project_id = p.id and pm.user_id = (select auth.uid())
        )
      )
  );
$$;

create or replace function private.can_manage_project(p_project_id uuid)
returns boolean language sql stable security definer
set search_path = '' set row_security = off
as $$
  select exists (
    select 1
    from public.projects p
    join public.workspace_members wm
      on wm.workspace_id = p.workspace_id
     and wm.user_id = (select auth.uid())
    where p.id = p_project_id
      and (
        wm.role in ('owner','admin')
        or exists (
          select 1 from public.project_members pm
          where pm.project_id = p.id
            and pm.user_id = (select auth.uid())
            and pm.role in ('owner','admin')
        )
      )
  );
$$;

create or replace function private.can_write_project(p_project_id uuid)
returns boolean language sql stable security definer
set search_path = '' set row_security = off
as $$
  select exists (
    select 1
    from public.projects p
    join public.workspace_members wm
      on wm.workspace_id = p.workspace_id
     and wm.user_id = (select auth.uid())
    where p.id = p_project_id
      and (
        wm.role in ('owner','admin')
        or exists (
          select 1 from public.project_members pm
          where pm.project_id = p.id
            and pm.user_id = (select auth.uid())
            and pm.role in ('owner','admin','member')
        )
      )
  );
$$;

create or replace function private.can_view_profile(p_user_id uuid)
returns boolean language sql stable security definer
set search_path = '' set row_security = off
as $$
  select p_user_id = (select auth.uid())
    or exists (
      select 1
      from public.workspace_members mine
      join public.workspace_members theirs on theirs.workspace_id = mine.workspace_id
      where mine.user_id = (select auth.uid())
        and theirs.user_id = p_user_id
    );
$$;

create or replace function private.can_access_project_path(p_name text)
returns boolean language plpgsql stable security definer
set search_path = '' set row_security = off
as $$
declare parts text[];
begin
  parts := string_to_array(p_name,'/');
  if array_length(parts,1) < 3
     or parts[1] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     or parts[2] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  return private.can_access_project(parts[2]::uuid)
    and exists (
      select 1 from public.projects p
      where p.id = parts[2]::uuid and p.workspace_id = parts[1]::uuid
    );
end;
$$;

create or replace function private.can_write_project_path(p_name text)
returns boolean language plpgsql stable security definer
set search_path = '' set row_security = off
as $$
declare parts text[];
begin
  parts := string_to_array(p_name,'/');
  if array_length(parts,1) < 3
     or parts[1] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     or parts[2] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  return private.can_write_project(parts[2]::uuid)
    and exists (
      select 1 from public.projects p
      where p.id = parts[2]::uuid and p.workspace_id = parts[1]::uuid
    );
end;
$$;

create or replace function private.can_access_avatar_path(p_name text)
returns boolean language plpgsql stable security definer
set search_path = '' set row_security = off
as $$
declare parts text[];
begin
  parts := string_to_array(p_name,'/');
  if array_length(parts,1) < 4
     or parts[1] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     or parts[2] <> 'avatars'
     or parts[3] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  return exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = parts[1]::uuid
      and wm.user_id = (select auth.uid())
      and (
        wm.user_id = parts[3]::uuid
        or wm.role in ('owner','admin')
      )
  );
end;
$$;

create or replace function private.set_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id,display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'),''),
      nullif(trim(new.raw_user_meta_data->>'full_name'),''),
      nullif(split_part(coalesce(new.email,''),'@',1),''),
      'New member'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function private.handle_new_workspace()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.workspace_members(workspace_id,user_id,role)
  values (new.id,new.owner_id,'owner')
  on conflict (workspace_id,user_id) do nothing;

  insert into public.workspace_subscriptions(workspace_id,plan_tier,status,max_active_projects,max_storage_bytes)
  values (new.id,'free','active',3,104857600)
  on conflict (workspace_id) do nothing;
  return new;
end;
$$;

create or replace function private.handle_new_project()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = new.workspace_id and wm.user_id = new.created_by
  ) then
    raise exception 'Project creator must be a member of the workspace' using errcode = '42501';
  end if;

  insert into public.project_members(workspace_id,project_id,user_id,role,added_by)
  values (new.workspace_id,new.id,new.created_by,'owner',new.created_by)
  on conflict (project_id,user_id) do nothing;
  return new;
end;
$$;

create or replace function private.enforce_active_project_limit()
returns trigger language plpgsql security definer
set search_path = '' set row_security = off
as $$
declare active_limit integer; active_count integer;
begin
  if new.is_archived then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.is_archived = false then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.workspace_id::text,0));

  select ws.max_active_projects into active_limit
  from public.workspace_subscriptions ws
  where ws.workspace_id = new.workspace_id;

  if active_limit is null then
    raise exception 'Workspace subscription is not initialized' using errcode = '23514';
  end if;

  select count(*)::integer into active_count
  from public.projects p
  where p.workspace_id = new.workspace_id and p.is_archived = false
    and (tg_op = 'INSERT' or p.id <> new.id);

  if active_count >= active_limit then
    raise exception 'Active project limit reached for this workspace' using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function private.assign_task_number()
returns trigger language plpgsql security definer
set search_path = '' set row_security = off
as $$
begin
  if new.task_number is null or new.task_number = 0 then
    perform pg_advisory_xact_lock(hashtextextended(new.project_id::text,1));
    select coalesce(max(t.task_number),0)+1 into new.task_number
    from public.tasks t where t.project_id = new.project_id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create trigger on_workspace_created
after insert on public.workspaces
for each row execute function private.handle_new_workspace();

create trigger on_project_created
after insert on public.projects
for each row execute function private.handle_new_project();

create trigger enforce_project_limit_before_write
before insert or update of is_archived on public.projects
for each row execute function private.enforce_active_project_limit();

create trigger assign_task_number_before_insert
before insert on public.tasks
for each row execute function private.assign_task_number();

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger workspaces_set_updated_at before update on public.workspaces
for each row execute function private.set_updated_at();
create trigger workspace_subscriptions_set_updated_at before update on public.workspace_subscriptions
for each row execute function private.set_updated_at();
create trigger teams_set_updated_at before update on public.teams
for each row execute function private.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
for each row execute function private.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
for each row execute function private.set_updated_at();

-- Least-privilege execution. SECURITY DEFINER helpers are not exposed through the Data API.
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.has_workspace_role(uuid,public.workspace_role[]) to authenticated;
grant execute on function private.is_project_member(uuid,uuid) to authenticated;
grant execute on function private.can_access_project(uuid) to authenticated;
grant execute on function private.can_manage_project(uuid) to authenticated;
grant execute on function private.can_write_project(uuid) to authenticated;
grant execute on function private.can_view_profile(uuid) to authenticated;
grant execute on function private.can_access_project_path(text) to authenticated;
grant execute on function private.can_write_project_path(text) to authenticated;
grant execute on function private.can_access_avatar_path(text) to authenticated;

-- The existing DDL event trigger remains active and continues enabling RLS on public tables.
-- Its function is only executable by the database trigger mechanism, not API roles.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- RLS is enabled explicitly as defense in depth (the project's DDL event trigger also enforces it).
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_subscriptions enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invitations enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.storage_assets enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_self_or_colleague on public.profiles
for select to authenticated
using ((select private.can_view_profile(id)));
create policy profiles_update_self on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy workspaces_select_members on public.workspaces
for select to authenticated
using ((select private.is_workspace_member(id)));
create policy workspaces_insert_self_owned on public.workspaces
for insert to authenticated
with check (owner_id = (select auth.uid()));
create policy workspaces_update_admins on public.workspaces
for update to authenticated
using ((select private.has_workspace_role(id,array['owner','admin']::public.workspace_role[])))
with check ((select private.has_workspace_role(id,array['owner','admin']::public.workspace_role[])));
create policy workspaces_delete_owner on public.workspaces
for delete to authenticated
using ((select private.has_workspace_role(id,array['owner']::public.workspace_role[])));

create policy subscriptions_select_workspace_admins on public.workspace_subscriptions
for select to authenticated
using ((select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[])));

create policy workspace_members_select_members on public.workspace_members
for select to authenticated
using ((select private.is_workspace_member(workspace_id)));
create policy workspace_members_insert_admins on public.workspace_members
for insert to authenticated
with check (
  role <> 'owner'
  and (select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[]))
);
create policy workspace_members_update_admins on public.workspace_members
for update to authenticated
using (
  role <> 'owner'
  and (select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[]))
)
with check (
  role <> 'owner'
  and (select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[]))
);
create policy workspace_members_delete_admins on public.workspace_members
for delete to authenticated
using (
  role <> 'owner'
  and (select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[]))
);

create policy workspace_invitations_select_admins on public.workspace_invitations
for select to authenticated
using ((select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[])));
create policy workspace_invitations_insert_admins on public.workspace_invitations
for insert to authenticated
with check (
  invited_by = (select auth.uid())
  and role <> 'owner'
  and (select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[]))
);
create policy workspace_invitations_update_admins on public.workspace_invitations
for update to authenticated
using ((select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[])))
with check (
  role <> 'owner'
  and (select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[]))
);

create policy teams_select_workspace_members on public.teams
for select to authenticated
using ((select private.is_workspace_member(workspace_id)));
create policy teams_insert_admins on public.teams
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[]))
);
create policy teams_update_admins on public.teams
for update to authenticated
using ((select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[])))
with check ((select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[])));
create policy teams_delete_admins on public.teams
for delete to authenticated
using ((select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[])));

create policy team_members_select_self_or_admin on public.team_members
for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[]))
);
create policy team_members_insert_admins on public.team_members
for insert to authenticated
with check ((select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[])));
create policy team_members_delete_admins on public.team_members
for delete to authenticated
using ((select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[])));

create policy projects_select_explicit_membership on public.projects
for select to authenticated
using ((select private.can_access_project(id)));
create policy projects_insert_workspace_members on public.projects
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.has_workspace_role(workspace_id,array['owner','admin','member']::public.workspace_role[]))
);
create policy projects_update_project_admins on public.projects
for update to authenticated
using ((select private.can_manage_project(id)))
with check (
  (select private.can_manage_project(id))
  and workspace_id = (select p.workspace_id from public.projects p where p.id = id)
);
create policy projects_delete_project_owners on public.projects
for delete to authenticated
using (
  (select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[]))
  or (select private.is_project_member(id,(select auth.uid())))
    and exists (select 1 from public.project_members pm where pm.project_id = id and pm.user_id = (select auth.uid()) and pm.role = 'owner')
);

create policy project_members_select_project_access on public.project_members
for select to authenticated
using ((select private.can_access_project(project_id)));
create policy project_members_insert_project_admins on public.project_members
for insert to authenticated
with check (
  role <> 'owner'
  and (select private.can_manage_project(project_id))
  and (select private.is_workspace_member(workspace_id))
);
create policy project_members_update_project_admins on public.project_members
for update to authenticated
using (
  role <> 'owner'
  and (select private.can_manage_project(project_id))
)
with check (
  role <> 'owner'
  and (select private.can_manage_project(project_id))
);
create policy project_members_delete_project_admins on public.project_members
for delete to authenticated
using (
  role <> 'owner'
  and (select private.can_manage_project(project_id))
);

create policy tasks_select_project_access on public.tasks
for select to authenticated
using ((select private.can_access_project(project_id)));
create policy tasks_insert_project_writers on public.tasks
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.can_write_project(project_id))
);
create policy tasks_update_project_writers on public.tasks
for update to authenticated
using ((select private.can_write_project(project_id)))
with check ((select private.can_write_project(project_id)));
create policy tasks_delete_own_or_project_admin on public.tasks
for delete to authenticated
using (
  (select private.can_manage_project(project_id))
  or (created_by = (select auth.uid()) and (select private.can_write_project(project_id)))
);

create policy task_assignees_select_project_access on public.task_assignees
for select to authenticated
using ((select private.can_access_project((select t.project_id from public.tasks t where t.id = task_id))));
create policy task_assignees_insert_project_writers on public.task_assignees
for insert to authenticated
with check (
  (select private.can_write_project((select t.project_id from public.tasks t where t.id = task_id)))
  and (select private.is_project_member((select t.project_id from public.tasks t where t.id = task_id),user_id))
);
create policy task_assignees_delete_project_writers on public.task_assignees
for delete to authenticated
using ((select private.can_write_project((select t.project_id from public.tasks t where t.id = task_id))));

create policy storage_assets_select_project_access on public.storage_assets
for select to authenticated
using (
  project_id is not null and (select private.can_access_project(project_id))
);
create policy storage_assets_insert_project_writers on public.storage_assets
for insert to authenticated
with check (
  uploaded_by = (select auth.uid())
  and project_id is not null
  and (select private.can_write_project(project_id))
);
create policy storage_assets_delete_uploader_or_project_admin on public.storage_assets
for delete to authenticated
using (
  uploaded_by = (select auth.uid())
  or (project_id is not null and (select private.can_manage_project(project_id)))
);

create policy audit_logs_select_workspace_admins on public.audit_logs
for select to authenticated
using ((select private.has_workspace_role(workspace_id,array['owner','admin']::public.workspace_role[])));

-- No client writes to subscriptions or audit logs. Workspace owner is created atomically by trigger.
grant select, update (display_name,avatar_path,locale,presence_status,status_note) on public.profiles to authenticated;
grant select, insert (name,slug,owner_id), update (name,slug), delete on public.workspaces to authenticated;
grant select on public.workspace_subscriptions to authenticated;
grant select, insert (workspace_id,user_id,role), update (role), delete on public.workspace_members to authenticated;
grant select, insert (workspace_id,email,role,token_hash,invited_by,expires_at), update (status,accepted_at) on public.workspace_invitations to authenticated;
grant select, insert (workspace_id,name,slug,description,created_by), update (name,slug,description), delete on public.teams to authenticated;
grant select, insert (workspace_id,team_id,user_id), delete on public.team_members to authenticated;
grant select, insert (workspace_id,team_id,created_by,name,client_company,description,status,priority,is_archived,due_date), update (team_id,name,client_company,description,status,priority,is_archived,due_date,cover_asset_id), delete on public.projects to authenticated;
grant select, insert (workspace_id,project_id,user_id,role,added_by), update (role), delete on public.project_members to authenticated;
grant select, insert (workspace_id,project_id,parent_task_id,title,description_md,stage,priority,completed,due_at,position,created_by), update (parent_task_id,title,description_md,stage,priority,completed,due_at,position), delete on public.tasks to authenticated;
grant select, insert (workspace_id,task_id,user_id,is_primary), delete on public.task_assignees to authenticated;
grant select, insert (workspace_id,project_id,task_id,bucket_id,object_path,scope,file_name,mime_type,size_bytes,uploaded_by), delete on public.storage_assets to authenticated;
grant select on public.audit_logs to authenticated;

-- Private Storage buckets. Upload/download policies below enforce the path contract.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values
  ('project-assets','project-assets',false,26214400,array['image/jpeg','image/png','image/webp','image/avif','application/pdf','text/plain','text/markdown','application/zip']),
  ('avatars','avatars',false,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy kard_project_assets_read on storage.objects
for select to authenticated
using (bucket_id = 'project-assets' and (select private.can_access_project_path(name)));
create policy kard_project_assets_upload on storage.objects
for insert to authenticated
with check (bucket_id = 'project-assets' and (select private.can_write_project_path(name)));
create policy kard_project_assets_update on storage.objects
for update to authenticated
using (
  bucket_id = 'project-assets'
  and (select private.can_write_project_path(name))
  and (owner_id = (select auth.uid()::text) or (select private.can_manage_project((storage.foldername(name))[2]::uuid)))
)
with check (bucket_id = 'project-assets' and (select private.can_write_project_path(name)));
create policy kard_project_assets_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'project-assets'
  and (select private.can_access_project_path(name))
  and (owner_id = (select auth.uid()::text) or (select private.can_manage_project((storage.foldername(name))[2]::uuid)))
);

create policy kard_avatars_read on storage.objects
for select to authenticated
using (bucket_id = 'avatars' and (select private.can_access_avatar_path(name)));
create policy kard_avatars_upload on storage.objects
for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (select private.can_access_avatar_path(name))
  and (storage.foldername(name))[3] = (select auth.uid()::text)
);
create policy kard_avatars_update on storage.objects
for update to authenticated
using (
  bucket_id = 'avatars'
  and (select private.can_access_avatar_path(name))
  and (storage.foldername(name))[3] = (select auth.uid()::text)
)
with check (bucket_id = 'avatars' and (select private.can_access_avatar_path(name)));
create policy kard_avatars_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'avatars'
  and (select private.can_access_avatar_path(name))
  and (storage.foldername(name))[3] = (select auth.uid()::text)
);

commit;
