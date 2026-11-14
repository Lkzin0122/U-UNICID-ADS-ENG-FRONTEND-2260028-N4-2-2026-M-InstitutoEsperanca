/* Pequenas melhorias progressivas: o conteúdo e os links são HTML estático. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  document.querySelectorAll('[data-js-only]').forEach((el) => {
    el.hidden = false;
    el.disabled = false;
  });

  const heartAnimations = new WeakMap();
  const reducedHeartMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-heart-pop]').forEach((button) =>
    button.addEventListener('click', () => {
      let state = heartAnimations.get(button);
      if (!state) {
        state = { pulse: null, particles: new Set() };
        heartAnimations.set(button, state);
      }
      state.pulse?.cancel();
      const glyph = button.querySelector('.heart-pop-glyph');
      glyph.textContent = '♥';
      const blink = glyph.animate(
        reducedHeartMotion.matches
          ? [{ opacity: 1 }, { opacity: 0.7 }, { opacity: 1 }]
          : [
              { opacity: 1, transform: 'scale(1)' },
              { opacity: 0.8, transform: 'scale(.9)', offset: 0.15 },
              { opacity: 1, transform: 'scale(1.35)', offset: 0.35 },
              { opacity: 1, transform: 'scale(1)' },
            ],
        { duration: 500, easing: 'ease-out' },
      );
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
      const edge = (24 * parseFloat(getComputedStyle(root).fontSize)) / 16;
      for (let i = 0; i < 3; i++) {
        // Keep repeated likes alive together, with a small cap for very rapid taps.
        if (state.particles.size >= 36) state.particles.values().next().value();
        const particle = document.createElement('span');
        particle.className = 'heart-pop-particle';
        particle.textContent = '♥';
        particle.setAttribute('aria-hidden', 'true');
        particle.setAttribute('data-no-translate', '');
        particle.style.fontSize = `${0.75 + Math.random() * 0.5}rem`;
        button.append(particle);
        const drift = Math.max(
          edge - center,
          Math.min(
            document.documentElement.clientWidth - edge - center,
            (i - 1) * 24 + (Math.random() - 0.5) * 22,
          ),
        );
        const rise = 64 + Math.random() * 48;
        const turn = (Math.random() - 0.5) * 42;
        const flight = particle.animate(
          [
            { opacity: 0, transform: 'translate(-50%,-50%) scale(.4)' },
            {
              opacity: 1,
              transform: `translate(calc(-50% + ${drift * 0.2}px),calc(-50% - 15px)) scale(1.05)`,
              offset: 0.2,
            },
            {
              opacity: 0.9,
              transform: `translate(calc(-50% + ${drift * 0.65}px),calc(-50% - ${rise * 0.65}px)) rotate(${turn * 0.5}deg) scale(1)`,
              offset: 0.65,
            },
            {
              opacity: 0,
              transform: `translate(calc(-50% + ${drift}px),calc(-50% - ${rise}px)) rotate(${turn}deg) scale(.75)`,
            },
          ],
          { duration: 500 - i * 25, delay: i * 25, easing: 'ease-out', fill: 'both' },
        );
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
    }),
  );

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('#main-nav');
  const groups = [...document.querySelectorAll('.nav-group')];
  const desktopQuery = window.matchMedia('(min-width: 1100px)');
  const updateMenuPosition = () => {
    const header = menuButton?.closest('.site-header');
    if (header)
      header.style.setProperty(
        '--nav-top',
        `${Math.max(0, header.getBoundingClientRect().bottom)}px`,
      );
  };
  const closeMenu = () => {
    root.classList.remove('navigation-open');
    nav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    groups.forEach((group) => {
      group.open = false;
    });
  };
  menuButton?.addEventListener('click', () => {
    if (!nav) return;
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    if (!open) {
      closeMenu();
      return;
    }
    updateMenuPosition();
    nav.scrollTop = 0;
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    root.classList.toggle('navigation-open', open);
  });
  nav?.addEventListener('click', (event) => {
    if (!desktopQuery.matches && event.target.closest('a[href]')) closeMenu();
  });
  menuButton?.closest('.navbar')?.addEventListener('focusout', (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
  });
  window.addEventListener(
    'scroll',
    () => {
      if (nav?.classList.contains('is-open')) updateMenuPosition();
    },
    { passive: true },
  );
  window.addEventListener('resize', updateMenuPosition, { passive: true });
  if (window.ResizeObserver && menuButton)
    new ResizeObserver(updateMenuPosition).observe(menuButton.closest('.site-header'));
  groups.forEach((group) =>
    group.addEventListener('toggle', () => {
      if (group.open)
        groups.forEach((other) => {
          if (other !== group) other.open = false;
        });
    }),
  );
  document.addEventListener('click', (event) => {
    groups.forEach((group) => {
      if (!group.contains(event.target)) group.open = false;
    });
    if (!event.target.closest('.navbar')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openGroup = groups.find((group) => group.open);
    if (openGroup) {
      openGroup.open = false;
      openGroup.querySelector('summary').focus();
    } else if (nav?.classList.contains('is-open')) {
      closeMenu();
      menuButton?.focus();
    }
  });
  desktopQuery.addEventListener?.('change', closeMenu);

  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const buttons = [...group.querySelectorAll('[data-filter]')];
    const items = [...group.querySelectorAll('[data-filter-item]')];
    let visibleCount = items.filter((item) => !item.hidden).length;
    const updateFilterStatus = () => {
      const status = group.querySelector('[data-filter-status]');
      if (!status) return;
      status.textContent =
        visibleCount === 1
          ? window.esperancaI18n?.t('1 conteúdo encontrado.') || '1 conteúdo encontrado.'
          : window.esperancaI18n
              ?.t('{count} conteúdos encontrados.')
              .replace('{count}', visibleCount) || `${visibleCount} conteúdos encontrados.`;
    };
    document.addEventListener('esperanca:languagechange', updateFilterStatus);
    buttons.forEach((button) =>
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
        items.forEach((item) => {
          const show =
            ['all', 'todos'].includes(filter) || item.dataset.category?.split(' ').includes(filter);
          item.hidden = !show;
        });
        visibleCount = items.filter((item) => !item.hidden).length;
        updateFilterStatus();
      }),
    );
  });

  const dialog = document.querySelector('#image-dialog');
  const dialogImage = document.querySelector('#dialog-image');
  const dialogCaption = document.querySelector('#dialog-caption');
  document.querySelectorAll('[data-lightbox]').forEach((button) =>
    button.addEventListener('click', () => {
      if (!dialog || !dialogImage || !dialogCaption) return;
      const image = button.querySelector('img') || button.closest('figure')?.querySelector('img');
      dialogImage.src = button.dataset.lightbox || image?.src;
      dialogImage.alt = image?.alt || button.dataset.caption || '';
      dialogCaption.textContent =
        button.dataset.caption ||
        button.closest('figure')?.querySelector('figcaption')?.textContent ||
        '';
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else window.open(dialogImage.src, '_blank', 'noopener');
    }),
  );
  dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
