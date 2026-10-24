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
  const closeMenu = () => { nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); };
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
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
    else if (nav.classList.contains('is-open')) { closeMenu(); menuButton.focus(); }
  });
  const desktopQuery = window.matchMedia('(min-width: 1100px)');
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
    let phoneWidget = null;
    let phoneUtilsReady = false;
    if (phoneInput && typeof window.intlTelInput === 'function') {
      const validatePhone = () => {
        const value = phoneInput.value.trim();
        const error = !value ? ''
          : !phoneUtilsReady ? (window.esperancaI18n?.t('Aguarde a validação do telefone carregar e tente novamente.') || 'Aguarde a validação do telefone carregar e tente novamente.')
          : !phoneWidget.isValidNumber() ? (window.esperancaI18n?.t('Confira o país, o DDD e o número de telefone.') || 'Confira o país, o DDD e o número de telefone.')
          : '';
        phoneInput.setCustomValidity(error);
      };
      const formatInternationalPhone = () => {
        const formatted = phoneWidget.getNumber('INTERNATIONAL');
        const country = phoneWidget.getSelectedCountry()?.iso2;
        if (country === 'br') return formatted.replace(/^(\+55)\s+(\d{2})\s+/, '$1 ($2) ');
        if (country === 'us' || country === 'ca') return formatted.replace(/^(\+1)\s+(\d{3})\s+/, '$1 ($2) ');
        return formatted;
      };
      const phoneUi = {
        'pt-BR': { selectedCountryAriaLabel: 'Alterar país do telefone; selecionado ${countryName} (${dialCode})', noCountrySelected: 'Selecionar o país do telefone', countryListAriaLabel: 'Lista de países', searchPlaceholder: 'Buscar', clearSearchAriaLabel: 'Limpar busca', closeCountrySelectorAriaLabel: 'Fechar', searchEmptyState: 'Nenhum resultado encontrado', searchSummaryAria: count => count === 0 ? 'Nenhum resultado encontrado' : count === 1 ? '1 resultado encontrado' : `${count} resultados encontrados` },
        en: { selectedCountryAriaLabel: 'Change phone country; currently ${countryName} (${dialCode})', noCountrySelected: 'Select phone country', countryListAriaLabel: 'Country list', searchPlaceholder: 'Search', clearSearchAriaLabel: 'Clear search', closeCountrySelectorAriaLabel: 'Close', searchEmptyState: 'No results found', searchSummaryAria: count => count === 0 ? 'No results found' : count === 1 ? '1 result found' : `${count} results found` },
        'zh-CN': { selectedCountryAriaLabel: '更改电话号码国家/地区；当前为${countryName}（${dialCode}）', noCountrySelected: '选择电话号码国家/地区', countryListAriaLabel: '国家和地区列表', searchPlaceholder: '搜索', clearSearchAriaLabel: '清除搜索', closeCountrySelectorAriaLabel: '关闭', searchEmptyState: '没有找到结果', searchSummaryAria: count => count === 0 ? '没有找到结果' : `找到${count}个结果` },
        de: { selectedCountryAriaLabel: 'Telefonland ändern; aktuell ${countryName} (${dialCode})', noCountrySelected: 'Telefonland auswählen', countryListAriaLabel: 'Länderliste', searchPlaceholder: 'Suchen', clearSearchAriaLabel: 'Suche löschen', closeCountrySelectorAriaLabel: 'Schließen', searchEmptyState: 'Keine Ergebnisse gefunden', searchSummaryAria: count => count === 0 ? 'Keine Ergebnisse gefunden' : count === 1 ? '1 Ergebnis gefunden' : `${count} Ergebnisse gefunden` },
        fr: { selectedCountryAriaLabel: 'Changer le pays du téléphone ; actuellement ${countryName} (${dialCode})', noCountrySelected: 'Sélectionner le pays du téléphone', countryListAriaLabel: 'Liste des pays', searchPlaceholder: 'Rechercher', clearSearchAriaLabel: 'Effacer la recherche', closeCountrySelectorAriaLabel: 'Fermer', searchEmptyState: 'Aucun résultat', searchSummaryAria: count => count === 0 ? 'Aucun résultat' : count === 1 ? '1 résultat' : `${count} résultats` },
        'es-419': { selectedCountryAriaLabel: 'Cambiar país del teléfono; actualmente ${countryName} (${dialCode})', noCountrySelected: 'Seleccionar país del teléfono', countryListAriaLabel: 'Lista de países', searchPlaceholder: 'Buscar', clearSearchAriaLabel: 'Borrar búsqueda', closeCountrySelectorAriaLabel: 'Cerrar', searchEmptyState: 'No se encontraron resultados', searchSummaryAria: count => count === 0 ? 'No se encontraron resultados' : count === 1 ? '1 resultado encontrado' : `${count} resultados encontrados` },
        ru: { selectedCountryAriaLabel: 'Изменить страну телефона; выбрана ${countryName} (${dialCode})', noCountrySelected: 'Выбрать страну телефона', countryListAriaLabel: 'Список стран', searchPlaceholder: 'Поиск', clearSearchAriaLabel: 'Очистить поиск', closeCountrySelectorAriaLabel: 'Закрыть', searchEmptyState: 'Ничего не найдено', searchSummaryAria: count => count === 0 ? 'Ничего не найдено' : count === 1 ? 'Найден 1 результат' : `Найдено результатов: ${count}` },
        ja: { selectedCountryAriaLabel: '電話番号の国を変更。現在は${countryName}（${dialCode}）', noCountrySelected: '電話番号の国を選択', countryListAriaLabel: '国の一覧', searchPlaceholder: '検索', clearSearchAriaLabel: '検索をクリア', closeCountrySelectorAriaLabel: '閉じる', searchEmptyState: '結果が見つかりません', searchSummaryAria: count => count === 0 ? '結果が見つかりません' : `${count}件の結果` },
      };
      const createPhoneWidget = (country = 'br', number = '') => {
        phoneWidget = window.intlTelInput(phoneInput, {
        initialCountry: country,
        countryNameLocale: document.documentElement.lang || 'pt-BR',
        uiTranslations: phoneUi[document.documentElement.lang] || phoneUi['pt-BR'],
        nationalMode: false,
        separateDialCode: false,
        formatAsYouType: true,
        placeholderNumberPolicy: 'AGGRESSIVE',
        countrySearch: true,
        loadUtils: () => import(new URL('assets/vendor/intl-tel-input/js/utils.js', document.baseURI).href),
      });
        phoneUtilsReady = false;
        if (number) phoneWidget.setNumber(number);
        phoneWidget.promise.then(() => {
          phoneUtilsReady = true;
          validatePhone();
        }).catch(() => {});
      };
      createPhoneWidget();
      phoneInput.addEventListener('input', validatePhone);
      phoneInput.addEventListener('countrychange', validatePhone);
      phoneInput.addEventListener('blur', () => {
        validatePhone();
        if (phoneUtilsReady && phoneWidget.isValidNumber()) {
          phoneInput.value = formatInternationalPhone();
        }
      });
      form.addEventListener('submit', validatePhone);
      document.addEventListener('esperanca:languagechange', () => {
        const country = phoneWidget.getSelectedCountry()?.iso2 || 'br';
        const value = phoneInput.value;
        phoneWidget.destroy();
        createPhoneWidget(country, value);
      });
    }
    const subject = new URLSearchParams(window.location.search).get('assunto');
    const select = form.querySelector('#assunto');
    if ([...select.options].some(option => option.value === subject)) select.value = subject;
    if (window.location.hash === '#voluntario' && !subject) select.value = 'voluntariado';
    let draft = '';
    const makeDraft = () => {
      const value = id => form.querySelector(`#${id}`).value.trim();
      const t = phrase => window.esperancaI18n?.t(phrase) || phrase;
      const phone = phoneWidget && phoneInput.value.trim() && phoneUtilsReady && phoneWidget.isValidNumber()
        ? formatInternationalPhone()
        : value('telefone') || t('Não informado');
      return `${t('Instituto Esperança')} — ${t('Rascunho de contato')}\n${t('Demonstração acadêmica: mensagem não enviada.')}\n\n${t('Nome')}: ${value('nome')}\n${t('E-mail')}: ${value('email')}\n${t('Telefone')}: ${phone || t('Não informado')}\n${t('Assunto')}: ${select.selectedOptions[0].textContent}\n\n${value('mensagem')}`;
    };
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      draft = makeDraft();
      document.querySelector('#message-preview').textContent = draft;
      const result = document.querySelector('#form-result');
      result.hidden = false;
      document.querySelector('#draft-status').textContent = '';
      result.focus();
    });
    form.addEventListener('input', () => {
      document.querySelector('#form-result').hidden = true;
      draft = '';
    });
    document.addEventListener('esperanca:languagechange', () => {
      if (!draft) return;
      draft = makeDraft();
      document.querySelector('#message-preview').textContent = draft;
      const draftStatus = document.querySelector('#draft-status');
      if (draftStatus.textContent) draftStatus.textContent = window.esperancaI18n?.t('Download solicitado. Sua mensagem não foi enviada ao Instituto.') || draftStatus.textContent;
    });
    document.querySelector('#download-message').addEventListener('click', () => {
      if (!draft) return;
      const url = URL.createObjectURL(new Blob(['\uFEFF', draft], { type: 'text/plain;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'mensagem-instituto-esperanca.txt';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      document.querySelector('#draft-status').textContent = window.esperancaI18n?.t('Download solicitado. Sua mensagem não foi enviada ao Instituto.') || 'Download solicitado. Sua mensagem não foi enviada ao Instituto.';
    });
  }
})();
