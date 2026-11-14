"""Audita a cobertura em hindi e os controles reais; não envia e-mails."""

import json
from pathlib import Path

from check_contact import run_browser_checks

ROOT = Path(__file__).resolve().parent.parent

BASELINE = r"""(() => {
  const records = [];
  const add = (element, key, attribute = null) => records.push({element, key, attribute});
  document.querySelectorAll('h1,h2,h3').forEach(element => {
    if (!element.closest('[data-no-translate]')) add(element, '__heading__' + (element.innerText || element.textContent).replace(/\s+/g,' ').trim());
  });
  const walker = document.createTreeWalker(document, NodeFilter.SHOW_TEXT); let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue.trim() && !node.parentElement?.closest('script,style,noscript,h1,h2,h3,select#language-picker,[data-no-translate],.iti')) add(node, node.nodeValue.trim());
  }
  document.querySelectorAll('*').forEach(element => {
    if (element.closest('[data-no-translate],.iti')) return;
    for (const attribute of ['alt','title','aria-label','placeholder','data-caption','label']) {
      const value = element.getAttribute(attribute); if (value?.trim()) add(element, value.trim(), attribute);
    }
  });
  document.querySelectorAll('meta[name="description"]').forEach(element => add(element, element.content, 'content'));
  window.hindiBaseline = records;
})()"""

COVERAGE = r"""(() => {
  const pack = window.esperancaTranslationPacks.hi;
  const neutral = new Set(['Ctrl','Tab','Shift','Enter','Esc','A+','A−','W3C','Vercel','Hobby','GitHub',
    'Instituto Esperança','Registro.br','.com.br · Registro.br','Porkbun','.org · Porkbun',
    'Namecheap','.com · Namecheap','Unsplash','Larm Rmah / Unsplash','Element5 Digital / Unsplash',
    'Jonathan Santos dos Anjos','Addiel Anthonny Arguedas Sangalli','Lucas Bitencourt','Caio Rian']);
  const invariant = key => {
    const text = key.replace(/^__heading__/, '');
    return !/\p{Script=Latin}/u.test(text) || neutral.has(text) || /^[A-Z]{1,3}$/.test(text)
      || /^(US\$|R\$)\s*[\d.,]+$/.test(text)
      || /^(https?:\/\/|[a-z0-9.-]+\.(app|com|org|br)(\/|$))/.test(text);
  };
  const missing = [], unchanged = [], incorrect = [];
  for (const {element, key, attribute} of window.hindiBaseline) {
    if (invariant(key)) continue;
    const expected = pack[key] || pack[key.replace(/\s+/g, ' ')];
    if (!expected) { missing.push(key); continue; }
    const actual = attribute ? element.getAttribute(attribute)
      : element.nodeType === Node.TEXT_NODE ? element.nodeValue.trim() : element.textContent.replace(/\s+/g,' ').trim();
    if (element.isConnected && actual !== expected) incorrect.push(key);
    if (expected === key.replace(/^__heading__/, '')) unchanged.push(key);
  }
  return {records:window.hindiBaseline.length, missing:[...new Set(missing)],
    unchanged:[...new Set(unchanged)], incorrect:[...new Set(incorrect)]};
})()"""


