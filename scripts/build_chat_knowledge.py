"""Gera a base pesquisável do chat a partir de conteúdo público e documentos curados.

python scripts/build_chat_knowledge.py [--check]
Não usa serviços externos. Regras editoriais são instruções do agente, não documentos.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
PAGE_NAMES = (
    "acessibilidade.html",
    "contato.html",
    "galeria.html",
    "impacto.html",
    "index.html",
    "midia.html",
    "noticias.html",
    "orcamento_hospedagem.html",
    "participar.html",
    "perguntas-frequentes.html",
    "projetos.html",
    "sobre.html",
)
MAX_CHUNK = 1500
MAX_FILE_BYTES = 2_000_000
VOID = set("area base br col embed hr img input link meta param source track wbr".split())
SKIP = {"script", "style", "button", "select", "textarea", "noscript"}
BLOCKS = {"p", "li", "figcaption", "td", "th", "summary"}
SECRET = re.compile(
    r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}|\b[A-Z_]*(?:API_KEY|ACCESS_TOKEN|PRIVATE_KEY)\s*[:=]\s*[\x22\x27]?[A-Za-z0-9_./+-]{16,}"
)


def clean(text):
    return re.sub(r"\s+", " ", text).strip()


class MainParser(HTMLParser):
    """Extrai somente o main; preserva títulos, perguntas de FAQ e IDs reais."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.records = []
        self.buffer = []
        self.kind = "text"
        self.level = 0
        self.anchor = None
        self.title = []
        self.ids = set()

    def inside_main(self):
        return any(tag == "main" for tag, _ in self.stack)

    def ignored(self):
        return any(tag in SKIP or attrs.get("aria-hidden") == "true" for tag, attrs in self.stack)

    def nearest_anchor(self):
        return next(
            (
                attrs["id"]
                for tag, attrs in reversed(self.stack)
                if attrs.get("id") and tag != "main"
            ),
            None,
        )

    def flush(self):
        value = clean(" ".join(self.buffer))
        if value:
            kind = "heading" if self.kind == "summary" and value.endswith("?") else self.kind
            self.records.append(
                {
                    "kind": kind,
                    "text": value,
                    "level": 3 if self.kind == "summary" else self.level,
                    "anchor": self.anchor,
                }
            )
        self.buffer = []
        self.kind, self.level, self.anchor = "text", 0, None

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        active = self.inside_main() and not self.ignored()
        if active and (
            tag in BLOCKS or re.fullmatch(r"h[1-6]", tag) or tag in ("article", "section")
        ):
            self.flush()
        if tag not in VOID:
            self.stack.append((tag, attrs))
        if self.inside_main() and not self.ignored():
            if re.fullmatch(r"h[1-6]", tag):
                self.kind, self.level = "heading", int(tag[1])
            elif tag == "summary":
                self.kind = "summary"
            if not self.buffer:
                self.anchor = self.nearest_anchor()
            if tag == "br":
                self.buffer.append(" ")

    def handle_endtag(self, tag):
        if self.inside_main() and not self.ignored():
            if (
                tag in BLOCKS
                or re.fullmatch(r"h[1-6]", tag)
                or tag in ("article", "section", "main")
            ):
                self.flush()
            if tag in ("article", "section"):
                self.records.append({"kind": "boundary", "level": 3 if tag == "article" else 2})
        for position in range(len(self.stack) - 1, -1, -1):
            if self.stack[position][0] == tag:
                self.stack = self.stack[:position]
                break

    def handle_data(self, data):
        if any(tag == "title" for tag, _ in self.stack):
            self.title.append(data)
        if self.inside_main() and not self.ignored() and data.strip():
            if not self.buffer:
                self.anchor = self.nearest_anchor()
            self.buffer.append(data)


