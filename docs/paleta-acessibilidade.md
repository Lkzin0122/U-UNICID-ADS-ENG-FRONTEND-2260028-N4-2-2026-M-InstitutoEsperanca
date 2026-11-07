# Paleta e preferências visuais

Atualização: 07/11/2026.

As cores compartilhadas ficam em `css/palette.css`, carregado depois de
`css/style.css` nas 12 páginas geradas por `scripts/build_site.py`.
O layout da página inicial continua estático.

| Papel | Claro | Escuro |
| --- | --- | --- |
| Fundo | Branco azulado `#f7f9ff` | Azul quase preto `#080e19` |
| Superfície | Branco `#fff` e azul claro `#edf2ff` | Cartões `#1b2b43`, seções `#122037` |
| Texto | Preto suave `#191b22` | Branco suave `#f3f7ff` |
| Destaque de texto | Azul forte `#1744bc` | Azul claro `#a9d1ff` |
| Botões | Azul forte `#1744bc`, com texto branco | Azul-claro `#9dc9ff`, com texto escuro `#0b1a30` |
| Faixas, rodapé e faixa superior | Azul forte `#1744bc` | Azul profundo `#102b52` |
| Detalhes decorativos | Preto `#0b0b0e` | Azul-claro `#9dc9ff` |

A identidade reúne azul, branco e preto. No tema claro, faixas, rodapé e botões
usam o azul `#1744bc`. O tema escuro tem superfícies em níveis diferentes,
contornos visíveis e botões claros para se distinguir do tema claro. As paletas
de daltonismo também ajustam seus botões ao tema. Os botões primários trocam
texto e fundo juntos ao mudar de tema, evitando uma transição intermediária
com texto escuro sobre fundo escuro.

O coração do rodapé solta três corações por clique, com variação de tamanho e
trajetória. Cliques rápidos acumulam partículas, com limite de 36 simultâneas;
cada grupo é removido em 500 ms. Com movimento reduzido, apenas o ícone recebe
um destaque suave, sem partículas voando.

## Controles independentes

| Controle | Efeito |
| --- | --- |
| Tema | Define fundos e luminosidade. Claro, escuro ou preferência do sistema. Mantém as fotografias originais. |
| Cores para daltonismo | Oferece Protanopia, Deuteranopia, Tritanopia e Acromatopsia. Mantém o tema e reforça links sublinhados e identificação por texto e marcas. |
| Alto contraste | Usa preto/branco, bordas mais fortes e foco duplo. Mantém a escolha claro/escuro e prioriza essas cores sobre as paletas alternativas. |
| Inverter cores | Aplica `invert(1)` à página inteira, incluindo imagens. Não altera o tema ou desativa as outras escolhas. |
| Restaurar preferências visuais | Volta ao tema do sistema, texto em 100%, paleta original, contraste e inversão desligados. |

As paletas alternativas são opções de leitura, não filtros de simulação de visão.
Links, estados e eixos do projeto continuam identificados por texto. Estados
selecionados possuem `aria-pressed` e uma marca visual adicional.

O objeto `esperanca-visual-preferences` no `localStorage` preserva `scale`,
`contrast`, `invert`, `theme` e o novo campo `colorVision`. Preferências antigas
sem esse campo usam `off`. Os valores atuais são `off`, `protanopia`,
`deuteranopia`, `tritanopia` e `achromatopsia`. As preferências antigas são
migradas: `red-green` → `deuteranopia`, `blue-yellow` → `tritanopia` e
`monochrome` → `achromatopsia`. Erros de armazenamento não bloqueiam os controles.

A apresentação em `assets/apresentacao.html` compartilha a paleta e recebe as
escolhas por mensagem de mesma origem. No iframe, a inversão vem do documento
principal; ao abrir a apresentação sozinha, ela aplica sua própria inversão.
As cores forçadas pelo sistema e a impressão desativam os filtros da página.

## Validação

```text
python -B scripts/build_site.py
python -B scripts/check_visual_preferences.py
python -B scripts/check_hindi.py
python -B scripts/check_home_mobile.py
python -B scripts/check_contact.py
python -B scripts/check_site.py
```

O teste de preferências usa o Chromium instalado e também pode executar no Edge
com `ESPERANCA_TEST_BROWSER=edge`. Não depende de pacotes adicionais.

- 12 páginas, cada uma com 40 combinações de tema, inversão, contraste e paleta,
  totalizando 480 combinações.
- 53.520 comparações de contraste de texto, mais 17.200 com hover nos controles.
- Texto comum: alvo mínimo de 4,5:1; texto grande: 3:1. No alto contraste, os
  alvos são 7:1 e 4,5:1, respectivamente. O cálculo considera a inversão e a
  escala de cinza efetivamente ativas.
- 72 verificações de layout em três larguras, texto em 100% e 200% e quatro
  combinações de apresentação nas páginas inicial, acessibilidade e contato.
- Controles reais, persistência entre páginas, preferência do sistema, reset,
  apresentação incorporada e independente e cores forçadas pelo sistema.
- Revisão visual das paletas e preservação das traduções e do formulário.

O relatório é `docs/visual-checks.json`. A auditoria automática examina texto e
fundos calculados; não substitui a revisão das fotografias, dos efeitos
decorativos, dos controles nativos do navegador ou testes com pessoas usuárias.
Não representa certificação de conformidade.

As referências para os critérios de contraste e informação além da cor são
[Contraste mínimo — W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
e [Uso de cor — W3C](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).
