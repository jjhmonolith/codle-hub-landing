(() => {
  async function mountPlatformCard() {
    const card = document.querySelector('.platform-service');
    const host = card?.querySelector('.premium-card-art');
    if (!host) return;
    const {mountCodleSurface} = await import('./codle-surface-motion.js?v=8');
    const canvas = document.createElement('canvas');
    canvas.className = 'codle-surface-art';
    canvas.setAttribute('aria-hidden', 'true');
    await mountCodleSurface(canvas, card);
    host.append(canvas);
    host.classList.add('has-hover-art');
  }
  mountPlatformCard().catch(error => console.warn('Codle motion unavailable; retaining static art.', error));

  // The publisher rig owns these three cards. Keep their static art until ready.
  import('./publisher-surface-motion.js?v=4').then(({mountPublisherCards})=>mountPublisherCards())
    .catch(error=>console.warn('Publisher motion unavailable; using static art.',error));

})();
