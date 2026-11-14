"""Regressão das ações do chat e e-mails, sem enviar mensagens ou chamar IA.

uv run --with playwright python scripts/check_chat_actions.py --browser all
"""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from itertools import product
from pathlib import Path
from tempfile import gettempdir
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS = Path(gettempdir()) / 'esperanca-chat-actions'
ARTIFACTS.mkdir(exist_ok=True)


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def check(browser_name):
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as playwright:
            browser = getattr(playwright, browser_name).launch()
            context = browser.new_context(viewport={'width':1440,'height':1000}, color_scheme='light')
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            calls = []
            mode = {'contact':200}
            held_contacts = []

            def chat(route):
                calls.append(('chat',route.request.post_data_json))
                route.fulfill(json={'mode':'ai','answer':'Você pode conhecer os projetos e falar com a equipe.','sources':[], 'actions':['contact:open','page:projetos','javascript:alert(1)','language:en']})

            def contact(route):
                calls.append(('contact',route.request.post_data_json))
                if mode['contact'] == 'pending':
                    held_contacts.append(route)
                    return
                route.fulfill(status=mode['contact'], body='OK' if mode['contact']==200 else 'Outlook: Account suspended')

            context.route('**/api/chat',chat)
            context.route('https://api.emailjs.com/**',contact)
            page.goto(origin+'/index.html')
            page.locator('.chat-launcher').click()
            assert page.locator('#chat-question').evaluate('(el)=>el===document.activeElement')

            def ask(message):
                page.locator('#chat-question').fill(message)
                page.locator('.chat-send').click()
                page.wait_for_function('document.querySelector(".chat-send") && !document.querySelector(".chat-send").disabled')

            ask('Mude para o tema escuro')
            assert page.evaluate('document.documentElement.classList.contains("theme-dark")')
            ask('Ativar alto contraste')
            assert page.evaluate('document.documentElement.classList.contains("high-contrast")')
            ask('Aumentar texto')
            assert page.evaluate('esperancaVisual.preferences.scale') == 1.1
            assert not calls, 'Local actions must work without the AI'
            page.evaluate('esperancaVisual.set({theme:"light",contrast:false,scale:1})')
            ask('Mude o idioma para hindi')
            page.wait_for_function('document.documentElement.lang === "hi"')
            assert page.locator('.esperanca-chat').get_attribute('lang') == 'hi'
            assert page.locator('[data-chat-tool="contact"]').inner_text() == 'संपर्क संदेश भेजें'
            page.locator('[data-chat-tool="languages"]').click()
            page.locator('[data-chat-action="language:en"]').last.click()
            page.wait_for_function('document.documentElement.lang === "en"')
            assert page.locator('[data-chat-tool="contact"]').inner_text() == 'Send a message'
            for language in ['pt-BR','en','es-419','fr','de','zh-CN','ru','ja','hi','en']:
                page.evaluate('(language)=>esperancaI18n.setLanguage(language)',language)
                page.wait_for_function('(language)=>document.documentElement.lang===language',arg=language)
                assert page.locator('.esperanca-chat').get_attribute('lang') == language
                assert page.locator('[data-chat-tool="contact"]').inner_text() not in ['', 'contact']
                assert page.locator('#chat-question').get_attribute('placeholder') != 'placeholder'
            ask('Open projects')
            page.wait_for_url('**/projetos.html')
            assert page.locator('.chat-panel').is_visible(), 'Navigation must keep the chat open'
            assert page.locator('.chat-message').count() >= 2
            page.evaluate('esperancaI18n.setLanguage("pt-BR")')
            page.wait_for_function('document.documentElement.lang === "pt-BR"')
            ask('Como posso ajudar com educação?')
            assert calls[-1][1]['context'] == {'language':'pt-BR','page':'projetos.html'}
            assert page.locator('[data-chat-action="javascript:alert(1)"]').count() == 0
            assert not page.locator('.chat-contact').is_visible(), 'AI suggestions must never execute automatically'
            page.locator('.chat-message:last-child [data-chat-action="contact:open"]').click()
            assert page.locator('.chat-contact').is_visible()
            page.locator('#chat-contact-name').fill('Pessoa do chat')
            page.locator('#chat-contact-message').fill('Gostaria de saber como colaborar com leitura.')
            invalid = ['caioriangato@gmail','a@dominio','a@.com','a@dominio.','a..b@example.com','a@-example.com','a@example..com','a@dominio.c','a b@example.com']
            for email in invalid:
                page.locator('#chat-contact-email').fill(email)
                page.locator('.chat-contact button[type=submit]').click()
                assert not any(kind=='contact' for kind,_ in calls), email
            page.locator('#chat-contact-email').fill('pessoa+chat@example.com.br')
            mode['contact'] = 'pending'
            page.locator('.chat-contact button[type=submit]').click()
            page.wait_for_function('document.querySelector(".chat-contact").hasAttribute("aria-busy")')
            page.evaluate('document.querySelector(".chat-contact").dispatchEvent(new Event("submit",{cancelable:true}))')
            assert len(held_contacts) == 1
            assert len([body for kind,body in calls if kind=='contact']) == 1, 'Concurrent submits must not send twice'
            held_contacts[0].fulfill(status=403,body='Outlook: Account suspended')
            page.wait_for_function('!document.querySelector(".chat-contact").hasAttribute("aria-busy")')
            assert page.locator('#chat-contact-message').input_value().startswith('Gostaria')
            assert page.locator('.chat-contact-fallback').is_visible()
            assert 'pessoa+chat' not in page.evaluate('sessionStorage.getItem("esperanca-chat-session-v2")')
            mode['contact'] = 200
            page.locator('.chat-contact button[type=submit]').click()
            page.wait_for_function('!document.querySelector(".chat-contact").hasAttribute("aria-busy")')
            assert 'sucesso' in page.locator('.chat-contact-status').inner_text()
            assert page.locator('#chat-contact-message').input_value() == ''
            sent = [body for kind,body in calls if kind=='contact']
            assert len(sent) == 2
            assert sent[-1]['template_params']['reply_to'] == 'pessoa+chat@example.com.br'
            assert sent[-1]['template_params']['title'] == sent[-1]['template_params']['subject']
            assert all('pessoa+chat' not in str(body) for kind,body in calls if kind=='chat')
            assert page.evaluate('sessionStorage.getItem("esperanca-chat-contact-draft-v1")') is None
            page.locator('#chat-contact-name').fill('Pessoa timeout')
            page.locator('#chat-contact-email').fill('pessoa@example.com')
            page.locator('#chat-contact-message').fill('Uma mensagem que deve ser preservada no timeout.')
            mode['contact'] = 'pending'
            page.clock.install()
            page.locator('.chat-contact button[type=submit]').click()
            page.clock.fast_forward(20001)
            page.wait_for_function('!document.querySelector(".chat-contact").hasAttribute("aria-busy")')
            assert 'confirmar' in page.locator('.chat-contact-status').inner_text()
            assert page.locator('#chat-contact-message').input_value().startswith('Uma mensagem')
            page.clock.resume()
            page.screenshot(path=str(ARTIFACTS/f'{browser_name}-contact.png'))
            page.locator('[data-contact-back]').click()
            ask('Abra início')
            page.wait_for_url('**/index.html')
            ask('Abra projetos')
            page.wait_for_url('**/projetos.html')
            page.locator('[data-chat-tool="contact"]').click()
            assert page.locator('#chat-contact-message').input_value().startswith('Uma mensagem'), 'Draft must survive multiple page actions before reopening contact'
            assert page.locator('#chat-contact-email').input_value() == 'pessoa@example.com'
            page.locator('[data-contact-back]').click()

            # Readable text and a contrasting boundary on blue and white sections,
            # including all accessibility color combinations and inverted colors.
            contrast_checks = 0
            for theme,vision,invert,contrast in product(['light','dark'],['off','protanopia','deuteranopia','tritanopia','achromatopsia'],[False,True],[False,True]):
                page.evaluate('(p)=>esperancaVisual.set(p)',{'theme':theme,'colorVision':vision,'invert':invert,'contrast':contrast})
                results = page.evaluate(r'''() => {
                  const rgb = color => color.match(/[\d.]+/g).slice(0,3).map(Number);
                  const luminance = color => {
                    let c=rgb(color); if(document.documentElement.classList.contains('inverted-colors')) c=c.map(v=>255-v);
                    c=c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
                    return c[0]*.2126+c[1]*.7152+c[2]*.0722;
                  };
                  const ratio=(a,b)=>{a=luminance(a);b=luminance(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
                  return ['.chat-launcher','.chat-send','.chat-close','.chat-tools button','.chat-action-buttons button'].map(selector=>{
                    const s=getComputedStyle(document.querySelector(selector));return {selector,ratio:ratio(s.color,s.backgroundColor)};
                  });
                }''')
                for result in results:
                    assert result['ratio'] >= (7 if contrast else 4.5), (theme,vision,invert,contrast,result)
                    contrast_checks += 1
                # Fixed position must survive page filters and scrolling.
                page.keyboard.press('Escape')
                page.evaluate('scrollTo(0,document.body.scrollHeight)')
                box=page.locator('.chat-launcher').bounding_box()
                assert box['y'] >= 0 and box['y']+box['height'] <= 1001
                page.locator('.chat-launcher').click()
            page.evaluate('esperancaVisual.set({theme:"light",colorVision:"off",invert:false,contrast:false})')
            for width in [320,390,768,1440]:
                page.set_viewport_size({'width':width,'height':844})
                for scale in [1,2]:
                    page.evaluate('(scale)=>esperancaVisual.set({scale})',scale)
                    assert page.locator('.chat-panel').evaluate('(el)=>el.scrollWidth<=el.clientWidth'), (width,scale)
                    page.locator('[data-chat-tool="contact"]').click()
                    assert page.locator('.chat-contact').evaluate('(el)=>el.scrollWidth<=el.clientWidth'), (width,scale)
                    page.locator('[data-contact-back]').click()
            page.evaluate('esperancaVisual.set({scale:1})')
            page.set_viewport_size({'width':390,'height':844})
            page.screenshot(path=str(ARTIFACTS/f'{browser_name}-chat-mobile.png'))
            page.keyboard.press('Escape')
            page.screenshot(path=str(ARTIFACTS/f'{browser_name}-launcher-footer.png'))
            # The main contact form must block incomplete domains before any send.
            page.goto(origin+'/contato.html')
            page.locator('#nome').fill('Pessoa de teste')
            page.locator('#mensagem').fill('Gostaria de colaborar com o Instituto.')
            page.locator('#assunto').select_option('voluntariado')
            before=len(calls)
            for email in invalid:
                page.locator('#email').fill(email)
                page.locator('#contact-form button[type=submit]').click()
                assert len(calls)==before,email
            for email in ['pessoa@example.com','pessoa+teste@example.com.br','pessoa@sub.example.org']:
                page.locator('#email').fill(email)
                assert page.locator('#email').evaluate('(el)=>el.checkValidity()'),email
            assert not errors, errors
            context.close()
            browser.close()
            print(f'PASS ({browser_name}): actions, language, navigation, contact success/failure/privacy, email validation, {contrast_checks} contrast pairs, mobile/zoom and filter positioning.')
    finally:
        server.shutdown()


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser',choices=['chromium','firefox','webkit','all'],default='chromium')
    args=parser.parse_args()
    for name in (['chromium','firefox','webkit'] if args.browser=='all' else [args.browser]):
        check(name)
