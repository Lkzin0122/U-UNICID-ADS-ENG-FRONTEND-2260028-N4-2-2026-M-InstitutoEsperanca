/* Auditoria no Chromium local: node scripts/check_contrast.cjs [caminho-do-browser] */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const audit = `(() => {
  const rgba = color => color.match(/[\\d.]+/g)?.map(Number) || [0,0,0,0];
  const over = (front, back) => {
    const alpha = front[3] ?? 1;
    return front.slice(0,3).map((value,i) => value * alpha + back[i] * (1-alpha));
  };
  const luminance = color => color.slice(0,3).map(c => {
    c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
  }).reduce((sum,c,i) => sum + c * [.2126,.7152,.0722][i], 0);
  const failures = [], skipped = [];
  let checked = 0;
  for (const element of document.body.querySelectorAll('*')) {
    const field = element.matches('input:not([type="checkbox"]):not([type="radio"]),textarea');
    if (!element.getClientRects().length || element.closest('.sr-only,.skip-link,.sunburst') ||
        !(field || [...element.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))) continue;
    const style = getComputedStyle(element, field && !element.value && element.placeholder ? '::placeholder' : null);
    if (style.visibility !== 'visible' || style.opacity === '0' || element.disabled ||
        element.tagName === 'OPTION' || element.tagName === 'SCRIPT') continue;
    const ancestors = [];
    for (let parent = element; parent; parent = parent.parentElement) ancestors.push(parent);
    if (ancestors.some(parent => getComputedStyle(parent).backgroundImage !== 'none')) {
      skipped.push(element.tagName + '.' + element.className); continue;
    }
    let background = [255,255,255];
    for (const parent of ancestors.reverse()) background = over(rgba(getComputedStyle(parent).backgroundColor), background);
    const foreground = over(rgba(style.color), background);
    const lum = [luminance(foreground),luminance(background)].sort((a,b) => a-b);
    const ratio = (lum[1] + .05) / (lum[0] + .05);
    const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && parseFloat(style.fontWeight) >= 700);
    checked++;
    if (ratio + .001 < (large ? 3 : 4.5)) failures.push({
      element: element.tagName.toLowerCase() + (element.className ? '.' + String(element.className).trim().replace(/\\s+/g,'.') : ''),
      text: (field ? element.value || element.placeholder : element.textContent).trim().slice(0,85), ratio: +ratio.toFixed(2),
      color: style.color, background: background.map(Math.round),
    });
  }
  return {checked, failures, skipped};
})()`;

