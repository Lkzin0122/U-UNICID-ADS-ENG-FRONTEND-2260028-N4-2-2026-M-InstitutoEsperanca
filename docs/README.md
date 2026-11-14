# Escopo do Projeto  Instituto Esperanca

**Documentacao do site institucional do Instituto Esperanca.**

---

## 1. Identificacao

| Campo | Informacao |
|---|---|
| **Site publicado** | https://institutoesperanca.vercel.app/ |
| **Nome do projeto/site** | Instituto Esperanca |
| **Equipe** | Instituto Esperanca |
| **Integrantes** | Jonathan Santos dos Anjos (RGM: 49815075); Addiel Anthonny Arguedas Sangalli (RGM: 50323865); Lucas Bitencourt (RGM: 50262050); Caio Rian (RGM: 50446681) |
| **Disciplina** | Desenvolvimento Front-End Web (UNICID) |
| **Data de elaboracao** | 26/09/2026 |

## 2. Contexto e justificativa

O Instituto Esperanca e uma proposta de organizacao social voltada ao apoio de pessoas e familias em situacao de vulnerabilidade. Sua atuacao e representada por iniciativas relacionadas a educacao, a inclusao de pessoas com deficiencia (PCD), ao apoio a criancas e adolescentes, a maes solo e a familias em situacao de desabrigo, alem da conscientizacao ambiental.

A falta de acesso a oportunidades educacionais, recursos de inclusao e informacoes sobre iniciativas sociais pode ampliar desigualdades. Por isso, um site acessivel e organizado pode ajudar a divulgar campanhas, apresentar os objetivos da instituicao e facilitar a comunicacao com pessoas interessadas em receber apoio, participar como voluntarias ou estabelecer parcerias.

O projeto relaciona **sustentabilidade e impacto social** ao reunir conteudo educativo, iniciativas de conscientizacao ambiental e acoes de inclusao social em um canal digital. As informacoes sobre resultados e campanhas deverao ser apresentadas de forma responsavel, sem divulgar numeros ou resultados que nao tenham sido verificados.

## 3. Objetivos

### 3.1 Objetivo geral

Desenvolver um site institucional responsivo, intuitivo e acessivel para apresentar o Instituto Esperanca, divulgar suas iniciativas socioambientais e facilitar a comunicacao entre a instituicao e o publico.

### 3.2 Objetivos especificos

1. Implementar **10 paginas HTML interligadas e navegaveis**, conforme os requisitos da atividade.
2. Apresentar a missao da instituicao e divulgar projetos relacionados a educacao, a inclusao social e a sustentabilidade.
3. Disponibilizar um formulario de contato com campos identificados e validacao nativa do HTML5.
4. Incorporar recursos multimidia  video, audio e conteudo incorporado por `iframe`  em uma pagina propria.
5. Aplicar praticas de acessibilidade, incluindo textos alternativos, contraste adequado e navegacao por teclado.
6. Adaptar a interface a celulares, tablets e computadores e validar o HTML no W3C Validator.

## 4. Publico-alvo

O site destina-se a:

- Criancas, adolescentes, jovens e adultos em situacao de vulnerabilidade social ou familiar, considerando que o conteudo deve ser compreensivel tambem para seus responsaveis.
- Familias de comunidades que buscam informacoes sobre iniciativas sociais e educativas.
- Maes solo e familias em situacao de desabrigo ou dificuldade socioeconomica.
- Voluntarios, doadores em potencial, organizacoes parceiras e pessoas interessadas nas acoes sociais e ambientais.

A interface devera usar linguagem clara e navegacao previsivel, considerando diferentes niveis de familiaridade com a internet e diferentes necessidades de acesso.

## 5. Escopo funcional

O projeto contempla as dez paginas exigidas na atividade:

