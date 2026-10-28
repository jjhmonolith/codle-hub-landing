(() => {
  const art = document.querySelector('.connection-art');
  if (!art) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const card = art.closest('.service-card');
  let visible = false, hovered = false;
  function sync() {
    art.classList.toggle('is-playing', !reduced.matches);
    art.classList.toggle('is-paused', !visible || document.hidden || !(hovered || card.matches(':focus-visible')));
  }
  card.addEventListener('pointerenter', event => { hovered = event.pointerType === 'mouse'; sync(); });
  card.addEventListener('pointerleave', () => { hovered = false; sync(); });
  card.addEventListener('focus', sync);
  card.addEventListener('blur', sync);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }, {threshold: .15}).observe(art);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  sync();
})();
