# Revisão da página inicial em dispositivos móveis

A index usa `home-page` para limitar os ajustes de conteúdo à página inicial.
O gerador em `scripts/build_site.py` preserva essa classe ao reconstruir o site.

## Ajustes

- Cabeçalho compacto no celular, com o botão Menu identificado e área de toque maior.
- Seletor de idioma no rodapé, adaptado à largura disponível e com fonte de 16 px no tamanho padrão.
- Atalho de acessibilidade ao lado de “Faça parte” no cabeçalho. No celular, usa um ícone com nome acessível e área de toque de 44 px.
- Setas dos submenus e do seletor de idioma com o mesmo desenho e rotação ao abrir.
- Menu com rolagem própria, limitado ao espaço abaixo do cabeçalho, inclusive em telas baixas.
- Fechamento do menu ao seguir um link, sair com o teclado ou mudar entre navegação móvel e desktop.
- Títulos, cartões, botões e rodapé com quebras de texto que acomodam traduções e ampliação.
- Legenda da foto e cartão de apresentação separados em telas móveis e intermediárias.
- Espaço reservado para a seta da galeria e áreas de toque ampliadas nos links.

## Validação

Execute na raiz do projeto, com Python e Chrome ou Edge instalado:

```powershell
python scripts/check_site.py
python scripts/check_home_mobile.py
python scripts/browser_qa.py
```

O teste da index verifica 31 combinações: larguras de 320 a 1440 px, orientação
horizontal, os nove idiomas disponíveis e texto ampliado até 130%. Verifica
também cortes de texto, transbordamento horizontal, imagens, sobreposição da
legenda, área de toque do menu e sua operação com e sem JavaScript.

Resultados: [relatório da index](home-mobile-checks.json) e
[captura completa em 390 px](screenshots/home-mobile-390.png).

A auditoria estrutural encontrou zero ocorrências nas 12 páginas. A verificação
geral no navegador passou em 390, 768 e 1440 px, incluindo menu, filtros,
galeria, preferências de acessibilidade, formulário e mídia. O envio do
formulário é simulado nesses testes; não envia e-mails.

As verificações usam emulação no Chromium instalado. Não equivalem a testes
em aparelhos físicos ou no Safari do iPhone.
