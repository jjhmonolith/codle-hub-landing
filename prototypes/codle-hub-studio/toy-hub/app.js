import { products } from './catalog.js?v=4';
import { createToyStage } from './toys.js?v=24';
import { createLandingSurface } from './landing-surface.js?v=50';
import { surfaceAt } from './surface-timeline.js?v=2';
import { createProductWorlds } from './product-worlds.js?v=3';
import { clamp,mix,ease,storyAt,productProgress,REEL_START } from './story-timeline.js?v=2';

const $=selector=>document.querySelector(selector);
history.scrollRestoration='manual';
if(!location.hash)window.scrollTo({top:0,behavior:'instant'});
const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
const journey=$('.journey'),stage=$('.stage'),hero=$('.hero'),gallery=$('.experiences'),grid=$('.product-grid');
const main=$('main'),header=$('.site-header'),preview=$('.preview'),previewContent=$('.preview-content'),fallback=$('.preview-fallback'),closeButton=$('.preview-close');
const state={p:0,target:0,active:null,webgl:'loading',index:0,entry:0};
const frames=new Map();
let toys=null,surface=null,loading=false,warming=false,returnFocus=null,loadTimer=0,extraLink=null,animation=null,closing=false,finishClose=null;
let lastPaint=-1,dirty=true,restoringFocus=false,captureAnimation=null;
const captureImage=$('.preview-capture');
const staticMode=()=>reduced.matches||state.webgl==='fallback';
const worlds=createProductWorlds($('.product-worlds'),products);
worlds.render(0,0,0);

const cards=products.map((product,i)=>{
  const article=document.createElement('article');article.className='product';article.id='product-'+product.id;
  const copy=document.createElement('div');copy.className='product-copy';
  const title=document.createElement('h2');title.textContent=product.name;copy.append(title);
  const link=document.createElement('a');link.className='product-link';link.href=product.url;link.setAttribute('aria-label',product.name+' 랜딩 열기');
  const windowEl=document.createElement('div');windowEl.className='product-window';
  const img=new Image();img.src='assets/'+product.image;img.alt=product.name+' 실제 랜딩 미리보기';img.decoding='async';img.draggable=false;
  const visit=document.createElement('span');visit.className='product-visit';visit.innerHTML='사이트 살펴보기 <b aria-hidden="true">↗</b>';
  windowEl.append(img,visit);link.append(windowEl);
  const description=document.createElement('p');description.className='product-description';description.textContent=product.description;
  article.append(copy,link,description);grid.append(article);
  link.addEventListener('click',event=>{
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    // Use the same rendered state that exposes this link. Product-specific
    // landing holds no longer share the old surface timeline's reveal window.
    if(!staticMode()&&link.getAttribute('aria-hidden')!=='false')return;
    openProduct(product,link,windowEl);
  });
  link.addEventListener('pointerenter',()=>warmProduct(product),{once:true});
  link.addEventListener('focus',()=>{
    if(staticMode()||restoringFocus||!link.matches(':focus-visible'))return;
    if(article.dataset.active!=='true'||link.getAttribute('aria-hidden')!=='false')goToProduct(i,.82);
  });
  return {article,link,windowEl};
});

function measure(){readScroll();dirty=true}
function readScroll(){state.target=clamp((scrollY-journey.offsetTop)/Math.max(1,journey.offsetHeight-innerHeight))}
function goToProduct(i,phase){
  phase??=[.36,.27,.37,.37,.44][clamp(i,0,products.length-1)]??.30;
  i=clamp(i,0,products.length-1);
  if(staticMode()){cards[i].article.scrollIntoView({block:'center'});return}
  window.scrollTo({top:journey.offsetTop+productProgress(i,products.length,phase)*(journey.offsetHeight-innerHeight),behavior:'smooth'});
}
function resetJourney(){window.scrollTo({top:0,behavior:staticMode()?'instant':'smooth'});toys?.setPointer()}
$('.explore-button').addEventListener('click',()=>goToProduct(0));
$('.wordmark').addEventListener('click',event=>{event.preventDefault();resetJourney()});
$('.skip-link').addEventListener('click',event=>{event.preventDefault();goToProduct(0,.80);setTimeout(()=>cards[0].link.focus({preventScroll:true}),staticMode()?0:850)});