def pieces(text, limit=MAX_CHUNK):
    """Não corta palavras; mantém parágrafos e frases sempre que couberem."""
    result, current = [], ""
    for sentence in re.split(r"(?<=[.!?])\s+|\n+", text.strip()):
        for part in (
            [sentence]
            if len(sentence) <= limit
            else re.findall(r".{1," + str(limit) + r"}(?:\s|$)", sentence + " ")
        ):
            part = part.strip()
            if not part:
                continue
            if current and len(current) + len(part) + 1 > limit:
                result.append(current)
                current = ""
            current = (current + "\n" + part).strip()
    if current:
        result.append(current)
    return result


def page_sections(parser, title, filename):
    headings, paragraphs, anchor = [], [], None
    sections = []

    def emit():
        nonlocal paragraphs, anchor
        if paragraphs:
            section_title = " · ".join(dict.fromkeys([title] + [value for _, value in headings]))
            sections.append(
                (section_title, "\n".join(paragraphs), filename + ("#" + anchor if anchor else ""))
            )
        paragraphs, anchor = [], None

    for record in parser.records:
        kind = record["kind"]
        if kind in ("heading", "boundary"):
            emit()
            headings = [(level, value) for level, value in headings if level < record["level"]]
            if kind == "heading":
                headings.append((record["level"], record["text"]))
                anchor = record["anchor"]
        else:
            if record["anchor"] and anchor and record["anchor"] != anchor:
                emit()
            anchor = record["anchor"] or anchor
            paragraphs.append(record["text"])
    emit()
    return sections


def public_url(value, root):
    if value is None or value == "":
        return None
    if not isinstance(value, str) or any(char.isspace() for char in value) or "\\" in value:
        raise ValueError("A URL deve ser um endereço público válido ou null.")
    url = urlsplit(value)
    if url.scheme == "https" and url.hostname and not url.username and not url.password:
        return value
    if not url.scheme and not url.netloc and url.path in PAGE_NAMES:
        parser = MainParser()
        parser.feed((root / url.path).read_text(encoding="utf-8"))
        if not url.fragment or url.fragment in parser.ids:
            return value
    raise ValueError(
        "Use uma URL HTTPS pública ou o nome de uma página do site com âncora existente."
    )


def extra_documents(file, root):
    raw = file.read_text(encoding="utf-8-sig")
    if SECRET.search(raw):
        raise ValueError(f"{file.name}: possível credencial encontrada; não indexado.")
    suffix = file.suffix.lower()
    if suffix == ".json":
        data = json.loads(raw)
        documents = data.get("documents", [data]) if isinstance(data, dict) else data
    elif suffix == ".csv":
        documents = list(csv.DictReader(io.StringIO(raw)))
    else:
        title, url = file.stem.replace("-", " ").replace("_", " "), None
        if suffix == ".md" and raw.startswith("---\n"):
            match = re.match(r"^---\n(.*?)\n---\n", raw, re.S)
            if not match:
                raise ValueError(f"{file.name}: cabeçalho Markdown incompleto.")
            metadata = {}
            for line in match.group(1).splitlines():
                key, separator, value = line.partition(":")
                if separator and key.strip() in ("title", "url"):
                    metadata[key.strip()] = value.strip().strip("\x22\x27")
            title, url = metadata.get("title", title), metadata.get("url")
            raw = raw[match.end() :]
        if suffix == ".md":
            headings = re.findall(r"^#\s+(.+)$", raw, re.M)
            if headings:
                title = headings[0]
        documents = [{"title": title, "url": url, "text": raw}]
    if not isinstance(documents, list) or not documents:
        raise ValueError(f"{file.name}: forneça pelo menos um documento.")
    parsed = []
    for number, item in enumerate(documents, 1):
        if (
            not isinstance(item, dict)
            or not isinstance(item.get("title"), str)
            or not isinstance(item.get("text"), str)
        ):
            raise ValueError(
                f"{file.name}, item {number}: title e text são obrigatórios e devem ser strings."
            )
        title, body = clean(item["title"]), item["text"].strip()
        if not title or not body:
            raise ValueError(f"{file.name}, item {number}: título e texto não podem estar vazios.")
        parsed.append({"title": title, "text": body, "url": public_url(item.get("url"), root)})
    return parsed


