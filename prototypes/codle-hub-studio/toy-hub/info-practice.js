(() => {
 const card = document.querySelector('.info-service');
 if (!card) return;
 const video = card.querySelector('video');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let hovered = false, visible = false;
 function sync() {
  if ((hovered || card.matches(':focus-visible')) && visible && !document.hidden && !reduced.matches) video.play().catch(() => {});
  else video.pause();
 }
 card.addEventListener('pointerenter', e => { hovered = e.pointerType === 'mouse'; sync(); });
 card.addEventListener('pointerleave', () => { hovered = false; sync(); });
 card.addEventListener('focus', sync); card.addEventListener('blur', sync);
 new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(card);
 document.addEventListener('visibilitychange', sync); reduced.addEventListener('change', sync);
})();
