import {products} from './catalog.js?v=4';
import {createToyStage} from './toys.js?v=26';
import {createServiceVolume} from './service-volumes.js?v=3';
const $=s=>document.querySelector(s),root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
const links=[...document.querySelectorAll('.destination')],hub=$('.hub'),field=$('.visual-field'),preview=$('.preview');
const intro=$('.intro');let introDone=false,introLeaving=false,introTimer=0,introStart=0;
let dockTargets=[];
hub.inert=true;
const modalContent=$('.preview-content'),closeButton=$('.preview-close'),cover=$('.transition-image');
const artwork={
platform:{accent:'#2859e5',paper:'#f0eee8',support:'worlds/codle-tools-ui.png',detail:'worlds/thumbnail-python-data.webp'},
contents:{accent:'#c54730',paper:'#f2eee7',support:'worlds/thumbnail-everyday-ai.webp',detail:'worlds/thumbnail-climate-data.webp'},
textbook:{accent:'#36795a',paper:'#eef0e8',support:'worlds/cmass-page33.png',detail:'worlds/textbook-river-board.png'},
camp:{accent:'#b15b27',paper:'#f3ede5',support:'worlds/camp-code.png',detail:'worlds/camp-block.png'},
jitda:{accent:'#7252ba',paper:'#efecf2',support:'worlds/jitda-official-demo.png',detail:'worlds/jitda-worker-side.svg'}};
const sets=new Map(),frames=new Map(),volumes=new Map(),volumeLoads=new Map();
let selected=null,opened=null,closing=false,returnLink=null,warmTimer=0,loadTimer=0,animation=null,extraLink=null;
let hoverIntent=0,sceneOrder=0;
const sceneAnimations=new Map();
let toys=null,tools=null,last=performance.now(),elapsed=3,lastRender=0,staticPainted=false;
const contentImages=['everyday-ai','python-data','climate-data','esg','microbit','ocean-data','p8-im1','p8-im2','p8-im3','p8-im4','p9-im0','p9-im4'];
const scenes={platform:'content-ai.png',textbook:'worlds/cmass-page33.png',camp:'worlds/camp-team.png',jitda:'worlds/jitda-official-demo.png'};
for(const p of products){
 const set=document.createElement('div');set.className='visual-set';set.dataset.product=p.id;
 const figure=document.createElement('figure');figure.className='landing-image';
 if(p.id==='contents'){
  const wall=document.createElement('div');wall.className='content-wall';
  for(const name of contentImages){const img=new Image();img.src='assets/worlds/thumbnail-'+name+'.webp';img.alt='';img.decoding='async';wall.append(img)}
  figure.append(wall);
 }else{
  const img=new Image();img.src='assets/'+scenes[p.id];img.alt='';img.decoding='async';figure.append(img);
 }
 set.append(figure);field.append(set);sets.set(p.id,set);
}
function prepareVolume(id){
 if(volumeLoads.has(id))return volumeLoads.get(id);
 const set=sets.get(id),mount=document.createElement('div');mount.className='service-volume';set.querySelector('figure').append(mount);
 const promise=createServiceVolume(mount,id).then(stage=>{volumes.set(id,stage);set.classList.add('volume-ready');staticPainted=false;return stage}).catch(error=>{mount.remove();console.warn('Service volume unavailable; authentic image retained.',id,error)});volumeLoads.set(id,promise);return promise;
}
function updateDockTargets(){
 const bounds=$('#scene').getBoundingClientRect();
 dockTargets=[...document.querySelectorAll('.masthead img')].map(img=>{const r=img.getBoundingClientRect();return {x:r.left+r.width/2-bounds.left,y:r.top+r.height/2-bounds.top,size:25}});
}
function finishIntro(){
 if(introDone||introLeaving)return;introLeaving=true;introStart=performance.now();updateDockTargets();clearTimeout(introTimer);document.body.dataset.intro='leaving';
 const focusHub=intro.contains(document.activeElement);
 setTimeout(()=>{introDone=true;introLeaving=false;intro.hidden=true;hub.inert=false;document.body.dataset.intro='done';if(focusHub)links[0].focus({preventScroll:true})},reduced.matches?0:1850);
}
$('.intro-skip').addEventListener('click',finishIntro);
intro.addEventListener('wheel',event=>{if(event.deltaY>8)finishIntro()},{passive:true});
document.addEventListener('keydown',event=>{if(!introDone&&['Escape','ArrowDown','PageDown'].includes(event.key)){event.preventDefault();finishIntro()}});
introTimer=setTimeout(finishIntro,reduced.matches?900:5000);

