# FASE 01 — Preparação e Plano Técnico de Fundação Supabase (Kard)

> **Estado:** Plano de preparação concluído com as decisões confirmadas em 17-11-2026.  
> **Restrições ativas:** Nenhuma funcionalidade foi implementada, nenhuma dependência foi instalada, nenhum ficheiro existente do código foi modificado, nenhuma tabela/bucket foi criado e nenhuma migração foi executada.  
> **Contexto confirmado:** Firebase/Firestore atual contém apenas dados de protótipo (sem utilizadores/dados reais a migrar) e o projeto Supabase ainda não foi criado.

---

## 1. Arquitetura final proposta

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Next.js 15 App Router                              │
│                                                                              │
│  Camada Cliente (Browser)              Camada Servidor (SSR / Route Handlers)│
│  - UI em Português (i18n-ready EN)     - @supabase/ssr (cookies HttpOnly)    │
│  - NEXT_PUBLIC_SUPABASE_ANON_KEY       - Auth verificada via auth.getUser()  │
│    (todas as queries passam por RLS)   - Entitlements & limites server-side  │
│  - Zero secrets / Zero service_role    - Signed URLs (Storage privado)       │
│  - localStorage só p/ tema e prefs UI  - SUPABASE_SERVICE_ROLE_KEY (restrita)│
└───────────────────┬───────────────────────────────────────┬──────────────────┘
                    │ JWT sessão (RLS ativo)                │ Privilegiado (só admin/
                    ▼                                       ▼ sistema quando indispensável)
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Supabase (Plataforma Principal)                      │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌────────────────────┐  │
│  │    Supabase Auth     │  │ Supabase PostgreSQL  │  │  Supabase Storage  │  │
│  │ - Email + Password   │  │ - Multi-tenant raiz: │  │ - Buckets privados │  │
│  │ - Google OAuth       │  │   workspace_id       │  │ - Policies RLS     │  │
│  │ - Sessões SSR seguras│  │ - RLS + GRANTs       │  │ - Signed URLs      │  │
│  └──────────────────────┘  └──────────────────────┘  └────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Decisões arquiteturais consolidadas

- **Raiz multi-tenant:** `workspaces` é a entidade soberana de isolamento. `teams`, `projects`, `workspace_members`, `tasks` e `storage_assets` ficam todos vinculados ao `workspace_id`.
- **Serviços Supabase na Fase 01:** apenas **PostgreSQL**, **Auth**, **Storage privado** e **RLS/Grants**. **Realtime** e **Edge Functions** ficam desligados nesta fase por não haver necessidade operacional justificada.
- **Lógica server-side:** mantida nos Route Handlers / Server Actions do Next.js + funções/constraints no PostgreSQL.
- **Idioma e módulos:** interface inicial em **Português** com camada de dicionários/i18n preparada para **Inglês**. `Time Tracker`, `Modo Foco`, `Briefing Matinal` e `Automações` permanecem no plano de produto para integração progressiva após o núcleo da Fase 01; **Chat** fica fora do MVP inicial.
- **Coexistência / Rollback:** os ficheiros legados de Firebase e Cloudflare R2 **não** serão removidos na Fase 01; ficam isolados como referência/rollback até validação integral da nova base.

---

## 2. Modelo relacional completo (PostgreSQL)

Todas as tabelas operacionais residem no schema `public` (protegidas por RLS e `GRANT`s mínimos), e helpers de segurança / tabelas administrativas internas ficam no schema `private` (não exposto pela Data API).

### Enums SQL

- `workspace_role`: `'owner' | 'admin' | 'member' | 'guest'`
- `invitation_status`: `'pending' | 'accepted' | 'revoked' | 'expired'`
- `plan_tier`: `'free' | 'pro' | 'business'`
- `subscription_status`: `'active' | 'trialing' | 'past_due' | 'canceled' | 'expired' | 'incomplete'`
- `project_status`: `'backlog' | 'in_progress' | 'on_hold' | 'completed'`
- `task_stage`: `'todo' | 'in_progress' | 'review' | 'done'`
- `task_priority`: `'urgent' | 'high' | 'medium' | 'low' | 'no_priority'` *(alinhado com Q56)*
- `storage_scope`: `'internal' | 'deliverable' | 'cover' | 'avatar'`
- `member_presence`: `'online' | 'in_meeting' | 'focused' | 'offline'`

### Tabelas da Fase 01

