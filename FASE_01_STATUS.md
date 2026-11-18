# Kard — Fase 01: estado de implementação e auditoria

Atualizado em 18-11-2026.

## Decisões confirmadas

- Supabase é a plataforma principal: projeto **Kard**, região `eu-west-1`, PostgreSQL 17.
- Workspace é a raiz do isolamento multi-tenant; equipas pertencem a Workspaces.
- **O acesso a cada projeto exige sempre uma linha explícita em `project_members`.** Ser Owner/Admin do Workspace ou pertencer à equipa não concede acesso automático ao projeto.
- Firebase/Firestore é legado de protótipo, sem dados reais a migrar. O destino da autenticação e dos dados operacionais é Supabase.
- Cloudflare R2 não será utilizado. O armazenamento de ficheiros será feito exclusivamente no Supabase Storage, com buckets privados.
- A integração Google Workspace (Calendar/Drive) deve ser preservada durante a substituição da autenticação Firebase.
- Planos e limites não podem ser alterados pelo cliente.

## Estado real do Supabase

- Projeto ativo e saudável; PostgreSQL 17.12.
- 13 tabelas públicas, todas com RLS ativo:
  `profiles`, `workspaces`, `workspace_subscriptions`, `workspace_members`, `workspace_invitations`, `teams`, `team_members`, `projects`, `project_members`, `tasks`, `task_assignees`, `storage_assets` e `audit_logs`.
- Quatro migrações registadas no projeto remoto:
  - `20261117172303_kard_phase_01_core_schema_and_rls`
  - `20261117172334_kard_phase_01_foreign_key_indexes`
  - `20261117172522_kard_phase_01_lock_down_default_grants`
  - `20261118134101_kard_enforce_explicit_project_membership`
- As três migrações originais já aplicadas estão agora versionadas em `supabase/migrations/`; a migração base foi recuperada diretamente do histórico oficial do projeto remoto.
- Dois buckets privados já existentes: `project-assets` (25 MiB) e `avatars` (5 MiB), com políticas Storage restritas a utilizadores autenticados.
- Limite Free de 3 projetos ativos aplicado por trigger transacional.
- A base de dados não contém utilizadores, Workspaces ou dados de negócio.

## Correção de segurança aplicada e verificada

A migração `20261118134101` foi aplicada no Supabase e confirmada no histórico remoto.

- `private.can_access_project` agora exige sempre associação explícita em `project_members`.
- `private.can_manage_project` e `private.can_write_project` deixam de conceder permissões por ser Owner/Admin do Workspace.
- A atualização de projetos deixou de depender da condição SQL tautológica anterior.
- A eliminação de projetos passou a exigir que o utilizador seja Owner explícito daquele projeto.
- As políticas de tarefas, metadados de ficheiros e Storage que usam estes helpers passam também a respeitar o acesso explícito.

Verificações após a migração:
- Advisor de segurança: sem avisos.
- Advisor de saúde: sem avisos.
- Advisor de performance: 31 índices ainda reportados como não utilizados. Como a base de dados é nova e está vazia, não foram removidos.
- As definições das três funções e as políticas de UPDATE/DELETE de projetos foram relidas no banco remoto e correspondem à migração.
- Testes transacionais RLS executados com utilizadores temporários e rollback: Workspace Admin sem associação ao projeto obteve zero acesso/leitura/escrita e zero linhas em UPDATE/DELETE; membro explícito com papel guest conseguiu ler, mas não gerir nem escrever; Owner explícito conseguiu gerir e eliminar o projeto.
- Todos os dados de teste foram revertidos; a base continua sem utilizadores, Workspaces ou projetos.
- `src/types/database.ts` foi regenerado a partir do projeto remoto e comparado com o schema atual.

## Diferenças importantes entre a aplicação e a arquitetura aprovada

- `app/layout.tsx` ainda envolve a aplicação com `FirebaseProvider`.
- `app/page.tsx` e `lib/firestoreSync.ts` continuam a utilizar operações Firebase/Firestore.
- Os clientes Supabase Browser/Server e o middleware SSR existem, mas a autenticação e as operações de negócio da aplicação ainda não foram migradas para Supabase.
- Uploads e capas de projeto ainda dependem de endpoints e SDK Cloudflare R2.
- A substituição de R2 por Supabase Storage depende da migração da autenticação para Supabase Auth; não se deve remover os endpoints antigos antes de a substituição estar funcional.
- Não foi encontrado um script `test` nem uma suite automatizada de testes no `package.json`.
- O repositório contém lockfiles de npm, pnpm e Bun. A rotina local do utilizador utiliza npm; a consolidação do gestor de pacotes deve ser feita com validação dos lockfiles.

## Trabalho ainda necessário para fechar a Fase 01

1. Migrar a autenticação para Supabase Auth (email/password e Google), preservando a integração Google Workspace.
2. Migrar operações de dados de Firestore/localStorage para PostgreSQL através dos clientes Supabase e RLS.
3. Substituir uploads/downloads R2 pelo Supabase Storage privado e respetivos registos em `storage_assets`.
4. Depois de validar a substituição, remover Firebase Auth/Firestore legado e todo o código, rotas, dependências e variáveis Cloudflare R2 que já não tenham referências.
5. Criar testes de integração com identidades separadas para validar RLS, RBAC, associação explícita a projetos e isolamento entre Workspaces.
6. Rever versões e lockfiles, configurar verificações automáticas e executar TypeScript, lint e build.
7. Confirmar sincronização das migrações local/remoto antes de qualquer novo deploy.

## Regras de segurança

- Nunca colocar `SUPABASE_SECRET_KEY` ou uma antiga `service_role` no browser, em variáveis `NEXT_PUBLIC_*`, logs ou commits.
- A chave publicável pode estar no browser; RLS é obrigatória e deve continuar a ser a fronteira de autorização.
- Não remover dados, contas, ficheiros ou integrações antigas antes de validar a substituição e o rollback.
