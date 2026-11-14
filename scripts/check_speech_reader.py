"""Browser regression checks: uv run --with playwright python scripts/check_speech_reader.py.

Speech is mocked to verify utterances and cancellation deterministically, without
depending on installed voices or playing audio during automated tests.
"""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import gettempdir
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS = Path(gettempdir()) / "esperanca-speech-qa"
ARTIFACTS.mkdir(exist_ok=True)

MOCK = r"""
window.__speechLog = [];
window.__speechVoices = [
  {name:'Microsoft Maria', lang:'pt-BR', voiceURI:'maria', default:true, localService:true},
  {name:'Microsoft Daniel', lang:'pt-BR', voiceURI:'daniel', localService:true},
  {name:'Luciana', lang:'pt-BR', voiceURI:'luciana', localService:true},
  {name:'Microsoft Zira', lang:'en-US', voiceURI:'zira'},
  {name:'Microsoft David', lang:'en-US', voiceURI:'david'},
  {name:'British default', lang:'en-GB', voiceURI:'british', default:true},
  {name:'Hindi Fiji default', lang:'hi-FJ', voiceURI:'hindi-fiji', default:true},
  ...['de-DE','fr-FR','es-MX','ru-RU','ja-JP','zh-CN','hi-IN'].map(lang => ({name:'Test voice ' + lang, lang, voiceURI:lang})),
];
class MockSpeech extends EventTarget {
  getVoices() { return window.__speechVoices; }
  speak(utterance) {
    this.current = utterance;
    window.__speechLog.push({text:utterance.text, lang:utterance.lang, voice:utterance.voice?.name, voiceLang:utterance.voice?.lang, rate:utterance.rate});
    if (!this.paused && !window.__speechSkipStart) utterance.onstart?.();
  }
  cancel() { const previous = this.current; this.current = null; previous?.onerror?.({error:'interrupted'}); }
  resume() { this.paused = false; window.__speechResumed = (window.__speechResumed || 0) + 1; }
}
Object.defineProperty(window, 'speechSynthesis', {value:new MockSpeech(), configurable:true});
window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
window.__finishSpeech = () => { const current = speechSynthesis.current; speechSynthesis.current = null; current?.onend?.(); };
"""


class QuietHandler(SimpleHTTPRequestHandler):
    # This suite isolates the native browser contract. The bundled WebAssembly
    # engine is exercised with real audio synthesis by check_bundled_speech.py.
    def do_GET(self):
        if self.path == "/js/speech-engine.js":
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript")
            self.end_headers()
            return
        super().do_GET()

    def log_message(self, *args):
        pass


