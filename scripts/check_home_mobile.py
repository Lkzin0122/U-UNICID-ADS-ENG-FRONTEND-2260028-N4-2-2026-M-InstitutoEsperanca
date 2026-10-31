"""Audita a index no Chromium instalado: python scripts/check_home_mobile.py.

Verifica larguras de celular, tablet e desktop, idiomas, texto ampliado e menu.
Não instala dependências e encerra o servidor e o perfil temporário ao terminar.
"""
import base64
import http.server
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading
import time
import urllib.request

from browser_qa import CDP, QuietHandler, ROOT


LAYOUT = """(async () => {
  document.querySelectorAll('img').forEach(image => image.loading = 'eager');
  await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
  const visible = element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden';
  const describe = element => element.tagName.toLowerCase() + (element.className ? '.' + String(element.className).trim().replaceAll(' ', '.') : '');
  const outside = [...document.querySelectorAll('body *')].filter(element => {
    if (!visible(element) || element.closest('.skip-link,dialog,[aria-hidden="true"]')) return false;
    const rect = element.getBoundingClientRect();
    return rect.left < -1 || rect.right > document.documentElement.clientWidth + 1;
  }).map(describe);
  const clippedText = [...document.querySelectorAll('h1,h2,h3,p,.button,.text-link,.hero-sticker,.hero-footnote,.language-picker')].filter(element => {
    if (!visible(element)) return false;
    return element.scrollWidth > element.clientWidth + 2;
  }).map(describe);
  const menu = document.querySelector('.menu-button');
  const header = document.querySelector('.site-header').getBoundingClientRect();
  const caption = document.querySelector('.hero-photo figcaption').getBoundingClientRect();
  const sticker = document.querySelector('.hero-sticker').getBoundingClientRect();
  const captionOverlap = caption.left < sticker.right && caption.right > sticker.left && caption.top < sticker.bottom && caption.bottom > sticker.top;
  return {
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    outside, clippedText,
    missingImages: [...document.images].filter(image => !image.naturalWidth).map(image => image.getAttribute('src')),
    captionOverlap,
    menuTarget: getComputedStyle(menu).display === 'none' || (menu.getBoundingClientRect().width >= 44 && menu.getBoundingClientRect().height >= 44),
    headerHeight: Math.round(header.height),
    h1: document.querySelectorAll('h1').length,
  };
})()"""


