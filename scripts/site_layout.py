"""Cabeçalho, navegação e rodapé compartilhados pelas páginas."""

from html import escape

NAV = [
    ("Início", "index.html"),
    (
        "O Instituto",
        [
            ("Nossa essência", "sobre.html"),
            ("Impacto e transparência", "impacto.html"),
            ("Acessibilidade", "acessibilidade.html"),
            ("Orçamento do site", "orcamento_hospedagem.html"),
        ],
    ),
    ("Projetos", "projetos.html"),
    (
        "Conteúdos",
        [
            ("Notícias e leituras", "noticias.html"),
            ("Galeria", "galeria.html"),
            ("Mídia", "midia.html"),
        ],
    ),
    (
        "Participe",
        [
            ("Como participar", "participar.html"),
            ("Perguntas frequentes", "perguntas-frequentes.html"),
        ],
    ),
    ("Contato", "contato.html"),
]


def link(label, href, current):
    active = ' aria-current="page"' if href == current else ""
    return f'<a href="{href}" data-i18n="{escape(label, quote=True)}"{active}>{label}</a>'


def brand():
    return '<a href="index.html" class="brand" aria-label="Instituto Esperança — início"><span class="brand-mark"><img src="img/Logo.png" width="30" height="27" alt=""></span><span data-no-translate><small>INSTITUTO</small><strong>esperança<span class="brand-period">.</span></strong></span></a>'


def header(current):
    nav_items = []
    for label, destination in NAV:
        if isinstance(destination, str):
            nav_items.append("<li>" + link(label, destination, current) + "</li>")
        else:
            active = (
                ' class="nav-group is-current"'
                if any(href == current for _, href in destination)
                else ' class="nav-group"'
            )
            children = "".join(
                "<li>" + link(text, href, current) + "</li>" for text, href in destination
            )
            nav_items.append(
                f'<li><details{active}><summary><span data-i18n="{escape(label, quote=True)}">{label}</span><span class="nav-chevron" aria-hidden="true"></span></summary><ul class="nav-dropdown">{children}</ul></details></li>'
            )
    return f"""<a class="skip-link" href="#conteudo-principal" data-i18n="Pular para o conteúdo">Pular para o conteúdo</a>
<div class="topbar"><div class="container"><span data-i18n="Juntos, a esperança ganha forma.">Juntos, a esperança ganha forma.</span></div></div>
<header class="site-header"><div class="container navbar">{brand()}
<button class="menu-button" type="button" aria-expanded="false" aria-controls="main-nav"><span class="menu-lines" aria-hidden="true"></span><span>Menu</span></button>
<nav class="site-nav" id="main-nav" aria-label="Navegação principal"><ul>{"".join(nav_items)}</ul></nav>
<div class="nav-actions"><a class="button button-primary nav-cta" href="participar.html"><span data-i18n="Faça parte">Faça parte</span> <span aria-hidden="true">↗</span></a><a class="button button-outline nav-accessibility" href="acessibilidade.html" aria-label="Acessibilidade"><span aria-hidden="true" data-no-translate>◐</span><span data-i18n="Acessibilidade">Acessibilidade</span></a></div></div></header>"""


def footer(current):
    language_options = '<option value="pt-BR">Português (Brasil)</option><option value="en">English</option><option value="zh-CN">普通话</option><option value="de">Deutsch</option><option value="fr">Français</option><option value="es-419">Español (Latinoamérica)</option><option value="ru">Русский</option><option value="ja">日本語</option><option value="hi">हिन्दी (Hindi)</option>'
    columns = [
        (
            "Conheça",
            [
                ("Início", "index.html"),
                ("O Instituto", "sobre.html"),
                ("Projetos", "projetos.html"),
                ("Impacto e transparência", "impacto.html"),
            ],
        ),
        (
            "Explore",
            [
                ("Notícias e leituras", "noticias.html"),
                ("Galeria", "galeria.html"),
                ("Mídia", "midia.html"),
                ("Acessibilidade", "acessibilidade.html"),
            ],
        ),
        (
            "Conecte-se",
            [
                ("Como participar", "participar.html"),
                ("Contato", "contato.html"),
                ("Perguntas frequentes", "perguntas-frequentes.html"),
                ("Orçamento do site", "orcamento_hospedagem.html"),
            ],
        ),
    ]
    groups = "".join(
        f'<div><h2 data-i18n="{escape(title, quote=True)}">{title}</h2><ul>'
        + "".join("<li>" + link(label, href, current) + "</li>" for label, href in links)
        + "</ul></div>"
        for title, links in columns
    )
    return f"""<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-about">{brand()}<p>Esperança que acolhe.<br>Solidariedade que transforma.</p><span class="footer-motto">Feito de pessoas, para pessoas. <span class="footer-heart-static" aria-hidden="true" data-no-translate>♡</span><button class="heart-pop-button" type="button" data-heart-pop data-js-only hidden aria-label="Animar coração"><span class="heart-pop-glyph" aria-hidden="true" data-no-translate>♡</span></button></span></div><nav class="footer-nav" aria-label="Navegação do rodapé">{groups}</nav></div>
<div class="footer-tools"><label class="language-picker"><span data-i18n="Idioma">Idioma</span><select id="language-picker" aria-label="Idioma do site">{language_options}</select></label></div>
<div class="footer-bottom"><p>© 2026 Instituto Esperança · Projeto acadêmico UNICID.</p><a href="#top">Voltar ao topo <span aria-hidden="true">↑</span></a></div></div></footer>
<dialog id="image-dialog" class="image-dialog" aria-label="Imagem ampliada"><button type="button" class="dialog-close" aria-label="Fechar imagem">×</button><figure><img id="dialog-image" src="img/comunidade-acolhimento.jpg" alt=""><figcaption id="dialog-caption"></figcaption></figure></dialog>"""