| No | Pagina / arquivo | Conteudo e funcionalidades |
|---|---|---|
| 1 | **Inicio  `index.html`** | Apresentacao do Instituto Esperanca, resumo de sua atuacao, destaques de projetos e menu principal para acessar as demais paginas. |
| 2 | **Sobre  `sobre.html`** | Apresentacao da instituicao, sua proposta, missao, visao e valores. A historia devera ser descrita de acordo com as informacoes disponiveis, sem inventar fatos institucionais. |
| 3 | **Projetos  `projetos.html`** | Divulgacao de iniciativas e campanhas relacionadas a educacao, inclusao, conscientizacao ambiental e impacto social. |
| 4 | **Impacto  `impacto.html`** | Apresentacao dos resultados e das acoes desenvolvidas, com dados, tabelas ou indicadores quando houver informacoes verificaveis. Na ausencia de dados confirmados, a pagina devera deixar isso explicito. |
| 5 | **Acessibilidade  `acessibilidade.html`** | Apresentacao dos recursos de inclusao e das medidas de acessibilidade digital, incluindo orientacoes de navegacao e uso da interface. |
| 6 | **Galeria  `galeria.html`** | Imagens relacionadas a campanhas e projetos, acompanhadas de legendas descritivas e indicacao das fontes. |
| 7 | **Midia  `midia.html`** | Conteudos multimidia com elementos HTML `<video>`, `<audio>` e `<iframe>`, com controles e alternativas acessiveis sempre que possivel. |
| 8 | **Noticias  `noticias.html`** | Noticias, artigos e publicacoes relacionadas a projetos, educacao, inclusao social e sustentabilidade, com fontes identificadas. |
| 9 | **Contato  `contato.html`** | Dados de contato do Instituto, identificacao dos integrantes da equipe e formulario com rotulos e validacao HTML5. |
| 10 | **Orcamento de hospedagem  `orcamento_hospedagem.html`** | Hospedagem na Vercel com plano Hobby e tres opcoes de dominio, com precos, caracteristicas, fontes consultadas e justificativa da escolha. |

### 5.1 Navegacao

Todas as paginas deverao compartilhar uma navegacao principal consistente, com links funcionais entre as dez paginas. O usuario devera conseguir retornar a pagina inicial e localizar as secoes principais sem depender exclusivamente de elementos visuais.

### 5.2 Formulario de contato

O formulario devera usar elementos `<label>` associados aos respectivos campos e validacao nativa do HTML5. Conforme a necessidade dos campos, serao utilizados atributos e tipos como `required`, `type="email"`, `type="tel"`, `type="date"`, `type="number"` e `pattern`.

Os campos deverao ser adequados ao proposito do formulario, sem exigir informacoes desnecessarias.

O contato do Instituto e **institutoesperancaunicid@outlook.com**.

O formulario envia a mensagem pela API do EmailJS, apos configurar o servico e o template, conforme o arquivo `emailjs.md`.

Quando o envio estiver indisponivel, oferece o aplicativo de e-mail como alternativa.

## 6. Escopo nao funcional

### 6.1 Acessibilidade

- Definir o idioma do documento como `lang="pt-BR"`.
- Usar HTML semantico, com elementos como `<header>`, `<nav>`, `<main>`, `<section>`, `<article>` e `<footer>`.
- Incluir textos alternativos descritivos nas imagens informativas.
- Garantir contraste adequado entre texto e fundo e nao transmitir informacoes somente por cores.
- Permitir navegacao por teclado, com foco visivel e ordem de navegacao logica.
- Associar rotulos aos campos de formulario e usar atributos ARIA apenas quando necessarios.
- Considerar leitores de tela e alternativas textuais para conteudos multimidia.

### 6.2 Responsividade

A interface devera se adaptar a celulares, tablets e computadores, mantendo a legibilidade, a hierarquia das informacoes e o funcionamento dos menus e formularios em diferentes larguras de tela.

### 6.3 Sustentabilidade digital

