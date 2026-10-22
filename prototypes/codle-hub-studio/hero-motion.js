/* A deterministic 12-second DOM motion loop. Asset-based web hero, no video
 * render, generated imagery, third-party runtime, or product simulation.
 * Every transform is derived from a single playhead; scrubbing works both ways.
 */
const $ = id => document.getElementById(id);
const film = $('film'), art = $('artboard');
const DURATION = 12;
const chapters = [0, 3.15, 6.25, 9.5];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const sceneButtons = [...document.querySelectorAll('[data-scene]')];
const ids = ['scene-class','scene-build','scene-camp','scene-end','class-word','class-sub','course-screen','python-screen','class-note','build-word','build-sub','build-photo','build-sticker','camp-word','camp-sub','camp-photo','camp-strip','end-line1','end-line2','end-brands','end-tags'];
const elements = Object.fromEntries(ids.map(id => [id, $(id)]));
let time = .65, paused = reduced.matches, visible = true, ready = false, last = 0, raf = 0, active = -1;
const clamp = n => Math.max(0, Math.min(1, n));
const out = n => 1 - Math.pow(1 - clamp(n), 4);
const inout = n => { const x=clamp(n); return x < .5 ? 8*x*x*x*x : 1-Math.pow(-2*x+2,4)/2; };
const tween = (t,start,duration,from,to,ease=out) => from+(to-from)*ease((t-start)/duration);
function pose(id, x=0, y=0, scale=1, rotation=0, opacity=1) {
  const element=elements[id];
  element.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale}) rotate(${rotation}deg)`;
  element.style.opacity=opacity;
}
function renderAt(value) {
  const t=Math.min(DURATION-.001,Math.max(0,value));
  // Incoming scenes push through in the same direction. Each lasts ~3 seconds:
  // quick arrival, stable reading beat, purposeful exit; no idle card bobbing.
  pose('scene-class',tween(t,2.98,.68,0,-250,inout));
  pose('scene-build',tween(t,2.98,.68,1400,0,inout)+tween(t,6.08,.68,0,-250,inout));
  pose('scene-camp',tween(t,6.08,.68,1400,0,inout)+tween(t,9.33,.68,0,-250,inout));
  pose('scene-end',tween(t,9.33,.68,1400,0,inout)+tween(t,11.5,.5,0,-1400,inout));
  const a=t>11.5||t<.65?.65:t;
  if(t>11.5){pose('scene-class');pose('scene-build',-1600);pose('scene-camp',-1600);}
  pose('class-word',0,tween(a,.02,.6,130,0));
  pose('class-sub',0,tween(a,.17,.6,85,0),1,0,a>=.17?1:0);
  pose('course-screen',tween(a,.1,.8,330,0),tween(a,.1,.8,-100,0),.98,tween(a,.1,.8,12,7));
  const zoom=tween(a,1.48,.72,1,1.095);
  pose('python-screen',tween(a,.12,.85,730,0)-tween(a,1.48,.72,0,32),tween(a,.12,.85,65,0),zoom,tween(a,.12,.85,8,-3));
  pose('class-note',tween(a,.82,.55,180,0),tween(a,.82,.55,45,0),1,-3,a>=.82?1:0);
  const b=t-3.15;
  pose('build-word',0,tween(b,.08,.6,140,0));
  pose('build-sub',0,tween(b,.2,.6,90,0),1,0,b>=.2?1:0);
  pose('build-photo',tween(b,.1,.8,460,0),tween(b,.1,.8,30,0),tween(b,1.5,.85,1,1.045),tween(b,.1,.8,8,-3));
  pose('build-sticker',tween(b,.83,.58,240,0),tween(b,.83,.58,25,0),1,-5,b>=.83?1:0);
  const c=t-6.25;
  pose('camp-word',0,tween(c,.1,.6,140,0));
  pose('camp-sub',0,tween(c,.25,.6,80,0),1,0,c>=.25?1:0);
  pose('camp-photo',tween(c,.1,.84,460,0),tween(c,.1,.84,100,0),tween(c,1.5,.9,1,1.04),tween(c,.1,.84,7,-2));
  pose('camp-strip',tween(c,.8,.6,300,0),0,1,-3,c>=.8?1:0);
  const d=t-9.5;
  pose('end-line1',0,tween(d,.05,.6,180,0),1,0,d>=.05?1:0);
  pose('end-line2',0,tween(d,.17,.6,180,0),1,0,d>=.17?1:0);
  pose('end-brands',tween(d,.28,.65,500,0),0,1,-5,d>=.28?1:0);
  pose('end-tags',0,tween(d,.45,.6,70,0),1,0,d>=.45?1:0);
  const current=t<3.15?0:t<6.25?1:t<9.5?2:3;
  if(current!==active){active=current;sceneButtons.forEach((button,index)=>button.setAttribute('aria-pressed',String(index===current)));film.dataset.scene=String(current);}
  $('progress').style.transform=`scaleX(${t/DURATION})`;
  $('seek').value=String(t);
  $('seek').setAttribute('aria-valuetext',`${t.toFixed(1)}초, ${['수업','해커톤','캠프','함께'][current]} 장면`);
  $('time').textContent=`00:${String(Math.floor(t)).padStart(2,'0')} / 00:12`;
  film.dataset.time=t.toFixed(2);
}
function tick(now){
  raf=0;
  if(paused||!visible||document.hidden||!ready){last=0;return;}
  const dt=Math.min((now-(last||now))/1000,.08);last=now;
  time=(time+dt)%DURATION;renderAt(time);raf=requestAnimationFrame(tick);
}
function wake(){if(!raf&&!paused&&visible&&!document.hidden&&ready)raf=requestAnimationFrame(tick);}
function setPaused(value){paused=value;last=0;$('pause').textContent=paused?'▷':'Ⅱ';$('pause').setAttribute('aria-pressed',String(paused));$('pause').setAttribute('aria-label',paused?'모션 재생':'자동 재생 일시정지');if(paused){cancelAnimationFrame(raf);raf=0;}else wake();}
function resize(){const width=film.clientWidth;const mobile=matchMedia('(max-width: 540px)').matches;const scale=mobile?width/870:width/1400;art.style.transform=`scale(${scale})`;film.style.height=mobile?`${900*scale}px`:'';renderAt(time);}
new ResizeObserver(resize).observe(film);
$('pause').addEventListener('click',()=>setPaused(!paused));
$('replay').addEventListener('click',()=>{time=reduced.matches?1.2:0;renderAt(time);setPaused(reduced.matches);});
sceneButtons.forEach((button,index)=>button.addEventListener('click',()=>{time=chapters[index]+1.2;renderAt(time);setPaused(true);}));
$('seek').addEventListener('input',e=>{setPaused(true);time=Number(e.target.value);renderAt(time);});
reduced.addEventListener('change',()=>{if(reduced.matches){time=chapters[Math.max(active,0)]+1.2;renderAt(time);setPaused(true);}});
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){cancelAnimationFrame(raf);raf=0;last=0;}else wake();}).observe(film);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else wake();});
async function start(){
  const imgs=[...film.querySelectorAll('img')];
  const results=await Promise.allSettled(imgs.map(img=>img.decode()));
  if(results.some(result=>result.status==='rejected')){$('loading').textContent='일부 이미지를 불러오지 못했어요. 페이지를 새로고침해 주세요.';return;}
  await document.fonts.ready;ready=true;film.dataset.ready='true';$('loading').hidden=true;resize();setPaused(paused);wake();
}
start();
