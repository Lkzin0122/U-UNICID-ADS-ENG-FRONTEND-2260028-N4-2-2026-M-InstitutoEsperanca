"""Reúne o conteúdo e a navegação. Execute: python scripts/build_site.py.

O resultado é HTML estático: o site não precisa de Python para funcionar.
"""
from pathlib import Path
from html import escape
import importlib

ROOT = Path(__file__).resolve().parent.parent

HOME = '''
<section class="home-hero">
  <div class="container hero-grid">
    <div class="hero-copy">
      <p class="eyebrow"><span class="status-dot" aria-hidden="true"></span> Pessoas no centro. Esperança em movimento.</p>
      <h1>Toda mudança<br>começa com<br><span class="highlight">gente.</span></h1>
      <p class="hero-description">Acolher, incluir e abrir caminhos. Uma proposta que conecta pessoas a um futuro com mais oportunidades.</p>
      <div class="button-row"><a class="button button-primary" href="participar.html">Quero fazer parte <span aria-hidden="true">↗</span></a><a class="text-link" href="projetos.html">Conheça os projetos <span aria-hidden="true">→</span></a></div>
      <a class="hero-footnote" href="sobre.html"><span class="small-heart" aria-hidden="true">♡</span> Pequenos gestos. Novas possibilidades.</a>
    </div>
    <div class="hero-visual">
      <span class="sunburst" aria-hidden="true">✳</span>
      <figure class="hero-photo"><img src="img/comunidade-acolhimento.jpg" width="1200" height="800" alt="Crianças sorrindo e fazendo gestos de paz para a câmera, em uma fotografia ilustrativa de convivência." fetchpriority="high"><figcaption>Imagem ilustrativa · Larm Rmah / Unsplash</figcaption></figure>
      <div class="hero-sticker"><span aria-hidden="true">♡</span><div><strong>O futuro é coletivo.</strong><small>E pode começar com você.</small></div></div>
      <span class="photo-note" aria-hidden="true">mais cuidado, mais possibilidades</span>
    </div>
  </div>
</section>
<div class="purpose-strip"><div class="container purpose-grid"><p><span aria-hidden="true">01</span><strong>Educação que abre portas</strong></p><p><span aria-hidden="true">02</span><strong>Inclusão que aproxima</strong></p><p><span aria-hidden="true">03</span><strong>Cuidado que transforma</strong></p></div></div>
<section class="section home-intro"><div class="container intro-grid"><div><p class="eyebrow">Nossa razão de existir</p><h2>Ninguém deveria<br>caminhar <em>sozinho.</em></h2></div><div><p class="large-copy">Acreditamos na força de uma comunidade que cuida de quem faz parte dela.</p><p>O Instituto Esperança é uma proposta de organização social que reúne educação, inclusão e consciência ambiental para apoiar pessoas e famílias em situação de vulnerabilidade.</p><a class="text-link" href="sobre.html">Conheça a nossa essência <span aria-hidden="true">↗</span></a></div></div></section>
<section class="section section-tinted"><div class="container"><div class="section-heading heading-row"><div><p class="eyebrow">Caminhos de transformação</p><h2>Cuidado que ganha forma.</h2><p>Conheça algumas das iniciativas propostas para aproximar pessoas e oportunidades.</p></div><a class="text-link" href="projetos.html">Todos os projetos <span aria-hidden="true">↗</span></a></div><div class="project-grid">
  <article class="project-card"><a class="project-image" href="projetos.html#educacao"><img src="img/educacao.jpg" alt="Livros empilhados, maçã, lápis coloridos e blocos com as letras A, B e C sobre uma mesa." width="900" height="600" loading="lazy"><span class="tag">Educação</span></a><div class="project-body"><span class="micro-label">Aprender para ir além</span><h3>Aprender abre caminhos</h3><p>Leitura, troca de conhecimentos e oportunidades para desenvolver novos caminhos.</p><a class="text-link" href="projetos.html#educacao">Conhecer a proposta <span aria-hidden="true">↗</span></a></div></article>
  <article class="project-card"><a class="project-image" href="projetos.html#acolhimento"><img src="img/voluntariado.jpg" alt="Pessoa de costas com camiseta identificada com a palavra Volunteer em um evento." width="900" height="600" loading="lazy"><span class="tag">Acolhimento</span></a><div class="project-body"><span class="micro-label">Uma rede de cuidado</span><h3>Uma rede que acolhe</h3><p>Escuta e informação para mães solo, crianças e famílias que precisam de apoio.</p><a class="text-link" href="projetos.html#acolhimento">Conhecer a proposta <span aria-hidden="true">↗</span></a></div></article>
  <article class="project-card"><a class="project-image" href="projetos.html#meio-ambiente"><img src="img/natureza.jpg" alt="Pessoas com luvas e máscaras plantando uma muda em uma área arborizada." width="900" height="600" loading="lazy"><span class="tag">Sustentabilidade</span></a><div class="project-body"><span class="micro-label">Cuidar também é preservar</span><h3>Cuidar do nosso amanhã</h3><p>Educação ambiental para cultivar hábitos mais conscientes dentro e fora de casa.</p><a class="text-link" href="projetos.html#meio-ambiente">Conhecer a proposta <span aria-hidden="true">↗</span></a></div></article>
</div></div></section>
<section class="section"><div class="container participation-grid"><div class="participation-intro"><p class="eyebrow">Seu lugar nessa história</p><h2>Existe um jeito<br>de fazer parte<br><em>que é seu.</em></h2><p>Tempo, conhecimento, parceria. Cada contribuição pode aproximar uma ideia de quem precisa dela.</p><a class="button button-dark" href="participar.html">Descubra como participar <span aria-hidden="true">↗</span></a></div><div class="participation-paths"><a class="path-row" href="participar.html#voluntariado"><span class="path-number">01</span><div><h3>Compartilhe seu tempo</h3><p>Explore as possibilidades de voluntariado.</p></div><span class="path-arrow" aria-hidden="true">↗</span></a><a class="path-row" href="participar.html#apoio"><span class="path-number">02</span><div><h3>Fortaleça uma causa</h3><p>Entenda como apoiar as iniciativas propostas.</p></div><span class="path-arrow" aria-hidden="true">↗</span></a><a class="path-row" href="participar.html#parcerias"><span class="path-number">03</span><div><h3>Construa uma parceria</h3><p>Conecte sua experiência a um propósito.</p></div><span class="path-arrow" aria-hidden="true">↗</span></a></div></div></section>
<section class="section section-blue"><div class="container trust-grid"><span class="trust-symbol" aria-hidden="true">✳</span><div><p class="eyebrow">Confiança se constrói com clareza</p><h2>Uma boa causa merece<br>informação transparente.</h2><p>Nosso compromisso é compartilhar informações claras sobre as iniciativas e apresentar resultados com dados verificados.</p><a class="text-link" href="impacto.html">Entenda nosso compromisso <span aria-hidden="true">↗</span></a></div></div></section>
<section class="section"><div class="container"><div class="section-heading heading-row"><div><p class="eyebrow">Para ver, ouvir e se inspirar</p><h2>Conhecimento também aproxima.</h2></div><a class="text-link" href="noticias.html">Explore os conteúdos <span aria-hidden="true">↗</span></a></div><div class="explore-grid"><a class="explore-feature" href="galeria.html"><img src="img/comunidade-acolhimento.jpg" alt="Crianças sorrindo em uma fotografia ilustrativa de comunidade." width="1200" height="800" loading="lazy"><div><span class="micro-label">Nossa galeria</span><h3>Imagens que inspiram cuidado.</h3><span aria-hidden="true">↗</span></div></a><div class="explore-links"><a href="noticias.html"><span class="eyebrow">Leituras e referências</span><h3>Ideias para um mundo mais inclusivo. <span aria-hidden="true">↗</span></h3><p>Educação, inclusão e sustentabilidade com fontes identificadas.</p></a><a href="midia.html"><span class="eyebrow">Nossa mensagem</span><h3>Dê um play na esperança. <span aria-hidden="true">↗</span></h3><p>Uma pausa para conhecer o que nos move.</p></a></div></div></div></section>
<section class="section section-compact"><div class="container"><div class="cta-band"><div><p class="eyebrow">Vamos construir juntos?</p><h2>A próxima conexão<br>pode começar com você.</h2></div><a class="button button-dark" href="contato.html">Vamos conversar <span aria-hidden="true">↗</span></a></div></div></section>
'''

