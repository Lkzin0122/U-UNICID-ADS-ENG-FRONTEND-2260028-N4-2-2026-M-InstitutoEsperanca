"""Conteúdo institucional do Instituto Esperança, usado por build_site.py."""


def hero(label, title, description):
    return f'''<section class="page-hero">
    <div class="container">
        <p class="eyebrow">{label}</p>
        <h1>{title}</h1>
        <p class="lead">{description}</p>
    </div>
</section>'''


def cta(title, description, label="Quero fazer parte", href="participar.html"):
    return f'''<section class="section">
    <div class="container">
        <div class="cta-band">
            <div><p class="eyebrow">A esperança se constrói junto</p><h2>{title}</h2><p>{description}</p></div>
            <a class="button button-primary" href="{href}">{label} <span aria-hidden="true">↗</span></a>
        </div>
    </div>
</section>'''


PAGES = {
    "sobre.html": {
        "title": "Sobre o Instituto",
        "description": "Conheça a proposta, a missão e os valores do Instituto Esperança: educação, inclusão, acolhimento e cuidado com o ambiente.",
        "section": "instituto",
        "content": hero(
            "Nosso propósito",
            "Acreditar nas pessoas.<br><em>Construir possibilidades.</em>",
            "A esperança começa quando alguém encontra espaço para aprender, participar e ser ouvido. Essa é a ideia que move a nossa proposta.",
        ) + '''
<section class="section">
    <div class="container split">
        <div>
            <p class="eyebrow">Quem somos</p>
            <h2>Ninguém deveria caminhar sozinho.</h2>
            <p>O Instituto Esperança é uma proposta de organização social voltada a pessoas e famílias em situação de vulnerabilidade. Reunimos educação, inclusão e acolhimento em uma mesma visão: aproximar pessoas de novas possibilidades.</p>
            <p>Nosso ponto de partida é a escuta. Crianças, adolescentes, pessoas com deficiência, mães solo e famílias em situação de desabrigo têm histórias e necessidades diferentes. Uma rede de apoio precisa reconhecer cada uma delas.</p>
            <p>Conheça o Instituto Esperança, nossos valores e as iniciativas que conectam educação, inclusão e cuidado com as pessoas.</p>
            <a class="text-link" href="projetos.html">Conheça nossas frentes de atuação <span aria-hidden="true">↗</span></a>
        </div>
        <figure class="feature-image">
            <img src="img/comunidade-acolhimento.jpg" alt="Crianças reunidas em uma área ao ar livre, algumas sorrindo para a câmera." width="1200" height="800" loading="lazy">
            <figcaption>Encontros que inspiram a nossa proposta. Imagem ilustrativa: Larm Rmah / Unsplash.</figcaption>
        </figure>
    </div>
</section>
<section class="section section-tint">
    <div class="container">
        <div class="section-heading"><p class="eyebrow">O que nos orienta</p><h2>Propósito que vira direção.</h2></div>
        <div class="grid-3">
            <article class="card"><span class="icon-badge" aria-hidden="true">01</span><h3>Nossa missão</h3><p>Aproximar pessoas e famílias de informação, aprendizagem e redes de apoio, com iniciativas de educação, inclusão e conscientização socioambiental.</p></article>
            <article class="card"><span class="icon-badge" aria-hidden="true">02</span><h3>Nossa visão</h3><p>Construir um espaço acessível de articulação social, no qual comunidades, voluntários e parceiros encontrem caminhos para agir juntos.</p></article>
            <article class="card"><span class="icon-badge" aria-hidden="true">03</span><h3>Nossos valores</h3><p>Acolhimento, respeito, inclusão, transparência e responsabilidade socioambiental. Comunicar com clareza também é uma forma de cuidar.</p></article>
        </div>
    </div>
</section>
<section class="section">
    <div class="container split">
        <div class="section-heading"><p class="eyebrow">Pessoas e planeta</p><h2>Cuidar de um futuro que é de todos.</h2><p>O impacto social e o cuidado com o ambiente fazem parte da mesma conversa.</p></div>
        <div><p>Incentivar o uso responsável de recursos, compartilhar conhecimento e tornar a informação acessível são atitudes que aproximam sustentabilidade e inclusão.</p><p>No site, isso se traduz em conteúdos de fácil leitura, páginas leves, recursos de navegação por teclado e imagens com descrição. Na proposta de atuação, significa pensar em ações que respeitem tanto as pessoas quanto o território em que vivem.</p><a class="text-link" href="impacto.html">Como pensamos o impacto <span aria-hidden="true">↗</span></a></div>
    </div>
</section>
''' + cta("Há lugar para você nessa história.", "Conheça as formas de participar e encontre uma causa que faça sentido para você."),
    },
    "projetos.html": {
        "title": "Projetos e iniciativas",
        "description": "Explore as propostas de educação, inclusão, acolhimento e sustentabilidade do Instituto Esperança e descubra como participar.",
        "section": "projetos",
        "content": hero(
            "Nossas iniciativas",
            "Muitas formas de cuidar.<br><em>Um propósito em comum.</em>",
            "Educação, inclusão, acolhimento e sustentabilidade: conheça as frentes que dão forma à proposta do Instituto Esperança.",
        ) + '''
<section class="section">
    <div class="container" data-filter-group>
        <div class="section-heading"><p class="eyebrow">Encontre sua causa</p><h2>Ideias para transformar possibilidades.</h2><p>Conheça nossas frentes de atuação e entre em contato para saber como participar.</p></div>
        <div class="filter-bar" role="group" aria-label="Filtrar projetos por área">
            <button type="button" class="filter-button" data-filter="all" aria-pressed="true">Todos os projetos</button>
            <button type="button" class="filter-button" data-filter="educacao" aria-pressed="false">Educação</button>
            <button type="button" class="filter-button" data-filter="inclusao" aria-pressed="false">Inclusão</button>
            <button type="button" class="filter-button" data-filter="acolhimento" aria-pressed="false">Acolhimento</button>
            <button type="button" class="filter-button" data-filter="ambiente" aria-pressed="false">Meio ambiente</button>
        </div>
        <p class="filter-status" data-filter-status role="status" aria-live="polite">6 iniciativas propostas</p>
        <div class="grid-3">
            <article class="card project-card" id="educacao" data-filter-item data-category="educacao">
                <span class="icon-badge" aria-hidden="true">01</span><span class="tag">Educação</span>
                <h3>Aprender abre caminhos</h3><p>Uma proposta de encontros de leitura, apoio aos estudos e compartilhamento de saberes para crianças, jovens e seus responsáveis.</p>
                <details><summary>Conheça a proposta</summary><div><p><strong>Para quem:</strong> crianças, adolescentes e famílias em busca de oportunidades de aprendizagem.</p><p><strong>Como contribuir:</strong> sugerir atividades educativas, organizar materiais e compartilhar habilidades de ensino.</p></div></details>
                <a class="text-link" href="contato.html?assunto=voluntariado">Tenho interesse em contribuir <span aria-hidden="true">↗</span></a>
            </article>
            <article class="card project-card" id="inclusao" data-filter-item data-category="inclusao">
                <span class="icon-badge" aria-hidden="true">02</span><span class="tag">Inclusão</span>
                <h3>Participar é para todos</h3><p>Informação acessível e escuta de pessoas com deficiência para reconhecer barreiras e pensar em formas mais inclusivas de participação.</p>
                <details><summary>Conheça a proposta</summary><div><p><strong>Para quem:</strong> pessoas com deficiência, familiares, cuidadores e a comunidade.</p><p><strong>Como contribuir:</strong> compartilhar experiências de acessibilidade e colaborar na revisão de materiais e atividades.</p><p><strong>Etapa:</strong> proposta de atuação. Os recursos digitais já presentes estão descritos na página de Acessibilidade.</p></div></details>
                <a class="text-link" href="acessibilidade.html">Conheça a acessibilidade do site <span aria-hidden="true">↗</span></a>
            </article>
            <article class="card project-card" id="infancia" data-filter-item data-category="educacao">
                <span class="icon-badge" aria-hidden="true">03</span><span class="tag">Crianças e adolescentes</span>
                <h3>Espaço para crescer</h3><p>Atividades educativas, convivência e expressão para valorizar a infância e aproximar crianças, adolescentes e seus responsáveis.</p>
                <details><summary>Conheça a proposta</summary><div><p><strong>Para quem:</strong> crianças e adolescentes, com participação e acompanhamento de responsáveis.</p><p><strong>Como contribuir:</strong> propor oficinas de arte, leitura e atividades culturais adequadas a cada faixa etária.</p></div></details>
                <a class="text-link" href="contato.html?assunto=voluntariado">Quero colaborar com a ideia <span aria-hidden="true">↗</span></a>
            </article>
            <article class="card project-card" id="maes-solo" data-filter-item data-category="acolhimento">
                <span class="icon-badge" aria-hidden="true">04</span><span class="tag">Rede de apoio</span>
                <h3>Juntas, mais fortes</h3><p>Uma rede proposta para mães solo trocarem experiências, compartilharem informação e encontrarem apoio no cotidiano.</p>
                <details><summary>Conheça a proposta</summary><div><p><strong>Para quem:</strong> mães que criam seus filhos sozinhas e pessoas interessadas em fortalecer redes de apoio.</p><p><strong>Como contribuir:</strong> sugerir temas para rodas de conversa e colaborar com materiais informativos.</p></div></details>
                <a class="text-link" href="contato.html?assunto=apoio">Quero saber mais <span aria-hidden="true">↗</span></a>
            </article>
            <article class="card project-card" id="acolhimento" data-filter-item data-category="acolhimento">
                <span class="icon-badge" aria-hidden="true">05</span><span class="tag">Acolhimento</span>
                <h3>Uma rede que acolhe</h3><p>Informação e articulação solidária voltadas a famílias em situação de desabrigo ou vulnerabilidade socioeconômica.</p>
                <details><summary>Conheça a proposta</summary><div><p><strong>Para quem:</strong> famílias que precisam de acolhimento e pessoas interessadas em construir redes de solidariedade.</p><p><strong>Como contribuir:</strong> pensar em campanhas de arrecadação e em formas respeitosas de comunicar necessidades.</p></div></details>
                <a class="text-link" href="contato.html?assunto=parceria">Propor uma colaboração <span aria-hidden="true">↗</span></a>
            </article>
            <article class="card project-card" id="meio-ambiente" data-filter-item data-category="ambiente">
                <span class="icon-badge" aria-hidden="true">06</span><span class="tag">Sustentabilidade</span>
                <h3>Cuidar do nosso amanhã</h3><p>Educação ambiental que conecta escolhas do dia a dia, uso consciente de recursos e cuidado com os espaços compartilhados.</p>
                <details><summary>Conheça a proposta</summary><div><p><strong>Para quem:</strong> estudantes, famílias e pessoas que desejam aprender e compartilhar práticas sustentáveis.</p><p><strong>Como contribuir:</strong> propor oficinas de reutilização e materiais educativos sobre consumo responsável.</p></div></details>
                <a class="text-link" href="contato.html?assunto=voluntariado">Quero somar nessa frente <span aria-hidden="true">↗</span></a>
            </article>
        </div>
    </div>
</section>
''' + cta("Qual causa faz o seu coração bater?", "Seu tempo, seu conhecimento e suas ideias podem dar o primeiro passo em uma nova direção."),
    },
    "impacto.html": {
        "title": "Impacto e transparência",
        "description": "Saiba como o Instituto Esperança propõe acompanhar o impacto social e ambiental, com transparência sobre os dados disponíveis.",
        "section": "instituto",
        "content": hero(
            "Impacto e transparência",
            "Transformar começa com<br><em>responsabilidade.</em>",
            "Cada iniciativa precisa de propósito, escuta e acompanhamento. Conheça os caminhos que queremos desenvolver e como pretendemos avaliar os resultados.",
        ) + '''
<section class="section">
    <div class="container">
        <div class="notice"><h2>O que sabemos hoje</h2><p>Acompanhe nossos objetivos e os critérios usados para avaliar as iniciativas. Os resultados devem ser apresentados com fontes, período de referência e dados verificados.</p></div>
    </div>
</section>
<section class="section section-tint">
    <div class="container">
        <div class="section-heading"><p class="eyebrow">Nossa direção</p><h2>O impacto que queremos construir.</h2><p>Quatro compromissos conectam as seis frentes propostas para o Instituto.</p></div>
        <div class="grid-2">
            <article class="card"><span class="icon-badge" aria-hidden="true">01</span><h3>Mais acesso ao conhecimento</h3><p>Ampliar o contato com a leitura, o aprendizado e a informação compreensível para diferentes idades.</p><a class="text-link" href="projetos.html#educacao">Frente de educação <span aria-hidden="true">↗</span></a></article>
            <article class="card"><span class="icon-badge" aria-hidden="true">02</span><h3>Menos barreiras para participar</h3><p>Ouvir pessoas com deficiência e reconhecer obstáculos de comunicação, navegação e convivência.</p><a class="text-link" href="projetos.html#inclusao">Frente de inclusão <span aria-hidden="true">↗</span></a></article>
            <article class="card"><span class="icon-badge" aria-hidden="true">03</span><h3>Redes de apoio mais próximas</h3><p>Aproximar famílias, mães solo e responsáveis de informação e possibilidades de articulação comunitária.</p><a class="text-link" href="projetos.html#acolhimento">Frente de acolhimento <span aria-hidden="true">↗</span></a></article>
            <article class="card"><span class="icon-badge" aria-hidden="true">04</span><h3>Cuidado com o ambiente</h3><p>Incentivar escolhas conscientes e relacionar o uso de recursos ao bem-estar das comunidades.</p><a class="text-link" href="projetos.html#meio-ambiente">Frente de sustentabilidade <span aria-hidden="true">↗</span></a></article>
        </div>
    </div>
</section>
<section class="section">
    <div class="container">
        <div class="section-heading"><p class="eyebrow">Acompanhamento</p><h2>Objetivos claros. Dados com contexto.</h2><p>Uma proposta de registro para quando as iniciativas puderem ser implementadas.</p></div>
        <div class="table-wrap" tabindex="0" role="region" aria-label="Tabela de indicadores previstos">
            <table>
                <caption>Plano de acompanhamento de impacto — indicadores ainda não medidos.</caption>
                <thead><tr><th scope="col">O que acompanhar</th><th scope="col">Como registrar</th><th scope="col">Situação atual</th></tr></thead>
                <tbody>
                    <tr><th scope="row">Participação nas atividades</th><td>Registros de presença com cuidado com a privacidade e indicação do período.</td><td>Sem dados verificados</td></tr>
                    <tr><th scope="row">Ações educativas</th><td>Descrição das oficinas realizadas, dos objetivos e dos materiais utilizados.</td><td>Iniciativas propostas</td></tr>
                    <tr><th scope="row">Acessibilidade e inclusão</th><td>Barreiras identificadas, melhorias realizadas e retorno dos participantes.</td><td>Recursos digitais descritos no site</td></tr>
                    <tr><th scope="row">Redes de voluntariado</th><td>Participação e atividades desenvolvidas, sem divulgar dados pessoais.</td><td>Sem equipe voluntária confirmada</td></tr>
                    <tr><th scope="row">Educação ambiental</th><td>Temas trabalhados e avaliação das atividades de conscientização.</td><td>Iniciativas propostas</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</section>
<section class="section section-tint">
    <div class="container split">
        <div class="section-heading"><p class="eyebrow">Nosso compromisso</p><h2>Transparência também é uma forma de cuidado.</h2></div>
        <div><p>Um número só faz sentido quando sabemos de onde ele vem, a que período se refere e o que representa. A proposta é divulgar resultados acompanhados dessas informações, respeitando a privacidade das pessoas envolvidas.</p><p>Enquanto os dados institucionais não estiverem disponíveis, o site distingue iniciativas planejadas, conteúdo educativo e imagens ilustrativas.</p><a class="text-link" href="acessibilidade.html">Conheça os recursos de inclusão <span aria-hidden="true">↗</span></a></div>
    </div>
</section>
''' + cta("Boas perguntas ajudam a melhorar.", "Quer entender nossa proposta ou compartilhar uma sugestão? O primeiro passo é abrir uma conversa.", "Ir para contato", "contato.html?assunto=informacoes"),
    },
    "participar.html": {
        "title": "Como participar",
        "description": "Encontre seu jeito de participar da proposta do Instituto Esperança: voluntariado, parcerias, apoio material e compartilhamento de informação.",
        "section": "participe",
        "content": hero(
            "Faça parte",
            "O seu jeito de ajudar<br><em>também faz sentido.</em>",
            "Uma habilidade, uma boa ideia, tempo para ouvir. Existem muitas formas de se aproximar de uma causa e contribuir para uma rede de cuidado.",
        ) + '''
<section class="section">
    <div class="container">
        <div class="section-heading"><p class="eyebrow">Escolha seu caminho</p><h2>A solidariedade tem muitas formas.</h2><p>Explore as possibilidades de participação previstas na proposta do Instituto.</p></div>
        <div class="grid-2">
            <article class="card" id="voluntariado"><span class="icon-badge" aria-hidden="true">01</span><span class="tag">Seu tempo</span><h3>Compartilhe o que você sabe</h3><p>Leitura, educação, comunicação, organização ou cuidados com o ambiente. Suas habilidades podem inspirar ideias para as iniciativas.</p><a class="button button-primary" href="contato.html?assunto=voluntariado">Tenho interesse em voluntariado <span aria-hidden="true">↗</span></a></article>
            <article class="card" id="parcerias"><span class="icon-badge" aria-hidden="true">02</span><span class="tag">Sua organização</span><h3>Imagine uma parceria</h3><p>Escolas, coletivos e empresas podem pensar juntos em ações educativas e redes de apoio alinhadas à nossa proposta.</p><a class="button button-primary" href="contato.html?assunto=parceria">Quero propor uma parceria <span aria-hidden="true">↗</span></a></article>
            <article class="card" id="apoio"><span class="icon-badge" aria-hidden="true">03</span><span class="tag">Seu apoio</span><h3>Converse sobre uma contribuição</h3><p>Materiais de leitura, itens para oficinas e outras formas de apoio podem fazer parte de futuras campanhas. Conheça primeiro a proposta e as necessidades.</p><a class="text-link" href="contato.html?assunto=apoio">Tenho uma ideia de apoio <span aria-hidden="true">↗</span></a></article>
            <article class="card"><span class="icon-badge" aria-hidden="true">04</span><span class="tag">Sua voz</span><h3>Faça a informação circular</h3><p>Conheça os temas de educação, inclusão e sustentabilidade. Compartilhar informação de fontes confiáveis já ajuda a ampliar essa conversa.</p><a class="text-link" href="noticias.html">Explore os conteúdos <span aria-hidden="true">↗</span></a></article>
        </div>
        <div class="notice"><h2>Antes de participar</h2><p>Entre em contato com o Instituto para consultar as formas de participação, a disponibilidade de atividades e as orientações para contribuir.</p></div>
    </div>
</section>
<section class="section section-tint">
    <div class="container">
        <div class="section-heading"><p class="eyebrow">Um passo de cada vez</p><h2>Comece pelo que faz sentido para você.</h2></div>
        <ol class="steps">
            <li><span class="step-number" aria-hidden="true">01</span><div><h3>Conheça uma causa</h3><p>Explore as frentes propostas e veja quais se conectam com seus interesses.</p><a class="text-link" href="projetos.html">Ver projetos <span aria-hidden="true">↗</span></a></div></li>
            <li><span class="step-number" aria-hidden="true">02</span><div><h3>Pense na sua contribuição</h3><p>Considere suas habilidades, sua disponibilidade e o tipo de atividade de que gostaria de participar.</p></div></li>
            <li><span class="step-number" aria-hidden="true">03</span><div><h3>Prepare uma mensagem</h3><p>Descreva sua ideia no formulário e abra seu aplicativo de e-mail para enviá-la ao Instituto.</p><a class="text-link" href="contato.html">Conhecer o formulário <span aria-hidden="true">↗</span></a></div></li>
        </ol>
    </div>
</section>
<section class="section">
    <div class="container split">
        <div class="section-heading"><p class="eyebrow">Ainda tem dúvidas?</p><h2>Uma conversa pode ser o começo.</h2></div>
        <div><p>Reunimos respostas sobre o Instituto, os projetos e as formas de participação para ajudar você a encontrar seu próximo passo.</p><a class="button button-outline" href="perguntas-frequentes.html">Ver perguntas frequentes <span aria-hidden="true">↗</span></a></div>
    </div>
</section>
''',
    },
    "perguntas-frequentes.html": {
        "title": "Perguntas frequentes",
        "description": "Tire suas dúvidas sobre o Instituto Esperança, o voluntariado, as formas de apoio e o uso do site.",
        "section": "participe",
        "content": hero(
            "Vamos conversar",
            "Suas dúvidas merecem<br><em>respostas claras.</em>",
            "Entenda a proposta do Instituto, as formas de participação e o que você encontra neste site.",
        ) + '''
<section class="section">
    <div class="container split">
        <div class="section-heading"><p class="eyebrow">Perguntas frequentes</p><h2>Bom saber antes de começar.</h2><p>Selecione uma pergunta para ler a resposta. Você também pode navegar usando Tab e abrir cada item com Enter ou Espaço.</p><a class="text-link" href="contato.html">Ir para o contato <span aria-hidden="true">↗</span></a></div>
        <div class="faq-list">
            <details open><summary>Como posso conhecer o Instituto Esperança?</summary><div><p>Explore as páginas sobre o Instituto e seus projetos. Para informações sobre atividades e participação, fale com a equipe por e-mail.</p><a class="text-link" href="sobre.html">Conheça a proposta institucional <span aria-hidden="true">↗</span></a></div></details>
            <details><summary>Quais são as áreas de atuação propostas?</summary><div><p>Educação; inclusão de pessoas com deficiência; apoio a crianças e adolescentes; redes para mães solo; acolhimento de famílias em situação de desabrigo; e conscientização ambiental.</p><a class="text-link" href="projetos.html">Explore as seis frentes <span aria-hidden="true">↗</span></a></div></details>
            <details><summary>Como posso demonstrar interesse em ser voluntário?</summary><div><p>No formulário de contato, escolha “Voluntariado”, descreva suas habilidades e interesses e envie a mensagem pelo seu aplicativo de e-mail. Consulte a equipe sobre as oportunidades disponíveis.</p><a class="text-link" href="contato.html?assunto=voluntariado">Entrar em contato <span aria-hidden="true">↗</span></a></div></details>
            <details><summary>Posso doar dinheiro ou materiais pelo site?</summary><div><p>Esta versão não recebe pagamentos ou doações e não oferece chave Pix, conta bancária ou ponto de coleta. A página de participação apresenta ideias de apoio para futuras iniciativas. Qualquer campanha real dependerá de organização e informações confirmadas.</p></div></details>
            <details><summary>Preciso de apoio. O site oferece atendimento?</summary><div><p>Entre em contato por e-mail para consultar as iniciativas e as possibilidades de apoio. O site não oferece atendimento de urgência.</p></div></details>
            <details><summary>Minha mensagem será enviada pelo formulário?</summary><div><p>Após revisar o texto, selecione “Enviar por e-mail”. Seu aplicativo de e-mail abrirá com o destinatário e a mensagem preenchidos. Confirme o envio no aplicativo. Você também pode baixar uma cópia do texto.</p></div></details>
            <details><summary>As fotos e os números representam ações reais do Instituto?</summary><div><p>As imagens são ilustrativas e possuem créditos. Não são registros de atividades do Instituto. A página de impacto apresenta objetivos e indicadores previstos, porque ainda não há resultados institucionais verificados.</p><a class="text-link" href="impacto.html">Entenda o compromisso com a transparência <span aria-hidden="true">↗</span></a></div></details>
            <details><summary>Como navegar pelo site com mais acessibilidade?</summary><div><p>Use Tab para percorrer links e controles, Shift + Tab para voltar e Enter para ativar links. O atalho “Ir para o conteúdo” aparece ao receber foco. Na página de Acessibilidade você encontra os recursos disponíveis e orientações para ajustar a leitura.</p><a class="text-link" href="acessibilidade.html">Ver recursos de acessibilidade <span aria-hidden="true">↗</span></a></div></details>
        </div>
    </div>
</section>
''' + cta("Já encontrou o seu próximo passo?", "Conheça as possibilidades de colaboração e as causas que fazem parte da nossa proposta."),
    },
}
