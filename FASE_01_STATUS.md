# Kard — Fase 01: estado de implementação

Atualizado em 17-11-2026.

## Decisões confirmadas
- Supabase principal: projeto **Kard**, região `eu-west-1`, PostgreSQL 17.
- Workspace é a raiz do isolamento multi-tenant; equipas pertencem a Workspaces.
- O acesso a projetos é sempre explícito via `project_members`. A pertença a uma equipa não concede acesso.
- Firebase contém apenas dados de protótipo; os ficheiros legados Firebase/R2 permanecem no repositório durante a transição.
- Planos e limites não podem ser alterados pelo cliente.

## Aplicado no Supabase
- Migração `kard_phase_01_core_schema_and_rls` — versão `20261117172303`.
- Migração `kard_phase_01_foreign_key_indexes` — índices de suporte às chaves estrangeiras.
- 13 tabelas públicas: profiles, workspaces, workspace_subscriptions, workspace_members, workspace_invitations, teams, team_members, projects, project_members, tasks, task_assignees, storage_assets e audit_logs.
- RLS ativo nas 13 tabelas.
- Helpers internos de autorização no schema `private`, fora da Data API.
- Dois buckets privados: `project-assets` e `avatars`.
- Limite Free de 3 projetos ativos aplicado por trigger transacional.
- Criação de perfil no registo Auth; criação de membro Owner e subscrição Free ao criar Workspace.
- A função antiga `public.rls_auto_enable()` mantém o event trigger ativo, mas já não pode ser executada por `anon` nem `authenticated`.

## Verificação executada
- 13/13 tabelas com RLS.
- 2/2 buckets criados e privados.
- Advisor de segurança sem avisos após as alterações.
- Advisor de saúde sem avisos.
- Índices de chaves estrangeiras adicionados após o primeiro relatório de performance.
- A base de dados está vazia; não foram criados utilizadores, Workspaces ou dados de demonstração.

## Ainda por concluir antes de declarar a Fase 01 concluída
1. Exportar/gerar e versionar no GitHub as migrações SQL completas a partir do schema aplicado no projeto remoto (não reconstruir manualmente a partir deste resumo).
2. Instalar e fixar `@supabase/supabase-js`, `@supabase/ssr` e Vitest no projeto, atualizando o lockfile com o gestor de pacotes do repositório.
3. Implementar clientes browser/server, middleware SSR, Auth email/password + Google e onboarding.
4. Integrar Workspace, equipas, projetos, tarefas e Storage na aplicação Next.js.
5. Criar testes de integração com utilizadores de teste separados para validar RLS, RBAC, acesso explícito a projetos e isolamento entre Workspaces.
6. Executar `tsc`, lint e build.

## Regra de segurança
Nunca colocar `SUPABASE_SECRET_KEY` (ou uma antiga `service_role`) em código/browser, prefixos `NEXT_PUBLIC_`, logs ou commits. A chave publicável é a única chave Supabase permitida no browser; as políticas RLS continuam a ser a fronteira de autorização.
