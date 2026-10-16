(()=>{
 const panels=[...document.querySelectorAll('.panel')],main=document.querySelector('main');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let active=null,returnFocus=null;
 const destinations=['https://ai.codle.io/kr','https://ai.codle.io/kr/contents','https://exhibition.codle.io/','https://contents.codle.io/aicamp-landing','https://landing.jitda.io/'];
 const posters=["actual-platform.jpg","actual-contents.jpg","actual-textbook.jpg","actual-camp.jpg","actual-hack.jpg"];
 const shells=panels.map((panel,i)=>{
  const title=panel.querySelector('h2').textContent;panel.href=destinations[i];panel.setAttribute('aria-label',title+' 랜딩 열기');
  const shell=document.createElement('section');shell.className='landing-shell';shell.dataset.panel=i;shell.dataset.caption=String(i+1).padStart(2,"0")+" / "+title;shell.setAttribute('aria-label',title);
  shell.innerHTML='<div class="landing-toolbar"><span></span><a target="_blank" rel="noopener noreferrer">새 탭에서 열기 ↗</a><button type="button" class="landing-close" aria-label="미리보기 닫기">닫기 ×</button></div><div class="landing-viewport"><div class="landing-loading">첫 화면 불러오는 중…</div><iframe loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe></div><button type="button" class="landing-trigger"></button>';
  shell.querySelector('.landing-toolbar span').textContent=title;
  shell.querySelector('.landing-toolbar a').href=destinations[i];
  if(i===2){const extra=document.createElement('a');extra.href='https://cmass-contents.codle.io/cmass-ai-basics/web-exhibition';extra.target='_blank';extra.rel='noopener noreferrer';extra.textContent='씨마스 자료 ↗';shell.querySelector('.landing-toolbar').insertBefore(extra,shell.querySelector('.landing-close'));} const trigger=shell.querySelector('.landing-trigger');trigger.textContent=title+' ↗';trigger.setAttribute('aria-label',title+' 랜딩 확대');
  const iframe=shell.querySelector('iframe');iframe.title=title+' 실제 랜딩';iframe.tabIndex=-1;iframe.setAttribute('aria-hidden','true');iframe.inert=true;
  iframe.addEventListener('load',()=>{shell.classList.add('loaded');});
  const poster=document.createElement("div");poster.className="landing-poster";const picture=document.createElement("img");picture.src=posters[i];picture.alt="";poster.append(picture);shell.append(poster);document.body.append(shell);iframe.src=destinations[i];
  trigger.addEventListener('click',()=>open(i,trigger));shell.querySelector('.landing-close').addEventListener('click',close);
  panel.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();open(i,panel);});
  return {shell,iframe,panel};
 });
 function fit(item){const viewport=item.shell.querySelector('.landing-viewport');const width=viewport.clientWidth;const base=active===item&&innerWidth<700?innerWidth:1440;const scale=width/base;item.iframe.style.width=base+'px';item.iframe.style.height=Math.max(900,viewport.clientHeight/Math.max(scale,.01))+'px';item.iframe.style.transform='scale('+scale+')';}
 function sync(){shells.forEach(item=>{if(item===active)return;const r=item.panel.getBoundingClientRect();const reveal=Number(item.panel.dataset.reveal||0);Object.assign(item.shell.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',opacity:String(reveal)});item.shell.style.setProperty('--reveal',reveal);item.shell.hidden=reveal<.005||r.bottom<=0||r.top>=innerHeight;item.shell.inert=Boolean(active)||reveal<.95;fit(item);});}
 const observer=new ResizeObserver(entries=>entries.forEach(entry=>{const item=shells.find(s=>s.shell===entry.target);if(item)fit(item);}));shells.forEach(i=>observer.observe(i.shell));
 function open(i,trigger){if(active)return;active=shells[i];const from=active.shell.getBoundingClientRect();document.body.classList.add("has-landing");returnFocus=trigger;main.inert=true;document.body.style.overflow='hidden';shells.forEach(s=>{if(s!==active)s.shell.inert=true;});const {shell,iframe}=active;shell.hidden=false;shell.classList.add('expanded');Object.assign(shell.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});shell.setAttribute('role','dialog');shell.setAttribute('aria-modal','true');iframe.inert=false;iframe.removeAttribute('aria-hidden');iframe.removeAttribute('tabindex');requestAnimationFrame(()=>{Object.assign(shell.style,{left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px'});fit(active);shell.querySelector('.landing-close').focus();});}
 function close(){if(!active)return;const item=active;active=null;document.body.classList.remove("has-landing");item.shell.classList.remove('expanded');item.shell.removeAttribute('role');item.shell.removeAttribute('aria-modal');item.iframe.inert=true;item.iframe.tabIndex=-1;item.iframe.setAttribute('aria-hidden','true');main.inert=false;document.body.style.overflow='';sync();returnFocus?.focus({preventScroll:true});}
 addEventListener('keydown',e=>{if(e.key==='Escape')close();});
 let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync();});}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{if(active){active.shell.style.width=innerWidth+'px';active.shell.style.height=innerHeight+'px';fit(active);}schedule();});
 // Synchronize after each scroll-sequence paint, including reverse scrolling.
 addEventListener('hub:frame',sync);
 sync();
})();






