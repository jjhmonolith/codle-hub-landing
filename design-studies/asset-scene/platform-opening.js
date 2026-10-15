(() => {
 const hero=document.querySelector('.platform-opening');if(!hero)return;
 const pin=hero.querySelector('.platform-pin'),video=hero.querySelector('video'),pause=hero.querySelector('.platform-pause');
 const buttons=[...hero.querySelectorAll('[data-platform-select]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const platforms={codle:{name:'코들',title:'수업을 연결하는<br>AI 교실.',url:'https://codle.io/'},jitda:{name:'짓다',title:'아이디어를<br>현실로 짓다.',url:'https://jitda.io/'}};
 let active='codle',visible=true,paused=reduced.matches,frame=0,mx=0,my=0;
 const clamp=n=>Math.max(0,Math.min(1,n));
 function media(){if(visible&&!document.hidden&&!paused&&!reduced.matches&&active==='codle')video.play().catch(()=>{});else video.pause();}
 function sync(){pause.textContent=video.paused?'▶':'Ⅱ';pause.setAttribute('aria-label',video.paused?'영상 재생':'영상 일시정지');}
 function paint(){
  frame=0;
  const w=pin.clientWidth,h=pin.clientHeight;
  const progress=reduced.matches?0:clamp(-hero.getBoundingClientRect().top/Math.max(1,hero.offsetHeight-h));
  const t=clamp((progress-.025)/.78),e=t*t*(3-2*t);
  const base=active==='codle'?Math.min(w*(w<700?.65:.46),490):Math.min(w*(w<700?.77:.53),560);
  const size=base*Math.pow(Math.hypot(w,h)*5/base,e);
  hero.style.setProperty('--mask-width',`${size}px`);
  hero.style.setProperty('--mask-height',`${size*(active==='codle'?1.125:1)}px`);
  hero.style.setProperty('--mask-y',`${(w<700?37:43)+(50-(w<700?37:43))*e}%`);
  hero.style.setProperty('--chrome',1-clamp(progress/.22));
  hero.style.setProperty('--elapsed',progress);
  hero.style.setProperty('--media-scale',1.14-.10*e);
  hero.style.setProperty('--tint',1-e*.82);
  const depth=clamp(progress/.82),travel=depth*depth*(3-2*depth);
  const centerY=h*((w<700?.37:.43)+(.5-(w<700?.37:.43))*travel);
  const coreW=base*.78+(w*1.05-base*.78)*travel;
  const coreH=base*.56+(h*1.05-base*.56)*travel;
  hero.style.setProperty('--depth-haze',1-travel);
  hero.querySelectorAll('.depth-core').forEach(node=>{
   node.style.width=`${coreW}px`;node.style.height=`${coreH}px`;node.style.top=`${centerY}px`;
   node.style.transform=`translate(calc(-50% + ${mx*10*(1-travel)}px),calc(-50% + ${my*8*(1-travel)}px))`;
  });
  hero.querySelectorAll('.depth-sheet').forEach(node=>{
   const near=node.classList.contains('depth-near'),speed=near?2.8:1.5;
   const dx=(near?.27:-.27)*base*(1+travel*speed*1.6)+mx*(near?30:5);
   const dy=(near?.29:-.31)*base*(1+travel*speed*1.6)+my*(near?22:4);
   node.style.width=`${base*(near?.48:.45)}px`;node.style.height=`${base*(near?.4:.33)}px`;node.style.top=`${centerY}px`;
   node.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${1+travel*speed})`;
   node.style.opacity=1-clamp((progress-(near?.48:.58))/.22);
  });

  const hidden=progress>.22;
  hero.querySelector('.platform-bottom').inert=hidden;
  hero.querySelector('.platform-masthead').inert=hidden;
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
 function select(key){active=key;hero.dataset.platform=key;const data=platforms[key];
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.platformSelect===key)));
  const logo=hero.querySelector('.platform-wordmark');logo.src=`assets/${key==='codle'?'codle':'jitda-logo'}.svg`;logo.alt=data.name;
  hero.querySelector('h1').innerHTML=data.title;const link=hero.querySelector('.platform-visit');link.href=data.url;link.innerHTML=`${data.name} 둘러보기 <span>↗</span>`;
  pause.hidden=key==='jitda';media();paint();
 }
 buttons.forEach(b=>b.addEventListener('click',()=>select(b.dataset.platformSelect)));
 pause.addEventListener('click',()=>{paused=!paused;media();});
 video.addEventListener('play',sync);video.addEventListener('pause',sync);
 hero.addEventListener('pointermove',event=>{if(reduced.matches)return;const r=pin.getBoundingClientRect();mx=(event.clientX-r.left)/r.width-.5;my=(event.clientY-r.top)/r.height-.5;schedule();});
 hero.addEventListener('pointerleave',()=>{mx=0;my=0;schedule();});
 document.addEventListener('visibilitychange',media);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;media();},{threshold:.01}).observe(hero);
 reduced.addEventListener('change',()=>{paused=reduced.matches;media();paint();});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
 paint();media();sync();
})();

