/* Same-origin presentation: use the site's palette, without double inversion. */
(() => {
  'use strict';
  const root = document.documentElement;
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  let preferences = {};
  const apply = next => {
    preferences = next && typeof next === 'object' ? next : {};
    root.classList.toggle('theme-dark', preferences.theme === 'dark' || (!['light', 'dark'].includes(preferences.theme) && systemTheme.matches));
    root.classList.toggle('high-contrast', preferences.contrast === true);
    // Embedded content is already inverted by the parent's filter.
    root.classList.toggle('inverted-colors', preferences.invert === true && parent === window);
    const legacy = { 'red-green':'deuteranopia', 'blue-yellow':'tritanopia', monochrome:'achromatopsia' };
    const vision = legacy[preferences.colorVision] || preferences.colorVision;
    root.dataset.colorVision = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'].includes(vision) ? vision : 'off';
  };
  addEventListener('message', event => {
    if (event.origin === location.origin && event.source === parent && event.data?.type === 'esperanca:visual') apply(event.data.preferences);
  });
  systemTheme.addEventListener('change', () => apply(preferences));
  try { apply(JSON.parse(localStorage.getItem('esperanca-visual-preferences'))); }
  catch { apply({}); }
})();
