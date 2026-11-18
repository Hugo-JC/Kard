# 09 — Relatório de auditoria documental

**Data:** 17-11-2026  
**Objeto:** `Kard-Google-AI-Studio-Specification.zip`  
**Tipo:** auditoria de pacote documental; não é auditoria do código da aplicação.

## 1. Material inspecionado

- Arquivo ZIP com 21 ficheiros.
- 10 documentos principais Markdown, prompts de fases PHASE-00 a PHASE-09 e um inventário de referências visuais.
- Nenhum código-fonte, `package.json`, lockfile, migração SQL, configuração de projeto Supabase/Firebase ou teste automatizado de aplicação estava incluído.

## 2. Achados e correções

| ID | Achado no pacote de origem | Impacto | Correção nesta versão |
|---|---|---|---|
| AUD-01 | Conflito de fornecedor: `00-CONTEXT` já citava Supabase, mas `01-DECISION-REGISTER`, `04-ARCHITECTURE`, `PHASE-03`, `README` e `08-OPEN-DECISIONS` ainda orientavam para Neon ou deixavam Supabase em aberto. | Risco de implementar serviços duplicados ou inconsistentes. | Supabase definido como plataforma principal; Neon removido da arquitetura-base; Firebase sujeito a auditoria antes de migração. |
| AUD-02 | Firebase Auth/Storage era referido como existente, mas não havia inventário técnico. | Migração cega poderia quebrar login, UIDs e acesso a ficheiros. | Preservada a regra de não remover/migrar até completar inventário, staging, backup e rollback. |
| AUD-03 | Decisões 1–51 não estavam disponíveis. | Parte do âmbito core continua desconhecida. | Lacuna mantida explícita em README e decisões em aberto; nenhuma resposta foi inventada. |
| AUD-04 | Q76 (privacidade) e Q80 (direção visual) eram defaults inferidos, não escolhas expressas. | Podiam ser interpretados como decisões confirmadas. | Mantida a classificação como default/inferência no registo. |
| AUD-05 | A referência a 23 capturas em `Fontes` não correspondia a imagens presentes no ZIP. | A equipa não consegue consultar as imagens usando apenas este pacote. | Limitação registada; inventário textual preservado. |
| AUD-06 | Algumas fases não tinham gate técnico explícito para grants + RLS + policies de Storage. | Risco de isolamento incompleto em aplicação multi-tenant. | Acrescentados requisitos e testes explícitos de RLS, grants, policies e Storage. |
| AUD-07 | README apresentava condições comerciais de Neon como base técnica e afirmava condições de cartão/plano. | Informação irrelevante após a decisão Supabase e potencialmente mutável. | Removida a afirmação sobre Neon; quotas Supabase devem ser verificadas na conta e página oficial atual. |

## 3. Inventário do ZIP de origem

O arquivo continha os documentos `00` a `08`, README, 10 prompts de fase (00–09) e `references/FONTES-INVENTORY.md`. O tamanho comprimido era 27.595 bytes; o conteúdo descomprimido listado era 47.806 bytes. O pacote não continha executáveis ou código de aplicação.

## 4. O que foi efetivamente verificado

- O ZIP original foi listado e extraído sem erro.
- Os documentos foram lidos e pesquisados por menções a Supabase, Neon, Firebase, autenticação, Storage, RLS e segurança.
- O conflito de arquitetura foi confirmado em múltiplos documentos.
- A ausência de código e das imagens foi confirmada pela listagem integral do ZIP.

## 5. O que não foi possível verificar

- Não foi possível executar lint, typecheck, testes ou build da aplicação: não foi fornecido código-fonte.
- Não foi possível inspecionar rotas, componentes, APIs, dados reais, variáveis, deploy, Firebase ou configuração Supabase.
- Não foram executados testes contra uma instância Supabase.
- Não foi verificada a conta do utilizador, região do projeto, método de pagamento ou quotas efetivamente atribuídas.
- Não foi validada disponibilidade/sandbox atual de ProxyPay ou Puddle nesta auditoria.

## 6. Estado após revisão documental

*Não são necessários novos requisitos de produto para esta revisão.* O pacote documental está alinhado com Supabase como plataforma principal e contém um processo para auditar a aplicação antes de a modificar. A implementação continua **não iniciada/não auditada** até receber o repositório ou projeto atual.

## 7. Próximo passo operacional

Disponibilizar o repositório/projeto atual do Kard e executar a Fase 00 sem alterações. O resultado dessa auditoria deverá substituir qualquer suposição sobre stack, Firebase, dados, rotas, deploy e integrações.
