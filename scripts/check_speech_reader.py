"""Browser regression checks: uv run --with playwright python scripts/check_speech_reader.py.

Speech is mocked to verify utterances and cancellation deterministically, without
depending on installed voices or playing audio during automated tests.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import gettempdir
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS = Path(gettempdir()) / 'esperanca-speech-qa'
ARTIFACTS.mkdir(exist_ok=True)

MOCK = r"""
window.__speechLog = [];
window.__speechVoices = [
  {name:'Microsoft Maria', lang:'pt-BR', voiceURI:'maria', default:true},
  {name:'Microsoft Daniel', lang:'pt-BR', voiceURI:'daniel'},
  {name:'Microsoft Zira', lang:'en-US', voiceURI:'zira'},
  {name:'Microsoft David', lang:'en-US', voiceURI:'david'},
  ...['de-DE','fr-FR','es-MX','ru-RU','ja-JP','zh-CN','hi-IN'].map(lang => ({name:'Test voice ' + lang, lang, voiceURI:lang})),
];
class MockSpeech extends EventTarget {
  getVoices() { return window.__speechVoices; }
  speak(utterance) {
    this.current = utterance;
    window.__speechLog.push({text:utterance.text, lang:utterance.lang, voice:utterance.voice?.name, rate:utterance.rate});
    utterance.onstart?.();
  }
  cancel() { const previous = this.current; this.current = null; previous?.onerror?.({error:'interrupted'}); }
}
Object.defineProperty(window, 'speechSynthesis', {value:new MockSpeech(), configurable:true});
window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
window.__finishSpeech = () => { const current = speechSynthesis.current; speechSynthesis.current = null; current?.onend?.(); };
"""


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def check():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            context = browser.new_context(viewport={'width':1440, 'height':1000})
            context.add_init_script(MOCK)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(base + '/acessibilidade.html')
            page.wait_for_selector('.reader-launcher')
            assert page.evaluate('__speechLog.length') == 0, 'Must start silent'
            page.locator('#titulo-ajustes').hover()
            page.wait_for_timeout(450)
            assert page.evaluate('__speechLog.length') == 0, 'Hover must be opt-in'

            page.locator('.reader-launcher').click()
            assert page.locator('#speech-reader-panel').evaluate('(el) => el.open')
            page.locator('#reader-gender').select_option('male')
            page.locator('#reader-rate').select_option('1.25')
            page.locator('[data-reader-preview]').click()
            assert page.evaluate('__speechLog.at(-1).voice') == 'Microsoft Daniel'
            assert page.evaluate('__speechLog.at(-1).rate') == 1.25
            page.locator('#reader-gender').select_option('female')
            page.locator('[data-reader-preview]').click()
            assert page.evaluate('__speechLog.at(-1).voice') == 'Microsoft Maria'
            page.screenshot(path=str(ARTIFACTS / 'panel-desktop.png'))

            # Dialog traps focus and returns it to the launcher when dismissed.
            page.locator('[data-reader-close]').focus()
            page.keyboard.press('Shift+Tab')
            assert page.evaluate('document.activeElement === document.body || document.activeElement.closest("dialog") !== null')
            page.locator('[data-reader-enable]').click()
            assert not page.locator('#speech-reader-panel').evaluate('(el) => el.open')
            page.evaluate('__finishSpeech()')
            page.locator('#titulo-ajustes').hover()
            page.wait_for_timeout(450)
            assert 'Mais conforto' in page.evaluate('__speechLog.at(-1).text')
            assert page.locator('#titulo-ajustes').evaluate('(el) => el.classList.contains("reader-highlight")')
            before = page.evaluate('__speechLog.length')
            page.mouse.move(1, 1)
            page.wait_for_timeout(400)
            assert not page.locator('.reader-highlight').count()
            assert page.evaluate('__speechLog.length') == before

            # Keyboard reads accessible names; typed fields are never spoken.
            page.goto(base + '/contato.html')
            page.locator('#nome').fill('PRIVATE-NAME-DO-NOT-SPEAK')
            page.locator('#nome').focus()
            page.wait_for_timeout(450)
            assert 'Seu nome' in page.evaluate('__speechLog.at(-1).text')
            assert 'PRIVATE-NAME' not in page.evaluate('JSON.stringify(__speechLog)')
            page.keyboard.press('Escape')
            assert not page.locator('.reader-dock').is_visible()
            assert page.evaluate('speechSynthesis.current') is None
            before = page.evaluate('__speechLog.length')
            page.locator('h1').hover()
            page.wait_for_timeout(450)
            assert page.evaluate('__speechLog.length') == before

            # Every supported site language updates UI, voice language and sample.
            for language, expected in [('en','en-US'),('de','de-DE'),('fr','fr-FR'),('es-419','es-MX'),('ru','ru-RU'),('ja','ja-JP'),('zh-CN','zh-CN'),('hi','hi-IN'),('pt-BR','pt-BR')]:
                page.locator('#language-picker').select_option(language)
                page.wait_for_function('(lang) => document.documentElement.lang === lang', arg=language)
                page.locator('.reader-launcher').click()
                page.locator('[data-reader-preview]').click()
                assert page.evaluate('__speechLog.at(-1).lang') == expected
                assert page.locator('#speech-reader-panel').get_attribute('lang') == language
                if language not in ['en','pt-BR']:
                    assert page.locator('#reader-voice-note').inner_text(), 'Unknown gender needs an honest fallback'
                page.locator('[data-reader-close]').click()

            # Changing language while speaking cancels the old utterance.
            page.locator('.reader-launcher').click()
            page.locator('[data-reader-enable]').click()
            page.locator('#language-picker').select_option('en')
            page.wait_for_function('document.documentElement.lang === "en"')
            assert page.evaluate('speechSynthesis.current') is None
            page.keyboard.press('Escape')

            # Full-page reading excludes hidden content, private inputs and its own UI.
            page.goto(base + '/sobre.html')
            page.evaluate("""() => {
              const main = document.querySelector('main');
              main.innerHTML = '<h1>First heading</h1><p>First paragraph.</p><div hidden><p>HIDDEN-TEXT</p></div><p aria-hidden="true">SECRET-DECORATION</p><p>' + 'Long readable text. '.repeat(30) + '</p><label for="private">Your name</label><input id="private" value="SECRET-INPUT"><p>Last paragraph.</p>';
            }""")
            page.locator('.reader-launcher').click()
            page.locator('[data-reader-page]').click()
            assert page.evaluate('__speechLog[0].text') == 'First heading'
            page.locator('h1').hover()
            page.wait_for_timeout(450)
            assert page.evaluate('__speechLog.length') == 1, 'Hover must not interrupt full-page reading'
            page.evaluate('for(let i=0; i<40 && speechSynthesis.current; i++) __finishSpeech()')
            spoken = page.evaluate('__speechLog.map(item => item.text)')
            assert spoken[-1] == 'Last paragraph.'
            assert all(len(text) <= 220 for text in spoken)
            assert not any('HIDDEN-TEXT' in text or 'SECRET-' in text for text in spoken)
            assert page.evaluate('speechSynthesis.current') is None
            page.locator('.reader-launcher').click()
            page.locator('[data-reader-page]').click()
            page.locator('.reader-dock [data-reader-stop]').click()
            before = page.evaluate('__speechLog.length')
            page.evaluate('__finishSpeech()')
            assert page.evaluate('__speechLog.length') == before, 'Cancel must not advance the queue'

            # Late voice loading, missing languages and playback errors.
            page.goto(base + '/acessibilidade.html')
            page.evaluate('window.__savedVoices = __speechVoices; __speechVoices = []; speechSynthesis.dispatchEvent(new Event("voiceschanged"))')
            page.locator('.reader-launcher').click()
            assert page.locator('[data-reader-preview]').is_disabled()
            assert page.locator('#reader-voice-note').inner_text()
            page.evaluate('__speechVoices = __savedVoices; speechSynthesis.dispatchEvent(new Event("voiceschanged"))')
            assert page.locator('[data-reader-preview]').is_enabled()
            page.locator('[data-reader-preview]').click()
            page.evaluate('speechSynthesis.current.onerror({error:"not-allowed"})')
            assert 'click' in page.locator('[data-reader-status]').inner_text()
            assert not page.locator('.reader-dock').is_visible()
            page.locator('[data-reader-close]').click()

            # All pages load the shared entry point, even on mobile and with large text.
            for file in ROOT.glob('*.html'):
                page.goto(base + '/' + file.name)
                assert page.locator('.reader-launcher').count() == 1, file.name
            page.goto(base + '/acessibilidade.html')
            page.locator('#language-picker').select_option('pt-BR')
            page.wait_for_function('document.documentElement.lang === "pt-BR"')
            page.locator('section[aria-labelledby="titulo-ajustes"]').screenshot(path=str(ARTIFACTS / 'accessibility-desktop.png'))
            page.set_viewport_size({'width':390, 'height':844})
            page.locator('.reader-launcher').click()
            page.screenshot(path=str(ARTIFACTS / 'panel-mobile.png'))
            page.locator('[data-reader-close]').click()
            page.locator('[data-font-size="increase"]').click(click_count=10)
            page.locator('.reader-launcher').click()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert page.locator('#speech-reader-panel').evaluate('(el) => el.scrollWidth <= el.clientWidth')
            page.locator('[data-reader-close]').click()
            page.locator('[data-font-size="reset"]').click()
            page.locator('[data-theme-preference]').select_option('dark')
            page.locator('.reader-launcher').click()
            page.screenshot(path=str(ARTIFACTS / 'panel-dark.png'))
            assert not errors, errors
            context.close()

            unavailable = browser.new_context()
            unavailable.add_init_script("Object.defineProperty(window, 'speechSynthesis', {value:undefined});")
            other = unavailable.new_page()
            other.goto(base + '/index.html')
            other.locator('.reader-launcher').click()
            assert other.locator('[data-reader-enable]').is_disabled()
            assert 'não oferece' in other.locator('#reader-voice-note').inner_text()
            unavailable.close()

            no_storage = browser.new_context()
            no_storage.add_init_script(MOCK + "Object.defineProperty(window, 'localStorage', {get(){throw new Error('Storage blocked')}});")
            other = no_storage.new_page()
            other.goto(base + '/index.html')
            other.locator('.reader-launcher').click()
            other.locator('[data-reader-enable]').click()
            other.locator('h1').hover()
            other.wait_for_timeout(450)
            assert other.evaluate('__speechLog.length') >= 2
            no_storage.close()
            browser.close()
        print('PASS: hover, keyboard, stop, 9 languages, voices, page queue, privacy, storage, mobile and 12 pages.')
        print(f'Screenshots: {ARTIFACTS}')
    finally:
        server.shutdown()


if __name__ == '__main__':
    check()
