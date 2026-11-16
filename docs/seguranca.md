# Chaves e publicação

## Revisão de 16/11/2026

Foram examinados os arquivos atuais, os dois ZIPs existentes na entrega, as 36
revisões alcançáveis do Git, a API, a publicação estática e o armazenamento no
navegador. O Gitleaks 8.30.1 foi executado com valores ocultos, decodificação e
inspeção de arquivos compactados. Uma busca complementar confirmou o token
Context7 em `.cursor/mcp.json` em 10 commits antigos. O primeiro é
`3c4e6f7e05096b80791ca009bc488baa5847a937`.

**Não foram encontrados segredos privados nos arquivos atuais nem nos ZIPs
inspecionados. A chave do histórico continua sendo uma exposição real até ser
revogada pelo responsável.** Não foi usado o token para testar se ainda funciona.
As chaves de Groq/AI Gateway são lidas do ambiente do servidor; os valores não
estão no código auditado. A Public Key do EmailJS é um identificador público,
conforme explicado abaixo.

### Dependências e CVEs

O `npm audit` não encontrou alertas no lockfile. A consulta ao OSV também não
retornou alertas para Prettier 3.6.2, Ruff 0.14.4, intl-tel-input 29.5.10,
libphonenumber-js 1.13.15 e o novo pacote de voz 0.3.5.

Essa consulta sozinha não detectava o risco do sintetizador anterior: o pacote
`espeak-ng` 1.0.2 incluía um binário `1.52-dev`, publicado em 24/11/2023, anterior
à correção upstream de 17/12/2023 para **CVE-2023-49990, CVE-2023-49991,
CVE-2023-49992, CVE-2023-49993 e CVE-2023-49994**. Foi substituído pelo port
`@echogarden/espeak-ng-emscripten` 0.3.5, cujo fork incorpora essas correções.
O texto continua sendo processado localmente em um Worker. Os relatos de execução
arbitrária em builds nativos não comprovam execução no sistema operacional via
este WebAssembly; a exploração específica do binário antigo não foi reproduzida.
Os cinco vetores de regressão publicados no commit de correção foram processados
pelo motor atualizado sem travamento, em processo local com limite de tempo.

