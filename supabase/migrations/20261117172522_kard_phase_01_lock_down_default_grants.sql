-- Kard Phase 01: remove inherited privileges from exposed business schema.
begin;
revoke all privileges on all tables in schema public from public, anon, authenticated;
revoke all privileges on all sequences in schema public from public, anon, authenticated;
revoke all privileges on all functions in schema public from public, anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

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
commit;
