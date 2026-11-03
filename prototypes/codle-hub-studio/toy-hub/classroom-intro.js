(() => {
 const section=document.querySelector('.classroom-intro'),video=document.querySelector('#classroom-video'),loop=document.querySelector('#classroom-idle');if(!section||!video||!loop)return;
 const stage=section.querySelector('.classroom-stage'),root=document.documentElement,header=document.querySelector('.hub-header'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n)};
 let queued=false,targetTime=0,idle=true,scrollStart=0;
 const film=section.querySelector('.classroom-film');
 const shape=document.createElementNS('http://www.w3.org/2000/svg','path');
 shape.setAttribute('d','M252.42 137.71V137.72C293.16 137.72 326.19 169.39 326.19 208.44C326.19 228.94 319.59 252.58 295.37 274.85C274.58 293.96 248.98 301.38 234.81 304.17C229.85 305.14 225.62 300.49 227.04 295.63L230.03 285.34C231.42 280.57 228.86 275.61 224.24 273.78C197.48 263.17 178.65 237.92 178.65 208.43C178.65 169.37 211.68 137.71 252.42 137.71Z');
 const points=Array.from({length:160},(_,i)=>{const q=shape.getPointAtLength(shape.getTotalLength()*i/160);return [(q.x-173)/160,(q.y-132)/180]});
 function frameDrop(g,small){
  const morph=ease(g/.3),h=stage.clientHeight+(small*1.125-stage.clientHeight)*g;
  const w=innerWidth+(small-innerWidth)*g;
  film.style.width=(w*(1-morph)+Math.min(w,h/1.125)*morph)+'px';
  film.style.height=h+'px';
  film.style.clipPath=g===0?'none':'polygon('+points.map(([x,y])=>{
   const dx=x-.5,dy=y-.5,k=.5/Math.max(Math.abs(dx),Math.abs(dy));
   return ((.5+dx*k)*(1-morph)+x*morph)*100+'% '+((.5+dy*k)*(1-morph)+y*morph)*100+'%';
  }).join(',')+')';
 }
 const hub=document.querySelector('#services'),spacer=document.createElement('div');
 let pinned=false,hubBox=null,cardBottom=0;
 function unpin(){if(!pinned)return;hub.classList.remove('hub-arriving','hub-arrived');['position','left','top','width','height','z-index','opacity','transform','margin'].forEach(k=>hub.style.removeProperty(k));spacer.remove();pinned=false;}
 function hubTransition(p){
  if(!hub||innerWidth<1100){unpin();root.style.setProperty('--hub-arrival','1');return;}
  const exit=ease((p-.88)/.055),arrival=ease((p-.92)/.065);
  stage.style.setProperty('--end-exit',1-exit);stage.style.setProperty('--end-exit-y',(-exit*40)+'px');
  root.style.setProperty('--hub-arrival',arrival);
  if(p<.92){unpin();return;}
  const form=document.querySelector('#inquiry-dialog');
  const bottom=form&&form.open?form.getBoundingClientRect().bottom:innerHeight-24;
  if(!pinned){
   hubBox=hub.getBoundingClientRect();
   cardBottom=Math.max(...Array.from(hub.querySelectorAll('.service-card'),el=>el.getBoundingClientRect().bottom))-hubBox.top;
  }
  // The spacer preserves the natural document position in both directions.
  // Hold the hub on its final baseline until normal scrolling catches up.
  const naturalTop=(pinned?spacer:hub).getBoundingClientRect().top;
  const top=bottom-cardBottom;
  if(naturalTop<=top){unpin();return;}
  if(!pinned){
   spacer.style.height=hubBox.height+'px';hub.before(spacer);pinned=true;hub.classList.add('hub-arriving');
   hub.style.setProperty('position','fixed','important');hub.style.setProperty('left',hubBox.left+'px','important');
   hub.style.setProperty('width',hubBox.width+'px','important');hub.style.setProperty('height',hubBox.height+'px','important');
   hub.style.setProperty('margin','0','important');hub.style.setProperty('z-index','200','important');
  }
  hub.classList.toggle('hub-arrived',arrival>.98);
  hub.style.setProperty('top',top+'px','important');hub.style.opacity=arrival;
  hub.style.transform=`translateY(${(1-arrival)*36}px)`;
 }
 fetch(video.querySelector('source').src).then(r=>{if(!r.ok)throw new Error('video');return r.blob()}).then(blob=>{video.src=URL.createObjectURL(blob);video.load();video.dataset.seekReady='true'}).catch(()=>{});
 function seek(){if(idle||video.readyState<1||video.seeking)return;if(Math.abs(video.currentTime-targetTime)>.018)video.currentTime=targetTime;}
 video.addEventListener('seeked',()=>{seek();if(!idle&&Math.abs(video.currentTime-targetTime)<.06)loop.style.opacity='0'});
 video.addEventListener('loadedmetadata',()=>{video.pause();render()});video.addEventListener('canplay',seek);
 function playIdle(){if(!reduced.matches&&!document.hidden)loop.play().catch(()=>{});else loop.pause()}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)loop.pause();else if(idle)playIdle()});
 function render(){queued=false;const headerH=header.getBoundingClientRect().height,box=section.getBoundingClientRect(),travel=Math.max(1,section.offsetHeight-stage.offsetHeight);
  // Give the fully revealed message a reading interval in both scroll directions.
  const hold=innerHeight*.65,baseTravel=Math.max(1,travel-hold),distance=headerH-box.top;
  const held=Math.max(0,Math.min(hold,distance-baseTravel*.87));
  const p=clamp((distance-held)/baseTravel);
  const wantsIdle=p===0&&box.top>=headerH-1;
  if(wantsIdle){if(!idle){loop.currentTime=0;}idle=true;loop.style.opacity='1';playIdle();video.pause();}
  else {loop.style.opacity='0';if(idle){const half=(loop.duration||3.5)/2;scrollStart=Math.min(1.25,(loop.currentTime<=half?loop.currentTime:2*half-loop.currentTime)/1.4);idle=false;loop.pause();}
   // Finish the camera move before the synthetic UI lettering fills the screen.
   targetTime=clamp(p/.72)*6.2;seek();}
  video.dataset.introMode=idle?'typing':'scroll';
  const gather=ease((p-.50)/.28),full=Math.hypot(innerWidth,stage.clientHeight)*2.4,small=innerWidth<701?Math.min(innerWidth*.42,stage.clientHeight*.3):Math.min(innerWidth*.18,stage.clientHeight*.34);
  const photo=ease((p-.74)/.065),copy=ease((p-.80)/.065);
  stage.style.setProperty('--drop-size',small+'px');
  stage.style.setProperty('--drop-photo',photo);
  stage.style.setProperty('--end-copy',copy);
  stage.style.setProperty('--end-blur',((1-copy)*7)+'px');
  stage.style.setProperty('--end-y',((1-copy)*18)+'px');
  stage.style.setProperty('--film-opacity',(1-photo)*(1-ease((p-.88)/.055)));
  stage.style.setProperty('--film-mask',(full*Math.pow(small/full,gather))+'px');
  const fitted=Math.max(small*1.125/stage.clientHeight,small/innerWidth)*1.06;
  frameDrop(gather,small);
  stage.style.setProperty('--film-copy',1-ease((p-.04)/.16));
  stage.style.setProperty('--film-white',0);stage.style.setProperty('--film-cue',1-ease(p/.07));
  root.classList.toggle('film-intro-active',box.bottom>innerHeight*.7&&box.top<innerHeight&&p<.92);
  stage.style.setProperty('--end-exit','1');stage.style.setProperty('--end-exit-y','0px');hubTransition(p);
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(render)}}
 new ResizeObserver(()=>{root.style.setProperty('--film-header',header.offsetHeight+'px');schedule()}).observe(header);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{unpin();schedule()});reduced.addEventListener('change',schedule);render();
})();
