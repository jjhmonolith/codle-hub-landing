(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const camp = document.querySelector('.camp-service');
  const video = camp?.querySelector('video');
  if (video) {
    let hovered = false, visible = false;
    function syncVideo() {
      const playing = visible && !document.hidden && !reduced.matches && (hovered || camp.matches(':focus-within'));
      if (playing) video.play().catch(() => {}); else video.pause();
    }
    camp.addEventListener('pointerenter', e => { hovered = e.pointerType === 'mouse'; syncVideo(); });
    camp.addEventListener('pointerleave', () => { hovered = false; syncVideo(); });
    camp.addEventListener('focusin', syncVideo);
    camp.addEventListener('focusout', () => queueMicrotask(syncVideo));
    document.addEventListener('visibilitychange', syncVideo);
    reduced.addEventListener('change', syncVideo);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncVideo(); }, {threshold:.15}).observe(camp);
  }
})();
