# 04 — Arquitetura e infraestrutura

## Decisão de plataforma

**Supabase é a plataforma backend principal do Kard**, conforme preferência confirmada pelo utilizador em 17-11-2026. A arquitetura deve aproveitar os serviços Supabase adequados sem ativar todos por defeito.

Base preferencial:
- **Supabase Postgres:** dados relacionais, constraints, transações e funções SQL quando apropriado.
- **Supabase Auth:** candidato preferencial para autenticação unificada; confirmar após auditoria do Firebase atual.
- **Supabase Storage:** anexos, imagens e documentos, com buckets privados por defeito e policies.
- **Row Level Security (RLS):** fronteira de autorização ao nível da base de dados para tabelas acessíveis através da Data API.
- **Supabase Realtime:** apenas para necessidades aprovadas de atualização em tempo real; não ativar de forma indiscriminada.
- **Supabase Edge Functions:** para lógica server-side que beneficie deste runtime ou da proximidade ao Supabase; não duplicar sem necessidade lógica já existente em Next.js.

Neon não é fornecedor primário ou dependência planeada. Só pode ser reconsiderado por ADR separado que compare uma necessidade concreta, custo, segurança, operação e migração. Cloudflare R2 não deve ser introduzido como requisito.

## Stack atual e auditoria

Os documentos anteriores indicam Next.js, React e TypeScript, mas o repositório ainda não foi auditado. Antes de escolher ORM, client SDK, estrutura de rotas ou bibliotecas:
1. Confirmar framework/versões e estrutura real.
2. Inspecionar autenticação Firebase, OAuth, Storage e eventuais dados já existentes.
3. Inspecionar package manager, scripts, deploy, variáveis e integrações.
4. Mapear chamadas Firebase existentes e dependências de UID.
5. Apresentar opções de coexistência/migração e riscos antes de alterações.

## Autenticação e migração de identidade

Supabase Auth é o destino preferencial a avaliar para unificar autenticação com a plataforma. Contudo, Firebase Auth já foi utilizado e não deve ser removido automaticamente.

Auditar:
- Métodos de login realmente configurados e em uso.
- Quantidade e origem de utilizadores, UIDs e providers associados, sem exportar segredos.
- Verificação de tokens no servidor e dependências desses UIDs em tabelas/serviços.
- Email verificado, recuperação, MFA, passkeys, sessões, logout e templates SMTP.
- OAuth redirect URLs, consentimento, scopes, domínios e callbacks.
- Firebase Storage ou outros buckets, referências de ficheiros e regras de acesso.

Regras:
- Não implementar autenticação dual permanente por conveniência.
- Não assumir que Firebase UID e Supabase Auth UUID são intercambiáveis.
- Definir estratégia de ligação/migração de contas e recuperação antes de mover utilizadores.
- Não migrar contas, hashes, sessões ou ficheiros sem plano, backup, teste em staging e aprovação explícita.
- O servidor deve derivar a identidade de sessão/token validado, nunca de `user_id` recebido sem validação.

## PostgreSQL, schema e migrações

- Usar Supabase Postgres como fonte de verdade relacional.
- Criar migrações SQL versionadas e reproduzíveis; evitar alterações exclusivas feitas no Dashboard.
- Todas as entidades tenant-scoped devem ter `workspace_id` (ou relação inequívoca ao workspace) e constraints que impeçam referências cruzadas inválidas.
- Usar foreign keys, constraints, índices e transações conforme necessário.
- Definir schema privado para tabelas/funções que não precisem de exposição pela Data API.
- Expor somente o conjunto mínimo de tabelas/colunas necessário à aplicação.
- Preferir operações com contexto do utilizador autenticado para que RLS seja aplicada.
- Documentar alterações, dados afetados e plano de rollback.

## RLS, grants e autorização multi-tenant

RLS é obrigatória em todas as tabelas expostas pela Data API que contenham dados privados ou pertencentes a workspace. A segurança requer **grants e policies** coerentes: grants decidem as operações possíveis; policies delimitam as linhas permitidas.

