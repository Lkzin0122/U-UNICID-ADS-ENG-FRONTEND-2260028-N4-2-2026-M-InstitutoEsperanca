"""Prévia e verificações reais no Chromium instalado, sem dependências externas.

Uso: python scripts/browser_qa.py [--render-video]
O servidor e o navegador de teste são encerrados ao final.
"""
from pathlib import Path
import argparse
import base64
import hashlib
import http.server
import json
import os
import shutil
import socket
import struct
import subprocess
import tempfile
import threading
import time
import urllib.request
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *args):
        pass


class CDP:
    def __init__(self, url):
        parts = urlsplit(url)
        self.socket = socket.create_connection((parts.hostname, parts.port), timeout=45)
        self.serial = 0
        self.events = []
        key = base64.b64encode(os.urandom(16)).decode()
        request = f'GET {parts.path} HTTP/1.1\r\nHost: {parts.netloc}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n'
        self.socket.sendall(request.encode())
        header = b''
        while not header.endswith(b'\r\n\r\n'):
            header += self.socket.recv(1)
        if not header.startswith(b'HTTP/1.1 101 '):
            raise RuntimeError(header.decode())

    def read(self, length):
        result = b''
        while len(result) < length:
            chunk = self.socket.recv(length - len(result))
            if not chunk:
                raise RuntimeError('Browser disconnected')
            result += chunk
        return result

    def send(self, message, opcode=1):
        data = message.encode() if isinstance(message, str) else message
        mask = os.urandom(4)
        n = len(data)
        header = bytes([0x80 | opcode])
        header += bytes([0x80 | n]) if n < 126 else (bytes([0x80 | 126]) + struct.pack('!H', n) if n < 65536 else bytes([0x80 | 127]) + struct.pack('!Q', n))
        self.socket.sendall(header + mask + bytes(c ^ mask[i % 4] for i, c in enumerate(data)))

    def receive(self):
        fragments = b''
        while True:
            flags, length = self.read(2)
            opcode = flags & 15
            size = length & 127
            if size == 126:
                size = struct.unpack('!H', self.read(2))[0]
            elif size == 127:
                size = struct.unpack('!Q', self.read(8))[0]
            mask = self.read(4) if length & 128 else None
            data = self.read(size)
            if mask:
                data = bytes(c ^ mask[i % 4] for i, c in enumerate(data))
            if opcode == 9:
                self.send(data, opcode=10)
                continue
            if opcode == 8:
                raise RuntimeError('Websocket closed')
            fragments += data
            if flags & 128:
                return json.loads(fragments)

    def call(self, method, params=None):
        self.serial += 1
        number = self.serial
        self.send(json.dumps({'id': number, 'method': method, 'params': params or {}}))
        while True:
            message = self.receive()
            if message.get('id') == number:
                if 'error' in message:
                    raise RuntimeError(message['error'])
                return message.get('result', {})
            self.events.append(message)

    def evaluate(self, expression):
        result = self.call('Runtime.evaluate', {'expression': expression, 'returnByValue': True, 'awaitPromise': True})
        if result.get('exceptionDetails'):
            raise RuntimeError(result['exceptionDetails'])
        return result.get('result', {}).get('value')

    def navigate(self, url):
        self.call('Page.navigate', {'url': url})
        for _ in range(100):
            time.sleep(.08)
            try:
                if self.evaluate('document.readyState') == 'complete':
                    return
            except RuntimeError:
                pass
        raise RuntimeError('Page load timed out: ' + url)


