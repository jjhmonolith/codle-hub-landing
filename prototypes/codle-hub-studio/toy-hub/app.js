import { products } from './catalog.js';
import { createToyStage } from './toys.js?v=5';

const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const journey=document.querySelector('.journey');
const hero=document.querySelector('.hero');
const gallery=document.querySelector('.experiences');
const grid=document.querySelector('.product-grid');
const main=document.querySelector('main');
const header=document.querySelector('.site-header');
const preview=document.querySelector('.preview');
const previewContent=document.querySelector('.preview-content');
const previewFallback=document.querySelector('.preview-fallback');
const closeButton=document.querySelector('.preview-close');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const state={progress:0,target:0,active:null,entry:0,webgl:false};
const frames=new Map();
let returnFocus=null,openTimer=0,loadTimeout=0,extraLink=null;

document.querySelector('.experience-count').textContent=String(products.length).padStart(2,'0')+' EXPERIENCES';
const cards=products.map((product,i)=>{
  const article=document.createElement('article');article.className='product';
  const link=document.createElement('a');link.className='product-link';link.href=product.url;
  link.setAttribute('aria-label',product.name+' 실제 랜딩 열기');
  const windowEl=document.createElement('div');windowEl.className='product-window';
  const img=new Image();img.src='assets/'+product.image;img.alt=product.name+' 랜딩 첫 화면';img.decoding='async';
  const num=document.createElement('span');num.className='product-number';num.textContent=String(i+1).padStart(2,'0');
  windowEl.append(img,num);
  const meta=document.createElement('div');meta.className='product-meta';
  const title=document.createElement('h3');title.textContent=product.name;
  const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
  meta.append(title,arrow);
  const description=document.createElement('p');description.className='product-description';description.textContent=product.description;
  link.append(windowEl,meta,description);article.append(link);grid.append(article);
  link.addEventListener('click',event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();openProduct(product,link,windowEl)});
  return {article,link,windowEl};
});

function warmProduct(product){
  if(frames.has(product.id))return frames.get(product.id);
  const frame=document.createElement('iframe');frame.title=product.name+' 실제 랜딩';frame.referrerPolicy='strict-origin-when-cross-origin';frame.tabIndex=-1;frame.inert=true;
  const record={frame,loaded:false};frames.set(product.id,record);frame.hidden=true;frame.dataset.product=product.id;frame.dataset.loadCount='0';
  frame.addEventListener('load',()=>{record.loaded=true;frame.dataset.loadCount=String(Number(frame.dataset.loadCount)+1);if(state.active?.id===product.id){previewFallback.hidden=true;clearTimeout(loadTimeout)}});
  frame.src=product.url;previewContent.append(frame);return record;
}
function warmAll(){products.forEach((product,i)=>setTimeout(()=>warmProduct(product),i*350))}
if('requestIdleCallback' in window)requestIdleCallback(warmAll,{timeout:2500});else setTimeout(warmAll,1400);

