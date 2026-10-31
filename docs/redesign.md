# Redesign do Instituto Esperança

Atualização de **24 de outubro de 2026**. O projeto mantém a proposta institucional, a marca e a paleta azul e amarela, com novas composições, navegação organizada e conteúdo para as páginas que faltavam.

## Estrutura de navegação

O site tem **12 páginas HTML**. As dez páginas previstas no escopo foram preservadas, com duas páginas adicionais para participação e perguntas frequentes.

| Página | Arquivo | Papel na navegação |
| --- | --- | --- |
| Início | `index.html` | Apresentar a proposta e os caminhos de participação. |
| O Instituto | `sobre.html` | Apresentar missão, valores e áreas da proposta institucional. |
| Projetos | `projetos.html` | Explorar iniciativas propostas por tema. |
| Impacto e transparência | `impacto.html` | Explicar os indicadores previstos e os limites dos dados disponíveis. |
| Acessibilidade | `acessibilidade.html` | Ajustar a leitura e conhecer os recursos de navegação. |
| Galeria | `galeria.html` | Ver imagens ilustrativas com contexto e créditos. |
| Mídia | `midia.html` | Acessar vídeo, áudio e conteúdo incorporado com alternativas textuais. |
| Notícias e leituras | `noticias.html` | Explorar referências oficiais de educação, inclusão e meio ambiente. |
| Contato | `contato.html` | Enviar uma mensagem pelo EmailJS, após configurar a conta. |
| Orçamento do site | `orcamento_hospedagem.html` | Comparar hospedagem e domínio com fontes e preços consultados. |
| Como participar | `participar.html` | Conhecer caminhos de voluntariado, apoio e parceria. |
| Perguntas frequentes | `perguntas-frequentes.html` | Encontrar respostas sobre a proposta e o uso do site. |

O menu principal agrupa páginas em **O Instituto**, **Conteúdos** e **Participe**, além dos acessos diretos a Início, Projetos e Contato. O rodapé também oferece links para todas as páginas.

## Como abrir

Para uma visualização rápida, abra `index.html` no navegador. Os arquivos principais são estáticos e não precisam de instalação de pacotes.

Para uma prévia local por HTTP, abra um terminal na pasta do projeto e execute:

```powershell
python -m http.server 8080
```

