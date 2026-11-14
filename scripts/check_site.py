"""Auditoria estrutural local, sem dependências: python scripts/check_site.py.

Complementa, mas não substitui, a validação HTML e os testes no navegador.
"""

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys

ROOT = Path(__file__).resolve().parent.parent
VOID = set("area base br col embed hr img input link meta param source track wbr".split())


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags = Counter()
        self.ids = Counter()
        self.elements = []
        self.labels = []
        self.stack = []
        self.errors = []
        self.headings = []
        self.in_main = False

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        self.tags[tag] += 1
        if len(attributes) != len(attrs):
            self.errors.append(f"L{self.getpos()[0]}: atributo duplicado em <{tag}>")
        if attributes.get("id"):
            self.ids[attributes["id"]] += 1
        self.elements.append((tag, attributes, self.getpos()[0]))
        if tag == "label" and attributes.get("for"):
            self.labels.append(attributes["for"])
        if tag == "main":
            self.in_main = True
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6") and self.in_main:
            self.headings.append((int(tag[1]), self.getpos()[0]))
        if tag == "a" and "a" in self.stack:
            self.errors.append(f"L{self.getpos()[0]}: <a> dentro de outro <a>")
        if tag == "button" and any(p in self.stack for p in ("a", "button")):
            self.errors.append(f"L{self.getpos()[0]}: botão dentro de outro controle interativo")
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag == "main":
            self.in_main = False
        if tag in VOID:
            self.errors.append(f"L{self.getpos()[0]}: fechamento inválido </{tag}>")
        elif self.stack and self.stack[-1] == tag:
            self.stack.pop()
        else:
            self.errors.append(
                f"L{self.getpos()[0]}: fechamento </{tag}> inesperado, pilha {self.stack[-4:]}"
            )
            if tag in self.stack:
                self.stack = self.stack[: self.stack.index(tag)]


def audit():
    pages = {}
    errors = []
    for path in sorted(ROOT.glob("*.html")):
        page = PageParser()
        page.feed(path.read_text(encoding="utf-8"))
        pages[path] = page
    for path, page in pages.items():

        def add(message):
            errors.append(f"{path.name}: {message}")

        for error in page.errors:
            add(error)
        if page.stack:
            add(f"tags não fechadas: {page.stack}")
        for tag in ("h1", "main", "title"):
            if page.tags[tag] != 1:
                add(f"esperado 1 <{tag}>, encontrado {page.tags[tag]}")
        for identifier, count in page.ids.items():
            if count > 1:
                add(f"ID duplicado {identifier!r} ({count})")
        html = [a for t, a, _ in page.elements if t == "html"]
        if len(html) != 1 or html[0].get("lang") != "pt-BR":
            add("idioma deve ser pt-BR")
        descriptions = [
            a for t, a, _ in page.elements if t == "meta" and a.get("name") == "description"
        ]
        if len(descriptions) != 1 or not descriptions[0].get("content"):
            add("meta description ausente ou vazia")
        stylesheets = [
            attrs.get("href")
            for tag, attrs, _ in page.elements
            if tag == "link" and attrs.get("rel") == "stylesheet"
        ]
        expected_styles = [
            "css/style.css",
            f"css/{path.stem}.css",
            "css/palette.css",
            "css/chatbot.css",
            "css/speech-reader.css",
        ]
        if stylesheets[: len(expected_styles)] != expected_styles:
            add("estilos devem carregar base, página, paleta, chatbot e leitor nessa ordem")
        scripts = [attrs for tag, attrs, _ in page.elements if tag == "script" and attrs.get("src")]
        if sum(script["src"] == "js/speech-reader.js" for script in scripts) != 1:
            add("a página deve carregar o leitor em voz alta uma única vez")
        for script in scripts:
            if "defer" not in script:
                add(f"script sem defer: {script['src']}")
        shared_chat_assets = {
            "js/emailjs-config.js",
            "js/contact-service.js",
            "js/chat-actions.js",
            "js/chat-copy.js",
        }
        if not shared_chat_assets.issubset({attrs["src"] for attrs in scripts}):
            add("faltam dependências compartilhadas do chatbot e do envio de contato")
        contact_assets = {"js/contact.js", "js/phone-input.js"}
        loaded_contact = {attrs["src"] for attrs in scripts} & contact_assets
        if path.name == "contato.html" and loaded_contact != contact_assets:
            add("o contato deve carregar seus controles de formulário")
        elif path.name != "contato.html" and loaded_contact:
            add("recursos exclusivos do contato carregados em outra página")
        for previous, current in zip(page.headings, page.headings[1:]):
            if current[0] > previous[0] + 1:
                add(f"L{current[1]}: salto de h{previous[0]} para h{current[0]}")
        for label in page.labels:
            if label not in page.ids:
                add(f"label aponta para ID inexistente: {label}")
        for tag, attrs, line in page.elements:
            if tag == "img" and "alt" not in attrs:
                add(f"L{line}: imagem sem alt")
            if tag == "img" and not (attrs.get("src") or attrs.get("srcset")):
                add(f"L{line}: imagem sem src ou srcset")
            if tag in ("input", "textarea", "select") and attrs.get("type") not in (
                "hidden",
                "submit",
                "button",
                "reset",
            ):
                if (
                    attrs.get("id") not in page.labels
                    and not attrs.get("aria-label")
                    and not attrs.get("aria-labelledby")
                ):
                    add(f"L{line}: campo sem label associado")
            for ref_attr in ("aria-labelledby", "aria-describedby", "aria-controls"):
                for identifier in attrs.get(ref_attr, "").split():
                    if identifier not in page.ids:
                        add(f"L{line}: {ref_attr} aponta para ID inexistente {identifier}")
            for attribute in ("href", "src", "poster"):
                reference = attrs.get(attribute)
                if not reference:
                    continue
                url = urlsplit(reference)
                if url.scheme or url.netloc:
                    continue
                destination = (path.parent / unquote(url.path)).resolve() if url.path else path
                if not destination.exists():
                    add(f"L{line}: arquivo não encontrado: {reference}")
                elif destination.suffix.lower() == ".html" and url.fragment:
                    dest_parser = pages.get(destination)
                    if dest_parser is None:
                        dest_parser = PageParser()
                        dest_parser.feed(destination.read_text(encoding="utf-8"))
                    if unquote(url.fragment) not in dest_parser.ids:
                        add(f"L{line}: âncora não encontrada: {reference}")
    print(f"{len(pages)} páginas verificadas; {len(errors)} ocorrências.")
    for error in errors:
        print(error)
    return bool(errors)


if __name__ == "__main__":
    sys.exit(audit())
