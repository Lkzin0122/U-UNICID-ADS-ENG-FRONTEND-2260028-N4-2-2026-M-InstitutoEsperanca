"""Verifica o chat no Chromium instalado, sem chamar provedores de IA.

Execute: python scripts/check_chat_browser.py.
"""
import base64
import http.server
import json
import shutil
import subprocess
import tempfile
import threading
import time
import urllib.request
from pathlib import Path

from browser_qa import CDP, QuietHandler, ROOT


def run():
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}'
    browsers = [Path('C:/Program Files/Google/Chrome/Application/chrome.exe'), Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')]
    browser = next((candidate for candidate in browsers if candidate.exists()), None)
    if not browser:
        raise RuntimeError('Nenhum Chromium instalado encontrado.')
    profile = Path(tempfile.mkdtemp(prefix='esperanca-chat-'))
    process = subprocess.Popen([str(browser), '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-port=0', f'--user-data-dir={profile}', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    client = None
    checks = {}
    try:
        port_file = profile / 'DevToolsActivePort'
        for _ in range(150):
            if port_file.exists():
                break
            time.sleep(.1)
        port = int(port_file.read_text().splitlines()[0])
        with urllib.request.urlopen(f'http://127.0.0.1:{port}/json/list') as response:
            target = next(item for item in json.load(response) if item['type'] == 'page')
        client = CDP(target['webSocketDebuggerUrl'])
        client.call('Page.enable')
        client.call('Runtime.enable')
        client.navigate(origin + '/index.html')
        client.evaluate("""window.chatCalls=[]; window.chatReply=async()=>({ok:false,status:503,json:async()=>({code:'ollama_offline',error:'A IA local está indisponível.'})}); window.fetch=(url,options)=>{chatCalls.push(JSON.parse(options.body)); return chatReply();};""")
        checks['initially_closed'] = client.evaluate("document.querySelector('.chat-panel').hidden && document.querySelector('.chat-launcher').getAttribute('aria-expanded')==='false'")
        client.evaluate("document.querySelector('.chat-launcher').click()")
        checks['open_focus_label'] = client.evaluate("document.activeElement.id==='chat-question' && !!document.querySelector('label[for=chat-question]')")
        checks['whitespace_blocked'] = client.evaluate("(()=>{const q=document.querySelector('#chat-question');q.value='   ';document.querySelector('.chat-form').requestSubmit();return !q.checkValidity()&&chatCalls.length===0;})()")
        client.evaluate("document.querySelector('#chat-question').dispatchEvent(new Event('input'));document.querySelector('.chat-suggestions button').click()")
        wait_ready(client)
        checks['offline_is_error_not_fake_answer'] = client.evaluate("!document.querySelector('.chat-error').hidden && document.querySelectorAll('.chat-message[data-role=assistant]').length===1 && !sessionStorage.getItem('esperanca-chat-session-v2')")
        checks['failed_question_preserved'] = client.evaluate("document.querySelector('#chat-question').value==='Quais são os projetos?'")
        client.evaluate("""window.chatReply=async()=>({ok:true,status:200,json:async()=>({mode:'ai',answer:'A proposta inclui educação, inclusão e sustentabilidade. Qual frente gostaria de conhecer?',sources:[{id:'education',title:'Educação',url:'projetos.html#educacao'}]})});document.querySelector('.chat-retry').click();""")
        wait_ready(client)
        checks['retry_no_duplicate_user'] = client.evaluate("document.querySelectorAll('.chat-message[data-role=user]').length===1 && document.querySelector('.chat-error').hidden")
        checks['counter_clears'] = client.evaluate("document.querySelector('#chat-count').textContent==='0/1000 caracteres'")
        checks['session_stores_successful_pairs'] = client.evaluate("JSON.parse(sessionStorage.getItem('esperanca-chat-session-v2')).messages.length===2")
        client.evaluate("document.querySelector('#chat-question').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))")
        checks['escape_restores_focus'] = client.evaluate("document.querySelector('.chat-panel').hidden && document.activeElement.classList.contains('chat-launcher')")
        client.evaluate("document.querySelector('.chat-launcher').click();document.querySelector('#chat-question').value='Como posso participar dessa frente?';document.querySelector('#chat-question').dispatchEvent(new Event('input'))")
        checks['shift_enter_does_not_send'] = client.evaluate("(()=>{const count=chatCalls.length;const event=new KeyboardEvent('keydown',{key:'Enter',shiftKey:true,bubbles:true,cancelable:true});document.querySelector('#chat-question').dispatchEvent(event);return chatCalls.length===count&&!event.defaultPrevented;})()")
        client.evaluate("document.querySelector('#chat-question').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}))")
        wait_ready(client)
        checks['enter_sends_context'] = client.evaluate("chatCalls.at(-1).history.length===2 && chatCalls.at(-1).message.includes('dessa frente')")
        client.navigate(origin + '/projetos.html')
        checks['conversation_survives_navigation'] = client.evaluate("document.querySelectorAll('.chat-message').length===4 && JSON.parse(sessionStorage.getItem('esperanca-chat-session-v2')).messages.length===4")
        client.evaluate("""window.chatCalls=[];window.fetch=(url,options)=>{chatCalls.push(JSON.parse(options.body));return new Promise(resolve=>{window.completeChat=()=>resolve({ok:true,status:200,json:async()=>({mode:'ai',answer:'<script>window.chatInjected=true</script> Envie uma mensagem de interesse à equipe.',sources:[{id:'a',title:'Contato',url:'contato.html?assunto=voluntariado'},{id:'b',title:'Fonte insegura',url:'javascript:alert(1)'},{id:'c',title:'Documento revisado',url:null}]})});});};document.querySelector('.chat-launcher').click();document.querySelector('#chat-question').value='<img src=x onerror=alert(1)> Como colaborar?';document.querySelector('.chat-form').requestSubmit();""")
        checks['duplicate_submit_blocked'] = client.evaluate("(()=>{document.querySelector('.chat-form').dispatchEvent(new Event('submit',{cancelable:true}));return chatCalls.length===1&&document.querySelector('.chat-send').disabled;})()")
        client.evaluate('completeChat()')
        wait_ready(client)
        checks['text_and_links_safe'] = client.evaluate("!window.chatInjected&&!document.querySelector('.chat-log script,.chat-log img')&&document.querySelectorAll('.chat-message:last-child a').length===1&&document.querySelectorAll('.chat-message:last-child .chat-sources span').length===1")
        client.evaluate("document.querySelectorAll('.chat-suggestions button')[2].click();document.querySelector('.chat-reset').click();completeChat();")
        time.sleep(.1)
        checks['reset_discards_pending_response'] = client.evaluate("document.querySelectorAll('.chat-message').length===1&&!document.querySelector('.chat-send').disabled")
        checks['reset_removes_session'] = client.evaluate("!sessionStorage.getItem('esperanca-chat-session-v2')")
        checks['no_local_storage_transcript'] = client.evaluate("!Object.keys(localStorage).some(key=>/chat/i.test(key))")
        for width, height in [(320, 740), (390, 844), (768, 1024), (1440, 1000), (667, 375)]:
            client.call('Emulation.setDeviceMetricsOverride', {'width': width, 'height': height, 'deviceScaleFactor': 1, 'mobile': width < 700})
            checks[f'fits_{width}x{height}'] = client.evaluate("(()=>{const panel=document.querySelector('.chat-panel');panel.scrollTop=panel.scrollHeight;const r=panel.getBoundingClientRect();const f=document.querySelector('.chat-form').getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&f.bottom<=r.bottom+1&&document.documentElement.scrollWidth<=innerWidth;})()")
            if width == 390:
                screenshot = client.call('Page.captureScreenshot', {'format': 'png'})
                (ROOT / 'docs/screenshots/chatbot-390.png').write_bytes(base64.b64decode(screenshot['data']))
        client.call('Emulation.setDeviceMetricsOverride', {'width': 390, 'height': 844, 'deviceScaleFactor': 1, 'mobile': True})
        client.evaluate("document.documentElement.style.fontSize='200%'")
        checks['text_200_percent_accessible_with_scroll'] = client.evaluate("(()=>{const panel=document.querySelector('.chat-panel');panel.scrollTop=panel.scrollHeight;return panel.scrollWidth<=panel.clientWidth&&document.querySelector('.chat-form').getBoundingClientRect().bottom<=panel.getBoundingClientRect().bottom+1;})()")
        client.evaluate("document.documentElement.style.fontSize=''")
        for theme in ['', 'theme-dark', 'high-contrast', 'theme-dark high-contrast']:
            client.evaluate(f"document.documentElement.className={json.dumps(theme)}")
            checks[f'contrast_{theme or "light"}'] = client.evaluate(r"""(() => {
              const luminance=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722};
              return ['.chat-launcher','.chat-send','.chat-close'].every(selector=>{const s=getComputedStyle(document.querySelector(selector));const a=luminance(s.color),b=luminance(s.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5});
            })()""")
        for page in sorted(ROOT.glob('*.html')):
            client.navigate(origin + '/' + page.name)
            checks[f'widget_{page.stem}'] = client.evaluate("document.querySelectorAll('.chat-launcher').length===1")
        report = {'checks': checks, 'passed': sum(checks.values()), 'total': len(checks)}
        (ROOT / 'docs/chatbot-checks.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(json.dumps(report, ensure_ascii=False, indent=2))
        if not all(checks.values()):
            raise RuntimeError('Falhas: ' + ', '.join(key for key, value in checks.items() if not value))
    finally:
        if client:
            client.socket.close()
        process.terminate()
        process.wait(timeout=15)
        server.shutdown()
        shutil.rmtree(profile, ignore_errors=True)


def wait_ready(client):
    for _ in range(100):
        if client.evaluate("!document.querySelector('.chat-send').disabled"):
            return
        time.sleep(.05)
    raise RuntimeError('Resposta do chat excedeu o tempo de teste.')


if __name__ == '__main__':
    run()
