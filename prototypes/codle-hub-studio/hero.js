(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('.detail-panel')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function select(key, focus = false) {
    const selected = tabs.find(tab => tab.dataset.tab === key);
    if (!selected) return;
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.id !== selected.getAttribute('aria-controls'); });
    if (focus) selected.focus({ preventScroll: true });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next].dataset.tab, true);
      tabs[next].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    });
  });
  document.querySelectorAll('[data-pick]').forEach(portal => {
    portal.addEventListener('click', () => {
      select(portal.dataset.pick, true);
      document.getElementById('explore').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
    });
  });
})();
