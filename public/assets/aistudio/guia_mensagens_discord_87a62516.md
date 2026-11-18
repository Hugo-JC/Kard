# Guia Completo de Estilo e Estrutura de Mensagens no Discord

Este documento resume todos os comandos de formatação Markdown e as características visuais dos balões e blocos de mensagens do Discord.

---

## Parte 1: Formatação Markdown (Comandos de Texto)

O Discord utiliza uma variação da sintaxe Markdown para estilizar mensagens diretamente no chat.

### 1. Formatação Básica de Texto

* **Negrito:** `**texto**`
* *Itálico:* `*texto*` ou `_texto_`
* ***Negrito e Itálico:*** `***texto***`
* **Sublinhado:** `__texto__`
* ~~Tachado:~~ `~~texto~~`

### 2. Estrutura, Títulos e Citações

* **Cabeçalhos:**
  * `# Título grande (H1)`
  * `## Título médio (H2)`
  * `### Título pequeno (H3)`
* **Subtexto (cinza pequeno):** `-# seu texto` (colocado no início da linha)
* **Citações:**
  * Linha única: `> texto`
  * Bloco multi-linha: `>>> texto`

### 3. Código, Spoilers e Links

* **Texto em código (inline):** `` `código` ``
* **Bloco de código:** ` ```código``` `
* **Spoiler (conteúdo oculto):** `||texto||`
* **Link mascarado:** `[Nome do Site](https://exemplo.com)`

---

## Parte 2: Anatomia Visual dos Balões e Blocos de Mensagens

A aparência das mensagens no Discord varia consoante o modo de exibição e o tipo de interação.

### 1. Estrutura da Mensagem Padrão (Modo Aconchegante / Cozy)

* **Avatar:** Círculo à esquerda (40x40 px no desktop) com a foto de perfil do utilizador.
* **Cabeçalho:** Nome do utilizador alinhado ao topo do avatar, exibindo a cor do seu cargo mais alto no servidor.
* **Carimbo de Data/Hora (Timestamp):** Texto pequeno e cinzento claro logo à frente do nome (ex.: "Hoje às 14:30").
* **Corpo do Texto:** Alinhado diretamente abaixo do nome. Não existe um "balão" com bordas ou fundo colorido à volta do texto normal; o texto assenta diretamente sobre o fundo da interface.
* **Agrupamento:** Quando o mesmo utilizador envia várias mensagens seguidas num curto espaço de tempo, o avatar e o nome desaparecem nas mensagens seguintes, mantendo-se apenas o texto alinhado à esquerda (a hora surge ao passar o cursor).

### 2. Modo Compacto (Compact)

* **Sem Avatares:** As fotos de perfil são totalmente ocultadas para poupar espaço vertical.
* **Alinhamento em Linha:** A hora aparece primeiro à esquerda, seguida pelo nome do utilizador e pelo texto da mensagem na mesma linha.

### 3. Destaques e Fundos Especiais (Os verdadeiros "Balões")

* **Menções (`@utilizador` ou `@everyone`):** A linha inteira da mensagem recebe um fundo retangular translúcido amarelo-âmbar e uma barra vertical sólida amarela na extremidade esquerda.
* **Respostas (Replies):** Surge uma pequena pré-visualização acima da mensagem principal com o mini-avatar, o nome e o início do texto original, ligados por uma linha fina curva ao avatar de quem respondeu.
* **Hover (Passar o cursor):** Ao passar o rato sobre qualquer mensagem, o fundo da linha muda ligeiramente de tonalidade e aparece uma barra flutuante no canto superior direito com opções rápidas.

### 4. Embeds (Cartões de Bots e Pré-visualizações de Links)

* **Formato:** Retângulo com cantos ligeiramente arredondados e um fundo mais escuro do que a área principal do chat.
* **Barra Lateral:** Inclui uma linha vertical espessa no lado esquerdo com cor personalizável.
* **Conteúdo Interno:** Suporta título, descrição, campos em colunas, miniaturas (thumbnails) à direita, imagens grandes em baixo e um rodapé pequeno.

### 5. Reações, Caixas de Código e Citações Visuais

* **Reações:** Pequenas pílulas retangulares com cantos arredondados abaixo do texto, exibindo o emoji e o contador numérico. Ficam com borda e fundo azulados quando selecionadas pelo utilizador.
* **Caixas de Código e Citações:** Blocos de código geram caixas retangulares escuras com bordas finas; citações adicionam uma barra vertical cinzenta à esquerda do texto.

### 6. Quero que seja póssivel mencionar um usuário com o comando `@` seguido do nome de usuário, e que o Discord destaque a mensagem com uma cor diferente para indicar que você foi mencionado e que seja póssivel mencionar arquivos do projeto com o comando `#` seguido do nome do arquivo, e que o Discord destaque a mensagem com uma cor diferente para indicar que você foi mencionado