def build_index(root=ROOT):
    root = Path(root).resolve()
    sources, chunks = [], []

    def add(source_id, title, url, sections, origin):
        sources.append({"id": source_id, "title": title, "url": url, "origin": origin})
        for section_title, body, section_url in sections:
            for text in pieces(body):
                identifier = hashlib.sha256(
                    (source_id + "\n" + section_title + "\n" + text).encode()
                ).hexdigest()[:16]
                chunks.append(
                    {
                        "id": "chunk-" + identifier,
                        "source_id": source_id,
                        "title": section_title,
                        "text": text,
                        "url": section_url,
                    }
                )

    for filename in PAGE_NAMES:
        parser = MainParser()
        parser.feed((root / filename).read_text(encoding="utf-8"))
        parser.flush()
        title = clean(" ".join(parser.title)).split(" | ")[0] or filename
        sections = page_sections(parser, title, filename)
        if not sections:
            raise ValueError(f"{filename}: não foi encontrado conteúdo no main.")
        add("page:" + filename[:-5], title, filename, sections, filename)

    folder = root / "data/knowledge"
    if folder.exists():
        if folder.is_symlink() or not folder.resolve().is_relative_to(root):
            raise ValueError(
                "A pasta de conhecimento deve estar dentro do projeto e não pode ser um link simbólico."
            )
        extras = sorted(folder.rglob("*"))
        for file in extras:
            relative = file.relative_to(folder)
            if (
                any(part.startswith(".") for part in relative.parts)
                or file.name.lower() == "readme.md"
            ):
                continue
            if file.suffix.lower() not in (".md", ".txt", ".json", ".csv") or not file.is_file():
                continue
            if file.is_symlink() or not file.resolve().is_relative_to(folder.resolve()):
                raise ValueError("Documentos externos e links simbólicos não são indexados.")
            if file.stat().st_size > MAX_FILE_BYTES:
                raise ValueError(f"{relative}: limite de 2 MB por arquivo excedido.")
            for number, item in enumerate(extra_documents(file, root), 1):
                origin = "data/knowledge/" + relative.as_posix()
                source_id = (
                    "document:"
                    + hashlib.sha256((origin + ":" + str(number)).encode()).hexdigest()[:16]
                )
                add(
                    source_id,
                    item["title"],
                    item["url"],
                    [(item["title"], item["text"], item["url"])],
                    origin,
                )

    # Repetições idênticas numa mesma fonte não aumentam artificialmente sua relevância.
    chunks = list({chunk["id"]: chunk for chunk in chunks}.values())
    payload = {"schema_version": 1, "sources": sources, "chunks": chunks}
    version = hashlib.sha256(
        json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()
    return {"schema_version": 1, "version": version, "sources": sources, "chunks": chunks}


def render(index):
    return json.dumps(index, ensure_ascii=False, indent=2) + "\n"


def main():
    arguments = argparse.ArgumentParser(description=__doc__)
    arguments.add_argument(
        "--check", action="store_true", help="Confere a base sem escrever arquivos."
    )
    arguments.add_argument("--root", type=Path, default=ROOT, help=argparse.SUPPRESS)
    args = arguments.parse_args()
    try:
        index = build_index(args.root)
        output = args.root / "data/knowledge-index.json"
        expected = render(index)
        if args.check:
            if not output.exists() or output.read_text(encoding="utf-8") != expected:
                raise ValueError(
                    "Base desatualizada. Execute python scripts/build_chat_knowledge.py."
                )
        else:
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(expected, encoding="utf-8", newline="\n")
        print(
            f"Base {'verificada' if args.check else 'gerada'}: {len(index['sources'])} fontes, {len(index['chunks'])} trechos. Versão {index['version'][:12]}."
        )
    except (ValueError, OSError) as error:
        arguments.exit(1, str(error) + "\n")


if __name__ == "__main__":
    main()
