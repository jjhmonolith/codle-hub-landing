// A visual editorial handoff, not a claimed Codle-to-Jitda import capability.
// The example app is one persistent DOM node across the entire shot.
const $=id=>document.getElementById(id);
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const nodes=Object.fromEntries(['codle-ui','jitda-ui','workspace','result-position','result-scale','cursor','run','prompt','response'].map(id=>[id,$(id)]));
const tasks=[...document.querySelectorAll('.task')], beats=[...document.querySelectorAll('[data-time]')];
let time=0,paused=reduce.matches,visible=true,last=0,frame=0,mobile=false,ready=false;
const clamp=v=>Math.max(0,Math.min(1,v));
const out=v=>1-Math.pow(1-clamp(v),4);
const smooth=v=>{const p=clamp(v);return p<.5?8*p**4:1-(-2*p+2)**4/2;};
const lerp=(a,b,p)=>a+(b-a)*p;
function xy(id,x,y,alpha=1){nodes[id].style.transform=`translate3d(${x}px,${y}px,0)`;nodes[id].style.opacity=alpha;}
function render(t){
  const enter=smooth((t-.8)/.76),land=out((t-1.57)/.72);
  let x=lerp(854,358,enter),y=lerp(177,67,enter),s=lerp(1,1.35,enter);
  x=lerp(x,632,land);y=lerp(y,135,land);s=lerp(s,1.24,land);
  // On narrow screens the camera follows the same anchor, not a cropped title.
  const cameraX=mobile?lerp(-450,-465,land):0;
  $('board').style.marginLeft=`${cameraX*(Number($('stage').dataset.scale)||1)}px`;
  xy('result-position',x,y);nodes['result-scale'].style.transform=`scale(${s})`;
  xy('codle-ui',-290*enter,0,1-clamp((t-1.08)/.31));
  xy('jitda-ui',-100*(1-land),0,clamp((t-1.64)/.32));
  xy('prompt',-34*(1-out((t-1.88)/.48)),0,clamp((t-1.88)/.15));
  xy('response',0,22*(1-out((t-2.12)/.43)),clamp((t-2.12)/.17));
  tasks.forEach((task,index)=>{const p=out((t-.43-index*.07)/.34);task.style.transform=`translateY(${15*(1-p)}px)`;task.style.opacity=String(p);});
  const travel=out(t/.38);xy('cursor',lerp(731,767,travel),lerp(556,641,travel),1-clamp((t-.73)/.13));
  const press=clamp((t-.34)/.07)-clamp((t-.43)/.1);nodes.run.style.transform=`scale(${1-press*.08})`;
  $('code-highlight').style.background=`rgba(46,110,246,${.045*(clamp((t-.37)/.1)-clamp((t-.85)/.15))})`;
  $('scrub').value=String(Math.min(t,3));$('scrub').setAttribute('aria-valuetext',`${Math.min(t,3).toFixed(2)}초`);
  $('timecode').textContent=`${Math.min(t,3).toFixed(2)} / 3.00`;
  const beat=t<.95?0:t<1.95?1:2;beats.forEach((button,index)=>button.setAttribute('aria-pressed',String(beat===index)));
  $('stage').dataset.time=Math.min(t,3).toFixed(2);
}
function tick(now){frame=0;if(paused||!visible||document.hidden||!ready){last=0;return;}time+=Math.min((now-(last||now))/1000,.06);last=now;if(time>4.5)time=0;render(Math.min(time,3));frame=requestAnimationFrame(tick);}
function wake(){if(!frame&&!paused&&visible&&!document.hidden&&ready)frame=requestAnimationFrame(tick);}
function pause(value){paused=value;last=0;$('pause').textContent=value?'▷':'Ⅱ';$('pause').setAttribute('aria-label',value?'모션 재생':'모션 일시정지');$('pause').setAttribute('aria-pressed',String(value));if(value){cancelAnimationFrame(frame);frame=0;}else wake();}
function resize(){mobile=matchMedia('(max-width:640px)').matches;const scale=$('stage').clientWidth/(mobile?880:1440);$('stage').dataset.scale=String(scale);$('board').style.transform=`scale(${scale})`;$('stage').style.height=`${670*scale}px`;render(Math.min(time,3));}
new ResizeObserver(resize).observe($('stage'));
$('pause').addEventListener('click',()=>pause(!paused));
$('replay').addEventListener('click',()=>{time=0;render(0);pause(false);});
$('scrub').addEventListener('input',e=>{pause(true);time=Number(e.target.value);render(time);});
beats.forEach(button=>button.addEventListener('click',()=>{pause(true);time=Number(button.dataset.time);render(time);}));
reduce.addEventListener('change',()=>{if(reduce.matches){pause(true);time=3;render(time);}});
new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;last=0;}else wake();}).observe($('stage'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else wake();});
Promise.all([document.fonts.ready,...[...document.images].map(img=>img.decode().catch(()=>{}))]).then(()=>{ready=true;$('stage').dataset.ready='true';if(reduce.matches)time=3;resize();pause(paused);});
