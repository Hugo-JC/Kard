# Kard — Fase 02: Frontend e experiência de utilização

Estado: **em execução**  
Branch: `feat/phase-02-frontend-experience`  
Base: `main` (Fase 01 integrada)

## Fontes de design e produto

Os documentos existentes em `public/assets/aistudio/` são a fonte de verdade para esta fase:

- `00-CONTEXT-AND-RULES_073594d2.md`: preservar o produto existente, não criar botões sem ação, não apresentar mocks como reais, suportar acessibilidade e estados completos.
- `01-DECISION-REGISTER_2d174bb4.md`: tema dark minimalista, acento azul, densidade profissional; pesquisa/Command Palette híbridas; prioridades e navegação.
- `02-PRODUCT-SPEC_344d9d0d.md`: tarefas, projetos, calendário, colaboração, relatórios e integrações com contratos funcionais.
- `03-UX-AND-DESIGN_459ad06e.md`: padrões de interação inspirados no Linear, sidebar consistente, detalhe contextual, responsividade, acessibilidade WCAG 2.2 AA e movimento reduzido.
- `06-QUALITY-AND-ACCEPTANCE_51c85536.md`: loading, empty, error, success, disabled e no-permission; validar desktop 1440×900 e mobile 390×844.
- `07-GOOGLE-AI-STUDIO-MASTER-PROMPT_e711c6c1.md`: manter stack e funcionalidades atuais, implementar só o âmbito aprovado.
- `estrategia_rival_trello_notion_445883fe.md`: combinar Kanban simples, conteúdo/documentação organizado e foco/tempo integrados sem aumentar a curva de aprendizagem.
- `12-PHASE-02-FRONTEND-PROMPT.md`: prompt de colaboração para o Google AI Studio, limitado a frontend e UX.

As referências Linear, Notion e Trello são padrões de produto e interação; não copiar marcas, assets, texto ou ecrãs literalmente.

## Direção de experiência

- Linear: velocidade, hierarquia, atalhos e navegação previsível.
- Notion: organização de conteúdo e estrutura flexível.
- Trello: Kanban claro, cartões informativos e drag-and-drop intuitivo.
- Identidade Kard: superfícies neutras, azul como acento, tema escuro por omissão, densidade equilibrada, animações discretas e acessibilidade.
- Manter o tema claro disponível.
- Respeitar `prefers-reduced-motion` através de CSS e `MotionConfig`; evitar blur e sombras decorativas excessivas.
- Node.js 24.12+ e npm 10.9+ declarados como requisitos do projeto, alinhados com as engines das dependências atuais.

## Primeira entrega implementada nesta branch

- Sidebar redesenhada com grupos de navegação em português, estado ativo animado, melhor hierarquia e drawer móvel animado.
- Command Palette redesenhada com pesquisa de comandos, categorias, descrições, navegação por setas e Enter, e estados vazios.
- Header refinado, pesquisa localizada, acessibilidade e remoção de promoções de preço não aprovadas.
- Tema escuro definido como padrão, mantendo a escolha local do utilizador e o tema claro.
- Tokens globais de motion, seleção, foco, scrollbars e respeito por redução de movimento.
- Página de definições atualizada para deixar claro que Supabase Storage é o destino e que a integração de uploads/downloads ainda está pendente; removida a dependência visual de configuração R2.
- Checkout simulado removido do modal de planos; preços, descontos e condições comerciais não aprovados deixaram de ser apresentados como oferta real. A ativação paga fica indisponível até existir checkout server-side real.
- Formulário de nova tarefa deixou de inventar projetos de fallback e datas pré-preenchidas; exige um projeto ativo e apresenta estado vazio orientador.
- Pesquisa do cabeçalho aplicada às listas de tarefas e à vista de projetos, sem ocultar silenciosamente projetos arquivados na gestão.
- Calendário inicializado com a data atual em vez de janeiro de 2021; briefing usa locale `pt-PT`.
- Estados vazios, filtros, cabeçalhos e ações das vistas de projetos localizados para português europeu.
- Textos principais da pesquisa e estados vazios do dashboard localizados.
- Calendário adaptado à convenção portuguesa: semana começa à segunda-feira e o atalho regressa à data de hoje.
- Diálogos partilhados melhorados com foco inicial, contenção da navegação por Tab e reposição do foco ao fechar.
- Tabela de projetos com região e ações de favoritos com nomes acessíveis e específicos.

## Limites desta primeira entrega

A aplicação ainda usa Firebase Auth/Firestore em fluxos existentes. Esta fase visual não deve fingir que a migração do backend está concluída. O estado de armazenamento na UI indica explicitamente integração pendente.

A pesquisa global avançada, novas vistas, documentos ricos, filtros persistentes e estados de backend só podem ser apresentados como funcionais depois de ligados aos contratos e dados reais. Não criar dados de demonstração no ambiente de produção.

## Próximos incrementos da Fase 02

1. Harmonizar cabeçalhos, breadcrumbs, espaçamento e superfícies das vistas Dashboard, Projetos, Tarefas, Calendário, Tempo e Automações.
2. Refinar cartões, listas, tabela e Kanban com estados hover/focus/drag e feedback de ações.
3. Melhorar o painel de detalhe de tarefa, formulários, modais e estados vazios/erro/carregamento.
4. Melhorar pesquisa e filtros sem prometer pesquisa de conteúdo que ainda não esteja indexado.
5. Verificar responsividade em 1440×900 e 390×844, navegação por teclado e contraste.
6. Executar lint e build através do GitHub Actions; corrigir regressões antes de pedir aprovação. A validação visual final em browser e os testes manuais continuam pendentes.

## Critério de conclusão

A Fase 02 só termina depois de todas as vistas principais terem consistência visual, interações verificadas, estados completos, acessibilidade/responsividade verificadas e lint/build/testes aprovados. A integração de dados que dependa da migração backend mantém-se separada e não pode ser simulada.
