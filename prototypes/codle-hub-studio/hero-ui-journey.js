const $ = id => document.getElementById(id);
const duration = 18.5;
const clamp = v => Math.max(0, Math.min(1, v));
const ease = v => { v = clamp(v); return v < .5 ? 4*v*v*v : 1-Math.pow(-2*v+2,3)/2; };
const phase = (t,a,b) => ease((t-a)/(b-a));
const mix = (a,b,p) => a+(b-a)*p;
const fade = (t,a,b,c,d) => phase(t,a,b)*(1-phase(t,c,d));
const style = (id,opacity,transform) => { const el=$(id); el.style.opacity=clamp(opacity); if(transform)el.style.transform=transform; };
const move = (x,y,s=1,r=0) => `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
const initial = [[1056,100],[1354,111],[1326,288],[1025,263]].map(([x,y])=>[x*.65-330,y*.65+60]);
const expanded = [[80,140],[750,140],[750,571.56],[80,571.56]];
function project(points,w,h){
  const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=points;
  const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3;
  const dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
  const det=dx1*dy2-dx2*dy1;
  const g=(dx3*dy2-dx2*dy3)/det,k=(dx1*dy3-dx3*dy1)/det;
  return [(x1-x0+g*x1)/w,(y1-y0+g*y1)/w,0,g/w,(x3-x0+k*x3)/h,(y3-y0+k*y3)/h,0,k/h,0,0,1,0,x0,y0,0,1];
}
const drinks=[...document.querySelectorAll('.drink-grid article')];
const chapters=[...document.querySelectorAll('[data-time]')];
let lastBrand='';
function render(t){
  const enter=phase(t,1.2,3.1),reset=phase(t,17.2,18.5);
  const deskOpacity=(1-phase(t,1.6,2.7))+reset;
  style('desk-layer',deskOpacity,`scale(${mix(1,1.8,enter)*(1-reset)+reset})`);
  const corners=initial.map((point,i)=>point.map((v,j)=>mix(v,expanded[i][j],enter*(1-reset))));
  const courseOpacity=(1-phase(t,4.2,5.15))+reset;
  style('course-window',courseOpacity,`matrix3d(${project(corners,1000,644.12).join(',')})`);
  const field=fade(t,4.4,5,9.3,9.85),select=phase(t,7.3,8.35),dive=phase(t,8.35,9.75);
  style('activity-field',field);
  [['python-card',130,160,-5,0],['ai-card',355,290,4,.15],['board-card',135,425,-3,.3]].forEach(([id,x,y,r,delay],i)=>{
    const reveal=phase(t,4.45+delay,5.65+delay);
    let px=mix(245,x,reveal),py=mix(280,y,reveal),scale=mix(.65,1,reveal),rotation=r*reveal;
    let opacity=reveal;
    if(i===2){px=mix(px,240,select);py=mix(py,258,select);rotation*=1-select;scale=mix(scale,24,dive);px-=60*dive;}
    else{opacity*=1-phase(t,7.5,8.25);scale*=mix(1,.75,select);rotation+=r*select*3;}
    style(id,opacity,move(px,py,scale,rotation));
  });
  style('selection-ring',fade(t,7.45,8.15,8.35,8.65),move(232,250));
  const studioIn=phase(t,9.55,10.65),pull=phase(t,13.7,15.4);
  style('jitda-window',studioIn*(1-phase(t,14,15.2)),`scale(${mix(.83,1,studioIn)+pull*.24}) rotate(${mix(3,0,studioIn)}deg)`);
  style('request',phase(t,10.3,11.05),move(0,mix(16,0,phase(t,10.3,11.05))));
  style('response',phase(t,11.1,11.85),move(0,mix(14,0,phase(t,11.1,11.85))));
  const resultIn=phase(t,11.4,12.1);
  style('result-panel',resultIn*(1-reset),move(mix(341,90,pull),mix(247,145,pull),mix(.665,1,pull)));
  drinks.forEach((el,i)=>{const p=phase(t,11.55+i*.3,12.2+i*.3);el.style.opacity=p;el.style.transform=move(0,18*(1-p),mix(.96,1,p));});
  const brand=t<9.55?'codle':'jitda';
  if(brand!==lastBrand){$('scene-logo').src=brand==='codle'?'assets/codle.svg':'assets/jitda-logo.svg';lastBrand=brand;}
  $('scene-line').textContent=t<4.4?'수업에서 시작된 가능성.':t<9.55?'배우고, 생각하고, 만들어 보고.':t<13.7?'아이디어가 만들어지는 순간.':'배움이 나만의 결과물로.';
  style('scene-heading',fade(t,2.5,3.25,8.6,9.3)+fade(t,9.8,10.5,17.2,18.2));
  style('scene-footnote',fade(t,3,3.7,17.2,18.2));
  $('seek').value=t.toFixed(2);$('time').textContent=`${t.toFixed(1)} / ${duration}`;
  const chapter=t<2.7?0:t<4.6?1:t<9.6?2:t<14.5?3:4;
  chapters.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===chapter)));
}
const visual=$('journey-visual');
const resize=()=>$('stage').style.setProperty('--stage-scale',Math.min(visual.clientWidth/800,visual.clientHeight/650));
new ResizeObserver(resize).observe(visual);resize();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const queryTime=new URLSearchParams(location.search).get('t');
let time=queryTime!==null?Math.min(duration,Math.max(0,Number(queryTime)||0)):0;
let paused=reduced.matches||queryTime!==null,visible=true,last=0;
function syncButton(){ $('pause').textContent=paused?'▶':'Ⅱ';$('pause').setAttribute('aria-label',paused?'재생':'일시정지');$('pause').setAttribute('aria-pressed',String(paused)); }
function setPause(value){paused=value;last=0;syncButton();}
$('pause').addEventListener('click',()=>setPause(!paused));
$('replay').addEventListener('click',()=>{time=0;render(time);setPause(reduced.matches);});
$('seek').addEventListener('input',event=>{setPause(true);time=Number(event.target.value);render(time);});
chapters.forEach(button=>button.addEventListener('click',()=>{setPause(true);time=Number(button.dataset.time);render(time);}));
reduced.addEventListener('change',()=>{if(reduced.matches)setPause(true);});
document.addEventListener('visibilitychange',()=>{last=0;});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;}).observe(visual);
render(time);syncButton();
await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));
await document.fonts.ready;
function tick(now){
  if(!paused&&visible&&!document.hidden){if(last)time=(time+Math.min((now-last)/1000,.08))%duration;render(time);}
  last=now;requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
