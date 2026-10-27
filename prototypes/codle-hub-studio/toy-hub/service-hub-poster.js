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
