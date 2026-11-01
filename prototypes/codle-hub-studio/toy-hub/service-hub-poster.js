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

// Desktop opens on request; mobile keeps the campaign in the service flow.
(() => {
  const billboard = document.querySelector('.billboard');
  const toggle = document.querySelector('.campaign-toggle');
  const poster = document.querySelector('#floating-campaign');
  if (!billboard || !toggle || !poster) return;
  const mobile = window.matchMedia('(max-width: 680px)');
  let desktopExpanded = false;
  function render() {
    const expanded = mobile.matches || desktopExpanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'AI 캠프 포스터 접기' : '우리 학교에서 AI 캠프 펼치기');
    toggle.querySelector('.campaign-toggle-label').textContent = expanded ? '접기' : '펼치기';
    toggle.querySelector('.campaign-toggle-icon').textContent = expanded ? '−' : '↗';
    poster.hidden = !expanded;
    billboard.classList.toggle('is-collapsed', !expanded);
  }
  toggle.addEventListener('click', () => { desktopExpanded = !desktopExpanded; render(); });
  billboard.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobile.matches && desktopExpanded) {
      desktopExpanded = false;
      render();
      toggle.focus();
    }
  });
  mobile.addEventListener('change', render);
  render();
})();
