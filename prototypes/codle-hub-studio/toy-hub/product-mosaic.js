import {products as originalProducts} from './catalog.js?v=4';
const products=originalProducts.flatMap(p=>p.id==='textbook'?[{...p,name:'씨마스 인공지능 기초',extra:null},{id:'aidt',name:'금성·YBM 정보 교육자료',url:'https://exhibition.codle.io/',image:'actual-textbook.jpg'}]:[p]);
import {createMosaicObject} from './mosaic-service-art.js?v=50';
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
const finalSizes={platform:[.40,.42],contents:[.34,.58],textbook:[.26,.42],aidt:[.26,.58],camp:[.51,.42],jitda:[.23,.58]};
const entryStarted=performance.now(),logoLines=[...brand.querySelectorAll('.logo-line')],logoSolid=brand.querySelector('.logo-solid');
let layoutWidth=0,layoutHeight=0,drawnProgress=null;
// One continuous unfold: logo compression, card colour and seams share progress.
// Cubic-bezier(.72, 0, .14, 1): restrained start, a quick expansion, soft landing.
function unfoldEase(progress){
 if(progress<=0)return 0;if(progress>=1)return 1;
 let low=0,high=1;
 for(let i=0;i<18;i++){
  const u=(low+high)/2,v=1-u;
  const x=3*v*v*u*.72+3*v*u*u*.14+u*u*u;
  if(x<progress)low=u;else high=u;
 }
 const u=(low+high)/2;return u*u*(3-2*u);
}
function openingTimeline(age,instant=false){return instant?1:.9*unfoldEase(clamp((age-3700)/1800))}
function updateOpening(now=performance.now()){
 openingFrame=0;
 openingProgress=openingTimeline(now-entryStarted,openingSkipped||reduced.matches||innerWidth<=600);
 const desktop=innerWidth>600;
 const gutter=desktop?Math.max(6,Math.min(12,innerWidth*.0075)):0;
 if(desktop){board.style.gap=gutter+'px';outline.style.gap=gutter+'px'}
 drawnProgress=openingProgress;
 const intro=reduced.matches?1:clamp((now-entryStarted)/1900);
 const copyReveal=reduced.matches?1:ease(clamp((now-entryStarted-2020)/520));
 // A single entry clock draws the logo, reveals the copy, then unfolds the hub.
 const t=clamp(drawnProgress/.9);
 outline.hidden=true;
 const drawing=Math.max(intro,clamp(drawnProgress/.16));
 const stroke=ease(clamp(drawing/.82));
 for(const line of logoLines)line.style.strokeDashoffset=1.01*(1-stroke);
 logoSolid.style.opacity=ease(clamp((drawing-.61)/.39));
 const columns=[17+6*t,66-49*t,10+24*t,7+19*t];
 const rows=[8+24*t,6+4*t,72-56*t,14+28*t];
 if(desktop){
  for(const grid of [board,outline]){grid.style.gridTemplateColumns=columns.map(v=>v+'fr').join(' ');grid.style.gridTemplateRows=rows.map(v=>v+'fr').join(' ')}
 }
 const bw=board.clientWidth,bh=board.clientHeight;
 if(bw!==layoutWidth||bh!==layoutHeight){
  layoutWidth=bw;layoutHeight=bh;
  for(const product of products){const stage=tiles.get(product.id).querySelector('.object-stage'),[w,h]=finalSizes[product.id];
   if(desktop){stage.style.width=bw*w*(product.id==='contents'?1.12:.94)+'px';stage.style.height=Math.max(60,bh*h-106)+'px'}
  }
  for(const stage of volumes.values()){stage.resize();stage.render(elapsed,.033,true)}
 }
 const cw=core.clientWidth,ch=core.clientHeight;
 const baseWidth=(bw-gutter*3)*.66,baseHeight=(bh-gutter*3)*.72;
 const scale=desktop?Math.min(cw/baseWidth,ch/baseHeight):1;
 const fade=ease(clamp((t-.08)/.47));
 const copyWidth=Math.min(780,bw*.64);
 copy.style.width=copyWidth+'px';
 const copyHeight=copy.offsetHeight;
 const gap=Math.max(22,Math.min(36,bh*.045));
 const padding=Math.min(16,baseHeight*.04);
 const ratio=304.29/774.61;
 const desiredWidth=desktop?Math.min(820,baseWidth*.96):Math.min(280,bw*.6);
 const reserve=copyHeight+gap;
 const logoHeight=Math.max(1,Math.min(desiredWidth*ratio,baseHeight-padding*2-reserve));
 // The entire composition shares the cell's physical compression, not separate scale curves.
 composition.style.width=baseWidth+'px';composition.style.height=baseHeight+'px';
 composition.style.transform=`translate(-50%,-50%) scale(${scale})`;
 const recenter=ease(clamp((t-.58)/.42));
 const logoY=(baseHeight-reserve*(1-recenter))/2;
 brand.style.width=logoHeight/ratio+'px';brand.style.height=logoHeight+'px';
 brand.style.left='50%';brand.style.top=logoY+'px';
 brand.style.transform='translate(-50%,-50%)';brand.style.opacity=desktop?1:1-t;
 copy.style.left='50%';copy.style.top=(logoY+logoHeight/2+gap+copyHeight/2)+'px';
 copy.style.opacity=(1-fade)*copyReveal;
 copy.style.transform=`translate(-50%,calc(-50% + ${(1-copyReveal)*10}px))`;copy.inert=fade>.98||copyReveal===0;
 board.style.setProperty('--paper-cover',1-t);
 board.style.setProperty('--grid-reveal',t);
 const headerReveal=desktop&&!reduced.matches?ease(clamp((t-.8)/.2)):1;
 $('.masthead').style.opacity=headerReveal;
 $('.masthead').inert=headerReveal<.98;
 $('.explore-link').style.opacity=(1-fade)*copyReveal;
 $('.explore-link').inert=fade>.98||copyReveal===0;
 board.classList.toggle('is-revealed',t>.95);
 for(const product of products){const tile=tiles.get(product.id),stage=tile.querySelector('.object-stage');
  tile.style.opacity=1;tile.inert=t<.98;tile.classList.toggle('art-arrived',t>.82);volumes.get(product.id)?.setProgress(t);
  tile.querySelector('.tile-label').style.opacity=ease(clamp((t-.65)/.30));
  const fit=desktop?Math.max(.01,Math.min(1,(tile.clientWidth-24)/stage.offsetWidth,(tile.clientHeight-106)/stage.offsetHeight)):1;
  stage.style.opacity=ease(clamp((t-.12)/.76));
  stage.style.transform=`translate(-50%,-50%) scale(${fit})`;

 }
 if(openingProgress<.9||intro<1||copyReveal<1)queueOpening();
}
function queueOpening(){if(!openingFrame)openingFrame=requestAnimationFrame(updateOpening)}
addEventListener('resize',queueOpening);reduced.addEventListener('change',queueOpening);
$('.skip-link').addEventListener('click',e=>{e.preventDefault();openingSkipped=true;scrollTo({top:opening.offsetTop,behavior:'instant'});requestAnimationFrame(()=>{updateOpening();tiles.values().next().value.focus({preventScroll:true})})});
updateOpening();
document.fonts.ready.then(queueOpening);

