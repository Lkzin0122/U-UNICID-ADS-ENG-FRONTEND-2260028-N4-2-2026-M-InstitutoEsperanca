# Agente conversacional Esperança

Na Vercel, o chatbot usa o Groq com o modelo Qwen 3.8 27B. Localmente, pode usar o modelo no Ollama. O agente interpreta a pergunta com o histórico, pesquisa a base do projeto e gera uma resposta com as fontes consultadas. A base inicial contém 12 documentos e 185 trechos extraídos do conteúdo publicado. Não há resposta de FAQ substituindo a IA: quando o modelo está indisponível, o chat informa o erro e permite tentar novamente.

## Executar localmente com Ollama

Requisitos: Node.js 22 ou superior, Python 3 para atualizar a base e Ollama.

1. Instale o [Ollama para Windows](https://docs.ollama.com/windows).
2. Baixe o modelo: `ollama pull qwen3:1.7b`.
3. Mantenha o Ollama aberto. Se ele não iniciar automaticamente, execute `ollama serve`.
4. Execute `npm run ai:check` para conferir modelo e base.
5. Execute `npm run dev` e abra `http://127.0.0.1:3000`.

O modelo Qwen3 1.7B já foi instalado neste computador durante a implementação. A configuração padrão funciona sem chave de API e sem criar um arquivo de ambiente. Para personalizar, copie `.env.example` para `.env` e ajuste:

- `OLLAMA_BASE_URL`: padrão `http://127.0.0.1:11434`.
- `OLLAMA_MODEL`: padrão `qwen3:1.7b`.
- `OLLAMA_TIMEOUT_MS`: padrão `120000`; a primeira resposta pode demorar enquanto o modelo é carregado.
- `PORT`: porta do site, padrão `3000`.

Não é necessário instalar pacotes npm: o servidor e o agente usam as bibliotecas nativas do Node.js.

## Como a conversa consulta os dados

1. O modelo transforma a pergunta e o histórico em até três consultas de busca. Isso permite entender uma continuação como “como participo dessa frente?” depois de falar sobre educação.
2. O servidor pesquisa os trechos indexados, usando normalização em português e ranking BM25.
3. Até seis trechos relevantes são enviados ao modelo como referências.
4. O modelo escreve a resposta, e o servidor aceita citações somente dos trechos recuperados. Os links vêm do índice; não são inventados pelo modelo.

Esse fluxo é recuperação de informação com geração de resposta (RAG). A busca não usa embeddings nem um banco vetorial. A resposta é gerada pelo modelo; não é escolhida de uma lista de textos prontos. As regras de conteúdo institucional orientam a conversa, incluindo a obrigação de tratar o Instituto como proposta acadêmica e reconhecer informações ausentes.

## Atualizar a massa de dados

O arquivo `data/knowledge-index.json` reúne títulos, textos, fontes e a versão do conteúdo. Para atualizar:

```sh
npm run knowledge:build
npm run knowledge:check
```

O gerador `python scripts/build_site.py` também atualiza a base depois de gerar as páginas. Documentos institucionais adicionais podem ser colocados em `data/knowledge/`, nos formatos Markdown, TXT, JSON e CSV. Consulte [os formatos e critérios](../data/knowledge/README.md). O gerador não baixa páginas externas nem lê arquivos fora das fontes declaradas.

Arquivos principais:

- `server/agent.cjs`: planejamento das buscas e geração da resposta.
- `server/model.cjs`: conexão com o Groq em produção e com o Ollama local.
- `server/knowledge.cjs`: consulta dos trechos indexados.
- `scripts/build_chat_knowledge.py`: extração e atualização da base.
- `api/chat.js`: validação da requisição, histórico, limites e cancelamento.
- `js/chatbot.js`: interface, histórico nesta aba, fontes e repetição de consultas que falharam.

## Interface do chat

O painel tem cabeçalho com identidade da Esperança, ações para reiniciar e fechar, e uma tela de boas-vindas com sugestões. Ao começar uma conversa, a abertura dá lugar às mensagens, com balões distintos para visitante e assistente e links para conferir as fontes. O campo de mensagem cresce com o texto e mantém o envio por Enter e a quebra de linha por Shift + Enter.

No celular, o painel ocupa a área disponível e acompanha o teclado. O visual usa as cores do site, com temas claro, escuro e de alto contraste e respeito à preferência de movimento reduzido. O redesign passou nas 48 verificações da interface, incluindo ampliação de texto a 200%, foco, sugestões, navegação e seis tamanhos de tela. As capturas de referência ficam em `docs/screenshots/chatbot-*.png`.

## Ações integradas ao site

A barra do chat permite enviar contato, escolher entre os nove idiomas, abrir
as 12 páginas e ajustar tema, contraste e tamanho de texto. Pedidos diretos,
como “abra projetos”, “mude o idioma para hindi” e “ativar alto contraste”,
funcionam no navegador mesmo sem a IA. O chat acompanha a navegação na mesma
aba. As opções visuais usam a mesma configuração e persistência dos controles
da página de acessibilidade.

As perguntas enviadas à API incluem somente o idioma e o nome de uma página
conhecida como contexto adicional. O agente responde no idioma selecionado e
pode sugerir até três ações por seus IDs no catálogo `js/chat-actions.js`.
O servidor e a interface rejeitam IDs desconhecidos. As sugestões são botões:
renderizar ou restaurar uma resposta nunca executa uma ação automaticamente.

“Enviar contato” abre um formulário dentro do painel, com nome, e-mail,
assunto e mensagem. O botão “Enviar ao Instituto” faz o envio pelo EmailJS;
os campos desse formulário não entram no histórico nem nas requisições à IA.
Um rascunho fica somente na sessão da aba e é apagado após sucesso ou ao iniciar
nova conversa. Erros e timeout preservam o texto e oferecem o aplicativo de
e-mail. Não há repetição automática de envios. A conta de e-mail conectada
precisa estar ativa e autorizada a enviar.

O botão flutuante usa superfície e contorno que permanecem visíveis sobre o
rodapé azul. Cabeçalho, balões, campos e ações seguem a paleta compartilhada,
incluindo temas, daltonismo, inversão, alto contraste e cores do sistema.

Para validar sem enviar e-mails reais ou consultar provedores de IA:

```sh
uv run --with playwright python scripts/check_chat_actions.py --browser all
```

O teste verifica ações locais, sugestões da IA simulada, idioma, navegação,
privacidade dos campos de contato, falha, sucesso, bloqueio de duplicatas,
timeout, e-mail incompleto, contraste, posição com filtros, celular e zoom.

## Histórico e limites

A interface mantém até 20 mensagens na sessionStorage da aba. A conversa acompanha a navegação entre as páginas do site. “Nova conversa” apaga o histórico e cancela uma consulta pendente. Apenas perguntas com respostas concluídas entram no histórico enviado ao agente. Em erro, a pergunta é preservada e pode ser repetida sem criar mensagens duplicadas.

Cada pergunta pode ter até 1.000 caracteres. A API aceita as últimas 12 mensagens, e o agente limita o contexto para caber na memória do modelo. As mensagens são enviadas ao servidor do chat e ao provedor de IA configurado. Na Vercel, os trechos recuperados e o histórico usado na resposta seguem para o Groq e o modelo hospedado. A aplicação não grava conversas em banco de dados ou logs próprios. Não envie dados sensíveis.

O servidor atende uma geração por vez localmente e até quatro na Vercel, com limites por processo. Os limites não são distribuídos entre servidores. Se o Ollama estiver fechado, o modelo faltar ou a resposta exceder o tempo, o chat mostra uma falha explícita.

## Site publicado na Vercel

A configuração de produção usa o Groq diretamente:

- `AI_PROVIDER=groq`.
- `GROQ_API_KEY`: chave da conta Groq, salva como Secret nas variáveis de Production da Vercel.
- `GROQ_MODEL=qwen/qwen3.8-27b`: modelo padrão, com saída estruturada.
- `AI_TIMEOUT_MS=45000`: timeout total padrão.

Crie uma chave em [Groq API Keys](https://console.groq.com/keys), mantendo a conta no plano gratuito, e cadastre-a nas [variáveis do projeto](https://vercel.com/lucas-bitencourts-projects/institutoesperanca/settings/environment-variables). Depois publique novamente. Não cole a chave no chat nem a coloque no HTML ou em arquivos de `js/`.

O plano gratuito tem cotas de requisições e tokens. Quando o provedor retorna 429, a API informa uma espera temporária e o chat permite repetir a pergunta. O código não faz upgrade de plano, não ativa cobrança e não usa créditos do AI Gateway para essa configuração.

Para testar o Groq no computador, copie `.env.example` para `.env` e configure `AI_PROVIDER=groq`, `GROQ_API_KEY` e, opcionalmente, `GROQ_MODEL`. Execute `npm run ai:check` e depois `npm run ai:test`. Esses arquivos são ignorados pelo Git.

O comando `npm run build` copia somente páginas e recursos públicos para `public/`. A Vercel publica também a função Node.js `api/chat.js`; a base e as regras entram no pacote privado da função. Código do servidor, documentos e segredos ficam fora da pasta estática. O `vercel.json` declara o comando e a pasta de saída.

Para conferir a versão publicada, envie um POST JSON para `https://institutoesperanca.vercel.app/api/chat` com `{"message":"Quais são os projetos?"}`. Uma resposta 404 indica que a API não entrou na publicação. Erros de autenticação ou cota são retornados como mensagens próprias. Um GET nessa rota retorna 405, pois perguntas usam POST.

## Verificação

- `npm test`: testes do agente, recuperação, citações, contexto, validação da API, limites e servidor HTTP. O modelo é simulado nestes testes.
- `npm run ai:check`: verifica o catálogo do provedor configurado, a presença do modelo e a base de conhecimento. Não comprova disponibilidade de cota para gerar respostas.
- `npm run ai:test`: conversa com o modelo real em três turnos, conferindo educação, continuação contextual e informação sobre Pix.
- `python scripts/check_site.py`: auditoria das 12 páginas.
- `python scripts/check_chat_browser.py`: cenários da interface no Chromium instalado, com respostas da API simuladas. O relatório em `docs/chatbot-checks.json` e a captura em `docs/screenshots/chatbot-390.png` correspondem à interface atual.

Na verificação local de 08/11/2026 passaram os 24 testes automatizados, as 39 verificações da interface no navegador e a auditoria das 12 páginas, sem ocorrências. A conversa com o modelo real validou três turnos: interesse em leitura, continuação sobre participação e consulta sobre Pix. As chamadas reais usaram o Qwen3 1.7B instalado no Ollama deste computador.

Na adaptação para o Groq, passaram 38 testes automatizados, incluindo transporte com respostas simuladas, isolamento de credenciais, tratamento de limites do plano gratuito e a separação dos arquivos públicos. A geração real em produção depende da chave cadastrada na Vercel.

Os testes automáticos reduzem erros de integração; não garantem que o modelo nunca erre. A interface oferece fontes para conferir as informações.

Referências: [plano gratuito e cobrança do Groq](https://console.groq.com/docs/billing-faqs), [limites do Groq](https://console.groq.com/docs/rate-limits), [saídas estruturadas](https://console.groq.com/docs/structured-outputs), [API e instalação do Ollama no Windows](https://docs.ollama.com/windows).