| Tabela | Colunas principais | Restrições / Índices |
| --- | --- | --- |
| `public.profiles` | `id uuid PK` (`FK -> auth.users(id) ON DELETE CASCADE`), `display_name text NOT NULL`, `avatar_url text`, `locale text DEFAULT 'pt'`, `presence_status member_presence DEFAULT 'online'`, `status_note text`, `created_at timestamptz`, `updated_at timestamptz` | `1:1` com `auth.users`. Sem coluna de plano editável. |
| `public.workspaces` | `id uuid PK DEFAULT gen_random_uuid()`, `name text NOT NULL`, `slug text NOT NULL UNIQUE`, `owner_id uuid NOT NULL FK -> profiles(id)`, `created_at timestamptz`, `updated_at timestamptz` | Índice em `owner_id`. `slug` validado por regex `^[a-z0-9-]+$`. |
| `public.workspace_subscriptions` | `workspace_id uuid PK FK -> workspaces(id) ON DELETE CASCADE`, `plan_tier plan_tier NOT NULL DEFAULT 'free'`, `status subscription_status NOT NULL DEFAULT 'active'`, `max_active_projects int NOT NULL DEFAULT 3`, `max_storage_bytes bigint NOT NULL DEFAULT 104857600`, `updated_at timestamptz` | **Escrita proibida ao cliente (`authenticated`/`anon`).** Apenas `service_role` ou função de provisionamento inicial escreve aqui. |
| `public.workspace_members` | `id uuid PK DEFAULT gen_random_uuid()`, `workspace_id uuid NOT NULL FK -> workspaces(id) ON DELETE CASCADE`, `user_id uuid NOT NULL FK -> profiles(id) ON DELETE CASCADE`, `role workspace_role NOT NULL DEFAULT 'member'`, `joined_at timestamptz NOT NULL DEFAULT now()` | `UNIQUE(workspace_id, user_id)` (chave composta referenciada por `team_members`, `project_members` e `task_assignees`). |
| `public.workspace_invitations` | `id uuid PK DEFAULT gen_random_uuid()`, `workspace_id uuid NOT NULL FK -> workspaces(id) ON DELETE CASCADE`, `email text NOT NULL`, `role workspace_role NOT NULL`, `token_hash text NOT NULL UNIQUE`, `invited_by uuid NOT NULL FK -> profiles(id)`, `status invitation_status NOT NULL DEFAULT 'pending'`, `expires_at timestamptz NOT NULL`, `accepted_at timestamptz`, `created_at timestamptz` | Índice parcial único `(workspace_id, lower(email)) WHERE status = 'pending'`. `CHECK (role <> 'owner')`. |
| `public.teams` | `id uuid PK DEFAULT gen_random_uuid()`, `workspace_id uuid NOT NULL FK -> workspaces(id) ON DELETE CASCADE`, `name text NOT NULL`, `slug text NOT NULL`, `description text`, `created_by uuid NOT NULL FK -> profiles(id)`, `created_at timestamptz`, `updated_at timestamptz` | `UNIQUE(workspace_id, id)` e `UNIQUE(workspace_id, slug)`. |
| `public.team_members` | `team_id uuid NOT NULL`, `workspace_id uuid NOT NULL`, `user_id uuid NOT NULL`, `created_at timestamptz`, `PRIMARY KEY(team_id, user_id)` | FK composta `(workspace_id, team_id) -> teams(workspace_id, id)` e `(workspace_id, user_id) -> workspace_members(workspace_id, user_id)`. |
| `public.projects` | `id uuid PK DEFAULT gen_random_uuid()`, `workspace_id uuid NOT NULL FK -> workspaces(id) ON DELETE CASCADE`, `team_id uuid NULL`, `created_by uuid NOT NULL FK -> profiles(id)`, `name text NOT NULL`, `client_company text`, `description text`, `status project_status NOT NULL DEFAULT 'in_progress'`, `priority task_priority NOT NULL DEFAULT 'medium'`, `is_archived boolean NOT NULL DEFAULT false`, `due_date date`, `cover_asset_id uuid NULL`, `created_at timestamptz`, `updated_at timestamptz` | `UNIQUE(workspace_id, id)`. FK composta `(workspace_id, team_id) -> teams(workspace_id, id)` quando `team_id IS NOT NULL`. Índice `(workspace_id, is_archived)`. |
| `public.project_members` | `id uuid PK DEFAULT gen_random_uuid()`, `workspace_id uuid NOT NULL`, `project_id uuid NOT NULL`, `user_id uuid NOT NULL`, `role workspace_role NOT NULL`, `added_by uuid NOT NULL FK -> profiles(id)`, `joined_at timestamptz` | `UNIQUE(project_id, user_id)`. FKs compostas `(workspace_id, project_id) -> projects(workspace_id, id)` e `(workspace_id, user_id) -> workspace_members(workspace_id, user_id)`. |
| `public.tasks` | `id uuid PK DEFAULT gen_random_uuid()`, `workspace_id uuid NOT NULL`, `project_id uuid NOT NULL`, `parent_task_id uuid NULL`, `task_number int NOT NULL`, `title text NOT NULL`, `description_md text DEFAULT ''`, `stage task_stage NOT NULL DEFAULT 'todo'`, `priority task_priority NOT NULL DEFAULT 'medium'`, `completed boolean NOT NULL DEFAULT false`, `due_at timestamptz`, `position numeric NOT NULL DEFAULT 0`, `created_by uuid NOT NULL FK -> profiles(id)`, `created_at timestamptz`, `updated_at timestamptz` | `UNIQUE(workspace_id, id)` e `UNIQUE(project_id, task_number)`. FK composta `(workspace_id, project_id) -> projects(workspace_id, id)`. |
| `public.task_assignees` | `workspace_id uuid NOT NULL`, `task_id uuid NOT NULL`, `user_id uuid NOT NULL`, `is_primary boolean NOT NULL DEFAULT false`, `PRIMARY KEY(task_id, user_id)` | FKs compostas `(workspace_id, task_id) -> tasks(workspace_id, id)` e `(workspace_id, user_id) -> workspace_members(workspace_id, user_id)`. Índice único parcial garantindo no máximo 1 `is_primary = true` por tarefa. |
| `public.storage_assets` | `id uuid PK DEFAULT gen_random_uuid()`, `workspace_id uuid NOT NULL FK -> workspaces(id) ON DELETE CASCADE`, `project_id uuid NULL`, `task_id uuid NULL`, `bucket_id text NOT NULL`, `object_path text NOT NULL UNIQUE`, `scope storage_scope NOT NULL`, `file_name text NOT NULL`, `mime_type text NOT NULL`, `size_bytes bigint NOT NULL CHECK (size_bytes > 0)`, `uploaded_by uuid NOT NULL FK -> profiles(id)`, `created_at timestamptz` | FK composta `(workspace_id, project_id) -> projects(workspace_id, id)` quando `project_id IS NOT NULL`; `(workspace_id, task_id) -> tasks(workspace_id, id)` quando `task_id IS NOT NULL`. |
| `public.audit_logs` | `id uuid PK DEFAULT gen_random_uuid()`, `workspace_id uuid NOT NULL FK -> workspaces(id) ON DELETE CASCADE`, `actor_id uuid NULL FK -> profiles(id)`, `action text NOT NULL`, `entity_type text NOT NULL`, `entity_id text NOT NULL`, `metadata jsonb NOT NULL DEFAULT '{}'::jsonb`, `created_at timestamptz NOT NULL DEFAULT now()` | Registos append-only (sem `UPDATE`/`DELETE` por utilizadores). |

