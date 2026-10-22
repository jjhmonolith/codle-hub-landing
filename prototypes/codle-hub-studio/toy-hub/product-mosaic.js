import {products as originalProducts} from './catalog.js?v=4';
const products=originalProducts.flatMap(p=>p.id==='textbook'?[{...p,name:'씨마스 인공지능 기초',extra:null},{id:'aidt',name:'금성·YBM 정보 교육자료',url:'https://exhibition.codle.io/',image:'actual-textbook.jpg'}]:[p]);
import {createMosaicObject,serviceIllustration} from './mosaic-service-art.js?v=134';
const $=s=>document.querySelector(s),reduced=matchMedia('(prefers-reduced-motion: reduce)'),hub=$('.hub'),board=$('.board'),preview=$('.preview');
const modalContent=$('.preview-content'),closeButton=$('.preview-close'),cover=$('.transition-image');
const tiles=new Map(),frames=new Map(),volumes=new Map();
let opened=null,closing=false,returnLink=null,animation=null,extraLink=null,loadTimer=0,warmTimer=0,hovered=null,zoom=null,last=performance.now(),lastRender=0,elapsed=0;
const visual={platform:['수업 플랫폼','worlds/content-ai.png','가르치고, 배우는 모든 도구'],contents:['오리지널 콘텐츠','worlds/thumbnail-everyday-ai.webp','호기심이 배움이 되는 순간'],aidt:['금성·YBM 정보 교육자료','actual-textbook.jpg','중·고등 정보 수업을 위한 AI 디지털 교육자료'],textbook:['씨마스 인공지능 기초','worlds/cmass-cover.png','읽는 배움에서 해보는 배움으로'],camp:['AI 집중캠프','worlds/camp-block.png','함께 몰입하고 직접 만드는 경험'],jitda:['짓다 AI 해커톤','worlds/jitda-worker-side.svg','아이디어를 나의 프로젝트로']};
for(const p of products){const [name,image,caption]=visual[p.id],a=document.createElement('a');a.className='tile '+p.id;a.href=p.url;a.dataset.product=p.id;a.innerHTML=`<span class="tile-label"><span>${name}</span><span class="tile-arrow" aria-hidden="true">↗</span></span><div class="object-stage" aria-hidden="true"><img class="object-fallback" src="assets/${image}" alt=""></div><span class="tile-caption">${caption}</span>`;board.append(a);tiles.set(p.id,a);
 a.addEventListener('pointerenter',()=>{hovered=p.id;clearTimeout(warmTimer);warmTimer=setTimeout(()=>warm(p),150)});
 a.addEventListener('pointerleave',()=>{if(hovered===p.id)hovered=null;volumes.get(p.id)?.setPointer(0,0)});
 a.addEventListener('pointermove',e=>{const r=a.getBoundingClientRect();volumes.get(p.id)?.setPointer((e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5)});
 a.addEventListener('focus',()=>{hovered=p.id;warm(p)});
 a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();open(p,a)});
}
const opening=$('.opening'),copy=$('.opening-copy'),seal=$('.opening-seal'),brand=$('.opening-brand');
let openingProgress=0,openingFrame=0,openingSkipped=false;
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>v*v*(3-2*v);
// The central cell and all six neighbouring cells share one changing grid.
const outline=$('.opening-grid');
for(const p of products){const cell=document.createElement('span');cell.className='outline-cell '+p.id;outline.append(cell)}
const core=document.createElement('div');core.className='mosaic-core';board.append(core);const composition=document.createElement('div');composition.className='opening-composition';core.append(composition);composition.append(brand,copy);const coreOutline=document.createElement('span');coreOutline.className='outline-cell core';outline.append(coreOutline);outline.hidden=false;seal.hidden=true;
const guideCue=document.createElement('a');
guideCue.className='guide-cue core-login';guideCue.href='https://codle.io/sign_in';guideCue.setAttribute('aria-label','코들 로그인');guideCue.title='코들 로그인';
guideCue.innerHTML='<span class="login-entry-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
core.append(guideCue);
const finalSizes={platform:[.40,.42],contents:[.34,.58],textbook:[.26,.42],aidt:[.26,.58],camp:[.51,.42],jitda:[.23,.58]};
let entryStarted=performance.now();
const logoLines=[...brand.querySelectorAll('.logo-line')],logoSolid=brand.querySelector('.logo-solid');
let drawnProgress=null,openingLayout=null,openingLayoutDirty=true,lastDrawing=-1,openingMotions=[],lastEntryState="";
const tileParts=products.map(({id})=>({id,tile:tiles.get(id),stage:tiles.get(id).querySelector('.object-stage'),label:tiles.get(id).querySelector('.tile-label')}));
const tileTracks={platform:[[0,2],[0,2]],contents:[[2,3],[0,3]],textbook:[[3,4],[0,2]],aidt:[[3,4],[2,4]],camp:[[1,3],[3,4]],jitda:[[0,1],[2,4]]};
const masthead=$('.masthead'),exploreLink=$('.explore-link');
function measureOpening(){
 const desktop=document.body.classList.contains('product-labs')||innerWidth>600,gutter=desktop?Math.max(6,Math.min(12,innerWidth*.0075)):0;
 const bw=board.clientWidth,bh=board.clientHeight;
 board.style.gap=desktop?gutter+'px':'';
 board.style.gridTemplateColumns=desktop?'23fr 17fr 34fr 26fr':'';
 board.style.gridTemplateRows=desktop?'32fr 10fr 16fr 42fr':'';
 copy.style.width=Math.min(780,bw*.64)+'px';
 const baseWidth=(bw-gutter*3)*.66,baseHeight=(bh-gutter*3)*.72;
 for(const part of tileParts){
  const [w,h]=finalSizes[part.id];
  part.width=bw*w*(part.id==='contents'?1.12:.94);part.height=Math.max(60,bh*h-106);
  part.stage.style.width=desktop?part.width+'px':'';part.stage.style.height=desktop?part.height+'px':'';
 }
 // Read text once after the width change, never in the animation's write loop.
 const copyHeight=copy.offsetHeight,gap=Math.max(22,Math.min(36,bh*.045));
 const padding=Math.min(16,baseHeight*.04),ratio=304.29/774.61;
 const desiredWidth=desktop?Math.min(820,baseWidth*.96):Math.min(280,bw*.6),reserve=copyHeight+gap;
 const logoHeight=Math.max(1,Math.min(desiredWidth*ratio,baseHeight-padding*2-reserve));
 composition.style.width=baseWidth+'px';composition.style.height=baseHeight+'px';
 brand.style.width=logoHeight/ratio+'px';brand.style.height=logoHeight+'px';brand.style.left='50%';brand.style.top='0px';copy.style.left='50%';copy.style.top='0px';
 openingLayout={desktop,gutter,bw,bh,baseWidth,baseHeight,copyHeight,gap,reserve,logoHeight};openingLayoutDirty=false;
}
function trackSize(tracks,start,end,available,gutter){return tracks.slice(start,end).reduce((sum,value)=>sum+value,0)*available/100+(end-start-1)*gutter;}
// One continuous unfold: logo compression, card colour and seams share progress.
// Cubic-bezier(.45, 0, .25, 1): an even acceleration without the old mid-flight rush.
function unfoldEase(progress){
 if(progress<=0)return 0;if(progress>=1)return 1;
 let low=0,high=1;
 for(let i=0;i<18;i++){
  const u=(low+high)/2,v=1-u;
  const x=3*v*v*u*.45+3*v*u*u*.25+u*u*u;
  if(x<progress)low=u;else high=u;
 }
 const u=(low+high)/2;return u*u*(3-2*u);
}
function openingTimeline(age,instant=false){return instant?1:.9*unfoldEase(clamp((age-3700)/1800))}
// Build the grid once. During entry, compositor transforms reproduce its changing
// rectangles; inverse transforms keep the artwork and labels undistorted.
function gridRect(columns,rows,cols,tileRows,layout){
 const {bw,bh,gutter}=layout,gw=bw-3*gutter,gh=bh-3*gutter;
 return {x:columns.slice(0,cols[0]).reduce((a,b)=>a+b,0)*gw/100+cols[0]*gutter,
  y:rows.slice(0,tileRows[0]).reduce((a,b)=>a+b,0)*gh/100+tileRows[0]*gutter,
  width:trackSize(columns,...cols,gw,gutter),height:trackSize(rows,...tileRows,gh,gutter)};
}
function entryPose(t){
 const l=openingLayout,{desktop,baseWidth,baseHeight,copyHeight,gap,reserve,logoHeight}=l;
 const columns=[17+6*t,66-49*t,10+24*t,7+19*t],rows=[8+24*t,6+4*t,72-56*t,14+28*t];
 const currentCore=gridRect(columns,rows,[1,2],[2,3],l),finalCore=gridRect([23,17,34,26],[32,10,16,42],[1,2],[2,3],l);
 const dx=currentCore.x+currentCore.width/2-finalCore.x-finalCore.width/2;
 const dy=currentCore.y+currentCore.height/2-finalCore.y-finalCore.height/2;
 const scale=Math.min(currentCore.width/baseWidth,currentCore.height/baseHeight);
 const recenter=ease(clamp((t-.58)/.42)),logoY=(baseHeight-reserve*(1-recenter))/2;
 const fade=ease(clamp((t-.08)/.47));
 const pose=new Map([
  [composition,{transform:`translate(-50%,-50%) translate(${dx}px,${dy}px) scale(${scale})`}],
  [brand,{transform:`translate(-50%,-50%) translateY(${logoY}px) scale(${1-.2*recenter})`,opacity:'1'}],
  [copy,{transform:`translate(-50%,-50%) translateY(${logoY+logoHeight/2+gap+copyHeight/2}px)`,opacity:String(1-fade)}],
  [exploreLink,{opacity:String(1-fade)}],
  [masthead,{opacity:String(ease(clamp((t-.8)/.2)))}]
 ]);
 for(const {id,tile,stage,label,width,height} of tileParts){
  const [cols,tileRows]=tileTracks[id],rect=gridRect(columns,rows,cols,tileRows,l),final=gridRect([23,17,34,26],[32,10,16,42],cols,tileRows,l);
  const sx=rect.width/final.width,sy=rect.height/final.height;
  const fit=Math.max(.01,Math.min(1,(rect.width-24)/width,(rect.height-106)/height));
  pose.set(tile,{transform:`translate(${rect.x-final.x}px,${rect.y-final.y}px) scale(${sx},${sy})`,opacity:String(t)});
  pose.set(stage,{transform:`translate(-50%,-50%) scale(${fit/sx},${fit/sy})`,opacity:String(ease(clamp((t-.12)/.76)))});
  pose.set(label,{transform:`scale(${1/sx},${1/sy})`,opacity:String(ease(clamp((t-.65)/.30)))});
 }
 return pose;
}
function finishOpeningMotion(){
 for(const {element,frames,animation} of openingMotions){
  const {offset,...style}=frames.at(-1);Object.assign(element.style,style);animation.cancel();
 }
 openingMotions=[];board.classList.remove('intro-running');
 for(const {tile,label} of tileParts){tile.style.transform='';label.style.transform=''}
}
function prepareOpeningMotion(now){
 for(const motion of openingMotions)motion.animation.cancel();openingMotions=[];
 const instant=openingSkipped||reduced.matches||!openingLayout.desktop||now-entryStarted>=5500;
 board.classList.toggle('intro-running',!instant);
 board.style.setProperty('--paper-cover','0');board.style.setProperty('--grid-reveal','1');
 if(!openingLayout.desktop){
  for(const {tile,stage,label} of tileParts){tile.style.transform='';tile.style.opacity='1';stage.style.transform='translate(-50%,-50%)';stage.style.opacity='1';label.style.transform='';label.style.opacity='1'}
  brand.style.opacity='0';copy.style.opacity='0';exploreLink.style.opacity='0';masthead.style.opacity='1';return;
 }
 const tracks=new Map();
 // Sample the existing curve once, not the layout on every animation frame.
 for(let i=0;i<=90;i++)for(const [element,style] of entryPose(instant?1:unfoldEase(i/90))){
  if(!tracks.has(element))tracks.set(element,[]);tracks.get(element).push({...style,offset:i/90});
 }
 for(const [element,frames] of tracks){
  const {offset,...style}=frames[0];Object.assign(element.style,style);
  if(instant)continue;
  const animation=element.animate(frames,{delay:3700,duration:1800,fill:'forwards',easing:'linear'});
  animation.startTime=entryStarted;openingMotions.push({element,frames,animation});
 }
}
function updateOpening(now=performance.now()){
 openingFrame=0;
 const instant=openingSkipped||reduced.matches||(innerWidth<=600&&!document.body.classList.contains('product-labs'));
 if(openingLayoutDirty){measureOpening();prepareOpeningMotion(now)}
 openingProgress=openingTimeline(now-entryStarted,instant);drawnProgress=openingProgress;
 const t=clamp(openingProgress/.9),age=now-entryStarted;
 const intro=instant?1:clamp(age/1900),copyReveal=instant?1:ease(clamp((age-2020)/520));
 outline.hidden=true;
 if(intro!==lastDrawing){
  const stroke=ease(clamp(intro/.82));
  for(const line of logoLines)line.style.strokeDashoffset=1.01*(1-stroke);
  logoSolid.style.opacity=ease(clamp((intro-.61)/.39));lastDrawing=intro;
 }
 if(!instant&&age<3700){copy.style.opacity=copyReveal;exploreLink.style.opacity=copyReveal}
 if(instant||age>=5500)finishOpeningMotion();
 if(document.body.classList.contains('product-labs')){
  const complete=instant||age>=5500;
  document.querySelector('.labs-hero').classList.toggle('intro-complete',complete);
  document.querySelector('.labs-platform .labs-copy').inert=!complete;
 }
 const entryState=[t>.95,t>=.98,t>.82,copyReveal===0||t>.55].join(':');
 if(entryState!==lastEntryState){
  const ready=t>=.98;board.classList.toggle('is-revealed',t>.95);guideCue.inert=!ready;masthead.inert=!ready&&!document.body.classList.contains('product-labs');
  copy.inert=copyReveal===0||t>.55;exploreLink.inert=copy.inert;
  for(const {id,tile} of tileParts){tile.inert=!ready;tile.classList.toggle('art-arrived',t>.82);volumes.get(id)?.setProgress(t)}
  lastEntryState=entryState;
 }
 if(!instant&&age<5500)queueOpening();
}
function queueOpening(){if(!openingFrame)openingFrame=requestAnimationFrame(updateOpening)}
function invalidateOpening(){openingLayoutDirty=true;queueOpening()}
addEventListener('resize',invalidateOpening);reduced.addEventListener('change',invalidateOpening);
$('.skip-link').addEventListener('click',e=>{if(document.body.classList.contains('product-labs'))return;e.preventDefault();openingSkipped=true;scrollTo({top:opening.offsetTop,behavior:'instant'});requestAnimationFrame(()=>{updateOpening();tiles.values().next().value.focus({preventScroll:true})})});
updateOpening();
document.fonts.ready.then(invalidateOpening);