Referências: [correção upstream](https://github.com/espeak-ng/espeak-ng/commit/58f1e0b6a4e6aa55621c6f01118994d01fd6f68c),
[aviso de segurança](https://ubuntu.com/security/notices/USN-6858-1) e
[distribuição atual](https://github.com/echogarden-project/espeak-ng-emscripten).

### Correções no projeto

- CSP restringindo scripts, conexões e frames; bloqueio de objetos e de base URL
  injetada; proteção contra enquadramento por outros sites, MIME incorreto e
  envio desnecessário de referência.
- Validação da origem completa na API, incluindo protocolo, e rejeição de
  requisições marcadas como `cross-site`. O servidor local também valida `Host`.
- Requisições ao provedor de IA recusam redirecionamentos.
- Publicação e servidor local permitem apenas tipos de arquivo públicos;
  credenciais, arquivos ocultos, backups e links simbólicos são bloqueados.
- Rascunhos de contato usam somente `sessionStorage`; cópias persistentes antigas
  são apagadas ao abrir o formulário. Envio confirmado apaga o rascunho da sessão.
- Síntese de voz atualizada, com limites de texto, velocidade, duração e espera.
- Regras adicionais de exclusão de segredos e CI com Gitleaks, npm audit e OSV.

O ZIP de entrega antigo foi retirado dos arquivos atuais por incluir o componente
de voz anterior. Gere entregas a partir do código atualizado. Revisões históricas
e cópias já baixadas não são alteradas por estas correções.

### Pendências antes de divulgar

1. **Revogar e substituir a chave antiga do Context7.** Isso exige acesso ao painel
   da conta. Alterar o arquivo ou apagar o histórico não revoga uma chave.
2. Se for necessário eliminar também o valor visível nos commits, limpar uma
   cópia do histórico com `git-filter-repo` e coordenar a substituição das branches,
   tags, forks e caches no GitHub. Esta revisão não reescreveu o histórico compartilhado.
   Siga o [procedimento do GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).
3. Publicar as alterações e verificar os cabeçalhos no domínio. Na consulta HTTP
   desta revisão, o site publicado ainda não tinha os novos cabeçalhos. `.env`,
   `.cursor/mcp.json`, código do servidor e ZIPs retornaram 404; `/api/chat.js`
   retornou 405, sem entregar código-fonte.
4. Conferir no EmailJS as origens permitidas, destinatário fixo e proteção contra
   automação. O painel não foi acessado nesta revisão; sua configuração não pode
   ser comprovada pelos arquivos locais.
5. Aplicar limite persistente no [Vercel Firewall](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
   para `/api/chat`, por exemplo 12 requisições por minuto por IP, e definir cotas
   no provedor de IA. O limite no código é por instância e reinicia com ela;
   `Origin`/CORS não são autenticação e não impedem clientes automatizados.

### Repetir as verificações

```sh
gitleaks dir . --config .gitleaks.toml --redact=100 --max-archive-depth=3 --max-decode-depth=3
gitleaks git . --log-opts=--all --config .gitleaks.toml --redact=100
npm run security:dependencies
npm run verify
python -B scripts/check_contact_storage.py
npm run test:security-browser
```

A checagem do histórico continuará acusando a chave antiga enquanto ele não for
reescrito. O workflow `.github/workflows/security.yml` verifica os arquivos
atuais, incluindo ZIPs, a cada push/PR e semanalmente; não certifica o histórico
nem comprova a revogação. Ausência de alertas é o resultado dessas ferramentas e
fontes na data da consulta, não uma garantia de ausência de outras falhas.

Resultado da validação local: `npm run verify` passou (formatação, lint, 12
páginas, índice de conhecimento e 42 testes); os 10 testes de armazenamento e
os 26 testes de CSP/síntese também passaram. As 18 combinações de idioma e voz
geraram áudio não silencioso. A varredura final dos arquivos atuais e dos dois
blobs ZIP históricos não encontrou segredos privados. A publicação e as
configurações dos painéis continuam sendo etapas separadas.

### Segunda revisão de 16/11/2026

A CSP passou a bloquear também blocos `<style>`, atributos `style` e eventos
inline. A permissão `unsafe-inline` foi removida. O único estilo HTML inline
existente, na ferramenta de produção do vídeo, foi movido para o CSS. Estilos
dinâmicos aplicados pelo JavaScript continuam funcionando e foram verificados
no navegador, junto com o formulário e seus nove idiomas.

A API agora mede o tamanho em bytes da string JSON antes de interpretá-la,
inclusive sem `Content-Length`. JSON inválido acima de 96 KiB recebe 413 sem
ser interpretado. Tentativas com conteúdo inválido também consomem o limite
por IP. Cabeçalhos de IP com tipos ou valores inválidos na Vercel compartilham
um grupo limitado; no servidor local o IP continua vindo somente do socket.
Isso reforça o limite por instância e não substitui o controle persistente do
Firewall descrito acima.

Validação desta revisão: 45 testes Node, 28 verificações de segurança no
navegador e 34 verificações do formulário sob a nova CSP passaram. A consulta
de dependências npm/OSV continuou sem alertas para as versões inventariadas.
As alterações continuam locais; a revogação da chave histórica, a configuração
dos painéis e a publicação ainda precisam ser concluídas.

## EmailJS

`js/emailjs-config.js` contém a **Public Key** do EmailJS, usada pelo navegador para acionar o template configurado. Sua presença no JavaScript é prevista pelo serviço. Senhas, Private Keys e tokens de acesso não devem ser incluídos nesse arquivo.

A chave pública pode ser copiada e usada para tentar acionar o template e consumir a cota de envios. No painel do EmailJS, restrinja as origens ao domínio `https://institutoesperanca.vercel.app` e às origens locais realmente usadas. Mantenha o destinatário fixo no template. Para reduzir envios automatizados, o EmailJS também oferece verificação reCAPTCHA, que exige configuração no painel e no formulário.

Colocar uma chave em `.env` não a torna secreta se o valor for incluído no JavaScript entregue ao navegador. Credenciais privadas precisam ficar em um servidor.

Referências: [chave pública do EmailJS](https://www.emailjs.com/docs/faq/is-it-okay-to-expose-my-public-key/), [proteções contra abuso](https://www.emailjs.com/docs/faq/does-emailjs-expose-my-account-to-spam/) e [origens permitidas](https://www.emailjs.com/docs/faq/can-i-add-my-domain-to-allowlist/).

## Context7 do Cursor

Na revisão de 07/11/2026, foi encontrada uma chave literal do Context7 em `.cursor/mcp.json`, já presente no histórico do Git. Foi confirmado que a versão publicada desse arquivo também podia ser acessada no site. Nenhum valor de chave é reproduzido nesta documentação.

A configuração local passou a usar `${env:CONTEXT7_API_KEY}`, conforme a [interpolação de variáveis do Cursor](https://cursor.com/docs/mcp). A credencial existente foi migrada para a variável `CONTEXT7_API_KEY` do usuário do Windows, fora do repositório. Isso preserva a configuração local, mas não revoga a chave exposta.

Para concluir a correção:

1. Gere uma nova chave no painel do Context7 e substitua o valor de `CONTEXT7_API_KEY` nas variáveis de ambiente do usuário do Windows.
2. Revogue a chave antiga no painel do Context7. Ela deve ser tratada como exposta mesmo depois da publicação da correção, pois permanece no histórico e em versões anteriores do site.
3. Reinicie o Cursor para carregar a variável de ambiente atualizada.
4. Publique a configuração corrigida na Vercel. O arquivo `.vercelignore` exclui `.cursor/`, `.vscode/` e arquivos `.env` das próximas publicações.
5. Confirme que a URL `/.cursor/mcp.json` deixou de servir o arquivo na nova publicação.

As alterações locais não invalidam credenciais nem alteram publicações anteriores. Consulte a [gestão de chaves do Context7](https://context7.com/docs/howto/api-keys) e as [exclusões de publicação da Vercel](https://vercel.com/docs/deployments/vercel-ignore).