---

## 3. Relações entre Workspace, Teams, Members, Projects e Tasks

```
Workspace (1)
 ├── (1:1) WorkspaceSubscription (plano e limites — leitura apenas para Owner/Admin)
 ├── (1:N) WorkspaceMember (papéis: owner | admin | member | guest)
 │            │
 │            ├── (N:M via team_members) ─────────► Team (1..N equipas dentro do Workspace)
 │            │                                        │ (0..N projetos associados à equipa)
 │            └── (N:M via project_members) ───────► Project (1..N projetos dentro do Workspace)
 │                                                       │ (1:N)
 │                                                       ▼
 │                                                     Task (1..N tarefas / subtarefas)
 │                                                       │ (N:M via task_assignees)
 │                                                       └──► Responsável principal + Colaboradores
 └── (1:N) StorageAsset (ligado ao workspace e opcionalmente a projeto/tarefa)
```

### Garantias de integridade entre tenants

1. **FKs compostas `(workspace_id, ...)`:** é estruturalmente impossível na base de dados ligar uma `Team` do Workspace A a um `Project` do Workspace B, adicionar um utilizador de fora do Workspace a `project_members`, ou atribuir uma `Task` a um utilizador que não pertence ao mesmo `workspace_id`.
2. **Papel efetivo em Projeto:**
   - `Owner` e `Admin` do `Workspace` têm visibilidade e gestão administrativa sobre todos os projetos e equipas do respetivo Workspace.
   - `Member` acede aos projetos do Workspace onde participa (ou projetos abertos da sua equipa/workspace conforme regra do projeto) e pode gerir projetos onde seja explicitamente adicionado como `owner`/`admin` em `project_members`.
   - `Guest` acede **exclusivamente** aos projetos onde possua registo explícito em `project_members` (isolado dos restantes projetos e equipas do Workspace).

---

## 4. Sistema de autenticação (Supabase Auth)

1. **SDK e gestão de sessão SSR:**
   - Utilizar `@supabase/supabase-js` + `@supabase/ssr` com cookies `HttpOnly` renovados via `middleware.ts`.
   - No servidor (Server Components, Route Handlers e Server Actions), validar sempre a identidade com `await supabase.auth.getUser()` — **nunca** confiar em `user_id` ou `workspace_id` enviados no body sem verificar sessão e membership.
2. **Métodos na Fase 01:**
   - **Email + Password:** criação de conta, confirmação por email, login e recuperação de password (`/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/callback`).
   - **Google OAuth:** login social via Supabase Auth (com callback `/auth/callback`).
   - *Nota sobre Q72–Q75:* GitHub, Microsoft, Apple Sign-In, Passkeys e MFA ficam preparados na arquitetura de Auth para ativação nas fases dedicadas após configuração das credenciais externas.