O conteudo devera incentivar a educacao socioambiental e a conscientizacao sobre sustentabilidade.

Na implementacao, deverao ser priorizadas imagens otimizadas e recursos que evitem carregamentos desnecessarios.

A escolha de hospedagem devera considerar preco, recursos disponiveis e, quando houver informacoes confiaveis, praticas ambientais do fornecedor.

### 6.4 Desempenho e organizacao

O codigo devera ser legivel, organizado e reutilizavel sempre que possivel.

Arquivos CSS, JavaScript, imagens e documentacao deverao ficar separados em pastas proprias, conforme a estrutura prevista para a entrega.

### 6.5 SEO basico

Cada pagina devera ter titulo descritivo, estrutura adequada de cabecalhos e meta description pertinente.

Os links deverao possuir textos claros e os conteudos deverao ser organizados para facilitar sua compreensao por usuarios e mecanismos de busca.

## 7. Mapa do site

**Instituto Esperanca**

- Inicio  `index.html`  Feito
- Sobre  `sobre.html`  Feito
- Projetos  `projetos.html`  Feito
- Impacto  `impacto.html`  Feito
- Acessibilidade  `acessibilidade.html`  Feito
- Galeria  `galeria.html`  Feito
- Midia  `midia.html`  Feito
- Noticias  `noticias.html`  Feito
- Contato  `contato.html`  Feito
- Orcamento de hospedagem  `orcamento_hospedagem.html`  Feito

**Fluxo de navegacao:**

A pagina inicial apresenta o projeto e oferece acesso ao menu principal. A partir dele, o visitante pode abrir qualquer uma das paginas.

Links contextuais entre projetos, impacto, galeria, midia e noticias poderao aprofundar a navegacao. Todas as paginas deverao manter acesso a navegacao principal.

## 8. Conteudo e identidade visual

- **Nome:** Instituto Esperanca.
- **Paleta de cores:** azul forte `#1744bc`, branco e preto no tema claro. O tema escuro usa fundo `#080e19`, cartoes `#1b2b43`, faixas `#102b52` e botoes claros `#9dc9ff` com texto escuro.
- **Recursos visuais:** tema, inversao, alto contraste em preto/branco e opcoes Protanopia, Deuteranopia, Tritanopia e Acromatopsia tem funcoes independentes. Consulte o arquivo `paleta-acessibilidade.md`.
- **Tipografia:** Arial, Helvetica e fontes genericas `sans-serif`.
- **Tom de voz:** acolhedor, respeitoso, claro e informativo, sem linguagem discriminatoria ou estigmatizante.
- **Estilo visual:** institucional, simples e organizado, com hierarquia visual que facilite a localizacao das informacoes.
- **Imagens e textos:** utilizar conteudo autoral ou materiais cujo uso seja permitido, identificando as fontes e os creditos necessarios. As imagens devem ter legendas quando pertinente e texto alternativo adequado.

A identidade visual devera manter consistencia entre as paginas e priorizar legibilidade e contraste, inclusive para pessoas com baixa visao.

## 9. Tecnologias e ferramentas

- **HTML5:** estruturacao semantica das dez paginas e dos formularios.
- **CSS3:** identidade visual, layout e responsividade.
- **Python:** verificacao de larguras de celular, tablet e desktop, idiomas, texto ampliado e menu.
- **JavaScript:** utilizado para interacoes complementares sem substituir os recursos nativos de acessibilidade e validacao.
- **Organizacao de arquivos:** pastas `css/`, `js/`, `img/`, `assets/` e `docs/`.
- **Validacao:** W3C Validator para verificar a estrutura HTML.
- **Controle de versao:** ferramenta de versionamento, como Git, se utilizada pela equipe.
- **Hospedagem do site:** https://institutoesperanca.vercel.app/

## 10. Cronograma e divisao de tarefas

### 10.1 Divisao inicial de responsabilidades