Requisitos mínimos:
- Habilitar RLS por migração em cada tabela exposta.
- Revogar privilégios desnecessários de `anon` e `authenticated`; conceder apenas operações necessárias.
- Criar policies separadas por operação (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) com membership e papel do utilizador.
- Em `INSERT`/`UPDATE`, validar `WITH CHECK` e impedir mudança maliciosa de `workspace_id`.
- Testar Owner, Admin, Member e Guest, incluindo utilizador sem membership.
- Testar acesso cruzado mudando IDs, filtros, payloads e paths de Storage.
- Evitar policies recursivas ou caras; documentar helpers SQL e índices usados.
- Se usar funções `SECURITY DEFINER`, fixar `search_path`, validar argumentos e limitar permissões de execução.
- Não considerar esconder UI ou filtrar no cliente como controlo de segurança.

A chave publishable/anon pode ser utilizada no cliente quando apropriado, mas não é um substituto de RLS. A chave `service_role`/secret tem privilégios elevados e contorna RLS: nunca a incluir em código cliente, ficheiros públicos, logs ou screenshots. Usar apenas em backend confiável, quando indispensável, com privilégio mínimo e revisão específica.

## Storage

- Buckets privados por defeito.
- Policies de Storage devem validar utilizador, workspace, recurso e operação.
- Paths definidos/normalizados no servidor ou policy; não confiar num path arbitrário do cliente.
- Validar tamanho, extensão, MIME real e autorização antes de upload/download/eliminação.
- Gerar URLs assinados de curta duração quando necessário.
- Guardar metadados relacionais e proprietário do ficheiro em Postgres.
- Ter política de retenção e processo controlado para remover ficheiros órfãos.
- Testar que utilizador de outro workspace não consegue listar, ler, substituir ou remover ficheiros.
- Não depender de quotas gratuitas como SLA de produção.

## Realtime e lógica server-side

- Ativar Realtime apenas para fluxos onde a experiência precisa de atualizações live; definir canais e autorização por workspace.
- Testar que subscrições não divulgam alterações entre tenants.
- Manter lógica de domínio no servidor que já hospeda a aplicação, se confirmado, ou em Edge Functions quando houver vantagem clara. Documentar fronteiras e responsabilidades para evitar dois backends concorrentes.
- Segredos de integrações, pagamentos e webhooks ficam apenas em ambiente server-side/secret store.
- Para rotinas privilegiadas, preferir operações específicas e curtas; não expor endpoint genérico que aceite SQL ou comandos arbitrários.

## API, integrações e webhooks

- API REST versionada e contratos documentados.
- Validar input no servidor, aplicar rate limits e registar logs sem tokens/dados sensíveis.
- Webhooks assinados, retries com backoff, idempotência e histórico.
- OAuth com state/PKCE conforme fornecedor suportar.
- Tokens externos encriptados em repouso e acessíveis apenas no backend.
- Desconexão deve revogar tokens quando suportado e limpar credenciais com segurança.

## Billing

ProxyPay para Angola e Puddle para outros países são requisitos de negócio a validar. Checkout deve nascer no servidor; estados de pagamento só mudam após confirmação verificável. Webhooks devem ser validados e idempotentes. Não ativar pagamentos reais sem sandbox, credenciais autorizadas e confirmação.

## Observabilidade, custos e recuperação

- Logs estruturados sem tokens ou dados sensíveis.
- IDs de correlação para pedidos e webhooks.
- Registo de erros operacionais e métricas de capacidade.
- Antes de produção, confirmar região do projeto, residência/transferência de dados, quotas, limites, backups, PITR, retenção de logs, pausas de projeto, suporte e custos de egress/storage/database.
- Não prometer backups automáticos ou point-in-time recovery se o plano/projeto não os incluir.
- Definir backups/exportações independentes adequados ao risco e testar restauração.
- Plano de saída: exportação Postgres e inventário/download de ficheiros; evitar dependências proprietárias desnecessárias.

## Deploy e ambientes

Não assumir fornecedor de deploy, domínio ou CI/CD sem confirmar o estado atual. Separar desenvolvimento, staging e produção; não reutilizar credenciais/instâncias de produção em testes. Configurar URLs de callback e variáveis por ambiente. Não fazer deploy público ou alterar domínio sem autorização.
