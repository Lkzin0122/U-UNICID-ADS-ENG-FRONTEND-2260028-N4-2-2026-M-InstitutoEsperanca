# Leitura em voz alta

O botão **Ouvir o site**, na faixa superior das 12 páginas, abre as configurações.
A página de acessibilidade também oferece esse acesso em **Preferências de leitura**.

- A leitura começa somente após uma ação da pessoa. O modo ao apontar aguarda
  350 ms sobre um texto e também acompanha o foco do teclado.
- **Ler esta página** percorre o conteúdo principal visível. Menus e rodapé
  continuam disponíveis pela leitura ao apontar ou pelo foco.
- **Parar leitura** e **Esc** interrompem a fala e desligam o modo ao apontar.
- Idioma, velocidade, preferência de voz e escolha por idioma são respeitados.
  A preferência de áudio é salva quando o armazenamento local está disponível.
  A página nunca começa a falar simplesmente por ter sido carregada.
- Campos de texto são anunciados pelo rótulo, sem ler o valor digitado.

## Vozes e suporte

O recurso usa `speechSynthesis` e `SpeechSynthesisUtterance`, sem serviço contratado
ou chave de API. O navegador informa quais vozes pode usar; algumas são locais e
outras precisam de internet. Se não existir voz para o idioma atual, o painel
explica como instalar uma voz no dispositivo ou tentar outro navegador.

A API não informa o gênero das vozes. A preferência feminina/masculina reconhece
nomes conhecidos do catálogo da Microsoft. Outras vozes continuam disponíveis
pelo nome e podem ser ouvidas com **Ouvir amostra**. Quando não há correspondência,
o painel informa isso e apresenta as vozes disponíveis no mesmo idioma. Não há
alteração artificial de tom para simular uma voz feminina ou masculina.

Referências: [Web Speech API](https://wicg.github.io/speech-api/),
[catálogo de vozes Microsoft](https://support.microsoft.com/en-us/accessibility/windows/narrator/appendix-a-supported-languages-and-voices).

## Manutenção e verificação

- `js/speech-reader.js`: interface, traduções dos nove idiomas e controle de fala.
- `css/speech-reader.css`: estilos que seguem a paleta e os temas do site.
- `scripts/build_site.py`: inclui os arquivos compartilhados em cada página.
- `scripts/content_resources.py`: mantém o acesso da página de acessibilidade.

Execute `uv run --with playwright python -m playwright install chromium` e depois
`uv run --with playwright python scripts/check_speech_reader.py`. O teste usa
vozes simuladas para verificar textos, idioma, interrupção, fila de leitura,
campos privados, navegação, persistência e disposição móvel. Capturas ficam na
pasta temporária `esperanca-speech-qa`.

Para validar a reprodução sonora, use um navegador com saída de áudio e vozes
instaladas: ouça uma amostra, passe o mouse em um parágrafo, navegue com Tab,
troque o idioma e pare com Esc. Os testes automatizados não comprovam a qualidade
ou a reprodução do áudio do dispositivo.