3. **Onboarding real:**
   - Trigger `AFTER INSERT ON auth.users` (`SECURITY DEFINER`, `search_path = private, public`) cria `public.profiles` automaticamente.
   - Se o utilizador autenticado não tiver nenhum registo em `workspace_members`, é direcionado para `/onboarding` para criar o primeiro **Workspace** (via função SQL atómica `create_workspace(p_name, p_slug)`) ou aceitar convites pendentes por email.
   - Zero criação automática de dados fictícios (`INITIAL_PROJECTS`, `INITIAL_TASKS`, etc. não entram em contas reais).

---

## 5. Matriz de permissões (`Owner`, `Admin`, `Member`, `Guest`)

| Ação / Recurso | Owner | Admin | Member | Guest | Não-membro |
| --- | --- | --- | --- | --- | --- |
| Ver detalhes do Workspace | Sim | Sim | Sim | Apenas metadados dos projetos onde participa | **Negado** |
| Editar nome / slug do Workspace | Sim | Sim | Não | Não | **Negado** |
| Eliminar Workspace / Transferir Owner | **Sim** | Não | Não | Não | **Negado** |
| Ver plano / limites (`workspace_subscriptions`) | Sim | Sim | Não | Não | **Negado** |
| Alterar `plan_tier` diretamente | **Negado** (só servidor/webhook) | **Negado** | **Negado** | **Negado** | **Negado** |
| Convidar/remover membros (`Admin`/`Member`/`Guest`) | Sim | Sim (não remove/altera `Owner`) | Não | Não | **Negado** |
| Criar / gerir Equipas (`teams`) e `team_members` | Sim | Sim | Não | Não | **Negado** |
| Criar Projeto (sujeito ao limite do plano) | Sim | Sim | Sim | Não | **Negado** |
| Editar definições / arquivar / apagar Projeto | Sim | Sim | Apenas se `project_members.role IN ('owner','admin')` | Não | **Negado** |
| Listar / ver Tarefas do Projeto | Sim | Sim | Sim (projetos permitidos) | Apenas projetos atribuídos | **Negado** |
| Criar / editar / mover Tarefas | Sim | Sim | Sim | Apenas onde autorizado no projeto (ou apenas leitura/próprias) | **Negado** |
| Apagar Tarefas | Sim | Sim | Apenas criadas por si (`created_by = auth.uid()`) | Não | **Negado** |
| Upload no Storage privado (`project-assets`) | Sim | Sim | Sim (`internal` nos seus projetos) | Não | **Negado** |
| Download via Signed URL (`project-assets`) | Sim | Sim | Sim (projetos permitidos) | Apenas ficheiros dos projetos atribuídos | **Negado** |
| Apagar ficheiros no Storage | Sim | Sim | Apenas ficheiros que enviou (`uploaded_by = auth.uid()`) | Não | **Negado** |
| Ler `audit_logs` | Sim | Sim | Não | Não | **Negado** |

---

## 6. Políticas RLS e `GRANT`s

### 6.1 Princípio duplo: `GRANT`s mínimos + RLS obrigatório

1. **Revogação base:**
   - `REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;`
   - `REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;`
   - `anon`: **sem privilégios** nas tabelas de negócio (apenas rotas públicas explícitas no futuro, e nunca por omissão).
2. **Grants granulares para `authenticated`:**
   - `profiles`: `SELECT, UPDATE (display_name, avatar_url, locale, presence_status, status_note)` *(inserção feita pelo trigger de auth; eliminação controlada)*.
   - `workspaces`: `SELECT, INSERT, UPDATE (name, slug), DELETE` *(sem `UPDATE` em `owner_id` direto — transferência via função dedicada)*.
   - `workspace_subscriptions`: `SELECT` apenas *(nenhum `INSERT/UPDATE/DELETE` para `authenticated`)*.
   - `workspace_members`, `workspace_invitations`, `teams`, `team_members`, `projects`, `project_members`, `tasks`, `task_assignees`, `storage_assets`: apenas operações necessárias.
   - `audit_logs`: `SELECT` apenas.

### 6.2 Helpers SQL no schema `private` (sem recursão RLS)

Todas as funções auxiliares são `SECURITY DEFINER`, `STABLE`, `SET search_path = public, private, pg_temp`, com `REVOKE ALL FROM PUBLIC` e `GRANT EXECUTE TO authenticated`:

- `private.is_workspace_member(p_ws_id uuid) -> boolean`
- `private.has_workspace_role(p_ws_id uuid, p_roles workspace_role[]) -> boolean`
- `private.can_access_project(p_project_id uuid) -> boolean`: verdadeiro se `has_workspace_role(p.workspace_id, ['owner','admin'])`, se o utilizador for membro `member` do workspace num projeto não restrito (ou presente em `project_members`), ou se for `guest` presente em `project_members`.
- `private.can_manage_project(p_project_id uuid) -> boolean`
- `private.within_active_project_limit(p_ws_id uuid) -> boolean`: lê `workspace_subscriptions.max_active_projects` e compara com `COUNT(*)` de `projects WHERE workspace_id = p_ws_id AND is_archived = false`.

