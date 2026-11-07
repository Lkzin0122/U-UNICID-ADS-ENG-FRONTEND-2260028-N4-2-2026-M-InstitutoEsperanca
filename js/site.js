/* Pequenas melhorias progressivas: o conteúdo e os links são HTML estático. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  document.querySelectorAll('[data-js-only]').forEach(el => { el.hidden = false; el.disabled = false; });

  const heartAnimations = new WeakMap();
  const reducedHeartMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-heart-pop]').forEach(button => button.addEventListener('click', () => {
    let state = heartAnimations.get(button);
    if (!state) {
      state = { pulse: null, particles: new Set() };
      heartAnimations.set(button, state);
    }
    state.pulse?.cancel();
    const glyph = button.querySelector('.heart-pop-glyph');
    glyph.textContent = '♥';
    const blink = glyph.animate(reducedHeartMotion.matches
      ? [{opacity:1}, {opacity:.7}, {opacity:1}]
      : [{opacity:1, transform:'scale(1)'}, {opacity:.8, transform:'scale(.9)', offset:.15},
        {opacity:1, transform:'scale(1.35)', offset:.35}, {opacity:1, transform:'scale(1)'}],
      {duration:500, easing:'ease-out'});
    state.pulse = blink;
    blink.onfinish = () => {
      if (state.pulse !== blink) return;
      glyph.textContent = '♡';
      blink.cancel();
      state.pulse = null;
    };
    if (reducedHeartMotion.matches) return;

    const rect = button.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const edge = 24 * parseFloat(getComputedStyle(root).fontSize) / 16;
    for (let i = 0; i < 3; i++) {
      // Keep repeated likes alive together, with a small cap for very rapid taps.
      if (state.particles.size >= 36) state.particles.values().next().value();
      const particle = document.createElement('span');
      particle.className = 'heart-pop-particle';
      particle.textContent = '♥';
      particle.setAttribute('aria-hidden', 'true');
      particle.setAttribute('data-no-translate', '');
      particle.style.fontSize = `${.75 + Math.random() * .5}rem`;
      button.append(particle);
      const drift = Math.max(edge - center, Math.min(document.documentElement.clientWidth - edge - center, (i - 1) * 24 + (Math.random() - .5) * 22));
      const rise = 64 + Math.random() * 48;
      const turn = (Math.random() - .5) * 42;
      const flight = particle.animate([
        {opacity:0, transform:'translate(-50%,-50%) scale(.4)'},
        {opacity:1, transform:`translate(calc(-50% + ${drift * .2}px),calc(-50% - 15px)) scale(1.05)`, offset:.2},
        {opacity:.9, transform:`translate(calc(-50% + ${drift * .65}px),calc(-50% - ${rise * .65}px)) rotate(${turn * .5}deg) scale(1)`, offset:.65},
        {opacity:0, transform:`translate(calc(-50% + ${drift}px),calc(-50% - ${rise}px)) rotate(${turn}deg) scale(.75)`}
      ], {duration:500 - i * 25, delay:i * 25, easing:'ease-out', fill:'both'});
      const cleanup = () => {
        clearTimeout(timer);
        flight.cancel();
        particle.remove();
        state.particles.delete(cleanup);
      };
      const timer = setTimeout(cleanup, 500);
      flight.onfinish = cleanup;
      state.particles.add(cleanup);
    }
  }));

  const preferenceKey = 'esperanca-visual-preferences';
  const defaultPreferences = { scale: 1, contrast: false, invert: false, theme: 'system', colorVision: 'off' };
  const colorVisionOptions = ['off', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
  const legacyColorVision = { 'red-green':'deuteranopia', 'blue-yellow':'tritanopia', monochrome:'achromatopsia' };
  let preferences = { ...defaultPreferences };
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceKey));
    if (saved && typeof saved === 'object') {
      preferences.scale = Math.max(0.9, Math.min(2, Number(saved.scale) || 1));
      preferences.contrast = saved.contrast === true;
      preferences.invert = saved.invert === true;
      preferences.theme = ['system', 'light', 'dark'].includes(saved.theme) ? saved.theme : 'system';
      const colorVision = legacyColorVision[saved.colorVision] || saved.colorVision;
      preferences.colorVision = colorVisionOptions.includes(colorVision) ? colorVision : 'off';
    }
  } catch { /* As preferências continuam disponíveis sem armazenamento. */ }
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const updatePreferences = (save = false) => {
    root.style.setProperty('--font-scale', preferences.scale);
    root.classList.toggle('high-contrast', preferences.contrast);
    root.classList.toggle('inverted-colors', preferences.invert);
    root.classList.toggle('theme-dark', preferences.theme === 'dark' || (preferences.theme === 'system' && systemTheme.matches));
    root.dataset.colorVision = preferences.colorVision;
    document.querySelectorAll('[data-theme-preference]').forEach(select => { select.value = preferences.theme; });
    document.querySelectorAll('select[data-color-vision]').forEach(select => { select.value = preferences.colorVision; });
    document.querySelectorAll('[data-contrast-toggle]').forEach(button => button.setAttribute('aria-pressed', String(preferences.contrast)));
    document.querySelectorAll('[data-invert-toggle]').forEach(button => button.setAttribute('aria-pressed', String(preferences.invert)));
    document.querySelectorAll('[data-font-status]').forEach(el => { el.textContent = window.esperancaI18n?.t('Tamanho do texto: {percent}%.').replace('{percent}', Math.round(preferences.scale * 100)) || `Tamanho do texto: ${Math.round(preferences.scale * 100)}%.`; });
    document.querySelectorAll('[data-font-size="decrease"]').forEach(el => { el.disabled = preferences.scale <= 0.9; });
    document.querySelectorAll('[data-font-size="increase"]').forEach(el => { el.disabled = preferences.scale >= 2; });
    if (save) { try { localStorage.setItem(preferenceKey, JSON.stringify(preferences)); } catch { /* Sem persistência neste navegador. */ } }
    document.querySelectorAll('iframe').forEach(frame => {
      try {
        if (new URL(frame.src, document.baseURI).origin !== location.origin) return;
        const notify = () => frame.contentWindow?.postMessage({ type: 'esperanca:visual', preferences }, location.origin);
        if (!frame.dataset.visualSyncBound) {
          frame.addEventListener('load', () => frame.contentWindow?.postMessage({ type: 'esperanca:visual', preferences }, location.origin));
          frame.dataset.visualSyncBound = 'true';
        }
        notify();
      } catch { /* Uma mídia externa mantém seus próprios controles. */ }
    });
  };
  updatePreferences();
  document.addEventListener('esperanca:languagechange', () => updatePreferences());
  document.querySelectorAll('[data-font-size]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.fontSize;
    preferences.scale = action === 'reset' ? 1 : Math.max(0.9, Math.min(2, Math.round((preferences.scale + (action === 'increase' ? 0.1 : -0.1)) * 10) / 10));
    updatePreferences(true);
  }));
  document.querySelectorAll('[data-contrast-toggle]').forEach(button => button.addEventListener('click', () => { preferences.contrast = !preferences.contrast; updatePreferences(true); }));
  document.querySelectorAll('[data-invert-toggle]').forEach(button => button.addEventListener('click', () => { preferences.invert = !preferences.invert; updatePreferences(true); }));
  document.querySelectorAll('[data-theme-preference]').forEach(select => select.addEventListener('change', () => {
    preferences.theme = ['system', 'light', 'dark'].includes(select.value) ? select.value : 'system';
    updatePreferences(true);
  }));
  document.querySelectorAll('select[data-color-vision]').forEach(select => select.addEventListener('change', () => {
    preferences.colorVision = colorVisionOptions.includes(select.value) ? select.value : 'off';
    updatePreferences(true);
  }));
  document.querySelectorAll('[data-visual-reset]').forEach(button => button.addEventListener('click', () => {
    preferences = { ...defaultPreferences };
    updatePreferences(true);
  }));
  systemTheme.addEventListener?.('change', () => { if (preferences.theme === 'system') updatePreferences(); });

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('#main-nav');
  const groups = [...document.querySelectorAll('.nav-group')];
  const desktopQuery = window.matchMedia('(min-width: 1100px)');
  const updateMenuPosition = () => {
    const header = menuButton?.closest('.site-header');
    if (header) header.style.setProperty('--nav-top', `${Math.max(0, header.getBoundingClientRect().bottom)}px`);
  };
  const closeMenu = () => {
    nav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    groups.forEach(group => { group.open = false; });
  };
  menuButton?.addEventListener('click', () => {
    if (!nav) return;
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    if (!open) { closeMenu(); return; }
    updateMenuPosition();
    nav.scrollTop = 0;
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav?.addEventListener('click', event => {
    if (!desktopQuery.matches && event.target.closest('a[href]')) closeMenu();
  });
  menuButton?.closest('.navbar')?.addEventListener('focusout', event => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
  });
  window.addEventListener('scroll', () => { if (nav?.classList.contains('is-open')) updateMenuPosition(); }, { passive: true });
  window.addEventListener('resize', updateMenuPosition, { passive: true });
  if (window.ResizeObserver && menuButton) new ResizeObserver(updateMenuPosition).observe(menuButton.closest('.site-header'));
  groups.forEach(group => group.addEventListener('toggle', () => {
    if (group.open) groups.forEach(other => { if (other !== group) other.open = false; });
  }));
  document.addEventListener('click', event => {
    groups.forEach(group => { if (!group.contains(event.target)) group.open = false; });
    if (!event.target.closest('.navbar')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openGroup = groups.find(group => group.open);
    if (openGroup) { openGroup.open = false; openGroup.querySelector('summary').focus(); }
    else if (nav?.classList.contains('is-open')) { closeMenu(); menuButton?.focus(); }
  });
  desktopQuery.addEventListener?.('change', closeMenu);

  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const buttons = [...group.querySelectorAll('[data-filter]')];
    const items = [...group.querySelectorAll('[data-filter-item]')];
    let visibleCount = items.filter(item => !item.hidden).length;
    const updateFilterStatus = () => {
      const status = group.querySelector('[data-filter-status]');
      if (!status) return;
      status.textContent = visibleCount === 1
        ? (window.esperancaI18n?.t('1 conteúdo encontrado.') || '1 conteúdo encontrado.')
        : (window.esperancaI18n?.t('{count} conteúdos encontrados.').replace('{count}', visibleCount) || `${visibleCount} conteúdos encontrados.`);
    };
    document.addEventListener('esperanca:languagechange', updateFilterStatus);
    buttons.forEach(button => button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      buttons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      items.forEach(item => {
        const show = ['all', 'todos'].includes(filter) || item.dataset.category?.split(' ').includes(filter);
        item.hidden = !show;
      });
      visibleCount = items.filter(item => !item.hidden).length;
      updateFilterStatus();
    }));
  });

  const dialog = document.querySelector('#image-dialog');
  const dialogImage = document.querySelector('#dialog-image');
  const dialogCaption = document.querySelector('#dialog-caption');
  document.querySelectorAll('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
    if (!dialog || !dialogImage || !dialogCaption) return;
    const image = button.querySelector('img') || button.closest('figure')?.querySelector('img');
    dialogImage.src = button.dataset.lightbox || image?.src;
    dialogImage.alt = image?.alt || button.dataset.caption || '';
    dialogCaption.textContent = button.dataset.caption || button.closest('figure')?.querySelector('figcaption')?.textContent || '';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else window.open(dialogImage.src, '_blank', 'noopener');
  }));
  dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  const form = document.querySelector('#contact-form');
  if (form) {
    const phoneInput = form.querySelector('#telefone');
    const phoneUi = {
      hi: { selectedCountryAriaLabel: 'फ़ोन का देश बदलें; अभी ${countryName} (${dialCode}) चुना गया है', noCountrySelected: 'फ़ोन का देश चुनें', countryListAriaLabel: 'देशों की सूची', searchPlaceholder: 'खोजें', clearSearchAriaLabel: 'खोज मिटाएँ', closeCountrySelectorAriaLabel: 'बंद करें', searchEmptyState: 'कोई परिणाम नहीं मिला', searchSummaryAria: count => count === 0 ? 'कोई परिणाम नहीं मिला' : count === 1 ? '1 परिणाम मिला' : `${count} परिणाम मिले` },
      'pt-BR': { selectedCountryAriaLabel: 'Alterar país do telefone; selecionado ${countryName} (${dialCode})', noCountrySelected: 'Selecionar o país do telefone', countryListAriaLabel: 'Lista de países', searchPlaceholder: 'Buscar', clearSearchAriaLabel: 'Limpar busca', closeCountrySelectorAriaLabel: 'Fechar', searchEmptyState: 'Nenhum resultado encontrado', searchSummaryAria: count => count === 0 ? 'Nenhum resultado encontrado' : count === 1 ? '1 resultado encontrado' : `${count} resultados encontrados` },
      en: { selectedCountryAriaLabel: 'Change phone country; currently ${countryName} (${dialCode})', noCountrySelected: 'Select phone country', countryListAriaLabel: 'Country list', searchPlaceholder: 'Search', clearSearchAriaLabel: 'Clear search', closeCountrySelectorAriaLabel: 'Close', searchEmptyState: 'No results found', searchSummaryAria: count => count === 0 ? 'No results found' : count === 1 ? '1 result found' : `${count} results found` },
      'zh-CN': { selectedCountryAriaLabel: '更改电话号码国家/地区；当前为${countryName}（${dialCode}）', noCountrySelected: '选择电话号码国家/地区', countryListAriaLabel: '国家和地区列表', searchPlaceholder: '搜索', clearSearchAriaLabel: '清除搜索', closeCountrySelectorAriaLabel: '关闭', searchEmptyState: '没有找到结果', searchSummaryAria: count => count === 0 ? '没有找到结果' : `找到${count}个结果` },
      de: { selectedCountryAriaLabel: 'Telefonland ändern; aktuell ${countryName} (${dialCode})', noCountrySelected: 'Telefonland auswählen', countryListAriaLabel: 'Länderliste', searchPlaceholder: 'Suchen', clearSearchAriaLabel: 'Suche löschen', closeCountrySelectorAriaLabel: 'Schließen', searchEmptyState: 'Keine Ergebnisse gefunden', searchSummaryAria: count => count === 0 ? 'Keine Ergebnisse gefunden' : count === 1 ? '1 Ergebnis gefunden' : `${count} Ergebnisse gefunden` },
      fr: { selectedCountryAriaLabel: 'Changer le pays du téléphone ; actuellement ${countryName} (${dialCode})', noCountrySelected: 'Sélectionner le pays du téléphone', countryListAriaLabel: 'Liste des pays', searchPlaceholder: 'Rechercher', clearSearchAriaLabel: 'Effacer la recherche', closeCountrySelectorAriaLabel: 'Fermer', searchEmptyState: 'Aucun résultat', searchSummaryAria: count => count === 0 ? 'Aucun résultat' : count === 1 ? '1 résultat' : `${count} résultats` },
      'es-419': { selectedCountryAriaLabel: 'Cambiar país del teléfono; actualmente ${countryName} (${dialCode})', noCountrySelected: 'Seleccionar país del teléfono', countryListAriaLabel: 'Lista de países', searchPlaceholder: 'Buscar', clearSearchAriaLabel: 'Borrar búsqueda', closeCountrySelectorAriaLabel: 'Cerrar', searchEmptyState: 'No se encontraron resultados', searchSummaryAria: count => count === 0 ? 'No se encontraron resultados' : count === 1 ? '1 resultado encontrado' : `${count} resultados encontrados` },
      ru: { selectedCountryAriaLabel: 'Изменить страну телефона; выбрана ${countryName} (${dialCode})', noCountrySelected: 'Выбрать страну телефона', countryListAriaLabel: 'Список стран', searchPlaceholder: 'Поиск', clearSearchAriaLabel: 'Очистить поиск', closeCountrySelectorAriaLabel: 'Закрыть', searchEmptyState: 'Ничего не найдено', searchSummaryAria: count => count === 0 ? 'Ничего не найдено' : count === 1 ? 'Найден 1 результат' : `Найдено результатов: ${count}` },
      ja: { selectedCountryAriaLabel: '電話番号の国を変更。現在は${countryName}（${dialCode}）', noCountrySelected: '電話番号の国を選択', countryListAriaLabel: '国の一覧', searchPlaceholder: '検索', clearSearchAriaLabel: '検索をクリア', closeCountrySelectorAriaLabel: '閉じる', searchEmptyState: '結果が見つかりません', searchSummaryAria: count => count === 0 ? '結果が見つかりません' : `${count}件の結果` },
    };
    const phoneController = window.esperancaPhoneInput?.create(phoneInput, phoneUi[document.documentElement.lang] || phoneUi['pt-BR']);
    const validatePhone = () => {
      if (phoneController) return phoneController.validate(true);
      const message = phoneInput.value.trim() ? 'Não foi possível carregar a validação do telefone. Tente novamente ou deixe este campo opcional em branco.' : '';
      phoneInput.setCustomValidity(window.esperancaI18n?.t(message) || message);
      return !message;
    };
    form.addEventListener('submit', validatePhone);
    if (!phoneController) phoneInput.addEventListener('input', validatePhone);
    document.addEventListener('esperanca:languagechange', () => phoneController?.setLocale(phoneUi[document.documentElement.lang] || phoneUi['pt-BR']));
    const draftKey = 'esperanca-contact-draft';
    const draftFields = ['nome', 'email', 'telefone', 'assunto', 'mensagem'];
    const draftStores = ['sessionStorage', 'localStorage'];
    let draft = null;
    for (const store of draftStores) {
      try {
        const saved = JSON.parse(window[store].getItem(draftKey));
        if (saved && typeof saved === 'object' && !Array.isArray(saved)
          && draftFields.some(id => typeof saved[id] === 'string')) {
          draft = saved;
          break;
        }
      } catch { /* Tente o outro armazenamento se este estiver indisponível ou corrompido. */ }
    }
    if (draft) {
      const widget = window.intlTelInput?.getInstance(phoneInput);
      if (typeof draft.country === 'string' && window.esperancaPhoneData?.countries[draft.country.toUpperCase()]) {
        widget?.setSelectedCountry(draft.country.toLowerCase());
      }
      for (const id of draftFields) {
        if (typeof draft[id] !== 'string') continue;
        const field = form.querySelector(`#${id}`);
        if (field.tagName === 'SELECT' && ![...field.options].some(option => option.value === draft[id])) continue;
        field.value = draft[id].slice(0, field.maxLength > 0 ? field.maxLength : 250);
      }
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const saveDraft = () => {
      const saved = Object.fromEntries(draftFields.map(id => [id, form.querySelector(`#${id}`).value]));
      saved.country = window.intlTelInput?.getInstance(phoneInput)?.getSelectedCountry()?.iso2 || 'br';
      const json = JSON.stringify(saved);
      for (const store of draftStores) {
        try { window[store].setItem(draftKey, json); } catch { /* O formulário funciona sem armazenamento. */ }
      }
    };
    const clearDraft = () => {
      for (const store of draftStores) {
        try { window[store].removeItem(draftKey); } catch { /* Não interrompa o envio se o armazenamento estiver bloqueado. */ }
      }
    };
    const subject = new URLSearchParams(window.location.search).get('assunto');
    const select = form.querySelector('#assunto');
    if ([...select.options].some(option => option.value === subject)) select.value = subject;
    if (window.location.hash === '#voluntario' && !subject) select.value = 'voluntariado';
    if (draft) saveDraft();
    const fields = form.querySelector('#contact-fields');
    const submitLabel = form.querySelector('#contact-submit-label');
    const result = form.querySelector('#form-result');
    const status = form.querySelector('#form-status');
    const fallback = form.querySelector('#contact-fallback');
    const contactAddress = fallback.getAttribute('href').slice('mailto:'.length);
    const t = phrase => window.esperancaI18n?.t(phrase) || phrase;
    const localizedValidation = new Map();
    form.addEventListener('invalid', event => {
      const field = event.target;
      if (window.esperancaI18n?.language !== 'hi' || !['nome', 'email', 'assunto', 'mensagem'].includes(field.id)) return;
      if (field.validity.customError && !localizedValidation.has(field)) return;
      field.setCustomValidity('');
      const missing = { nome: 'Informe seu nome.', email: 'Informe seu e-mail.', assunto: 'Selecione um assunto.', mensagem: 'Escreva sua mensagem.' };
      const phrase = field.validity.valueMissing ? missing[field.id]
        : field.validity.typeMismatch ? 'Informe um e-mail válido.'
        : field.validity.tooShort ? 'Escreva uma mensagem com pelo menos 10 caracteres.'
        : field.validity.tooLong ? 'Respeite o limite de caracteres deste campo.' : '';
      if (phrase) { localizedValidation.set(field, phrase); field.setCustomValidity(t(phrase)); }
    }, true);
    document.addEventListener('esperanca:languagechange', () => {
      localizedValidation.forEach((phrase, field) => field.setCustomValidity(t(phrase)));
    });
    let sending = false;
    let statusPhrase = '';
    const renderStatus = () => {
      submitLabel.textContent = t(sending ? 'Enviando…' : 'Enviar mensagem');
      status.textContent = t(statusPhrase);
    };
    const showStatus = (phrase, state) => {
      statusPhrase = phrase;
      result.dataset.state = state;
      result.hidden = false;
      fallback.hidden = state !== 'error';
      renderStatus();
      if (!sending) result.focus();
    };
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending) return;
      saveDraft();
      const value = id => form.querySelector(`#${id}`).value.trim();
      form.querySelector('#nome').setCustomValidity(value('nome') ? '' : t('Informe seu nome.'));
      form.querySelector('#mensagem').setCustomValidity(value('mensagem').length >= 10 ? '' : t('Escreva uma mensagem com pelo menos 10 caracteres.'));
      if (!validatePhone() || !form.reportValidity()) { form.reportValidity(); return; }

      const params = {
        from_name: value('nome'),
        reply_to: value('email'),
        phone: phoneController?.getNumber('INTERNATIONAL') || t('Não informado'),
        subject: select.selectedOptions[0].textContent.trim(),
        message: value('mensagem'),
      };
      const body = `${t('Nome')}: ${params.from_name}\n${t('E-mail')}: ${params.reply_to}\n${t('Telefone')}: ${params.phone}\n${t('Assunto')}: ${params.subject}\n\n${params.message}`;
      fallback.href = `mailto:${contactAddress}?subject=${encodeURIComponent(`Instituto Esperança — ${params.subject}`)}&body=${encodeURIComponent(body)}`;
      const config = window.ESPERANCA_EMAILJS;
      if (!config || !['serviceId', 'templateId', 'publicKey'].every(key => typeof config[key] === 'string' && config[key].trim())) {
        showStatus('O envio pelo site está temporariamente indisponível. Use o e-mail do Instituto para entrar em contato.', 'error');
        return;
      }

      sending = true;
      fields.disabled = true;
      form.setAttribute('aria-busy', 'true');
      showStatus('Enviando sua mensagem. Aguarde…', 'sending');
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: config.serviceId.trim(),
            template_id: config.templateId.trim(),
            user_id: config.publicKey.trim(),
            template_params: params,
          }),
          signal: controller.signal,
        });
        if (!response.ok) {
          // O corpo contém o motivo da recusa (serviço, template, domínio etc.).
          // Não registre o formulário ou a chave pública junto do diagnóstico.
          let detail = '';
          try { detail = (await response.text()).slice(0, 1000); } catch { /* Preserve o status mesmo se o corpo não carregar. */ }
          [config.publicKey.trim(), params.from_name, params.reply_to, params.phone, params.message].forEach(value => {
            if (value) detail = detail.split(value).join('[dado omitido]');
          });
          console.error('EmailJS: envio recusado.', { status: response.status, detail });
          const missingTemplate = response.status === 400 && /template id not found/i.test(detail);
          showStatus(missingTemplate
            ? 'O envio pelo site está temporariamente indisponível. Use o e-mail do Instituto para entrar em contato.'
            : response.status === 429
            ? 'Muitas tentativas de envio. Aguarde um minuto e tente novamente ou use o e-mail do Instituto.'
            : 'Não foi possível enviar sua mensagem. Tente novamente ou use o e-mail do Instituto.', 'error');
          return;
        }
        form.reset();
        phoneController?.reset();
        clearDraft();
        showStatus('Mensagem enviada com sucesso! Obrigado por entrar em contato com o Instituto.', 'success');
      } catch (error) {
        showStatus(error.name === 'AbortError'
          ? 'Não foi possível confirmar o envio. Aguarde alguns instantes antes de tentar novamente ou entre em contato por e-mail.'
          : 'Não foi possível enviar sua mensagem. Confira sua conexão e tente novamente ou use o e-mail do Instituto.', 'error');
      } finally {
        window.clearTimeout(timeout);
        sending = false;
        fields.disabled = false;
        form.setAttribute('aria-busy', 'false');
        renderStatus();
        result.focus();
      }
    });
    form.addEventListener('input', event => {
      saveDraft();
      if (localizedValidation.has(event.target)) {
        event.target.setCustomValidity('');
        localizedValidation.delete(event.target);
      }
      if (['nome', 'mensagem'].includes(event.target.id)) event.target.setCustomValidity('');
      if (!sending) {
        result.hidden = true;
        statusPhrase = '';
      }
    });
    form.addEventListener('change', saveDraft);
    phoneInput.addEventListener('countrychange', saveDraft);
    document.addEventListener('esperanca:languagechange', renderStatus);
    renderStatus();
  }
})();