def run():
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}'
    browsers = [Path('C:/Program Files/Google/Chrome/Application/chrome.exe'), Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')]
    browser = next((path for path in browsers if path.exists()), None)
    if not browser:
        server.shutdown()
        raise RuntimeError('Nenhum Chromium instalado encontrado.')
    profile = Path(tempfile.mkdtemp(prefix='esperanca-home-'))
    process = subprocess.Popen([str(browser), '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-port=0', f'--user-data-dir={profile}', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    client = None
    try:
        port_file = profile / 'DevToolsActivePort'
        for _ in range(150):
            if port_file.exists():
                break
            time.sleep(.1)
        port = int(port_file.read_text().splitlines()[0])
        with urllib.request.urlopen(f'http://127.0.0.1:{port}/json/list') as response:
            target = next(target for target in json.load(response) if target['type'] == 'page')
        client = CDP(target['webSocketDebuggerUrl'])
        client.call('Page.enable')
        client.call('Runtime.enable')
        client.call('Network.enable')
        report = {'layouts': [], 'interactions': {}}
        captures = ROOT / 'docs/screenshots'
        captures.mkdir(exist_ok=True)

        def viewport(width, height=844):
            client.call('Emulation.setDeviceMetricsOverride', {'width': width, 'height': height, 'deviceScaleFactor': 1, 'mobile': width < 900})
            client.call('Emulation.setTouchEmulationEnabled', {'enabled': width < 900})

        def layout(width, language='pt-BR', scale=1, height=844):
            viewport(width, height)
            client.navigate(origin + '/index.html')
            client.evaluate(f"""(async () => {{
              const picker = document.querySelector('#language-picker');
              picker.value = {json.dumps(language)};
              picker.dispatchEvent(new Event('change'));
              for (let i = 0; i < 100 && (document.documentElement.lang !== {json.dumps(language)} || document.documentElement.classList.contains('language-changing')); i++) await new Promise(resolve => setTimeout(resolve, 20));
              if (document.documentElement.lang !== {json.dumps(language)}) throw new Error('Idioma nao carregado');
              document.documentElement.style.setProperty('--font-scale', {scale});
              await new Promise(resolve => requestAnimationFrame(resolve));
            }})()""")
            result = {'width': width, 'height': height, 'language': language, 'scale': scale, **client.evaluate(LAYOUT)}
            report['layouts'].append(result)
            return result

        for width in (320, 360, 375, 390, 414, 599, 600, 768, 900, 1024, 1100, 1440):
            layout(width)
            if width == 390:
                shot = client.call('Page.captureScreenshot', {'format': 'png', 'captureBeyondViewport': True, 'clip': {'x': 0, 'y': 0, 'width': width, 'height': client.evaluate('document.documentElement.scrollHeight'), 'scale': 1}})
                (captures / f'home-mobile-{width}.png').write_bytes(base64.b64decode(shot['data']))
        layout(844, height=390)
        for language in ('pt-BR', 'en', 'de', 'fr', 'es-419', 'ru', 'zh-CN', 'ja', 'hi'):
            layout(320, language, 1.3)
            layout(390, language)
        print(f"{len(report['layouts'])} combinacoes de tela, idioma e tamanho de texto verificadas", flush=True)

        viewport(390)
        client.evaluate("localStorage.setItem('esperanca-language', 'pt-BR')")
        client.navigate(origin + '/index.html')
        report['interactions']['footer_controls'] = client.evaluate("""(() => {
          return document.querySelectorAll('#language-picker').length === 1
            && !!document.querySelector('.site-footer .footer-tools #language-picker')
            && !!document.querySelector('.site-header .nav-actions .nav-cta + .nav-accessibility[href="acessibilidade.html"]')
            && !document.querySelector('.site-footer .footer-tools a[href="acessibilidade.html"]')
            && !document.querySelector('.topbar select, .topbar a');
        })()""")
        report['interactions']['matching_chevrons'] = client.evaluate("""(async () => {
          document.querySelector('.menu-button').click();
          await new Promise(resolve => requestAnimationFrame(resolve));
          const picker = getComputedStyle(document.querySelector('.language-picker'), '::after');
          const matching = [...document.querySelectorAll('.nav-chevron')].length === 3
            && [...document.querySelectorAll('.nav-chevron')].every(arrow => {
              const style = getComputedStyle(arrow);
              return ['width','height','borderRightWidth','borderBottomWidth','borderRightStyle','borderBottomStyle','transform']
                .every(property => style[property] === picker[property]);
            });
          if (!matching) window.chevronMismatch = {
            picker: Object.fromEntries(['width','height','borderRightWidth','borderBottomWidth','borderRightStyle','borderBottomStyle','transform'].map(key => [key,picker[key]])),
            arrows: [...document.querySelectorAll('.nav-chevron')].map(arrow => {
              const style = getComputedStyle(arrow);
              return Object.fromEntries(['width','height','borderRightWidth','borderBottomWidth','borderRightStyle','borderBottomStyle','transform'].map(key => [key,style[key]]));
            }),
          };
          document.querySelector('.menu-button').click();
          return matching;
        })()""")
        if not report['interactions']['matching_chevrons']:
            print(json.dumps(client.evaluate('window.chevronMismatch')), flush=True)
        picker_point = client.evaluate("""(async () => {
          const picker = document.querySelector('#language-picker');
          picker.scrollIntoView({block:'center', behavior:'instant'});
          await new Promise(resolve => requestAnimationFrame(resolve));
          const rect = picker.getBoundingClientRect();
          return {x:rect.x + rect.width / 2, y:rect.y + rect.height / 2};
        })()""")
        client.call('Input.dispatchMouseEvent', {'type':'mousePressed', 'button':'left', 'clickCount':1, **picker_point})
        client.call('Input.dispatchMouseEvent', {'type':'mouseReleased', 'button':'left', 'clickCount':1, **picker_point})
        for key, code, virtual_key in [('ArrowDown', 'ArrowDown', 40), ('Enter', 'Enter', 13)]:
            client.call('Input.dispatchKeyEvent', {'type':'keyDown', 'key':key, 'code':code, 'windowsVirtualKeyCode':virtual_key})
            client.call('Input.dispatchKeyEvent', {'type':'keyUp', 'key':key, 'code':code, 'windowsVirtualKeyCode':virtual_key})
        report['interactions']['footer_language_selection'] = client.evaluate("""(async () => {
          for (let i = 0; i < 100 && document.documentElement.lang !== 'en'; i++) await new Promise(resolve => setTimeout(resolve, 20));
          return document.documentElement.lang === 'en' && document.querySelector('#language-picker').value === 'en';
        })()""")
        client.call('Input.dispatchKeyEvent', {'type':'keyDown', 'key':'Escape', 'code':'Escape', 'windowsVirtualKeyCode':27})
        client.call('Input.dispatchKeyEvent', {'type':'keyUp', 'key':'Escape', 'code':'Escape', 'windowsVirtualKeyCode':27})
        client.evaluate("scrollTo({top:0, behavior:'instant'}); new Promise(resolve => requestAnimationFrame(resolve))")
        report['interactions']['menu_toggle_escape'] = client.evaluate("""(() => {
          const button = document.querySelector('.menu-button'), nav = document.querySelector('#main-nav');
          button.click();
          const opened = button.getAttribute('aria-expanded') === 'true' && getComputedStyle(nav).display !== 'none';
          document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
          return opened && button.getAttribute('aria-expanded') === 'false' && document.activeElement === button;
        })()""")
        report['interactions']['menu_link_closes'] = client.evaluate("""(() => {
          const button = document.querySelector('.menu-button'); button.click();
          const link = document.querySelector('#main-nav a');
          link.addEventListener('click', event => event.preventDefault(), {once:true}); link.click();
          return button.getAttribute('aria-expanded') === 'false';
        })()""")
        viewport(320, 320)
        report['interactions']['short_screen_navigation'] = client.evaluate("""(() => {
          const button = document.querySelector('.menu-button');
          if (button.getAttribute('aria-expanded') !== 'true') button.click();
          document.querySelector('.nav-group').open = true;
          return new Promise(resolve => requestAnimationFrame(() => {
            const nav = document.querySelector('#main-nav');
            const rect = nav.getBoundingClientRect();
            nav.scrollTop = nav.scrollHeight;
            const link = nav.querySelector(':scope > ul > li:last-child > a');
            const last = link.getBoundingClientRect();
            const hit = document.elementFromPoint(last.x + last.width / 2, last.y + last.height / 2);
            resolve(rect.bottom <= innerHeight + 1 && last.bottom <= innerHeight + 1 && last.top >= rect.top && link.contains(hit));
          }));
        })()""")
        viewport(1440)
        client.evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
        viewport(390)
        client.evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
        report['interactions']['rotation_resets_menu'] = client.evaluate("document.querySelector('.menu-button').getAttribute('aria-expanded') === 'false' && !document.querySelector('.nav-group[open]')")
        client.call('Emulation.setScriptExecutionDisabled', {'value': True})
        client.navigate(origin + '/index.html')
        report['interactions']['no_js_navigation'] = client.evaluate("getComputedStyle(document.querySelector('#main-nav')).display !== 'none' && document.querySelectorAll('#main-nav a').length === 12")
        client.call('Emulation.setScriptExecutionDisabled', {'value': False})
        report['javascript_errors'] = [event['params'] for event in client.events if event.get('method') == 'Runtime.exceptionThrown']
        report['http_errors'] = [event['params']['response']['url'] for event in client.events if event.get('method') == 'Network.responseReceived' and event['params']['response']['status'] >= 400]
        (ROOT / 'docs/home-mobile-checks.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        failures = [item for item in report['layouts'] if item['overflow'] or item['outside'] or item['clippedText'] or item['missingImages'] or item['captionOverlap'] or not item['menuTarget'] or item['h1'] != 1]
        print(json.dumps({'layout_failures': failures, 'interactions': report['interactions'], 'javascript_errors': report['javascript_errors'], 'http_errors': report['http_errors']}, ensure_ascii=True, indent=2), flush=True)
        return bool(failures or not all(report['interactions'].values()) or report['javascript_errors'] or report['http_errors'])
    finally:
        if client:
            client.socket.close()
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=10)
        server.shutdown()
        if profile.resolve().parent == Path(tempfile.gettempdir()).resolve() and profile.name.startswith('esperanca-home-'):
            shutil.rmtree(profile, ignore_errors=True)


if __name__ == '__main__':
    raise SystemExit(run())
