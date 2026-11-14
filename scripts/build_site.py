"""Gera as 12 páginas estáticas e atualiza a base do chatbot.

Execute na raiz: python -B scripts/build_site.py.
Edite os módulos content_*.py para alterar o conteúdo.
"""

from html import escape
from importlib import import_module
from pathlib import Path

from build_chat_knowledge import build_index, render
from site_layout import footer, header

ROOT = Path(__file__).resolve().parent.parent
CONTENT_MODULES = (
    "content_home",
    "content_contact",
    "content_community",
    "content_resources",
    "content_media",
)
SHARED_STYLES = ("css/style.css",)
THEME_STYLES = ("css/palette.css", "css/chatbot.css", "css/speech-reader.css")
SHARED_SCRIPTS = (
    "js/i18n.js",
    "js/emailjs-config.js",
    "js/contact-service.js",
    "js/chat-actions.js",
    "js/chat-copy.js",
    "js/accessibility.js",
    "js/site.js",
    "js/speech-engine.js",
    "js/speech-reader.js",
    "js/chatbot.js",
)
CONTACT_STYLES = ("assets/vendor/intl-tel-input/css/intlTelInput.css",)
CONTACT_SCRIPTS = (
    "assets/vendor/intl-tel-input/js/intlTelInput.min.js",
    "assets/vendor/libphonenumber-js/libphonenumber-max.js",
    "assets/vendor/libphonenumber-js/phone-data.js",
    "js/phone-input.js",
)


def page_assets(filename):
    """Cada página carrega sua folha CSS; o contato recebe apenas suas dependências."""
    stylesheet = f"css/{Path(filename).stem}.css"
    styles = [*SHARED_STYLES, stylesheet, *THEME_STYLES]
    scripts = list(SHARED_SCRIPTS)
    if filename == "contato.html":
        styles.extend(CONTACT_STYLES)
        scripts = [*CONTACT_SCRIPTS, *scripts, "js/contact.js"]
    for asset in [*styles, *scripts]:
        if not (ROOT / asset).is_file():
            raise FileNotFoundError(f"Recurso da página {filename} não encontrado: {asset}")
    return styles, scripts


def render_page(filename, page):
    styles, scripts = page_assets(filename)
    assets = "\n".join(
        [f'  <link rel="stylesheet" href="{escape(asset, quote=True)}">' for asset in styles]
        + [f'  <script src="{escape(asset, quote=True)}" defer></script>' for asset in scripts]
    )
    title = escape(page["title"])
    description = escape(page["description"], quote=True)
    breadcrumb = (
        ""
        if filename == "index.html"
        else (
            '<nav class="breadcrumb container" aria-label="Você está aqui">'
            '<a href="index.html" data-i18n="Início">Início</a>'
            f'<span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>'
        )
    )
    body_class = ' class="home-page"' if filename == "index.html" else ""
    return f'''<!DOCTYPE html>
<html lang="pt-BR" id="top">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#1744bc">
  <title>{title} | Instituto Esperança</title>
  <meta name="description" content="{description}">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml" sizes="any">
{assets}
</head>
<body{body_class}>
{header(filename)}
{breadcrumb}
<main id="conteudo-principal" tabindex="-1">
{page["content"]}
</main>
{footer(filename)}
</body>
</html>
'''


def main():
    pages = {}
    for module_name in CONTENT_MODULES:
        contents = import_module(module_name).PAGES
        repeated = pages.keys() & contents.keys()
        if repeated:
            raise ValueError(f"Páginas repetidas em {module_name}: {sorted(repeated)}")
        pages.update(contents)
    if len(pages) != 12:
        raise ValueError(f"Esperadas 12 páginas, encontradas {len(pages)}.")
    for filename, page in pages.items():
        (ROOT / filename).write_text(render_page(filename, page), encoding="utf-8", newline="\n")
    print(f"{len(pages)} páginas geradas.")
    (ROOT / "data/knowledge-index.json").write_text(
        render(build_index(ROOT)), encoding="utf-8", newline="\n"
    )
    print("Base de conhecimento do agente atualizada.")


if __name__ == "__main__":
    main()
