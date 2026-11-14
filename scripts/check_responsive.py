"""Verifica rolagem horizontal em páginas, tamanhos de texto e idiomas.

Execute: uv run --with playwright python scripts/check_responsive.py
"""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
LANGUAGES = ("pt-BR", "en", "de", "fr", "es-419", "ru", "ja", "zh-CN", "hi")


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def check(browser_name):
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    origin = f"http://127.0.0.1:{server.server_port}"
    failures = []
    errors = []
    cases = 0
    try:
        with sync_playwright() as playwright:
            browser = getattr(playwright, browser_name).launch()
            page = browser.new_page(viewport={"width": 320, "height": 844})
            page.on("pageerror", lambda error: errors.append(str(error)))

            def verify(filename, width, scale, language):
                nonlocal cases
                page.set_viewport_size({"width": width, "height": 844})
                page.evaluate(
                    '(value) => document.documentElement.style.setProperty("--font-scale", value)',
                    scale,
                )
                actual = page.evaluate("document.documentElement.scrollWidth")
                cases += 1
                if actual > width + 1:
                    failures.append(f"{filename}: {width}px, {scale}x, {language}: {actual}px")

            for path in sorted(ROOT.glob("*.html")):
                page.goto(origin + "/" + path.name, wait_until="domcontentloaded")
                page.locator("#language-picker").select_option("pt-BR")
                page.wait_for_function('document.documentElement.lang === "pt-BR"')
                for width in (320, 390, 768, 1100, 1440):
                    for scale in (1, 1.5):
                        verify(path.name, width, scale, "pt-BR")
                page.set_viewport_size({"width": 320, "height": 844})
                page.evaluate('document.documentElement.style.setProperty("--font-scale", 1.5)')
                for language in LANGUAGES:
                    page.locator("#language-picker").select_option(language)
                    page.wait_for_function(
                        "(lang) => document.documentElement.lang === lang", arg=language
                    )
                    verify(path.name, 320, 1.5, language)
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
    if failures or errors:
        raise AssertionError("\n".join(failures + errors))
    print(f"PASS ({browser_name}): {cases} cenarios responsivos em 12 paginas e nove idiomas.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--browser", choices=("chromium", "firefox", "webkit"), default="chromium")
    check(parser.parse_args().browser)
