/* Conversa com fontes e ações reais do site, sem enviar dados do contato à IA. */
(() => {
  'use strict';
  if (document.querySelector('.esperanca-chat')) return;
  const sessionKey = 'esperanca-chat-session-v2';
  const actionCatalog = window.esperancaChatActions.catalog;
  const chatText = (key) => window.esperancaChatText(key);
  const translateLabel = (label) => window.esperancaI18n?.t(label) || label;
  const pageNames = [
    'index.html',
    'sobre.html',
    'projetos.html',
    'impacto.html',
    'acessibilidade.html',
    'galeria.html',
    'midia.html',
    'noticias.html',
    'contato.html',
    'orcamento_hospedagem.html',
    'participar.html',
    'perguntas-frequentes.html',
  ];
  const allowedPaths = new Set(pageNames.map((name) => new URL(name, document.baseURI).pathname));
  const icons = {
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3V11.5a8.5 8.5 0 1 1 17 0Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg>',
    heart:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 4.7a5.2 5.2 0 0 0-7.4 0L12 5.8l-1.1-1.1a5.2 5.2 0 0 0-7.4 7.4L12 20l8.5-7.9a5.2 5.2 0 0 0 0-7.4Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>',
    reset:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10a9 9 0 1 1 1.5 7M3 4v6h6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 7-7 7 7M12 5v14"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v15M3 4h4a5 5 0 0 1 5 2 5 5 0 0 1 5-2h4v15h-4a6 6 0 0 0-5 2 6 6 0 0 0-5-2H3Z"/></svg>',
    people:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/></svg>',
  };
  const widget = document.createElement('div');
  widget.className = 'esperanca-chat';
  widget.lang = 'pt-BR';
  widget.setAttribute('data-no-translate', '');
  widget.innerHTML = [
    '<button class="chat-launcher" type="button" aria-label="Conversar com a Esperança" aria-expanded="false" aria-controls="esperanca-chat-panel">' +
      icons.chat +
      '<span class="chat-launcher-label">Vamos conversar</span></button>',
    '<section class="chat-panel" id="esperanca-chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title" hidden>',
    '<div class="chat-header"><div class="chat-avatar" aria-hidden="true">' +
      icons.heart +
      '</div><div class="chat-heading"><h2 id="chat-title">Esperança <span class="chat-ai-badge">IA</span></h2><p>Assistente do Instituto</p></div><div class="chat-header-actions"><button class="chat-reset" type="button" aria-label="Nova conversa" title="Nova conversa">' +
      icons.reset +
      '</button><button class="chat-close" type="button" aria-label="Fechar conversa" title="Fechar conversa">' +
      icons.close +
      '</button></div></div>',
    '<nav class="chat-tools" aria-label="Ações do site"><button type="button" data-chat-tool="contact" data-chat-text="contact"></button><button type="button" data-chat-tool="languages" data-chat-text="languages"></button><button type="button" data-chat-tool="pages" data-chat-text="pages"></button><button type="button" data-chat-tool="accessibility" data-chat-text="accessibility"></button></nav>',
    '<div class="chat-log" role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions" tabindex="0"></div>',
    '<div class="chat-suggestions" aria-label="Sugestões de perguntas"><p>Por onde você quer começar?</p><button type="button">' +
      icons.book +
      '<span>Quais são os projetos?</span>' +
      icons.arrow +
      '</button><button type="button">' +
      icons.people +
      '<span>Como ser voluntário?</span>' +
      icons.arrow +
      '</button><button type="button">' +
      icons.heart +
      '<span>Posso doar?</span>' +
      icons.arrow +
      '</button></div>',
    '<p class="chat-status" role="status" aria-live="polite"></p>',
    '<div class="chat-error" hidden><p role="alert"></p><button class="chat-retry" type="button">Tentar novamente</button></div>',
    '<form class="chat-form"><label for="chat-question">Sua mensagem</label><div class="chat-input-row"><textarea id="chat-question" name="message" rows="1" maxlength="1000" required placeholder="Pergunte à Esperança…" aria-describedby="chat-privacy chat-count"></textarea><button class="chat-send" type="submit" aria-label="Enviar mensagem" title="Enviar mensagem">' +
      icons.send +
      '</button></div><div class="chat-footer"><small id="chat-count">0/1000 caracteres</small><small class="chat-keyboard-hint"><kbd>Enter</kbd> para enviar</small><span class="chat-session-note">Conversa nesta aba</span></div><p class="chat-privacy" id="chat-privacy">As mensagens são enviadas à IA. Evite dados sensíveis e confira as fontes.</p></form>',
    '</section>',
  ].join('');
  document.body.append(widget);
  // Top layer keeps the launcher fixed when accessibility filters create a new
  // containing block on the page, including near the bottom of a long document.
  if (typeof widget.showPopover === 'function') {
    widget.setAttribute('popover', 'manual');
    widget.showPopover();
  }
  const $ = (selector) => widget.querySelector(selector);
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
  const safeActions = (actions) =>
    Array.isArray(actions)
      ? [
          ...new Set(
            actions.filter((id) => typeof id === 'string' && Object.hasOwn(actionCatalog, id)),
          ),
        ].slice(0, 4)
      : [];
  const actionLabel = (id) => {
    const action = actionCatalog[id];
    const keys = {
      'contact:open': 'contact',
      'theme:light': 'light',
      'theme:dark': 'dark',
      'contrast:on': 'contrastOn',
      'contrast:off': 'contrastOff',
      'font:increase': 'increase',
      'font:decrease': 'decrease',
    };
    if (keys[id]) return chatText(keys[id]);
    if (action.kind === 'page')
      return (
        document.querySelector('.site-nav a[href="' + action.path + '"]')?.textContent.trim() ||
        translateLabel(action.label)
      );
    return action.label;
  };
  const contactDraftKey = 'esperanca-chat-contact-draft-v1';
  let contactPending = false;
  let contactController = null;
  const contactForm = document.createElement('form');
  contactForm.className = 'chat-contact';
  contactForm.hidden = true;
  contactForm.innerHTML =
    '<h3 data-chat-text="contact"></h3><p data-chat-text="contactIntro"></p><div class="chat-contact-fields"><label for="chat-contact-name" data-chat-text="name"></label><input id="chat-contact-name" name="from_name" autocomplete="name" maxlength="100" required><label for="chat-contact-email" data-chat-text="email"></label><input id="chat-contact-email" name="reply_to" type="email" autocomplete="email" maxlength="254" pattern="[^@\\s]+@[^@\\s.]+(?:\\.[^@\\s.]+)+" required><label for="chat-contact-subject" data-chat-text="subject"></label><select id="chat-contact-subject" name="subject"><option value="general" data-chat-text="general"></option><option value="volunteer" data-chat-text="volunteer"></option><option value="partnership" data-chat-text="partnership"></option></select><label for="chat-contact-message" data-chat-text="body"></label><textarea id="chat-contact-message" name="message" rows="4" minlength="10" maxlength="5000" required></textarea></div><p class="chat-contact-privacy" data-chat-text="privacy"></p><p class="chat-contact-status" role="status" aria-live="polite"></p><a class="chat-contact-fallback" hidden></a><div class="chat-contact-actions"><button type="submit" data-chat-text="contactSend"></button><button type="button" data-contact-back data-chat-text="back"></button></div>';
  panel.insertBefore(contactForm, log);
  const contactFields = [...contactForm.querySelectorAll('input,select,textarea')];
  const contactStatus = contactForm.querySelector('.chat-contact-status');
  const contactFallback = contactForm.querySelector('.chat-contact-fallback');
  let contactStatusKey = '';
  function saveContactDraft() {
    try {
      const values = Object.fromEntries(contactFields.map((field) => [field.name, field.value]));
      if (![values.from_name, values.reply_to, values.message].some((value) => value.trim()))
        sessionStorage.removeItem(contactDraftKey);
      else sessionStorage.setItem(contactDraftKey, JSON.stringify(values));
    } catch {}
  }
  function openContact() {
    if (contactStatusKey === 'success') {
      contactStatusKey = '';
      contactStatus.textContent = '';
    }
    try {
      const draft = JSON.parse(sessionStorage.getItem(contactDraftKey));
      for (const field of contactFields)
        if (typeof draft?.[field.name] === 'string') {
          if (
            field.tagName !== 'SELECT' ||
            [...field.options].some((option) => option.value === draft[field.name])
          )
            field.value = draft[field.name].slice(0, field.maxLength > 0 ? field.maxLength : 100);
        }
    } catch {}
    log.hidden = form.hidden = errorBox.hidden = true;
    status.textContent = '';
    contactForm.hidden = false;
    contactFields[0].focus();
  }
  function closeContact() {
    if (contactPending) return;
    if (!contactForm.hidden) saveContactDraft();
    contactForm.hidden = true;
    log.hidden = form.hidden = false;
    input.focus();
  }
  function executeAction(id) {
    if (!Object.hasOwn(actionCatalog, id) || contactPending) return;
    const action = actionCatalog[id];
    if (action.kind === 'contact') {
      openContact();
      return;
    }
    if (action.kind === 'page') {
      if (!contactForm.hidden) saveContactDraft();
      try {
        sessionStorage.setItem('esperanca-chat-open', 'true');
      } catch {}
      location.assign(new URL(action.path, document.baseURI).href);
    } else if (action.kind === 'language') window.esperancaI18n.setLanguage(action.language);
    else if (action.kind === 'visual') {
      window.esperancaVisual.set(action.patch);
      status.textContent = chatText('done');
    } else if (action.kind === 'font') {
      window.esperancaVisual.set({ scale: window.esperancaVisual.preferences.scale + action.step });
      status.textContent = chatText('done');
    }
  }
  function actionButtons(article, actions) {
    const container = document.createElement('div');
    container.className = 'chat-action-buttons';
    for (const id of safeActions(actions)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.chatAction = id;
      button.textContent = actionLabel(id);
      container.append(button);
    }
    if (container.childElementCount) article.append(container);
  }
  widget.addEventListener('click', (event) => {
    const action = event.target.closest('[data-chat-action]');
    if (action) {
      executeAction(action.dataset.chatAction);
      return;
    }
    const tool = event.target.closest('[data-chat-tool]')?.dataset.chatTool;
    if (!tool || contactPending) return;
    if (tool === 'contact') {
      openContact();
      return;
    }
    closeContact();
    const ids = Object.keys(actionCatalog).filter((id) =>
      tool === 'languages'
        ? id.startsWith('language:')
        : tool === 'pages'
          ? id.startsWith('page:')
          : /^(?:theme|contrast|font):/.test(id),
    );
    const menu = addMessage('assistant', chatText('choose'));
    // Menus can show all languages/pages; model suggestions remain limited.
    for (let offset = 0; offset < ids.length; offset += 4)
      actionButtons(menu, ids.slice(offset, offset + 4));
    menu.querySelector('button')?.focus();
    log.scrollTop = log.scrollHeight;
  });
  contactForm.querySelector('[data-contact-back]').addEventListener('click', closeContact);
  function validateContact() {
    const email = contactForm.elements.reply_to;
    email.setCustomValidity(
      email.value && !window.esperancaContact.validEmail(email.value.trim())
        ? chatText('emailError')
        : '',
    );
    contactForm.elements.from_name.setCustomValidity(
      contactForm.elements.from_name.value.trim() ? '' : chatText('invalid'),
    );
    contactForm.elements.message.setCustomValidity(
      contactForm.elements.message.value.trim().length >= 10 ? '' : chatText('short'),
    );
    return contactForm.reportValidity();
  }
  contactForm.addEventListener('input', (event) => {
    event.target.setCustomValidity?.('');
    saveContactDraft();
    contactStatusKey = '';
    contactStatus.textContent = '';
    contactFallback.hidden = true;
  });
  contactForm.addEventListener('change', saveContactDraft);
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (contactPending || !validateContact()) return;
    saveContactDraft();
    const params = Object.fromEntries(
      contactFields.map((field) => [field.name, field.value.trim()]),
    );
    params.subject = contactForm.elements.subject.selectedOptions[0].textContent;
    params.phone = translateLabel('Não informado');
    contactPending = true;
    contactController = new AbortController();
    contactForm.setAttribute('aria-busy', 'true');
    contactForm.querySelectorAll('input,select,textarea,button').forEach((field) => {
      field.disabled = true;
    });
    widget.querySelectorAll('.chat-tools button,.chat-reset').forEach((button) => {
      button.disabled = true;
    });
    contactStatusKey = 'sending';
    contactStatus.textContent = chatText('sending');
    contactFallback.hidden = true;
    const timeout = setTimeout(() => contactController.abort(), 20000);
    try {
      const response = await window.esperancaContact.send(params, {
        signal: contactController.signal,
      });
      if (!response.ok) throw new Error('email_rejected');
      contactForm.reset();
      try {
        sessionStorage.removeItem(contactDraftKey);
      } catch {}
      contactStatusKey = 'success';
    } catch (error) {
      contactStatusKey = error.name === 'AbortError' ? 'timeout' : 'error';
      contactFallback.textContent = chatText('emailApp');
      contactFallback.href =
        'mailto:institutoesperancaunicid@outlook.com?subject=' +
        encodeURIComponent(params.subject) +
        '&body=' +
        encodeURIComponent(params.from_name + '\n' + params.reply_to + '\n\n' + params.message);
      contactFallback.hidden = false;
    } finally {
      clearTimeout(timeout);
      contactPending = false;
      contactController = null;
      contactForm.removeAttribute('aria-busy');
      contactForm.querySelectorAll('input,select,textarea,button').forEach((field) => {
        field.disabled = false;
      });
      widget.querySelectorAll('.chat-tools button,.chat-reset').forEach((button) => {
        button.disabled = false;
      });
      contactStatus.textContent = chatText(contactStatusKey);
    }
  });

  function safeSources(sources) {
    if (!Array.isArray(sources)) return [];
    return sources.slice(0, 6).flatMap((source) => {
      if (
        !source ||
        typeof source.title !== 'string' ||
        !source.title.trim() ||
        source.title.length > 200
      )
        return [];
      const title = source.title.trim();
      const id = typeof source.id === 'string' ? source.id.slice(0, 180) : '';
      if (source.url === null) return [{ id, title, url: null }];
      if (typeof source.url !== 'string' || source.url.length > 2048) return [];
      try {
        const url = new URL(source.url, document.baseURI);
        if (url.username || url.password) return [];
        const sameOrigin = url.origin === location.origin;
        if (
          sameOrigin &&
          allowedPaths.has(url.pathname) &&
          ['http:', 'https:', 'file:'].includes(url.protocol)
        )
          return [{ id, title, url: url.href }];
        if (!sameOrigin && url.protocol === 'https:') return [{ id, title, url: url.href }];
      } catch {
        /* Uma fonte inválida não vira link. */
      }
      return [];
    });
  }
  function restoreTranscript() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(sessionKey));
      if (
        !saved ||
        saved.version !== 2 ||
        !Array.isArray(saved.messages) ||
        saved.messages.length > 20 ||
        saved.messages.length % 2 !== 0
      )
        return [];
      return saved.messages.map((message, index) => {
        const role = index % 2 === 0 ? 'user' : 'assistant';
        if (
          !message ||
          message.role !== role ||
          typeof message.content !== 'string' ||
          !message.content.trim() ||
          message.content.length > (role === 'user' ? 1000 : 3000)
        )
          throw new Error('invalid_session');
        return {
          role,
          content: message.content,
          sources: role === 'assistant' ? safeSources(message.sources) : [],
          local: message.local === true,
          actions: safeActions(message.actions),
        };
      });
    } catch {
      return [];
    }
  }
  function saveTranscript() {
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify({ version: 2, messages: transcript }));
    } catch {
      /* A conversa continua na página quando o armazenamento está bloqueado. */
    }
  }
  function historyForRequest() {
    let history = transcript.slice(-12).map(({ role, content }) => ({ role, content }));
    while (history.reduce((length, message) => length + message.content.length, 0) > 24000)
      history = history.slice(2);
    return history;
  }
  function addMessage(role, content, sources = [], generated = false, actions = []) {
    const article = document.createElement('div');
    article.className = 'chat-message';
    article.dataset.role = role;
    const author = document.createElement('span');
    author.className = 'chat-author';
    author.textContent = role === 'user' ? chatText('you') : 'Esperança';
    const text = document.createElement('p');
    text.textContent = content;
    article.append(author, text);
    if (sources.length) {
      const sourceTitle = document.createElement('div');
      sourceTitle.className = 'chat-sources-title';
      sourceTitle.textContent = chatText('sources');
      const links = document.createElement('div');
      links.className = 'chat-sources';
      links.setAttribute('aria-label', 'Fontes consultadas');
      sources.forEach((source) => {
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
      label.textContent = chatText('generated');
      article.append(label);
    }
    actionButtons(article, actions);
    log.append(article);
    log.scrollTop = log.scrollHeight;
    return article;
  }
  function renderTranscript() {
    log.replaceChildren();
    suggestions.hidden = transcript.length > 0;
    if (!transcript.length) {
      const welcome = addMessage('assistant', chatText('intro'));
      welcome.classList.add('chat-welcome');
      const symbol = document.createElement('div');
      symbol.className = 'chat-welcome-symbol';
      symbol.innerHTML = icons.heart;
      const heading = document.createElement('h3');
      heading.textContent = chatText('welcome');
      const author = welcome.querySelector('.chat-author');
      author.textContent = chatText('eyebrow');
      author.before(symbol);
      author.after(heading);
      log.append(suggestions);
    } else {
      log.append(suggestions);
      transcript.forEach((message) =>
        addMessage(
          message.role,
          message.content,
          message.sources,
          message.role === 'assistant' && !message.local,
          message.actions,
        ),
      );
    }
  }
  function resizeInput() {
    input.style.height = 'auto';
    input.style.height = Math.max(48, Math.min(128, input.scrollHeight)) + 'px';
  }
  function updateCount() {
    input.setCustomValidity('');
    $('#chat-count').textContent = input.value.length + '/1000 ' + chatText('chars');
    resizeInput();
  }
  function updateViewport() {
    const viewport = window.visualViewport;
    const layoutHeight = document.documentElement.clientHeight || innerHeight;
    widget.style.setProperty('--chat-viewport-height', (viewport?.height || layoutHeight) + 'px');
    widget.style.setProperty(
      '--chat-keyboard-offset',
      Math.max(0, layoutHeight - (viewport?.height || layoutHeight) - (viewport?.offsetTop || 0)) +
        'px',
    );
  }
  function toggle(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    launcher.setAttribute('aria-label', chatText(open ? 'close' : 'open'));
    $('.chat-launcher-label').textContent = chatText(open ? 'close' : 'open');
    updateViewport();
    resizeInput();
    (open ? (contactForm.hidden ? input : contactFields[0]) : launcher).focus();
    if (open) log.scrollTop = log.scrollHeight;
  }
  function clearError() {
    errorBox.hidden = true;
    errorBox.querySelector('p').textContent = '';
  }
  function errorMessage(error) {
    if (error.publicMessage) return error.publicMessage;
    if (error.name === 'AbortError')
      return 'A resposta está demorando mais que o esperado. Sua pergunta foi preservada; você pode tentar novamente.';
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
    status.textContent = chatText('typing');
    suggestions.hidden = true;
    log.querySelector('.chat-welcome')?.remove();
    const bubble = userMessage || addMessage('user', message);
    bubble.dataset.state = 'pending';
    if (input.value.trim() === message) {
      input.value = '';
      updateCount();
    }
    const timer = setTimeout(() => controller.abort(), 130000);
    try {
      if (location.protocol === 'file:')
        throw {
          publicMessage:
            'O chat ainda não está conectado ao modelo de IA. Abra o site pelo servidor do projeto para conversar.',
        };
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: historyForRequest(),
          context: {
            language: document.documentElement.lang,
            page: location.pathname.split('/').pop() || 'index.html',
          },
        }),
        signal: controller.signal,
      });
      if ([404, 405, 501].includes(response.status))
        throw {
          publicMessage:
            'O chat deste site ainda não está conectado ao modelo de IA. Consulte as páginas do Instituto enquanto a conexão é configurada.',
        };
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw {
          publicMessage:
            typeof result?.error === 'string' && result.error.length <= 400
              ? result.error
              : response.status === 429
                ? 'Aguarde um minuto antes de enviar outra pergunta.'
                : 'A IA está indisponível no momento. Tente novamente em instantes.',
        };
      if (
        !result ||
        result.mode !== 'ai' ||
        typeof result.answer !== 'string' ||
        !result.answer.trim() ||
        result.answer.length > 3000 ||
        !Array.isArray(result.sources)
      )
        throw new Error('invalid_response');
      if (id !== requestId) return;
      const sources = safeSources(result.sources);
      const actions = safeActions(result.actions);
      transcript = [
        ...transcript,
        { role: 'user', content: message, sources: [] },
        { role: 'assistant', content: result.answer.trim(), sources, actions },
      ].slice(-20);
      saveTranscript();
      bubble.dataset.state = 'sent';
      addMessage('assistant', result.answer.trim(), sources, true, actions);
      while (log.querySelectorAll('.chat-message').length > 20)
        log.querySelector('.chat-message').remove();
      status.textContent = '';
    } catch (error) {
      if (id !== requestId) return;
      failed = { message, bubble };
      bubble.dataset.state = 'failed';
      status.textContent = '';
      errorBox.querySelector('p').textContent = errorMessage(error);
      errorBox.hidden = false;
      if (!input.value) {
        input.value = message;
        updateCount();
      }
    } finally {
      clearTimeout(timer);
      if (id === requestId) {
        pending = null;
        send.disabled = false;
        retry.disabled = false;
        form.removeAttribute('aria-busy');
        if (!panel.hidden && (document.activeElement === send || document.activeElement === input))
          input.focus();
      }
    }
  }

  transcript = restoreTranscript();
  function translateUI() {
    widget.lang = document.documentElement.lang;
    widget.querySelectorAll('[data-chat-text]').forEach((element) => {
      element.textContent = chatText(element.dataset.chatText);
    });
    $('.chat-launcher-label').textContent = chatText(panel.hidden ? 'open' : 'close');
    launcher.setAttribute('aria-label', chatText(panel.hidden ? 'open' : 'close'));
    $('.chat-heading p').textContent = chatText('assistant');
    for (const [selector, key] of [
      ['.chat-close', 'close'],
      ['.chat-reset', 'reset'],
      ['.chat-send', 'send'],
    ]) {
      $(selector).setAttribute('aria-label', chatText(key));
      $(selector).title = chatText(key);
    }
    form.querySelector('label').textContent = chatText('message');
    input.placeholder = chatText('placeholder');
    $('#chat-privacy').textContent = chatText('aiPrivacy');
    $('.chat-session-note').textContent = chatText('session');
    $('.chat-keyboard-hint').lastChild.textContent = ' ' + chatText('enter');
    suggestions.querySelector('p').textContent = chatText('questions');
    suggestions.querySelectorAll('button span').forEach((span, index) => {
      span.textContent = chatText(['projects', 'volunteerQuestion', 'donate'][index]);
    });
    log.querySelectorAll('.chat-author').forEach((author) => {
      if (author.closest('[data-role="user"]')) author.textContent = chatText('you');
    });
    log.querySelectorAll('.chat-sources-title').forEach((element) => {
      element.textContent = chatText('sources');
    });
    log.querySelectorAll('.chat-message>small').forEach((element) => {
      element.textContent = chatText('generated');
    });
    contactFallback.textContent = chatText('emailApp');
    $('.chat-tools').setAttribute('aria-label', chatText('choose'));
    suggestions.setAttribute('aria-label', chatText('questions'));
    log.setAttribute('aria-label', chatText('message'));
    updateCount();
    widget.querySelectorAll('[data-chat-action]').forEach((button) => {
      button.textContent = actionLabel(button.dataset.chatAction);
    });
    if (contactStatusKey) contactStatus.textContent = chatText(contactStatusKey);
    if (!transcript.length && !pending) renderTranscript();
  }
  document.addEventListener('esperanca:languagechange', translateUI);
  window.addEventListener('pagehide', () => contactController?.abort());
  renderTranscript();
  translateUI();
  updateViewport();
  window.visualViewport?.addEventListener('resize', updateViewport);
  window.visualViewport?.addEventListener('scroll', updateViewport);
  window.addEventListener('resize', updateViewport, { passive: true });
  try {
    if (sessionStorage.getItem('esperanca-chat-open') === 'true') {
      sessionStorage.removeItem('esperanca-chat-open');
      toggle(true);
    }
  } catch {}
  launcher.addEventListener('click', () => toggle(panel.hidden));
  $('.chat-close').addEventListener('click', () => toggle(false));
  widget.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      toggle(false);
    }
  });
  input.addEventListener('input', updateCount);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      if (!pending) form.requestSubmit();
    }
  });
  $('.chat-reset').addEventListener('click', () => {
    if (contactPending) return;
    closeContact();
    contactForm.reset();
    contactStatusKey = '';
    contactStatus.textContent = '';
    contactFallback.hidden = true;
    try {
      sessionStorage.removeItem(contactDraftKey);
    } catch {}
    requestId++;
    pending?.abort();
    pending = null;
    failed = null;
    transcript = [];
    try {
      sessionStorage.removeItem(sessionKey);
    } catch {
      /* Sem armazenamento. */
    }
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
  suggestions.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button || pending) return;
    input.value = button.querySelector('span').textContent;
    updateCount();
    input.focus();
    form.requestSubmit();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (pending) return;
    const message = input.value.trim();
    input.setCustomValidity(
      !message
        ? 'Escreva uma pergunta para continuar.'
        : message.length > 1000
          ? 'Escreva uma pergunta de até 1000 caracteres.'
          : '',
    );
    if (!form.reportValidity()) return;
    const previousBubble = failed?.message === message ? failed.bubble : null;
    if (failed && !previousBubble) failed.bubble.remove();
    const action = window.esperancaChatActions.detect(message);
    if (action) {
      failed?.bubble.remove();
      failed = null;
      clearError();
      input.value = '';
      updateCount();
      if (action !== 'contact:open') {
        const answer = actionLabel(action);
        transcript = [
          ...transcript,
          { role: 'user', content: message, sources: [], local: true },
          { role: 'assistant', content: answer, sources: [], local: true },
        ].slice(-20);
        saveTranscript();
        renderTranscript();
      }
      executeAction(action);
      return;
    }
    ask(message, previousBubble);
  });
})();