async function init(){for(const p of products){try{const tile=tiles.get(p.id),stage=await createMosaicObject(tile.querySelector('.object-stage'),p.id);volumes.set(p.id,stage);stage.setProgress(clamp(drawnProgress/.9));tile.classList.add('is-ready')}catch(error){console.warn('Retaining authentic service image',p.id,error)}}}
init();
function warm(product){
 if(frames.has(product.id))return frames.get(product.id);
 const iframe=document.createElement('iframe');iframe.title=product.name+' 실제 랜딩';iframe.hidden=true;iframe.inert=true;iframe.tabIndex=-1;iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.dataset.product=product.id;
 const record={iframe,loaded:false};frames.set(product.id,record);iframe.addEventListener('load',()=>{record.loaded=true;iframe.dataset.loaded='true';if(opened?.id===product.id){clearTimeout(loadTimer);$('.preview-fallback').hidden=true}});iframe.src=product.url;modalContent.append(iframe);return record;
}
function open(product,tile){
 if(opened)return;opened=product;returnLink=tile;const record=warm(product);hub.inert=true;$('.codle-footer').inert=true;masthead.inert=true;$('.skip-link').inert=true;document.body.style.overflow='hidden';
 $('#preview-title').textContent=visual[product.id][0];$('.preview-info').href='#service-'+product.id;$('.preview-direct').href=product.url;$('.preview-fallback a').href=product.url;$('.preview-fallback').hidden=true;$('.preview-poster').src='assets/'+product.image;
 extraLink?.remove();extraLink=null;if(product.extra){extraLink=document.createElement('a');extraLink.href=product.extra.url;extraLink.textContent=product.extra.label;extraLink.target='_blank';extraLink.rel='noopener noreferrer';$('.preview-bar').insertBefore(extraLink,closeButton)}
 const r=tile.getBoundingClientRect(),dx=innerWidth/2-r.left-r.width/2,dy=innerHeight/2-r.top-r.height/2,scale=Math.max(innerWidth/r.width,innerHeight/r.height)*1.03;tile.style.zIndex='20';
 const reveal=()=>{if(!opened||closing)return;preview.hidden=false;record.iframe.hidden=false;record.iframe.inert=false;record.iframe.removeAttribute('tabindex');closeButton.focus({preventScroll:true});animation=preview.animate([{opacity:0},{opacity:1}],{duration:reduced.matches?0:340,fill:'both'});animation.onfinish=()=>{animation?.cancel();animation=null};};
 if(reduced.matches)reveal();else{zoom=tile.animate([{transform:'none'},{transform:`translate(${dx}px,${dy}px) scale(${scale})`}],{duration:850,easing:'cubic-bezier(.65,0,.25,1)',fill:'forwards'});zoom.onfinish=reveal;}
 loadTimer=setTimeout(()=>{if(opened?.id===product.id&&!record.loaded)$('.preview-fallback').hidden=false},8000);
}
function close(){if(!opened||closing)return;closing=true;clearTimeout(loadTimer);animation?.cancel();const tile=returnLink,record=frames.get(opened.id);const finish=()=>{record.iframe.hidden=true;record.iframe.inert=true;record.iframe.tabIndex=-1;preview.hidden=true;animation?.cancel();animation=null;zoom?.cancel();zoom=null;tile.style.zIndex='';opened=null;closing=false;hub.inert=false;$('.codle-footer').inert=false;masthead.inert=false;$('.skip-link').inert=false;document.body.style.overflow='';returnLink?.focus({preventScroll:true})};if(reduced.matches){finish();return}zoom?.reverse();animation=preview.animate([{opacity:1},{opacity:0}],{duration:320,fill:'forwards'});animation.onfinish=()=>{preview.hidden=true;setTimeout(finish,530)}}
closeButton.addEventListener('click',close);document.addEventListener('keydown',e=>{if(!opened)return;if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const controls=[...preview.querySelectorAll('a[href],button,iframe')].filter(el=>!el.hidden&&!el.inert&&el.getClientRects().length);if(e.shiftKey&&document.activeElement===controls[0]){e.preventDefault();controls.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===controls.at(-1)){e.preventDefault();controls[0].focus()}}});
addEventListener('resize',()=>{for(const stage of volumes.values()){stage.resize();stage.render(elapsed,.033,true)}});reduced.addEventListener('change',()=>{for(const stage of volumes.values()){stage.setPointer();stage.render(0,.033,true)}});

$('.preview-info').addEventListener('click',e=>{e.preventDefault();const id=opened?.id;close();setTimeout(()=>$('#service-'+id)?.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'}),reduced.matches?0:900)});

for(const id of ['platform','contents','textbook','aidt','camp','jitda']){
 const article=document.getElementById(`service-${id}`);
 const art=document.createElement('div');art.className=`service-art ${id}`;art.setAttribute('aria-hidden','true');art.innerHTML=serviceIllustration(id);article.prepend(art);
}

 document.querySelector('[data-replay-mosaic]')?.addEventListener('click',()=>{entryStarted=performance.now();openingSkipped=false;lastDrawing=-1;lastEntryState='';invalidateOpening();});
