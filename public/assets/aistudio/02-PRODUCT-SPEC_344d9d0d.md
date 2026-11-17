# 02 — Especificação funcional do produto

## Visão

Kard é um SaaS de gestão de trabalho que combina gestão de tarefas e projetos, organização de conhecimento e colaboração. Deve ser um produto funcional com dados persistentes, isolamento entre workspaces e permissões reais.

## Entidades de domínio esperadas

Validar e adaptar ao código existente antes de criar tabelas:

- User / Profile
- Workspace
- WorkspaceMembership
- Role / Permission
- Team (se o modelo atual confirmar equipas)
- Project
- ProjectMembership (quando necessário)
- Task / Issue
- TaskAssignee (responsável principal + colaboradores)
- TaskStatus / Workflow
- Label
- CustomFieldDefinition / CustomFieldValue
- Comment / CommentThread / Reaction
- Attachment
- TaskRelation / Dependency
- Cycle (se confirmado pelas decisões 1–51; caso contrário, manter como item em aberto)
- Milestone
- ProjectView / SavedView
- Notification / NotificationPreference
- Integration / IntegrationCredentialReference
- WebhookEndpoint / WebhookDelivery
- ApiToken
- Subscription / Plan / Entitlement
- Payment / InvoiceReference
- AuditEvent
- PrivacyRequest / ConsentRecord

Não criar automaticamente entidades cuja necessidade dependa das decisões 1–51 não recuperadas.

## Workspaces e acesso

- Cada workspace deve ter membros e papéis.
- Papéis definidos: Owner, Admin, Member, Guest.
- As permissões são específicas por recurso e validadas no backend.
- Um utilizador não pode aceder a dados de outro workspace alterando IDs ou parâmetros.
- Operações administrativas devem produzir registos de auditoria.
- A UI deve refletir permissões, mas não é a camada de segurança.

## Projetos e tarefas

### Tarefas

- Título e descrição.
- Estado e prioridade.
- Responsável principal e colaboradores.
- Etiquetas globais do workspace.
- Campos personalizados.
- Estimativa em Story Points e/ou tempo, conforme configuração do workspace.
- Datas e prazos.
- Dependências: blocks, blocked by, related, duplicated.
- Comentários, respostas, menções, reações e anexos.
- Histórico de atividade.
- Filtros, pesquisa e ações rápidas.

Não implementar bloqueio automático por dependências: mostrar avisos e relações.

### Projetos e planeamento

- Projetos com progresso e estado.
- Timeline/Gantt com início/fim, duração, marcos, dependências e progresso.
- Navegação por dia, semana e mês.
- Ajuste de datas por interação direta apenas quando houver persistência e validação.
- Marcos com título, descrição, data, responsável, estado, tarefas associadas e progresso.

### Pesquisa e Command Palette

Pesquisa avançada por projetos, tarefas, documentos, membros e conteúdo indexado de descrições/documentos. Resultados agrupados, filtros e ações rápidas. Pesquisa semântica por IA está fora do primeiro âmbito.

Command Palette híbrida para navegação, pesquisa e ações, com categorias, contexto e atalhos.

## Colaboração

Comentários em tarefas com:
- Threads/respostas.
- @menções.
- Reações.
- Anexos.
- Edição.
- Histórico de atividade.

Não adicionar chat global, presença em tempo real ou edição simultânea nesta primeira versão.

## Relatórios

Implementar indicadores baseados em dados reais:
- Concluídas, pendentes e atrasadas.
- Progresso de projetos.
- Distribuição por estado e prioridade.
- Evolução temporal.
- Carga de trabalho.
- Estimativas vs. tempo real, apenas se houver dados reais.

Permissões por workspace/projeto/métrica. Nunca exibir valores de exemplo como se fossem reais. Empty state deve explicar que ainda não há dados.

## Importação e exportação

Exportar tarefas, projetos e relatórios para CSV, XLSX e PDF, com filtros e seleção de colunas. Não prometer exportação de comentários, anexos, documentos ou backup total no primeiro âmbito.

Importar CSV com mapeamento de colunas, pré-visualização, validação e relatório de erros. Importadores de Trello, Asana e Linear apenas se as APIs/formats oficiais e permissões estiverem disponíveis; caso contrário, disponibilizar CSV genérico e documentar a limitação.

## API e webhooks

API REST documentada com tokens/scopes, paginação, filtros, ordenação, rate limits, logs e gestão de aplicações. Webhooks com eventos subscritos, assinatura criptográfica, retries, histórico, reenvio manual, idempotência e deduplicação.

## Integrações

Centro de integrações com Google Calendar, Google Drive, Slack e GitHub como primeiras prioridades. Implementar uma integração de cada vez, começando por uma prova técnica. Não exibir um botão “Conectar” funcional sem OAuth/consentimento, armazenamento seguro de tokens, estado de ligação e operação real.

## Conta e privacidade

Autenticação planeada: email/password, Google, GitHub, Microsoft, Apple Sign-In, passkeys e MFA. Fazer auditoria do Firebase Auth atual e validar suporte real para cada método.

Gestão de sessões/dispositivos, logout remoto, alertas de novo acesso, recuperação segura, histórico de atividade, preferências de privacidade, exportação e eliminação controlada de dados. Definir política de retenção e consentimento com revisão legal antes de lançamento.