### 6.3 Resumo das políticas RLS por tabela (separadas por `SELECT`, `INSERT`, `UPDATE`, `DELETE`)

- **`profiles`:**
  - `SELECT`: `id = auth.uid()` OU partilha `workspace_id` ativo em `workspace_members`.
  - `UPDATE`: `USING (id = auth.uid())` + `WITH CHECK (id = auth.uid())`.
- **`workspaces`:**
  - `SELECT`: `private.is_workspace_member(id)`.
  - `INSERT`: preferencialmente via RPC `private.create_workspace_for_user` (`auth.uid() IS NOT NULL AND owner_id = auth.uid()`).
  - `UPDATE`: `USING (private.has_workspace_role(id, ARRAY['owner','admin']::workspace_role[]))` + `WITH CHECK (owner_id = owner_id)` (trigger bloqueia alteração de `owner_id`).
  - `DELETE`: `owner_id = auth.uid()`.
- **`workspace_subscriptions`:**
  - `SELECT`: `private.has_workspace_role(workspace_id, ARRAY['owner','admin']::workspace_role[])`.
  - Sem policies de escrita para `authenticated` (bloqueado por RLS + `REVOKE`).
- **`workspace_members`:**
  - `SELECT`: `private.is_workspace_member(workspace_id)`.
  - `INSERT`: `private.has_workspace_role(workspace_id, ARRAY['owner','admin']::workspace_role[]) AND role <> 'owner'`.
  - `UPDATE`: `USING` exige `owner` (ou `admin` sobre `member`/`guest`) + `WITH CHECK` impede mudar `workspace_id` ou promover para `owner`.
  - `DELETE`: `owner` pode remover não-owners; `admin` remove apenas `member`/`guest`; próprio membro (`user_id = auth.uid()`) pode sair se não for o último `owner`.
- **`projects`:**
  - `SELECT`: `private.can_access_project(id)`.
  - `INSERT`: `private.has_workspace_role(workspace_id, ARRAY['owner','admin','member']::workspace_role[]) AND created_by = auth.uid() AND (is_archived = true OR private.within_active_project_limit(workspace_id))`.
  - `UPDATE`: `USING (private.can_manage_project(id) OR private.has_workspace_role(workspace_id, ARRAY['owner','admin']::workspace_role[]))` + `WITH CHECK` garante `workspace_id` imutável e impede desarquivar (`is_archived: true -> false`) se exceder `within_active_project_limit(workspace_id)`.
  - `DELETE`: `private.has_workspace_role(workspace_id, ARRAY['owner','admin']::workspace_role[])` ou criador/owner do projeto conforme matriz.
- **`tasks` / `task_assignees` / `project_members` / `teams` / `team_members` / `storage_assets`:**
  - `SELECT`: sempre restrito ao `workspace_id` (e projeto quando `Guest`).
  - `INSERT`/`UPDATE`: `WITH CHECK` valida `workspace_id` imutável, pertença ao projeto e autoria (`created_by = auth.uid()` / `uploaded_by = auth.uid()`).
  - `DELETE`: `Owner`/`Admin` ou criador/uploader quando permitido na matriz (`Member`).
- **`audit_logs`:**
  - `SELECT`: `private.has_workspace_role(workspace_id, ARRAY['owner','admin']::workspace_role[])`.

---

## 7. Estratégia de Storage privado (Supabase Storage)

1. **Buckets privados por omissão (`public = false`):**
   - `project-assets`: anexos de tarefas/projetos, capas de projetos e futuros entregáveis.
   - `avatars`: fotografias de perfil e logótipos de workspaces.
2. **Paths padronizados no servidor (nunca escolhidos livremente pelo cliente):**
   - `project-assets`: `{workspace_id}/{project_id}/{scope}/{asset_uuid}-{sanitized_filename}`
   - `avatars`: `{workspace_id}/avatars/{user_id}/{asset_uuid}-{sanitized_filename}` (ou `users/{user_id}/...`)
3. **Validação em duas camadas:**
   - **Route Handlers Next.js (`/api/storage/upload-url`, `/api/storage/download-url`, `/api/storage/delete`):**
     - Validam sessão via `supabase.auth.getUser()`.
     - Verificam papel no projeto/workspace e uso acumulado vs. `workspace_subscriptions.max_storage_bytes`.
     - Validam extensão/MIME allowlist e limite de tamanho por escopo (ex.: 5 MB capas/avatares, 25 MB anexos internos).
     - Emitem **Signed Upload URL** (curta duração, ex.: 60 s) e **Signed Download URL** (ex.: 300 s) e registam/validam metadados em `public.storage_assets`.
   - **Policies em `storage.objects`:**
     - `SELECT / INSERT / DELETE` verificam `bucket_id = 'project-assets'` e extraem `(storage.foldername(name))[1]::uuid` (`workspace_id`) e `[2]::uuid` (`project_id`), exigindo pertença via `private.can_access_project(...)` e `owner`/`uploaded_by = auth.uid()` quando aplicável.
   - **Higiene de órfãos:** registo de status ou remoção coordenada DB + Storage no endpoint de eliminação.

