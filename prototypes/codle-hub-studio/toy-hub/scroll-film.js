(() => {
 const section=document.querySelector('.opening-sequence'),film=document.querySelector('#hero-film');
 if(!section||!film)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=v=>Math.max(0,Math.min(1,v));
 const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
 let pending=false,target=0,progress=null,lastTick=0;
 film.pause();
 function seek(){
  if(reduced.matches||film.readyState<2||film.seeking||!Number.isFinite(film.duration))return;
  // Quantize to actual source frames; never queue seeks while decoding.
  const frame=Math.round(target*Math.max(0,film.duration-1/24)*24);
  const time=frame/24;
  if(Math.abs(film.currentTime-time)>1/48)film.currentTime=time;
 }
 function render(now){
  pending=false;
  const requested=clamp(-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-innerHeight));
  const dt=Math.min(64,lastTick?now-lastTick:16.67);lastTick=now;
  // A short, time-based catch-up avoids wheel-event jumps on any refresh rate.
  if(progress===null||reduced.matches)progress=requested;
  else progress+=(requested-progress)*(1-Math.exp(-dt/140));
  const moving=Math.abs(requested-progress)>.00015;
  if(!moving)progress=requested;
  const p=progress;
  target=reduced.matches?0:clamp((p-.08)/.72);seek();
  const fade=ease((p-.04)/.15),next=ease((p-.84)/.14);
  const set=(n,v)=>section.style.setProperty(n,String(v));
  set('--title-opacity',1-fade);set('--title-y',-24*fade+'px');
  set('--film-opacity',1-next);set('--film-scale',1);
  set('--next-opacity',next);set('--next-y',24*(1-next)+'px');
  set('--screen-y',15*(1-next)+'px');set('--next-visibility',next>0?'visible':'hidden');
  set('--next-pointer',next>.8?'auto':'none');
  section.querySelector('.opening-next').inert=!reduced.matches&&next<.8;
  if(moving&&!reduced.matches)schedule();
 }
 const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(render)}};
 film.addEventListener('seeked',schedule);film.addEventListener('loadeddata',schedule);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
 reduced.addEventListener('change',()=>{film.pause();schedule()});
 // Blob playback also supports backward seeking on preview servers without ranges.
 async function load(){
  if(reduced.matches)return;
  try{
   const response=await fetch(film.dataset.src);if(!response.ok)throw new Error('Video unavailable');
   film.src=URL.createObjectURL(await response.blob());film.load();
  }catch{section.classList.add('film-unavailable')}
 }
 reduced.addEventListener('change',()=>{if(!reduced.matches&&!film.src)load()});
 load();schedule();
})();