| Integrante | Responsabilidades previstas |
|---|---|
| **Lucas Bitencourt** | Documentacao, programacao e design da interface. |
| **Jonathan Santos dos Anjos** | Documentacao, programacao e design. |
| **Addiel Anthonny Arguedas Sangalli** | Documentacao, programacao e design. |
| **Caio Rian** | Documentacao, programacao e design. |

As responsabilidades poderao ser compartilhadas e ajustadas conforme a necessidade, mantendo a equipe responsavel pela integracao e revisao final do site.

### 10.2 Etapas de desenvolvimento

| Etapa | Atividade | Resultado esperado |
|---|---|---|
| 1 | Planejamento do conteudo e da estrutura | Escopo e mapa do site definidos. |
| 2 | Construcao da estrutura HTML | Dez paginas criadas e interligadas. |
| 3 | Desenvolvimento visual com CSS | Identidade visual consistente e responsiva. |
| 4 | Inclusao de formulario e multimidia | Campos validados e recursos multimidia implementados. |
| 5 | Revisao de acessibilidade e navegacao | Correcao de problemas identificados. |
| 6 | Validacao e documentacao | Testes registrados e arquivos de documentacao preparados. |
| 7 | Organizacao da entrega | Projeto completo compactado para envio. |

## 11. Riscos e restricoes

| Risco ou restricao | Possivel impacto | Medida preventiva |
|---|---|---|
| Prazo limitado | Paginas ou documentacao incompletas. | Priorizar os requisitos obrigatorios e acompanhar as etapas. |
| Divisao de tarefas pouco clara | Retrabalho ou partes incompativeis. | Definir responsaveis e revisar o progresso em conjunto. |
| Dificuldades tecnicas | Atrasos na implementacao. | Testar os recursos gradualmente e consultar a documentacao tecnica. |
| Falta de dados institucionais confirmados | Publicacao de informacoes incorretas. | Nao inventar resultados, historias ou estatisticas; identificar conteudos ilustrativos. |
| Problemas de acessibilidade | Barreiras para parte do publico. | Testar contraste, teclado, textos alternativos e formularios. |
| Imagens e midias inadequadas | Lentidao ou uso indevido de conteudo. | Otimizar arquivos e conferir permissoes e creditos. |
| Diferencas entre navegadores e telas | Layout ou funcoes inconsistentes. | Testar paginas em diferentes larguras e navegadores disponiveis. |

### 11.1 Restricoes do projeto

O trabalho tem foco na primeira versao de um site em HTML5 e CSS3.

O JavaScript e necessario para o envio de contato pelo EmailJS. O formulario mantem a validacao no navegador e envia para **institutoesperancaunicid@outlook.com**, conforme o destinatario fixo configurado no template do servico.

Sem JavaScript, o endereco de e-mail continua disponivel. Nao ha armazenamento proprio de mensagens no site.

O chatbot institucional usa JavaScript e uma API Node.js.

Na Vercel, a API usa o provedor configurado; na execucao local, usa Ollama por padrao.

O agente consulta uma base indexada do conteudo do site. Consulte o arquivo `chatbot.md`.

## 12. Criterios de aceitacao

O projeto sera considerado pronto para entrega quando os seguintes criterios forem verificados:

- [x] As dez paginas previstas estao criadas e interligadas.
- [x] Todas as paginas possuem navegacao consistente e links funcionais.
- [x] O conteudo aborda sustentabilidade e impacto social de forma pertinente.
- [x] A estrutura utiliza elementos semanticos HTML5 e hierarquia adequada de titulos.
- [x] O formulario de contato contem rotulos associados aos campos e validacao HTML5.
- [x] A pagina de midia inclui `<video controls poster>`, `<audio controls>` e `<iframe>`, conforme aplicavel ao conteudo.
- [x] A interface permite navegacao por teclado e apresenta contraste adequado.
- [x] O site se adapta a celulares, tablets e computadores.
- [x] O HTML foi verificado no W3C Validator e os erros encontrados foram corrigidos ou documentados.
- [x] A pasta `docs/` contem o README, o diario de bordo, o orcamento de hospedagem na Vercel, a comparacao de dominios e as evidencias de testes.
- [x] Os arquivos estao organizados nas pastas previstas e o projeto esta compactado para entrega.
- [x] Os conteudos factuais e os dados apresentados foram conferidos; dados ilustrativos estao identificados como tais.

