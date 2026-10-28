(() => {
  const reel = document.querySelector('.content-reel');
  if (!reel) return;
  const card = reel.closest('.service-card');
  const track = reel.querySelector('.content-reel-track');
  const lessons = [...reel.querySelectorAll('.content-lesson')];
  track.replaceChildren();
  const rows = [0, 1].map(index => {
    const viewport = document.createElement('div');
    viewport.className = 'content-reel-row';
    const group = document.createElement('div');
    group.className = 'content-reel-group';
    lessons.filter((_, i) => i % 2 === index).forEach(lesson => group.append(lesson));
    viewport.append(group);
    const duplicate = group.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    duplicate.querySelectorAll('img').forEach(img => { img.alt = ''; });
    viewport.append(duplicate);
    track.append(viewport);
    return { viewport, group };
  });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let hovered = false, visible = false, frame = 0, last = null, position = 0;
  function stop() { cancelAnimationFrame(frame); frame = 0; last = null; }
  function render() {
    rows.forEach(({ viewport, group }, index) => {
      const span = parseFloat(getComputedStyle(group).width);
      if (span <= 0) return;
      // Keep a full viewport beyond the shifted first copy, even on wide cards.
      const copiesNeeded = Math.ceil(viewport.clientWidth / span) + 2;
      while (viewport.children.length < copiesNeeded) {
        const copy = group.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.querySelectorAll('img').forEach(img => { img.alt = ''; });
        viewport.append(copy);
      }
      const offset = index === 0 ? -span + position % span : -(position % span);
      // Move both copies directly so reverse motion cannot be clamped by scroll bounds.
      for (const copy of viewport.children) copy.style.transform = `translate3d(${offset}px, 0, 0)`;
    });
  }
  new ResizeObserver(render).observe(reel);
  render();
  function tick(time) {
    if (last !== null) {
      position += Math.min(time - last, 64) * .036;
      render();
    }
    last = time;
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    stop();
    if (hovered && visible && !document.hidden && !reduce.matches) {
      frame = requestAnimationFrame(tick);
    }
  }
  card.addEventListener('pointerenter', e => { hovered = e.pointerType === 'mouse'; sync(); });
  card.addEventListener('pointerleave', () => { hovered = false; sync(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(card);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync);
  // A touch swipe browses covers without following the enclosing card link.
  let startX = 0, startY = 0, dragged = false;
  reel.addEventListener('pointerdown', e => { startX = e.clientX; startY = e.clientY; dragged = false; });
  reel.addEventListener('pointermove', e => {
    if (e.buttons && Math.hypot(e.clientX - startX, e.clientY - startY) > 8) dragged = true;
  });
  reel.addEventListener('click', e => { if (dragged) { e.preventDefault(); e.stopPropagation(); } }, true);
})();
