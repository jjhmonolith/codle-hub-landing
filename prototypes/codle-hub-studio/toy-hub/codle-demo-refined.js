(() => {
 const root=document.querySelector('.codle-demo');if(!root)return;
 const wrap=document.createElement('div');wrap.className='demo-scroll-track';root.before(wrap);wrap.append(root);
 root.querySelectorAll('[role=tab]').forEach(old=>{const item=document.createElement('div');for(const a of old.attributes)item.setAttribute(a.name,a.value);item.innerHTML=old.innerHTML;old.replaceWith(item)});
 const tabs=[...root.querySelectorAll('[role=tab]')], original=[...root.querySelectorAll('[role=tabpanel]')];
 const showcase = root.querySelector('.demo-showcase');
 // Stable frame keys are also used by mobile-layout-refined.js.
 const scenes = [
  { source: 0, frame: '0', id: 'demo-panel-course', video: 'course', label: '코스메이커에서 추가 버튼을 누르고 활동을 선택하는 실제 화면' },
  { source: 1, frame: '3', id: 'demo-panel-practice', video: 'sherlock', label: 'AI 셜록 실제 교안 진행' },
  { source: 1, frame: 'river', id: 'demo-panel-river', video: 'river', label: '강 건너기 퍼즐 실제 풀이', poster: 'assets/codle-story-river-hd.png' },
  { source: 2, frame: '4', id: 'demo-panel-progress' }
 ];
 const liveVideos = [];
 const layers = scenes.map((config, index) => {
  const scene = original[config.source].cloneNode(true);
  scene.hidden = false;
  scene.id = config.id;
  scene.dataset.frame = config.frame;
  if (config.video) {
   const screen = scene.querySelector('.demo-screen');
   const poster = config.poster || screen.querySelector('img')?.src;
   const video = document.createElement('video');
   video.src = `assets/codle-live-${config.video}.mp4`;
   video.muted = true;
   video.loop = config.video !== 'course';
   video.playsInline = true;
   video.preload = 'auto';
   video.setAttribute('aria-label', config.label);
   if (poster) video.poster = poster;
   screen.replaceChildren(video);
   screen.classList.add('live-demo-screen', `live-${config.video}`);
   liveVideos.push({ index, video });
  }
  return scene;
 });
 showcase.replaceChildren(...layers);
 let onScreen=false;
 const visibilityObserver=new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;schedule()},{threshold:0});visibilityObserver.observe(root);
 document.addEventListener('visibilitychange',schedule);

 const brand=document.createElement('div');brand.className='demo-brand';brand.innerHTML='<span>수업 플랫폼</span><img src="assets/codle.svg" alt="codle">';root.querySelector('.demo-copy').prepend(brand);
 const detailAction=root.querySelector('.quiet-actions');detailAction.classList.add('codle-detail-action');detailAction.querySelector('button')?.remove();detailAction.remove();tabs.forEach(tab=>{const action=detailAction.cloneNode(true);action.classList.remove('codle-detail-action');action.classList.add('feature-detail-action');tab.append(action)});
 const words=tabs.map(tab=>{
  const heading=tab.querySelector('strong');const text=heading.textContent;heading.setAttribute('aria-label',text);heading.textContent='';
  text.split(/(\s+)/).forEach(word=>{if(/^\s+$/.test(word))heading.append(document.createTextNode(word));else{const span=document.createElement('span');span.className='demo-word';span.textContent=word;span.setAttribute('aria-hidden','true');heading.append(span)}});
  return [...heading.querySelectorAll('.demo-word')];
 });
 // The recorded dialog is 844 x 700 inside a 1440 x 900 video.
 // Stop before the recorded dialog opens, then reveal one continuous DOM dialog.
 // This avoids switching between two slightly different dialog layouts.
 const courseVideo = liveVideos[0].video;
 const courseScreen = courseVideo.parentElement;
 const COURSE_DIALOG_AT = 0.6;
 const courseShade = document.createElement('div');
 courseShade.className = 'course-modal-shade';
 courseShade.setAttribute('aria-hidden', 'true');
 courseScreen.append(courseShade);
 const courseOverlay = document.createElement('div');
 courseOverlay.className = 'course-modal-overlay';
 courseOverlay.setAttribute('aria-hidden', 'true');
 const courseFrame = document.createElement('iframe');
 courseFrame.className = 'course-modal-frame';
 courseFrame.src = 'assets/codle-tools-scroll.html';
 courseFrame.title = '새 활동 도구 목록 스크롤 미리보기';
 courseFrame.tabIndex = -1;
 courseOverlay.append(courseFrame);
 courseScreen.append(courseOverlay);
 let toolList = null, overlayElapsed = 0, overlayLastTime = null;
 function fitCourseOverlay() {
  const width = courseScreen.clientWidth, height = courseScreen.clientHeight;
  const scale = Math.min(width / 1440, height / 900);
  Object.assign(courseOverlay.style, {
   left: `${(width - 1440 * scale) / 2 + 298 * scale}px`,
   top: `${(height - 900 * scale) / 2 + 100 * scale}px`,
   width: `${844 * scale}px`, height: `${700 * scale}px`,
   borderRadius: `${16 * scale}px`
  });
  courseFrame.style.transform = `scale(${scale})`;
 }
 new ResizeObserver(fitCourseOverlay).observe(courseScreen);
 courseFrame.addEventListener('load', async () => {
  await courseFrame.contentDocument?.fonts?.ready;
  toolList = courseFrame.contentDocument?.querySelector('.css-b0rdla')?.parentElement;
  fitCourseOverlay();
  schedule();
 });
 courseVideo.addEventListener('timeupdate', schedule);
 courseVideo.addEventListener('ended', schedule);
 // timeupdate is too coarse (often 250 ms) to stop before the filmed popup.
 function holdBeforeRecordedDialog() {
  if (courseVideo.currentTime >= COURSE_DIALOG_AT) {
   courseVideo.pause();
   schedule();
  } else if (courseVideo.requestVideoFrameCallback) {
   courseVideo.requestVideoFrameCallback(holdBeforeRecordedDialog);
  }
 }
 if (courseVideo.requestVideoFrameCallback) {
  courseVideo.requestVideoFrameCallback(holdBeforeRecordedDialog);
 } else {
  let held = false;
  courseVideo.addEventListener('timeupdate', () => {
   if (!held && courseVideo.currentTime >= COURSE_DIALOG_AT) {
    held = true;
    courseVideo.pause();
    courseVideo.currentTime = COURSE_DIALOG_AT;
   }
  });
 }
 function syncCourseOverlay(now, active) {
  const ready = !!toolList && courseVideo.currentTime >= COURSE_DIALOG_AT;
  courseOverlay.classList.toggle('is-visible', ready);
  courseShade.classList.toggle('is-visible', ready);
  if (courseVideo.currentTime < COURSE_DIALOG_AT) overlayElapsed = 0;
  if (ready && active && !document.hidden && !reduced.matches) {
   if (overlayLastTime !== null) overlayElapsed += Math.min(50, now - overlayLastTime);
   overlayLastTime = now;
   // Pause on Python briefly, then scroll the left-hand list while the detail stays put.
   toolList.scrollTop = ease((overlayElapsed - 650) / 3800) * (toolList.scrollHeight - toolList.clientHeight);
   if (overlayElapsed < 4450) schedule();
  } else {
   overlayLastTime = null;
   if (ready && reduced.matches) toolList.scrollTop = 0;
  }
 }
 const tabList=root.querySelector('.demo-tabs');
 const brandParts=[...brand.children];
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n)};let queued=false,displayPosition=null,lastTime=0;
 function render(now=performance.now()){
  queued=false;const top=innerWidth<=900?70:90,box=wrap.getBoundingClientRect(),travel=Math.max(1,wrap.offsetHeight-root.offsetHeight);
  const target=Math.max(0,Math.min(4.69999,(top-box.top)/travel*4.7));
  const dt=Math.min(34,Math.max(1,now-lastTime||16.67));lastTime=now;
  if(displayPosition===null||reduced.matches||box.bottom<top||box.top>innerHeight)displayPosition=target;
  else displayPosition+=(target-displayPosition)*(1-Math.exp(-dt/65));
  if(Math.abs(target-displayPosition)<.0005)displayPosition=target;
  // Reveal the brand after the hub clears; reveal the demo only after pinning.
  const intro=reduced.matches?1:ease((displayPosition-.48)/.36);
  const entry=reduced.matches?1:clamp((top+68-box.top)/400);
  brand.style.opacity=1;brand.style.transform="none";
  brandParts.forEach((part,i)=>{const f=reduced.matches?1:ease((entry-i*.18)/.82);part.style.filter=`blur(${(1-f)*7}px)`;part.style.opacity=f;part.style.transform=`translateY(${(1-f)*16}px)`});
  tabList.style.opacity=intro;
  showcase.style.opacity=intro;
  const p=Math.max(0,displayPosition-.7),stage=Math.floor(p),blend=stage<3?ease((p-stage-.42)/.58):0;
  const selected=stage<1?0:stage<3?1:2;
  const visualStage=stage,visualBlend=blend,nextVisual=stage+1;
  layers.forEach((layer,n)=>{
   let opacity=n===visualStage?1-visualBlend:n===nextVisual?visualBlend:0;
   if(reduced.matches)opacity=n===visualStage?1:0;
   const y=reduced.matches?0:n===visualStage?-28*visualBlend:44*(1-visualBlend);
   layer.style.opacity=opacity;layer.style.transform=`translate3d(0,${y}px,0)`;layer.style.visibility=opacity>0?'visible':'hidden';
   layer.setAttribute('aria-hidden',String(n!==visualStage));layer.inert=n!==visualStage;
   const playing=onScreen&&!document.hidden&&intro>.7&&opacity>.55;
   layer.classList.toggle('demo-playing',playing);
   const live=liveVideos.find(item=>item.index===n);
   if(live){const canPlay=playing&&!reduced.matches&&!(n===0&&live.video.currentTime>=COURSE_DIALOG_AT);if(canPlay){if(live.video.paused)live.video.play().catch(()=>{});}else if(!live.video.paused)live.video.pause();}

  });
  syncCourseOverlay(now, onScreen && intro > .7 && visualStage === 0 && visualBlend < .45);
  const copyPosition=p<.42?0:p<1?ease((p-.42)/.58):p<2.42?1:p<3?1+ease((p-2.42)/.58):2;
  tabs.forEach((tab,n)=>{
   const relative=n-copyPosition,active=n===selected;
   tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
   tab.style.setProperty('--copy-y',`${relative*32}px`);
   tab.style.setProperty('--copy-opacity',String(clamp(1-Math.abs(relative)*2)));
   tab.style.visibility=Math.abs(relative)<1?'visible':'hidden';tab.inert=Math.abs(relative)>.5;
   const start=[0,1,3][n];const reveal=reduced.matches?1:(n===0?intro:clamp((p-start+.24)/.48));
   words[n].forEach((word,j)=>{const f=ease(reveal*1.5-j/Math.max(1,words[n].length)*.45);word.style.filter=`blur(${(1-f)*4}px)`;word.style.opacity=.2+.8*f;word.style.transform=`translateY(${(1-f)*6}px)`});
  });
  if(displayPosition!==target)schedule();
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(render)}}
 function jump(i){const top=innerWidth<=900?70:90;window.scrollTo({top:scrollY+wrap.getBoundingClientRect().top-top+(wrap.offsetHeight-root.offsetHeight)*([0,1,3][i]+.96)/4.7,behavior:reduced.matches?'instant':'smooth'})}
 tabs.forEach((t,i)=>{t.onclick=e=>{if(!e.target.closest('a'))jump(i)};t.onkeydown=e=>{const n=e.key==='ArrowDown'?(i+1)%3:e.key==='ArrowUp'?(i+2)%3:e.key==='Home'?0:e.key==='End'?2:null;if(n!==null){e.preventDefault();jump(n);tabs[n].focus({preventScroll:true})}}});
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);
 // Decode the upcoming stills before the user reaches their transition.
 root.querySelectorAll('.demo-showcase img').forEach(img=>{if(img.decode)img.decode().catch(()=>{});});
 render();
})();
