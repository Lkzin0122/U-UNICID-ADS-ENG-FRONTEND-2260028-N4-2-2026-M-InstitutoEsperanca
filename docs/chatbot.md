# Agente conversacional Esperança

Na Vercel, o chatbot usa o AI Gateway com Google Gemini 2.5 Flash Lite. Localmente, pode usar o modelo no Ollama. O agente interpreta a pergunta com o histórico, pesquisa a base do projeto e gera uma resposta com as fontes consultadas. A base inicial contém 12 documentos e 185 trechos extraídos do conteúdo publicado. Não há resposta de FAQ substituindo a IA: quando o modelo está indisponível, o chat informa o erro e permite tentar novamente.

## Executar

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
- `server/model.cjs`: conexão com o AI Gateway em produção e com o Ollama local.
- `server/knowledge.cjs`: consulta dos trechos indexados.
- `scripts/build_chat_knowledge.py`: extração e atualização da base.
- `api/chat.js`: validação da requisição, histórico, limites e cancelamento.
- `js/chatbot.js`: interface, histórico nesta aba, fontes e repetição de consultas que falharam.

## Histórico e limites

A interface mantém até 20 mensagens na sessionStorage da aba. A conversa acompanha a navegação entre as páginas do site. “Nova conversa” apaga o histórico e cancela uma consulta pendente. Apenas perguntas com respostas concluídas entram no histórico enviado ao agente. Em erro, a pergunta é preservada e pode ser repetida sem criar mensagens duplicadas.

Cada pergunta pode ter até 1.000 caracteres. A API aceita as últimas 12 mensagens, e o agente limita o contexto para caber na memória do modelo. As mensagens são enviadas ao servidor do chat e ao provedor de IA configurado. Na Vercel, os trechos recuperados e o histórico usado na resposta seguem para o AI Gateway e o modelo hospedado. A aplicação não grava conversas em banco de dados ou logs próprios. Não envie dados sensíveis.

O servidor atende uma geração por vez localmente e até quatro na Vercel, com limites por processo. Os limites não são distribuídos entre servidores. Se o Ollama estiver fechado, o modelo faltar ou a resposta exceder o tempo, o chat mostra uma falha explícita.

## Site publicado na Vercel

Em produção, a configuração padrão é:

- Provedor: Vercel AI Gateway.
- Modelo: `google/gemini-2.5-flash-lite`.
- Autenticação: token OIDC da execução na Vercel; alternativamente, `AI_GATEWAY_API_KEY` nas variáveis de ambiente do servidor.
- Timeout total: 45 segundos.

O acesso à IA depende da habilitação e da cota do AI Gateway da conta. Na configuração desta conta, o provedor exigiu a verificação de um cartão válido para liberar os créditos e retornou `customer_verification_required` antes de gerar respostas. Essa verificação deve ser concluída no painel da Vercel pela pessoa responsável. O código não altera cobrança ou compra automática de créditos. Nunca coloque credenciais no JavaScript do navegador.

As variáveis opcionais são `AI_PROVIDER=vercel`, `AI_MODEL`, `AI_GATEWAY_API_KEY` e `AI_TIMEOUT_MS`. Depois de alterar variáveis na Vercel, publique uma nova versão. Não configure `OLLAMA_BASE_URL=http://localhost:11434` para o site público: esse endereço representa a máquina da hospedagem, não o computador onde o Ollama foi instalado.

O comando `npm run build` copia somente páginas e recursos públicos para `public/`. A Vercel publica também a função Node.js `api/chat.js`; a base e as regras entram no pacote privado da função. Código do servidor, documentos e segredos ficam fora da pasta estática. A pasta gerada é ignorada pelo Git. O `vercel.json` declara o comando e a pasta de saída, evitando uma publicação contendo apenas HTML antigo.

Para conferir a versão publicada, envie um POST JSON para `https://institutoesperanca.vercel.app/api/chat` com `{"message":"Quais são os projetos?"}`. Uma resposta 404 indica que a API não entrou na publicação; erros de autenticação ou cota são retornados como mensagens próprias. Um GET nessa rota retorna 405, pois perguntas usam POST.

## Verificação

- `npm test`: testes do agente, recuperação, citações, contexto, validação da API, limites e servidor HTTP. O modelo é simulado nestes testes.
- `npm run ai:check`: verifica a conexão com o Ollama e a presença do modelo.
- `npm run ai:test`: conversa com o modelo real em três turnos, conferindo educação, continuação contextual e informação sobre Pix.
- `python scripts/check_site.py`: auditoria das 12 páginas.
- `python scripts/check_chat_browser.py`: cenários da interface no Chromium instalado, com respostas da API simuladas. O relatório em `docs/chatbot-checks.json` e a captura em `docs/screenshots/chatbot-390.png` correspondem à interface atual.

Na verificação local de 08/11/2026 passaram os 24 testes automatizados, as 39 verificações da interface no navegador e a auditoria das 12 páginas, sem ocorrências. A conversa com o modelo real validou três turnos: interesse em leitura, continuação sobre participação e consulta sobre Pix. As chamadas reais usaram o Qwen3 1.7B instalado no Ollama deste computador.

Na adaptação para a Vercel, passaram 34 testes automatizados, incluindo o transporte para o Gateway com respostas simuladas, autenticação OIDC, tratamento de cota e a separação dos arquivos públicos.

Os testes automáticos reduzem erros de integração; não garantem que o modelo nunca erre. A interface oferece fontes para conferir as informações.

Referências: [autenticação do AI Gateway](https://vercel.com/docs/ai-gateway/authentication-and-byok), [saídas estruturadas do Gateway](https://vercel.com/docs/ai-gateway/sdks-and-apis/openai-chat-completions/structured-outputs), [API e instalação no Windows](https://docs.ollama.com/windows), [saídas estruturadas](https://docs.ollama.com/capabilities/structured-outputs) e [modelo Qwen3 1.7B](https://ollama.com/library/qwen3:1.7b).