def run(render_video=False):
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}'
    browsers = [Path('C:/Program Files/Google/Chrome/Application/chrome.exe'), Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')]
    browser = next((p for p in browsers if p.exists()), None)
    if not browser:
        raise RuntimeError('Nenhum Chromium instalado encontrado.')
    profile = Path(tempfile.mkdtemp(prefix='esperanca-browser-'))
    process = subprocess.Popen([str(browser), '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-port=0', f'--user-data-dir={profile}', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        port_file = profile / 'DevToolsActivePort'
        for _ in range(150):
            if port_file.exists():
                break
            time.sleep(.1)
        port = int(port_file.read_text().splitlines()[0])
        with urllib.request.urlopen(f'http://127.0.0.1:{port}/json/list') as response:
            target = next(t for t in json.load(response) if t['type'] == 'page')
        client = CDP(target['webSocketDebuggerUrl'])
        client.call('Page.enable')
        client.call('Runtime.enable')
        if render_video:
            client.navigate(origin + '/assets/render-video.html')
            result = client.evaluate('window.renderVideo()')
            (ROOT / 'assets/manifesto.webm').write_bytes(base64.b64decode(result['base64']))
            print(f"Video gravado: {result['bytes']} bytes", flush=True)

        report = {'pages': [], 'interactions': {}, 'javascript_errors': []}
        captures = ROOT / 'docs/screenshots'
        captures.mkdir(parents=True, exist_ok=True)
        for width, height in [(1440, 1000), (768, 1024), (390, 844)]:
            client.call('Emulation.setDeviceMetricsOverride', {'width': width, 'height': height, 'deviceScaleFactor': 1, 'mobile': width < 600})
            for page in sorted(ROOT.glob('*.html')):
                client.navigate(origin + '/' + page.name)
                info = client.evaluate("""(async () => {
                  document.querySelectorAll('img[loading="lazy"]').forEach(image => image.loading = 'eager');
                  await Promise.race([Promise.all([...document.images].map(image => image.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve,3000))]);
                  const missingImages = [...document.images].filter(i => i.hasAttribute('src') && !i.naturalWidth).map(i => i.getAttribute('src'));
                  const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
                  const offenders = [...document.body.querySelectorAll('*')].filter(e => { const r=e.getBoundingClientRect(); return r.width > 0 && r.right > window.innerWidth + 2 && getComputedStyle(e).position !== 'absolute' && !e.closest('.table-wrap'); }).slice(0,6).map(e => e.tagName+'.'+e.className);
                  return { title: document.title, h1: document.querySelectorAll('h1').length, missingImages, overflow, offenders };
                })()""")
                report['pages'].append({'page': page.name, 'width': width, **info})
                if page.name in ('index.html', 'projetos.html', 'contato.html', 'galeria.html', 'acessibilidade.html'):
                    screenshot = client.call('Page.captureScreenshot', {'format': 'png', 'captureBeyondViewport': False})
                    (captures / f'{page.stem}-{width}.png').write_bytes(base64.b64decode(screenshot['data']))
            print(f'12 paginas verificadas em {width}px', flush=True)

        client.navigate(origin + '/index.html')
        report['interactions']['mobile_menu'] = client.evaluate("""(() => { const b=document.querySelector('.menu-button');b.click();const open=b.getAttribute('aria-expanded')==='true' && getComputedStyle(document.querySelector('#main-nav')).display!=='none';document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return open && b.getAttribute('aria-expanded')==='false';})()""")
        for filename in ('projetos.html', 'noticias.html', 'galeria.html'):
            client.navigate(origin + '/' + filename)
            report['interactions']['filters_' + filename] = client.evaluate("""(() => { const group=document.querySelector('[data-filter-group]');const buttons=[...group.querySelectorAll('[data-filter]')];return buttons.every(b=>{b.click();return [...group.querySelectorAll('[data-filter-item]')].every(i=>i.hidden === !(['all','todos'].includes(b.dataset.filter)||i.dataset.category.split(' ').includes(b.dataset.filter))) && b.getAttribute('aria-pressed')==='true';});})()""")
        client.evaluate("document.querySelector('[data-filter]').click()")
        report['interactions']['gallery_dialog'] = client.evaluate("""(() => { document.querySelector('[data-lightbox]').click();const d=document.querySelector('#image-dialog');const open=d.open && !!document.querySelector('#dialog-image').getAttribute('src');d.querySelector('button').click();return open&&!d.open; })()""")
        client.navigate(origin + '/acessibilidade.html')
        report['interactions']['accessibility_controls'] = client.evaluate("""(() => {document.querySelector('[data-font-size="increase"]').click();document.querySelector('[data-contrast-toggle]').click();return document.documentElement.style.getPropertyValue('--font-scale')==='1.1'&&document.documentElement.classList.contains('high-contrast');})()""")
        client.navigate(origin + '/sobre.html')
        report['interactions']['preferences_persist'] = client.evaluate("document.documentElement.style.getPropertyValue('--font-scale') === '1.1' && document.documentElement.classList.contains('high-contrast')")
        client.evaluate("localStorage.removeItem('esperanca-visual-preferences')")
        client.navigate(origin + '/contato.html?assunto=voluntariado')
        report['interactions']['contact_subject'] = client.evaluate("document.querySelector('#assunto').value === 'voluntariado'")
        report['interactions']['native_validation'] = client.evaluate("document.querySelector('#contact-form').checkValidity() === false")
        client.evaluate("window.intlTelInput.getInstance(document.querySelector('#telefone')).promise.then(() => true)")
        for country, digits, expected, prefix in [('br', '11912345678', '(11) 91234-5678', '+55'), ('us', '2015550123', '(201) 555-0123', '+1')]:
            client.evaluate("(() => {const input=document.querySelector('#telefone');input.value='';window.intlTelInput.getInstance(input).setSelectedCountry(" + json.dumps(country) + ");input.focus();input.dispatchEvent(new Event('input',{bubbles:true}));})()")
            for digit in digits:
                client.call('Input.insertText', {'text': digit})
            report['interactions']['phone_' + country] = client.evaluate("document.querySelector('#telefone').value === " + json.dumps(expected) + " && document.querySelector('.iti__selected-dial-code').textContent === " + json.dumps(prefix) + " && document.querySelector('#telefone').checkValidity()")
        client.evaluate("(() => {const input=document.querySelector('#telefone');input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));})()")
        report['interactions']['contact_preview'] = client.evaluate("""(() => { for (const [id,value] of Object.entries({nome:'Pessoa de teste', email:'institutoesperancaunicid@outlook.com', mensagem:'Quero conhecer as propostas de voluntariado.'})) document.getElementById(id).value=value;document.querySelector('#contact-form').requestSubmit();return !document.querySelector('#form-result').hidden && document.querySelector('#message-preview').textContent.includes('Pessoa de teste') && location.search === '?assunto=voluntariado';})()""")
        report['interactions']['contact_email'] = client.evaluate("""(() => { const address = new URL(document.querySelector('#send-message').href);return address.protocol === 'mailto:' && address.pathname === 'institutoesperancaunicid@outlook.com' && address.searchParams.get('body').includes('Pessoa de teste') && address.searchParams.get('subject').includes('Voluntariado');})()""")
        report['interactions']['contact_edit_invalidates'] = client.evaluate("""(() => { document.querySelector('#nome').dispatchEvent(new Event('input',{bubbles:true}));return document.querySelector('#form-result').hidden;})()""")
        client.navigate(origin + '/perguntas-frequentes.html')
        report['interactions']['faq'] = client.evaluate("""(() => {const d=document.querySelector('.faq-list details');const before=d.open;d.querySelector('summary').click();return d.open!==before;})()""")
        client.navigate(origin + '/midia.html')
        report['interactions']['media'] = client.evaluate("""(async () => { const players=[...document.querySelectorAll('video,audio')];return await Promise.all(players.map(p=>new Promise(resolve=>{p.load();const finish=()=>resolve({tag:p.tagName,ready:p.readyState>0,error:p.error?.message||null,duration:p.duration});p.addEventListener('loadedmetadata',finish,{once:true});p.addEventListener('error',finish,{once:true});setTimeout(finish,4000)})));})()""")
        client.call('Emulation.setScriptExecutionDisabled', {'value': True})
        client.navigate(origin + '/index.html')
        # Runtime.evaluate is still available; page scripts stay disabled.
        report['interactions']['no_js_navigation'] = client.evaluate("getComputedStyle(document.querySelector('#main-nav')).display !== 'none' && document.querySelectorAll('#main-nav a').length === 12")
        client.call('Emulation.setScriptExecutionDisabled', {'value': False})
        report['javascript_errors'] = [e['params'].get('exceptionDetails', {}) for e in client.events if e.get('method') == 'Runtime.exceptionThrown']
        (ROOT / 'docs/browser-checks.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        failures = [p for p in report['pages'] if p['overflow'] or p['missingImages'] or p['h1'] != 1]
        print(json.dumps({'page_failures':failures,'interactions':report['interactions'],'js_errors':report['javascript_errors']}, ensure_ascii=True, indent=2), flush=True)
        client.socket.close()
        return report
    finally:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
        server.shutdown()
        # Exclusão limitada ao perfil temporário criado por este processo.
        temp_root = Path(tempfile.gettempdir()).resolve()
        if profile.resolve().parent == temp_root and profile.name.startswith('esperanca-browser-'):
            shutil.rmtree(profile, ignore_errors=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--render-video', action='store_true')
    args = parser.parse_args()
    run(args.render_video)
