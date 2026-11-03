(() => {
 const section=document.querySelector('.scroll-intro');if(!section)return;
 const stage=section.querySelector('.scroll-intro-stage');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const root=document.documentElement,header=document.querySelector('.hub-header');
 const background=[header,document.querySelector('main'),document.querySelector('#inquiry-dialog'),document.querySelector('.floating-inquiry')].filter(Boolean);
 const inertBefore=background.map(el=>el.inert);
 background.forEach(el=>el.inert=true);
 let progress=0,started=null,done=false,frame;
 function finish(skip=false){
  if(done)return;done=true;cancelAnimationFrame(frame);
  root.classList.remove('intro-playing');root.classList.add('intro-finished');
  background.forEach((el,i)=>el.inert=inertBefore[i]);
  root.style.setProperty('--header-brand-opacity','1');
  // Skipping the intro opens the landing at its beginning, not an old anchor.
  if(skip && location.hash)history.replaceState(history.state,'',location.pathname+location.search);
  const destination=!skip && location.hash && location.hash!=='#top' ? document.getElementById(location.hash.slice(1)) : null;
  const align=()=>{
   if(destination)destination.scrollIntoView({behavior:'instant'});
   else window.scrollTo({top:0,left:0,behavior:'instant'});
  };
  window.dispatchEvent(new Event('resize'));
  align();
  requestAnimationFrame(align);
 }
 section.querySelector('.intro-scroll-cue').addEventListener('click',event=>{event.preventDefault();event.stopPropagation();finish(true)});
 const clamp=v=>Math.max(0,Math.min(1,v));
 const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
 const phase=(p,a,b)=>ease((p-a)/(b-a));
 const mix=(a,b,t)=>a+(b-a)*t;
 function render(){
  const w=stage.clientWidth,h=stage.clientHeight;
  const p=progress;
  const gather=phase(p,.06,.3),shrink=phase(p,.62,.78),travel=phase(p,.84,.97);
  const full=Math.max(w,h)*4,drop=Math.min(w*.3,h*.62),logoW=Math.min(320,w*.65);
  const brand=document.querySelector('.hub-brand img').getBoundingClientRect();
  const lw=mix(logoW,brand.width,travel);
  const lx=mix(w/2,brand.left+brand.width/2,travel),ly=mix(h/2,brand.top+brand.height/2,travel);
  const mw=mix(full*Math.pow(drop/full,gather),logoW*160/774.61,shrink);
  // CSS pixel mask position uses the top-left of the SVG viewBox.
  const mx=mix((w-mw)/2,w/2-logoW/2+173/774.61*logoW,shrink);
  const my=mix((h-mw*180/160)/2,h/2-logoW*304.29/774.61/2+132/774.61*logoW,shrink);
  const set=(k,v)=>stage.style.setProperty(k,String(v));
  set('--mask-width',mw+'px');set('--mask-x',mx+'px');set('--mask-y',my+'px');
  set('--first-opacity',1-phase(p,.03,.16));set('--cue-opacity',1-phase(p,0,.1));set('--shade',.3*(1-gather));
  set('--second-opacity',phase(p,.34,.43)*(1-phase(p,.77,.8)));
  set('--new-opacity',phase(p,.44,.5)*(1-phase(p,.56,.63)));
  set('--blue-opacity',phase(p,.64,.73)*(1-phase(p,.78,.81)));
  section.querySelector('.scroll-intro-image').style.opacity=1-phase(p,.77,.81);
  set('--logo-opacity',phase(p,.74,.81)*(1-phase(p,.97,.99)));
  set('--logo-width',lw+'px');set('--logo-x',lx+'px');set('--logo-y',ly+'px');
  document.documentElement.style.setProperty('--header-brand-opacity',phase(p,.97,.99));
 }
 function tick(now){
  if(done)return;
  if(started===null)started=now;
  progress=clamp((now-started-1000)/11000);render();
  if(progress>=1)finish();else frame=requestAnimationFrame(tick);
 }
 window.addEventListener('resize',()=>{if(!done)render()});
 reduced.addEventListener('change',()=>{if(reduced.matches)finish()});
 if(reduced.matches)finish();else {render();frame=requestAnimationFrame(tick)}
})();
