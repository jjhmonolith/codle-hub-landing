// Flat illustration system: 8-unit grid, 8/16-unit clearances, solid fills, regular arcs.
const ink='#253144',paper='#fffaf1',blue='#2853ed',pale='#b8caf4';
const svg=(body,box='0 0 320 320')=>`<svg class="editorial-art" xmlns="http://www.w3.org/2000/svg" viewBox="${box}" font-family="Pretendard, Apple SD Gothic Neo, sans-serif" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
// One recognisable silhouette per service; no captions, mock UI or decorative scenes.
function platform(){
 // The original white marks supply the alpha mask; their outlines are never redrawn.
 const tools=[['python',68,68,'#1686ff'],['entry',700,68,'#00ce82'],['quiz',700,635,'#ff7caf'],['pdf',980,352,'#ff414a'],['board',68,635,'#00ce82'],['video',1611,918,'#3535ed']];
 const filter=`<defs><filter id="codle-original-mark" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2 2 2 0 -5"/></filter></defs>`;
 return svg(filter+tools.map(([name,sx,sy,color],i)=>{
  const x=24+(i%3)*104,y=24+Math.floor(i/3)*104;
  return `<g transform="translate(${x} ${y})"><defs><clipPath id="mark-bounds-${name}"><rect x="10" y="10" width="68" height="68"/></clipPath><mask id="original-${name}" maskUnits="userSpaceOnUse" x="0" y="0" width="88" height="88" style="mask-type:alpha"><g clip-path="url(#mark-bounds-${name})"><svg width="88" height="88" viewBox="${sx} ${sy} 166 166"><image href="assets/worlds/codle-tools-ui.png" width="2048" height="1152" filter="url(#codle-original-mark)"/></svg></g></mask></defs><rect width="88" height="88" rx="8" fill="${color}"/><rect width="88" height="88" fill="#ffffff" mask="url(#original-${name})"/></g>`;
 }).join(''), '0 0 344 240');
}
function contents(){return svg(`
 <g stroke="${ink}" stroke-width="4">
  <path d="M80 48h168v224H80a16 16 0 0 1-16-16V64a16 16 0 0 1 16-16ZM80 48v224"/>
  <rect x="104" y="80" width="120" height="88" rx="2"/>
  <path d="m156 104 24 20-24 20Z" stroke="#398c9d"/>
  <path d="m104 204 8 8 16-20m16 8h72m-72 16h48"/>
 </g>
 `)}
function textbook(){return svg(`
 <g stroke="${ink}" stroke-width="4">
  <path d="M88 48h152v200H88a16 16 0 0 0 0 32h152M72 264V64a16 16 0 0 1 16-16M88 264h152v-16"/>
  <path d="M104 80h56m-56 16h32"/>
  <rect x="128" y="128" width="64" height="64" rx="2" stroke="#238f95"/>
  <path d="M144 116v12m32-12v12m-32 64v12m32-12v12m-60-60h12m-12 32h12m64-32h12m-12 32h12" stroke="#238f95"/>
 </g>
 <text x="160" y="169" text-anchor="middle" fill="#238f95" font-size="24" font-weight="500" font-family="Arial, sans-serif">AI</text>
 `)}
function aidt(){return svg(`<circle cx="104" cy="104" r="48" fill="#a99bd0"/><path d="m224 56 48 96h-96Z" fill="#e8b65b"/><path d="M56 176h96v96H56Z" fill="#66aaa2"/><path d="M224 176a24 24 0 0 1 24 24 24 24 0 0 1 0 48 24 24 0 0 1-48 0 24 24 0 0 1 0-48 24 24 0 0 1 24-24Z" fill="${paper}"/>`)}
function camp(){return svg(`
 <rect x="64" y="48" width="256" height="120" rx="4" fill="#a9bfe8"/>
 <g stroke="#253955" stroke-width="4">
  <path d="m120 88-20 20 20 20m48-40 20 20-20 20m-16-48-16 56"/>
  <path d="M224 96h56m-56 24h32"/>
 </g>
 <g stroke="${paper}" stroke-width="4">
  <path d="M56 180h272"/>
  <circle cx="120" cy="224" r="16"/>
  <path d="M88 280v-8a32 32 0 0 1 64 0v8"/>
  <circle cx="248" cy="216" r="16"/>
  <path d="M216 280v-16a32 32 0 0 1 32-32h8c16 0 28-12 28-28v-4a10 10 0 0 1 20 0v8c0 20-8 36-24 44v28"/>
  <path d="M72 292h240"/>
 </g>
 `, '0 0 384 336')}
