(() => {
  const stage = document.querySelector('.studio-story');
  if (!stage) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const intro = stage.querySelector('.scene-intro');
  const result = stage.querySelector('.scene-result');
  const clamp = n => Math.min(1, Math.max(0, n));
  const ease = n => n * n * (3 - 2 * n);
  let queued = false;
  function paint() {
    const rect = stage.getBoundingClientRect();
    const p = clamp(-rect.top / Math.max(1, rect.height - innerHeight));
    stage.style.setProperty('--progress', p);
    stage.style.setProperty('--lift', ease(clamp((p - .07) / .58)));
    stage.style.setProperty('--props', ease(clamp((p - .12) / .55)));
    const reveal = ease(clamp((p - .18) / .49));
    stage.style.setProperty('--reveal', reveal);
    intro.inert = !reduced.matches && p > .55;
    result.inert = !reduced.matches && reveal < .8;
    queued = false;
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(paint); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  stage.addEventListener('pointermove', e => {
    if (reduced.matches || e.pointerType !== 'mouse') return;
    stage.style.setProperty('--mx', `${(e.clientX / innerWidth - .5) * 16}px`);
    stage.style.setProperty('--my', `${(e.clientY / innerHeight - .5) * 12}px`);
  });
  stage.addEventListener('pointerleave', () => {
    stage.style.setProperty('--mx', '0px');
    stage.style.setProperty('--my', '0px');
  });
  const toggle = document.querySelector('.dock-menu');
  const menu = document.querySelector('#studio-menu');
  function closeMenu(restoreFocus = false) {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '교육 서비스 메뉴 열기');
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `교육 서비스 메뉴 ${open ? '닫기' : '열기'}`);
    if (open) menu.querySelector('a').focus();
  });
  menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) closeMenu(true); });
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target) && !toggle.contains(e.target)) closeMenu(); });
  const petals = stage.querySelector('.petals');
  let color = 0;
  const colors = ['#f37642', '#a2a4d7', '#e4b647', '#d97793'];
  stage.querySelector('.grow-flower').addEventListener('click', () => {
    color += 1;
    petals.querySelectorAll('ellipse').forEach(el => el.setAttribute('fill', colors[color % colors.length]));
    petals.style.transform = `rotate(${color * 60}deg)`;
  });
  paint();
})();
