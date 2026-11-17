# Fase 00 — Auditoria sem alterações

## Objetivo

Produzir um retrato verificável do projeto Kard atual antes de alterar código, schema, dados ou infraestrutura.

## Prompt

Inspeciona o projeto atual sem modificar ficheiros, instalar dependências, migrar dados ou publicar.

1. Mapeia stack/versões, estrutura, rotas, componentes, estado, UI, scripts, testes e configuração de build.
2. Mapeia Firebase Auth, OAuth, Storage, quaisquer bases de dados, chamadas externas, billing e deploy.
3. Identifica funcionalidades existentes, incompletas, simuladas, duplicadas e quebradas, com paths e evidências.
4. Mapeia dados sensíveis e segredos por localização/nome de variável, sem imprimir valores secretos.
5. Identifica tabelas, regras de autorização, políticas RLS existentes, grants e buckets/policies Supabase, se já existirem.
6. Compara o estado real com os documentos deste pacote e lista conflitos.
7. Identifica lacunas das decisões 1–51 e procura evidências no código/histórico, sem as assumir como decisões aprovadas.
8. Produz inventário de identidade Firebase: providers, dependências de UID, utilizadores/dados e Storage. Não exportar credenciais nem mover contas.
9. Propõe estratégia Supabase por serviço (Postgres, Auth, Storage, RLS; Realtime/Edge Functions somente se necessários), com dependências e riscos.
10. Propõe plano de migração não destrutivo, se necessário, incluindo staging, backup, rollback e validação.
11. Executa apenas comandos de inspeção seguros e regista literalmente os comandos executados e os respetivos resultados.

## Entregáveis

- Mapa da arquitetura atual.
- Matriz: funcionalidade / estado / evidência / risco / recomendação.
- Mapa Auth e dados Firebase atuais.
- Mapa de dados e autorização atual (incluindo Supabase se já configurado).
- Diferenças face à especificação e decisões em aberto.
- Plano de fases ajustado.

## Aceitação

Relatório verificável com paths e evidências; comandos registados; nenhuma alteração no repositório, base de dados ou infraestrutura. Não declarar a auditoria do código concluída se o repositório não estiver disponível.
