/* Applies locally bundled translations without replacing interactive elements. */
(() => {
  'use strict';
  const localeTags = {
    'pt-BR': 'pt-BR', en: 'en', 'zh-CN': 'zh-CN', de: 'de', fr: 'fr',
    'es-419': 'es-419', ru: 'ru', ja: 'ja', hi: 'hi',
  };
  const storageKey = 'esperanca-language';
  const picker = document.querySelector('#language-picker');
  if (!picker) return;
  let language = 'pt-BR';
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved && localeTags[saved]) language = saved;
  } catch { /* Language switching still works without storage. */ }

  const textRecords = [];
  const attrRecords = [];
  const headingRecords = [...document.querySelectorAll('h1,h2,h3')].map(element => ({
    element,
    html: element.innerHTML,
    source: (element.innerText || element.textContent).replace(/\s+/g, ' ').trim(),
  }));
  const walker = document.createTreeWalker(document, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.nodeValue.trim() || node.parentElement?.closest('script,style,noscript,h1,h2,h3,select#language-picker,[data-no-translate]')) continue;
    textRecords.push({ node, source: node.nodeValue });
  }
  document.querySelectorAll('*').forEach(element => {
    if (element.closest('[data-no-translate]')) return;
    for (const attribute of ['alt', 'title', 'aria-label', 'placeholder', 'data-caption']) {
      if (element.hasAttribute(attribute) && element.getAttribute(attribute).trim()) {
        attrRecords.push({ element, attribute, source: element.getAttribute(attribute) });
      }
    }
  });
  document.querySelectorAll('meta[name="description"]').forEach(element => {
    attrRecords.push({ element, attribute: 'content', source: element.content });
  });
  const packs = { 'pt-BR': {} };
  let activePack = packs['pt-BR'];
  let loadToken = 0;

  const translated = source => {
    const key = source.trim();
    const result = activePack[key];
    if (!result) return source;
    const leading = source.match(/^\s*/)?.[0] || '';
    const trailing = source.match(/\s*$/)?.[0] || '';
    return `${leading}${result}${trailing}`;
  };
  const apply = () => {
    document.documentElement.lang = localeTags[language] || 'pt-BR';
    headingRecords.forEach(record => {
      record.element.innerHTML = record.html;
      const heading = activePack[`__heading__${record.source}`];
      if (heading) record.element.textContent = heading;
    });
    textRecords.forEach(record => { record.node.nodeValue = translated(record.source); });
    attrRecords.forEach(record => { record.element.setAttribute(record.attribute, translated(record.source)); });
    document.querySelectorAll('iframe').forEach(frame => {
      try {
        if (new URL(frame.src, document.baseURI).origin !== location.origin) return;
        const notifyFrame = () => frame.contentWindow?.postMessage({ type: 'esperanca:language', language }, location.origin);
        if (!frame.dataset.languageSyncBound) {
          frame.addEventListener('load', notifyFrame);
          frame.dataset.languageSyncBound = 'true';
        }
        notifyFrame();
      } catch { /* Ignore frames that do not belong to this site. */ }
    });
    picker.value = language;
    picker.setAttribute('aria-label', activePack['Idioma do site'] || 'Idioma do site');
    document.dispatchEvent(new CustomEvent('esperanca:languagechange', { detail: { language } }));
  };
  const load = nextLanguage => {
    language = localeTags[nextLanguage] ? nextLanguage : 'pt-BR';
    const token = ++loadToken;
    if (packs[language]) { activePack = packs[language]; apply(); return; }
    const script = document.createElement('script');
    script.src = `js/locales/${encodeURIComponent(language)}.js`;
    script.onload = () => {
      if (token !== loadToken) return;
      activePack = window.esperancaTranslationPacks?.[language] || {};
      packs[language] = activePack;
      apply();
    };
    script.onerror = () => {
      if (token !== loadToken) return;
      language = 'pt-BR';
      activePack = packs['pt-BR'];
      try { localStorage.setItem(storageKey, language); } catch { /* Ignore unavailable storage. */ }
      apply();
    };
    document.head.append(script);
  };
  window.esperancaI18n = { get language() { return language; }, t: translated };
  picker.addEventListener('change', () => {
    document.documentElement.classList.add('language-changing');
    try { localStorage.setItem(storageKey, picker.value); } catch { /* Ignore unavailable storage. */ }
    load(picker.value);
    window.setTimeout(() => document.documentElement.classList.remove('language-changing'), 160);
  });
  load(language);
})();
