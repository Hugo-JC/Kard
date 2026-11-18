# 05 — Planos, subscrições e pagamentos

## Modelo comercial

Freemium:
- Plano Free com limites.
- Planos pagos com mais capacidade e funcionalidades.
- Upgrades e downgrades.
- Limites configuráveis centralmente, nunca espalhados por componentes.

Os nomes dos planos, preços, limites exatos, moeda, impostos, períodos de trial e política de reembolso ainda não estão definidos. Não inventar estes valores.

## Fornecedores

- Angola: ProxyPay.
- Outros países: Puddle.

A escolha do fornecedor deve ser feita por país/mercado e configuração comercial. Não inferir automaticamente que uma transação foi paga a partir de redirect do browser.

## Capacidades desejadas

- Subscrições mensais e anuais.
- Upgrade e downgrade.
- Cancelamento.
- Renovação.
- Histórico de pagamentos.
- Faturas/recibos conforme o fornecedor e requisitos legais.
- Tratamento de pagamentos falhados.
- Estado da subscrição e acesso baseado em entitlements.
- Reconciliação de eventos de pagamento através de webhooks, se disponíveis.

## Estados internos sugeridos

Definir enum interno explícito e mapear estados oficiais do fornecedor:
- pending
- trialing (apenas se trial for aprovado)
- active
- past_due
- canceled
- expired
- incomplete

Estes estados são uma proposta de modelação, não uma afirmação de que os fornecedores usam os mesmos nomes.

## Segurança e consistência

- Criar checkout no servidor.
- Validar assinatura/autenticidade de webhooks.
- Implementar idempotência.
- Guardar IDs externos e eventos processados.
- Não confiar em parâmetros de sucesso enviados pelo cliente.
- Não conceder plano pago antes da confirmação verificável do fornecedor.
- Lidar com webhooks duplicados, atrasados e fora de ordem.
- Registar alterações de plano e motivo.
- Proteger endpoints de gestão de subscrição.

## Entitlements

Criar uma camada central de direitos/limites por plano. Cada feature/limite deve ser verificado no servidor. A UI pode mostrar limites e estado, mas não substitui o enforcement backend.

## Limitações ainda por confirmar

Antes de ativar pagamentos reais, verificar documentação e credenciais de sandbox de ProxyPay e Puddle:
- Recorrência/tokenização.
- Pagamentos mensais/anuais.
- Cancelamento e alteração de subscrição.
- Webhooks e assinatura.
- Reembolsos.
- Faturas.
- Moedas, liquidação e taxas.
- Estados e prazos de confirmação.

Se uma capacidade não existir, documentar alternativa aprovada. Não simular uma capacidade ausente.
