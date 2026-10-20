// Product-specific flat compositions; opening and grid geometry are unchanged.
const ink='#253144',paper='#fffaf1',blue='#2853ed';
const svg=(body,box)=>`<svg class="editorial-art" xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill="none">${body}</svg>`;
const line=(d,color=ink,w=2)=>`<path d="${d}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
function tool(x,y,sx,sy,label,i){return `<g transform="translate(${x} ${y})"><g data-motion="tool"><defs><clipPath id="tool-crop-${i}" clipPathUnits="userSpaceOnUse"><rect width="78" height="78" rx="15"/></clipPath></defs><g clip-path="url(#tool-crop-${i})"><svg width="78" height="78" overflow="hidden" viewBox="${sx} ${sy} 166 166"><image href="assets/worlds/codle-tools-ui.png" width="2048" height="1152"/></svg></g></g></g>`}
function platform(){
 const route='M188 99h52M338 99h52M488 99Q520 99 520 164Q520 229 488 229M390 229h-52M240 229h-52';
 return svg(`<path d="${route}" stroke="#8faeff" stroke-width="3"/><path class="network-signals" d="${route}" stroke="${paper}" stroke-width="3" pathLength="222" stroke-dasharray="12 210"/>
 ${tool(100,60,68,68,'',0)}${tool(250,60,700,68,'',1)}${tool(400,60,700,635,'',2)}${tool(400,190,980,352,'',3)}${tool(250,190,349,352,'',4)}${tool(100,190,68,635,'',5)}`, '65 35 470 265');
}
// The service action stays readable at rest; hover develops it without resetting.
function contents(){return svg(`<g transform="translate(25 55)">
 <path d="M14 245V82h98l24 24h166v245H14Z" fill="#c5d2f4"/>
 <g transform="translate(32 52)"><g data-motion="lesson-left"><rect width="142" height="218" rx="5" fill="${ink}"/><path d="M33 150V119m37 31V83m37 67V99" stroke="${paper}" stroke-width="16"/><text x="23" y="37" fill="${paper}" font-size="17" font-weight="550">데이터</text></g></g>
 <g transform="translate(108 20)"><g data-motion="lesson-right"><rect width="142" height="218" rx="5" fill="${blue}"/><path d="m48 94-24 29 24 29m46-58 24 29-24 29m-14-70-18 83" stroke="${paper}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><text x="23" y="37" fill="${paper}" font-size="17" font-weight="550">AI · 코딩</text></g></g>
 <g data-motion="library-cover"><path d="M14 245h115l21-22h162l-26 134H14Z" fill="${paper}" stroke="${blue}" stroke-width="3" stroke-linejoin="round"/><path d="M44 282h56m-56 17h91" stroke="${blue}" stroke-width="4" stroke-linecap="round"/><path d="m243 263 24 16-24 16Z" fill="${blue}"/></g>
 </g>`, '0 0 355 450')}
function textbook(){return svg(`<g transform="translate(22 48)">
 <path d="M24 25Q93 8 144 40Q197 8 268 25V235Q196 219 144 249Q92 219 24 235Z" fill="${paper}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
 <path d="M144 40v209" stroke="#b9c9e9" stroke-width="3"/>
 <path d="M47 70q35-4 71 8m-71 17q35-4 71 8m-71 17q35-4 52 3" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
 <g data-motion="ai-page"><path d="M151 40Q204 10 278 24V229Q205 215 151 245Z" fill="${blue}"/>
 <path d="M211 88v34m-34 0h68m-68 0v42m68-42v42" stroke="${paper}" stroke-width="4"/><circle cx="211" cy="77" r="12" fill="${paper}"/>
 <g data-motion="ai-nodes"><circle cx="177" cy="175" r="13" fill="${paper}"/><circle cx="245" cy="175" r="13" fill="${paper}"/></g>
 </g><path d="m230 214 3 34 9-8 10 13 8-7-10-13 13-4Z" fill="${ink}" stroke="${paper}" stroke-width="3" stroke-linejoin="round"/>
 </g>`, '0 25 335 330')}
function aidt(){return svg(`<g transform="translate(15 48)">
 <g data-motion="course-sheets"><path d="M42 28h230v160H42Z" fill="#a7bce9"/><path d="M28 45h247v164H28Z" fill="${paper}" stroke="${ink}" stroke-width="3"/></g>
 <rect x="11" y="76" width="282" height="189" rx="5" fill="${paper}" stroke="${ink}" stroke-width="3"/>
 <path d="M11 106h282" stroke="${ink}" stroke-width="3"/><path d="M29 92h44" stroke="${blue}" stroke-width="4"/>
 <path d="m60 143-20 25 20 25m36-50 20 25-20 25" stroke="${blue}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M38 225h85" stroke="#b8c7e8" stroke-width="5" stroke-linecap="round"/>
 <path d="M151 130v108" stroke="#b8c7e8" stroke-width="2"/>
 <g data-motion="exercise-result"><circle cx="221" cy="180" r="40" fill="${blue}"/><path d="m201 180 14 14 27-29" stroke="${paper}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>
 </g>`, '0 15 335 345')}
function camp(){
 const windows=[[87,152],[126,152],[87,204],[126,204],[314,152],[353,152],[314,204],[353,204]];
 return svg(`<path d="M58 123h131v154H58Zm223 0h131v154H281Z" fill="#c9d7f4"/>
 <path d="M47 115h144v13H47Zm232 0h144v13H279Z" fill="#8da7df"/>
 <path d="M180 85h110v192H180Z" fill="${paper}"/>
 <path d="m163 90 72-58 72 58Z" fill="${blue}"/>
 <circle cx="235" cy="116" r="19" fill="${blue}"/><path d="M235 103v13l10 6" stroke="${paper}" stroke-width="3" stroke-linecap="round"/>
 ${windows.map(([x,y],i)=>`<g data-motion="school-window" data-order="${i}"><path d="M${x} ${y}h25v31h-25Z" fill="#85a3ee"/><path d="M${x+12.5} ${y}v31" stroke="#c9d7f4" stroke-width="2"/></g>`).join('')}
 <path d="M210 223a25 25 0 0 1 50 0v54h-50Z" fill="${blue}"/><path d="M235 222v55" stroke="#aec3ff" stroke-width="2"/>
 <path d="M215 165h40m-40 13h40" stroke="${blue}" stroke-width="4" stroke-linecap="round"/>
 <path d="M45 278h380" stroke="${paper}" stroke-width="4" stroke-linecap="round"/>`, '20 0 430 320')}
function jitda(){return svg(`<svg x="94" y="8" width="152" height="152" viewBox="0 25 235 235" overflow="hidden"><image href="assets/jitda-logo.svg" width="774.61" height="304.29"/></svg>
 <rect x="34" y="178" width="272" height="170" rx="7" fill="${ink}"/><path d="M34 209h272" stroke="#627592" stroke-width="2"/><path d="M53 194h45" stroke="#8ca7ff" stroke-width="4"/>
 <text class="code-prompt" x="55" y="250" fill="#8ca7ff" font-size="24">&gt;_</text>
 <g class="typed-code" fill="${paper}" font-size="15"><text data-code="idea = &quot;hello&quot;" x="54" y="239"></text><text data-code="app = build(idea)" x="54" y="269"></text><text data-code="app.run()" x="54" y="299"></text><text class="typing-caret" x="54" y="239" fill="#ffce2c">▌</text></g>`, '0 0 340 390')}
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