## 13. Aprovacao

**Responsavel pela validacao do escopo:** Lucas Bitencourt

**Data:** 26/09/2026

**Assinatura:**

________________________________________

## 14. Chatbot institucional

O assistente Esperanca usa o Groq na Vercel ou o Ollama local e pesquisa uma base indexada do conteudo do projeto.

Consulte o arquivo `chatbot.md` para informacoes sobre configuracao, execucao e testes do chatbot.

O historico acompanha a navegacao nesta aba e pode ser apagado em **Nova conversa**.

## 15. Organizacao e manutencao

Consulte [a organizacao do codigo](organizacao.md) para localizar os estilos por pagina, os modulos JavaScript e os comandos de verificacao. Edite o conteudo em `scripts/content_*.py` e gere novamente as paginas com `npm run site:build`.

## 16. Uso de inteligencia artificial no desenvolvimento

A inteligencia artificial foi utilizada como apoio a implementacao e a revisao do site, a partir dos requisitos definidos pela equipe. Esse apoio incluiu sugestoes de HTML, CSS e JavaScript, ajustes de acessibilidade, organizacao dos arquivos, documentacao e preparacao de testes automatizados. A definicao dos requisitos, a avaliacao das sugestoes e a aprovacao da publicacao permanecem sob responsabilidade da equipe.

Os cinco prompts abaixo foram revisados para melhorar a clareza, mantendo a intencao dos pedidos originais. Cada registro apresenta o objetivo solicitado e sua relacao com os recursos desenvolvidos.

### 16.1 Animacao e transicao junto ao seletor de idioma

**Prompt revisado:**

> Estilize o componente ao lado do seletor de idioma e adicione uma animacao com transicao suave. Mantenha a identidade visual do site, a adaptacao a celulares e a navegacao por teclado. Respeite a preferencia de movimento reduzido e evite que a animacao prejudique a leitura ou o uso do seletor.

**Implementacao relacionada:** foram trabalhadas as transicoes da troca de idioma e a interacao do coracao no rodape. O coracao apresenta uma animacao breve ao clicar; com movimento reduzido, o efeito e simplificado. Os estilos ficam em `css/style.css`, e os comportamentos em `js/site.js` e `js/i18n.js`.

### 16.2 Preenchimento e formatacao automatica do telefone

**Prompt revisado:**

> Melhore o campo de telefone para que a escolha do pais preencha seu codigo internacional automaticamente. Permita digitar diretamente o DDD e o numero, sem inserir manualmente parenteses, espacos ou hifen. Aplique a formatacao correspondente ao pais, como +55 (11) 97951-1884 e +1 (323) 941-8796. Revise tambem a edicao, a exclusao de digitos, a troca de pais e a colagem de numeros completos.

**Implementacao relacionada:** o contato recebeu um seletor de paises, codigo internacional e formatacao do numero nacional durante o preenchimento. A validacao considera os padroes de cada regiao, sem aplicar uma unica mascara a todos os paises. A logica esta em `js/phone-input.js`, com bibliotecas locais de numeracao. Veja [a documentacao do telefone](phone-input.md).

### 16.3 Padronizacao do contato e revisao da apresentacao institucional

**Prompt revisado:**

> Substitua os enderecos ficticios usados como contato publico por institutoesperancaunicid@outlook.com. Revise os textos de apresentacao para retirar expressoes desnecessarias que descrevam o Instituto como ficticio ou academico, preservando exatamente o credito  2026 Instituto Esperanca  Projeto academico UNICID. no rodape. Mantenha informacoes verificaveis e nao invente historia, resultados, atendimentos ou dados institucionais.

