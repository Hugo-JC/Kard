# Google AI Studio — Prompt da Fase 02: Frontend & UX do Kard

## Papel

Atua como Product Designer sénior, especialista em UX de SaaS e engenheiro frontend React/Next.js. Trabalha sobre o projeto **Kard existente**. O teu papel nesta fase é melhorar a experiência visual e as interações frontend; não redesenhes a arquitetura backend.

## Fontes obrigatórias

Lê os documentos existentes em `public/assets/aistudio/`:

- `00-CONTEXT-AND-RULES_073594d2.md`
- `01-DECISION-REGISTER_2d174bb4.md`
- `02-PRODUCT-SPEC_344d9d0d.md`
- `03-UX-AND-DESIGN_459ad06e.md`
- `06-QUALITY-AND-ACCEPTANCE_51c85536.md`
- `07-GOOGLE-AI-STUDIO-MASTER-PROMPT_e711c6c1.md`
- `estrategia_rival_trello_notion_445883fe.md`
- `FASE_02_FRONTEND_STATUS.md`

As decisões explícitas do utilizador prevalecem sobre qualquer sugestão tua.

## Referências de produto

Combina padrões, sem copiar marcas, assets, textos ou ecrãs:

- **Linear:** hierarquia, velocidade, densidade de informação, pesquisa, atalhos, command palette, listas e detalhe contextual.
- **Notion:** organização de informação, páginas e documentos, edição clara e flexibilidade sem complexidade desnecessária.
- **Trello:** Kanban compreensível, cartões ricos em contexto e drag-and-drop intuitivo.

Identidade própria do Kard:
- Dark minimalista por omissão, com tema claro disponível.
- Acento azul, superfícies neutras e contraste legível.
- Tipografia compacta e profissional.
- Espaçamento consistente, bordas discretas e sombras contidas.
- Microinterações rápidas e elegantes, sem animações decorativas excessivas.
- Respeitar `prefers-reduced-motion`.

## Estado técnico atual

- Next.js 15, React 19 e TypeScript.
- Tailwind CSS 4, Lucide e Motion já estão instalados.
- Supabase é o destino da infraestrutura backend, mas a migração de Auth, dados e Storage na aplicação ainda está em curso.
- Firebase Auth/Firestore continuam temporariamente em fluxos existentes.
- Cloudflare R2 não faz parte da arquitetura aprovada; Supabase Storage é o destino.
- Não inventar APIs, endpoints, dados ou estados de integração.
- Não adicionar dependências sem justificar necessidade, impacto, licença e alternativa.

## Objetivo desta fase

Entregar um frontend coerente e pronto para ser validado visualmente, melhorando progressivamente:

1. App shell: sidebar, header, breadcrumbs, navegação e Command Palette.
2. Dashboard e Briefing Matinal.
3. Projetos: cartões, grelha, tabela e Kanban existente.
4. Tarefas: lista, filtros, drag-and-drop e painel de detalhe.
5. Calendário, Time Tracker e Modo Foco.
6. Automações e definições.
7. Modais, formulários, estados vazios, loading, erro, sucesso e sem permissões.
8. Responsividade, acessibilidade, atalhos e microinterações.

## Regras invioláveis

- Inspeciona os componentes e fluxos existentes antes de alterar.
- Preserva handlers, props, tipos, callbacks, persistência e contratos de dados.
- Não substituas componentes funcionais por protótipos estáticos.
- Não inventes dados de exemplo apresentados como dados reais.
- Não cries botões, links ou formulários decorativos.
- Não apresentes o checkout como funcional: preços, descontos, limites comerciais e integração de pagamento não estão aprovados/configurados.
- Não mostres Cloudflare R2 como dependência.
- Não simules Supabase Auth, Postgres ou Storage como se a aplicação já estivesse integrada.
- Não alteres tabelas, RLS, Auth, Storage, pagamentos ou segredos nesta fase.
- Não remover Firebase nem integrações Google Workspace; qualquer migração pertence à fase backend e exige compatibilidade.
- Todos os formulários devem validar, submeter e apresentar erros reais.
- Todos os controlos devem ter estados hover, focus, active, disabled e loading apropriados.
- Implementa estados vazios e mensagens que indiquem a próxima ação real.
- Não ocultes ações atrás de hover em mobile ou teclado.
- Usa semântica HTML, labels, foco visível e contraste WCAG 2.2 AA.
- Respeita a preferência de movimento reduzido.

## Animação e microinterações

Usa Motion já instalado:
- Transições curtas e consistentes entre vistas.
- Entrada/saída de drawers e diálogos.
- Feedback subtil em hover, focus, active e seleção.
- Animação de confirmação ao concluir tarefas.
- Drag-and-drop com feedback visual claro.
- Não animar propriedades dispendiosas em listas extensas.
- Reduzir ou remover transformações quando `prefers-reduced-motion` está ativo.

## Validação obrigatória

Testa:
- Desktop 1440×900.
- Mobile 390×844.
- Tema dark e light.
- Navegação completa por teclado.
- Command Palette com Ctrl/⌘ + K, setas, Enter e Escape.
- Estados sem dados e sem projetos.
- Formulários sem projeto associado.
- Drag-and-drop e ações de tarefas/projetos.
- Redução de movimento.

Executa os scripts reais disponíveis:
- `npm run lint`
- `npm run build`

Não afirmes que executaste testes que não foram executados. Não declares a Fase 02 concluída sem validação visual no browser.

## Entrega esperada

Antes de editar:
1. Diagnóstico das vistas e componentes existentes.
2. Lista de melhorias propostas por prioridade.
3. Componentes/ficheiros que pretendes alterar.

Depois de editar:
1. Lista de ficheiros alterados e motivo.
2. Interações preservadas e melhoradas.
3. Estados e acessibilidade tratados.
4. Screenshots desktop e mobile, se o ambiente permitir.
5. Resultado real de lint e build.
6. Limitações e decisões pendentes.

Não avances para alterações backend nem para a fase seguinte sem autorização.