function transitionScene(id,previous){
 const direction=previous&&products.findIndex(p=>p.id===id)<products.findIndex(p=>p.id===previous)?-1:1;
 const snapshots=new Map([...sets].map(([key,set])=>{const style=getComputedStyle(set);return [key,{opacity:Number(style.opacity),transform:style.transform,reveal:style.getPropertyValue('--scene-reveal').trim()||'125%'}]}));
 for(const list of sceneAnimations.values())list.forEach(a=>a.cancel());sceneAnimations.clear();
 for(const [key,set] of sets){
  const snap=snapshots.get(key),incoming=key===id;
  set.classList.toggle('is-current',incoming);
  if(reduced.matches||!previous){set.style.opacity=incoming?'1':'0';set.style.visibility=incoming?'visible':'hidden';set.style.transform='none';set.style.setProperty('--scene-reveal','125%');continue}
  if(!incoming&&snap.opacity<.015){set.style.visibility='hidden';set.style.opacity='0';continue}
  set.style.visibility='visible';set.style.willChange='transform,opacity';
  const fresh=snap.opacity<.015;
  const startTransform=fresh?`translate3d(${direction*5}%,0,0) scale(1.11)`:snap.transform;
  set.style.setProperty('--scene-reveal',incoming&&fresh?'-25%':snap.reveal);
  if(incoming){set.style.zIndex=String(++sceneOrder);set.style.setProperty('--scene-angle',direction>0?'270deg':'90deg')}
  const frames=incoming?[{opacity:fresh?0:snap.opacity,transform:startTransform},{opacity:1,transform:'translate3d(0,0,0) scale(1)'}]:[{opacity:snap.opacity,transform:snap.transform},{opacity:snap.opacity*.85,offset:.65},{opacity:0,transform:`translate3d(${-direction*3}%,0,0) scale(1.06)`}];
  const motion=set.animate(frames,{duration:incoming?1100:1000,easing:'cubic-bezier(.22,.68,0,1)',fill:'forwards'});
  const list=[motion];
  if(incoming)list.push(set.animate([{'--scene-reveal':fresh?'-25%':snap.reveal},{'--scene-reveal':'125%'}],{duration:1000,easing:'cubic-bezier(.3,.65,.15,1)',fill:'forwards'}));
  sceneAnimations.set(key,list);
  motion.onfinish=()=>{if(sceneAnimations.get(key)!==list)return;set.style.opacity=incoming?'1':'0';set.style.visibility=incoming?'visible':'hidden';set.style.transform='none';set.style.setProperty('--scene-reveal','125%');set.style.willChange='auto';list.forEach(a=>a.cancel());sceneAnimations.delete(key)};
 }
}
function select(id){
 if(opened||id===selected)return;const previous=selected;selected=id;const product=products.find(p=>p.id===id),art=artwork[id];
 hub.dataset.product=id;staticPainted=false;root.style.setProperty('--accent',art.accent);root.style.setProperty('--paper',art.paper);
 for(const link of links){const on=link.dataset.product===id;link.classList.toggle('is-active',on);if(on)link.setAttribute('aria-describedby','service-description');else link.removeAttribute('aria-describedby')}
 transitionScene(id,previous);prepareVolume(id);
 $('#service-description').textContent=product.description;clearTimeout(warmTimer);warmTimer=setTimeout(()=>warm(product),180);
}
links.forEach((link,i)=>{
 link.addEventListener('pointerenter',()=>{clearTimeout(hoverIntent);hoverIntent=setTimeout(()=>select(link.dataset.product),85)});link.addEventListener('pointerleave',()=>clearTimeout(hoverIntent));link.addEventListener('focus',()=>{clearTimeout(hoverIntent);select(link.dataset.product)});
 link.addEventListener('click',event=>{if(event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;event.preventDefault();clearTimeout(hoverIntent);select(link.dataset.product);open(products[i],link)});
 link.addEventListener('keydown',event=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();const index=event.key==='Home'?0:event.key==='End'?4:(i+(event.key==='ArrowUp'?-1:1)+5)%5;links[index].focus()});
});
function warm(product){
 if(frames.has(product.id))return frames.get(product.id);
 const iframe=document.createElement('iframe');iframe.title=product.name+' 실제 랜딩';iframe.hidden=true;iframe.inert=true;iframe.tabIndex=-1;
 iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.dataset.product=product.id;iframe.dataset.loadCount='0';
 const record={iframe,loaded:false};frames.set(product.id,record);
 iframe.addEventListener('load',()=>{record.loaded=true;iframe.dataset.loaded='true';iframe.dataset.loadCount=String(Number(iframe.dataset.loadCount)+1);if(opened?.id===product.id){clearTimeout(loadTimer);$('.preview-fallback').hidden=true}});
 iframe.src=product.url;modalContent.append(iframe);return record;
}
function rectFrame(id){const r=sets.get(id).querySelector('.landing-image').getBoundingClientRect();return {left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'}}
function fullFrame(){return {left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px'}}
function open(product,link){
 if(opened)return;const record=warm(product);returnLink=link;opened=product;
 hub.inert=true;$('.masthead').inert=true;$('.skip-link').inert=true;document.body.style.overflow='hidden';document.body.dataset.preview=product.id;
 $('#preview-title').textContent=link.querySelector('.destination-name').textContent;$('.preview-direct').href=product.url;$('.preview-fallback a').href=product.url;$('.preview-fallback').hidden=true;
 $('.preview-poster').src='assets/'+product.image;cover.src='assets/'+product.image;extraLink?.remove();extraLink=null;
 if(product.extra){extraLink=document.createElement('a');extraLink.href=product.extra.url;extraLink.textContent=product.extra.label;extraLink.target='_blank';extraLink.rel='noopener noreferrer';$('.preview-bar').insertBefore(extraLink,closeButton)}
 record.iframe.hidden=false;record.iframe.inert=false;record.iframe.removeAttribute('tabindex');preview.hidden=false;cover.hidden=false;cover.style.opacity='1';closeButton.focus({preventScroll:true});
 const finish=()=>{animation=null;if(!opened||closing)return;const fade=cover.animate([{opacity:1},{opacity:0}],{duration:reduced.matches?0:240,fill:'forwards'});fade.onfinish=()=>{cover.hidden=true;fade.cancel()}};
 if(reduced.matches)finish();else{animation=preview.animate([{opacity:0,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:480,easing:'cubic-bezier(.19,1,.22,1)'});animation.onfinish=finish}
 loadTimer=setTimeout(()=>{if(opened?.id===product.id&&!record.loaded)$('.preview-fallback').hidden=false},8000);
}
function close(){
 if(!opened||closing)return;closing=true;clearTimeout(loadTimer);const id=opened.id,r=preview.getBoundingClientRect();animation?.cancel();cover.getAnimations().forEach(a=>a.cancel());cover.hidden=true;
 const finish=()=>{const record=frames.get(id);record.iframe.hidden=true;record.iframe.inert=true;record.iframe.tabIndex=-1;preview.hidden=true;cover.hidden=true;animation?.cancel();animation=null;opened=null;closing=false;document.body.style.overflow='';delete document.body.dataset.preview;hub.inert=false;$('.masthead').inert=false;$('.skip-link').inert=false;returnLink?.focus({preventScroll:true})};
 if(reduced.matches){finish();return}
 animation=preview.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(1.02)'}],{duration:360,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});animation.onfinish=finish;
}
closeButton.addEventListener('click',close);
document.addEventListener('keydown',event=>{
 if(!opened)return;if(event.key==='Escape'){event.preventDefault();close()}
 if(event.key==='Tab'){const controls=[...preview.querySelectorAll('a[href],button,iframe')].filter(e=>!e.hidden&&!e.inert&&e.getClientRects().length);if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls.at(-1).focus()}else if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0].focus()}}
});
async function initArt(){
 try{toys=await createToyStage($('#scene'),{transparent:true,introDock:true});toys.render(0,1,3);staticPainted=false;$('#scene').classList.add('ready');if(!introDone&&!introLeaving){clearTimeout(introTimer);introTimer=setTimeout(finishIntro,reduced.matches?700:2400)}}catch(e){console.warn('Logo preview unavailable; service links remain available.',e)}
 // Additional 3D scenes initialize on selection, keeping the opening free of shader compilation.
}
function render(now){
 requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden||opened)return;elapsed+=dt;if(now-lastRender<1000/30)return;lastRender=now;
 if(reduced.matches){if(!staticPainted){toys?.render(0,1,3,0);volumes.get(selected)?.render(0,.033,true);staticPainted=true}return}
 if(!introDone){const q=introLeaving?Math.min(1,(now-introStart)/1800):0;toys?.setDock(q,dockTargets);$('#scene').style.opacity=String(1-Math.max(0,(q-.86)/.14));toys?.render(0,1,elapsed,dt,elapsed);}
 for(const [id,stage] of volumes)if(id===selected||sceneAnimations.has(id))stage.render(elapsed,dt);
}
addEventListener('resize',()=>{toys?.resize();updateDockTargets();for(const stage of volumes.values())stage.resize();staticPainted=false});reduced.addEventListener('change',()=>{staticPainted=false;toys?.setPointer();transitionScene(selected,null)});addEventListener('pointermove',event=>{if(!opened&&!reduced.matches){const x=event.clientX/innerWidth-.5,y=event.clientY/innerHeight-.5;toys?.setPointer(x*.5,y*.5);volumes.get(selected)?.setPointer(x,y)}},{passive:true});
document.addEventListener('pointerleave',()=>toys?.setPointer());document.fonts.ready.then(()=>document.body.dataset.ready='true');
select('platform');initArt();requestAnimationFrame(render);