---

## 8. Estratégia de configuração do Supabase (projeto ainda não criado)

Como o projeto Supabase ainda não foi criado, a arquitetura será preparada em modo **Schema-as-Code**:

1. **Estrutura versionada no repositório (quando Fase 01 for aprovada):**
   - `supabase/config.toml` (para desenvolvimento/testes com Supabase CLI se disponível) e `supabase/migrations/0001_...sql` até `000N_...sql` contendo **100% das tabelas, enums, funções `private.*`, triggers, `GRANT`s, policies RLS e criação dos buckets/policies de Storage**.
2. **Passos manuais que o utilizador fará quando criar o projeto Supabase:**
   - Criar organização e projeto Supabase (escolher região próxima dos utilizadores, ex.: `eu-west-1` / `eu-central-1` / `sa-east-1`, e confirmar limites/termos da conta gratuita ou plano escolhido).
   - Recomenda-se separar pelo menos **1 projeto de Staging/Dev** e **1 projeto de Produção** antes do lançamento.
   - No Dashboard do Supabase -> **Authentication**:
     - Configurar `Site URL` e `Redirect URLs` (`/auth/callback` em localhost e URL Cloud Run).
     - Ativar provider **Email** (com confirmação de email ligada) e **Google** (Client ID/Secret OAuth).
     - Configurar **SMTP personalizado** antes de produção (o SMTP padrão do Supabase tem limite estrito de envios/hora).
   - Aplicar as migrações versionadas (`supabase db push` ou execução sequencial das migrações em SQL Editor reproduzindo exatamente os ficheiros `supabase/migrations/*.sql`) — nunca alterar schema só no Dashboard sem refletir nas migrações.
   - Confirmar estratégia de backups da conta (Free não inclui PITR nem backups diários automáticos — prever exportações `pg_dump` agendadas antes de produção).

---

## 9. Variáveis de ambiente necessárias (apenas nomes)

| Variável | Escopo | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente + Servidor | URL base da instância Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente + Servidor | Chave pública (`anon`/publishable) sujeita a RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **Servidor apenas** | Usada exclusivamente no backend protegido (provisioning de subscrição inicial, webhooks futuros, limpeza administrativa e runner de testes) |
| `APP_URL` / `NEXT_PUBLIC_APP_URL` | Servidor / Cliente | URL da aplicação para links de redirecionamento e OAuth callbacks |

*(Nota: `GEMINI_API_KEY` e `R2_*` existentes em `.env.example` não serão apagadas na Fase 01 até validação final da substituição.)*

---

## 10. Plano para substituir Firebase e Cloudflare R2 (com Rollback)

Como **não existem dados reais nem utilizadores em produção** no Firebase (apenas protótipo), não há necessidade de script de migração de contas/documentos antigos:

1. **Corte limpo de dados no novo fluxo:**
   - Contas criadas no Supabase Auth iniciam com base relacional limpa (onboarding para criar o primeiro Workspace real, sem seed demo).
   - O modo demo (`INITIAL_PROJECTS`, etc.), se mantido para pré-visualização não autenticada, será isolado e **nunca** misturado com dados reais de conta autenticada.
2. **Substituição progressiva sem apagar ficheiros antigos na Fase 01:**
   - **Auth:** substituir `FirebaseProvider` no shell principal por `SupabaseAuthProvider` (ou controlar o provider ativo via módulo/feature flag de ambiente `NEXT_PUBLIC_AUTH_PROVIDER=supabase|firebase` enquanto validamos). Ficheiros `lib/firebase.ts`, `components/auth/FirebaseProvider.tsx` e `firestore.rules` **permanecem intactos** no repositório até a Fase 01 ser validada.
   - **Base de dados:** criar novos repositórios de dados em `lib/supabase/` apontando para PostgreSQL via RLS; manter `lib/firestoreSync.ts` sem uso ativo após cutover verificado, sem o apagar nesta fase.
   - **Storage:** criar `app/api/storage/*` e cliente Supabase Storage privado em substituição funcional de `/api/r2/*`, mantendo os ficheiros `app/api/r2/*` intactos durante o período de verificação.
3. **Plano de Rollback e remoção futura:**
   - Até o utilizador aprovar o encerramento da transição (após todos os testes da Fase 01 passarem em staging), é possível reverter a ligação para o modo anterior via configuração sem perda de ficheiros legados.
   - Somente numa fase posterior (ex.: pós-validação da Fase 01/04), e após aprovação explícita, serão removidos `firebase`, `@aws-sdk/client-s3`, `firestore.rules` e `/api/r2/*`.

