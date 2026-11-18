# 01 — Registo de decisões

## Estado

- Decisões recuperadas: 52–84.
- Decisões 1–51: não recuperadas no contexto disponível; não assumir respostas.
- Q76 e Q80 foram definidas automaticamente como defaults coerentes; não foram escolhas explícitas do utilizador.
- Q83 foi inicialmente delegada ao assistente; a escolha de plataforma foi posteriormente esclarecida pelo utilizador em 17-11-2026: Supabase como plataforma principal para boa parte do backend.
- Q84 foi explicitamente escolhida pelo utilizador: construção por fases, validando cada fase.

## Decisões 52–60 — Pesquisa, comandos e tarefas

| Nº | Decisão | Resultado |
|---:|---|---|
| 52 | Pesquisa global | Avançada: projetos, tarefas, documentos, membros e conteúdo de documentos/descrições; filtros, resultados agrupados e ações rápidas. Pesquisa semântica por IA fica adiada. |
| 53 | Command Palette | Híbrida: navegação, pesquisa e ações; comandos categorizados, sugestões contextuais e atalhos. |
| 54 | Campos personalizados | Flexíveis: tipos variados, opções, validações, obrigatoriedade, filtros e reutilização em projetos. Fórmulas e dependências ficam adiadas. |
| 55 | Etiquetas | Biblioteca global por workspace, com nomes, cores e permissões. |
| 56 | Prioridades | Urgent, High, Medium, Low, No priority. |
| 57 | Responsáveis | Um responsável principal e vários colaboradores; notificações, menções e filtros. |
| 58 | Estimativas | Híbridas: Story Points e estimativa temporal; workspace escolhe um método ou ambos; opcionais. |
| 59 | Dependências | Avançadas: blocks, blocked by, related, duplicated; avisos e relações visíveis, sem bloqueio automático. |
| 60 | Visualização de dependências | Timeline com tarefas ligadas, datas, indicação de bloqueios e navegação entre relações. |

## Decisões 61–70 — Projetos, relatórios e integrações

| Nº | Decisão | Resultado |
|---:|---|---|
| 61 | Planeamento temporal | Timeline estilo Gantt: início/fim, duração, marcos, dependências, progresso e ajuste de datas; vistas dia/semana/mês. |
| 62 | Marcos | Completos: título, descrição, data, responsável, estado, tarefas associadas e progresso; sem objetivos/OKRs completos. |
| 63 | Relatórios | Analytics equilibrados: tarefas concluídas/pendentes/atrasadas, progresso, distribuição por estado/prioridade, evolução temporal, carga de trabalho, estimativas vs. real e prazos. |
| 64 | Acesso a relatórios | Permissões por workspace, projeto e métricas individuais; enforcement no backend. |
| 65 | Exportação | CSV, XLSX e PDF para tarefas, projetos e relatórios; filtros e seleção de campos/colunas. Exportação de documentos, anexos, comentários e backup integral fica fora do âmbito inicial. |
| 66 | Importação | CSV com mapeamento de colunas; importação guiada de Trello/Asana/Linear conforme formatos/APIs disponíveis; pré-visualização, validação e relatório de erros. |
| 67 | API pública | REST documentada, tokens e scopes, endpoints, paginação, filtros, ordenação, rate limits, webhooks, logs e gestão de apps. OAuth/SDKs/diretório ficam adiados. |
| 68 | Webhooks | Subscrição por eventos, assinatura criptográfica, retries, histórico, reenvio manual, idempotência e prevenção de duplicados. |
| 69 | Integrações | Centro de integrações com catálogo por categoria, detalhes, ligação/autorização guiada, gestão de permissões/credenciais, estado de ligação/sincronização e desconectar/reconectar. Marketplace público adiado. |
| 70 | Integrações prioritárias | Híbrida: Google Calendar, Google Drive, Slack e GitHub como alvos iniciais; arquitetura extensível. Não implementar todas de uma vez. |

