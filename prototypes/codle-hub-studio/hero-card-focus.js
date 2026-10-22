import {sample} from './hero-card-focus-motion.mjs';
const $=id=>document.getElementById(id),D=5;
const buttons=[...document.querySelectorAll('[data-time]')];
function render(t){
 const p=sample(t);
 $('world').style.transform=`translate3d(${p.x}px,${p.y}px,${p.z}px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg) scale(${p.scale})`;
 $('course').style.transform=`translateZ(${-p.lift*110}px)`;
 $('course').style.opacity=1-p.lift*.94;
 $('card').style.transform=`translate3d(${p.cx}px,${p.cy}px,${p.lift*95}px) rotateZ(${p.cr}deg) scale(${p.cs})`;
 // One persistent card; inverse scaling keeps its pixels and text undistorted.
 const sy=p.height/540;
 $('card-mask').style.transform=`scaleY(${sy})`;
 document.querySelector('.card-surface').style.transform=`scaleY(${1/sy})`;
 $('card-mask').style.boxShadow=`0 ${p.lift*22}px ${p.lift*60}px #20385626`;
 $('card-header').style.opacity=p.open;
 $('card-original').style.opacity=1-p.open;
 $('lesson').style.opacity=p.open;
 $('lesson').style.transform=`translateY(${(1-p.open)*30}px)`;
 $('seek').value=t.toFixed(2);$('time').textContent=`${t.toFixed(1)} / 5.0`;
 buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===(t<1?0:t<2.8?1:2))));
}
const visual=$('visual');
const resize=()=>$('fit').style.setProperty('--fit',Math.min(visual.clientWidth/800,visual.clientHeight/650));
new ResizeObserver(resize).observe(visual);resize();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const q=new URLSearchParams(location.search).get('t');
let t=q===null?0:Math.max(0,Math.min(5,Number(q)||0)),paused=q!==null||reduced.matches,last=0,visible=true;
function pause(value){paused=value;last=0;$('play').textContent=paused?'▶':'Ⅱ';$('play').setAttribute('aria-label',paused?'재생':'일시정지');}
$('play').addEventListener('click',()=>{if(t===D)t=0;pause(!paused);});
$('replay').addEventListener('click',()=>{t=0;render(t);pause(false);});
$('seek').addEventListener('input',e=>{t=Number(e.target.value);pause(true);render(t);});
buttons.forEach(b=>b.addEventListener('click',()=>{t=Number(b.dataset.time);pause(true);render(t);}));
document.addEventListener('visibilitychange',()=>last=0);
new IntersectionObserver(e=>{visible=e[0].isIntersecting;last=0;}).observe(visual);
reduced.addEventListener('change',()=>{if(reduced.matches)pause(true);});
render(t);pause(paused);
await Promise.all(['assets/hero-sequence/course.jpg','assets/hero-sequence/python.jpg'].map(src=>{const img=new Image();img.src=src;return img.decode().catch(()=>{});}));
await document.fonts.ready;
function tick(now){if(!paused&&visible&&!document.hidden){if(last)t=Math.min(D,t+Math.min(.05,(now-last)/1000));render(t);if(t===D)pause(true);}last=now;requestAnimationFrame(tick);}requestAnimationFrame(tick);
