(() => {
  const art = document.querySelector('.connection-art');
  if (!art) return;
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    art.classList.add('is-visible');
    observer.disconnect();
  }, {threshold:.5});
  observer.observe(art);
})();
