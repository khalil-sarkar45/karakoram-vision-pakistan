(() => {
  'use strict';
  const doc = document;
  const modal = () => doc.querySelector('[data-contact-modal]');

  const openContact = (trigger) => {
    const el = modal();
    if (!el) return;
    window.__bkContactOpener = trigger || doc.activeElement;
    el.hidden = false;
    el.removeAttribute('hidden');
    el.setAttribute('aria-hidden', 'false');
    doc.documentElement.classList.add('overflow-hidden');
    requestAnimationFrame(() => el.querySelector('[data-close-contact]')?.focus());
  };

  const closeContact = () => {
    const el = modal();
    if (!el) return;
    el.hidden = true;
    el.setAttribute('hidden', '');
    el.setAttribute('aria-hidden', 'true');
    doc.documentElement.classList.remove('overflow-hidden');
    window.__bkContactOpener?.focus?.();
  };

  doc.addEventListener('click', (event) => {
    const open = event.target.closest('[data-open-contact]');
    if (open) {
      event.preventDefault();
      openContact(open);
      return;
    }
    const close = event.target.closest('[data-close-contact]');
    if (close) {
      event.preventDefault();
      closeContact();
      return;
    }
    const el = modal();
    if (el && event.target === el) closeContact();
  }, true);

  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal() && !modal().hidden) closeContact();
  });

  window.KarakoramVisionContact = { open: openContact, close: closeContact };
})();