---

## 11. Correção das vulnerabilidades identificadas na Fase 00

| Vulnerabilidade (Fase 00) | Correção arquitetural na Fase 01 |
| --- | --- |
| **1. Auto-upgrade de `userTier` pelo cliente** (`firestore.rules:345` + `app/page.tsx:2213`) | Removido do cliente. Plano vive em `workspace_subscriptions`, sem `GRANT INSERT/UPDATE/DELETE` para `authenticated` e protegido por RLS (`SELECT` apenas para `Owner`/`Admin`). |
| **2. Bypass do limite Free (3 projetos ativos)** (`app/page.tsx:699,747`) | Validado no servidor/PostgreSQL via função `private.within_active_project_limit(workspace_id)` aplicada tanto nas policies RLS (`INSERT`/`UPDATE` em `projects`) como na API route, com lock/contagem atómica. |
| **3. Fallback permissivo de RBAC para `"owner"`** (`lib/rbac.ts:36`) | Removido. Sem utilizador autenticado válido, `getEffectiveRole()` devolve `null`; toda operação protegida exige JWT válido e membership verificada. |
| **4. Leitura cruzada de perfis (`users/{uid}/public`)** (`firestore.rules:322`) | Policy `SELECT` em `public.profiles` permite ler apenas o próprio perfil ou perfis de co-membros que partilhem pelo menos um `workspace_id`. |
| **5. Email administrativo literal** (`firestore.rules:40`) | Zero emails literais em migrações SQL ou policies RLS. |
| **6. PII em `localStorage`** (`lib/storage.ts:23`) | Em sessão autenticada, `localStorage` deixa de armazenar projetos, tarefas ou emails de membros (guarda apenas tema/preferências visuais). |
| **7. Falso link `/portal/` e convites locais** (`ClientPortalView.tsx:73`, `app/page.tsx:1302`) | Na Fase 01, `workspace_invitations` recebe estrutura real; links falsos de portal sem rota real e simulações enganadoras ficam desativados/isolados até implementação real em fase própria. |

---

## 12. Testes de segurança e isolamento entre Workspaces

Será criada uma suíte automatizada (`tests/security/` e `tests/integration/`) utilizando clientes autenticados reais distintos contra instância Supabase de teste/staging:

- **Atores de teste:** `User A` (`Owner` do Workspace A), `User A2` (`Member` do Workspace A), `User A3` (`Guest` apenas no `Projeto A1`), `User B` (`Owner` do Workspace B), `AnonClient` (não autenticado).
- **Cenários obrigatórios:**
  1. **Isolamento cross-tenant:** `User A` tenta `SELECT`, `INSERT`, `UPDATE`, `DELETE` em `workspaces`, `teams`, `projects`, `tasks`, `workspace_members`, `profiles` e `storage_assets` do `Workspace B` (por ID direto) -> deve retornar vazio / falhar com erro de permissão.
  2. **Imutabilidade de tenant (`WITH CHECK`):** `User A` tenta `UPDATE` num projeto ou tarefa do `Workspace A` alterando `workspace_id` ou `project_id` para o `Workspace B` -> rejeitado pela BD.
  3. **Matriz RBAC:**
     - `AnonClient`: `401` em endpoints privados e 0 linhas via Data API.
     - `Guest (User A3)`: vê apenas `Projeto A1` e suas tarefas; negado em `Projeto A2`, `teams`, `workspace_members` (escrita), `audit_logs` e criação de projetos.
     - `Member (User A2)`: cria tarefa no projeto permitido; falha ao tentar convidar `Admin`, apagar projeto alheio ou remover `Owner`.
     - `Admin`: gere equipas/membros/projetos, mas falha ao tentar apagar o Workspace ou rebaixar/remover o `Owner`.
  4. **Bloqueio de auto-upgrade (`plan_tier`):** `User A` (`Owner`) tenta `UPDATE` em `workspace_subscriptions` via cliente Supabase -> rejeitado por permissão.
  5. **Enforcement do limite Free:** `Workspace A` (`free`, limite 3) cria 3 projetos ativos (sucesso), falha ao criar o 4.º ativo tanto via API como direto na Data API; arquiva 1 projeto -> consegue criar o seguinte; falha ao tentar desarquivar ficando com 4 ativos.
  6. **Isolamento Storage privado:** `User A` faz upload em `Workspace A/Projeto A1` e obtém Signed Download URL -> `User B` tenta listar bucket, gerar Signed URL ou descarregar pelo path direto -> `403`/negado.
  7. **Persistência e estados:** CRUD de workspace, equipa, projeto e tarefa persiste após reload/novo login; falhas de rede/permissão devolvem erro explícito sem sucesso falso.

---

## 13. Critérios de aceitação da Fase 01

