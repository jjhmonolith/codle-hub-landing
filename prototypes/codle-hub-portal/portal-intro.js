(() => {
  const section = document.querySelector('.portal-intro');
  if (!section) return;
  const pin = section.querySelector('.portal-pin');
  const logo = section.querySelector('.logo-camera');
  const shapes = section.querySelectorAll('.portal-shape,.portal-fill,.portal-rim');
  const world = section.querySelector('.portal-world');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const video = section.querySelector('video');
  const play = section.querySelector('.portal-play');
  const clamp = v => Math.max(0,Math.min(1,v));
  const smooth = v => { const t=clamp(v); return t*t*(3-2*t); };
  let frame = 0, started = false, userPaused = false;
  function paint() {
    frame = 0;
    const w = pin.clientWidth, h = pin.clientHeight;
    const base = Math.min(w * .72, 740) / 774.61;
    const p = reduced.matches ? 0 : clamp(-section.getBoundingClientRect().top / Math.max(1,section.offsetHeight-h));
    const t = clamp((p-.035)/.8);
    const ease = t*t*(3-2*t);
    // Original SVG droplet center: (252.42, 220). Keep the exact logo contour.
    const x0 = (w-774.61*base)/2 + 252.42*base;
    const y0 = h*.43 + (220-152.145)*base;
    const focus = smooth(p/.34);
    const cx = x0+(w/2-x0)*focus;
    const cy = y0+(h/2-y0)*focus;
    const maxScale = Math.hypot(w,h)/95;
    const scale = base * Math.pow(maxScale/base,ease);
    // Keep the logo and droplet mask aligned throughout the zoom.
    const transform = `translate(${cx} ${cy}) scale(${scale}) translate(-252.42 -220)`;
    logo.setAttribute('transform',transform);
    shapes.forEach(path=>path.setAttribute('transform',transform));
    const reveal = clamp((p-.39)/.32);
    section.style.setProperty('--travel',p);
    section.style.setProperty('--liquid',clamp(p*18));
    section.style.setProperty('--world',reveal);
    section.style.setProperty('--caption',1-clamp(p*5));
    section.style.setProperty('--logo-opacity',1-clamp((p-.18)/.17));
    world.inert = reduced.matches || reveal<.9;
    // The solid liquid is behind the preview, but the preview only becomes visible after zoom begins.
    world.style.visibility = p>.02 && !reduced.matches ? 'visible' : 'hidden';
    if (p>.32 && section.getBoundingClientRect().bottom>0 && !reduced.matches && !started && !userPaused) {
      started=true; video.play().catch(()=>{started=false;});
    }
    if (p===0 || section.getBoundingClientRect().bottom<=0 || reduced.matches) { video.pause(); started=false; }
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint);};
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  reduced.addEventListener('change',schedule);
  play.addEventListener('click',()=>{if(video.paused){userPaused=false;video.play().catch(()=>{video.controls=true;});}else{userPaused=true;video.pause();}});
  const sync=()=>{play.textContent=video.paused?'▶':'Ⅱ';play.setAttribute('aria-label',video.paused?'오프닝 영상 재생':'오프닝 영상 일시정지');};
  video.addEventListener('play',sync);video.addEventListener('pause',sync);
  paint();
})();