function jitda(){return svg(`<svg x="76" y="64" width="168" height="192" viewBox="0 25 235 269" overflow="hidden"><image href="assets/jitda-logo.svg" width="774.61" height="304.29"/></svg>`)}
const artists={platform,contents,textbook,aidt,camp,jitda};
const tracks={
 tool:[{transform:'scale(1)'},{transform:'scale(1.035)'}],
 'lesson-left':[{transform:'none'},{transform:'translate(-15px,-22px) rotate(-7deg)'}],
 'lesson-right':[{transform:'none'},{transform:'translate(19px,-32px) rotate(6deg)'}],
 'library-cover':[{transform:'none'},{transform:'translateY(7px)'}],
 'ai-page':[{transform:'none'},{transform:'translate(6px,-7px)'}],
 'ai-nodes':[{opacity:.65},{opacity:1}],
 'course-sheets':[{transform:'none'},{transform:'translateY(-12px)'}],
 'exercise-result':[{transform:'scale(.9)',opacity:.75},{transform:'scale(1)',opacity:1}],
 'school-window':[{opacity:.65},{opacity:1}]
};
export async function createMosaicObject(mount,id){
 mount.innerHTML=`<div class="art-response">${artists[id]()}</div>`;mount.classList.add('editorial-stage');
 const response=mount.querySelector('.art-response'),tile=mount.closest('.tile'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let pointer=false,focused=false,active=false,progress=0,x=0,y=0,tx=0,ty=0,frame=0,last=0,typed=0,visible=false;
 const animations=[...mount.querySelectorAll('[data-motion]')].map(el=>{const a=el.animate(tracks[el.dataset.motion],{duration:1000,fill:'both',easing:'cubic-bezier(.25,.1,.25,1)'});a.pause();a.currentTime=0;return a});
 const code=[...mount.querySelectorAll('[data-code]')],length=code.reduce((n,el)=>n+el.dataset.code.length,0),caret=mount.querySelector('.typing-caret'),prompt=mount.querySelector('.code-prompt');
 function paintCode(){if(!code.length)return;let remaining=Math.floor(typed),caretX=54,caretY=239;for(let i=0;i<code.length;i++){const n=Math.max(0,Math.min(code[i].dataset.code.length,remaining));code[i].textContent=code[i].dataset.code.slice(0,n);if(remaining>=0){caretX=54+n*9;caretY=239+i*30}remaining-=code[i].dataset.code.length}prompt.style.opacity=typed>0?'0':'1';caret.style.opacity=typed>0?'1':'0';caret.setAttribute('x',caretX);caret.setAttribute('y',caretY)}
 function tick(now){frame=0;const dt=Math.min(40,last?now-last:16);last=now;const target=active&&visible&&!reduced.matches?1:0,k=1-Math.exp(-dt/180);progress+=(target-progress)*k;x+=(tx-x)*k;y+=(ty-y)*k;
  if(Math.abs(target-progress)<.001)progress=target;if(Math.abs(tx-x)<.01)x=tx;if(Math.abs(ty-y)<.01)y=ty;
  for(const a of animations)a.currentTime=progress*1000;
  response.style.transform=`translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`;
  if(code.length){typed=Math.max(0,Math.min(length,typed+(target?1:-1)*dt*(target?.025:.05)));paintCode()}
  if(progress!==target||x!==tx||y!==ty||(code.length&&typed!==(target?length:0)))frame=requestAnimationFrame(tick);else last=0;
 }
 function queue(){if(!frame)frame=requestAnimationFrame(tick)}
 function setActive(){active=pointer||focused;tile.classList.toggle('art-active',active&&visible&&!reduced.matches);if(!active){tx=0;ty=0}queue()}
 tile.addEventListener('pointerenter',()=>{pointer=true;setActive()});tile.addEventListener('pointerleave',()=>{pointer=false;setActive()});
 tile.addEventListener('focus',()=>{focused=true;setActive()});tile.addEventListener('blur',()=>{focused=false;setActive()});
 reduced.addEventListener('change',()=>{tx=0;ty=0;typed=0;setActive()});
 return {resize(){},render(){},setPointer(px=0,py=0){if(reduced.matches||!visible)return;tx=Math.max(-.5,Math.min(.5,px))*8;ty=Math.max(-.5,Math.min(.5,py))*6;queue()},setProgress(t){const next=t>.98;if(next===visible)return;visible=next;if(!visible){pointer=false;focused=false;tx=0;ty=0}setActive()}};
}
