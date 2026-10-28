(() => {
  const slides = [...document.querySelectorAll('[data-ad]')];
  if (!slides.length) return;
  const counter = document.querySelector('.ad-position');
  let active = 0;
  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== active; });
    counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }
  document.querySelector('[data-ad-prev]').addEventListener('click', () => show(active - 1));
  document.querySelector('[data-ad-next]').addEventListener('click', () => show(active + 1));
  show(0);
})();

// The campaign floats independently of the centered service grid.
(() => {
  const billboard = document.querySelector('.billboard');
  const toggle = document.querySelector('.campaign-toggle');
  const poster = document.querySelector('#floating-campaign');
  if (!billboard || !toggle || !poster) return;
  function setExpanded(expanded) {
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.querySelector('.campaign-toggle-label').textContent = expanded ? '접기' : '펼치기';
    toggle.querySelector('.campaign-toggle-icon').textContent = expanded ? '−' : '+';
    poster.hidden = !expanded;
    billboard.classList.toggle('is-collapsed', !expanded);
  }
  toggle.addEventListener('click', () => setExpanded(toggle.getAttribute('aria-expanded') !== 'true'));
  if (window.matchMedia('(max-width: 680px)').matches) setExpanded(false);
})();
