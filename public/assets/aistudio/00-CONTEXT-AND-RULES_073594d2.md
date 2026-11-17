# 00 — Contexto e regras obrigatórias

## Produto

Kard é uma aplicação SaaS web para gestão de trabalho, projetos e tarefas, com referências funcionais em Trello, Notion e Linear. As capturas referidas em `references/FONTES-INVENTORY.md` mostram sobretudo padrões de interface do Linear. São referências de interação e organização, não autorização para copiar literalmente marca, identidade visual, textos ou assets.

## Contexto técnico conhecido — sujeito a auditoria do repositório

- Projeto atual referido pelo utilizador: Google AI Studio.
- Stack indicada nos documentos anteriores: Next.js, React e TypeScript. **Ainda não foi verificada no código-fonte nesta auditoria.**
- Firebase já foi utilizado para autenticação/OAuth e algum armazenamento; configuração, dados e dependências atuais precisam de auditoria.
- **Preferência de plataforma confirmada em 17-11-2026:** Supabase será a plataforma principal do Kard para boa parte dos serviços backend. A utilização concreta de cada produto/serviço Supabase deve ser definida módulo a módulo.
- Direção técnica de base: Supabase Postgres para dados relacionais e Supabase Storage para ficheiros. Supabase Auth é o destino preferencial a avaliar, mas a migração do Firebase só pode ser decidida após inventário de utilizadores, métodos de login, sessões e integrações.
- Supabase RLS deve ser parte central do isolamento multi-tenant; não substituir políticas RLS por verificações apenas na interface.
- Neon não faz parte da arquitetura-base aprovada. Só pode ser reavaliado mediante uma necessidade técnica concreta, documentada e aprovada.
- O utilizador informou anteriormente não ter cartão para ativar Cloudflare R2; não criar dependência de R2.
- Pagamentos pretendidos: ProxyPay para Angola; Puddle para outros países. Capacidades reais por confirmar.

## Regras invioláveis para a IA de implementação

1. Inspecionar o projeto atual antes de editar. Não substituir a aplicação por um scaffold novo sem necessidade demonstrada.
2. Preservar funcionalidades existentes, dados, rotas, contratos, estilos e integrações que estejam a funcionar.
3. Não criar botões decorativos, links sem destino, formulários que não submetem, métricas inventadas, listas fictícias apresentadas como dados reais ou integrações simuladas como se fossem reais.
4. Não usar `localStorage` como persistência principal. Pode ser usado apenas para preferências locais não críticas, com justificação.
5. Não expor secrets, `service_role`/secret keys, tokens privados, credenciais ou chaves de pagamento no browser, repositório ou logs.
6. Não confiar apenas na UI para autorização. Verificar identidade, workspace e permissões no servidor e na base de dados em todas as operações protegidas.
7. Em tabelas expostas pela Data API do Supabase, ativar RLS e definir privilégios (`GRANT`) e políticas coerentes. Uma policy não substitui grants, e grants não substituem policies.
8. Usar o contexto de identidade do utilizador autenticado e policies RLS; não confiar num `user_id` ou `workspace_id` enviado pelo cliente sem validação.
9. Não usar `service_role` para operações normais de utilizador. A chave privilegiada contorna RLS e só pode existir em ambiente server-side protegido, com justificação e testes.
10. Não inventar capacidades das APIs ProxyPay, Puddle, Firebase, Supabase, Google, Slack, GitHub ou outros serviços. Consultar documentação oficial e registar limites.
11. Não cobrar nem simular pagamentos reais sem ambiente de testes, credenciais autorizadas e confirmação do utilizador.
12. Não adicionar funcionalidades fora do âmbito aprovado. Propor extras separadamente.
13. Não adicionar dependências sem explicar a necessidade, impacto, licença e alternativa.
14. Não introduzir dados de demonstração em produção. Fixtures devem ser isoladas em testes ou num modo demo claramente identificado.
15. Não apagar, migrar ou reestruturar dados sem plano, backup e autorização explícita.
16. Não declarar uma fase concluída apenas porque o código foi escrito. Executar verificações reais e apresentar resultados.
17. Quando faltar uma decisão, parar apenas a parte dependente, apresentar a lacuna e continuar tarefas independentes.
18. Nunca afirmar que uma integração está completa se apenas existir UI ou um mock.

## Protocolo de cada fase

### Antes
- Ler estes documentos e a fase atual.
- Inspecionar estrutura, scripts, dependências, estado Git e funcionalidades existentes.
- Identificar ficheiros que serão alterados.
- Escrever um plano curto, dependências e riscos.
- Verificar se a tarefa envolve dados sensíveis, mudanças de schema, RLS, Auth, Storage ou pagamentos.

### Durante
- Implementar apenas o âmbito da fase.
- Manter TypeScript estrito e componentes reutilizáveis, se essa stack for confirmada.
- Criar migrações versionadas para alterações à base de dados Supabase.
- Criar testes para regras de negócio, autorização e fluxos críticos.
- Tratar loading, empty, error, success e estados sem permissão.
- Manter schemas e políticas RLS sob controlo de versão; alterações manuais no Dashboard devem ser reproduzidas em migração.

### Depois
- Executar lint, typecheck, testes e build usando os scripts existentes.
- Executar testes RLS/multi-tenant e de Storage quando aplicável.
- Corrigir regressões introduzidas.
- Resumir ficheiros alterados, decisões, limitações e passos manuais.
- Listar comandos executados e resultados reais.
- Não avançar para a fase seguinte sem aprovação.

## Fonte de verdade e conflitos

Ordem de precedência:
1. Decisões explícitas do utilizador, incluindo a preferência Supabase confirmada em 17-11-2026.
2. Código e contratos existentes que estejam comprovadamente em uso, sem apagar silenciosamente dados ou funcionalidades.
3. Este pacote de especificação.
4. Documentação oficial atual dos fornecedores.
5. Inferências conservadoras, sempre identificadas como inferências.

Se houver conflito entre o código atual e esta especificação, não sobrescrever silenciosamente. Descrever o conflito e propor migração compatível.

## Linguagem e experiência

- Interface e documentação de produto em português como idioma inicial, mas preparar internacionalização sem fixar textos na lógica.
- Layout responsivo, acessível por teclado, com foco visível e contraste adequado.
- Evitar UI genérica, excesso de blur, sombras pesadas, animações desnecessárias e tipografia exagerada.
