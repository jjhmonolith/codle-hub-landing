(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const states = [];
  const ease = 'cubic-bezier(.22,.7,.2,1)';
  const cycles = { 0: 3600, 1: 4800, 2: 3400, 3: 4400, 5: 3600 };

  function animate(state, element, frames, duration, delay = 0) {
    if (!element) return;
    const cycle = cycles[state.card.dataset.card];
    // Keep each card's layers synchronized, including their stagger and final hold.
    // Return to the first frame smoothly before replaying the sequence.
    const loopFrames = frames.map((frame, index) => ({
      ...frame,
      offset: (delay + duration * (frame.offset ?? index / (frames.length - 1))) / cycle,
      easing: frame.easing ?? ease,
    }));
    if (delay) loopFrames.unshift({ ...frames[0], offset: 0, easing: ease });
    loopFrames.push(
      { ...frames[frames.length - 1], offset: (cycle - 500) / cycle, easing: ease },
      { ...frames[0], offset: 1 },
    );
    const animation = element.animate(loopFrames, {
      duration: cycle, easing: 'linear', fill: 'both', iterations: Infinity,
    });
    state.animations.push(animation);
  }

  function artwork(state) {
    const find = selector => state.card.querySelector(selector);
    const all = selector => [...state.card.querySelectorAll(selector)];
    switch (state.card.dataset.card) {
      case '0':
        // Reuse the original mosaic landing's single gather/unfold playhead.
        animate(state, find('.platform-mosaic-preview'), [
          { '--card-platform-progress': 0, easing: 'cubic-bezier(.65,0,.22,1)' },
          { '--card-platform-progress': 1 },
        ], 1000, 300);
        break;
      case '1':
        // The original lesson stays in view. Its goal diagram builds one valid solution.
        animate(state, find('.lesson-preview-sequence'), [{ opacity: 1 }, { opacity: 1 }], 4200);
        animate(state, find('.lesson-preview-marker'), [
          { opacity: 0, scale: '0 1' },
          { opacity: .55, scale: '1 1', offset: .3 },
          { opacity: .55, scale: '1 1', offset: .7 },
          { opacity: 0, scale: '1 1' },
        ], 1800);
        all('.lesson-preview-piece').forEach((piece, i) => animate(state, piece, [
          { opacity: 0, translate: '0 -10px', scale: .82 },
          { opacity: 1, translate: '0 0', scale: 1.06, offset: .7 },
          { opacity: 1, translate: '0 0', scale: 1 },
        ], 420, 650 + i * 480));
        break;
      case '2':
        animate(state, find('.visual-book-page'), [
          { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1 },
        ], 900, 100);
        animate(state, find('.visual-cover'), [
          { transform: 'perspective(700px) rotateY(0deg)', opacity: 1 },
          { transform: 'perspective(700px) rotateY(-72deg)', opacity: .7, offset: .75 },
          { transform: 'perspective(700px) rotateY(-98deg)', opacity: 0 },
        ], 1050);
        break;
      case '3':
        all('.visual-shape').forEach((shape, i) => animate(state, shape, [
          { translate: '0 0', rotate: '0deg' },
          { translate: `${[2, -4, 0][i]}% ${[-9, -5, 6][i]}%`, rotate: `${[9, -9, -5][i]}deg`, offset: .4 },
          { translate: `${[-1, 2, 0][i]}% ${[3, 2, -3][i]}%`, rotate: `${[-3, 4, 2][i]}deg`, offset: .72 },
          { translate: '0 0', rotate: '0deg' },
        ], 3400, i * 100));
        break;
      case '5':
        animate(state, find('.visual-mascot'), [
          { rotate: '0deg', translate: '0 0' },
          { rotate: '-7deg', translate: '0 -4%', offset: .22 },
          { rotate: '3deg', translate: '0 1%', offset: .42 },
          { rotate: '-3deg', translate: '0 -2%', offset: .6 },
          { rotate: '0deg', translate: '0 0' },
        ], 2500);
        animate(state, find('.visual-demo'), [
          { clipPath: 'inset(0 0 100% 0)', opacity: .4 },
          { clipPath: 'inset(0 0 62% 0)', opacity: 1, offset: .25 },
          { clipPath: 'inset(0 0 62% 0)', opacity: 1, offset: .4 },
          { clipPath: 'inset(0 0 28% 0)', opacity: 1, offset: .62 },
          { clipPath: 'inset(0 0 28% 0)', opacity: 1, offset: .73 },
          { clipPath: 'inset(0 0 0% 0)', opacity: 1 },
        ], 2100, 180);
        break;
    }
  }

  function stop(state) {
    state.running = false;
    state.run += 1;
    state.animations.forEach(animation => animation.cancel());
    state.animations.length = 0;
    state.card.classList.remove('is-previewing', 'is-video-playing');
    state.card.dataset.previewState = 'idle';
    if (state.video) {
      state.video.pause();
      if (state.video.readyState > 0) state.video.currentTime = 0;
    }
  }

  function start(state) {
    if (state.running) return;
    state.running = true;
    const run = ++state.run;
    state.card.classList.add('is-previewing');
    state.card.dataset.previewState = 'playing';
    artwork(state);
    if (!state.video) return;
    const video = state.video;
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.muted = true;
    video.play().then(() => {
      if (state.running && state.run === run) state.card.classList.add('is-video-playing');
      else if (!state.running) video.pause();
    }).catch(() => {
      if (state.run === run) state.card.classList.remove('is-video-playing');
    });
  }

  function sync(state) {
    const shouldPlay = !reduced.matches && !document.hidden && state.visible && (state.pointer || state.focused);
    if (shouldPlay) start(state);
    else if (state.running) stop(state);
  }

  document.querySelectorAll('.gl-card').forEach(card => {
    const state = { card, video: card.querySelector('[data-preview-video]'), animations: [], visible: false, pointer: false, focused: false, running: false, run: 0 };
    states.push(state);
    card.dataset.previewState = 'idle';
    card.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      state.pointer = true;
      sync(state);
    });
    ['pointerleave', 'pointercancel'].forEach(type => card.addEventListener(type, () => {
      state.pointer = false;
      sync(state);
    }));
    card.addEventListener('focusin', event => {
      state.focused = event.target.matches(':focus-visible');
      sync(state);
    });
    card.addEventListener('focusout', event => {
      if (card.contains(event.relatedTarget)) return;
      state.focused = false;
      sync(state);
    });
    new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting && entry.intersectionRatio >= .2;
      sync(state);
    }, { threshold: [0, .2] }).observe(card);
  });

  reduced.addEventListener('change', () => states.forEach(sync));
  document.addEventListener('visibilitychange', () => states.forEach(state => {
    if (document.hidden) state.pointer = state.focused = false;
    sync(state);
  }));
  window.addEventListener('blur', () => states.forEach(state => {
    state.pointer = state.focused = false;
    sync(state);
  }));
})();
