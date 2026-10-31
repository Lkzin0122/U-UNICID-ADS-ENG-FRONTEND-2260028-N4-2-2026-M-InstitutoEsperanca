"""Verifica o contato no Chromium instalado: python scripts/check_contact.py.

As chamadas ao EmailJS são simuladas no navegador; nenhum e-mail é enviado.
"""
import json
from pathlib import Path


def check_contact(client, origin):
    checks = {}
    client.navigate(origin + '/contato.html?assunto=voluntariado')
    client.evaluate("window.intlTelInput.getInstance(document.querySelector('#telefone')).promise.then(() => true)")
    checks['subject_from_link'] = client.evaluate("document.querySelector('#assunto').value === 'voluntariado'")
    client.evaluate("""(() => {
      window.contactTest = {
        calls: [],
        errors: [],
        fill(phone = '') {
          const values = {nome:'  Pessoa de teste  ', email:'pessoa@example.com', assunto:'voluntariado', mensagem:'Quero conhecer as propostas de voluntariado.'};
          for (const [id, value] of Object.entries(values)) {
            const field = document.getElementById(id);
            field.value = value;
            field.dispatchEvent(new Event('input', {bubbles:true}));
          }
          const input = document.querySelector('#telefone');
          window.intlTelInput.getInstance(input).setNumber(phone);
          input.dispatchEvent(new Event('input', {bubbles:true}));
        },
        config: {serviceId:'service_test', templateId:'template_test', publicKey:'public_test'},
      };
      const originalConsoleError = console.error;
      console.error = (...args) => {
        contactTest.errors.push(args);
        originalConsoleError.apply(console, args);
      };
      window.fetch = (url, options) => {
        if (url !== 'https://api.emailjs.com/api/v1.0/email/send') throw new Error('Endpoint inesperado');
        contactTest.calls.push({url, method:options.method, headers:options.headers, body:JSON.parse(options.body)});
        return contactTest.reply(options);
      };
      contactTest.reply = () => Promise.resolve({ok:true, status:200});
      window.ESPERANCA_EMAILJS = contactTest.config;
    })()""")
    checks['required_fields_block_request'] = client.evaluate("""(() => {
      document.querySelector('#contact-form').requestSubmit();
      return !document.querySelector('#contact-form').checkValidity() && contactTest.calls.length === 0;
    })()""")
    checks['whitespace_message_blocked'] = client.evaluate("""(() => {
      contactTest.fill();
      document.querySelector('#mensagem').value = '          ';
      document.querySelector('#contact-form').requestSubmit();
      return !document.querySelector('#mensagem').checkValidity() && contactTest.calls.length === 0;
    })()""")
    checks['invalid_email_blocked'] = client.evaluate("""(() => {
      contactTest.fill();
      document.querySelector('#email').value = 'email-invalido';
      document.querySelector('#contact-form').requestSubmit();
      return !document.querySelector('#email').checkValidity() && contactTest.calls.length === 0;
    })()""")
    checks['invalid_phone_blocked'] = client.evaluate("""(() => {
      contactTest.fill('11');
      document.querySelector('#contact-form').requestSubmit();
      return !document.querySelector('#telefone').checkValidity() && contactTest.calls.length === 0;
    })()""")
    checks['missing_config_preserves_message'] = client.evaluate("""(() => {
      contactTest.fill();
      window.ESPERANCA_EMAILJS = {};
      document.querySelector('#contact-form').requestSubmit();
      return contactTest.calls.length === 0 && document.querySelector('#form-result').dataset.state === 'error'
        && !document.querySelector('#contact-fallback').hidden && !!document.querySelector('#mensagem').value;
    })()""")
    checks['pending_blocks_duplicate_requests'] = client.evaluate("""(() => {
      window.ESPERANCA_EMAILJS = contactTest.config;
      contactTest.fill('+5511912345678');
      contactTest.reply = () => new Promise(resolve => { contactTest.complete = () => resolve({ok:true,status:200}); });
      const form = document.querySelector('#contact-form');
      form.requestSubmit();
      form.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
      return contactTest.calls.length === 1 && document.querySelector('#contact-fields').disabled
        && form.getAttribute('aria-busy') === 'true' && document.querySelector('#form-result').dataset.state === 'sending'
        && document.querySelector('#contact-submit-label').textContent === 'Enviando…';
    })()""")
    checks['api_payload'] = client.evaluate("""(() => {
      const call = contactTest.calls[0];
      const body = call.body;
      const params = body.template_params;
      return call.method === 'POST' && call.headers['Content-Type'] === 'application/json'
        && body.service_id === 'service_test' && body.template_id === 'template_test' && body.user_id === 'public_test'
        && params.from_name === 'Pessoa de teste' && params.reply_to === 'pessoa@example.com'
        && params.phone === libphonenumber.parsePhoneNumberFromString('+5511912345678').formatInternational() && params.subject === 'Voluntariado'
        && params.message === 'Quero conhecer as propostas de voluntariado.';
    })()""")
    checks['success_clears_fields_and_restores_button'] = client.evaluate("""(async () => {
      contactTest.complete();
      await new Promise(resolve => setTimeout(resolve, 0));
      return document.querySelector('#form-result').dataset.state === 'success'
        && !document.querySelector('#form-result').hidden && document.querySelector('#contact-fallback').hidden
        && !document.querySelector('#nome').value && !document.querySelector('#mensagem').value
        && !document.querySelector('#telefone').value && !document.querySelector('#contact-fields').disabled
        && document.querySelector('#contact-form').getAttribute('aria-busy') === 'false'
        && document.activeElement.id === 'form-result' && document.querySelector('#contact-submit-label').textContent === 'Enviar mensagem';
    })()""")
    for status in (400, 401, 403, 429, 500):
        checks[f'http_{status}_preserves_message'] = client.evaluate("""(async () => {
          contactTest.fill();
          const before = contactTest.calls.length;
          contactTest.reply = () => Promise.resolve({ok:false,status:""" + str(status) + """,text:async () => 'Simulated API error'});
          document.querySelector('#contact-form').requestSubmit();
          await new Promise(resolve => setTimeout(resolve, 0));
          const fallback = new URL(document.querySelector('#contact-fallback').href);
          return contactTest.calls.length === before + 1 && document.querySelector('#form-result').dataset.state === 'error'
            && document.querySelector('#mensagem').value.includes('voluntariado') && !document.querySelector('#contact-fields').disabled
            && !document.querySelector('#contact-fallback').hidden && fallback.protocol === 'mailto:'
            && fallback.pathname === 'institutoesperancaunicid@outlook.com' && fallback.searchParams.get('body').includes('Pessoa de teste')
            && (""" + str(status) + """ !== 429 || document.querySelector('#form-status').textContent.includes('Aguarde um minuto'))
            && location.search === '?assunto=voluntariado';
        })()""")
    checks['missing_template_preserves_message_and_reports_unavailable'] = client.evaluate("""(async () => {
      contactTest.fill();
      contactTest.reply = () => Promise.resolve({ok:false,status:400,text:async () => 'The template ID not found. To find this ID, visit https://dashboard.emailjs.com/admin/templates'});
      document.querySelector('#contact-form').requestSubmit();
      await new Promise(resolve => setTimeout(resolve, 0));
      return document.querySelector('#form-status').textContent === 'O envio pelo site está temporariamente indisponível. Use o e-mail do Instituto para entrar em contato.'
        && !!document.querySelector('#mensagem').value && !document.querySelector('#contact-fallback').hidden
        && !document.querySelector('#contact-fields').disabled && contactTest.errors.at(-1)[1].status === 400;
    })()""")
    checks['api_error_diagnostic_without_key_or_form'] = client.evaluate("""(async () => {
      contactTest.fill();
      contactTest.reply = () => Promise.resolve({ok:false,status:422,text:async () => 'The recipients address is corrupted; public_test; pessoa@example.com; Pessoa de teste'});
      document.querySelector('#contact-form').requestSubmit();
      await new Promise(resolve => setTimeout(resolve, 0));
      const error = contactTest.errors.at(-1);
      const logged = JSON.stringify(error);
      return error[1].status === 422 && error[1].detail.includes('The recipients address is corrupted')
        && !logged.includes('public_test') && !logged.includes('pessoa@example.com') && !logged.includes('Pessoa de teste')
        && document.querySelector('#form-result').dataset.state === 'error' && !!document.querySelector('#mensagem').value;
    })()""")
    checks['unreadable_error_body_preserves_http_status'] = client.evaluate("""(async () => {
      contactTest.fill();
      contactTest.reply = () => Promise.resolve({ok:false,status:403,text:async () => { throw new TypeError('Body unavailable'); }});
      document.querySelector('#contact-form').requestSubmit();
      await new Promise(resolve => setTimeout(resolve, 0));
      return contactTest.errors.at(-1)[1].status === 403 && !document.querySelector('#contact-fields').disabled
        && document.querySelector('#form-status').textContent === 'Não foi possível enviar sua mensagem. Tente novamente ou use o e-mail do Instituto.';
    })()""")
    checks['network_failure_preserves_message'] = client.evaluate("""(async () => {
      contactTest.fill();
      contactTest.reply = () => Promise.reject(new TypeError('Simulated network failure'));
      document.querySelector('#contact-form').requestSubmit();
      await new Promise(resolve => setTimeout(resolve, 0));
      return document.querySelector('#form-status').textContent.includes('Confira sua conexão')
        && !!document.querySelector('#mensagem').value && !document.querySelector('#contact-fields').disabled;
    })()""")
    checks['timeout_does_not_retry'] = client.evaluate("""(async () => {
      contactTest.fill();
      const nativeTimeout = window.setTimeout;
      const before = contactTest.calls.length;
      window.setTimeout = (handler, ms, ...args) => nativeTimeout(handler, ms === 20000 ? 5 : ms, ...args);
      try {
        contactTest.reply = options => new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => reject(new DOMException('Timeout', 'AbortError')), {once:true});
        });
        document.querySelector('#contact-form').requestSubmit();
        await new Promise(resolve => nativeTimeout(resolve, 30));
        return contactTest.calls.length === before + 1 && document.querySelector('#form-status').textContent.includes('confirmar o envio')
          && !!document.querySelector('#mensagem').value && !document.querySelector('#contact-fields').disabled;
      } finally { window.setTimeout = nativeTimeout; }
    })()""")
    checks['editing_clears_status'] = client.evaluate("""(() => {
      document.querySelector('#nome').dispatchEvent(new Event('input', {bubbles:true}));
      return document.querySelector('#form-result').hidden;
    })()""")
    for locale in ('en', 'zh-CN', 'de', 'fr', 'es-419', 'ru', 'ja', 'hi', 'pt-BR'):
        checks['translation_' + locale] = client.evaluate("""(async () => {
          const locale = """ + json.dumps(locale) + """;
          const picker = document.querySelector('#language-picker');
          picker.value = locale;
          picker.dispatchEvent(new Event('change', {bubbles:true}));
          for (let i=0; i<100 && document.documentElement.lang !== locale; i++) await new Promise(resolve => setTimeout(resolve, 20));
          await window.intlTelInput.getInstance(document.querySelector('#telefone')).promise;
          const t = window.esperancaI18n.t;
          contactTest.fill();
          window.ESPERANCA_EMAILJS = {};
          document.querySelector('#contact-form').requestSubmit();
          return document.documentElement.lang === locale && document.querySelector('#contact-submit-label').textContent === t('Enviar mensagem')
            && (locale === 'pt-BR' || t('Enviar mensagem') !== 'Enviar mensagem')
            && document.querySelector('#form-status').textContent === t('O envio pelo site está temporariamente indisponível. Use o e-mail do Instituto para entrar em contato.');
        })()""")
    for width, height in ((390, 844), (768, 1024), (1440, 1000)):
        client.call('Emulation.setDeviceMetricsOverride', {'width': width, 'height': height, 'deviceScaleFactor': 1, 'mobile': width < 600})
        checks[f'layout_{width}'] = client.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1')
    client.call('Emulation.setScriptExecutionDisabled', {'value': True})
    try:
        client.navigate(origin + '/contato.html')
        checks['no_javascript_email_available'] = client.evaluate("""document.querySelector('[href="mailto:institutoesperancaunicid@outlook.com"]') !== null
          && document.querySelector('#contact-form button[type="submit"]').hidden""")
    finally:
        client.call('Emulation.setScriptExecutionDisabled', {'value': False})
    checks['no_javascript_errors'] = not any(event.get('method') == 'Runtime.exceptionThrown' for event in client.events)
    return checks


