/* Pequenas melhorias progressivas: o conteúdo e os links são HTML estático. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  document.querySelectorAll('[data-js-only]').forEach(el => { el.hidden = false; el.disabled = false; });

  const preferenceKey = 'esperanca-visual-preferences';
  let preferences = { scale: 1, contrast: false, invert: false, theme: 'system' };
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceKey));
    if (saved && typeof saved === 'object') {
      preferences.scale = Math.max(0.9, Math.min(1.3, Number(saved.scale) || 1));
      preferences.contrast = saved.contrast === true;
      preferences.invert = saved.invert === true;
      preferences.theme = ['system', 'light', 'dark'].includes(saved.theme) ? saved.theme : 'system';
    }
  } catch { /* As preferências continuam disponíveis sem armazenamento. */ }
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const updatePreferences = (save = false) => {
    root.style.setProperty('--font-scale', preferences.scale);
    root.classList.toggle('high-contrast', preferences.contrast);
    root.classList.toggle('inverted-colors', preferences.invert);
    root.classList.toggle('theme-dark', preferences.theme === 'dark' || (preferences.theme === 'system' && systemTheme.matches));
    document.querySelectorAll('[data-theme-preference]').forEach(select => { select.value = preferences.theme; });
    document.querySelectorAll('[data-contrast-toggle]').forEach(button => button.setAttribute('aria-pressed', String(preferences.contrast)));
    document.querySelectorAll('[data-invert-toggle]').forEach(button => button.setAttribute('aria-pressed', String(preferences.invert)));
    document.querySelectorAll('[data-font-status]').forEach(el => { el.textContent = window.esperancaI18n?.t('Tamanho do texto: {percent}%.').replace('{percent}', Math.round(preferences.scale * 100)) || `Tamanho do texto: ${Math.round(preferences.scale * 100)}%.`; });
    document.querySelectorAll('[data-font-size="decrease"]').forEach(el => { el.disabled = preferences.scale <= 0.9; });
    document.querySelectorAll('[data-font-size="increase"]').forEach(el => { el.disabled = preferences.scale >= 1.3; });
    if (save) { try { localStorage.setItem(preferenceKey, JSON.stringify(preferences)); } catch { /* Sem persistência neste navegador. */ } }
  };
  updatePreferences();
  document.addEventListener('esperanca:languagechange', () => updatePreferences());
  document.querySelectorAll('[data-font-size]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.fontSize;
    preferences.scale = action === 'reset' ? 1 : Math.max(0.9, Math.min(1.3, Math.round((preferences.scale + (action === 'increase' ? 0.1 : -0.1)) * 10) / 10));
    updatePreferences(true);
  }));
  document.querySelectorAll('[data-contrast-toggle]').forEach(button => button.addEventListener('click', () => { preferences.contrast = !preferences.contrast; updatePreferences(true); }));
  document.querySelectorAll('[data-invert-toggle]').forEach(button => button.addEventListener('click', () => { preferences.invert = !preferences.invert; updatePreferences(true); }));
  document.querySelectorAll('[data-theme-preference]').forEach(select => select.addEventListener('change', () => {
    preferences.theme = ['system', 'light', 'dark'].includes(select.value) ? select.value : 'system';
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
    const subject = new URLSearchParams(window.location.search).get('assunto');
    const select = form.querySelector('#assunto');
    if ([...select.options].some(option => option.value === subject)) select.value = subject;
    if (window.location.hash === '#voluntario' && !subject) select.value = 'voluntariado';
    const fields = form.querySelector('#contact-fields');
    const submitLabel = form.querySelector('#contact-submit-label');
    const result = form.querySelector('#form-result');
    const status = form.querySelector('#form-status');
    const fallback = form.querySelector('#contact-fallback');
    const contactAddress = fallback.getAttribute('href').slice('mailto:'.length);
    const t = phrase => window.esperancaI18n?.t(phrase) || phrase;
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
      if (['nome', 'mensagem'].includes(event.target.id)) event.target.setCustomValidity('');
      if (!sending) {
        result.hidden = true;
        statusPhrase = '';
      }
    });
    document.addEventListener('esperanca:languagechange', renderStatus);
    renderStatus();
  }
})();