function warmProduct(product){
  if(frames.has(product.id))return frames.get(product.id);
  const frame=document.createElement('iframe');frame.title=product.name+' 실제 랜딩';frame.referrerPolicy='strict-origin-when-cross-origin';frame.tabIndex=-1;frame.inert=true;frame.hidden=true;
  frame.dataset.product=product.id;frame.dataset.loadCount='0';
  const record={frame,loaded:false};frames.set(product.id,record);
  frame.addEventListener('load',()=>{record.loaded=true;frame.dataset.loaded='true';frame.dataset.loadCount=String(Number(frame.dataset.loadCount)+1);if(state.active?.id===product.id){fallback.hidden=true;clearTimeout(loadTimer)}});
  // Iframes stay in this parent: moving them would reload the live page.
  frame.src=product.url;previewContent.append(frame);return record;
}
function scheduleProducts(){
  if(warming)return;warming=true;
  const warm=()=>products.forEach((product,i)=>setTimeout(()=>warmProduct(product),i*450));
  if('requestIdleCallback' in window)requestIdleCallback(warm,{timeout:2000});else setTimeout(warm,300);
}
function openProduct(product,link,windowEl){
  if(state.active)return;
  const rect=windowEl.getBoundingClientRect(),record=warmProduct(product);
  state.active=product;returnFocus=link;toys?.setPointer();main.inert=true;header.inert=true;$('.skip-link').inert=true;document.body.style.overflow='hidden';
  $('.preview-poster').src='assets/'+product.image;preview.hidden=false;fallback.hidden=true;
  $('#preview-title').textContent=product.name;$('.preview-direct').href=product.url;fallback.querySelector('a').href=product.url;
  extraLink?.remove();extraLink=null;
  if(product.extra){extraLink=document.createElement('a');extraLink.href=product.extra.url;extraLink.textContent=product.extra.label;extraLink.target='_blank';extraLink.rel='noopener noreferrer';$('.preview-bar').insertBefore(extraLink,closeButton)}
  record.frame.inert=false;record.frame.removeAttribute('tabindex');record.frame.hidden=false;
  captureAnimation?.cancel();captureImage.hidden=true;
  if(!staticMode()){
    const source=surface?.capture(rect);
    if(source){captureImage.src=source;captureImage.hidden=false;captureAnimation=captureImage.animate([{opacity:1,offset:0},{opacity:1,offset:.38},{opacity:0,offset:1}],{duration:820,easing:'ease-in-out',fill:'forwards'});captureAnimation.onfinish=()=>{captureImage.hidden=true;captureAnimation?.cancel();captureAnimation=null}}
    animation=preview.animate([{transform:`translate(${rect.left}px,${rect.top}px) scale(${rect.width/innerWidth},${rect.height/innerHeight})`,borderRadius:'7px'},{transform:'none',borderRadius:'0'}],{duration:820,easing:'cubic-bezier(.2,.8,.2,1)'});
  }
  closeButton.focus({preventScroll:true});document.body.dataset.preview=product.id;
  if(!record.loaded)loadTimer=setTimeout(()=>{if(state.active?.id===product.id)fallback.hidden=false},8000);
}
function closeProduct(){
  if(!state.active||closing)return;
  closing=true;clearTimeout(loadTimer);
  const start={transform:getComputedStyle(preview).transform,borderRadius:getComputedStyle(preview).borderRadius};animation?.cancel();
  const record=frames.get(state.active.id),rect=returnFocus?.querySelector('.product-window')?.getBoundingClientRect();
  finishClose=()=>{
    record.frame.inert=true;record.frame.tabIndex=-1;record.frame.hidden=true;preview.hidden=true;animation?.cancel();animation=null;
    captureAnimation?.cancel();captureAnimation=null;captureImage.hidden=true;
    state.active=null;closing=false;finishClose=null;main.inert=false;header.inert=false;$('.skip-link').inert=false;document.body.style.overflow='';delete document.body.dataset.preview;
    restoringFocus=true;returnFocus?.focus({preventScroll:true});restoringFocus=false;dirty=true;
  };
  if(staticMode()||!rect?.width){finishClose();return}
  const source=surface?.capture(rect),captureOpacity=captureImage.hidden?0:Number(getComputedStyle(captureImage).opacity);
  captureAnimation?.cancel();
  if(source){captureImage.src=source;captureImage.hidden=false;captureAnimation=captureImage.animate([{opacity:captureOpacity},{opacity:1,offset:.72},{opacity:1}],{duration:470,easing:'ease-out',fill:'forwards'})}
  animation=preview.animate([start,{transform:`translate(${rect.left}px,${rect.top}px) scale(${rect.width/innerWidth},${rect.height/innerHeight})`,borderRadius:'7px',opacity:.35}],{duration:470,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  animation.onfinish=()=>finishClose?.();
}
closeButton.addEventListener('click',closeProduct);
document.addEventListener('keydown',event=>{
  if(state.active){
    if(event.key==='Escape'){event.preventDefault();closeProduct()}
    if(event.key==='Tab'){
      const controls=[...preview.querySelectorAll('a[href],button,iframe')].filter(el=>!el.hidden&&!el.inert&&el.getClientRects().length);
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
    return;
  }
  if(!staticMode()&&state.p>REEL_START&&(event.key==='ArrowRight'||event.key==='ArrowLeft')){event.preventDefault();goToProduct(state.index+(event.key==='ArrowRight'?1:-1))}
});

function paint(){
  const p=state.p,s=storyAt(p,products.length),plain=staticMode();
  const pass=plain?0:ease(.875,.95,s.reel)*(1-ease(1.37,1.48,s.reel));
  header.style.opacity=String(1-pass);if(!state.active)header.inert=pass>.9;
  const vars={'--p':p,'--intro':s.signature,'--title':s.title,'--second':s.second,'--title-out':s.titleOut,'--collection':s.collection,'--gold':s.gold};
  for(const [key,value]of Object.entries(vars))root.style.setProperty(key,value.toFixed(4));
  hero.inert=!plain&&(s.title*s.titleOut<.1);hero.setAttribute('aria-hidden',String(hero.inert));
  gallery.inert=!plain&&s.collection<.92;gallery.setAttribute('aria-hidden',String(gallery.inert));
  const scene=surface&&!plain?surface.render(s.reel,s.collection,ambientTime/1000):surfaceAt(s.reel,products.length);
  const active=scene.active;
  root.style.setProperty('--surface-surge',scene.surge.toFixed(4));
  root.style.setProperty('--surface-clarity',scene.copy.toFixed(4));
  gallery.dataset.stage=scene.reveal>.85?'landing':scene.spread>.05?'reveal':'features';
  cards.forEach(({article,link},i)=>{
    const copyVisible=plain||(!gallery.inert&&i===active&&scene.copy>.1);
    const visible=plain||(!gallery.inert&&i===active&&scene.reveal>.85);
    article.style.setProperty('--focus',plain?1:i===active?scene.copy:0);
    article.style.setProperty('--copy-y',((1-scene.copy)*24)+'px');
    if(scene.rect&&i===active){
      const rect=scene.rect;
      for(const [key,value]of Object.entries({'--surface-left':rect.left,'--surface-top':rect.top,'--surface-width':rect.width,'--surface-height':rect.height}))article.style.setProperty(key,value+'px');
    }
    article.dataset.visible=String(visible);article.dataset.active=String(i===active);article.inert=!copyVisible;article.setAttribute('aria-hidden',String(!copyVisible));
    link.inert=!visible;link.setAttribute('aria-hidden',String(!visible));link.tabIndex=visible?0:-1;
  });
  if(state.index!==active){state.index=active;$('.current-product').textContent=`${active+1} / ${products.length}, ${products[active].name}`}
  const chapter=s.opening<.105?'opening':s.opening<.33?'hero':'products';document.body.dataset.chapter=chapter;
  $('.explore-button').hidden=s.opening>.39&&!plain;
}
function setMode(){document.body.dataset.motion=staticMode()?'reduced':'full';dirty=true;measure();if(staticMode()){scheduleProducts();finishClose?.()}else ensureStage()}
async function ensureStage(){
  if(toys||loading||staticMode())return;loading=true;const started=performance.now();
  try{
    const api=await createToyStage($('#scene'));api.render(state.p,0,0);toys=api;
    surface=await createLandingSurface($('.landing-surface'),products,()=>{state.webgl='fallback';document.body.dataset.webgl='fallback';setMode()});
    stageTime=0;lastTime=performance.now();state.webgl='ready';document.body.dataset.webgl='ready';document.body.classList.add('webgl-ready');document.body.dataset.sceneLoadMs=String(Math.round(performance.now()-started));dirty=true;
  }catch(error){state.webgl='fallback';document.body.dataset.webgl='fallback';setMode();console.warn('3D unavailable; all destinations remain accessible.',error)}
}
let stageTime=0,ambientTime=0,lastTime=performance.now(),lastRenderAt=0;
function frame(now){
  requestAnimationFrame(frame);const dt=Math.min(64,now-lastTime);lastTime=now;
  if(document.hidden||state.active)return;
  const plain=staticMode();
  state.p=mix(state.p,state.target,1-Math.exp(-dt/75));if(Math.abs(state.p-state.target)<.00002)state.p=state.target;
  if(toys&&!plain){stageTime+=dt;ambientTime+=dt;state.entry=clamp(stageTime/950);root.style.setProperty('--scene-entry',ease(0,.7,state.entry).toFixed(4))}
  if(state.entry>.75||storyAt(state.p).opening>.12)scheduleProducts();
  const changed=Math.abs(lastPaint-state.p)>.00002||dirty;
  if(changed){paint();lastPaint=state.p}
  if(toys&&!plain&&(state.p<REEL_START||changed||now-lastRenderAt>1000/30)){
    toys.render(state.p,state.entry,stageTime/1000,dt/1000,ambientTime/1000);
    const story=storyAt(state.p,products.length);worlds.render(story.reel,story.collection,ambientTime/1000);
    if(surface&&!changed&&story.collection>.001)surface.render(story.reel,story.collection,ambientTime/1000);
    lastRenderAt=now;
  }
  dirty=false;
}
addEventListener('scroll',readScroll,{passive:true});addEventListener('resize',()=>{toys?.resize();surface?.resize();worlds.resize();measure()});
addEventListener('pointermove',event=>{if(fine.matches&&!staticMode()&&!state.active&&event.pointerType==='mouse'){const x=event.clientX/innerWidth*2-1,y=event.clientY/innerHeight*2-1;toys?.setPointer(x,y);surface?.setPointer(x,y)}},{passive:true});
const clearPointer=()=>{toys?.setPointer();surface?.setPointer()};
addEventListener('blur',clearPointer);document.addEventListener('pointerleave',clearPointer);
document.addEventListener('visibilitychange',()=>{lastTime=performance.now();if(!document.hidden)dirty=true});
reduced.addEventListener('change',setMode);document.fonts.ready.then(measure);
setMode();paint();requestAnimationFrame(frame);

