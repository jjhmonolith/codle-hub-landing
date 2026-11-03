(() => {
 const root=document.querySelector('.codle-demo');if(!root)return;
 const wrap=document.createElement('div');wrap.className='demo-scroll-track';root.before(wrap);wrap.append(root);
 root.querySelectorAll('[role=tab]').forEach(old=>{const item=document.createElement('div');for(const a of old.attributes)item.setAttribute(a.name,a.value);item.innerHTML=old.innerHTML;old.replaceWith(item)});
 const tabs=[...root.querySelectorAll('[role=tab]')], original=[...root.querySelectorAll('[role=tabpanel]')];
 const showcase=root.querySelector('.demo-showcase'),layers=[];
 // Keep five real captures on a shared stage so scroll can blend adjacent views.
 for(const i of [0,1,3,4]){
  const scene=original[i<3?0:i-2].cloneNode(true);scene.hidden=false;
  if(i<3){scene.querySelectorAll('[data-course-frame]').forEach((img,n)=>{if(n!==i)img.remove();else img.hidden=false});scene.id=i===0?'demo-panel-course':`demo-panel-course-${i}`;}
  scene.dataset.frame=i;layers.push(scene);
 }
 const river=layers[2].cloneNode(true);river.id='demo-panel-river';river.dataset.frame='river';
 river.querySelector('.demo-screen').innerHTML='<img src="assets/codle-story-river-hd.png?v=58" alt="강 건너기 퍼즐에서 농부와 늑대, 양, 양배추를 옮기는 실제 실습 화면" width="3840" height="2160">';
 layers.splice(3,0,river);
 showcase.replaceChildren(...layers);
 const toolScreen=layers[1].querySelector('.demo-screen');toolScreen.classList.add('tool-scroll-screen');
 const toolFrame=document.createElement('iframe');toolFrame.src='assets/codle-tools-scroll.html';toolFrame.title='새 활동 도구 목록';toolFrame.tabIndex=-1;toolScreen.replaceChildren(toolFrame);
 const fitTools=()=>{const scale=Math.min(toolScreen.clientWidth/844,toolScreen.clientHeight/700);toolFrame.style.transform=`translate(${-422*scale}px,${-350*scale}px) scale(${scale})`};
 new ResizeObserver(fitTools).observe(toolScreen);toolFrame.addEventListener('load',()=>{fitTools();schedule()});
 const brand=document.createElement('div');brand.className='demo-brand';brand.innerHTML='<span>수업 플랫폼</span><img src="assets/codle.svg" alt="codle">';root.querySelector('.demo-copy').prepend(brand);
 const detailAction=root.querySelector('.quiet-actions');detailAction.classList.add('codle-detail-action');detailAction.querySelector('button')?.remove();detailAction.remove();tabs.forEach(tab=>{const action=detailAction.cloneNode(true);action.classList.remove('codle-detail-action');action.classList.add('feature-detail-action');tab.append(action)});
 const words=tabs.map(tab=>{
  const heading=tab.querySelector('strong');const text=heading.textContent;heading.setAttribute('aria-label',text);heading.textContent='';
  text.split(/(\s+)/).forEach(word=>{if(/^\s+$/.test(word))heading.append(document.createTextNode(word));else{const span=document.createElement('span');span.className='demo-word';span.textContent=word;span.setAttribute('aria-hidden','true');heading.append(span)}});
  return [...heading.querySelectorAll('.demo-word')];
 });
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n)};let queued=false,displayPosition=null,lastTime=0;
 function render(now=performance.now()){
  queued=false;const top=innerWidth<=900?70:90,box=wrap.getBoundingClientRect(),travel=Math.max(1,wrap.offsetHeight-root.offsetHeight);
  const target=Math.max(0,Math.min(6.69999,(top-box.top)/travel*6.7));
  const dt=Math.min(34,Math.max(1,now-lastTime||16.67));lastTime=now;
  if(displayPosition===null||reduced.matches||box.bottom<top||box.top>innerHeight)displayPosition=target;
  else displayPosition+=(target-displayPosition)*(1-Math.exp(-dt/65));
  if(Math.abs(target-displayPosition)<.0005)displayPosition=target;
  const intro=ease((displayPosition-.22)/.48);
  const entry=ease(displayPosition/.22);
  brand.style.opacity=entry;brand.style.transform=`translate3d(0,${(1-entry)*18}px,0)`;
  [...brand.children].forEach((part,i)=>{const f=reduced.matches?1:ease((entry-i*.12)/.88);part.style.filter=`blur(${(1-f)*5}px)`;part.style.opacity=f;part.style.transform=`translateY(${(1-f)*8}px)`});
  root.querySelector('.demo-tabs').style.opacity=intro;
  showcase.style.opacity=intro;
  detailAction.style.opacity=intro;detailAction.inert=intro<.1;
  const p=Math.max(0,displayPosition-.7),stage=Math.floor(p),blend=stage<5?ease((p-stage-.42)/.58):0;
  const selected=stage<3?0:stage<5?1:2;
  const visualStage=stage<2?stage:stage-1,visualBlend=stage===1?0:blend;
  const toolList=toolFrame.contentDocument?.querySelector(".css-b0rdla")?.parentElement;
  if(toolList)toolList.scrollTop=ease((p-1.12)/1.28)*(toolList.scrollHeight-toolList.clientHeight);
  layers.forEach((layer,n)=>{
   let opacity=n===visualStage?1-visualBlend:n===visualStage+1?visualBlend:0;
   if(reduced.matches)opacity=n===visualStage?1:0;
   const y=reduced.matches?0:n===visualStage?-28*visualBlend:44*(1-visualBlend);
   layer.style.opacity=opacity;layer.style.transform=`translate3d(0,${y}px,0)`;layer.style.visibility=opacity>0?'visible':'hidden';
   layer.setAttribute('aria-hidden',String(n!==visualStage));layer.inert=n!==visualStage;
  });
  const copyPosition=p<2.42?0:p<3?ease((p-2.42)/.58):p<4.42?1:p<5?1+ease((p-4.42)/.58):2;
  tabs.forEach((tab,n)=>{
   const relative=n-copyPosition,active=n===selected;
   tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
   tab.style.setProperty('--copy-y',`${relative*32}px`);
   tab.style.setProperty('--copy-opacity',String(clamp(1-Math.abs(relative)*2)));
   tab.style.visibility=Math.abs(relative)<1?'visible':'hidden';tab.inert=Math.abs(relative)>.5;
   const start=[0,3,5][n];const reveal=reduced.matches?1:clamp((p-start+.24)/.48);
   words[n].forEach((word,j)=>{const f=ease(reveal*1.5-j/Math.max(1,words[n].length)*.45);word.style.filter=`blur(${(1-f)*4}px)`;word.style.opacity=.2+.8*f;word.style.transform=`translateY(${(1-f)*6}px)`});
  });
  if(displayPosition!==target)schedule();
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(render)}}
 function jump(i){const top=innerWidth<=900?70:90;window.scrollTo({top:scrollY+wrap.getBoundingClientRect().top-top+(wrap.offsetHeight-root.offsetHeight)*([0,3,5][i]+.96)/6.7,behavior:reduced.matches?'instant':'smooth'})}
 tabs.forEach((t,i)=>{t.onclick=e=>{if(!e.target.closest('a'))jump(i)};t.onkeydown=e=>{const n=e.key==='ArrowDown'?(i+1)%3:e.key==='ArrowUp'?(i+2)%3:e.key==='Home'?0:e.key==='End'?2:null;if(n!==null){e.preventDefault();jump(n);tabs[n].focus({preventScroll:true})}}});
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);
 // Decode the upcoming stills before the user reaches their transition.
 root.querySelectorAll('.demo-showcase img').forEach(img=>{if(img.decode)img.decode().catch(()=>{});});
 render();
})();