**Implementacao relacionada:** o endereco institucional foi padronizado nos contatos publicos e no destino previsto para o envio pelo EmailJS. O formulario oferece envio direto e uma alternativa pelo aplicativo de e-mail. O credito academico permanece no rodape. A documentacao tecnica continua registrando o contexto e as limitacoes do projeto; enderecos de exemplo usados em testes nao representam contatos publicos. Veja [a configuracao do envio](emailjs.md).

### 16.4 Legibilidade das caixas e das combinacoes de cores

**Prompt revisado:**

> Revise a mensagem com baixa legibilidade na caixa de destaque amarela e procure problemas semelhantes no restante do site. Ajuste texto, fundo, bordas e estados de interacao para manter a leitura nos temas claro e escuro, na inversao de cores, no alto contraste e nas opcoes para daltonismo. Verifique tambem foco, hover e ampliacao do texto.

**Implementacao relacionada:** a paleta foi centralizada em variaveis compartilhadas, permitindo que texto, fundo e contornos acompanhem as preferencias visuais. A revisao tambem alcancou o botao e o painel do chatbot e as transicoes dos botoes. Foram executadas verificacoes de contraste e layout em 480 combinacoes nas 12 paginas. Os criterios e as limitacoes da auditoria estao em [paleta e acessibilidade](paleta-acessibilidade.md).

### 16.5 Leitura em voz alta e funcionamento no computador

**Prompt revisado:**

> Investigue as falhas da leitura em voz alta, especialmente a selecao de voz feminina e os controles que parecem bloqueados no computador. Revise a descoberta de vozes, a liberacao de audio pelo navegador, a escolha de voz, a velocidade e a leitura ao passar o mouse ou usar o teclado. Faca a voz acompanhar o idioma selecionado e trate a ausencia de vozes ou falhas do servico com orientacoes claras. Teste em diferentes navegadores e tamanhos de tela.

**Implementacao relacionada:** o leitor recebeu selecao de vozes por idioma, preferencia de voz feminina ou masculina quando identificavel, atualizacao da lista, amostra, velocidade e controles de inicio e parada. A leitura anterior e interrompida ao trocar o idioma, e as tentativas de recuperacao usam vozes compativeis. Os controles foram verificados no Chromium, Firefox e WebKit com vozes simuladas em nove idiomas, por meio de `scripts/check_speech_reader.py`.

### 16.6 Revisao e limites do apoio da IA

Os pedidos foram transformados em mudancas de codigo e verificados com analise estatica, testes automatizados e inspecao visual. Os testes de integracao simulam os servicos externos quando indicado, evitando envios de e-mail ou reproducao de audio durante a execucao.

Essas verificacoes ajudam a identificar regressoes, mas nao garantem ausencia de falhas em todos os dispositivos. As vozes disponiveis dependem do navegador e do sistema; o envio real depende da configuracao do EmailJS e da autorizacao da conta de e-mail. A revisao da equipe e os testes com pessoas usuarias continuam necessarios.


## 17. Voz pronta incluida

O leitor agora inclui vozes sintetizadas locais para os nove idiomas, com variantes feminina e masculina. Elas funcionam mesmo sem vozes instaladas no dispositivo e sao identificadas como "Voz pronta do site". O primeiro uso carrega o motor de voz; nao exige chave de API. Consulte [vozes prontas](vozes-prontas.md).


## 18. Explicacao do codigo para apresentacao

Os arquivos principais possuem comentarios por responsabilidade, identificando estrutura, estilos, interacoes, contato, chatbot e leitura em voz alta. Consulte o [roteiro de apresentacao ao professor](roteiro-apresentacao.md) para seguir os fluxos e localizar os arquivos de cada area.
