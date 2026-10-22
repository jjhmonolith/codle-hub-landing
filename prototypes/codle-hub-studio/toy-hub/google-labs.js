(() => {
 const hero=document.querySelector('.gl-hero'),slides=[...document.querySelectorAll('[data-slide]')],selectors=[...document.querySelectorAll('[data-select]')],pause=document.querySelector('.gl-pause'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let active=0,progress=0,last=performance.now(),paused=reduced.matches,interacting=false,visible=true;
 function show(index,announce=true){active=(index+slides.length)%slides.length;slides.forEach((s,i)=>s.hidden=i!==active);selectors.forEach((s,i)=>s.setAttribute('aria-pressed',String(i===active)));progress=0;hero.style.setProperty('--progress',0);if(announce)document.querySelector('#gl-status').textContent=slides[active].getAttribute('aria-label')}
 function pauseUI(){pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'자동 전환 재생':'자동 전환 일시정지')}
 selectors.forEach((b,i)=>b.addEventListener('click',()=>show(i)));document.querySelector('[data-prev]').addEventListener('click',()=>show(active-1));document.querySelector('[data-next]').addEventListener('click',()=>show(active+1));pause.addEventListener('click',()=>{paused=!paused;pauseUI()});pauseUI();
 hero.addEventListener('focusin',()=>{interacting=true});hero.addEventListener('focusout',e=>{interacting=hero.contains(e.relatedTarget)});
 new IntersectionObserver(([e])=>visible=e.isIntersecting).observe(hero);
 document.addEventListener('visibilitychange',()=>{last=performance.now()});
 reduced.addEventListener('change',()=>{paused=reduced.matches;pauseUI()});
 function tick(now){const delta=Math.min(now-last,100);last=now;if(!paused&&!interacting&&visible&&!document.hidden){progress+=delta/7000;if(progress>=1)show(active+1,false);hero.style.setProperty('--progress',progress)}requestAnimationFrame(tick)}requestAnimationFrame(tick);
 const cards=[...document.querySelectorAll('[data-card]')],tabs=[...document.querySelectorAll('[data-card-to]')];let current=0;
 function setCard(index){current=(index+cards.length)%cards.length;cards.forEach((card,i)=>{let offset=(i-current+cards.length)%cards.length;if(offset>cards.length/2)offset-=cards.length;card.style.setProperty('--offset',offset);card.style.setProperty('--tilt',offset===0?0:offset<0?-6:6);card.style.setProperty('--visible',Math.abs(offset)>2?0:1);card.inert=Math.abs(offset)>1;card.setAttribute('aria-hidden',String(Math.abs(offset)>1));card.style.zIndex=String(3-Math.abs(offset))});tabs.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)))}
 document.querySelector('[data-card-prev]').addEventListener('click',()=>setCard(current-1));document.querySelector('[data-card-next]').addEventListener('click',()=>setCard(current+1));tabs.forEach((b,i)=>b.addEventListener('click',()=>setCard(i)));setCard(0);
 const gallery=document.querySelector('.gl-gallery');let start;
 gallery.addEventListener('touchstart',e=>{start=e.touches.length===1?[e.touches[0].clientX,e.touches[0].clientY]:null},{passive:true});gallery.addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start[0],dy=e.changedTouches[0].clientY-start[1];if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)setCard(current+(dx<0?1:-1));start=null},{passive:true});gallery.addEventListener('touchcancel',()=>start=null,{passive:true});
})();
new IntersectionObserver(([entry]) => document.querySelector('.gl-header').classList.toggle('on-paper',!entry.isIntersecting),{rootMargin:'-88px 0px 0px 0px'}).observe(document.querySelector('.gl-hero'));
