-- Kard Phase 01: indexes for foreign-key lookups.
begin;
create index audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index project_members_added_by_idx on public.project_members(added_by);
create index project_members_workspace_user_idx on public.project_members(workspace_id,user_id);
create index storage_assets_uploaded_by_idx on public.storage_assets(uploaded_by);
create index storage_assets_workspace_task_idx on public.storage_assets(workspace_id,task_id);
create index task_assignees_workspace_task_idx on public.task_assignees(workspace_id,task_id);
create index task_assignees_workspace_user_idx on public.task_assignees(workspace_id,user_id);
create index tasks_workspace_project_parent_idx on public.tasks(workspace_id,project_id,parent_task_id);
create index team_members_workspace_team_idx on public.team_members(workspace_id,team_id);
create index team_members_workspace_user_idx on public.team_members(workspace_id,user_id);
create index teams_created_by_idx on public.teams(created_by);
create index workspace_invitations_invited_by_idx on public.workspace_invitations(invited_by);
commit;