CONTACT = '''
<section class="page-hero"><div class="container"><p class="eyebrow">Vamos conversar</p><h1>Uma boa conexão<br>começa com <em>escuta.</em></h1><p class="lead">Dúvidas, ideias ou vontade de participar? Escolha um assunto e prepare sua mensagem.</p></div></section>
<section class="section"><div class="container contact-grid"><aside class="contact-aside"><p class="eyebrow">Um espaço para você</p><h2>O que te<br>trouxe até aqui?</h2><p>Queremos aproximar quem busca informação de quem deseja contribuir.</p><ul class="contact-topics"><li><span aria-hidden="true">↗</span> Conhecer os projetos</li><li><span aria-hidden="true">↗</span> Explorar o voluntariado</li><li><span aria-hidden="true">↗</span> Propor uma parceria</li><li><span aria-hidden="true">↗</span> Compartilhar uma sugestão</li></ul><div class="contact-help"><h3>Uma dúvida rápida?</h3><p>Talvez a resposta já esteja nas perguntas frequentes.</p><a class="text-link" href="perguntas-frequentes.html">Consultar respostas <span aria-hidden="true">→</span></a></div><p class="small-print">E-mail de contato: <a href="mailto:institutoesperancaunicid@outlook.com" data-no-translate>institutoesperancaunicid@outlook.com</a></p></aside>
<div class="form-panel" id="voluntario"><h2>Envie sua mensagem</h2><p class="form-intro" id="form-notice">Preencha os campos e envie sua mensagem diretamente para o Instituto.</p><form id="contact-form" action="contato.html" method="post" aria-describedby="form-notice"><fieldset id="contact-fields" class="contact-fields" aria-label="Mensagem de contato">
<div class="form-row"><div class="field"><label for="nome">Seu nome <span>(obrigatório)</span></label><input id="nome" name="nome" autocomplete="name" placeholder="Como podemos te chamar?" maxlength="100" required></div><div class="field"><label for="email">E-mail <span>(obrigatório)</span></label><input id="email" name="email" type="email" autocomplete="email" placeholder="Digite seu e-mail" maxlength="160" required></div></div>
<div class="form-row"><div class="field"><label for="telefone">Telefone <span>(opcional)</span></label><input id="telefone" name="telefone" type="tel" autocomplete="tel" inputmode="tel" aria-describedby="phone-hint phone-error"><span class="field-hint" id="phone-hint">Selecione o país. Digite o telefone completo com o código de área, quando houver, ou cole um número com +código internacional. O formato e o limite de dígitos são automáticos.</span><span class="field-hint phone-error" id="phone-error" role="status" aria-live="polite" hidden></span></div><div class="field"><label for="assunto">Quero falar sobre</label><select id="assunto" name="assunto" required><option value="">Selecione um assunto</option><option value="informacoes">Informações e apoio</option><option value="voluntariado">Voluntariado</option><option value="parceria">Parcerias</option><option value="apoio">Como contribuir</option><option value="acessibilidade">Acessibilidade</option><option value="outro">Outro assunto</option></select></div></div>
<div class="field"><label for="mensagem">Sua mensagem <span>(obrigatório)</span></label><textarea id="mensagem" name="mensagem" rows="6" minlength="10" maxlength="2000" placeholder="Conte um pouco sobre sua ideia ou dúvida…" required aria-describedby="message-hint"></textarea><span class="field-hint" id="message-hint">De 10 a 2.000 caracteres. Evite incluir informações sensíveis.</span></div>
<button class="button button-primary" type="submit" data-js-only hidden disabled><span id="contact-submit-label" data-no-translate>Enviar mensagem</span> <span aria-hidden="true">↗</span></button></fieldset><noscript><p class="notice">Você também pode entrar em contato diretamente pelo e-mail do Instituto.</p></noscript>
<div id="form-result" class="form-result" role="status" aria-live="polite" aria-atomic="true" hidden tabindex="-1"><p id="form-status" data-no-translate></p><a class="text-link" id="contact-fallback" href="mailto:institutoesperancaunicid@outlook.com" hidden>Enviar pelo aplicativo de e-mail <span aria-hidden="true">↗</span></a></div>
</form></div></div></section>
<section class="section section-tinted"><div class="container"><div class="section-heading"><p class="eyebrow">Quem está por trás do projeto</p><h2>Uma construção em equipe.</h2><p>Conheça a equipe responsável pelo site do Instituto Esperança.</p></div><ul class="team-grid"><li><span aria-hidden="true">JS</span><strong>Jonathan Santos dos Anjos</strong></li><li><span aria-hidden="true">AS</span><strong>Addiel Anthonny Arguedas Sangalli</strong></li><li><span aria-hidden="true">LB</span><strong>Lucas Bitencourt</strong></li><li><span aria-hidden="true">CR</span><strong>Caio Rian</strong></li></ul></div></section>
'''

