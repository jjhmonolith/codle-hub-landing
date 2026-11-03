(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),hero=document.querySelector('#hero-film'),toggle=document.querySelector('.film-toggle');
 let manuallyPaused=false;
 const sync=()=>{toggle.textContent=hero.paused?'▶':'Ⅱ';toggle.setAttribute('aria-label',hero.paused?'배경 영상 재생':'배경 영상 일시정지');toggle.setAttribute('aria-pressed',String(hero.paused))};
 toggle.addEventListener('click',()=>{manuallyPaused=!hero.paused;hero.paused?hero.play().catch(()=>{}):hero.pause()});hero.addEventListener('play',sync);hero.addEventListener('pause',sync);sync();
 new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting&&!reduced.matches&&!manuallyPaused)hero.play().catch(()=>{});else hero.pause()}),{threshold:.1}).observe(hero);
 const steps=[...document.querySelectorAll('.product-step')],shots=[...document.querySelectorAll('.product-shot')];let active=0,manualUntil=-1;
 function setStep(n){active=n;steps.forEach((el,i)=>{el.classList.toggle('active',i===n);el.querySelector('button').setAttribute('aria-expanded',String(i===n));el.querySelector('button span').textContent=i===n?'−':'＋';el.querySelector('div').hidden=i!==n});shots.forEach((el,i)=>el.classList.toggle('active',i===n))}
 steps.forEach((el,i)=>el.querySelector('button').addEventListener('click',()=>{setStep(i);manualUntil=scrollY}));
 const clamp=v=>Math.max(0,Math.min(1,v)),progress=el=>clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight));
 const intro=document.querySelector('.cinema-chapter'),transfer=document.querySelector('.transfer-chapter'),product=document.querySelector('.product-chapter'),camp=document.querySelector('.camp-chapter'),daily=document.querySelector('.daily-chapter');
 const chapters=[...document.querySelectorAll('[data-chapter]')],links=[...document.querySelectorAll('.chapter-nav a')];let pending=false;
 function render(){pending=false;let current=chapters[0];chapters.forEach(el=>{if(el.getBoundingClientRect().top<innerHeight*.5)current=el});links.forEach(a=>a.setAttribute('aria-current',String(a.hash==='#'+current.id)));
  if(reduced.matches)return;
  const p=progress(intro),expand=clamp(p*4);intro.style.setProperty('--hero-top',(64*(1-expand))+'px');intro.style.setProperty('--hero-side',(16*(1-expand))+'px');intro.style.setProperty('--hero-bottom',(28*(1-expand))+'px');intro.style.setProperty('--hero-radius',(40*(1-expand))+'px');intro.style.setProperty('--hero-copy',1-clamp((p-.6)/.3));intro.style.setProperty('--hero-copy-y',(-30*clamp((p-.6)/.3))+'px');
  transfer.style.setProperty('--transfer-scale',.92+.08*Math.sin(progress(transfer)*Math.PI));
  if(innerWidth>700&&(manualUntil<0||Math.abs(scrollY-manualUntil)>120)){const next=Math.min(2,Math.floor(progress(product)*3));if(next!==active)setStep(next)}
  const cp=progress(camp);camp.style.setProperty('--camp-scale',1.08-.08*cp);camp.style.setProperty('--camp-detail',clamp((cp+.05)*4));camp.style.setProperty('--camp-y',(25*(1-clamp(cp*4)))+'px');
  const dp=clamp((innerHeight-daily.getBoundingClientRect().top)/(daily.offsetHeight+innerHeight));daily.style.setProperty('--mosaic-shift',(-75*dp)+'px');
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(render)}}window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',()=>{if(reduced.matches)hero.pause();render()});render();
 if(!reduced.matches){document.documentElement.classList.add('motion-ready');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
})();
