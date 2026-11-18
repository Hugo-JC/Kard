# 11 — Gates de fase e modelo de relatório

## Gate obrigatório entre fases

A fase só pode ser considerada concluída quando:

- [ ] Âmbito executado é o autorizado e não foram adicionadas funcionalidades não aprovadas.
- [ ] Ficheiros alterados e razões estão listados.
- [ ] Migrações/schema/policies estão versionados e revistos, quando aplicável.
- [ ] Lint, typecheck, testes e build disponíveis foram executados; resultados verdadeiros registados.
- [ ] Testes de autorização/RLS/Storage foram executados quando a fase toca dados ou ficheiros.
- [ ] Fluxos existentes críticos não regrediram.
- [ ] Loading, empty, error, success e no-permission foram verificados conforme o caso.
- [ ] Desktop 1440×900 e mobile 390×844 foram verificados nas fases de UI.
- [ ] Nenhum secret foi introduzido no cliente, repositório ou logs.
- [ ] Limitações, riscos e tarefas manuais estão explícitos.
- [ ] Não há vulnerabilidade crítica conhecida sem mitigação aprovada.
- [ ] Utilizador aprovou explicitamente avançar para a fase seguinte.

## Modelo de relatório por fase

### 1. Identificação
- Fase:
- Data:
- Commit/branch:
- Estado: concluída / parcial / bloqueada

### 2. Diagnóstico e âmbito
- Objetivo da fase:
- O que foi implementado:
- O que ficou fora do âmbito e porquê:

### 3. Alterações
- Ficheiros criados:
- Ficheiros alterados:
- Migrações SQL/schema:
- Policies RLS/grants/Storage:
- Variáveis de ambiente (nomes apenas):

### 4. Verificações executadas
| Verificação | Comando/cenário | Resultado | Evidência |
|---|---|---|---|
| Lint | | | |
| Typecheck | | | |
| Testes | | | |
| Build | | | |
| RLS/multi-tenant | | | |
| Storage | | | |
| UI/accessibilidade | | | |

Não escrever “passou” sem executar o comando/teste. Se não foi executado, indicar “não executado” e motivo.

### 5. Segurança e dados
- Secrets verificados:
- Permissões verificadas:
- Dados migrados/alterados:
- Backup/rollback:

### 6. Limitações e decisões pendentes
- Limitações:
- Decisões que bloqueiam trabalho:
- Riscos residuais:

### 7. Confirmação de integridade
- [ ] Nenhum mock foi apresentado como funcionalidade real.
- [ ] Nenhum botão/link/formulário sem operação real foi apresentado como concluído.
- [ ] Nenhum pagamento real ou deploy foi ativado sem autorização.
- [ ] Nenhuma migração destrutiva foi executada sem aprovação.

### 8. Pedido de aprovação
Resumir exatamente o que precisa de aprovação antes da próxima fase. Não avançar automaticamente.
