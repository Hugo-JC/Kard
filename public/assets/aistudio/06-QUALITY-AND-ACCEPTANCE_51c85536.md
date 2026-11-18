# 06 — Qualidade, segurança e critérios de aceitação

## Critérios transversais

Uma funcionalidade só está concluída quando:
1. Está ligada ao backend real quando exige persistência.
2. Tem validação client-side e server-side apropriada.
3. Verifica autenticação e autorização no servidor.
4. Trata loading, empty, error e success.
5. Tem testes adequados.
6. Não quebra fluxos existentes.
7. É responsiva e acessível.
8. Tem documentação curta para configuração/operação quando necessário.

## Testes de isolamento e Supabase RLS

- Todas as tabelas privadas expostas pela Data API têm RLS ativo.
- Grants a `anon`/`authenticated` são mínimos e revistos por tabela/operação.
- Policies `SELECT`, `INSERT`, `UPDATE`, `DELETE` são testadas separadamente, incluindo `WITH CHECK`.
- Utilizadores de tenants distintos não conseguem ler nem modificar dados uns dos outros.
- Não é possível alterar `workspace_id`, proprietário ou referências para obter acesso a outro tenant.
- A chave `service_role`/secret não aparece no cliente, bundle, source map público ou logs.
- Policies de Storage impedem listagem, leitura, substituição e eliminação entre tenants.
- Canais Realtime (se usados) são testados quanto ao isolamento entre workspaces.

## Testes de isolamento

Criar pelo menos dois workspaces e utilizadores distintos. Provar que:
- Um membro não consegue ler dados de workspace alheio.
- Alterar IDs no pedido não contorna permissões.
- Guest não executa ações administrativas.
- Member/Admin/Owner têm permissões distintas conforme matriz.
- Anexos não são descarregáveis por utilizadores sem permissão.
- Exportação respeita filtros e permissões.

## Testes de dados

- Criar, atualizar e apagar tarefa.
- Atualização persiste após refresh e novo login.
- Falhas de rede não apresentam sucesso falso.
- Operações multi-registo usam transações quando necessário.
- Migrações aplicam-se numa base de dados limpa e numa base existente de teste.

## Testes de comentários e notificações

- Criar comentário e resposta.
- Menção notifica destinatário correto.
- Reação pode ser adicionada/removida.
- Preferências de notificação são respeitadas.
- Estado lido/não lido persiste.
- Duplicados de eventos são evitados.

## Testes de billing

Usar apenas sandbox/test mode até autorização:
- Pagamento pendente não ativa plano.
- Webhook válido atualiza estado.
- Webhook inválido é rejeitado.
- Webhook repetido não duplica pagamento nem entitlement.
- Falha de renovação altera estado corretamente.
- Cancelamento respeita política aprovada.
- Nenhum segredo aparece no cliente ou logs.

## Testes de integração

- OAuth state/PKCE verificado conforme suporte.
- Credenciais guardadas no servidor.
- Erros e revogação tratados.
- Desconectar remove ou revoga credenciais.
- Falha do fornecedor não deixa UI a indicar conectado quando não está.

## Comandos

Primeiro descobrir os scripts disponíveis em `package.json`. Executar os scripts reais de lint, typecheck, test e build. Não inventar comandos nem declarar que foram executados se não foram.

## Relatório obrigatório por fase

- Resumo do que foi implementado.
- Ficheiros criados/alterados.
- Migrações e alterações de schema.
- Variáveis de ambiente necessárias (nomes, nunca valores secretos).
- Testes executados e resultados.
- Limitações conhecidas.
- Passos manuais do utilizador.
- Riscos e decisões em aberto.
- Confirmação explícita de que nenhum mock foi apresentado como funcionalidade real.
