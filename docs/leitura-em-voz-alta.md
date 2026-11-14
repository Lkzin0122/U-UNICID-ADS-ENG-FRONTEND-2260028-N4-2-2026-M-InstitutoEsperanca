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
- Ao navegar para outra página, use **Liberar áudio** se o navegador exigir uma
  nova interação. A preferência de leitura continua salva. O aviso também aparece
  fora das configurações, junto ao botão **Parar leitura**. A navegação com Tab
  também pode fornecer a ativação exigida pelo navegador.

## Vozes e suporte

O recurso usa `speechSynthesis` e `SpeechSynthesisUtterance`, sem serviço contratado
ou chave de API. O navegador informa quais vozes pode usar; algumas são locais e
outras precisam de internet. A lista pode chegar depois do carregamento da
página. O site tenta atualizá-la durante alguns segundos, acompanha o evento
`voiceschanged` e oferece **Atualizar vozes** para uma nova tentativa.

Uma lista vazia não desativa os controles em navegadores compatíveis. A opção
**Automática do dispositivo** deixa o navegador tentar escolher uma voz para o
idioma atual, mesmo quando não consegue enumerá-la. Isso não instala vozes nem
garante que exista uma voz para aquele idioma. O painel orienta a instalação
quando necessário.

A API não informa o gênero das vozes. A preferência feminina/masculina reconhece
nomes conhecidos do catálogo da Microsoft, vozes portuguesas Luciana e Joana e
indicações explícitas de gênero no nome. Outras vozes continuam disponíveis
pelo nome e podem ser ouvidas com **Ouvir amostra**. Quando não há correspondência,
o painel informa isso e apresenta as vozes disponíveis no mesmo idioma. Não há
alteração artificial de tom para simular uma voz feminina ou masculina.

Uma falha de voz tenta, no máximo, três opções: a seleção atual, uma alternativa
do mesmo idioma e a voz automática (ou duas alternativas, se a seleção já for
automática). A preferência de gênero orienta a alternativa quando identificada.
Falhas de permissão pedem uma nova ação em **Liberar áudio**. Falhas definitivas
exibem um aviso e deixam a configuração disponível. Há limites de espera para
motores que não enviam os eventos de início ou término; parar ou trocar a seleção
cancela as tentativas pendentes.

O controle flutuante usa um popover não modal nos navegadores compatíveis, para
continuar visível com os filtros de cores e permitir interação com a página.

Referências: [Web Speech API](https://wicg.github.io/speech-api/),
[vozes disponíveis no dispositivo](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices),
[propriedades das vozes](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice),
[catálogo de vozes Microsoft](https://support.microsoft.com/en-us/accessibility/windows/narrator/appendix-a-supported-languages-and-voices).

## Manutenção e verificação

- `js/speech-reader.js`: interface, traduções dos nove idiomas e controle de fala.
- `css/speech-reader.css`: estilos que seguem a paleta e os temas do site.
- `scripts/build_site.py`: inclui os arquivos compartilhados em cada página.
- `scripts/content_resources.py`: mantém o acesso da página de acessibilidade.

Execute `uv run --with playwright python -m playwright install chromium firefox webkit`
e depois `uv run --with playwright python scripts/check_speech_reader.py --browser all`.
Para um único motor, use `--browser chromium`, `--browser firefox` ou `--browser webkit`.
Com Python e Playwright já instalados, o atalho é `npm run test:speech`.

Os testes usam vozes simuladas para verificar controles pelo teclado, vozes
femininas, lista vazia ou atrasada, retomada do áudio, erros e limites de espera,
fila de leitura, campos privados, navegação, persistência e telas de 320 a 1440 px.
Incluem toque, texto ampliado, tema escuro, filtro de acromatopsia e a disponibilidade
real da API sem produzir áudio. Capturas ficam na pasta temporária
`esperanca-speech-qa`, separadas por motor.

Para validar a reprodução sonora, use um navegador com saída de áudio e vozes
instaladas: ouça uma amostra, passe o mouse em um parágrafo, navegue com Tab,
troque o idioma e pare com Esc. Os testes automatizados não comprovam a qualidade
ou a reprodução do áudio do dispositivo.
