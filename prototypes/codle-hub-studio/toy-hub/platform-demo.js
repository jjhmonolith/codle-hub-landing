(() => {
  const demo = document.querySelector('.platform-demo');
  if (!demo) return;
  const card = demo.closest('.service-card');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let step = 0, timer = null, visible = false, hovering = false;
  function schedule() {
    clearTimeout(timer);
    if (motion.matches || document.hidden || !visible || hovering || step >= 2) return;
    timer = setTimeout(() => {
      step += 1;
      demo.dataset.step = String(step);
      schedule();
    }, 2600);
  }
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {threshold: .6}).observe(demo);
  card.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  card.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  card.addEventListener('focusin', () => { hovering = true; schedule(); });
  card.addEventListener('focusout', () => { hovering = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', schedule);
})();
