"""Exercita CSP e síntese atualizada em Chromium, sem chamadas a serviços externos."""

import json

import check_contact
import browser_qa
from browser_qa import ROOT, QuietHandler


class SecurityHandler(QuietHandler):
    def end_headers(self):
        config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
        for header in config["headers"][0]["headers"]:
            self.send_header(header["key"], header["value"])
        super().end_headers()


def checks(client, origin):
    client.navigate(origin + "/index.html")
    result = {}
    result["csp_bloqueia_script_inline"] = client.evaluate("""(() => {
      const script = document.createElement('script');
      script.textContent = 'window.inlineInjection = true';
      document.head.append(script);
      return window.inlineInjection !== true;
    })()""")
    result["interface_carregada_com_csp"] = client.evaluate(
        "!!document.querySelector('.chat-launcher') && !!document.querySelector('.reader-launcher')"
    )
    result["csp_bloqueia_estilos_inline_injetados"] = client.evaluate("""(async () => {
      const probe = document.createElement('div');
      probe.id = 'security-style-probe';
      document.body.append(probe);
      const before = getComputedStyle(probe).position;
      const style = document.createElement('style');
      style.textContent = '#security-style-probe {position:fixed !important}';
      document.head.append(style);
      probe.setAttribute('style', 'position:fixed !important');
      await new Promise(resolve => requestAnimationFrame(resolve));
      const blocked = getComputedStyle(probe).position === before;
      style.remove(); probe.remove();
      return blocked;
    })()""")
    result["estilos_dinamicos_do_site_continuam_funcionando"] = client.evaluate("""(() => {
      const input = document.querySelector('#chat-question');
      input.style.height = '73px';
      const changed = getComputedStyle(input).height === '73px';
      input.style.removeProperty('height');
      return changed;
    })()""")
    synthesis = client.evaluate("""(async () => {
      const worker = new Worker('js/speech-worker.js', {type:'module'});
      let id = 0;
      const ask = (body) => new Promise((resolve, reject) => {
        const requestId = ++id;
        const timer = setTimeout(() => reject(new Error('speech timeout')), 30000);
        worker.onerror = (event) => {clearTimeout(timer); reject(new Error(event.message));};
        worker.onmessage = ({data}) => {
          if (data.id === requestId) {clearTimeout(timer); resolve(data);}
        };
        worker.postMessage({id:requestId, ...body});
      });
      const checks = {};
      try {
        const list = await ask({list:true});
        checks.lista_de_vozes = !list.error && ['pt-br','hi','ja','en-us'].every(v => list.voices.includes(v));
        const texts = {'pt-br':'Olá, mundo.', 'en-us':'Hello world.', 'es-419':'Hola mundo.',
          fr:'Bonjour le monde.', de:'Hallo Welt.', cmn:'你好世界。', ru:'Привет мир.', ja:'こんにちは。', hi:'नमस्ते दुनिया।'};
        for (const [voice,text] of Object.entries(texts)) {
          for (const gender of ['f3','m3']) {
            const data = await ask({voice:voice+'+'+gender, text, rate:1});
            const view = data.wav && new DataView(data.wav);
            let energy = 0;
            if (view) for (let offset = 44; offset < data.wav.byteLength; offset += 2) energy += Math.abs(view.getInt16(offset, true));
            checks[voice+'_'+gender] = !data.error && data.wav.byteLength > 44
              && view.getUint32(24,true) === 22050 && view.getUint32(40,true) === data.wav.byteLength-44 && energy > 0;
          }
        }
        for (const invalid of [{voice:'../../private'}, {text:'x'.repeat(6001)}, {rate:Infinity}, {rate:0}]) {
          const data = await ask({voice:'pt-br+f3', text:'Teste.', rate:1, ...invalid});
          checks['rejeita_'+Object.keys(invalid)[0]+'_'+String(Object.values(invalid)[0]).length] = data.error === 'invalid_speech_request';
        }
      } finally { worker.terminate(); }
      return checks;
    })()""")
    result.update(synthesis)
    result["sem_excecoes_javascript"] = not any(
        event.get("method") == "Runtime.exceptionThrown" for event in client.events
    )
    return result


if __name__ == "__main__":
    browser_qa.QuietHandler = SecurityHandler
    check_contact.run_browser_checks(checks)
