(() => {
 'use strict';
 const stage=document.getElementById('stage');
 const pieces=[...document.querySelectorAll('[data-pick]')];
 const tabs=[...document.querySelectorAll('[data-tab]')];
 const panels=[...document.querySelectorAll('[role="tabpanel"]')];
 const toggle=document.getElementById('motion-toggle');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduce.matches;
 let inView=true;
 let chosen='platform';
 function syncAmbient(){document.querySelector('.disc-star').style.animationPlayState=paused||document.hidden||!inView?'paused':'running'}
 function motionState(){
  document.body.classList.toggle('paused',paused);
  syncAmbient();
  toggle.setAttribute('aria-pressed',String(paused));
  toggle.innerHTML=paused?'움직임 켜기 <span aria-hidden="true">▷</span>':'움직임 멈추기 <span aria-hidden="true">Ⅱ</span>';
  toggle.disabled=reduce.matches;
  if(reduce.matches)toggle.textContent='기기 설정에 따라 모션 꺼짐';
  if(paused)resetPointer();
 }
 function resetPointer(){pieces.forEach(p=>{p.style.setProperty('--mx','0px');p.style.setProperty('--my','0px')})}
 function select(key,focus=false){
  const tab=tabs.find(t=>t.dataset.tab===key);if(!tab)return;
  chosen=key;
  tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1});
  panels.forEach(p=>p.hidden=p.id!==tab.getAttribute('aria-controls'));
  pieces.forEach(p=>{const selected=p.dataset.pick===key;p.dataset.active=String(selected);p.setAttribute('aria-pressed',String(selected))});
  document.getElementById('selection-status').textContent=tab.textContent.replace(/\s+/g,' ').trim()+' 선택됨';
  if(focus)tab.focus({preventScroll:true});
 }
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>select(tab.dataset.tab));
  tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next===undefined)return;e.preventDefault();select(tabs[next].dataset.tab,true)});
 });
 pieces.forEach(piece=>{
  piece.addEventListener('click',()=>{
   select(piece.dataset.pick);
   if(!paused&&!reduce.matches){const shape=piece.querySelector('.shape');shape.getAnimations().forEach(a=>a.cancel());shape.animate([{scale:'1'},{scale:'.96',offset:.22},{scale:'1.025',offset:.66},{scale:'1'}],{duration:540,easing:'cubic-bezier(.2,.7,.2,1)'})}
   document.getElementById('programs').scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});
  });
 });
 stage.addEventListener('pointermove',e=>{
  if(paused||reduce.matches||e.pointerType!=='mouse')return;
  const r=stage.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;
  pieces.forEach((p,i)=>{p.style.setProperty('--mx',(x*(i%2?7:-7)).toFixed(2)+'px');p.style.setProperty('--my',(y*3).toFixed(2)+'px')});
 });
 stage.addEventListener('pointerleave',resetPointer);
 toggle.addEventListener('click',()=>{paused=!paused;motionState()});
 reduce.addEventListener('change',()=>{paused=reduce.matches;motionState()});
 document.addEventListener('visibilitychange',syncAmbient);
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;syncAmbient()},{threshold:0}).observe(stage);
 motionState();select(chosen);
})();
