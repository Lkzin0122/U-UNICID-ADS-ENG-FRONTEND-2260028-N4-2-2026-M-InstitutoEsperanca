# Envio de contato com EmailJS

O formulário usa a [API REST oficial do EmailJS](https://www.emailjs.com/docs/rest-api/send/), sem backend ou dependências adicionais. Os três identificadores públicos fornecidos pelo responsável já estão preenchidos em `js/emailjs-config.js`. O serviço precisa estar conectado e o template da conta deve usar os campos descritos abaixo.

## Ativação

1. Entre em [dashboard.emailjs.com](https://dashboard.emailjs.com/), adicione e conecte um serviço de e-mail em **Email Services** e copie o **Service ID**.
2. Em **Email Templates**, crie um template e copie o **Template ID**. Configure:
   - **To Email:** `institutoesperancaunicid@outlook.com` (destinatário fixo).
   - **From Name:** `{{from_name}}`.
   - **From Email:** o endereço do serviço conectado; mantenha a opção padrão do serviço.
   - **Reply To:** `{{reply_to}}`.
   - **Subject:** `Contato pelo site — {{subject}}`.
   - **Content:** use o conteúdo abaixo no editor do template.
3. Em **Account**, copie a **Public Key**.
4. Preencha somente `serviceId`, `templateId` e `publicKey` em [`js/emailjs-config.js`](../js/emailjs-config.js). Estes são identificadores públicos usados pelo navegador. Não coloque senha, chave privada ou token de acesso nesse arquivo.
5. Nas configurações de segurança da conta EmailJS, autorize o domínio do site e a origem usada na prévia local. Mantenha habilitado o uso da API pelo navegador, sem exigir chave privada.
6. Sirva o projeto por HTTP, por exemplo com `python -m http.server 8080`, e abra `http://localhost:8080/contato.html`. Após configurar a conta, envie uma mensagem sua de teste e confira o recebimento na caixa do Instituto e o endereço de resposta.

Conteúdo sugerido para o template:

```text
Nova mensagem pelo site do Instituto Esperança

Nome: {{from_name}}
E-mail para resposta: {{reply_to}}
Telefone: {{phone}}
Assunto: {{subject}}

{{message}}
```

## Comportamento

- Mantém a validação HTML5, a seleção de assunto por link e o [controle internacional de telefone](phone-input.md), com validação precisa de números fixos e móveis antes do envio.
- Bloqueia os campos durante a requisição e impede envios simultâneos.
- Exibe sucesso e limpa os campos somente após uma resposta HTTP de sucesso do EmailJS.
- Preserva a mensagem em erros de rede, configuração, limite de requisições ou demora superior a 20 segundos. Não repete envios automaticamente, pois uma resposta perdida pode corresponder a uma mensagem já processada.
- Oferece um link de e-mail com o texto preenchido quando o envio direto estiver indisponível.
- Não salva os campos no navegador. Os dados enviados são processados pelo EmailJS e pelo provedor de e-mail conectado.
- Sem JavaScript, o endereço de e-mail continua acessível na página.

As verificações automatizadas simulam as respostas do EmailJS e não enviam mensagens reais. Sem os três identificadores e um serviço/template ativos na conta, o envio real não pode ser validado.

## Diagnóstico de falhas

Quando o EmailJS recusa uma requisição, o console do navegador registra `EmailJS: envio recusado.`, o status HTTP e o motivo devolvido pela API. O código não registra o conteúdo do formulário nem a chave pública no diagnóstico.

Para consultar uma tentativa, abra as ferramentas do navegador com **F12**, selecione **Rede / Network**, clique na requisição `send` para `api.emailjs.com` e veja **Resposta / Response**. Esse texto permite distinguir um problema de template, serviço conectado ou permissão da conta. A mensagem genérica exibida no formulário, sozinha, não identifica a causa.

Se a API retornar **HTTP 400 — `The template ID not found`**, copie o ID exato em [Email Templates](https://dashboard.emailjs.com/admin/templates), usando a mesma conta da Public Key, e atualize `templateId` em `js/emailjs-config.js`. Confirme também que o template foi salvo. O site informa indisponibilidade e mantém o texto para envio por e-mail; repetir a mesma configuração não resolve esse erro.

## Verificações locais

```powershell
python -B scripts/check_site.py
python -B scripts/check_contact.py
```

O segundo comando usa o Chrome ou Edge já instalado. Verifica validação, conteúdo da requisição, bloqueio de envios simultâneos, respostas de sucesso e erro, timeout, preservação da mensagem, traduções, três larguras de tela e contato sem JavaScript. O servidor e o navegador temporários são encerrados ao terminar.

Em 31/10/2026, as 33 verificações do contato passaram, a auditoria estrutural verificou 12 páginas sem ocorrências e o W3C Nu Validator retornou zero mensagens para `contato.html`.

O template ativo é `template_o4wlclh`. Após corrigir o Template ID, um teste real autorizado pelo responsável foi executado pelo formulário no navegador: a API retornou **HTTP 200 — `OK`**, e a página exibiu a confirmação de sucesso. A aceitação pelo serviço foi verificada; a caixa de entrada do destinatário não foi acessada.
