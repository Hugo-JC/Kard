# 08 — Decisões em aberto e pontos de validação

## Lacunas históricas

As respostas originais às decisões 1–51 não foram recuperadas no pacote recebido. Não criar requisitos com base em suposições. Consultar histórico original e código atual para identificar:
- Escopo base do workspace/equipas.
- Estrutura inicial de navegação e vistas.
- Funcionalidades core definidas antes da pergunta 52.
- Requisitos de onboarding, perfil e configurações.
- Eventuais decisões de documentos/wiki, boards, calendários e ciclos.
- Decisões de deployment e infraestrutura anteriores.

## Plataforma — Supabase decidido, configuração pendente

A preferência por Supabase como plataforma principal está confirmada pelo utilizador em 17-11-2026. Não reabrir a escolha por Neon sem necessidade técnica específica.

Antes de produção, confirmar:
- Organização/projeto Supabase existente ou a criar, região, ambientes e proprietários autorizados.
- Condições atuais de criação de conta, método de pagamento exigido, plano escolhido e limites na conta concreta. Não assumir que Free dispensa cartão ou serve para produção.
- Quotas reais aplicáveis: Postgres, Storage, egress, Auth MAU, Realtime, Edge Functions, logs e número/pausa de projetos.
- Estratégia de backups, retenção e teste de restauro.
- Domínio, URLs de callback, SMTP e fornecedores de email.
- Quais serviços Supabase serão usados na primeira fase; não ativar Realtime/Edge Functions só por estarem disponíveis.

## Identidade e migração Firebase

- Inventariar Firebase Auth, providers, utilizadores, UIDs, sessões e integrações antes de escolher migração.
- Confirmar se Supabase Auth pode suportar os métodos realmente requeridos e como será a associação/migração de contas.
- Determinar se Firebase Auth deve continuar transitoriamente ou se a migração para Supabase Auth é aprovada.
- Inventariar Firebase Storage/outros ficheiros, referências e regras de segurança.
- Aprovar plano de migração com staging, backup, validação, rollback e janela de execução.

## Produto e dados

- Recuperar decisões 1–51 ou identificar as dependências diretamente no código/histórico.
- Confirmar modelo Team versus Workspace e fluxo de criação/onboarding.
- Confirmar requisitos de documentos/wiki e visualizações não cobertos nas decisões 52–84.
- Confirmar esquema de permissões detalhado por recurso, com critérios verificáveis.

## Decisões comerciais ainda necessárias

- Nome, quantidade e preço dos planos pagos.
- Limites exatos do Free e dos planos pagos.
- Moedas e regras de conversão.
- Política de trial, descontos e promoções (não aprovada na Q82).
- Política de reembolso, cancelamento e acesso até ao fim do período.
- Impostos, faturação e obrigações legais por mercado.
- Quais funcionalidades entram em cada plano.
- Confirmar ProxyPay e Puddle: APIs, sandbox, recorrência, webhooks, faturação, moedas, liquidação e reembolsos.

## Integrações

- Confirmar APIs, OAuth/scopes, sandbox, rate limits e permissões de Google Calendar, Google Drive, Slack e GitHub.
- Escolher ordem real de implementação após uma prova técnica e validar cada integração separadamente.
- Determinar fornecedor de email/transacional e estratégia de notificações.

## Deploy e operações

- Confirmar fornecedor de deploy, domínio, CI/CD e gestão de secrets.
- Definir ambientes development, staging e production.
- Definir plano de backup/restauro, observabilidade, resposta a incidentes e suporte.
- Confirmar requisitos legais e de privacidade aplicáveis aos mercados onde o Kard será disponibilizado.

## Regra de execução

Não preencher estes pontos com dados inventados. Se uma decisão em aberto bloquear uma tarefa, isolar essa tarefa e continuar apenas trabalho independente. Usar contratos configuráveis quando fizer sentido, sem simular integrações ou preços.
