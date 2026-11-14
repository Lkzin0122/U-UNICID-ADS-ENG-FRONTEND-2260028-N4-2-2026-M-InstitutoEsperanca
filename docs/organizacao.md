# Organização do código

Para apresentar o projeto ao professor, siga o [roteiro de apresentação](roteiro-apresentacao.md),
que relaciona cada área aos comentários dos arquivos e sugere demonstrações.

Revisão de 14/11/2026. O projeto continua com as 12 páginas e as integrações
existentes. A organização separa estilos, conteúdo, comportamentos do navegador
e serviços do servidor.

## Estilos por página

Cada HTML carrega, nesta ordem, `css/style.css`, sua folha específica,
`css/palette.css`, `css/chatbot.css` e `css/speech-reader.css`. O contato acrescenta
a folha do seletor de telefone. A paleta permanece depois dos estilos de página
para preservar temas e contraste; o leitor mantém seus controles em uma folha própria.

| Página | CSS específico | Responsabilidade |
| --- | --- | --- |
| Início | `css/index.css` | Hero, destaques, participação, transparência e ajustes da inicial no celular. |
| Sobre | `css/sobre.css` | Fotografia e legenda da apresentação institucional. |
| Projetos | `css/projetos.css` | Cartões e detalhes das iniciativas. |
| Impacto | `css/impacto.css` | Cartões e cores dos ODS. |
| Acessibilidade | `css/acessibilidade.css` | Controles e opções de leitura. |
| Galeria | `css/galeria.css` | Grade, fotografias, legendas e botões de ampliação. |
| Mídia | `css/midia.css` | Legendas, áudio e apresentação incorporada. |
| Notícias | `css/noticias.css` | Filtros e cartões das leituras. |
| Contato | `css/contato.css` | Campos, telefone, mensagens de envio e equipe. |
| Orçamento | `css/orcamento_hospedagem.css` | Apresentação dos valores. |
| Participar | `css/participar.css` | Ajuste específico da apresentação dos passos. |
| Perguntas frequentes | `css/perguntas-frequentes.css` | Carrega o acordeão compartilhado. |

O acordeão da FAQ e de Mídia fica em `css/components/accordion.css`, evitando
duplicar suas regras. A apresentação incorporada e a ferramenta de criação de
vídeo usam `css/apresentacao.css` e `css/render-video.css`.

`style.css` e `sobre.css` na raiz continuam como caminhos de compatibilidade.
As folhas individuais em `css/` agora contêm os estilos atuais e são carregadas
pelas páginas correspondentes.

## Conteúdo e geração

`scripts/build_site.py` coordena a geração, valida recursos e páginas repetidas
e atualiza a base do chatbot. O cabeçalho, o menu e o rodapé ficam em
`scripts/site_layout.py`. Os conteúdos são mantidos nos cinco módulos
`content_home.py`, `content_contact.py`, `content_community.py`,
`content_resources.py` e `content_media.py`.

O nome da página determina seu CSS: `sobre.html` carrega `css/sobre.css`.
As referências são geradas no código de origem, e não inseridas apenas nos HTMLs
de saída.

## JavaScript e servidor

- `js/site.js`: navegação, filtros, galeria e animação do rodapé.
- `js/accessibility.js`: preferências de leitura e sincronização visual do iframe.
- `js/speech-reader.js`: leitura em voz alta, escolha de voz, velocidade e controles;
  carregado nas 12 páginas, com tradução e preferências próprias.
- `js/contact.js`: validação do formulário, rascunho, estado de envio e EmailJS;
  carregado somente em Contato.
- `js/contact-service.js`: validação do endereço de e-mail e envio compartilhado
  pela página de contato e pelo formulário dentro do chatbot. A configuração
  pública do EmailJS é carregada nas 12 páginas para permitir esse envio.
- `js/chat-actions.js` e `js/chat-copy.js`: catálogo de ações permitidas e textos
  da interface nos nove idiomas. As ações do chatbot usam as mesmas preferências
  visuais da página de acessibilidade.
- `js/phone-input.js`: interpretação e formatação do telefone, carregado no contato.
- `js/i18n.js` e `js/i18n-frame.js`: traduções, incluindo textos cujo HTML recebeu
  novas quebras de linha. Mensagens do iframe verificam origem e remetente.
