import { products } from './catalog.js?v=4';
import { createToyStage } from './toys.js?v=25';
import { createPortalTools } from './portal-tools.js?v=1';
import {FIRST_DEPTH,DEPTH_GAP,DECK_START,DECK_END,layerEase,flightProgress} from './depth-flight.js?v=2';
import {createDepthGallery} from './depth-gallery.js?v=4';

const $=selector=>document.querySelector(selector);
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,t)=>a+(b-a)*t;
const ease=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t)};
history.scrollRestoration='manual';
if(!location.hash)window.scrollTo({top:0,behavior:'instant'});
const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
const journey=$('.journey'),hero=$('.hero'),gallery=$('.experiences'),grid=$('.product-grid');
const main=$('main'),header=$('.site-header'),preview=$('.preview'),previewContent=$('.preview-content'),fallback=$('.preview-fallback'),closeButton=$('.preview-close'),captureImage=$('.preview-capture');
const state={p:0,target:0,active:null,webgl:'loading',entry:0,index:0,artVisible:true};

// Fixed viewing surfaces in the shared world. Only the camera travels.
const screenPoses=[
 {restX:-.12,restY:.035,width:.62},
 {restX:.12,restY:.04,width:.62},
 {restX:-.10,restY:.015,width:.66},
 {restX:.14,restY:-.025,width:.60},
 {restX:-.11,restY:.035,width:.64}
];
const layout={width:0,height:0};
const frames=new Map();
let world=null,toys=null,tools=null,loading=false,warming=false,returnFocus=null,returnScrollY=0,loadTimer=0,extraLink=null,animation=null,captureAnimation=null,closing=false,finishClose=null;
let dirty=true,lastPaint=-1,stageTime=0,lastTime=performance.now(),lastRenderAt=0,restoringFocus=false;
const staticMode=()=>reduced.matches||state.webgl==='fallback';
const depthLayers=[];
function addDepthLayer(element,x,y,width,depth,roll=0,aspect=1.6){
  depthLayers.push({element,x,y,width,depth,roll,aspect});return element;
}
addDepthLayer($('.mosaic-logos'),.01,-.035,.62,180,-1,1.8);
addDepthLayer($('.mosaic-tools'),-.44,-.075,.48,650,0,1.6);
function imageLayer(file,x,y,width,depth,roll=0,aspect=1.65,extra=''){
  const el=document.createElement('div');el.className='depth-prop '+extra;el.setAttribute('aria-hidden','true');
  const img=new Image();img.src='assets/'+file;img.alt='';img.draggable=false;el.append(img);grid.append(el);
  addDepthLayer(el,x,y,width,depth,roll,aspect);
}
// A generous passage: supporting images occupy its edges, separated in depth.
[
 ['thumbnail-everyday-ai.webp',.66,-.48,.38,3300,0],
 ['thumbnail-python-data.webp',-.76,.34,.42,3950,0],
 ['thumbnail-climate-data.webp',.78,.37,.40,4550,0],
 ['thumbnail-microbit.webp',-.72,-.40,.36,5100,0],
 ['thumbnail-esg.webp',-.66,.42,.38,6350,0],
 ['thumbnail-ocean-data.webp',.80,-.36,.42,7100,0]
].forEach(([f,...pose])=>imageLayer('worlds/'+f,...pose));
imageLayer('worlds/cmass-page33.png',-.78,-.30,.28,7850,0,.73);
imageLayer('worlds/textbook-river-board.png',.86,.34,.44,9450,0,1.6);
imageLayer('worlds/camp-code.png',-.82,.34,.40,10300,0,1.6);
imageLayer('worlds/camp-block.png',.80,-.34,.42,12450,0,1.6);
imageLayer('worlds/jitda-worker-side.svg',-.72,.28,.23,13600,0,.94,'depth-mascot');
imageLayer('worlds/jitda-official-demo.png',.80,-.30,.46,15550,0,1.6);