NAV = [
    ('Início', 'index.html'),
    ('O Instituto', [('Nossa essência','sobre.html'), ('Impacto e transparência','impacto.html'), ('Acessibilidade','acessibilidade.html'), ('Orçamento do site','orcamento_hospedagem.html')]),
    ('Projetos', 'projetos.html'),
    ('Conteúdos', [('Notícias e leituras','noticias.html'), ('Galeria','galeria.html'), ('Mídia','midia.html')]),
    ('Participe', [('Como participar','participar.html'), ('Perguntas frequentes','perguntas-frequentes.html')]),
    ('Contato', 'contato.html'),
]


def link(label, href, current):
    active = ' aria-current="page"' if href == current else ''
    return f'<a href="{href}" data-i18n="{escape(label, quote=True)}"{active}>{label}</a>'


def brand():
    return '<a href="index.html" class="brand" aria-label="Instituto Esperança — início"><span class="brand-mark"><img src="img/Logo.png" width="30" height="27" alt=""></span><span data-no-translate><small>INSTITUTO</small><strong>esperança<span class="brand-period">.</span></strong></span></a>'


def header(current):
    nav_items = []
    for label, destination in NAV:
        if isinstance(destination, str):
            nav_items.append('<li>' + link(label, destination, current) + '</li>')
        else:
            active = ' class="nav-group is-current"' if any(href == current for _, href in destination) else ' class="nav-group"'
            children = ''.join('<li>' + link(text, href, current) + '</li>' for text, href in destination)
            nav_items.append(f'<li><details{active}><summary><span data-i18n="{escape(label, quote=True)}">{label}</span><span class="nav-chevron" aria-hidden="true"></span></summary><ul class="nav-dropdown">{children}</ul></details></li>')
    return f'''<a class="skip-link" href="#conteudo-principal" data-i18n="Pular para o conteúdo">Pular para o conteúdo</a>
<div class="topbar"><div class="container"><span data-i18n="Juntos, a esperança ganha forma.">Juntos, a esperança ganha forma.</span></div></div>
<header class="site-header"><div class="container navbar">{brand()}
<button class="menu-button" type="button" aria-expanded="false" aria-controls="main-nav"><span class="menu-lines" aria-hidden="true"></span><span>Menu</span></button>
<nav class="site-nav" id="main-nav" aria-label="Navegação principal"><ul>{''.join(nav_items)}</ul></nav>
<div class="nav-actions"><a class="button button-primary nav-cta" href="participar.html"><span data-i18n="Faça parte">Faça parte</span> <span aria-hidden="true">↗</span></a><a class="button button-outline nav-accessibility" href="acessibilidade.html" aria-label="Acessibilidade"><span aria-hidden="true" data-no-translate>◐</span><span data-i18n="Acessibilidade">Acessibilidade</span></a></div></div></header>'''