Depois acesse [http://localhost:8080](http://localhost:8080). Encerre o servidor com `Ctrl+C` quando terminar. Python serve apenas como ferramenta de prévia; ele não faz parte da execução do site publicado.

## Como editar e regenerar

O conteúdo é mantido em módulos Python para evitar divergências entre cabeçalhos, menus e rodapés. Os arquivos HTML gerados continuam legíveis e independentes de Python.

| Arquivo de origem | O que editar |
| --- | --- |
| `scripts/build_site.py` | Navegação, cabeçalho, rodapé, estrutura HTML comum, página inicial e contato. |
| `scripts/content_community.py` | Sobre, projetos, impacto, participação e perguntas frequentes. |
| `scripts/content_resources.py` | Notícias, orçamento e acessibilidade. |
| `scripts/content_media.py` | Galeria e mídia. |
| `css/style.css` | Cores, tipografia, componentes, responsividade e apresentação. |
| `js/site.js` | Menu móvel, filtros, ampliação de imagens, preferências de leitura e envio de contato pelo EmailJS. |
| `js/emailjs-config.js` | Service ID, Template ID e Public Key da conta EmailJS. Veja [a configuração](emailjs.md). |
| `js/i18n.js` e `js/locales/` | Traduções locais da interface e do conteúdo em português, inglês, chinês simplificado, alemão, francês, espanhol latino-americano, russo, japonês e hindi. O idioma selecionado fica salvo no navegador. |
| `js/i18n-frame.js` | Sincroniza o idioma da apresentação incorporada na página de mídia. |
| `js/phone-input.js` | Controle de telefone: limites por país, edição, formatação, validação e acessibilidade. Veja [a documentação](phone-input.md). |
| `assets/vendor/intl-tel-input/` | Seletor de país, bandeiras e busca local. |
| `assets/vendor/libphonenumber-js/` | Metadados completos de numeração, validação precisa, formatos e limites gerados para os telefones. |
| `img/` e `assets/` | Imagens e arquivos multimídia. |

Após mudar o conteúdo ou a estrutura comum, execute na raiz:

```powershell
python scripts/build_site.py
```

O comando reescreve as 12 páginas HTML com o conteúdo dos módulos. **Alterações feitas apenas nos HTMLs gerados serão substituídas na próxima geração.** Para manter uma alteração, faça-a também no arquivo de origem correspondente. Mudanças no CSS e no JavaScript não exigem regenerar o HTML.

O estilo ativo é `css/style.css`. Os caminhos antigos de CSS foram mantidos como arquivos de compatibilidade que apontam para esse estilo; novos ajustes devem ser feitos no arquivo central.

## Comportamentos e limites

O JavaScript adiciona interações ao HTML estático. Conteúdo, links e perguntas em elementos `details` continuam disponíveis sem JavaScript; os filtros e a ampliação de imagens são melhorias de interação.

As preferências de tamanho de texto e contraste usam `localStorage` quando ele está disponível. Não é necessário cadastro. O navegador pode limitar a persistência ao abrir diretamente arquivos locais ou em modos de navegação privada.

A troca de idioma usa os pacotes estáticos de `js/locales/`; a navegação do site não depende de um serviço de tradução externo. Alterações no texto de origem devem ser acompanhadas das respectivas traduções nesses pacotes.

O formulário de contato usa validação nativa do navegador e a API REST do EmailJS para enviar mensagens diretamente ao Instituto. O envio depende de JavaScript e dos três identificadores públicos configurados em `js/emailjs-config.js`. Exibe confirmação somente após uma resposta de sucesso do serviço; em caso de erro, mantém os campos e oferece envio pelo aplicativo de e-mail. Veja [a ativação e o template](emailjs.md).

Não há backend próprio, banco de dados, área administrativa nem cobrança de doações. As mensagens de contato são processadas pelo EmailJS e pelo provedor de e-mail conectado. A coleta de inscrições e o armazenamento próprio de dados exigem uma solução adicional.

As iniciativas são propostas acadêmicas. Não foram inventados números de atendimento, depoimentos, resultados institucionais ou disponibilidade de vagas. As imagens são ilustrativas e têm créditos documentados em [Créditos de mídia](creditos-midia.md). Os valores de hospedagem e domínio estão em [Orçamento comparativo](orcamento-comparativo.md).

## Cópia da versão anterior

`docs/versao-anterior.zip` contém os cinco HTMLs e os estilos CSS que existiam antes da reformulação. Para comparar, extraia o ZIP em outra pasta e consulte os arquivos. Ele preserva a versão anterior desses arquivos; não é uma cópia completa de todos os recursos do projeto.

## Verificação do HTML

O [Nu Html Checker da W3C](https://validator.w3.org/nu/) permite validar um arquivo pelo navegador. Sua [documentação da interface HTTP](https://github.com/validator/validator/wiki/Service-%C2%BB-HTTP-interface) também descreve o envio do HTML por `POST` com retorno em JSON, sem cadastro.

Exemplo de requisição: `POST https://validator.w3.org/nu/?out=json`, com o documento no corpo e o cabeçalho `Content-Type: text/html; charset=utf-8`. Esse procedimento envia o conteúdo HTML ao serviço externo; não é necessário publicar o site previamente.

Execute a validação sobre os arquivos gerados após mudanças. A validação de marcação complementa a revisão de navegação, teclado, responsividade e mídia; ela não certifica acessibilidade. Este documento descreve a manutenção e não substitui um relatório dos testes efetivamente realizados.