async function init(){for(const p of products){try{const tile=tiles.get(p.id),stage=await createMosaicObject(tile.querySelector('.object-stage'),p.id);volumes.set(p.id,stage);stage.setProgress(clamp(drawnProgress/.9));tile.classList.add('is-ready')}catch(error){console.warn('Retaining authentic service image',p.id,error)}}}
init();
function warm(product){
 if(frames.has(product.id))return frames.get(product.id);
 const iframe=document.createElement('iframe');iframe.title=product.name+' 실제 랜딩';iframe.hidden=true;iframe.inert=true;iframe.tabIndex=-1;iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.dataset.product=product.id;
 const record={iframe,loaded:false};frames.set(product.id,record);iframe.addEventListener('load',()=>{record.loaded=true;iframe.dataset.loaded='true';if(opened?.id===product.id){clearTimeout(loadTimer);$('.preview-fallback').hidden=true}});iframe.src=product.url;modalContent.append(iframe);return record;
}
function open(product,tile){
 if(opened)return;opened=product;returnLink=tile;const record=warm(product);hub.inert=true;$('.codle-footer').inert=true;$('.masthead').inert=true;$('.skip-link').inert=true;document.body.style.overflow='hidden';
 $('#preview-title').textContent=visual[product.id][0];$('.preview-info').href='#service-'+product.id;$('.preview-direct').href=product.url;$('.preview-fallback a').href=product.url;$('.preview-fallback').hidden=true;$('.preview-poster').src='assets/'+product.image;
 extraLink?.remove();extraLink=null;if(product.extra){extraLink=document.createElement('a');extraLink.href=product.extra.url;extraLink.textContent=product.extra.label;extraLink.target='_blank';extraLink.rel='noopener noreferrer';$('.preview-bar').insertBefore(extraLink,closeButton)}
 const r=tile.getBoundingClientRect(),dx=innerWidth/2-r.left-r.width/2,dy=innerHeight/2-r.top-r.height/2,scale=Math.max(innerWidth/r.width,innerHeight/r.height)*1.03;tile.style.zIndex='20';
 const reveal=()=>{if(!opened||closing)return;preview.hidden=false;record.iframe.hidden=false;record.iframe.inert=false;record.iframe.removeAttribute('tabindex');closeButton.focus({preventScroll:true});animation=preview.animate([{opacity:0},{opacity:1}],{duration:reduced.matches?0:340,fill:'both'});animation.onfinish=()=>{animation?.cancel();animation=null};};
 if(reduced.matches)reveal();else{zoom=tile.animate([{transform:'none'},{transform:`translate(${dx}px,${dy}px) scale(${scale})`}],{duration:850,easing:'cubic-bezier(.65,0,.25,1)',fill:'forwards'});zoom.onfinish=reveal;}
 loadTimer=setTimeout(()=>{if(opened?.id===product.id&&!record.loaded)$('.preview-fallback').hidden=false},8000);
}
function close(){if(!opened||closing)return;closing=true;clearTimeout(loadTimer);animation?.cancel();const tile=returnLink,record=frames.get(opened.id);const finish=()=>{record.iframe.hidden=true;record.iframe.inert=true;record.iframe.tabIndex=-1;preview.hidden=true;animation?.cancel();animation=null;zoom?.cancel();zoom=null;tile.style.zIndex='';opened=null;closing=false;hub.inert=false;$('.codle-footer').inert=false;$('.masthead').inert=false;$('.skip-link').inert=false;document.body.style.overflow='';returnLink?.focus({preventScroll:true})};if(reduced.matches){finish();return}zoom?.reverse();animation=preview.animate([{opacity:1},{opacity:0}],{duration:320,fill:'forwards'});animation.onfinish=()=>{preview.hidden=true;setTimeout(finish,530)}}
closeButton.addEventListener('click',close);document.addEventListener('keydown',e=>{if(!opened)return;if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const controls=[...preview.querySelectorAll('a[href],button,iframe')].filter(el=>!el.hidden&&!el.inert&&el.getClientRects().length);if(e.shiftKey&&document.activeElement===controls[0]){e.preventDefault();controls.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===controls.at(-1)){e.preventDefault();controls[0].focus()}}});
addEventListener('resize',()=>{for(const stage of volumes.values()){stage.resize();stage.render(elapsed,.033,true)}});reduced.addEventListener('change',()=>{for(const stage of volumes.values()){stage.setPointer();stage.render(0,.033,true)}});

$('.preview-info').addEventListener('click',e=>{e.preventDefault();const id=opened?.id;close();setTimeout(()=>$('#service-'+id)?.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'}),reduced.matches?0:900)});
