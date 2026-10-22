(() => {
  const hero = document.querySelector('.labs-hero');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('[data-slide]')];
  const dots = [...hero.querySelectorAll('[data-slide-to]')];
  let active = 0;
  function select(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== active; });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === active)));
    hero.querySelector('.labs-count').textContent = `${String(active + 1).padStart(2, '0')} / 05`;
    hero.querySelector('#labs-status').textContent = slides[active].getAttribute('aria-label');
  }
  dots.forEach(dot => dot.addEventListener('click', () => select(Number(dot.dataset.slideTo))));
  hero.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => select(active + Number(button.dataset.direction))));
  hero.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const focusedLink = document.activeElement.closest('.labs-slide');
    select(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1));
    if (focusedLink) slides[active].querySelector('a').focus();
  });
  let touchStart;
  hero.addEventListener('touchstart', event => { if(event.touches.length === 1) touchStart = [event.touches[0].clientX,event.touches[0].clientY]; else touchStart = null; }, {passive:true});
  hero.addEventListener('touchend', event => {
    if(!touchStart) return;
    const dx = event.changedTouches[0].clientX-touchStart[0], dy = event.changedTouches[0].clientY-touchStart[1];
    if(Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*1.5) select(active+(dx<0?1:-1));
    touchStart=null;
  }, {passive:true});
  hero.addEventListener('touchcancel', () => {touchStart=null;}, {passive:true});
})();
const labsHeader = document.querySelector('.site-header');
const labsHero = document.querySelector('.labs-hero');
if (labsHeader && labsHero) new IntersectionObserver(([entry]) => {
  labsHeader.classList.toggle('is-scrolled', !entry.isIntersecting);
}, {rootMargin:'-95px 0px 0px 0px'}).observe(labsHero);
