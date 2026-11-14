# Orçamento comparativo de hospedagem e domínio

Projeto acadêmico Instituto Esperança · UNICID  
Hospedagens alternativas consultadas em **24 de outubro de 2026**, com Railway atualizada em **31 de outubro de 2026**. Domínios atualizados em **14 de novembro de 2026**.

Este documento registra a hospedagem usada pelo projeto e a pesquisa de alternativas e domínios. Os preços refletem as páginas oficiais consultadas e podem mudar; a contratação exige confirmar condições, disponibilidade e total no fornecedor.

## Hospedagem

O projeto usa arquivos estáticos de HTML, CSS, JavaScript e mídia, além de uma API para o chatbot. A hospedagem atual é a Vercel; as demais opções abaixo registram a pesquisa anterior, cujas condições devem ser conferidas novamente antes de uma eventual mudança.

| Serviço | Plano e preço | Recursos e condições relevantes | Fonte oficial |
| --- | --- | --- | --- |
| Vercel | Hobby, US$ 0 por mês na consulta de 07/11/2026 | Hospedagem atual com subdomínio `vercel.app`. O plano é destinado a uso pessoal e não comercial, sujeito a cotas e regras da plataforma. | [Preços](https://vercel.com/pricing) e [plano Hobby](https://vercel.com/docs/plans/hobby) |
| GitHub Pages | GitHub Free, gratuito | Publicação de HTML, CSS e JavaScript a partir de repositório **público** no plano Free. Endereço `github.io` ou domínio próprio. | [O que é GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) |
| Cloudflare Pages | Free, gratuito para arquivos estáticos | Requisições estáticas gratuitas; 500 builds por mês; até 20 mil arquivos; limite de 25 MiB por arquivo. Funções de servidor têm cotas próprias. | [Preços](https://developers.cloudflare.com/pages/functions/pricing/) e [limites](https://developers.cloudflare.com/pages/platform/limits/) |
| Railway | Free, US$ 0 por mês | Inclui US$ 1 de crédito mensal para pequenas aplicações, com subdomínio Railway. Até 1 vCPU e 0,5 GB de RAM por serviço. A gratuidade está limitada à cota mensal. | [Preços da Railway](https://railway.com/pricing) e [planos e limites](https://docs.railway.com/pricing/plans) |

## Domínios

Os valores são anuais, na moeda de origem, para nomes comuns. Não foi verificada a disponibilidade de um nome específico, e nomes premium não entram neste comparativo.

| Extensão e fornecedor | Primeiro ano | Renovação anual | Condições | Fonte oficial |
| --- | --- | --- | --- | --- |
| `.com.br` no Registro.br | R$ 40,00 | R$ 40,00 | Pagamento em reais. É necessário atender aos requisitos de registro e verificar o nome pretendido. | [Sobre domínios](https://registro.br/dominio/) |
| `.org` na Porkbun | US$ 7,98, promocional | US$ 11,84 | Promoção restrita ao primeiro ano. A tabela consultada informa taxas ICANN incluídas. | [Tabela de domínios](https://porkbun.com/products/domains) |
| `.com` na Namecheap | US$ 12,08, promocional | US$ 19,98 | Acrescentar US$ 0,20 de taxa ICANN por ano. Não foi considerado o cupom exclusivo para novos clientes. | [Preços de .com](https://www.namecheap.com/domains/registration/gtld/com/) |

Os valores devem ser confirmados novamente antes da compra. Não foi feita conversão de dólar para real; câmbio e encargos do meio de pagamento alteram o total.

## Escolha sugerida para a demonstração

**Vercel Hobby com o subdomínio `vercel.app`.** O projeto está publicado em [institutoesperanca.vercel.app](https://institutoesperanca.vercel.app/), com referência de US$ 0 por mês na consulta e sujeito às condições e cotas do plano.

Se houver necessidade de um domínio próprio, a referência é **`.com.br` no Registro.br**, por R$ 40,00 ao ano na data da pesquisa, sujeito à disponibilidade e aos requisitos de registro. O formulário usa EmailJS, sujeito às cotas do serviço; o chatbot depende de um provedor de IA e de suas condições. E-mail institucional e demais serviços adicionais exigem avaliação separada.

## Sustentabilidade digital

O projeto prioriza mídia local, imagens com carregamento adiado quando adequado e players sem reprodução automática. Esses cuidados evitam transferências desnecessárias. A pesquisa não atribui certificação ambiental nem preferência ecológica a um fornecedor sem evidência específica.

## Atualização da pesquisa

Antes de qualquer contratação, abra novamente as fontes, confira registro e renovação separadamente e atualize também o conteúdo de `scripts/content_resources.py`. Depois execute `python scripts/build_site.py` para gerar a página com os novos valores.