const cards=products.map((product,i)=>{
  const article=document.createElement('article');article.className='product';article.id='product-'+product.id;
  const link=document.createElement('a');link.className='product-link';link.href=product.url;link.setAttribute('aria-label',product.name+' 랜딩 열기');
  const windowEl=document.createElement('div');windowEl.className='product-window';
  const img=new Image();img.src='assets/'+product.image;img.alt=product.name+' 실제 랜딩 미리보기';img.decoding='async';img.draggable=false;windowEl.append(img);
  const caption=document.createElement('div');caption.className='product-caption';
  const title=document.createElement('h2');title.textContent=product.name;
  const arrow=document.createElement('span');arrow.className='product-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');caption.append(title,arrow);
  link.append(windowEl,caption);article.append(link);grid.append(article);
  link.addEventListener('click',event=>{
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();if(!gallery.inert&&article.dataset.visible==='true')openProduct(product,link,windowEl);
  });
  link.addEventListener('pointerenter',()=>warmProduct(product),{once:true});
  link.addEventListener('focus',()=>{
    warmProduct(product);
    if(!staticMode()&&!state.active&&!restoringFocus&&link.matches(':focus-visible'))goToCard(i,'instant');
  });
  return {article,link,windowEl,index:i};
});

function readScroll(){state.target=clamp((scrollY-journey.offsetTop)/Math.max(1,journey.offsetHeight-innerHeight))}
function measure(){
  layout.width=grid.clientWidth;layout.height=grid.clientHeight;
  const svg=$('.logo-curtain');svg.setAttribute('viewBox',`0 0 ${layout.width} ${layout.height}`);
  depthLayers.forEach(spec=>{spec.element.style.width=spec.width*layout.width+'px';spec.element.style.height=spec.width*layout.width/spec.aspect+'px'});
  world?.resize(layout.width,layout.height);readScroll();dirty=true;
}
function goToCard(index,behavior='smooth'){
  index=clamp(index,0,products.length-1);
  if(staticMode()){cards[index].article.scrollIntoView({block:'center',behavior});return}
  const p=DECK_START+(DECK_END-DECK_START)*Math.min(products.length-1,index)/Math.max(1,products.length-1);
  if(behavior==='instant'){state.p=state.target=p;dirty=true}
  window.scrollTo({top:journey.offsetTop+p*(journey.offsetHeight-innerHeight),behavior});
}
function showChoices(focus=false){
  goToCard(0,staticMode()?'instant':'smooth');
  if(focus){const focusFirst=()=>{if(gallery.inert){requestAnimationFrame(focusFirst);return}cards[0].link.focus({preventScroll:true})};requestAnimationFrame(focusFirst)}
}
$('.explore-button').addEventListener('click',()=>showChoices());
$('.deck-previous').addEventListener('click',()=>goToCard(state.index-1));
$('.deck-next').addEventListener('click',()=>goToCard(state.index+1));
$('.skip-link').addEventListener('click',event=>{event.preventDefault();showChoices(true)});
$('.wordmark').addEventListener('click',event=>{event.preventDefault();window.scrollTo({top:0,behavior:staticMode()?'instant':'smooth'});toys?.setPointer()});