A Fase 01 só poderá ser dada como concluída quando **todos** os critérios abaixo forem verificados com evidência real:

1. Migrações SQL versionadas em `supabase/migrations/` aplicam-se de raiz numa base PostgreSQL limpa sem erros.
2. **100%** das tabelas privadas expostas em `public` têm RLS ativo, `GRANT`s revistos e policies testadas (`SELECT/INSERT/UPDATE/DELETE`).
3. Todos os testes de isolamento entre Workspaces (`Workspace A` vs. `Workspace B`), RBAC (`Owner/Admin/Member/Guest`), Storage privado, limite Free e bloqueio de alteração de plano passam (se o projeto Supabase ainda não existir no momento da escrita do código, fica explicitamente documentado o que foi validado localmente vs. o que aguarda criação do projeto para execução final dos testes contra a instância).
4. Fluxos de autenticação Supabase (Email/Password + Google OAuth), criação de Workspace, criação de Equipa, criação de Projeto e CRUD de Tarefas funcionam com persistência real em Postgres (zero dados demo como reais, zero `localStorage` como BD principal).
5. `npx tsc --noEmit`, `npm run lint` e `npm run build` terminam com `exit 0`.
6. Nenhum segredo (`SUPABASE_SERVICE_ROLE_KEY`) aparece em código cliente, bundle ou logs.
7. Ficheiros Firebase/R2 legados preservados para rollback seguro e nenhuma funcionalidade fora de escopo (ex.: Chat ou Billing pago real) adicionada.

---

## 14. Ordem exata de implementação (quando a Fase 01 for aprovada)

1. **Passo 1 — Dependências e ambiente:** instalar `@supabase/supabase-js`, `@supabase/ssr` e `vitest`; atualizar `.env.example` com os nomes de variáveis Supabase e criar utilitário seguro de leitura de config (degradando de forma explícita e segura se as env vars ainda não estiverem preenchidas).
2. **Passo 2 — Migrações SQL estruturais (`supabase/migrations/`):** criar enums, tabelas (`profiles`, `workspaces`, `workspace_subscriptions`, `workspace_members`, `workspace_invitations`, `teams`, `team_members`, `projects`, `project_members`, `tasks`, `task_assignees`, `storage_assets`, `audit_logs`), FKs compostas e índices.
3. **Passo 3 — Segurança no Postgres (`supabase/migrations/`):** revogar grants por omissão, criar schema `private` e funções helpers (`SECURITY DEFINER`), aplicar triggers de integridade/audit/limits, policies RLS por tabela/operação e criação/policies dos buckets privados `project-assets` e `avatars`.
4. **Passo 4 — Camada SSR e Autenticação Supabase:** criar clientes browser/server/middleware (`@supabase/ssr`), rotas `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/callback` e `/onboarding`, com dicionário i18n inicial em Português (`pt` / preparado `en`).
5. **Passo 5 — Repositórios e APIs server-side Core:** implementar serviços e Route Handlers para Workspaces, Teams, Projects (com limite Free no servidor), Tasks (`urgent..no_priority`, múltiplos assignees), Convites (`workspace_invitations`) e Storage privado (`/api/storage/{upload-url,download-url,delete}`), eliminando qualquer fallback `"owner"` e auto-upgrade de plano.
6. **Passo 6 — Integração controlada na UI:** ligar fluxos de sessão, workspace switcher, equipas, projetos e tarefas ao backend Supabase mantendo compatibilidade/rollback seguro sem remover os ficheiros antigos de Firebase/R2.
7. **Passo 7 — Testes, Verificações e Relatório da Fase 01:** criar e executar testes de isolamento multi-tenant, RBAC, vulnerabilidades SEC-01..07 e Storage; correr `lint`, `tsc`, `build`; apresentar relatório completo da Fase 01 seguindo `11-PHASE-GATES-AND-REPORT-TEMPLATE.md`.

---

## Próximo passo — Aprovação necessária

Para iniciar a **execução da Fase 01** (criação das migrações SQL, clientes `@supabase/ssr`, Auth, APIs core, Storage privado e testes, preparados para receber as credenciais assim que criares o projeto Supabase), confirma por favor:

1. **Aprovas este plano completo (`FASE_01_PREPARACAO_E_PLANO.md`) e autorizas o arranque da Fase 01** (incluindo instalação de `@supabase/supabase-js`, `@supabase/ssr` e `vitest`)?
2. **Enquanto não crias o projeto Supabase:** preferes que a Fase 01 avance já com todo o código, migrações SQL, cliente SSR, endpoints, UI de autenticação/workspace/equipas/projetos/tarefas e testes estruturados (prontos a ligar assim que inserires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`), ficando os testes contra instância real pendentes apenas desse passo?
3. **Sobre `teams` na tabela `projects`:** quando um projeto é associado a uma equipa (`team_id`), queres que os membros da equipa tenham acesso automático ao projeto, ou apenas via `project_members` + `Owner`/`Admin` do Workspace?
