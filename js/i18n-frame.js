/* Synchronises the accessible presentation iframe with the selected site language. */
(() => {
  'use strict';
  const tags = { 'pt-BR':'pt-BR', en:'en', 'zh-CN':'zh-CN', de:'de', fr:'fr', 'es-419':'es-419', ru:'ru', ja:'ja', hi:'hi' };
  const texts=[];const attributes=[];const headings=[...document.querySelectorAll('h1,h2,h3')].map(element=>({element,html:element.innerHTML,source:(element.innerText||element.textContent).replace(/\s+/g,' ').trim()}));
  const walker=document.createTreeWalker(document,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode()))if(node.nodeValue.trim()&&!node.parentElement?.closest('style,script,h1,h2,h3'))texts.push({node,source:node.nodeValue});
  document.querySelectorAll('*').forEach(element=>{for(const attribute of ['alt','title','aria-label','placeholder','data-caption'])if(element.hasAttribute(attribute))attributes.push({element,attribute,source:element.getAttribute(attribute)});});
  document.querySelectorAll('meta[name="description"]').forEach(element=>attributes.push({element,attribute:'content',source:element.content}));
  let language='pt-BR';let pack={};const cache={'pt-BR':{}};let requestId=0;
  const apply=()=>{
    document.documentElement.lang=tags[language]||'pt-BR';
    headings.forEach(record=>{record.element.innerHTML=record.html;const value=pack[`__heading__${record.source}`];if(value)record.element.textContent=value;});
    texts.forEach(record=>{const value=pack[record.source.trim()];if(value){const lead=record.source.match(/^\s*/)?.[0]||'';const tail=record.source.match(/\s*$/)?.[0]||'';record.node.nodeValue=lead+value+tail;}});
    attributes.forEach(record=>{const value=pack[record.source.trim()];if(value)record.element.setAttribute(record.attribute,value);});
  };
  const load=next=>{
    language=tags[next]?next:'pt-BR';const id=++requestId;
    if(cache[language]){pack=cache[language];apply();return;}
    const script=document.createElement('script');script.src=`../js/locales/${encodeURIComponent(language)}.js`;
    script.onload=()=>{if(id!==requestId)return;pack=window.esperancaTranslationPacks?.[language]||{};cache[language]=pack;apply();};
    script.onerror=()=>{if(id===requestId){language='pt-BR';pack={};apply();}};document.head.append(script);
  };
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='esperanca:language')return;load(event.data.language);});
  try{load(localStorage.getItem('esperanca-language')||'pt-BR');}catch{load('pt-BR');}
})();
