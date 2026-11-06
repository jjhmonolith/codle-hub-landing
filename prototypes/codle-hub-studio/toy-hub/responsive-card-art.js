/* Fit the visible artwork, rather than its transparent source canvas, to each card. */
(() => {
  const flow = matchMedia('(max-width:1399px), (max-height:800px)');
  const specs = [
    ['.jitda-service', 1000, 512, [14, 15, 981, 512]],
    ['.cmass-service', 700, 700, [25, 165, 691, 672]],
    ['.info-service', 700, 700, [18, 104, 646, 664]],
  ];
  const conversation = document.querySelector('#services .brand-hub-card');
  let queued = false;
  const cards = specs.map(([selector, width, height, bounds]) => ({
    card: document.querySelector('#services ' + selector), width, height, bounds,
  })).filter(({card}) => card);
  function fit() {
    queued = false;
    if (!flow.matches) return;
    if (conversation) {
      const {clientWidth: w, clientHeight: h} = conversation;
      const narrow = w / h < 1.5;
      const font = Math.max(16, Math.min(22, w * 0.034, h * 0.073));
      conversation.style.setProperty('--conversation-font', `${font}px`);
      conversation.dataset.conversationLayout = narrow ? 'stacked' : 'wide';
    }
    for (const {card, width, height, bounds} of cards) {
      const box = card.getBoundingClientRect();
      const copyBottom = Math.max(...[...card.querySelectorAll('.card-type, h3, .tile-actions')]
        .map(node => node.getBoundingClientRect().bottom - box.top));
      const top = copyBottom + 12;
      const availableWidth = Math.max(1, card.clientWidth - 24);
      const availableHeight = Math.max(1, card.clientHeight - top - 10);
      const [left, upper, right, lower] = bounds;
      const scale = Math.min(availableWidth / (right - left), availableHeight / (lower - upper));
      const paintedWidth = (right - left) * scale;
      const x = (card.clientWidth - paintedWidth) / 2 - left * scale;
      const y = card.clientHeight - 10 - lower * scale;
      card.style.setProperty('--fitted-art-width', `${width * scale}px`);
      card.style.setProperty('--fitted-art-height', `${height * scale}px`);
      card.style.setProperty('--fitted-art-left', `${x}px`);
      card.style.setProperty('--fitted-art-top', `${y}px`);
      card.classList.add('has-fitted-art');
    }
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(fit);
  }
  const observer = new ResizeObserver(schedule);
  for (const {card} of cards) {
    observer.observe(card);
    card.querySelectorAll('.card-type, h3, .tile-actions').forEach(node => observer.observe(node));
  }
  if (conversation) observer.observe(conversation);
  flow.addEventListener('change', schedule);
  addEventListener('resize', schedule);
  document.fonts.ready.then(schedule);
  schedule();
})();
