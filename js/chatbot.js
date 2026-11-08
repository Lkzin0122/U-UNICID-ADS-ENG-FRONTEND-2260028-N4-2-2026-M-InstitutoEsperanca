/* Conversa com o agente do servidor. Sem respostas prontas quando a IA falha. */
(() => {
  'use strict';
  if (document.querySelector('.esperanca-chat')) return;
  const sessionKey = 'esperanca-chat-session-v2';
  const pageNames = ['index.html', 'sobre.html', 'projetos.html', 'impacto.html', 'acessibilidade.html', 'galeria.html', 'midia.html', 'noticias.html', 'contato.html', 'orcamento_hospedagem.html', 'participar.html', 'perguntas-frequentes.html'];
  const allowedPaths = new Set(pageNames.map(name => new URL(name, document.baseURI).pathname));
  const icons = {
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3V11.5a8.5 8.5 0 1 1 17 0Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 4.7a5.2 5.2 0 0 0-7.4 0L12 5.8l-1.1-1.1a5.2 5.2 0 0 0-7.4 7.4L12 20l8.5-7.9a5.2 5.2 0 0 0 0-7.4Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>',
    reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10a9 9 0 1 1 1.5 7M3 4v6h6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 7-7 7 7M12 5v14"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v15M3 4h4a5 5 0 0 1 5 2 5 5 0 0 1 5-2h4v15h-4a6 6 0 0 0-5 2 6 6 0 0 0-5-2H3Z"/></svg>',
    people: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/></svg>',
  };
  const widget = document.createElement('div');
  widget.className = 'esperanca-chat';
  widget.lang = 'pt-BR';
  widget.setAttribute('data-no-translate', '');
  widget.innerHTML = [
    '<button class="chat-launcher" type="button" aria-label="Conversar com a Esperança" aria-expanded="false" aria-controls="esperanca-chat-panel">' + icons.chat + '<span class="chat-launcher-label">Vamos conversar</span></button>',
    '<section class="chat-panel" id="esperanca-chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title" hidden>',
    '<div class="chat-header"><div class="chat-avatar" aria-hidden="true">' + icons.heart + '</div><div class="chat-heading"><h2 id="chat-title">Esperança <span class="chat-ai-badge">IA</span></h2><p>Assistente do Instituto</p></div><div class="chat-header-actions"><button class="chat-reset" type="button" aria-label="Nova conversa" title="Nova conversa">' + icons.reset + '</button><button class="chat-close" type="button" aria-label="Fechar conversa" title="Fechar conversa">' + icons.close + '</button></div></div>',
    '<div class="chat-log" role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions" tabindex="0"></div>',
    '<div class="chat-suggestions" aria-label="Sugestões de perguntas"><p>Por onde você quer começar?</p><button type="button">' + icons.book + '<span>Quais são os projetos?</span>' + icons.arrow + '</button><button type="button">' + icons.people + '<span>Como ser voluntário?</span>' + icons.arrow + '</button><button type="button">' + icons.heart + '<span>Posso doar?</span>' + icons.arrow + '</button></div>',
    '<p class="chat-status" role="status" aria-live="polite"></p>',
    '<div class="chat-error" hidden><p role="alert"></p><button class="chat-retry" type="button">Tentar novamente</button></div>',
    '<form class="chat-form"><label for="chat-question">Sua mensagem</label><div class="chat-input-row"><textarea id="chat-question" name="message" rows="1" maxlength="1000" required placeholder="Pergunte à Esperança…" aria-describedby="chat-privacy chat-count"></textarea><button class="chat-send" type="submit" aria-label="Enviar mensagem" title="Enviar mensagem">' + icons.send + '</button></div><div class="chat-footer"><small id="chat-count">0/1000 caracteres</small><small class="chat-keyboard-hint"><kbd>Enter</kbd> para enviar</small><span class="chat-session-note">Conversa nesta aba</span></div><p class="chat-privacy" id="chat-privacy">As mensagens são enviadas à IA. Evite dados sensíveis e confira as fontes.</p></form>',
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
  const suggestions = $('.chat-suggestions');
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
      const sourceTitle = document.createElement('div');
      sourceTitle.className = 'chat-sources-title';
      sourceTitle.textContent = 'Para conferir';
      const links = document.createElement('div');
      links.className = 'chat-sources';
      links.setAttribute('aria-label', 'Fontes consultadas');
      sources.forEach(source => {
        const item = document.createElement(source.url ? 'a' : 'span');
        item.textContent = source.title;
        if (source.url) {
          item.href = source.url;
          item.insertAdjacentHTML('beforeend', icons.arrow);
          if (new URL(source.url).origin !== location.origin) {
            item.target = '_blank';
            item.rel = 'noopener noreferrer';
          }
        }
        links.append(item);
      });
      article.append(sourceTitle, links);
    }
    if (generated) {
      const label = document.createElement('small');
      label.textContent = 'Gerado por IA';
      article.append(label);
    }
    log.append(article);
    log.scrollTop = log.scrollHeight;
    return article;
  }
  function renderTranscript() {
    log.replaceChildren();
    suggestions.hidden = transcript.length > 0;
    if (!transcript.length) {
      const welcome = addMessage('assistant', 'Vamos falar sobre os projetos, as formas de participar e o que você encontra por aqui.');
      welcome.classList.add('chat-welcome');
      const symbol = document.createElement('div');
      symbol.className = 'chat-welcome-symbol';
      symbol.innerHTML = icons.heart;
      const heading = document.createElement('h3');
      heading.textContent = 'Que bom ter você aqui.';
      const author = welcome.querySelector('.chat-author');
      author.textContent = 'CUIDADO COMEÇA COM UMA CONVERSA';
      author.before(symbol);
      author.after(heading);
      log.append(suggestions);
    } else {
      log.append(suggestions);
      transcript.forEach(message => addMessage(message.role, message.content, message.sources, message.role === 'assistant'));
    }
  }
  function resizeInput() {
    input.style.height = 'auto';
    input.style.height = Math.max(48, Math.min(128, input.scrollHeight)) + 'px';
  }
  function updateCount() {
    input.setCustomValidity('');
    $('#chat-count').textContent = input.value.length + '/1000 caracteres';
    resizeInput();
  }
  function updateViewport() {
    const viewport = window.visualViewport;
    const layoutHeight = document.documentElement.clientHeight || innerHeight;
    widget.style.setProperty('--chat-viewport-height', (viewport?.height || layoutHeight) + 'px');
    widget.style.setProperty('--chat-keyboard-offset', Math.max(0, layoutHeight - (viewport?.height || layoutHeight) - (viewport?.offsetTop || 0)) + 'px');
  }
  function toggle(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    launcher.setAttribute('aria-label', open ? 'Fechar conversa' : 'Conversar com a Esperança');
    $('.chat-launcher-label').textContent = open ? 'Fechar conversa' : 'Vamos conversar';
    updateViewport();
    resizeInput();
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
    status.textContent = 'Esperança está consultando as informações…';
    suggestions.hidden = true;
    log.querySelector('.chat-welcome')?.remove();
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
      while (log.querySelectorAll('.chat-message').length > 20) log.querySelector('.chat-message').remove();
      status.textContent = '';
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
  updateViewport();
  window.visualViewport?.addEventListener('resize', updateViewport);
  window.visualViewport?.addEventListener('scroll', updateViewport);
  window.addEventListener('resize', updateViewport, { passive: true });
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
  suggestions.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || pending) return;
    input.value = button.querySelector('span').textContent;
    updateCount();
    input.focus();
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
