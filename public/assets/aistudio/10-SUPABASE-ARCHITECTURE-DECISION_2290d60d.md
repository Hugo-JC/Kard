# 10 — Registo da decisão de arquitetura: Supabase

**Estado:** preferência da plataforma confirmada pelo utilizador em 17-11-2026.  
**Âmbito:** escolha da plataforma backend principal; detalhes de utilização continuam sujeitos à auditoria do código e aos requisitos de cada módulo.

## Decisão

Utilizar **Supabase como plataforma principal para boa parte dos serviços backend do Kard**.

## Utilização-base prevista

| Serviço | Orientação | Condição |
|---|---|---|
| Supabase Postgres | Fonte de verdade relacional do Kard | Após auditar dados/schema atuais e aprovar modelo/migrações. |
| Supabase Storage | Ficheiros, anexos e imagens | Buckets privados e policies testadas. |
| Supabase Auth | Provider preferencial a avaliar para autenticação | Auditar Firebase, métodos usados, migração de utilizadores e sessões antes da decisão final de cutover. |
| RLS + grants | Controlo de acesso aos dados | Obrigatório para tabelas privadas expostas pela Data API. |
| Realtime | Atualizações live | Só em funcionalidades que precisem realmente de live updates, com autorização por tenant. |
| Edge Functions | Lógica server-side | Só quando houver razão operacional/técnica e fronteira clara com o backend da aplicação existente. |

## Não decidido automaticamente

- Não significa que todo o código de negócio deva ser escrito em Edge Functions.
- Não significa que todas as tabelas devam ser expostas pela Data API.
- Não significa que Realtime deva ser ligado em todos os módulos.
- Não autoriza migração imediata de Firebase Auth/Storage.
- Não escolhe plano comercial, região, quotas ou orçamento.
- Não afirma que a conta Free é adequada a produção nem que dispensa método de pagamento.

## Requisitos de segurança

1. RLS ativa em cada tabela privada exposta pela Data API.
2. Grants mínimos por role e operação, revendo privilégios default.
3. Policies separadas e testadas com `USING`/`WITH CHECK`.
4. Tenant membership validado em todas as operações.
5. Buckets privados com policies de Storage alinhadas ao workspace/recurso.
6. `service_role`/secret keys apenas em ambiente server-side confiável; nunca no cliente.
7. Testes de acesso cruzado entre dois ou mais workspaces.
8. Migrações versionadas, backup e plano de rollback.

## Migração Firebase

A auditoria deve mapear Auth, UIDs, providers, sessões, OAuth, Storage, regras e referências de ficheiros. Qualquer migração deve ter:
- Plano de mapeamento de identidade/contas.
- Cópia de segurança e inventário de dados.
- Ambiente de staging com contas de teste.
- Testes de login/recuperação/OAuth e permissões.
- Janela e comunicação de mudança quando aplicável.
- Procedimento de rollback.
- Aprovação explícita antes de tocar em produção.

## Alternativas

Neon não integra a solução-base. Reabrir Neon apenas se um requisito não coberto ou limitação comprovada do Supabase justificar comparação formal. Qualquer comparação deve incluir operação, consistência, autenticação, storage, segurança, custo, backups, desempenho, migração e risco de lock-in.

## Referências

Consultar fontes oficiais em `references/TECHNICAL-SOURCES.md`. Verificar sempre documentação e pricing no momento de configurar, porque features, quotas e preços mudam.