function openProduct(product,link,windowEl){
  if(state.active)return;
  const rect=windowEl.getBoundingClientRect();
  const record=warmProduct(product);state.active=product;returnFocus=link;
  main.inert=true;header.inert=true;document.body.style.overflow='hidden';
  preview.hidden=false;previewFallback.hidden=true;
  document.querySelector('#preview-title').textContent=product.name;
  document.querySelector('.preview-direct').href=product.url;previewFallback.querySelector('a').href=product.url;
  extraLink?.remove();extraLink=null;
  if(product.extra){extraLink=document.createElement('a');extraLink.href=product.extra.url;extraLink.textContent=product.extra.label;extraLink.target='_blank';extraLink.rel='noopener';document.querySelector('.preview-bar').insertBefore(extraLink,closeButton)}
  // Keep every preloaded iframe in the same parent for its entire lifetime.
  // Reparenting an iframe reloads it in browsers without moveBefore support.
  record.frame.inert=false;record.frame.removeAttribute('tabindex');
  record.frame.hidden=false;
  if(!reduced.matches){preview.animate([{transform:`translate(${rect.left}px,${rect.top}px) scale(${rect.width/innerWidth},${rect.height/innerHeight})`,borderRadius:'12px',opacity:.75},{transform:'none',borderRadius:'0',opacity:1}],{duration:720,easing:'cubic-bezier(.22,1,.36,1)'})}
  closeButton.focus({preventScroll:true});
  if(!record.loaded)loadTimeout=setTimeout(()=>{if(state.active?.id===product.id)previewFallback.hidden=false},8000);
  document.body.dataset.preview=product.id;
}
function closeProduct(){
  if(!state.active)return;
  const record=frames.get(state.active.id);clearTimeout(loadTimeout);clearTimeout(openTimer);
  record.frame.inert=true;record.frame.tabIndex=-1;
  record.frame.hidden=true;
  preview.hidden=true;state.active=null;main.inert=false;header.inert=false;document.body.style.overflow='';
  delete document.body.dataset.preview;returnFocus?.focus({preventScroll:true});
}
closeButton.addEventListener('click',closeProduct);
document.addEventListener('keydown',event=>{
  if(!state.active)return;
  if(event.key==='Escape'){event.preventDefault();closeProduct()}
  if(event.key==='Tab'){
    const controls=[...preview.querySelectorAll('a[href],button,iframe')].filter(el=>!el.hidden&&!el.inert&&el.getClientRects().length>0);
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
});

function goToProducts(){
  const end=journey.offsetHeight-innerHeight;
  window.scrollTo({top:end,behavior:reduced.matches?'instant':'smooth'});
  if(reduced.matches){gallery.inert=false;gallery.setAttribute('aria-hidden','false')}
}
document.querySelector('.explore-button').addEventListener('click',goToProducts);
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();goToProducts();setTimeout(()=>cards[0]?.link.focus({preventScroll:true}),reduced.matches?0:700)});
document.querySelector('.replay').addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}));
document.querySelector('.wordmark').addEventListener('click',event=>{event.preventDefault();window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'})});
function readScroll(){state.target=reduced.matches?1:clamp(scrollY/Math.max(1,journey.offsetHeight-innerHeight))}
addEventListener('scroll',readScroll,{passive:true});addEventListener('resize',readScroll);reduced.addEventListener('change',readScroll);readScroll();

const introCaption=document.querySelector('.intro-caption');
const chapterName=document.querySelector('.chapter-name');
const chapterHint=document.querySelector('.chapter-hint');
const replay=document.querySelector('.replay');
const explore=document.querySelector('.explore-button');
function paintUI(p){
  const intro=1-smooth(.025,.15,p);
  const heroIn=smooth(.23,.34,p)*(1-smooth(.59,.68,p));
  const galleryIn=smooth(.65,.73,p);
  root.style.setProperty('--p',p.toFixed(4));root.style.setProperty('--intro',intro.toFixed(4));
  root.style.setProperty('--hero',heroIn.toFixed(4));root.style.setProperty('--gallery',galleryIn.toFixed(4));
  introCaption.setAttribute('aria-hidden',String(intro<.05));
  hero.inert=heroIn<.2;hero.setAttribute('aria-hidden',String(heroIn<.2));
  gallery.inert=galleryIn<.95;gallery.setAttribute('aria-hidden',String(galleryIn<.95));
  cards.forEach(({article,link},i)=>{
    const start=.70+i*(.23/Math.max(1,cards.length-1));
    const reveal=reduced.matches?1:smooth(start,start+.055,p);
    article.style.setProperty('--reveal',reveal.toFixed(4));link.tabIndex=reveal>.95?0:-1;
  });
  chapterName.textContent=p<.24?'01 / HELLO':p<.65?'02 / POSSIBILITIES':'03 / YOUR NEXT';
  chapterHint.firstChild.textContent=p<.24?'스크롤해서 만나보세요 ':p<.65?'다음 재미를 만나보세요 ':'마음에 드는 시작을 골라보세요 ';
  chapterHint.hidden=p>.96;replay.hidden=p<=.96||reduced.matches;explore.hidden=p>.76;
  document.body.dataset.chapter=p<.24?'opening':p<.65?'hero':'products';
}

let toys=null,readyAt=0,lastPaint=-1,lastRender=-1,lastTime=performance.now(),dirty=true;
if(!reduced.matches){
  createToyStage(document.querySelector('#scene')).then(api=>{
    toys=api;readyAt=performance.now();document.body.classList.add('webgl-ready');
    document.body.dataset.webgl='ready';dirty=true;
  }).catch(error=>{document.body.dataset.webgl='fallback';console.warn('Static brand visual displayed.',error)});
}
function frame(now){
  requestAnimationFrame(frame);
  if(document.hidden||state.active){lastTime=now;return}
  const dt=Math.min(64,now-lastTime);lastTime=now;
  state.progress=reduced.matches?1:lerp(state.progress,state.target,1-Math.exp(-dt/90));
  if(Math.abs(state.progress-state.target)<.0001)state.progress=state.target;
  state.entry=reduced.matches?1:clamp((now-readyAt)/1750);
  if(Math.abs(state.progress-lastPaint)>.00005||dirty){paintUI(state.progress);lastPaint=state.progress}
  if(toys&&(state.progress<.80||state.entry<1||Math.abs(state.progress-lastRender)>.00003||dirty)){
    toys.render(state.progress,state.entry,reduced.matches?0:Math.max(0,(now-readyAt-1750)/1000));lastRender=state.progress;dirty=false;
  }
}
addEventListener('resize',()=>{toys?.resize();dirty=true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)dirty=true});
reduced.addEventListener('change',()=>{dirty=true});
document.querySelector('.replay').addEventListener('click',()=>{readyAt=performance.now();dirty=true});
paintUI(state.target);requestAnimationFrame(frame);


