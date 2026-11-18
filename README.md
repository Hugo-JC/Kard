# Kard

Plataforma de gestão de tarefas, projetos e produtividade para equipas.

## Stack

- Next.js 15, React 19 e TypeScript
- Supabase: PostgreSQL, Auth e Storage privado (migração em curso)
- Google Workspace: integração de Calendar e Drive a preservar
- UI: Tailwind CSS, Base UI, Motion e Lucide

## Desenvolvimento local

Requisitos: Node.js 22 e npm.

1. Instalar dependências:

   ```bash
   npm ci
   ```

2. Criar o ficheiro de ambiente local:

   ```bash
   cp .env.example .env.local
   ```

3. Preencher pelo menos:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `GEMINI_API_KEY` apenas se a funcionalidade de IA estiver ativa no ambiente.

   Nunca colocar chaves secretas em variáveis `NEXT_PUBLIC_*` ou no Git.

4. Iniciar o servidor:

   ```bash
   npm run dev
   ```

5. Abrir `http://localhost:3000`.

## Comandos

- `npm run dev` — desenvolvimento
- `npm run lint` — ESLint
- `npm run build` — build de produção
- `npm start` — executar build de produção

## Arquitetura e estado de migração

- Workspace é a fronteira multi-tenant.
- O acesso a cada projeto exige uma associação explícita em `project_members`; a pertença a um Workspace ou equipa não concede acesso automático.
- Supabase Storage usa buckets privados `project-assets` e `avatars`.
- Firebase/Firestore e Cloudflare R2 são componentes legados em processo de substituição; não adicionar novas funcionalidades que dependam deles.
- Não remover o código legado até Supabase Auth, PostgreSQL e Storage estarem integrados e validados.

Consultar:
- [Estado da Fase 01](./FASE_01_STATUS.md)
- [Estado e critérios da Fase 02 — Frontend](./FASE_02_FRONTEND_STATUS.md)
- [Plano técnico da Fase 01](./FASE_01_PREPARACAO_E_PLANO.md)
- [Migrações Supabase](./supabase/README.md)

## Qualidade

O GitHub Actions executa `npm ci`, `npm run lint` e `npm run build` em pushes e pull requests.
