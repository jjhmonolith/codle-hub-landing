(() => {
  const slides = [...document.querySelectorAll('[data-ad]')];
  const position = document.querySelector('.ad-position');
  const pauseButton = document.querySelector('.ad-pause');
  const billboard = document.querySelector('.billboard');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0, elapsed = 0, last = 0, paused = reduced.matches, hovering = false, visible = true;
  function show(index) {
    active = (index + slides.length) % slides.length;
    elapsed = 0;
    slides.forEach((slide, i) => {
      slide.hidden = i !== active;
      slide.classList.toggle('is-entering', i === active);
      const video = slide.querySelector('video');
      if (video) i === active && !paused && visible && !document.hidden ? video.play().catch(() => {}) : video.pause();
    });
    position.innerHTML = `0${active + 1}<span> / 0${slides.length}</span>`;
    billboard.style.setProperty('--ad-progress', '0');
  }
  function updatePause() {
    pauseButton.textContent = paused ? '▶' : 'Ⅱ';
    pauseButton.setAttribute('aria-label', paused ? '홍보 배너 자동 전환 재생' : '홍보 배너 자동 전환 일시정지');
    pauseButton.setAttribute('aria-pressed', String(paused));
    slides.forEach((slide, i) => {
      const video = slide.querySelector('video');
      if (video) !paused && visible && !document.hidden && i === active ? video.play().catch(() => {}) : video.pause();
    });
  }
  document.querySelector('[data-ad-prev]').addEventListener('click', () => show(active - 1));
  document.querySelector('[data-ad-next]').addEventListener('click', () => show(active + 1));
  pauseButton.addEventListener('click', () => { paused = !paused; updatePause(); });
  billboard.addEventListener('mouseenter', () => { hovering = true; });
  billboard.addEventListener('mouseleave', () => { hovering = false; });
  billboard.addEventListener('focusin', () => { hovering = true; });
  billboard.addEventListener('focusout', e => { if (!billboard.contains(e.relatedTarget)) hovering = false; });
  document.addEventListener('visibilitychange', updatePause);
  reduced.addEventListener('change', () => { paused = reduced.matches; updatePause(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updatePause(); }).observe(billboard);
  function tick(now) {
    const delta = last ? Math.min(now - last, 100) : 0;
    last = now;
    if (!paused && !hovering && visible && !document.hidden) {
      elapsed += delta;
      if (elapsed >= 8000) show(active + 1);
      billboard.style.setProperty('--ad-progress', String(elapsed / 8000));
    }
    requestAnimationFrame(tick);
  }
  show(0); updatePause(); requestAnimationFrame(tick);
})();
