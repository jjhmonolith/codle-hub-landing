(() => {
 const film=document.querySelector('#hero-film'),button=document.querySelector('.film-toggle'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let userPaused=false;
 function sync(){button.textContent=film.paused?'▶':'Ⅱ';button.setAttribute('aria-label',film.paused?'배경 영상 재생':'배경 영상 일시정지');button.setAttribute('aria-pressed',String(film.paused));}
 button.addEventListener('click',()=>{if(film.paused){userPaused=false;film.play().catch(sync)}else{userPaused=true;film.pause()}});
 film.addEventListener('play',sync);film.addEventListener('pause',sync);
 new IntersectionObserver(entries=>{const visible=entries[0].isIntersecting;if(visible&&!userPaused&&!reduced.matches)film.play().catch(sync);else film.pause()},{threshold:.1}).observe(film);
 reduced.addEventListener('change',()=>{if(reduced.matches)film.pause()});if(reduced.matches)film.pause();sync();
})();
(() => {
 const section=document.querySelector('.opening-sequence');if(!section)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let pending=false;
 const clamp=v=>Math.max(0,Math.min(1,v));const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
 function render(){pending=false;if(reduced.matches)return;const p=clamp(-section.getBoundingClientRect().top/(section.offsetHeight-innerHeight));const expand=ease(p/.22),fade=ease((p-.36)/.15),next=ease((p-.53)/.19);const set=(n,v)=>section.style.setProperty(n,String(v));set('--opening-top',64*(1-expand)+'px');set('--opening-bottom',28*(1-expand)+'px');set('--opening-inset',16*(1-expand)+'px');set('--opening-radius',40*(1-expand)+'px');set('--title-opacity',1-fade);set('--title-y',-24*fade+'px');set('--film-opacity',1-ease((p-.5)/.18));set('--film-scale',1-.12*ease((p-.5)/.18));set('--next-opacity',next);set('--next-y',45*(1-next)+'px');set('--screen-y',25*(1-next)+'px');set('--next-visibility',next>0?'visible':'hidden');set('--next-pointer',next>.8?'auto':'none');}
 const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(render)}};addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);render();
})();
