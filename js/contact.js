/* Formulário de contato: validação, rascunho e serviço compartilhado de e-mail. */
(() => {
  'use strict';
  const form = document.querySelector('#contact-form');
  if (form) {
    const phoneInput = form.querySelector('#telefone');
    const phoneUi = {
      hi: {
        selectedCountryAriaLabel: 'फ़ोन का देश बदलें; अभी ${countryName} (${dialCode}) चुना गया है',
        noCountrySelected: 'फ़ोन का देश चुनें',
        countryListAriaLabel: 'देशों की सूची',
        searchPlaceholder: 'खोजें',
        clearSearchAriaLabel: 'खोज मिटाएँ',
        closeCountrySelectorAriaLabel: 'बंद करें',
        searchEmptyState: 'कोई परिणाम नहीं मिला',
        searchSummaryAria: (count) =>
          count === 0
            ? 'कोई परिणाम नहीं मिला'
            : count === 1
              ? '1 परिणाम मिला'
              : `${count} परिणाम मिले`,
      },
      'pt-BR': {
        selectedCountryAriaLabel:
          'Alterar país do telefone; selecionado ${countryName} (${dialCode})',
        noCountrySelected: 'Selecionar o país do telefone',
        countryListAriaLabel: 'Lista de países',
        searchPlaceholder: 'Buscar',
        clearSearchAriaLabel: 'Limpar busca',
        closeCountrySelectorAriaLabel: 'Fechar',
        searchEmptyState: 'Nenhum resultado encontrado',
        searchSummaryAria: (count) =>
          count === 0
            ? 'Nenhum resultado encontrado'
            : count === 1
              ? '1 resultado encontrado'
              : `${count} resultados encontrados`,
      },
      en: {
        selectedCountryAriaLabel: 'Change phone country; currently ${countryName} (${dialCode})',
        noCountrySelected: 'Select phone country',
        countryListAriaLabel: 'Country list',
        searchPlaceholder: 'Search',
        clearSearchAriaLabel: 'Clear search',
        closeCountrySelectorAriaLabel: 'Close',
        searchEmptyState: 'No results found',
        searchSummaryAria: (count) =>
          count === 0
            ? 'No results found'
            : count === 1
              ? '1 result found'
              : `${count} results found`,
      },
      'zh-CN': {
        selectedCountryAriaLabel: '更改电话号码国家/地区；当前为${countryName}（${dialCode}）',
        noCountrySelected: '选择电话号码国家/地区',
        countryListAriaLabel: '国家和地区列表',
        searchPlaceholder: '搜索',
        clearSearchAriaLabel: '清除搜索',
        closeCountrySelectorAriaLabel: '关闭',
        searchEmptyState: '没有找到结果',
        searchSummaryAria: (count) => (count === 0 ? '没有找到结果' : `找到${count}个结果`),
      },
      de: {
        selectedCountryAriaLabel: 'Telefonland ändern; aktuell ${countryName} (${dialCode})',
        noCountrySelected: 'Telefonland auswählen',
        countryListAriaLabel: 'Länderliste',
        searchPlaceholder: 'Suchen',
        clearSearchAriaLabel: 'Suche löschen',
        closeCountrySelectorAriaLabel: 'Schließen',
        searchEmptyState: 'Keine Ergebnisse gefunden',
        searchSummaryAria: (count) =>
          count === 0
            ? 'Keine Ergebnisse gefunden'
            : count === 1
              ? '1 Ergebnis gefunden'
              : `${count} Ergebnisse gefunden`,
      },
      fr: {
        selectedCountryAriaLabel:
          'Changer le pays du téléphone ; actuellement ${countryName} (${dialCode})',
        noCountrySelected: 'Sélectionner le pays du téléphone',
        countryListAriaLabel: 'Liste des pays',
        searchPlaceholder: 'Rechercher',
        clearSearchAriaLabel: 'Effacer la recherche',
        closeCountrySelectorAriaLabel: 'Fermer',
        searchEmptyState: 'Aucun résultat',
        searchSummaryAria: (count) =>
          count === 0 ? 'Aucun résultat' : count === 1 ? '1 résultat' : `${count} résultats`,
      },
      'es-419': {
        selectedCountryAriaLabel:
          'Cambiar país del teléfono; actualmente ${countryName} (${dialCode})',
        noCountrySelected: 'Seleccionar país del teléfono',
        countryListAriaLabel: 'Lista de países',
        searchPlaceholder: 'Buscar',
        clearSearchAriaLabel: 'Borrar búsqueda',
        closeCountrySelectorAriaLabel: 'Cerrar',
        searchEmptyState: 'No se encontraron resultados',
        searchSummaryAria: (count) =>
          count === 0
            ? 'No se encontraron resultados'
            : count === 1
              ? '1 resultado encontrado'
              : `${count} resultados encontrados`,
      },
      ru: {
        selectedCountryAriaLabel: 'Изменить страну телефона; выбрана ${countryName} (${dialCode})',
        noCountrySelected: 'Выбрать страну телефона',
        countryListAriaLabel: 'Список стран',
        searchPlaceholder: 'Поиск',
        clearSearchAriaLabel: 'Очистить поиск',
        closeCountrySelectorAriaLabel: 'Закрыть',
        searchEmptyState: 'Ничего не найдено',
        searchSummaryAria: (count) =>
          count === 0
            ? 'Ничего не найдено'
            : count === 1
              ? 'Найден 1 результат'
              : `Найдено результатов: ${count}`,
      },
      ja: {
        selectedCountryAriaLabel: '電話番号の国を変更。現在は${countryName}（${dialCode}）',
        noCountrySelected: '電話番号の国を選択',
        countryListAriaLabel: '国の一覧',
        searchPlaceholder: '検索',
        clearSearchAriaLabel: '検索をクリア',
        closeCountrySelectorAriaLabel: '閉じる',
        searchEmptyState: '結果が見つかりません',
        searchSummaryAria: (count) => (count === 0 ? '結果が見つかりません' : `${count}件の結果`),
      },
    };
    const phoneController = window.esperancaPhoneInput?.create(
      phoneInput,
      phoneUi[document.documentElement.lang] || phoneUi['pt-BR'],
    );
    const validatePhone = () => {
      if (phoneController) return phoneController.validate(true);
      const message = phoneInput.value.trim()
        ? 'Não foi possível carregar a validação do telefone. Tente novamente ou deixe este campo opcional em branco.'
        : '';
      phoneInput.setCustomValidity(window.esperancaI18n?.t(message) || message);
      return !message;
    };
    form.addEventListener('submit', validatePhone);
    if (!phoneController) phoneInput.addEventListener('input', validatePhone);
    document.addEventListener('esperanca:languagechange', () =>
      phoneController?.setLocale(phoneUi[document.documentElement.lang] || phoneUi['pt-BR']),
    );
    const draftKey = 'esperanca-contact-draft';
    const draftFields = ['nome', 'email', 'telefone', 'assunto', 'mensagem'];
    const draftStores = ['sessionStorage', 'localStorage'];
    let draft = null;
    for (const store of draftStores) {
      try {
        const saved = JSON.parse(window[store].getItem(draftKey));
        if (
          saved &&
          typeof saved === 'object' &&
          !Array.isArray(saved) &&
          draftFields.some((id) => typeof saved[id] === 'string')
        ) {
          draft = saved;
          break;
        }
      } catch {
        /* Tente o outro armazenamento se este estiver indisponível ou corrompido. */
      }
    }
    if (draft) {
      const widget = window.intlTelInput?.getInstance(phoneInput);
      if (
        typeof draft.country === 'string' &&
        window.esperancaPhoneData?.countries[draft.country.toUpperCase()]
      ) {
        widget?.setSelectedCountry(draft.country.toLowerCase());
      }
      for (const id of draftFields) {
        if (typeof draft[id] !== 'string') continue;
        const field = form.querySelector(`#${id}`);
        if (
          field.tagName === 'SELECT' &&
          ![...field.options].some((option) => option.value === draft[id])
        )
          continue;
        field.value = draft[id].slice(0, field.maxLength > 0 ? field.maxLength : 250);
      }
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const saveDraft = () => {
      const saved = Object.fromEntries(
        draftFields.map((id) => [id, form.querySelector(`#${id}`).value]),
      );
      saved.country =
        window.intlTelInput?.getInstance(phoneInput)?.getSelectedCountry()?.iso2 || 'br';
      const json = JSON.stringify(saved);
      for (const store of draftStores) {
        try {
          window[store].setItem(draftKey, json);
        } catch {
          /* O formulário funciona sem armazenamento. */
        }
      }
    };
    const clearDraft = () => {
      for (const store of draftStores) {
        try {
          window[store].removeItem(draftKey);
        } catch {
          /* Não interrompa o envio se o armazenamento estiver bloqueado. */
        }
      }
    };
    const subject = new URLSearchParams(window.location.search).get('assunto');
    const select = form.querySelector('#assunto');
    if ([...select.options].some((option) => option.value === subject)) select.value = subject;
    if (window.location.hash === '#voluntario' && !subject) select.value = 'voluntariado';
    if (draft) saveDraft();
    const fields = form.querySelector('#contact-fields');
    const submitLabel = form.querySelector('#contact-submit-label');
    const result = form.querySelector('#form-result');
    const status = form.querySelector('#form-status');
    const fallback = form.querySelector('#contact-fallback');
    const contactAddress = fallback.getAttribute('href').slice('mailto:'.length);
    const t = (phrase) => window.esperancaI18n?.t(phrase) || phrase;
    const emailInput = form.querySelector('#email');
    const validateEmail = () => {
      emailInput.setCustomValidity(
        emailInput.value && !window.esperancaContact.validEmail(emailInput.value.trim())
          ? t('Informe um e-mail válido.')
          : '',
      );
      return emailInput.checkValidity();
    };
    emailInput.addEventListener('input', validateEmail);
    emailInput.addEventListener('blur', validateEmail);
    const localizedValidation = new Map();
    form.addEventListener(
      'invalid',
      (event) => {
        const field = event.target;
        if (
          window.esperancaI18n?.language !== 'hi' ||
          !['nome', 'email', 'assunto', 'mensagem'].includes(field.id)
        )
          return;
        if (field.validity.customError && !localizedValidation.has(field)) return;
        field.setCustomValidity('');
        const missing = {
          nome: 'Informe seu nome.',
          email: 'Informe seu e-mail.',
          assunto: 'Selecione um assunto.',
          mensagem: 'Escreva sua mensagem.',
        };
        const phrase = field.validity.valueMissing
          ? missing[field.id]
          : field.validity.typeMismatch || (field.id === 'email' && field.validity.patternMismatch)
            ? 'Informe um e-mail válido.'
            : field.validity.tooShort
              ? 'Escreva uma mensagem com pelo menos 10 caracteres.'
              : field.validity.tooLong
                ? 'Respeite o limite de caracteres deste campo.'
                : '';
        if (phrase) {
          localizedValidation.set(field, phrase);
          field.setCustomValidity(t(phrase));
        }
      },
      true,
    );
    document.addEventListener('esperanca:languagechange', () => {
      localizedValidation.forEach((phrase, field) => field.setCustomValidity(t(phrase)));
      if (emailInput.validity.customError) validateEmail();
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
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending) return;
      saveDraft();
      const value = (id) => form.querySelector(`#${id}`).value.trim();
      form.querySelector('#nome').setCustomValidity(value('nome') ? '' : t('Informe seu nome.'));
      form
        .querySelector('#mensagem')
        .setCustomValidity(
          value('mensagem').length >= 10
            ? ''
            : t('Escreva uma mensagem com pelo menos 10 caracteres.'),
        );
      if (!validateEmail() || !validatePhone() || !form.reportValidity()) {
        form.reportValidity();
        return;
      }

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
      if (
        !config ||
        !['serviceId', 'templateId', 'publicKey'].every(
          (key) => typeof config[key] === 'string' && config[key].trim(),
        )
      ) {
        showStatus(
          'O envio pelo site está temporariamente indisponível. Use o e-mail do Instituto para entrar em contato.',
          'error',
        );
        return;
      }

      sending = true;
      fields.disabled = true;
      form.setAttribute('aria-busy', 'true');
      showStatus('Enviando sua mensagem. Aguarde…', 'sending');
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);
      try {
        const response = await window.esperancaContact.send(params, { signal: controller.signal });
        if (!response.ok) {
          // O corpo contém o motivo da recusa (serviço, template, domínio etc.).
          // Não registre o formulário ou a chave pública junto do diagnóstico.
          let detail = '';
          try {
            detail = (await response.text()).slice(0, 1000);
          } catch {
            /* Preserve o status mesmo se o corpo não carregar. */
          }
          [
            config.publicKey.trim(),
            params.from_name,
            params.reply_to,
            params.phone,
            params.message,
          ].forEach((value) => {
            if (value) detail = detail.split(value).join('[dado omitido]');
          });
          console.error('EmailJS: envio recusado.', { status: response.status, detail });
          const missingTemplate = response.status === 400 && /template id not found/i.test(detail);
          showStatus(
            missingTemplate
              ? 'O envio pelo site está temporariamente indisponível. Use o e-mail do Instituto para entrar em contato.'
              : response.status === 429
                ? 'Muitas tentativas de envio. Aguarde um minuto e tente novamente ou use o e-mail do Instituto.'
                : 'Não foi possível enviar sua mensagem. Tente novamente ou use o e-mail do Instituto.',
            'error',
          );
          return;
        }
        form.reset();
        phoneController?.reset();
        clearDraft();
        showStatus(
          'Mensagem enviada com sucesso! Obrigado por entrar em contato com o Instituto.',
          'success',
        );
      } catch (error) {
        showStatus(
          error.name === 'AbortError'
            ? 'Não foi possível confirmar o envio. Aguarde alguns instantes antes de tentar novamente ou entre em contato por e-mail.'
            : 'Não foi possível enviar sua mensagem. Confira sua conexão e tente novamente ou use o e-mail do Instituto.',
          'error',
        );
      } finally {
        window.clearTimeout(timeout);
        sending = false;
        fields.disabled = false;
        form.setAttribute('aria-busy', 'false');
        renderStatus();
        result.focus();
      }
    });
    form.addEventListener('input', (event) => {
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