def run_browser_checks(check=check_contact):
    import http.server
    import os
    import shutil
    import subprocess
    import tempfile
    import threading
    import time
    import urllib.request
    from browser_qa import CDP, QuietHandler

    browsers = (Path('C:/Program Files/Google/Chrome/Application/chrome.exe'), Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'))
    requested = os.environ.get('ESPERANCA_TEST_BROWSER')
    browser = browsers[1] if requested == 'edge' and browsers[1].exists() else next((path for path in browsers if path.exists()), None)
    if browser is None:
        raise RuntimeError('Nenhum Chromium instalado encontrado.')
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    profile = Path(tempfile.mkdtemp(prefix='esperanca-contact-'))
    process = None
    client = None
    try:
        process = subprocess.Popen([str(browser), '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-port=0', f'--user-data-dir={profile}', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
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
        checks = check(client, f'http://127.0.0.1:{server.server_port}')
        print(json.dumps(checks, ensure_ascii=True, indent=2), flush=True)
        if not all(checks.values()):
            raise RuntimeError('Falhas: ' + ', '.join(key for key, passed in checks.items() if not passed))
    finally:
        if client:
            client.socket.close()
        if process:
            process.terminate()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=10)
        server.shutdown()
        server.server_close()
        if profile.resolve().parent == Path(tempfile.gettempdir()).resolve() and profile.name.startswith('esperanca-contact-'):
            shutil.rmtree(profile, ignore_errors=True)


if __name__ == '__main__':
    run_browser_checks()