function warmProduct(product){
  if(frames.has(product.id))return frames.get(product.id);
  const frame=document.createElement('iframe');frame.title=product.name+' 실제 랜딩';frame.referrerPolicy='strict-origin-when-cross-origin';frame.tabIndex=-1;frame.inert=true;frame.hidden=true;
  frame.dataset.product=product.id;frame.dataset.loadCount='0';
  const record={frame,loaded:false};frames.set(product.id,record);
  frame.addEventListener('load',()=>{record.loaded=true;frame.dataset.loaded='true';frame.dataset.loadCount=String(Number(frame.dataset.loadCount)+1);if(state.active?.id===product.id){fallback.hidden=true;clearTimeout(loadTimer)}});
  // Mount once: moving a cross-origin iframe would reload its page.
  frame.src=product.url;previewContent.append(frame);return record;
}
function scheduleProducts(){
  if(warming)return;warming=true;
  // Decode local imagery first. Real pages warm just before their turn, keeping
  // five independent animated sites from starting during the logo entrance.
  document.querySelectorAll('.product-window img,.depth-prop img').forEach(img=>img.decode?.().catch(()=>{}));
}
function sourceTransform(link){
  const windowEl=link.querySelector('.product-window'),rect=windowEl.getBoundingClientRect();
  const cardMatrix=new DOMMatrixReadOnly(getComputedStyle(link.closest('.product')).transform),worldMatrix=new DOMMatrixReadOnly(getComputedStyle(grid).transform);
  const angle=(Math.atan2(cardMatrix.b,cardMatrix.a)+Math.atan2(worldMatrix.b,worldMatrix.a))*180/Math.PI;
  return `translate(${rect.left+rect.width/2-innerWidth/2}px,${rect.top+rect.height/2-innerHeight/2}px) rotate(${angle}deg) scale(${rect.width/innerWidth},${rect.height/innerHeight})`;
}
function sourceImage(link,product){
  const windowEl=link.querySelector('.product-window'),img=windowEl.querySelector('img');
  if(!img.complete||!img.naturalWidth)return 'assets/'+product.image;
  const w=windowEl.clientWidth,h=windowEl.clientHeight,scale=Math.max(w/img.naturalWidth,h/img.naturalHeight);
  const sw=w/scale,sh=h/scale;
  const rect=windowEl.getBoundingClientRect(),canvas=document.createElement('canvas');canvas.width=Math.round(rect.width);canvas.height=Math.round(rect.height);
  canvas.getContext('2d').drawImage(img,(img.naturalWidth-sw)/2,0,sw,sh,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/webp',.94);
}
function animateCapture(product,duration,closing=false){
  const opacity=captureImage.hidden?0:Number(getComputedStyle(captureImage).opacity);
  captureAnimation?.cancel();captureImage.src=sourceImage(returnFocus,product);captureImage.hidden=false;
  captureAnimation=captureImage.animate(closing?[{opacity},{opacity:1,offset:.7},{opacity:1}]:[{opacity:1},{opacity:1,offset:.3},{opacity:0}],{duration,easing:'ease-in-out',fill:'forwards'});
  if(!closing)captureAnimation.onfinish=()=>{captureImage.hidden=true;captureAnimation?.cancel();captureAnimation=null};
}
function openProduct(product,link){
  if(state.active)return;
  const transform=staticMode()?'none':sourceTransform(link),record=warmProduct(product);
  // Focus/scrollIntoView can scroll a sticky ancestor without changing its
  // visible composition. Restore the displayed progress before locking it.
  returnScrollY=staticMode()?scrollY:journey.offsetTop+state.p*(journey.offsetHeight-innerHeight);
  window.scrollTo({top:returnScrollY,behavior:'instant'});
  state.active=product;returnFocus=link;toys?.setPointer();main.inert=true;header.inert=true;$('.skip-link').inert=true;document.body.style.overflow='hidden';
  $('.preview-poster').src='assets/'+product.image;preview.hidden=false;fallback.hidden=true;
  $('#preview-title').textContent=product.name;$('.preview-direct').href=product.url;fallback.querySelector('a').href=product.url;
  extraLink?.remove();extraLink=null;
  if(product.extra){extraLink=document.createElement('a');extraLink.href=product.extra.url;extraLink.textContent=product.extra.label;extraLink.target='_blank';extraLink.rel='noopener noreferrer';$('.preview-bar').insertBefore(extraLink,closeButton)}
  record.frame.inert=false;record.frame.removeAttribute('tabindex');record.frame.hidden=false;
  if(!staticMode()){
    animateCapture(product,720);
    animation=preview.animate([{transform,borderRadius:'9px'},{transform:'translate(0,0) rotate(0deg) scale(1,1)',borderRadius:'0px'}],{duration:720,easing:'cubic-bezier(.2,.8,.2,1)'});
  }
  closeButton.focus({preventScroll:true});document.body.dataset.preview=product.id;
  if(!record.loaded)loadTimer=setTimeout(()=>{if(state.active?.id===product.id)fallback.hidden=false},8000);
}
function closeProduct(){
  if(!state.active||closing)return;
  closing=true;clearTimeout(loadTimer);
  const start={transform:getComputedStyle(preview).transform,borderRadius:getComputedStyle(preview).borderRadius};animation?.cancel();
  const record=frames.get(state.active.id);
  window.scrollTo({top:returnScrollY,behavior:'instant'});
  finishClose=()=>{
    record.frame.inert=true;record.frame.tabIndex=-1;record.frame.hidden=true;preview.hidden=true;animation?.cancel();animation=null;
    captureAnimation?.cancel();captureAnimation=null;captureImage.hidden=true;
    state.active=null;closing=false;finishClose=null;main.inert=false;header.inert=false;$('.skip-link').inert=false;document.body.style.overflow='';delete document.body.dataset.preview;
    window.scrollTo({top:returnScrollY,behavior:'instant'});restoringFocus=true;returnFocus?.focus({preventScroll:true});restoringFocus=false;readScroll();dirty=true;
  };
  if(staticMode()){finishClose();return}
  animateCapture(state.active,440,true);
  animation=preview.animate([start,{transform:sourceTransform(returnFocus),borderRadius:'9px'}],{duration:440,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  animation.onfinish=()=>finishClose?.();
}
closeButton.addEventListener('click',closeProduct);
document.addEventListener('keydown',event=>{
  if(!state.active){
    if(!staticMode()&&!gallery.inert&&['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(event.key)){
      event.preventDefault();goToCard(state.index+(['ArrowDown','ArrowRight'].includes(event.key)?1:-1));
    }
    return;
  }
  if(event.key==='Escape'){event.preventDefault();closeProduct()}
  if(event.key==='Tab'){
    const controls=[...preview.querySelectorAll('a[href],button,iframe')].filter(el=>!el.hidden&&!el.inert&&el.getClientRects().length);
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
});

function paint(){
  const p=state.p,plain=staticMode(),title=plain?1:ease(.18,.23,p),second=plain?1:ease(.195,.245,p);
  const heroOut=plain?0:ease(.28,.335,p),entry=plain?1:ease(.31,DECK_START,p);
  const portal=ease(.015,.15,p),maskBase=Math.min(innerWidth*.52,innerHeight*.70);
  const aperture=mix(maskBase,Math.max(innerWidth,innerHeight)*5.3,Math.pow(portal,2.5));
  $('#logo-aperture').setAttribute('transform',`translate(${layout.width*.5} ${layout.height*.47}) scale(${aperture/180}) translate(-253 -222)`);
  $('.logo-curtain').style.opacity=1-ease(.105,.16,p);
  world?.setCurtain({width:layout.width,height:layout.height,aperture,opacity:1-ease(.145,.17,p),progress:p});
  root.style.setProperty('--opening',1-ease(.025,.12,p));
  root.style.setProperty('--portal-open',ease(.09,.16,p));
  root.style.setProperty('--mosaic-dim',mix(1,.34,title*(1-heroOut)));
  root.style.setProperty('--art-opacity','1');
  root.style.setProperty('--hero-shade',title*(1-heroOut));
  root.style.setProperty('--title',title.toFixed(4));root.style.setProperty('--second',second.toFixed(4));
  root.style.setProperty('--hero-out',heroOut.toFixed(4));root.style.setProperty('--logo-opacity','1');
  root.style.setProperty('--deck-visible',entry.toFixed(4));
  hero.inert=!plain&&(title<.1||heroOut>.98);hero.setAttribute('aria-hidden',String(hero.inert));
  const flight=flightProgress(p,products.length),front=flight.front;
  const openingTravel=1150*layerEase(0,.17,p);
  const cameraZ=p<.31?openingTravel:p<DECK_START?mix(1150,FIRST_DEPTH,entry):flight.depth;
  world?.update(cameraZ);
  const centered=entry>.98&&flight.ready;
  const ready=plain||centered;gallery.inert=!ready;gallery.setAttribute('aria-hidden',String(!ready));gallery.dataset.ready=String(ready);
  gallery.dataset.centered=String(centered);
  state.index=front;gallery.dataset.product=products[front].id;
  $('.deck-previous').disabled=front===0;$('.deck-next').disabled=front===products.length-1;
  // One camera moves through fixed world planes. DOM articles are only
  // accessible hit areas and labels over their matching rendered surfaces.
  state.artVisible=cameraZ<2300;
  cards.forEach(({article,link,index})=>{
    const pose=world?.projectMain(index)||{x:0,y:0,width:1,height:1,scale:1,roll:0,visible:false,zIndex:30};
    const visible=plain||index===front;
    applyProjection(article,{...pose,visible:pose.visible&&visible&&ready},plain);
    article.style.setProperty('--caption',plain?1:index===front&&centered?entry:0);
    article.dataset.visible=String(visible);article.dataset.front=String(index===front);
    article.inert=!ready||!visible;article.setAttribute('aria-hidden',String(!ready||!visible));
    link.tabIndex=ready&&(plain||index===front)?0:-1;
  });
  if(!plain&&p>.29){warmProduct(products[front]);if(products[front+1])warmProduct(products[front+1])}
  document.body.dataset.chapter=p<.085?'opening':ready?'products':'hero';
  document.body.dataset.flowReady='true';
}

function applyProjection(element,pose,plain=false){
  element.style.width=plain?'':pose.width+'px';element.style.height=plain?'':pose.height+'px';
  element.style.setProperty('--card-height',pose.height+'px');
  element.style.transform=plain?'none':`translate(${pose.x}px,${pose.y}px) translate(-50%,-50%) rotate(${pose.roll}deg) scale(${pose.scale})`;
  element.style.zIndex=pose.zIndex;element.style.visibility=plain||pose.visible?'visible':'hidden';
  element.style.opacity='1';element.dataset.projectedScale=pose.scale.toFixed(4);
}

async function ensureStage(){
  if(toys||loading||staticMode())return;loading=true;const started=performance.now();
  try{
    const api=await createToyStage($('#scene'),{transparent:true});api.render(0,0,0);toys=api;
    $('#scene canvas').addEventListener('webglcontextlost',()=>{state.webgl='fallback';document.body.dataset.webgl='fallback';setMode()});
    stageTime=0;lastTime=performance.now();state.webgl='ready';document.body.dataset.webgl='ready';document.body.classList.add('webgl-ready');document.body.dataset.sceneLoadMs=String(Math.round(performance.now()-started));dirty=true;
    createPortalTools($('#portal-tools')).then(api=>{tools=api}).catch(error=>console.warn('Tool preview unavailable',error));
  }catch(error){state.webgl='fallback';document.body.dataset.webgl='fallback';setMode();console.warn('3D unavailable; all destinations remain accessible.',error)}
}
function setMode(){if(!staticMode()&&!world){try{world=createDepthGallery(grid,depthLayers,cards,screenPoses)}catch(error){state.webgl='fallback';console.warn('Depth preview unavailable; static links retained.',error)}}document.body.dataset.motion=staticMode()?'reduced':'full';dirty=true;measure();if(staticMode()){scheduleProducts();finishClose?.()}else ensureStage()}
function frame(now){
  requestAnimationFrame(frame);const dt=Math.min(64,now-lastTime);lastTime=now;
  if(document.hidden||state.active)return;
  const plain=staticMode();state.p=mix(state.p,state.target,1-Math.exp(-dt/70));if(Math.abs(state.p-state.target)<.00002)state.p=state.target;
  if(toys&&!plain){stageTime+=dt;state.entry=clamp(stageTime/950);root.style.setProperty('--scene-entry',ease(0,.7,state.entry).toFixed(4))}
  if(state.entry>.75||state.p>.2)scheduleProducts();
  if(Math.abs(lastPaint-state.p)>.00002||dirty){paint();lastPaint=state.p}
  let artRendered=false;
  if(toys&&!plain&&state.artVisible&&now-lastRenderAt>1000/30){
    toys.render(0,state.entry,stageTime/1000,dt/1000,stageTime/1000);
    tools?.render(stageTime/1000,state.p);lastRenderAt=now;artRendered=true;
  }
  if(!plain)world?.render(state.entry,artRendered);
  dirty=false;
}
addEventListener('scroll',readScroll,{passive:true});addEventListener('resize',()=>{toys?.resize();tools?.resize();measure()});
addEventListener('pointermove',event=>{if(fine.matches&&!staticMode()&&!state.active&&event.pointerType==='mouse'&&state.p<.65)toys?.setPointer(event.clientX/innerWidth*2-1,event.clientY/innerHeight*2-1)},{passive:true});
const clearPointer=()=>toys?.setPointer();addEventListener('blur',clearPointer);document.addEventListener('pointerleave',clearPointer);
document.addEventListener('visibilitychange',()=>{lastTime=performance.now();if(!document.hidden)dirty=true});
reduced.addEventListener('change',setMode);document.fonts.ready.then(measure);
document.addEventListener('depth-world-lost',()=>{state.webgl='fallback';setMode()});
setMode();paint();requestAnimationFrame(frame);