## Decisões 71–80 — Notificações e conta

| Nº | Decisão | Resultado |
|---:|---|---|
| 71 | Notificações externas | Configuráveis por evento, canal, destinatário, frequência/agrupamento e regras por integração; evitar duplicados. |
| 72 | Segurança da conta | Avançada: OAuth, recuperação/email, MFA, sessões/dispositivos, logout remoto, alertas de novo acesso e histórico de atividade. |
| 73 | Autenticação | Completa: email/password, Google, GitHub, Microsoft, Apple Sign-In, passkeys e MFA. Firebase Auth existente deve ser auditado quanto ao suporte e configuração reais. |
| 74 | Sessões/dispositivos | Avançadas: lista de sessões, browser/OS, localização aproximada, último acesso, terminar sessão individual ou todas. |
| 75 | Recuperação de conta | Avançada: links temporários seguros por email, verificações adicionais, códigos de recuperação MFA, notificações e revogação de sessões quando apropriado. |
| 76 | Privacidade | **Default definido pelo assistente:** privacidade avançada, exportação de dados pessoais, gestão de consentimentos/preferências, retenção, eliminação controlada e pedidos de privacidade. Validar obrigações legais aplicáveis antes de produção. |
| 77 | Papéis/permissões | Flexíveis: Owner, Admin, Member, Guest; permissões por projeto, tarefas, relatórios e configurações; enforcement no backend. |
| 78 | Colaboração | Completa: comentários, threads/respostas, @menções, reações, anexos, edição, histórico e atividade por tarefa. Edição colaborativa em tempo real, presença e chat integrado ficam fora do âmbito inicial. |
| 79 | Notificações internas | Configuráveis: centro de notificações, lido/não lido, filtros, preferências por evento, email e resumos periódicos. |
| 80 | Direção visual | **Default inferido:** dark minimalista, profissional e responsivo, acento azul, boa densidade de informação, hierarquia clara e navegação fluida inspirada no Figma. |

## Decisões 81–84 — Comercial, dados e execução

| Nº | Decisão | Resultado |
|---:|---|---|
| 81 | Modelo comercial | Freemium: plano gratuito com limites e planos pagos com mais capacidade/funcionalidades; limites configuráveis. Preços ainda não definidos. |
| 82 | Subscrições/pagamentos | Gestão completa: mensal/anual, upgrades, downgrades, cancelamento, renovação, histórico, faturas e falhas de pagamento. Depende das capacidades reais de ProxyPay e Puddle. |
| 83 | Base de dados e ficheiros | **Atualização confirmada pelo utilizador em 17-11-2026:** Supabase é a plataforma principal a utilizar para boa parte do backend. Supabase Postgres e Storage são a base técnica preferencial; avaliar Supabase Auth como destino de autenticação após auditar Firebase. Aplicar RLS, grants e policies. Neon não integra a arquitetura-base e só pode ser reavaliado com justificação técnica concreta. Confirmar quotas, região, custos, backups e requisitos de pagamento da conta antes de produção. |
| 84 | Estratégia de implementação | **Escolha explícita:** construção por fases, validar cada fase antes de avançar. |

## Atualização posterior — 17-11-2026

A preferência Supabase foi confirmada diretamente pelo utilizador após a revisão do pacote anterior. Esta atualização substitui qualquer recomendação anterior de Neon. A escolha de Supabase como plataforma principal não autoriza uma migração imediata dos dados/autenticação existentes: a Fase 00 deve primeiro auditar Firebase e os contratos atuais.

## Como interpretar o estado

- **Confirmado pelo utilizador:** escolha explicitamente enviada pelo utilizador.
- **Delegado:** o utilizador pediu ao assistente para escolher.
- **Inferido/default:** decisão provisória adotada para evitar interromper o fluxo; pode ser alterada.
- **Não recuperado:** não existe evidência suficiente para implementar.

Não tratar decisões inferidas como consentimento legal ou confirmação comercial.
