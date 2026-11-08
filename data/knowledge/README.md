# Documentos consultados pelo agente

A base inicial é gerada com o conteúdo real das 12 páginas do site. O agente pesquisa trechos dessa base para conversar; este diretório permite acrescentar documentos institucionais revisados. Este README não é indexado.

Coloque aqui somente material que você tem autorização para fornecer ao modelo e ao visitante. Não inclua senhas, tokens, documentos pessoais, contatos privados ou informações institucionais não confirmadas. O arquivo `data/knowledge-index.json` é um artefato de conteúdo: não é um cofre de segredos. Arquivos ocultos e formatos não listados abaixo são ignorados; links simbólicos e possíveis credenciais reconhecíveis são recusados.

Após alterar páginas ou documentos, execute:

```sh
python scripts/build_chat_knowledge.py
python scripts/build_chat_knowledge.py --check
```

O primeiro comando atualiza o índice; o segundo verifica se ele corresponde às fontes atuais sem escrever arquivos. A versão é um SHA-256 do conteúdo, sem datas aleatórias. O gerador usa apenas bibliotecas padrão do Python e não envia dados à internet. Cada arquivo adicional pode ter até 2 MB.

## Formatos aceitos

- **TXT:** texto UTF-8; o nome do arquivo vira o título da fonte.
- **Markdown:** texto UTF-8; o primeiro `# Título` é usado como título. Opcionalmente, um cabeçalho entre linhas `---` pode declarar `title:` e `url:`. Outros metadados não são usados.
- **JSON:** um objeto `{"title":"Título confirmado","text":"Conteúdo revisado","url":null}`, uma lista desses objetos ou `{"documents":[...]}`. `title` e `text` são obrigatórios.
- **CSV:** cabeçalhos `title,text,url`; cada linha é um documento. `title` e `text` são obrigatórios. Use aspas para campos com vírgulas ou quebras de linha.

`url` é opcional. Sem uma URL, o chat pode mostrar o título da fonte sem link. Quando existir, use uma URL HTTPS pública ou uma página existente do site, por exemplo `projetos.html#educacao`. A URL serve apenas como referência; o gerador não baixa seu conteúdo. O texto deve estar no próprio documento. Não adicione exemplos fictícios ao diretório, pois eles entrariam na base real.

O índice preserva títulos, trechos, origem e links. A busca local usa termos normalizados e ranking BM25 com um pequeno vocabulário de equivalências em português. O modelo pode reformular a busca usando o contexto da conversa. Essa busca não exige embeddings, banco vetorial, provedor específico ou respostas prontas.