def footer(current):
    language_options = '<option value="pt-BR">Português (Brasil)</option><option value="en">English</option><option value="zh-CN">普通话</option><option value="de">Deutsch</option><option value="fr">Français</option><option value="es-419">Español (Latinoamérica)</option><option value="ru">Русский</option><option value="ja">日本語</option><option value="hi">हिन्दी (Hindi)</option>'
    columns = [
        ('Conheça', [('Início','index.html'),('O Instituto','sobre.html'),('Projetos','projetos.html'),('Impacto e transparência','impacto.html')]),
        ('Explore', [('Notícias e leituras','noticias.html'),('Galeria','galeria.html'),('Mídia','midia.html'),('Acessibilidade','acessibilidade.html')]),
        ('Conecte-se', [('Como participar','participar.html'),('Contato','contato.html'),('Perguntas frequentes','perguntas-frequentes.html'),('Orçamento do site','orcamento_hospedagem.html')]),
    ]
    groups = ''.join(f'<div><h2 data-i18n="{escape(title, quote=True)}">{title}</h2><ul>' + ''.join('<li>' + link(label, href, current) + '</li>' for label, href in links) + '</ul></div>' for title, links in columns)
    return f'''<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-about">{brand()}<p>Esperança que acolhe.<br>Solidariedade que transforma.</p><span class="footer-motto">Feito de pessoas, para pessoas. <span aria-hidden="true">♡</span></span></div><nav class="footer-nav" aria-label="Navegação do rodapé">{groups}</nav></div>
<div class="footer-tools"><label class="language-picker"><span data-i18n="Idioma">Idioma</span><select id="language-picker" aria-label="Idioma do site">{language_options}</select></label></div>
<div class="footer-bottom"><p data-no-translate>© 2026 Instituto Esperança · Projeto acadêmico UNICID.</p><a href="#top">Voltar ao topo <span aria-hidden="true">↑</span></a></div></div></footer>
<dialog id="image-dialog" class="image-dialog" aria-label="Imagem ampliada"><button type="button" class="dialog-close" aria-label="Fechar imagem">×</button><figure><img id="dialog-image" src="img/comunidade-acolhimento.jpg" alt=""><figcaption id="dialog-caption"></figcaption></figure></dialog>'''


