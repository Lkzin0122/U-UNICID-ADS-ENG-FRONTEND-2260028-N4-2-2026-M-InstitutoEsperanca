# Chaves e publicação

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