def check_hindi(client, origin):
    checks = {}
    report = {"pages": [], "layouts": []}
    client.navigate(origin + "/index.html")

    def language(value):
        return client.evaluate(
            """(async () => {
          const value = """
            + json.dumps(value)
            + """;
          const picker = document.querySelector('#language-picker');
          picker.value = value; picker.dispatchEvent(new Event('change', {bubbles:true}));
          for (let i=0; i<100 && document.documentElement.lang !== value; i++) await new Promise(resolve => setTimeout(resolve, 20));
          return document.documentElement.lang === value;
        })()"""
        )

    for path in sorted(ROOT.glob("*.html")):
        client.evaluate("localStorage.setItem('esperanca-language', 'pt-BR')")
        client.navigate(origin + "/" + path.name)
        client.evaluate(BASELINE)
        assert language("hi"), f"Idioma não carregou: {path.name}"
        coverage = client.evaluate(COVERAGE)
        report["pages"].append({"page": path.name, **coverage})
        checks["traducao_" + path.stem] = not any(
            coverage[key] for key in ("missing", "unchanged", "incorrect")
        )
        for width, height in ((390, 844), (768, 1024), (1440, 1000)):
            client.call(
                "Emulation.setDeviceMetricsOverride",
                {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": width < 600},
            )
            overflow = client.evaluate("document.documentElement.scrollWidth > innerWidth + 1")
            report["layouts"].append({"page": path.name, "width": width, "overflow": overflow})

    checks["layouts_nas_tres_larguras"] = not any(item["overflow"] for item in report["layouts"])
    client.navigate(origin + "/acessibilidade.html")
    checks["idioma_persistente"] = client.evaluate("document.documentElement.lang === 'hi'")
    checks["status_dinamico_de_acessibilidade"] = client.evaluate("""(() => {
      document.querySelector('[data-font-size="increase"]').click();
      return document.querySelector('[data-font-status]').textContent === window.esperancaI18n.t('Tamanho do texto: {percent}%.').replace('{percent}', '110');
    })()""")
    client.evaluate("document.querySelector('[data-font-size=\"reset\"]').click()")
    client.navigate(origin + "/galeria.html")
    checks["galeria_e_filtros"] = client.evaluate("""(() => {
      document.querySelector('[data-filter]').click();
      const status = document.querySelector('[data-filter-status]').textContent;
      document.querySelector('[data-lightbox]').click();
      const caption = document.querySelector('#dialog-caption').textContent;
      document.querySelector('.dialog-close').click();
      return /[\u0900-\u097f]/.test(status) && /[\u0900-\u097f]/.test(caption);
    })()""")
    client.navigate(origin + "/contato.html")
    client.evaluate(
        "window.intlTelInput.getInstance(document.querySelector('#telefone')).promise.then(() => true)"
    )
    checks["paises_e_busca_em_hindi"] = client.evaluate("""(() => {
      const widget = document.querySelector('.iti');
      return widget.textContent.includes('भारत') && !widget.textContent.includes('Brasil')
        && !!widget.querySelector('[placeholder="खोजें"]');
    })()""")
    checks["validacao_de_campos_obrigatorios_em_hindi"] = client.evaluate("""(() => {
      document.querySelector('#contact-form').requestSubmit();
      return ['nome','email','assunto','mensagem'].every(id => /[\u0900-\u097f]/.test(document.getElementById(id).validationMessage));
    })()""")
    checks["email_invalido_e_envio_em_hindi"] = client.evaluate("""(async () => {
      const values = {nome:'परीक्षण', email:'invalido', assunto:'parceria', mensagem:'यह वेबसाइट के संपर्क फ़ॉर्म का परीक्षण है।'};
      for (const [id,value] of Object.entries(values)) {
        const field = document.getElementById(id); field.value=value; field.dispatchEvent(new Event('input',{bubbles:true}));
      }
      document.querySelector('#contact-form').requestSubmit();
      const invalid = /[\u0900-\u097f]/.test(document.querySelector('#email').validationMessage);
      document.querySelector('#email').value = 'pessoa@example.com';
      document.querySelector('#email').dispatchEvent(new Event('input',{bubbles:true}));
      window.fetch = async () => ({ok:true,status:200});
      document.querySelector('#contact-form').requestSubmit();
      await new Promise(resolve => setTimeout(resolve,0));
      return invalid && document.querySelector('#form-result').dataset.state === 'success'
        && /[\u0900-\u097f]/.test(document.querySelector('#form-status').textContent);
    })()""")
    client.navigate(origin + "/midia.html")
    checks["video_poster_e_legenda_em_hindi"] = client.evaluate("""(async () => {
      const video = document.querySelector('video');
      for (let i=0;i<100 && video.readyState < 1 && !video.error;i++) await new Promise(resolve=>setTimeout(resolve,30));
      return video.currentSrc.endsWith('/manifesto-hi.webm') && video.readyState >= 1 && !video.error
        && video.poster.endsWith('/manifesto-poster-hi.svg') && !!video.querySelector('track[srclang="hi"]');
    })()""")
    checks["apresentacao_incorporada_em_hindi"] = client.evaluate("""(async () => {
      const frame = document.querySelector('iframe'); frame.loading = 'eager';
      for(let i=0;i<100 && frame.contentDocument?.documentElement.lang !== 'hi';i++) await new Promise(resolve=>setTimeout(resolve,30));
      return frame.contentDocument?.documentElement.lang === 'hi' && /[\u0900-\u097f]/.test(frame.contentDocument.querySelector('h1').textContent);
    })()""")
    assert language("pt-BR")
    checks["retorno_ao_portugues_incluindo_apresentacao"] = client.evaluate("""(async () => {
      const frame = document.querySelector('iframe');
      for(let i=0;i<100 && frame.contentDocument?.documentElement.lang !== 'pt-BR';i++) await new Promise(resolve=>setTimeout(resolve,30));
      return document.querySelector('video source').getAttribute('src') === 'assets/manifesto.webm'
        && frame.contentDocument?.querySelector('summary').textContent === '01 · Aprender e compartilhar';
    })()""")
    client.navigate(origin + "/assets/apresentacao.html")
    client.evaluate(BASELINE)
    client.evaluate(
        "localStorage.setItem('esperanca-language','hi'); window.postMessage({type:'esperanca:language',language:'hi'},location.origin)"
    )
    checks["apresentacao_independente_em_hindi"] = client.evaluate("""(async () => {
      for(let i=0;i<100 && document.documentElement.lang !== 'hi';i++) await new Promise(resolve=>setTimeout(resolve,20));
      return document.documentElement.lang === 'hi' && /[\u0900-\u097f]/.test(document.querySelector('h1').textContent);
    })()""")
    coverage = client.evaluate(COVERAGE)
    report["pages"].append({"page": "assets/apresentacao.html", **coverage})
    checks["traducao_apresentacao"] = not any(
        coverage[key] for key in ("missing", "unchanged", "incorrect")
    )
    checks["sem_erros_javascript"] = not any(
        event.get("method") == "Runtime.exceptionThrown" for event in client.events
    )
    report["checks"] = checks
    (ROOT / "docs/hindi-checks.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return checks


if __name__ == "__main__":
    run_browser_checks(check_hindi)