- `js/render-video.js`: código de Canvas e MediaRecorder antes incorporado no HTML.
- `js/chatbot.js`, `api/chat.js` e `server/`: interface, entrada HTTP, pesquisa,
  instruções e transporte dos modelos continuam separados.

O servidor local ganhou funções para ler o corpo da requisição, servir recursos
e responder a erros. Transmissões interrompidas são tratadas, o excesso de tamanho
retorna 413 e erros reais de arquivo não são convertidos silenciosamente em 404.
Os diagnósticos registram códigos de falha, sem conteúdo de mensagens ou chaves.

O menu aberto fica acima do botão flutuante do chat. Isso corrige a sobreposição
que impedia alcançar o último link em telas muito baixas, como 320 × 320 pixels.

## Convenções e verificações

Prettier usa `.prettierrc.json` e `.prettierignore`; Ruff usa `pyproject.toml`.
Não se reformata código de terceiros ou pacotes gerados de tradução. As ferramentas
ficam nas dependências de desenvolvimento, sem acrescentar dependências npm de
execução ao servidor.

`npm run verify` confere formatação, análise Python, estrutura das páginas,
atualização da base e testes Node. A auditoria estrutural também verifica a ordem
dos estilos, o CSS próprio, `defer` nos scripts e o carregamento dos recursos de
contato somente onde são necessários.

## Integração com as atualizações da equipe

A reorganização foi conciliada com os cinco commits recebidos até `fc0e7b0`.
Foram preservados o leitor em voz alta, o favicon SVG, as correções de layout em
telas estreitas, os novos conteúdos de acessibilidade, as traduções e as atualizações
de orçamento e documentação. Os HTMLs e o índice do chat foram regenerados a partir
das fontes integradas. As regras específicas de acessibilidade permanecem em
`css/acessibilidade.css`, e os ajustes comuns de responsividade ficam na base.

`.gitattributes` fixa quebras de linha LF nos fontes para manter o padrão dos
formatadores também depois de trocar de branch no Windows. Os testes de leitura
e responsividade recebidos da equipe foram preservados.

Na integração, passaram `npm run verify` (38 testes Node e 12 páginas sem
ocorrências), 36 layouts gerais, 31 cenários da inicial e 23 verificações de
preferências visuais. A leitura em voz alta passou nos três motores do Playwright
(Chromium, Firefox e WebKit), e a responsividade passou em 228 cenários por motor,
totalizando 684. As vozes foram simuladas nos testes de fala, sem reproduzir áudio.

A auditoria de idiomas detectou uma legenda de orçamento cuja data de consulta
havia mudado no português sem atualizar a chave dos pacotes. A correspondência
foi corrigida nos oito idiomas, preservando os preços recebidos da equipe.
Após a correção, as 25 verificações de hindi passaram. O build também foi
conferido: recursos locais presentes, cópias idênticas às fontes e geração
determinística dos 12 HTMLs e do índice de conhecimento.

A comparação inicial da refatoração, antes da integração das atualizações da equipe,
foi feita no Chromium, com 108 cenários: 12 páginas,
três larguras de tela e temas claro, escuro e alto contraste. Foram comparados
posição, dimensões, fontes, cores e demais propriedades de apresentação; não
foram encontradas diferenças visuais nesses cenários. As auditorias no navegador
complementam essa comparação com controles, idiomas, rascunho, chat e zoom.

As auditorias gerais usam emulação no Chromium e integrações simuladas quando
previsto nos scripts; as suítes de fala e responsividade também foram executadas
no Firefox e no WebKit. Elas não representam testes em todos os navegadores, certificação
de acessibilidade, envio real de e-mail ou validação de uma IA em produção.

## Revisão atual

A organização preserva as ações do chatbot, o contato integrado e a leitura
no idioma escolhido. A auditoria estrutural verifica também as dependências
compartilhadas do chatbot e mantém os controles do formulário principal
exclusivos da página de contato.

Passaram a análise estática e a formatação com Ruff e Prettier, os 40 testes
Node, a verificação das 12 páginas, os 228 cenários responsivos do Chromium
e as 480 combinações de preferências visuais. Os fluxos de ações do chat
passaram no Chromium, Firefox e WebKit, com IA e e-mails simulados.
