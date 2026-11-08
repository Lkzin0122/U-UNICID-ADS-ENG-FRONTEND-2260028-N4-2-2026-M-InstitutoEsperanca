/* Conversa com o agente do servidor. Sem respostas prontas quando a IA falha. */
(() => {
  'use strict';
  if (document.querySelector('.esperanca-chat')) return;
  const sessionKey = 'esperanca-chat-session-v2';
  const pageNames = ['index.html', 'sobre.html', 'projetos.html', 'impacto.html', 'acessibilidade.html', 'galeria.html', 'midia.html', 'noticias.html', 'contato.html', 'orcamento_hospedagem.html', 'participar.html', 'perguntas-frequentes.html'];
  const allowedPaths = new Set(pageNames.map(name => new URL(name, document.baseURI).pathname));
  const widget = document.createElement('div');
  widget.className = 'esperanca-chat';
  widget.lang = 'pt-BR';
  widget.setAttribute('data-no-translate', '');
  widget.innerHTML = [
    '<button class="chat-launcher" type="button" aria-expanded="false" aria-controls="esperanca-chat-panel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-4 3v-11a10 10 0 0 1 19 0Z"/><path d="M7 11h1m3 0h1m3 0h1"/></svg><span>Converse com a Esperança</span></button>',
    '<section class="chat-panel" id="esperanca-chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title" hidden>',
    '<div class="chat-header"><div><h2 id="chat-title">Olá, sou a Esperança</h2><p>Assistente virtual · Projeto acadêmico</p></div><button class="chat-close" type="button" aria-label="Fechar conversa">×</button></div>',
    '<div class="chat-log" role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions" tabindex="0"></div>',
    '<div class="chat-suggestions" aria-label="Sugestões de perguntas"><button type="button">Quais são os projetos?</button><button type="button">Como ser voluntário?</button><button type="button">Posso doar?</button></div>',
    '<p class="chat-status" role="status" aria-live="polite"></p>',
    '<div class="chat-error" hidden><p role="alert"></p><button class="chat-retry" type="button">Tentar novamente</button></div>',
    '<form class="chat-form"><label for="chat-question">Sua pergunta sobre o Instituto</label><div class="chat-input-row"><textarea id="chat-question" name="message" rows="2" maxlength="1000" required placeholder="Como posso ajudar?" aria-describedby="chat-privacy chat-count"></textarea><button class="chat-send" type="submit">Enviar</button></div><div class="chat-footer"><small id="chat-count">0/1000 caracteres</small><button class="chat-reset" type="button">Nova conversa</button></div><p class="chat-privacy" id="chat-privacy">A conversa fica nesta aba. Suas mensagens são enviadas ao servidor do chat. Não envie dados sensíveis. As respostas são geradas por IA; confira as fontes.</p></form>',
    '</section>',
  ].join('');
  document.body.append(widget);
  const $ = selector => widget.querySelector(selector);
  const launcher = $('.chat-launcher');
  const panel = $('.chat-panel');
  const log = $('.chat-log');
  const form = $('.chat-form');
  const input = $('#chat-question');
  const status = $('.chat-status');
  const send = $('.chat-send');
  const errorBox = $('.chat-error');
  const retry = $('.chat-retry');
  let transcript = [];
  let pending = null;
  let failed = null;
  let requestId = 0;

  function safeSources(sources) {
    if (!Array.isArray(sources)) return [];
    return sources.slice(0, 6).flatMap(source => {
      if (!source || typeof source.title !== 'string' || !source.title.trim() || source.title.length > 200) return [];
      const title = source.title.trim();
      const id = typeof source.id === 'string' ? source.id.slice(0, 180) : '';
      if (source.url === null) return [{ id, title, url: null }];
      if (typeof source.url !== 'string' || source.url.length > 2048) return [];
      try {
        const url = new URL(source.url, document.baseURI);
        if (url.username || url.password) return [];
        const sameOrigin = url.origin === location.origin;
        if (sameOrigin && allowedPaths.has(url.pathname) && ['http:', 'https:', 'file:'].includes(url.protocol)) return [{ id, title, url: url.href }];
        if (!sameOrigin && url.protocol === 'https:') return [{ id, title, url: url.href }];
      } catch { /* Uma fonte inválida não vira link. */ }
      return [];
    });
  }
  function restoreTranscript() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(sessionKey));
      if (!saved || saved.version !== 2 || !Array.isArray(saved.messages) || saved.messages.length > 20 || saved.messages.length % 2 !== 0) return [];
      return saved.messages.map((message, index) => {
        const role = index % 2 === 0 ? 'user' : 'assistant';
        if (!message || message.role !== role || typeof message.content !== 'string' || !message.content.trim() || message.content.length > (role === 'user' ? 1000 : 3000)) throw new Error('invalid_session');
        return { role, content: message.content, sources: role === 'assistant' ? safeSources(message.sources) : [] };
      });
    } catch { return []; }
  }
  function saveTranscript() {
    try { sessionStorage.setItem(sessionKey, JSON.stringify({ version: 2, messages: transcript })); }
    catch { /* A conversa continua na página quando o armazenamento está bloqueado. */ }
  }
  function historyForRequest() {
    let history = transcript.slice(-12).map(({ role, content }) => ({ role, content }));
    while (history.reduce((length, message) => length + message.content.length, 0) > 24000) history = history.slice(2);
    return history;
  }
  function addMessage(role, content, sources = [], generated = false) {
    const article = document.createElement('div');
    article.className = 'chat-message';
    article.dataset.role = role;
    const author = document.createElement('span');
    author.className = 'chat-author';
    author.textContent = role === 'user' ? 'Você' : 'Esperança';
    const text = document.createElement('p');
    text.textContent = content;
    article.append(author, text);
    if (sources.length) {
      const links = document.createElement('div');
      links.className = 'chat-sources';
      links.setAttribute('aria-label', 'Fontes consultadas');
      sources.forEach(source => {
        const item = document.createElement(source.url ? 'a' : 'span');
        item.textContent = source.title;
        if (source.url) {
          item.href = source.url;
          if (new URL(source.url).origin !== location.origin) {
            item.target = '_blank';
            item.rel = 'noopener noreferrer';
          }
        }
        links.append(item);
      });
      article.append(links);
    }
    if (generated) {
      const label = document.createElement('small');
      label.textContent = 'Resposta com IA · Confira as fontes';
      article.append(label);
    }
    log.append(article);
    log.scrollTop = log.scrollHeight;
    return article;
  }
  function renderTranscript() {
    log.replaceChildren();
    if (!transcript.length) addMessage('assistant', 'Olá! Sou a Esperança. Posso conversar com você sobre os projetos, o voluntariado e as informações do Instituto. O que gostaria de saber?');
    else transcript.forEach(message => addMessage(message.role, message.content, message.sources, message.role === 'assistant'));
  }
  function updateCount() {
    input.setCustomValidity('');
    $('#chat-count').textContent = input.value.length + '/1000 caracteres';
  }
  function toggle(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    (open ? input : launcher).focus();
    if (open) log.scrollTop = log.scrollHeight;
  }
  function clearError() {
    errorBox.hidden = true;
    errorBox.querySelector('p').textContent = '';
  }
  function errorMessage(error) {
    if (error.publicMessage) return error.publicMessage;
    if (error.name === 'AbortError') return 'A resposta está demorando mais que o esperado. Sua pergunta foi preservada; você pode tentar novamente.';
    return 'Não consegui me conectar à IA agora. Sua pergunta foi preservada; tente novamente em instantes.';
  }
  async function ask(message, userMessage = null) {
    if (pending) return;
    const id = ++requestId;
    const controller = new AbortController();
    pending = controller;
    failed = null;
    clearError();
    send.disabled = true;
    retry.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Consultando as informações do projeto…';
    const bubble = userMessage || addMessage('user', message);
    bubble.dataset.state = 'pending';
    if (input.value.trim() === message) { input.value = ''; updateCount(); }
    const timer = setTimeout(() => controller.abort(), 130000);
    try {
      if (location.protocol === 'file:') throw { publicMessage: 'O chat ainda não está conectado ao modelo de IA. Abra o site pelo servidor do projeto para conversar.' };
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: historyForRequest() }), signal: controller.signal,
      });
      if ([404, 405, 501].includes(response.status)) throw { publicMessage: 'O chat deste site ainda não está conectado ao modelo de IA. Consulte as páginas do Instituto enquanto a conexão é configurada.' };
      const result = await response.json().catch(() => null);
      if (!response.ok) throw { publicMessage: typeof result?.error === 'string' && result.error.length <= 400 ? result.error : response.status === 429 ? 'Aguarde um minuto antes de enviar outra pergunta.' : 'A IA está indisponível no momento. Tente novamente em instantes.' };
      if (!result || result.mode !== 'ai' || typeof result.answer !== 'string' || !result.answer.trim() || result.answer.length > 3000 || !Array.isArray(result.sources)) throw new Error('invalid_response');
      if (id !== requestId) return;
      const sources = safeSources(result.sources);
      transcript = [...transcript, { role: 'user', content: message, sources: [] }, { role: 'assistant', content: result.answer.trim(), sources }].slice(-20);
      saveTranscript();
      bubble.dataset.state = 'sent';
      addMessage('assistant', result.answer.trim(), sources, true);
      while (log.children.length > 20) log.firstElementChild.remove();
      status.textContent = 'Resposta pronta. Você pode continuar a conversa.';
    } catch (error) {
      if (id !== requestId) return;
      failed = { message, bubble };
      bubble.dataset.state = 'failed';
      status.textContent = '';
      errorBox.querySelector('p').textContent = errorMessage(error);
      errorBox.hidden = false;
      if (!input.value) { input.value = message; updateCount(); }
    } finally {
      clearTimeout(timer);
      if (id === requestId) {
        pending = null;
        send.disabled = false;
        retry.disabled = false;
        form.removeAttribute('aria-busy');
        if (!panel.hidden && (document.activeElement === send || document.activeElement === input)) input.focus();
      }
    }
  }

  transcript = restoreTranscript();
  renderTranscript();
  launcher.addEventListener('click', () => toggle(panel.hidden));
  $('.chat-close').addEventListener('click', () => toggle(false));
  widget.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); toggle(false); }
  });
  input.addEventListener('input', updateCount);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      if (!pending) form.requestSubmit();
    }
  });
  $('.chat-reset').addEventListener('click', () => {
    requestId++;
    pending?.abort();
    pending = null;
    failed = null;
    transcript = [];
    try { sessionStorage.removeItem(sessionKey); } catch { /* Sem armazenamento. */ }
    form.reset();
    updateCount();
    clearError();
    status.textContent = '';
    form.removeAttribute('aria-busy');
    send.disabled = false;
    retry.disabled = false;
    renderTranscript();
    input.focus();
  });
  retry.addEventListener('click', () => {
    if (failed && !pending) ask(failed.message, failed.bubble);
  });
  $('.chat-suggestions').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || pending) return;
    input.value = button.textContent;
    updateCount();
    form.requestSubmit();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (pending) return;
    const message = input.value.trim();
    input.setCustomValidity(!message ? 'Escreva uma pergunta para continuar.' : message.length > 1000 ? 'Escreva uma pergunta de até 1000 caracteres.' : '');
    if (!form.reportValidity()) return;
    const previousBubble = failed?.message === message ? failed.bubble : null;
    if (failed && !previousBubble) failed.bubble.remove();
    ask(message, previousBubble);
  });
})();
