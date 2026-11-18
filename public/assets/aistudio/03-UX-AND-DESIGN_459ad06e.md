# 03 — UX e sistema visual

## Direção visual

Default inferido a partir das preferências já expressas:
- Tema dark minimalista como base.
- Acento azul.
- Superfícies neutras e contraste legível.
- Interface profissional, densa sem ser confusa.
- Tipografia contida; evitar títulos gigantes.
- Blur e glassmorphism apenas quando tiverem função clara.
- Animações discretas, rápidas e respeitadoras de `prefers-reduced-motion`.

Não assumir que dark é o único tema possível. Preparar tokens para light/dark, mas priorizar o tema dark nesta primeira execução.

## Referências fornecidas

O arquivo `Fontes` contém 23 capturas de ecrã 2244×1080. As capturas visíveis incluem padrões do Linear:
- Navegação lateral por workspace, equipas, projetos e views.
- Listas de issues com filtros e colunas.
- Painel de detalhe de issue com propriedades.
- Histórico de atividade e comentários.
- Templates de issue.
- Overview de projeto, roadmap e timeline.
- Estrutura de equipas e projetos.

Usar estas capturas como referência de padrões e densidade, não como especificação exata. Não copiar marca, logótipo, conteúdo, ícones proprietários ou layout pixel a pixel.

## Princípios de layout

- Sidebar de navegação consistente, com opção de recolher se o código/produto atual justificar.
- Área principal focada no conteúdo.
- Painel de detalhes contextual para tarefas quando adequado.
- Cabeçalhos compactos, breadcrumbs claros e ações agrupadas.
- Pesquisa e Command Palette acessíveis por teclado.
- Filtros visíveis, com estados aplicados e opção de limpar.
- Tabelas/listas com densidade ajustável apenas se não complicar o MVP.
- Responsivo: desktop prioritário para fluxos de gestão; mobile deve permitir consultar e executar ações essenciais sem layout quebrado.

## Componentes e estados obrigatórios

Cada módulo deve contemplar:
- Loading.
- Empty.
- Error.
- Success/confirmation.
- Disabled.
- No permission.
- Offline/retry, quando aplicável.

Botões devem ter ação real, estado disabled coerente e feedback. Links devem navegar para destinos existentes. Formulários devem validar, submeter e mostrar erros de servidor.

## Acessibilidade

- Semântica HTML adequada.
- Navegação por teclado e foco visível.
- Contraste WCAG 2.2 AA como alvo.
- Labels acessíveis e mensagens de erro associadas.
- Dialogs com foco controlado e escape.
- Não depender apenas de cor para estado/prioridade.
- Respeitar redução de movimento.

## Design tokens

Criar tokens centralizados para cores, tipografia, espaçamento, raios, sombras, z-index e motion. Não espalhar valores arbitrários por componentes. O acento azul deve ser configurável por token; escolher valores concretos após auditar o sistema visual atual.

## Qualidade visual

Antes de concluir cada fase, testar pelo menos:
- Desktop 1440×900.
- Mobile 390×844.
- Estados vazios e com dados reais de teste.
- Navegação por teclado.
- Tema escuro e contraste.