async function main() {
  const candidates = [process.argv[2],
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/EdgeCore/Optimized/msedgewebview2.exe',
  ].filter(Boolean);
  const browser = candidates.find(candidate => fs.existsSync(candidate));
  if (!browser) throw new Error('Informe o caminho de um navegador Chromium instalado.');
  const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg'};
  const server = http.createServer((req,res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404); res.end(); return;
    }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'esperanca-contrast-'));
  const browserEnv = {...process.env};
  delete browserEnv.ELECTRON_RUN_AS_NODE;
  let socket, child;
  try {
    child = spawn(browser, ['--headless=new','--disable-gpu','--disable-extensions','--no-first-run','--no-default-browser-check',
      ...(process.env.CONTRAST_NO_SANDBOX === '1' ? ['--no-sandbox'] : []),
      '--disable-background-networking','--remote-debugging-port=0','--user-data-dir=' + profile,'about:blank'],
      {stdio:'ignore', windowsHide:true, env:browserEnv});
    let launchError;
    child.on('error', error => {launchError = error;});
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) {
      if (launchError) throw launchError;
      await delay(100);
    }
    if (!fs.existsSync(portFile)) throw new Error('O navegador não disponibilizou a depuração headless.');
    const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
    const target = await (await fetch('http://127.0.0.1:' + port + '/json/new?about:blank', {method:'PUT'})).json();
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve,reject) => {socket.onopen = resolve; socket.onerror = reject;});
    let serial = 0;
    const pending = new Map();
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (process.env.CONTRAST_DEBUG) console.log('CDP', JSON.stringify(message).slice(0,350));
      if (pending.has(message.id)) {
        const {resolve,reject,timer} = pending.get(message.id);
        clearTimeout(timer); pending.delete(message.id);
        message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
      }
    };
    const call = (method,params = {}) => new Promise((resolve,reject) => {
      const id = ++serial;
      const timer = setTimeout(() => {pending.delete(id); reject(new Error('Timeout: ' + method));}, 20000);
      pending.set(id,{resolve,reject,timer}); socket.send(JSON.stringify({id,method,params}));
    });
    const evaluate = async expression => {
      const result = await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    if (process.env.CONTRAST_DEBUG) console.log(await call('Browser.getVersion'));
    await call('Page.enable');
    await call('DOM.enable');
    await call('CSS.enable');
    await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
    const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));
    let total = 0, checked = 0;
    const failures = [], interactions = [];
    for (const page of pages) {
      await call('Page.navigate',{url:origin + '/' + page});
      for (let i = 0; i < 100; i++) {
        if (await evaluate('document.readyState === "complete" && document.documentElement.classList.contains("js")')) break;
        await delay(50);
      }
      for (const dark of [false,true]) for (const invert of [false,true]) for (const contrast of [false,true]) {
        const mode = {dark,invert,contrast};
        await evaluate(`document.documentElement.classList.toggle('theme-dark',${dark});document.documentElement.classList.toggle('inverted-colors',${invert});document.documentElement.classList.toggle('high-contrast',${contrast});document.querySelectorAll('.nav-group').forEach(el=>el.open=true)`);
        const result = await evaluate(audit);
        total++; checked += result.checked;
        for (const failure of result.failures) failures.push({page,...mode,...failure});
      }
      console.log(page + ': 8 combinações verificadas');
    }
    // Verifica também hover, filtros selecionados e cores forçadas do sistema.
    for (const page of ['noticias.html','galeria.html','acessibilidade.html']) {
      await call('Page.navigate',{url:origin + '/' + page});
      while (!await evaluate('document.readyState === "complete"')) await delay(50);
      const {root:documentNode} = await call('DOM.getDocument');
      const {nodeIds} = await call('DOM.querySelectorAll',{nodeId:documentNode.nodeId,selector:'.button'});
      for (const nodeId of nodeIds) await call('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['hover']});
      for (const dark of [false,true]) for (const invert of [false,true]) for (const contrast of [false,true]) {
        await evaluate(`document.documentElement.classList.toggle('theme-dark',${dark});document.documentElement.classList.toggle('inverted-colors',${invert});document.documentElement.classList.toggle('high-contrast',${contrast})`);
        const result = await evaluate(audit);
        checked += result.checked;
        for (const failure of result.failures) failures.push({page,dark,invert,contrast,hover:true,...failure});
      }
      await call('Emulation.setEmulatedMedia',{features:[{name:'forced-colors',value:'active'}]});
      const forced = await evaluate(audit);
      checked += forced.checked;
      for (const failure of forced.failures) failures.push({page,forcedColors:true,...failure});
      await call('Emulation.setEmulatedMedia',{features:[]});
    }
    await call('Page.navigate',{url:origin + '/acessibilidade.html'});
    while (!await evaluate('document.readyState === "complete"')) await delay(50);
    interactions.push(await evaluate(`(() => {
      const theme = document.querySelector('[data-theme-preference]');
      theme.value = 'dark'; theme.dispatchEvent(new Event('change'));
      document.querySelector('[data-invert-toggle]').click();
      document.querySelector('[data-contrast-toggle]').click();
      const root = document.documentElement;
      return {controls:root.classList.contains('theme-dark') && root.classList.contains('inverted-colors') && root.classList.contains('high-contrast'), colorScheme:getComputedStyle(root).colorScheme};
    })()`));
    await call('Page.navigate',{url:origin + '/noticias.html'});
    while (!await evaluate('document.readyState === "complete"')) await delay(50);
    interactions.push(await evaluate(`({persisted:['theme-dark','inverted-colors','high-contrast'].every(name => document.documentElement.classList.contains(name))})`));
    await evaluate(`document.documentElement.className='js theme-dark';document.querySelector('.cta-band').scrollIntoView({block:'center',behavior:'instant'})`);
    if (process.env.CONTRAST_SCREENSHOT) {
      const capture = await call('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(process.env.CONTRAST_SCREENSHOT,Buffer.from(capture.data,'base64'));
    }
    const uniqueFailures = [...new Map(failures.map(failure => [failure.element + failure.text + failure.ratio, failure])).values()];
    console.log(JSON.stringify({pages:pages.length,combinations:total,textChecks:checked,interactions,failureCount:failures.length,uniqueFailures},null,2));
    process.exitCode = failures.length || interactions[0].controls !== true || interactions[0].colorScheme !== 'light' || interactions[1].persisted !== true ? 1 : 0;
  } finally {
    socket?.close();
    child?.kill();
    await new Promise(resolve => server.close(resolve));
    // Remove somente o perfil temporário criado por esta auditoria.
    if (path.dirname(profile) === os.tmpdir() && path.basename(profile).startsWith('esperanca-contrast-')) {
      await delay(300);
      fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200});
    }
  }
}

main().catch(error => {console.error(error.message); process.exitCode = 1;});