def main():
    pages = {
        'index.html': {'title': 'Solidariedade que transforma', 'description': 'Educação, inclusão e cuidado: conheça a proposta do Instituto Esperança e encontre o seu jeito de participar.', 'content': HOME},
        'contato.html': {'title': 'Contato', 'description': 'Converse sobre projetos, voluntariado e parcerias. Entre em contato com a equipe do Instituto Esperança.', 'content': CONTACT},
    }
    for module in ('content_community', 'content_resources', 'content_media'):
        pages.update(importlib.import_module(module).PAGES)
    # Preserve the source module as the single editable source for every page.
    if len(pages) != 12:
        raise RuntimeError(f'Esperadas 12 páginas, encontradas {len(pages)}.')
    for filename, page in pages.items():
        breadcrumb = '' if filename == 'index.html' else f'<nav class="breadcrumb container" aria-label="Você está aqui"><a href="index.html" data-i18n="Início">Início</a><span aria-hidden="true">/</span><span aria-current="page">{escape(page["title"])}</span></nav>'
        phone_assets = '<link rel="stylesheet" href="assets/vendor/intl-tel-input/css/intlTelInput.css"><script src="assets/vendor/intl-tel-input/js/intlTelInput.min.js" defer></script><script src="assets/vendor/libphonenumber-js/libphonenumber-max.js" defer></script><script src="assets/vendor/libphonenumber-js/phone-data.js" defer></script><script src="js/phone-input.js" defer></script><script src="js/emailjs-config.js" defer></script>' if filename == 'contato.html' else ''
        body_class = ' class="home-page"' if filename == 'index.html' else ''
        html = f'''<!DOCTYPE html>
<html lang="pt-BR" id="top">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#102e50"><title>{escape(page['title'])} | Instituto Esperança</title><meta name="description" content="{escape(page['description'], quote=True)}"><link rel="icon" href="img/Logo.png" type="image/png"><link rel="stylesheet" href="css/style.css">{phone_assets}<script src="js/i18n.js" defer></script><script src="js/site.js" defer></script></head>
<body{body_class}>{header(filename)}{breadcrumb}<main id="conteudo-principal" tabindex="-1">{page['content']}</main>{footer(filename)}</body>
</html>
'''
        (ROOT / filename).write_text(html, encoding='utf-8')
    print(f'{len(pages)} páginas geradas.')


if __name__ == '__main__':
    main()
