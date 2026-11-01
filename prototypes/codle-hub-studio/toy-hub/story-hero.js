(() => {
 const hero = document.querySelector('.story-hero');
 if (!hero) return;
 const scenes = [...hero.querySelectorAll('.story-scene')];
 const buttons = [...hero.querySelectorAll('[data-story]')];
 const pause = hero.querySelector('.story-pause');
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 let index = 0, paused = motion.matches, timer;
 function show(next) {
  index = next;
  scenes.forEach((scene, i) => { scene.classList.toggle('is-active', i === index); scene.setAttribute('aria-hidden', String(i !== index)); });
  buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
 }
 function sync() {
  clearInterval(timer);
  pause.textContent = paused ? '▶' : 'Ⅱ';
  pause.setAttribute('aria-label', paused ? '자동 전환 시작' : '자동 전환 정지');
  if (!paused && !document.hidden) timer = setInterval(() => show((index + 1) % scenes.length), 5500);
 }
 buttons.forEach((button, i) => button.addEventListener('click', () => { show(i); paused = true; sync(); }));
 pause.addEventListener('click', () => { paused = !paused; sync(); });
 hero.addEventListener('mouseenter', () => clearInterval(timer));
 hero.addEventListener('mouseleave', sync);
 hero.addEventListener('focusin', () => clearInterval(timer));
 hero.addEventListener('focusout', event => { if (!hero.contains(event.relatedTarget)) sync(); });
 document.addEventListener('visibilitychange', sync);
 motion.addEventListener('change', () => { paused = motion.matches; sync(); });
 sync();
})();