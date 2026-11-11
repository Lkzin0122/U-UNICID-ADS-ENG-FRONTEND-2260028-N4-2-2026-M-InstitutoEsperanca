"""Conteúdo das páginas de recursos do Instituto Esperança.

Os preços e os materiais externos foram consultados em fontes primárias.
Este módulo não publica o site nem envia dados a serviços externos.
"""

PAGES = {
    "noticias.html": {
        "title": "Notícias e leituras",
        "description": "Leituras sobre educação, acessibilidade e sustentabilidade, com fontes identificadas e caminhos para aprender mais.",
        "section": "conteudos",
        "content": """
<section class="page-hero">
    <div class="container">
        <p class="eyebrow">Informação que aproxima</p>
        <h1>Novas ideias para<br><em>transformar o cotidiano.</em></h1>
        <p class="lead">Educação, inclusão e cuidado com o planeta. Uma seleção de leituras para ampliar a conversa e inspirar pequenos passos.</p>
    </div>
</section>
<section class="section" aria-labelledby="titulo-leituras">
    <div class="container" data-filter-group>
        <div class="section-heading">
            <p class="eyebrow">Notícias &amp; conhecimento</p>
            <h2 id="titulo-leituras">Vale a leitura.</h2>
            <p>Guias e referências de organizações que produzem conhecimento sobre os temas da nossa proposta. Fontes consultadas em <time datetime="2026-10-24">24 de outubro de 2026</time>.</p>
        </div>
        <div class="filters" role="group" aria-label="Filtrar leituras por tema">
            <button type="button" class="filter-button" data-filter="todos" aria-pressed="true">Todas as leituras</button>
            <button type="button" class="filter-button" data-filter="educacao" aria-pressed="false">Educação</button>
            <button type="button" class="filter-button" data-filter="inclusao" aria-pressed="false">Inclusão</button>
            <button type="button" class="filter-button" data-filter="ambiente" aria-pressed="false">Meio ambiente</button>
        </div>
        <p class="sr-only" data-filter-status role="status" aria-live="polite"></p>
        <div class="grid-3">
            <article class="card resource-card" data-filter-item data-category="educacao">
                <span class="tag">Educação</span>
                <p class="eyebrow">UNICEF Brasil · Referência</p>
                <h3>Aprender precisa ser uma oportunidade para todos.</h3>
                <p>A página de educação do UNICEF Brasil reúne desafios e iniciativas relacionados ao acesso à escola e à aprendizagem de crianças e adolescentes.</p>
                <p>Uma leitura para famílias, educadores e quem quer entender melhor a importância da permanência escolar.</p>
                <a class="text-link" href="https://www.unicef.org/brazil/educacao">Ler no UNICEF Brasil <span aria-hidden="true">↗</span></a>
            </article>
            <article class="card resource-card" data-filter-item data-category="inclusao">
                <span class="tag">Inclusão</span>
                <p class="eyebrow">W3C · Guia em português</p>
                <h3>Uma internet que mais pessoas possam usar.</h3>
                <p>A introdução da W3C à acessibilidade apresenta barreiras digitais e explica por que conteúdo, navegação e ferramentas precisam considerar pessoas com diferentes necessidades.</p>
                <p>Um bom ponto de partida para pensar inclusão também nos ambientes digitais que frequentamos.</p>
                <a class="text-link" href="https://www.w3.org/WAI/fundamentals/accessibility-intro/pt-BR">Explorar o guia da W3C <span aria-hidden="true">↗</span></a>
            </article>
            <article class="card resource-card" data-filter-item data-category="ambiente">
                <span class="tag">Meio ambiente</span>
                <p class="eyebrow">Nações Unidas · ODS 12</p>
                <h3>Cuidar dos recursos é cuidar do futuro.</h3>
                <p>O Objetivo de Desenvolvimento Sustentável 12 reúne metas de consumo e produção responsáveis, incluindo redução de desperdício, reutilização e uso consciente dos recursos.</p>
                <p>Conheça os objetivos que ajudam a conectar escolhas cotidianas e responsabilidade coletiva.</p>
                <a class="text-link" href="https://brasil.un.org/pt-br/sdgs/12">Conhecer o ODS 12 <span aria-hidden="true">↗</span></a>
            </article>
        </div>
    </div>
</section>
<section class="section section-soft" aria-labelledby="titulo-informacao">
    <div class="container split">
        <div class="section-heading">
            <p class="eyebrow">Compartilhar com responsabilidade</p>
            <h2 id="titulo-informacao">Boa informação<br>também é cuidado.</h2>
            <p>Antes de encaminhar uma notícia ou campanha, reserve um momento para conferir de onde ela veio.</p>
            <a class="text-link" href="impacto.html">Conheça nosso compromisso com a transparência <span aria-hidden="true">→</span></a>
        </div>
        <ol class="steps">
            <li><strong>Procure a fonte original.</strong><p>Abra a publicação da organização responsável e leia além do título.</p></li>
            <li><strong>Confira a data e o contexto.</strong><p>Um conteúdo antigo pode não representar a situação de hoje.</p></li>
            <li><strong>Compartilhe com o link.</strong><p>Assim, outras pessoas também conseguem verificar e aprofundar a leitura.</p></li>
        </ol>
    </div>
</section>
<section class="section" aria-labelledby="titulo-conversa">
    <div class="container cta-band">
        <div><p class="eyebrow">Continue a conversa</p><h2 id="titulo-conversa">Conhecimento que vira participação.</h2><p>Descubra as propostas do Instituto e encontre uma causa com a qual você se identifica.</p></div>
        <a class="button button-primary" href="projetos.html">Explorar os projetos <span aria-hidden="true">→</span></a>
    </div>
</section>
""",
    },
    "orcamento_hospedagem.html": {
        "title": "Orçamento de hospedagem",
        "description": "Conheça a hospedagem do projeto na Vercel, a referência de custo do plano Hobby e as opções de domínio, com fontes oficiais.",
        "section": "instituto",
        "content": """
<section class="page-hero">
    <div class="container">
        <p class="eyebrow">Transparência do projeto</p>
        <h1>Um lugar na internet.<br><em>Uma escolha consciente.</em></h1>
        <p class="lead">O Instituto Esperança está publicado na Vercel. Conheça a hospedagem escolhida e as opções de domínio para o projeto.</p>
    </div>
</section>
<section class="section" aria-labelledby="titulo-hospedagem">
    <div class="container">
        <div class="section-heading">
            <p class="eyebrow">01 / Hospedagem</p>
            <h2 id="titulo-hospedagem">Onde os arquivos do site ficam.</h2>
            <p>A Vercel hospeda as páginas HTML, os estilos, os scripts e as imagens do projeto. Informações do plano consultadas nas fontes oficiais em <time datetime="2026-11-07">07/11/2026</time>.</p>
        </div>
        <div class="split">
            <article class="card pricing-card">
                <span class="tag">Hospedagem do projeto</span>
                <h3>Vercel</h3>
                <p class="price">US$ 0 <small>por mês no plano Hobby</small></p>
                <p>Publicação de sites com distribuição dos arquivos em uma rede global e atualizações a partir do repositório do projeto.</p>
                <p><strong>Condição:</strong> o plano Hobby é gratuito para uso pessoal e não comercial, sujeito às cotas e regras da plataforma.</p>
                <a class="text-link" href="https://vercel.com/pricing">Fonte: preços da Vercel <span aria-hidden="true">↗</span></a>
                <a class="text-link" href="https://vercel.com/docs/plans/hobby">Consultar condições do plano Hobby <span aria-hidden="true">↗</span></a>
            </article>
            <div>
                <h3>Um endereço para acessar e compartilhar.</h3>
                <p>O subdomínio vercel.app permite acessar o projeto sem contratar um domínio próprio nesta etapa.</p>
                <p class="small-print"><strong>Endereço atual:</strong> <a href="https://institutoesperanca.vercel.app/">institutoesperanca.vercel.app</a></p>
                <a class="text-link" href="https://vercel.com/docs/domains/working-with-domains">Como funcionam os domínios na Vercel <span aria-hidden="true">↗</span></a>
            </div>
        </div>
    </div>
</section>
<section class="section section-soft" aria-labelledby="titulo-dominios">
    <div class="container">
        <div class="section-heading">
            <p class="eyebrow">02 / Domínio</p>
            <h2 id="titulo-dominios">O endereço para encontrar o projeto.</h2>
            <p>Domínio é uma contratação separada da hospedagem. A comparação considera registros comuns, sem nomes premium e sem verificação de disponibilidade de um nome específico.</p>
        </div>
        <div class="table-wrap" role="region" aria-labelledby="titulo-dominios" tabindex="0">
            <table>
                <caption>Preços de domínio consultados em 24/10/2026. Valores anuais na moeda original.</caption>
                <thead><tr><th scope="col">Opção</th><th scope="col">Primeiro ano</th><th scope="col">Renovação anual</th><th scope="col">O que considerar</th><th scope="col">Fonte oficial</th></tr></thead>
                <tbody>
                    <tr><th scope="row">.com.br · Registro.br</th><td>R$ 40,00</td><td>R$ 40,00</td><td>Pagamento em reais. Confira os requisitos de registro e a disponibilidade do nome.</td><td><a class="text-link" href="https://registro.br/dominio/">Registro.br <span aria-hidden="true">↗</span></a></td></tr>
                    <tr><th scope="row">.org · Porkbun</th><td>US$ 7,98 <small>(promoção)</small></td><td>US$ 11,84</td><td>Preço de registro promocional para o primeiro ano. A tabela informa taxas ICANN incluídas.</td><td><a class="text-link" href="https://porkbun.com/products/domains">Porkbun <span aria-hidden="true">↗</span></a></td></tr>
                    <tr><th scope="row">.com · Namecheap</th><td>US$ 11,28 <small>(promoção)</small></td><td>US$ 18,48</td><td>Acrescentar taxa ICANN de US$ 0,20 por ano. Valor promocional, sem o cupom exclusivo para novos clientes.</td><td><a class="text-link" href="https://www.namecheap.com/domains/registration/gtld/com/">Namecheap <span aria-hidden="true">↗</span></a></td></tr>
                </tbody>
            </table>
        </div>
        <p class="notice">Os valores representam a consulta, não uma oferta do Instituto. Preços, promoções e regras podem mudar. Valores em dólar não foram convertidos para reais; câmbio e encargos do pagamento dependem da contratação. Confirme o total e a renovação no fornecedor.</p>
    </div>
</section>
<section class="section" aria-labelledby="titulo-escolha">
    <div class="container split">
        <div class="section-heading">
            <p class="eyebrow">03 / Nossa escolha para esta etapa</p>
            <h2 id="titulo-escolha">Publicar de forma simples.<br>Investir quando fizer sentido.</h2>
            <p>A hospedagem escolhida é a Vercel, com o endereço institutoesperanca.vercel.app. O site usa arquivos estáticos, e suas atualizações podem ser publicadas a partir do repositório mantido pela equipe.</p>
            <p>Se um domínio próprio for necessário, a opção .com.br no Registro.br oferece referência de custo em reais: R$ 40,00 por ano na consulta, além da hospedagem gratuita, desde que o nome esteja disponível e os requisitos sejam atendidos.</p>
        </div>
        <div class="card">
            <h3>O que entra nessa conta?</h3>
            <p><strong>Publicação inicial:</strong> Vercel Hobby com referência de US$ 0 por mês e subdomínio vercel.app, respeitando as condições do plano.</p>
            <p><strong>Com domínio próprio .com.br:</strong> R$ 40,00 por ano na consulta. Este valor não inclui serviços adicionais.</p>
            <p><strong>Serviços adicionais:</strong> o formulário usa o EmailJS, sujeito às cotas do serviço. E-mail institucional e armazenamento em servidor exigem avaliação e orçamento separados.</p>
            <p><strong>Sustentabilidade digital:</strong> imagens compactas e carregamento de mídia sob demanda reduzem o volume de dados do site. Nenhum fornecedor recebeu uma classificação ambiental sem verificação específica.</p>
            <a class="text-link" href="sobre.html">Conheça o Instituto <span aria-hidden="true">→</span></a>
        </div>
    </div>
</section>
""",
    },
    "acessibilidade.html": {
        "title": "Acessibilidade",
        "description": "Ajuste a leitura do site e conheça os recursos de navegação por teclado, contraste, textos alternativos e alternativas para os conteúdos multimídia.",
        "section": "instituto",
        "content": """
<section class="page-hero">
    <div class="container">
        <p class="eyebrow">Um espaço para mais pessoas</p>
        <h1>Você escolhe<br><em>como navegar.</em></h1>
        <p class="lead">Inclusão começa no acesso. Encontre recursos para adaptar a leitura e orientações para explorar o site no seu ritmo.</p>
    </div>
</section>
<section class="section" aria-labelledby="titulo-ajustes">
    <div class="container split">
        <div class="section-heading">
            <div>
                <p class="eyebrow">Sua leitura, do seu jeito</p>
                <h2 id="titulo-ajustes">Mais conforto para ler.</h2>
                <p>Escolha o tema, as cores e o tamanho do texto para uma leitura confortável. Suas preferências ficam salvas neste navegador quando o armazenamento está disponível.</p>
                <p>Você também pode usar o zoom do próprio navegador. No computador, experimente <kbd>Ctrl</kbd> + <kbd>+</kbd> para ampliar e <kbd>Ctrl</kbd> + <kbd>0</kbd> para restaurar.</p>
            </div>
            <div class="accessibility-commitment">
                <p class="eyebrow">Um compromisso contínuo</p>
                <h2 id="titulo-melhoria">Acessibilidade se constrói<br>com escuta.</h2>
                <p>A acessibilidade do site está em melhoria contínua. Testes com tecnologias assistivas e sugestões das pessoas usuárias ajudam a identificar ajustes.</p>
                <a class="text-link" href="https://www.w3.org/WAI/fundamentals/accessibility-intro/pt-BR">Nossa referência: introdução à acessibilidade da W3C <span aria-hidden="true">↗</span></a>
            </div>
            <div class="card accessibility-report">
                <h3 id="titulo-dificuldade">Encontrou uma dificuldade?</h3>
                <p>Ao descrever uma barreira, conte em qual página ela aconteceu, qual recurso você tentou usar e, se souber, o navegador ou a tecnologia assistiva utilizada.</p>
                <p>Use o formulário para enviar sua mensagem ao Instituto.</p>
                <a class="button button-primary" href="contato.html?assunto=acessibilidade">Preparar relato <span aria-hidden="true">→</span></a>
            </div>
        </div>
        <div class="card accessibility-controls">
            <h3>Preferências de leitura</h3>
            <p>Tamanho do texto</p>
            <div class="button-row" role="group" aria-label="Ajustar o tamanho do texto">
                <button class="button button-outline" type="button" data-font-size="decrease" aria-label="Diminuir o tamanho do texto">A−</button>
                <button class="button button-outline" type="button" data-font-size="reset">Tamanho padrão</button>
                <button class="button button-outline" type="button" data-font-size="increase" aria-label="Aumentar o tamanho do texto">A+</button>
            </div>
            <p data-font-status role="status" aria-live="polite">Tamanho do texto: 100%.</p>
            <div class="visual-option">
            <label for="theme-preference">Tema do site</label>
            <select id="theme-preference" data-theme-preference aria-describedby="theme-hint">
                <option value="system">Seguir sistema</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
            </select>
            <span class="field-hint" id="theme-hint">O modo escuro usa fundos profundos e luz suave, mantendo as cores das imagens.</span>
            </div>
            <div class="visual-option">
            <label for="color-vision">Cores para daltonismo</label>
            <select id="color-vision" data-color-vision aria-describedby="color-vision-hint">
                <option value="off">Paleta original</option>
                <option value="protanopia">Protanopia</option>
                <option value="deuteranopia">Deuteranopia</option>
                <option value="tritanopia">Tritanopia</option>
                <option value="achromatopsia">Acromatopsia</option>
            </select>
            <span class="field-hint" id="color-vision-hint">Experimente a paleta mais confortável para você. Links sublinhados e marcas de seleção ajudam a identificar ações sem depender só das cores.</span>
            <div class="palette-preview" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
            </div>
            <div class="visual-option">
            <p>Contraste da interface</p>
            <button class="button button-outline" type="button" data-contrast-toggle aria-pressed="false" aria-describedby="contrast-hint">Alto contraste</button>
            <span class="field-hint" id="contrast-hint">Reforça a diferença entre texto e fundo, os contornos e o foco. Funciona com o tema claro ou escuro e prioriza a legibilidade das outras paletas.</span>
            </div>
            <div class="visual-option">
            <p>Inversão de cores</p>
            <button class="button button-outline" type="button" data-invert-toggle aria-pressed="false" aria-describedby="invert-hint">Inverter cores</button>
            <span class="field-hint" id="invert-hint">Inverte todas as cores da página, incluindo imagens. O tema escolhido continua o mesmo.</span>
            </div>
            <button class="button button-outline" type="button" data-visual-reset>Restaurar preferências visuais</button>
            <div class="reader-inline" data-reader-ui data-no-translate>
                <h4 data-reader-key="title">Leitura em voz alta</h4>
                <p data-reader-key="inline">Ouça os trechos ao passar o mouse ou navegar com o teclado. Escolha a voz e a velocidade.</p>
                <button class="button button-outline" type="button" data-reader-open data-reader-key="configure" hidden>Configurar leitura em voz alta</button>
            </div>
            <p class="small">Esses controles ajustam a apresentação. Nenhum dado pessoal é solicitado.</p>
            <noscript><p class="notice">Para usar os controles desta página, habilite o JavaScript. O zoom e as preferências do navegador continuam disponíveis.</p></noscript>
        </div>
    </div>
</section>
<section class="section section-soft" aria-labelledby="titulo-recursos">
    <div class="container">
        <div class="section-heading">
            <p class="eyebrow">Recursos do site</p>
            <h2 id="titulo-recursos">Pequenos cuidados.<br>Menos barreiras.</h2>
        </div>
        <div class="grid-3">
            <article class="card"><span class="icon-badge" aria-hidden="true">01</span><h3>Navegação por teclado</h3><p>Links, botões e campos podem ser alcançados com <kbd>Tab</kbd>. Um contorno destaca o item em foco para ajudar você a se localizar.</p></article>
            <article class="card"><span class="icon-badge" aria-hidden="true">02</span><h3>Um atalho para o conteúdo</h3><p>O primeiro link da página aparece ao receber foco e permite pular o menu, levando você diretamente ao conteúdo principal.</p></article>
            <article class="card"><span class="icon-badge" aria-hidden="true">03</span><h3>Imagens com contexto</h3><p>Imagens informativas têm descrições alternativas. A galeria inclui legendas e créditos para deixar claro o contexto de cada imagem.</p></article>
            <article class="card"><span class="icon-badge" aria-hidden="true">04</span><h3>Formulários identificados</h3><p>Cada campo possui um rótulo. O navegador indica campos obrigatórios e verifica o formato do e-mail antes de preparar a mensagem.</p></article>
            <article class="card"><span class="icon-badge" aria-hidden="true">05</span><h3>Mídia com alternativas</h3><p>Os players têm controles próprios. A página de mídia oferece conteúdo em texto para complementar a experiência com áudio e vídeo.</p><a class="text-link" href="midia.html">Explorar os conteúdos <span aria-hidden="true">→</span></a></article>
            <article class="card"><span class="icon-badge" aria-hidden="true">06</span><h3>Respeito ao seu ritmo</h3><p>O layout se adapta a diferentes telas. As transições são reduzidas quando a preferência por menos movimento está ativada no seu dispositivo.</p></article>
        </div>
    </div>
</section>
<section class="section" aria-labelledby="titulo-teclado">
    <div class="container split">
        <div class="section-heading">
            <p class="eyebrow">Guia rápido</p>
            <h2 id="titulo-teclado">Explore sem o mouse.</h2>
            <p>Use os comandos do teclado para percorrer o conteúdo. Os mesmos links estão disponíveis no menu e no rodapé.</p>
        </div>
        <div class="table-wrap" role="region" aria-labelledby="titulo-teclado" tabindex="0">
            <table>
                <caption>Comandos básicos de navegação</caption>
                <thead><tr><th scope="col">Tecla</th><th scope="col">O que faz</th></tr></thead>
                <tbody>
                    <tr><th scope="row"><kbd>Tab</kbd></th><td>Vai para o próximo link, botão ou campo.</td></tr>
                    <tr><th scope="row"><kbd>Shift</kbd> + <kbd>Tab</kbd></th><td>Volta para o item anterior.</td></tr>
                    <tr><th scope="row"><kbd>Enter</kbd></th><td>Abre o link ou ativa o controle selecionado.</td></tr>
                    <tr><th scope="row"><kbd>Espaço</kbd></th><td>Ativa um botão ou abre uma pergunta da lista de dúvidas.</td></tr>
                    <tr><th scope="row"><kbd>Esc</kbd></th><td>Fecha a ampliação de imagem da galeria.</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</section>
""",
    },
}
