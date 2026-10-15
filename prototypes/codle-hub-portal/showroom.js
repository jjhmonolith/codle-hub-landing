(() => {
  const video = document.querySelector('#product-film');
  const toggle = document.querySelector('.motion-toggle');
  if (!video || !toggle) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  video.controls = false;
  const sync = () => {
    toggle.textContent = video.paused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-label', video.paused ? '제품 영상 재생' : '제품 영상 일시정지');
  };
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  video.addEventListener('error', () => { video.controls = true; toggle.hidden = true; });
  toggle.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => { video.controls = true; });
    else video.pause();
  });
  reduced.addEventListener('change', () => { if (reduced.matches) video.pause(); });
  if (!reduced.matches) video.play().catch(sync);
  sync();
})();
