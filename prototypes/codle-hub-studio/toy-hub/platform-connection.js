(() => {
  const art = document.querySelector('.connection-art');
  if (!art) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const card = art.closest('.service-card');
  let visible = false, hovered = false;
  function sync() {
    const active = visible && !document.hidden && !reduced.matches &&
      (hovered || card.matches(':focus-visible') || !!card.querySelector(':focus-visible'));
    // Removing the animation restores the original scattered icons on exit.
    art.classList.toggle('is-playing', active);
    art.classList.remove('is-paused');
  }
  card.addEventListener('pointerenter', event => { hovered = event.pointerType === 'mouse'; sync(); });
  card.addEventListener('pointerleave', () => { hovered = false; sync(); });
  card.addEventListener('focusin', sync);
  card.addEventListener('focusout', () => queueMicrotask(sync));
  card.addEventListener('pointercancel', () => { hovered = false; sync(); });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }, {threshold: .15}).observe(art);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  sync();
})();
