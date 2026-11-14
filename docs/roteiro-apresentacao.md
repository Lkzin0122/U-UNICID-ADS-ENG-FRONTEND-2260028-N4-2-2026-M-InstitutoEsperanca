# Roteiro para explicar o projeto

Este roteiro acompanha os comentários adicionados aos arquivos. A apresentação
pode começar pelas páginas e avançar até as integrações de contato, IA e voz.

## 1. Estrutura da página: HTML

Abra `index.html` e mostre os comentários que identificam metadados, cabeçalho,
conteúdo principal e rodapé. Explique que `header`, `nav`, `main` e `footer`
organizam o documento por significado, ajudando a navegação e a acessibilidade.
O link de pular para o conteúdo e os rótulos dos campos também fazem parte disso.

**Como explicar:** “O HTML apresenta o conteúdo e define a função de cada área.”

Os HTMLs são gerados por `scripts/build_site.py`. Para editar o conteúdo,
use `scripts/content_*.py`; para editar menu e rodapé, use `scripts/site_layout.py`.
O Python é usado na preparação dos arquivos. O visitante recebe HTML estático.

## 2. Aparência e adaptação: CSS

| Arquivo | O que mostrar |
| --- | --- |
| `css/style.css` | Estrutura comum, navegação, botões e rodapé. |
| `css/index.css` | Composição específica da página inicial. |
| `css/contato.css` e demais folhas de página | Estilos próprios de cada área. |
| `css/palette.css` | Variáveis de cores, temas e opções de acessibilidade. |
| `css/components/accordion.css` | Componente reutilizado pela FAQ e pela mídia. |
| `css/chatbot.css` e `css/speech-reader.css` | Painéis do assistente e do leitor. |

**Como explicar:** “A base evita repetição. Cada página tem seus ajustes, e a
paleta atualiza as cores de vários componentes ao mesmo tempo.”

Mostre uma regra `@media` e reduza a janela para demonstrar responsividade.
Troque o tema e o contraste para explicar a diferença entre layout e cores.

## 3. Interações: JavaScript no navegador

Em `js/site.js`, mostre os blocos de menu, filtros, galeria e coração do rodapé.
Cada evento, como um clique, chama o comportamento correspondente.
Em `js/accessibility.js`, mostre como classes e variáveis CSS aplicam as
preferências. Em `js/i18n.js`, mostre os pacotes de tradução e o aviso aos
outros módulos quando o idioma muda.

**Como explicar:** “O JavaScript responde às ações da pessoa. A organização em
módulos separa as responsabilidades e facilita localizar cada comportamento.”

## 4. Contato e validação

Em `js/contact.js`, siga os comentários de rascunho, validação e envio.
`js/phone-input.js` usa dados de numeração para interpretar país, DDD e número.
`js/contact-service.js` compartilha a validação do e-mail e o envio pelo EmailJS
com o formulário do chatbot.

**Como explicar:** “Os campos são conferidos antes do envio. Durante a espera,
o formulário bloqueia duplicatas. O texto só é apagado após uma resposta de
sucesso do serviço.”

Demonstre um e-mail incompleto, como `nome@gmail`. A validação verifica o
formato; não comprova a existência do endereço. Para demonstrar um envio real,
a conta de e-mail e o template precisam estar funcionando. A aceitação pela
API não comprova, sozinha, o recebimento na caixa de entrada.

## 5. Chatbot e servidor

O fluxo de uma pergunta é:

1. `js/chatbot.js` envia a pergunta, o histórico limitado e o contexto da página.
2. `api/chat.js` confere a requisição, a origem e os limites de uso.
3. `server/agent.cjs` pede ao modelo consultas para pesquisar o conteúdo.
4. `server/knowledge.cjs` classifica os trechos da base por relevância.
5. `server/model.cjs` faz a comunicação com o provedor configurado.
6. O agente valida os IDs das referências e devolve a resposta à interface.

**Como explicar:** “A IA recebe trechos do conteúdo do projeto para fundamentar
a resposta. Os links apresentados vêm da base, e as ações sugeridas precisam
existir no catálogo permitido.”

Mostre `js/chat-actions.js`: abrir páginas ou mudar o tema também funciona por
pedidos diretos reconhecidos no navegador. Esses comandos não precisam esperar
uma resposta da IA. Os dados preenchidos no contato integrado ficam separados
do histórico enviado ao modelo.

## 6. Leitura em voz alta

`js/speech-reader.js` controla os textos lidos, a seleção de voz, a fila e a parada.
`js/speech-engine.js` encaminha a leitura para uma voz nativa ou incluída no site.
`js/speech-worker.js` gera o áudio local em segundo plano, sem bloquear a interface.

**Como explicar:** “O leitor acompanha o idioma escolhido, permite ajustar a
velocidade e interrompe o áudio anterior quando a pessoa muda de trecho.”

Demonstre a amostra de voz, a leitura por mouse ou Tab e a tecla Esc.
A voz incluída carrega seus dados no primeiro uso e exige suporte do navegador
às tecnologias de áudio utilizadas.

## 7. Organização e verificação

Os comentários marcam responsabilidades e decisões importantes. As bibliotecas
de terceiros ficam em `assets/vendor/`, com suas licenças, e os testes em `scripts/`.
Prettier e Ruff padronizam a apresentação do código e ajudam a detectar problemas.

- `npm run site:build`: gera as páginas e atualiza a base do chat.
- `npm run verify`: executa as verificações de formatação, Python, estrutura,
  base de conhecimento e testes Node, com as dependências de desenvolvimento instaladas.
- `npm run test:chat-ui` e `npm run test:speech`: verificam os fluxos no navegador,
  com Playwright disponível.

Apresente os resultados como verificações realizadas em cenários definidos.
Eles ajudam a encontrar regressões e complementam a revisão visual e os testes
com pessoas usuárias; não representam garantia de ausência de bugs.
