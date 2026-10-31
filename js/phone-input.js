/* International telephone input. All numbering rules come from libphonenumber-js/max. */
(() => {
  'use strict';
  const t = text => window.esperancaI18n?.t(text) || text;
  const numberTypes = new Set(['FIXED_LINE', 'MOBILE', 'FIXED_LINE_OR_MOBILE']);
  const digit = /\p{Nd}/u;
  const normalise = value => value.normalize('NFKC').replace(/[\u2010-\u2015\u2212]/g, '-').replace(/[\u200e\u200f\u061c]/g, '').replace(/\p{Nd}/gu, character => {
    let start = character.codePointAt(0);
    const point = start;
    while (digit.test(String.fromCodePoint(start - 1))) start--;
    return String((point - start) % 10);
  });
  const digits = value => value.replace(/\D/g, '');

  window.esperancaPhoneInput = {
    create(input, uiTranslations) {
      const lib = window.libphonenumber;
      const data = window.esperancaPhoneData?.countries;
      const error = document.querySelector('#phone-error');
      let widget = null;
      let updating = false;
      let composing = false;
      let showErrors = false;
      let previous = { value: '', country: 'br', start: 0, end: 0 };
      let rejection = '';
      const ready = Boolean(lib && data && typeof window.intlTelInput === 'function');
      const selectable = new Set(ready ? window.intlTelInput.getAllCountries().map(item => item.iso2.toUpperCase()) : []);
      const country = () => (widget?.getSelectedCountry()?.iso2 || previous.country).toUpperCase();
      const showError = message => {
        if (!error) return;
        error.textContent = t(message);
        error.hidden = !message;
      };
      const inspect = raw => {
        if (raw.length > 250) return { syntax: true, tooLong: true, valid: false };
        const text = normalise(raw).trim();
        const formatter = new lib.AsYouType(country());
        formatter.input(text);
        const number = formatter.getNumber();
        const international = text.startsWith('+');
        const resolved = formatter.getCountry();
        const region = resolved || country();
        const rules = data[region];
        let national = formatter.getNationalNumber();
        if (!international && national.length > digits(text).length) national = digits(text);
        const significantLength = international ? digits(text).length - (number?.countryCallingCode.length || 0) : national.length;
        const tooLong = !rules || Math.max(national.length, significantLength) > Math.max(...rules.lengths);
        const parsed = lib.parsePhoneNumberFromString(text, { defaultCountry: region, extract: false });
        const syntax = /^[+\d\s()./\-]*$/.test(text) && (text.match(/\+/g)?.length || 0) <= 1 && (!text.includes('+') || international);
        const exactInternational = !international || !parsed || '+' + digits(text) === parsed.number;
        // Some plans let parsers expand local subscriber numbers with an inferred area code.
        // A contact number must include every significant digit supplied by the visitor.
        const suppliedDigits = digits(text).length - (international ? parsed?.countryCallingCode.length || 0 : 0);
        const complete = parsed && parsed.nationalNumber.length <= suppliedDigits;
        const valid = syntax && complete && exactInternational && !tooLong && parsed?.isPossible() && parsed.isValid() && !parsed.ext
          && numberTypes.has(parsed.getType()) && data[parsed.country || region]?.callingCode === rules?.callingCode;
        return { text, formatter, number, parsed, international, region, rules, national, tooLong, syntax, valid: Boolean(valid) };
      };
      const messageFor = state => {
        if (!state.syntax) return 'Use apenas números e os separadores de um telefone, sem letras ou ramal.';
        if (state.tooLong) return 'Este número tem mais dígitos do que o permitido para o país selecionado.';
        const reason = lib.validatePhoneNumberLength(state.text, { defaultCountry: state.region, extract: false });
        if (reason === 'TOO_SHORT') return 'O telefone está incompleto. Inclua o código de área, quando houver.';
        if (reason === 'TOO_LONG') return 'Este número tem mais dígitos do que o permitido para o país selecionado.';
        return 'Confira o país, o código de área e o número de telefone.';
      };
      const validate = (reveal = false) => {
        if (reveal) showErrors = true;
        let message = '';
        if (input.value.trim()) {
          message = !ready ? 'Não foi possível carregar a validação do telefone. Tente novamente ou deixe este campo opcional em branco.'
            : (() => { const state = inspect(input.value); return state.valid ? '' : messageFor(state); })();
        }
        input.setCustomValidity(t(message));
        input.setAttribute('aria-invalid', String(Boolean(message)));
        showError(rejection || (showErrors ? message : ''));
        return !message;
      };
      const snapshot = () => {
        previous = { value: input.value, country: country().toLowerCase(), start: input.selectionStart, end: input.selectionEnd };
      };
      const reject = message => {
        rejection = message;
        showError(message);
      };
      const addsPastLimit = (raw, state) => {
        if (!previous.value || previous.start !== previous.end) return false;
        const before = inspect(previous.value);
        return before.region === state.region && before.national.length >= Math.max(...before.rules.lengths)
          && digits(normalise(raw)).length > digits(normalise(previous.value)).length;
      };
      const updatePlaceholder = () => {
        const rules = data[country()];
        const example = rules?.example && lib.parsePhoneNumberFromString('+' + rules.callingCode + rules.example);
        input.placeholder = example?.formatNational() || '';
        input.dataset.phoneMaxDigits = String(Math.max(...rules.lengths));
      };
      const apply = (raw, caret = raw.length, notify = false) => {
        if (updating || composing) return;
        if (!ready) { validate(true); return; }
        const state = inspect(raw);
        if (!state.syntax || state.tooLong || addsPastLimit(raw, state) || raw.length > 250) {
          updating = true;
          widget.setSelectedCountry(previous.country);
          input.value = previous.value;
          input.setSelectionRange(previous.start, previous.end);
          updating = false;
          updatePlaceholder();
          reject(state.syntax ? 'Este número tem mais dígitos do que o permitido para o país selecionado.' : 'Use apenas números e os separadores de um telefone, sem letras ou ramal.');
          validate();
          return;
        }
        updating = true;
        if (selectable.has(state.region) && state.region.toLowerCase() !== widget.getSelectedCountry()?.iso2) widget.setSelectedCountry(state.region.toLowerCase());
        let formatted;
        if (!state.text) formatted = '';
        else if (state.valid) formatted = state.parsed.formatNational();
        else if (state.international && state.number) formatted = new lib.AsYouType(state.region).input(state.national);
        else formatted = state.formatter.input('');
        const before = digits(normalise(raw.slice(0, caret))).length;
        const change = digits(formatted).length - digits(normalise(raw)).length;
        const target = Math.max(0, before + (state.international ? change : 0));
        let position = 0;
        if (caret === raw.length) position = formatted.length;
        else while (position < formatted.length && digits(formatted.slice(0, position)).length < target) position++;
        input.value = formatted;
        input.setSelectionRange(position, position);
        rejection = '';
        updatePlaceholder();
        validate();
        snapshot();
        if (notify) input.dispatchEvent(new Event('input', { bubbles: true }));
        updating = false;
      };
      const insert = text => {
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? start;
        apply(input.value.slice(0, start) + text + input.value.slice(end), start + text.length, true);
      };
      const createWidget = translations => {
        widget = window.intlTelInput(input, {
          initialCountry: previous.country,
          onlyCountries: Object.keys(data).filter(code => selectable.has(code)).map(code => code.toLowerCase()),
          countryNameLocale: document.documentElement.lang || 'pt-BR',
          uiTranslations: translations,
          separateDialCode: true,
          numberDisplayFormat: 'NATIONAL',
          formatAsYouType: false,
          strictMode: false, // The controller enforces metadata limits for keyboard, paste, mobile input and autofill alike.
          placeholderNumberPolicy: 'OFF',
        });
        updatePlaceholder();
      };
      if (ready) createWidget(uiTranslations);
      input.addEventListener('beforeinput', event => {
        if (updating || composing || event.isComposing) return;
        snapshot();
        if (!ready && event.inputType.startsWith('insert')) {
          event.preventDefault();
          reject('Não foi possível carregar a validação do telefone. Tente novamente ou deixe este campo opcional em branco.');
          return;
        }
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? start;
        if (event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward') {
          const backward = event.inputType === 'deleteContentBackward';
          let index = backward ? start - 1 : start;
          if (start === end && index >= 0 && index < input.value.length && !/\d/.test(input.value[index])) {
            while (index >= 0 && index < input.value.length && !/\d/.test(input.value[index])) index += backward ? -1 : 1;
            if (index >= 0 && index < input.value.length) {
              event.preventDefault();
              const from = backward ? index : start;
              const to = backward ? start : index + 1;
              apply(input.value.slice(0, from) + input.value.slice(to), from, true);
            }
          }
        } else if (event.inputType.startsWith('insert') && event.data !== null) {
          const candidate = input.value.slice(0, start) + event.data + input.value.slice(end);
          const state = inspect(candidate);
          if (!state.syntax || state.tooLong || addsPastLimit(candidate, state)) {
            event.preventDefault();
            reject(state.syntax ? 'Este número tem mais dígitos do que o permitido para o país selecionado.' : 'Use apenas números e os separadores de um telefone, sem letras ou ramal.');
          }
        }
      });
      input.addEventListener('paste', event => {
        if (!event.clipboardData) return;
        event.preventDefault();
        snapshot();
        insert(event.clipboardData.getData('text'));
      });
      input.addEventListener('drop', event => {
        if (!event.dataTransfer) return;
        event.preventDefault();
        snapshot();
        insert(event.dataTransfer.getData('text'));
      });
      input.addEventListener('input', () => apply(input.value, input.selectionStart ?? input.value.length), true);
      input.addEventListener('change', () => { apply(input.value); validate(true); });
      input.addEventListener('blur', () => validate(true));
      input.addEventListener('compositionstart', () => { snapshot(); composing = true; });
      input.addEventListener('compositionend', () => { composing = false; apply(input.value); });
      input.addEventListener('countrychange', () => {
        if (updating || !ready) return;
        // Keep existing digits on a country change; flag incompatibility rather than silently deleting digits.
        rejection = '';
        updatePlaceholder();
        if (!inspect(input.value).tooLong) apply(input.value, input.selectionStart ?? input.value.length);
        validate(true);
        snapshot();
      });
      const controller = {
        validate,
        getNumber(format = 'E164') {
          if (!input.value.trim() || !ready) return '';
          const state = inspect(input.value);
          if (!state.valid) return '';
          return format === 'INTERNATIONAL' ? state.parsed.formatInternational() : state.parsed.number;
        },
        setLocale(translations) {
          if (!ready) { validate(); return; }
          snapshot();
          updating = true;
          widget.destroy();
          createWidget(translations);
          input.value = previous.value;
          updating = false;
          validate();
        },
        reset() {
          input.value = '';
          rejection = '';
          showErrors = false;
          validate();
          snapshot();
        },
      };
      input.phoneController = controller;
      input.form?.addEventListener('reset', () => queueMicrotask(() => controller.reset()));
      validate();
      snapshot();
      return controller;
    },
  };
})();
