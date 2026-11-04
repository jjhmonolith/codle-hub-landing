(() => {
  const camp = document.querySelector('#story-camp');
  if (!camp || camp.parentElement.classList.contains('camp-scroll-track')) return;
  const track = document.createElement('div');
  track.className = 'camp-scroll-track';
  camp.before(track);
  track.append(camp);
})();