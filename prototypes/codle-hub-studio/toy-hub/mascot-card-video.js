(() => {
  const init = () => {
    const art = document.querySelector('.mascot-opening-art');
    const image = art?.querySelector('img');
    if (!image) return;
    art.style.pointerEvents = 'auto';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const video = document.createElement('video');
    Object.assign(video, {src:'assets/codle-mascot-user-selected-60.mp4?v=1', muted:true, playsInline:true, preload:'metadata', loop:false, playbackRate:1.15});
    video.setAttribute('aria-hidden','true');
    const align = () => {
      const css = getComputedStyle(image);
      Object.assign(video.style, {position:'absolute', left:image.offsetLeft+'px', top:image.offsetTop+'px', width:image.offsetWidth+'px', height:image.offsetHeight+'px', maxWidth:'none', objectFit:css.objectFit, objectPosition:css.objectPosition, transform:css.transform, transformOrigin:css.transformOrigin, scale:css.scale, mixBlendMode:css.mixBlendMode, pointerEvents:'none'});
    };
    video.style.visibility = 'hidden';
    art.append(video);
    new ResizeObserver(align).observe(image);
    let playing = false;
    const stop = () => {
      video.pause();
      video.style.visibility = 'hidden';
      image.style.visibility = '';
      playing = false;
    };
    art.addEventListener('pointerenter', async () => {
      if (playing || reduced.matches || document.querySelector('.mondrian-entry')) return;
      playing = true;
      align();
      video.currentTime = 0;
      try {
        await video.play();
        if (!playing) return;
        video.style.visibility = 'visible';
        image.style.visibility = 'hidden';
      } catch { stop(); }
    });
    // Let the short phrase finish even if the pointer leaves; don't snap poses.
    video.addEventListener('ended', () => {
      // Keep the decoded final frame; switching to PNG changes color rendering.
      video.pause();
      playing = false;
    });
    video.addEventListener('error', stop);
    reduced.addEventListener('change', stop);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
