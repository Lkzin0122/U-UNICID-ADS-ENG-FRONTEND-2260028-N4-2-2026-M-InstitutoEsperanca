/* Preferências visuais compartilhadas com o chatbot e a apresentação. */
(() => {
  'use strict';
  const root = document.documentElement;
  const preferenceKey = 'esperanca-visual-preferences';
  const defaultPreferences = {
    scale: 1,
    contrast: false,
    invert: false,
    theme: 'system',
    colorVision: 'off',
  };
  const colorVisionOptions = ['off', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
  const legacyColorVision = {
    'red-green': 'deuteranopia',
    'blue-yellow': 'tritanopia',
    monochrome: 'achromatopsia',
  };
  let preferences = { ...defaultPreferences };
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceKey));
    if (saved && typeof saved === 'object') {
      preferences.scale = Math.max(0.9, Math.min(2, Number(saved.scale) || 1));
      preferences.contrast = saved.contrast === true;
      preferences.invert = saved.invert === true;
      preferences.theme = ['system', 'light', 'dark'].includes(saved.theme)
        ? saved.theme
        : 'system';
      const colorVision = legacyColorVision[saved.colorVision] || saved.colorVision;
      preferences.colorVision = colorVisionOptions.includes(colorVision) ? colorVision : 'off';
    }
  } catch {
    /* As preferências continuam disponíveis sem armazenamento. */
  }
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const updatePreferences = (save = false) => {
    root.style.setProperty('--font-scale', preferences.scale);
    root.classList.toggle('high-contrast', preferences.contrast);
    root.classList.toggle('inverted-colors', preferences.invert);
    root.classList.toggle(
      'theme-dark',
      preferences.theme === 'dark' || (preferences.theme === 'system' && systemTheme.matches),
    );
    root.dataset.colorVision = preferences.colorVision;
    document.querySelectorAll('[data-theme-preference]').forEach((select) => {
      select.value = preferences.theme;
    });
    document.querySelectorAll('select[data-color-vision]').forEach((select) => {
      select.value = preferences.colorVision;
    });
    document
      .querySelectorAll('[data-contrast-toggle]')
      .forEach((button) => button.setAttribute('aria-pressed', String(preferences.contrast)));
    document
      .querySelectorAll('[data-invert-toggle]')
      .forEach((button) => button.setAttribute('aria-pressed', String(preferences.invert)));
    document.querySelectorAll('[data-font-status]').forEach((el) => {
      el.textContent =
        window.esperancaI18n
          ?.t('Tamanho do texto: {percent}%.')
          .replace('{percent}', Math.round(preferences.scale * 100)) ||
        `Tamanho do texto: ${Math.round(preferences.scale * 100)}%.`;
    });
    document.querySelectorAll('[data-font-size="decrease"]').forEach((el) => {
      el.disabled = preferences.scale <= 0.9;
    });
    document.querySelectorAll('[data-font-size="increase"]').forEach((el) => {
      el.disabled = preferences.scale >= 2;
    });
    if (save) {
      try {
        localStorage.setItem(preferenceKey, JSON.stringify(preferences));
      } catch {
        /* Sem persistência neste navegador. */
      }
    }
    document.querySelectorAll('iframe').forEach((frame) => {
      try {
        if (new URL(frame.src, document.baseURI).origin !== location.origin) return;
        const notify = () =>
          frame.contentWindow?.postMessage(
            { type: 'esperanca:visual', preferences },
            location.origin,
          );
        if (!frame.dataset.visualSyncBound) {
          frame.addEventListener('load', () =>
            frame.contentWindow?.postMessage(
              { type: 'esperanca:visual', preferences },
              location.origin,
            ),
          );
          frame.dataset.visualSyncBound = 'true';
        }
        notify();
      } catch {
        /* Uma mídia externa mantém seus próprios controles. */
      }
    });
  };
  updatePreferences();
  window.esperancaVisual = Object.freeze({
    get preferences() {
      return { ...preferences };
    },
    set(patch) {
      if (['system', 'light', 'dark'].includes(patch.theme)) preferences.theme = patch.theme;
      if (typeof patch.contrast === 'boolean') preferences.contrast = patch.contrast;
      if (typeof patch.invert === 'boolean') preferences.invert = patch.invert;
      if (colorVisionOptions.includes(patch.colorVision))
        preferences.colorVision = patch.colorVision;
      if (Number.isFinite(patch.scale))
        preferences.scale = Math.max(0.9, Math.min(2, Math.round(patch.scale * 10) / 10));
      updatePreferences(true);
    },
  });
  document.addEventListener('esperanca:languagechange', () => updatePreferences());
  document.querySelectorAll('[data-font-size]').forEach((button) =>
    button.addEventListener('click', () => {
      const action = button.dataset.fontSize;
      preferences.scale =
        action === 'reset'
          ? 1
          : Math.max(
              0.9,
              Math.min(
                2,
                Math.round((preferences.scale + (action === 'increase' ? 0.1 : -0.1)) * 10) / 10,
              ),
            );
      updatePreferences(true);
    }),
  );
  document.querySelectorAll('[data-contrast-toggle]').forEach((button) =>
    button.addEventListener('click', () => {
      preferences.contrast = !preferences.contrast;
      updatePreferences(true);
    }),
  );
  document.querySelectorAll('[data-invert-toggle]').forEach((button) =>
    button.addEventListener('click', () => {
      preferences.invert = !preferences.invert;
      updatePreferences(true);
    }),
  );
  document.querySelectorAll('[data-theme-preference]').forEach((select) =>
    select.addEventListener('change', () => {
      preferences.theme = ['system', 'light', 'dark'].includes(select.value)
        ? select.value
        : 'system';
      updatePreferences(true);
    }),
  );
  document.querySelectorAll('select[data-color-vision]').forEach((select) =>
    select.addEventListener('change', () => {
      preferences.colorVision = colorVisionOptions.includes(select.value) ? select.value : 'off';
      updatePreferences(true);
    }),
  );
  document.querySelectorAll('[data-visual-reset]').forEach((button) =>
    button.addEventListener('click', () => {
      preferences = { ...defaultPreferences };
      updatePreferences(true);
    }),
  );
  systemTheme.addEventListener?.('change', () => {
    if (preferences.theme === 'system') updatePreferences();
  });
})();