def check(browser_name):
    artifacts = ARTIFACTS / browser_name
    artifacts.mkdir(exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}"
    try:
        with sync_playwright() as playwright:
            browser = getattr(playwright, browser_name).launch()
            context = browser.new_context(viewport={"width": 1440, "height": 1000})
            context.add_init_script(MOCK)
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(base + "/acessibilidade.html")
            page.wait_for_selector(".reader-launcher")
            assert page.evaluate("__speechLog.length") == 0, "Must start silent"
            page.locator("#titulo-ajustes").hover()
            page.wait_for_timeout(450)
            assert page.evaluate("__speechLog.length") == 0, "Hover must be opt-in"

            page.locator(".reader-launcher").click()
            assert page.locator("#speech-reader-panel").evaluate("(el) => el.open")
            page.locator("#reader-gender").select_option("male")
            page.locator("#reader-rate").select_option("1.25")
            page.locator("[data-reader-preview]").click()
            assert page.evaluate("__speechLog.at(-1).voice") == "Microsoft Daniel"
            assert page.evaluate("__speechLog.at(-1).rate") == 1.25
            page.locator("#reader-gender").select_option("female")
            page.locator("[data-reader-preview]").click()
            assert page.evaluate("__speechLog.at(-1).voice") == "Microsoft Maria"
            # Changing voice preferences must not dismiss or disable desktop fields.
            page.locator("#reader-gender").focus()
            page.keyboard.press("Home")
            page.keyboard.press("ArrowDown")
            page.keyboard.press("ArrowDown")
            page.keyboard.press("Tab")
            assert page.locator("#reader-gender").input_value() == "male"
            assert page.locator("#speech-reader-panel").evaluate("(el) => el.open")
            page.locator("#reader-gender").select_option("female")
            page.locator("#reader-voice").select_option("luciana|pt-BR|Luciana")
            page.locator("[data-reader-preview]").click()
            assert page.evaluate("__speechLog.at(-1).voice") == "Luciana"
            page.evaluate('speechSynthesis.dispatchEvent(new Event("voiceschanged"))')
            assert page.locator("#reader-voice").input_value() == "luciana|pt-BR|Luciana"
            page.locator("#reader-voice").click()
            page.evaluate('speechSynthesis.dispatchEvent(new Event("voiceschanged"))')
            page.keyboard.press("Home")
            page.keyboard.press("ArrowDown")
            page.keyboard.press("Enter")
            assert page.locator("#reader-voice").input_value() == "maria|pt-BR|Microsoft Maria"
            assert page.locator("#speech-reader-panel").evaluate("(el) => el.open")
            page.locator("#reader-gender").select_option("male")
            page.locator("#reader-gender").select_option("female")
            page.screenshot(path=str(artifacts / "panel-desktop.png"))

            # Dialog traps focus and returns it to the launcher when dismissed.
            page.locator("[data-reader-close]").focus()
            page.keyboard.press("Shift+Tab")
            assert page.evaluate(
                'document.activeElement === document.body || document.activeElement.closest("dialog") !== null'
            )
            page.locator("[data-reader-enable]").click()
            assert not page.locator("#speech-reader-panel").evaluate("(el) => el.open")
            page.evaluate("__finishSpeech()")
            page.locator("#titulo-ajustes").hover()
            page.wait_for_timeout(450)
            assert "Mais conforto" in page.evaluate("__speechLog.at(-1).text")
            assert page.locator("#titulo-ajustes").evaluate(
                '(el) => el.classList.contains("reader-highlight")'
            )
            before = page.evaluate("__speechLog.length")
            page.mouse.move(1, 1)
            page.wait_for_timeout(400)
            assert not page.locator(".reader-highlight").count()
            assert page.evaluate("__speechLog.length") == before

            # Keyboard reads accessible names; typed fields are never spoken.
            page.goto(base + "/contato.html")
            assert page.evaluate("__speechLog.length") == 0, "Navigation itself must stay silent"
            already_activated = page.evaluate("navigator.userActivation?.hasBeenActive === true")
            page.locator("h1").hover()
            page.wait_for_timeout(450)
            if not already_activated:
                assert page.evaluate("__speechLog.length") == 0, (
                    "Missing audio activation must not trigger speech"
                )
                assert page.locator(".reader-dock [data-reader-activate]").is_visible()
            page.keyboard.press("Tab")
            page.wait_for_timeout(450)
            assert page.evaluate("__speechLog.length") > 0, (
                "Keyboard navigation provides a user activation too"
            )
            page.locator("#nome").fill("PRIVATE-NAME-DO-NOT-SPEAK")
            page.locator("#nome").focus()
            page.wait_for_timeout(450)
            assert "Seu nome" in page.evaluate("__speechLog.at(-1).text")
            assert "PRIVATE-NAME" not in page.evaluate("JSON.stringify(__speechLog)")
            page.keyboard.press("Escape")
            assert not page.locator(".reader-dock").is_visible()
            assert page.evaluate("speechSynthesis.current") is None
            before = page.evaluate("__speechLog.length")
            page.locator("h1").hover()
            page.wait_for_timeout(450)
            assert page.evaluate("__speechLog.length") == before

            # Preview, automatic selection and hover all use the site's language,
            # including a regional match ahead of a device default in another region.
            for language, expected in [
                ("en", "en-US"),
                ("de", "de-DE"),
                ("fr", "fr-FR"),
                ("es-419", "es-MX"),
                ("ru", "ru-RU"),
                ("ja", "ja-JP"),
                ("zh-CN", "zh-CN"),
                ("hi", "hi-IN"),
                ("pt-BR", "pt-BR"),
            ]:
                page.locator("#language-picker").select_option(language)
                page.wait_for_function(
                    "(lang) => document.documentElement.lang === lang", arg=language
                )
                page.locator(".reader-launcher").click()
                page.locator("[data-reader-preview]").click()
                assert page.evaluate("__speechLog.at(-1).lang") == expected
                assert page.locator("#speech-reader-panel").get_attribute("lang") == language
                if language not in ["en", "pt-BR"]:
                    assert page.locator("#reader-voice-note").inner_text(), (
                        "Unknown gender needs an honest fallback"
                    )
                page.locator("#reader-voice").select_option("auto")
                page.locator("[data-reader-preview]").click()
                assert page.evaluate("__speechLog.at(-1).voiceLang") == expected, (
                    "Automatic voice must match the site language"
                )
                page.locator("[data-reader-enable]").click()
                page.evaluate("__finishSpeech()")
                page.locator("h1").hover()
                page.wait_for_timeout(450)
                spoken = page.evaluate("__speechLog.at(-1)")
                assert spoken["lang"] == expected
                assert spoken["voiceLang"] == expected
                assert spoken["text"] == " ".join(page.locator("h1").inner_text().split())
                page.keyboard.press("Escape")

            # Changing language while speaking cancels the old utterance.
            page.locator(".reader-launcher").click()
            page.locator("[data-reader-enable]").click()
            page.locator("#language-picker").select_option("en")
            page.wait_for_function('document.documentElement.lang === "en"')
            assert page.evaluate("speechSynthesis.current") is None
            page.keyboard.press("Escape")

            # Full-page reading excludes hidden content, private inputs and its own UI.
            page.goto(base + "/sobre.html")
            page.evaluate("""() => {
              const main = document.querySelector('main');
              main.innerHTML = '<h1>First heading</h1><p>First paragraph.</p><div hidden><p>HIDDEN-TEXT</p></div><p aria-hidden="true">SECRET-DECORATION</p><div contenteditable>SECRET-EDITOR</div><p>' + 'Long readable text. '.repeat(30) + '</p><label for="private">Your name</label><input id="private" value="SECRET-INPUT"><p>Last paragraph.</p>';
            }""")
            page.locator(".reader-launcher").click()
            page.locator("[data-reader-page]").click()
            assert page.evaluate("__speechLog[0].text") == "First heading"
            page.locator("h1").hover()
            page.wait_for_timeout(450)
            assert page.evaluate("__speechLog.length") == 1, (
                "Hover must not interrupt full-page reading"
            )
            page.evaluate("for(let i=0; i<40 && speechSynthesis.current; i++) __finishSpeech()")
            spoken = page.evaluate("__speechLog.map(item => item.text)")
            assert spoken[-1] == "Last paragraph."
            assert all(len(text) <= 220 for text in spoken)
            assert not any("HIDDEN-TEXT" in text or "SECRET-" in text for text in spoken)
            assert page.evaluate("speechSynthesis.current") is None
            page.locator(".reader-launcher").click()
            page.locator("[data-reader-page]").click()
            page.locator(".reader-dock [data-reader-stop]").click()
            before = page.evaluate("__speechLog.length")
            page.evaluate("__finishSpeech()")
            assert page.evaluate("__speechLog.length") == before, (
                "Cancel must not advance the queue"
            )

            # Empty voice catalogs keep controls usable but must not delegate to
            # a device default that might speak a different language.
            page.goto(base + "/acessibilidade.html")
            page.locator("#language-picker").select_option("pt-BR")
            page.wait_for_function('document.documentElement.lang === "pt-BR"')
            page.evaluate(
                'window.__savedVoices = __speechVoices; __speechVoices = []; speechSynthesis.dispatchEvent(new Event("voiceschanged"))'
            )
            page.locator(".reader-launcher").click()
            for selector in [
                "#reader-gender",
                "#reader-rate",
                "#reader-voice",
                "[data-reader-preview]",
                "[data-reader-enable]",
                "[data-reader-page]",
            ]:
                assert page.locator(selector).is_enabled(), selector
            assert page.locator("#reader-voice-note").inner_text()
            page.locator("#reader-gender").select_option("female")
            before = page.evaluate("__speechLog.length")
            page.locator("[data-reader-preview]").click()
            assert page.evaluate("__speechLog.length") == before
            assert page.evaluate("speechSynthesis.current") is None
            assert "Nenhuma voz" in page.locator(".reader-panel [data-reader-status]").inner_text()
            # Some browsers fill getVoices without sending voiceschanged.
            page.evaluate("__speechVoices = __savedVoices")
            page.wait_for_function('document.querySelector("#reader-voice").options.length > 1')
            page.locator("#reader-voice").select_option("auto")
            page.locator("[data-reader-refresh]").click()
            assert page.locator("#reader-voice").input_value() == "auto", (
                "Explicit automatic selection must persist"
            )
            page.locator("[data-reader-preview]").click()
            page.evaluate('speechSynthesis.current.onerror({error:"not-allowed"})')
            assert (
                "Liberar áudio" in page.locator(".reader-panel [data-reader-status]").inner_text()
            )
            assert page.locator(".reader-panel [data-reader-activate]").is_visible()
            page.locator(".reader-panel [data-reader-activate]").click()
            assert page.evaluate("speechSynthesis.current") is not None
            assert page.locator(".reader-panel [data-reader-activate]").is_hidden()
            page.locator("[data-reader-close]").click()

            # Resuming a paused browser engine, replacing a failed voice, and
            # ignoring late callbacks must not strand the page reading queue.
            page.locator(".reader-launcher").click()
            page.locator("#reader-gender").select_option("male")
            page.locator("#reader-gender").select_option("female")
            page.evaluate("speechSynthesis.paused = true")
            page.locator("[data-reader-preview]").click()
            assert page.evaluate("__speechResumed") == 1
            assert page.evaluate("__speechLog.at(-1).voice") == "Microsoft Maria"
            page.evaluate(
                'window.__staleSpeech = speechSynthesis.current; speechSynthesis.current.onerror({error:"voice-unavailable"})'
            )
            assert page.evaluate("__speechLog.at(-1).voice") == "Luciana"
            before = page.evaluate("__speechLog.length")
            page.evaluate('__staleSpeech.onend(); __staleSpeech.onerror({error:"interrupted"})')
            assert page.evaluate("__speechLog.length") == before
            assert page.evaluate("speechSynthesis.current.voice.name") == "Luciana"
            page.evaluate('speechSynthesis.current.onerror({error:"network"})')
            assert page.evaluate("__speechLog.at(-1).voice") == "Microsoft Daniel"
            page.evaluate('speechSynthesis.current.onerror({error:"synthesis-failed"})')
            assert (
                "Não foi possível"
                in page.locator(".reader-panel [data-reader-status]").inner_text()
            )
            assert page.locator("[data-reader-preview]").is_enabled()
            page.locator("[data-reader-close]").click()
            assert page.locator(".reader-dock").is_visible(), (
                "Playback failures must be visible outside the closed panel"
            )
            page.locator(".reader-dock [data-reader-stop]").click()
            assert page.locator(".reader-dock").is_hidden()

            # Silent engines that never send onstart/onend have bounded retries.
            page.clock.install()
            page.locator(".reader-launcher").click()
            page.evaluate("__speechSkipStart = true")
            page.locator("[data-reader-preview]").click()
            page.clock.fast_forward(10001)
            assert page.evaluate("__speechLog.at(-1).voice") == "Luciana"
            page.clock.fast_forward(10001)
            page.clock.fast_forward(10001)
            assert page.evaluate("speechSynthesis.current") is None
            assert (
                "Não foi possível"
                in page.locator(".reader-panel [data-reader-status]").inner_text()
            )
            page.evaluate("__speechSkipStart = false")
            page.locator("[data-reader-preview]").click()
            for _ in range(3):
                page.clock.fast_forward(120000)
            assert page.evaluate("speechSynthesis.current") is None, (
                "Missing end event must not hang forever"
            )
            page.locator("[data-reader-close]").click()
            page.locator(".reader-dock [data-reader-stop]").click()
            page.clock.resume()

            # Pointer clicks in panel padding and closed overlays leave the
            # desktop page usable; no invisible modal may cover the content.
            page.locator(".reader-launcher").click()
            rect = page.locator("#speech-reader-panel").bounding_box()
            page.mouse.click(rect["x"] + 5, rect["y"] + 5)
            assert page.locator("#speech-reader-panel").evaluate("(el) => el.open")
            page.keyboard.press("Escape")
            assert not page.locator("#speech-reader-panel").evaluate("(el) => el.open")
            page.locator("[data-theme-preference]").select_option("dark")
            page.locator("[data-theme-preference]").select_option("light")

            # Color filters must not move the stop control below the document.
            # This also exercises top-layer controls without making the page inert.
            for width in [1440, 390, 320]:
                page.set_viewport_size({"width": width, "height": 844})
                for profile in ["off", "achromatopsia"]:
                    page.locator("select[data-color-vision]").select_option(profile)
                    page.locator(".reader-launcher").click()
                    page.locator("[data-reader-enable]").click()
                    page.evaluate("window.scrollTo(0, 400)")
                    assert page.locator(".reader-dock").evaluate(
                        "(el) => { const r=el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; }"
                    ), (width, profile)
                    page.locator(".reader-dock [data-reader-stop]").click()
                    assert page.locator(".reader-dock").is_hidden()
                page.evaluate("window.scrollTo(0, 0)")
            page.set_viewport_size({"width": 1440, "height": 1000})
            page.locator("[data-visual-reset]").click()

            # All pages load the shared entry point, even on mobile and with large text.
            for file in ROOT.glob("*.html"):
                page.goto(base + "/" + file.name, wait_until="domcontentloaded")
                assert page.locator(".reader-launcher").count() == 1, file.name
            page.goto(base + "/acessibilidade.html")
            page.locator("#language-picker").select_option("pt-BR")
            page.wait_for_function('document.documentElement.lang === "pt-BR"')
            page.locator('section[aria-labelledby="titulo-ajustes"]').screenshot(
                path=str(artifacts / "accessibility-desktop.png")
            )
            page.set_viewport_size({"width": 390, "height": 844})
            page.locator(".reader-launcher").click()
            page.screenshot(path=str(artifacts / "panel-mobile.png"))
            page.locator("[data-reader-close]").click()
            page.locator('[data-font-size="increase"]').click(click_count=10)
            page.locator(".reader-launcher").click()
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
            assert page.locator("#speech-reader-panel").evaluate(
                "(el) => el.scrollWidth <= el.clientWidth"
            )
            page.locator("[data-reader-close]").click()
            page.locator('[data-font-size="reset"]').click()
            page.locator("[data-theme-preference]").select_option("dark")
            page.locator(".reader-launcher").click()
            page.screenshot(path=str(artifacts / "panel-dark.png"))
            assert not errors, errors
            context.close()

            unavailable = browser.new_context()
            unavailable.add_init_script(
                "Object.defineProperty(window, 'speechSynthesis', {value:undefined});"
            )
            other = unavailable.new_page()
            other.on("pageerror", lambda error: errors.append(str(error)))
            other.goto(base + "/index.html")
            other.locator(".reader-launcher").click()
            assert other.locator("[data-reader-enable]").is_disabled()
            assert "não oferece" in other.locator("#reader-voice-note").inner_text()
            unavailable.close()

            no_storage = browser.new_context()
            no_storage.add_init_script(
                MOCK
                + "Object.defineProperty(window, 'localStorage', {get(){throw new Error('Storage blocked')}});"
            )
            other = no_storage.new_page()
            other.on("pageerror", lambda error: errors.append(str(error)))
            other.goto(base + "/index.html")
            other.locator(".reader-launcher").click()
            other.locator("[data-reader-enable]").click()
            other.locator("h1").hover()
            other.wait_for_timeout(450)
            assert other.evaluate("__speechLog.length") >= 2
            no_storage.close()

            fresh = browser.new_context()
            # Playwright evaluation/actions can set native userActivation, so
            # explicitly pin the inactive state for this permission scenario.
            fresh.add_init_script(
                MOCK
                + "Object.defineProperty(navigator, 'userActivation', {value:{hasBeenActive:false}}); localStorage.setItem('esperanca-speech-preferences', JSON.stringify({enabled:true}));"
            )
            other = fresh.new_page()
            other.on("pageerror", lambda error: errors.append(str(error)))
            other.goto(base + "/index.html")
            other.locator("h1").hover()
            other.wait_for_timeout(450)
            assert other.evaluate("__speechLog.length") == 0, (
                "Saved preferences must not bypass a fresh browser activation"
            )
            other.locator(".reader-dock [data-reader-activate]").click()
            assert other.evaluate("__speechLog.length") == 1
            other.locator(".reader-dock [data-reader-stop]").click()
            fresh.close()

            # Engines with a throwing voice service or only the legacy event
            # property keep settings usable and recover when voices arrive.
            legacy = browser.new_context()
            legacy.add_init_script(
                MOCK
                + "speechSynthesis.addEventListener = undefined; speechSynthesis.getVoices = () => {throw new Error('Voice service starting')};"
            )
            other = legacy.new_page()
            other.on("pageerror", lambda error: errors.append(str(error)))
            other.goto(base + "/index.html")
            other.locator(".reader-launcher").click()
            other.locator("#reader-gender").select_option("female")
            other.locator("[data-reader-preview]").click()
            assert other.evaluate("__speechLog.length") == 0
            assert "Nenhuma voz" in other.locator(".reader-panel [data-reader-status]").inner_text()
            other.evaluate(
                "__speechVoices = [{name:'Microsoft Daniel', lang:'pt-BR', voiceURI:'daniel', default:true}, {name:'Luciana', lang:'pt-BR', voiceURI:'luciana'}]; speechSynthesis.getVoices = () => __speechVoices; speechSynthesis.onvoiceschanged()"
            )
            other.locator("[data-reader-preview]").click()
            assert other.evaluate("__speechLog.at(-1).voice") == "Luciana", (
                "Female preference must work with non-Microsoft voices"
            )
            other.locator("[data-reader-close]").click()
            legacy.close()

            # Missing Hindi must never fall back to an English/Portuguese voice,
            # even if a saved preference points at a voice in another language.
            missing_hindi = browser.new_context()
            missing_hindi.add_init_script(
                MOCK
                + """
              __speechVoices = __speechVoices.filter(voice => !voice.lang.startsWith('hi'));
              localStorage.setItem('esperanca-speech-preferences', JSON.stringify({voices:{hi:'zira|en-US|Microsoft Zira'}}));
            """
            )
            other = missing_hindi.new_page()
            other.on("pageerror", lambda error: errors.append(str(error)))
            other.goto(base + "/index.html")
            other.locator("#language-picker").select_option("hi")
            other.wait_for_function('document.documentElement.lang === "hi"')
            other.locator(".reader-launcher").click()
            assert other.locator("#reader-voice option").count() == 1
            other.locator("[data-reader-preview]").click()
            assert other.evaluate("__speechLog.length") == 0
            assert (
                other.locator(".reader-panel [data-reader-status]").inner_text()
                == "साइट की भाषा में कोई आवाज़ उपलब्ध नहीं है। सूची अपडेट करें या डिवाइस की वाणी सेटिंग में इस भाषा की आवाज़ जोड़ें।"
            )
            other.locator("[data-reader-enable]").click()
            other.locator("h1").hover()
            other.wait_for_timeout(450)
            assert other.evaluate("__speechLog.length") == 0
            other.evaluate(
                "__speechVoices.push({name:'Hindi India', lang:'hi-IN', voiceURI:'hindi-india'}); speechSynthesis.dispatchEvent(new Event('voiceschanged'))"
            )
            other.mouse.move(1, 1)
            other.locator("h1").hover()
            other.wait_for_timeout(450)
            assert other.evaluate("__speechLog.at(-1).voiceLang") == "hi-IN"
            before = other.evaluate("__speechLog.length")
            other.evaluate('speechSynthesis.current.onerror({error:"synthesis-failed"})')
            assert other.evaluate("__speechLog.length") == before
            assert other.evaluate("speechSynthesis.current") is None
            missing_hindi.close()

            # Cancel speech as soon as selection changes, before the language
            # pack arrives; don't read old text while the translation is pending.
            delayed_language = browser.new_context()
            delayed_language.add_init_script(MOCK)
            other = delayed_language.new_page()
            other.on("pageerror", lambda error: errors.append(str(error)))
            held_routes = []
            other.route("**/js/locales/en.js", lambda route: held_routes.append(route))
            other.goto(base + "/index.html")
            other.locator(".reader-launcher").click()
            other.locator("[data-reader-enable]").click()
            assert other.evaluate("speechSynthesis.current") is not None
            before = other.evaluate("__speechLog.length")
            other.locator("#language-picker").select_option("en")
            assert other.evaluate("speechSynthesis.current") is None
            other.locator("h1").hover()
            other.wait_for_timeout(450)
            assert other.evaluate("__speechLog.length") == before
            assert held_routes, "The translation request should still be pending"
            held_routes[0].continue_()
            other.wait_for_function('document.documentElement.lang === "en"')
            other.mouse.move(1, 1)
            other.locator("h1").hover()
            other.wait_for_timeout(450)
            assert other.evaluate("__speechLog.at(-1).voiceLang") == "en-US"
            delayed_language.close()

            touch = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True)
            touch.add_init_script(MOCK)
            other = touch.new_page()
            other.on("pageerror", lambda error: errors.append(str(error)))
            other.goto(base + "/index.html")
            other.locator(".reader-launcher").tap()
            other.locator("[data-reader-page]").tap()
            assert other.evaluate("__speechLog.length") == 1
            other.evaluate("__finishSpeech()")
            assert "Toda mudança" in other.evaluate("__speechLog.at(-1).text")
            other.locator(".reader-dock [data-reader-stop]").tap()
            assert other.evaluate("speechSynthesis.current") is None
            touch.close()

            # Inspect real platform support as well, without producing audio.
            native = browser.new_context()
            other = native.new_page()
            other.on("pageerror", lambda error: errors.append(str(error)))
            other.goto(base + "/index.html")
            other.locator(".reader-launcher").click()
            native_supported = other.evaluate(
                "Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance)"
            )
            assert other.locator("[data-reader-preview]").is_enabled() == native_supported
            other.locator("[data-reader-close]").click()
            assert not other.locator("#speech-reader-panel").evaluate("(el) => el.open")
            native.close()
            assert not errors, errors
            browser.close()
        print(
            f"PASS ({browser_name}): desktop controls, automatic/female voices, delayed discovery, activation, engine errors/timeouts, hover, keyboard, stop, 9 languages, page queue, privacy, storage, mobile and 12 pages."
        )
        print(f"Screenshots: {artifacts}")
    finally:
        server.shutdown()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--browser", choices=["chromium", "firefox", "webkit", "all"], default="chromium"
    )
    browser = parser.parse_args().browser
    for browser_name in ["chromium", "firefox", "webkit"] if browser == "all" else [browser]:
        check(browser_name)
