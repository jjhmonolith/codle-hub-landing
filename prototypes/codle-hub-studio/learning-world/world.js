import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { HDRLoader } from './vendor/HDRLoader.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { products } from './catalog.js';

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

function paintUI(p){
  const intro=1-smooth(.035,.16,p);
  const heroIn=smooth(.43,.51,p)*(1-smooth(.65,.72,p));
  const galleryIn=smooth(.73,.80,p);
  const wash=smooth(.39,.49,p)*.58+smooth(.70,.80,p)*.30;
  root.style.setProperty('--p',p.toFixed(4));root.style.setProperty('--intro',intro.toFixed(4));
  root.style.setProperty('--hero',heroIn.toFixed(4));root.style.setProperty('--gallery',galleryIn.toFixed(4));root.style.setProperty('--wash',wash.toFixed(4));
  hero.setAttribute('aria-hidden',String(heroIn<.2));
  hero.inert=heroIn<.2;
  document.querySelector('.intro-note').setAttribute('aria-hidden',String(intro<.05));
  document.querySelector('.object-caption').setAttribute('aria-hidden',String(intro<.05));
  gallery.setAttribute('aria-hidden',String(galleryIn<.9));gallery.inert=galleryIn<.9;
  cards.forEach(({article,link},i)=>{const start=.775+i*(.17/Math.max(1,cards.length-1));const reveal=reduced.matches?1:smooth(start,start+.045,p);article.style.setProperty('--reveal',reveal.toFixed(4));link.tabIndex=reveal>.95?0:-1});
  document.querySelector('.chapter-name').textContent=p<.4?'01 — 시작의 문':p<.72?'02 — 새로운 가능성':'03 — 나의 다음 시작';
  document.querySelector('.chapter-hint').firstChild.textContent=p<.4?'스크롤해 문을 열어보세요  ':p<.72?'다음 시작을 만나보세요  ':'마음에 드는 시작을 골라보세요  ';
  document.querySelector('.chapter-hint').hidden=p>.94;
  document.querySelector('.replay').hidden=p<=.94||reduced.matches;
  document.querySelector('.explore-button').hidden=p>.78;
  document.body.dataset.chapter=p<.4?'opening':p<.72?'hero':'products';
}

let sceneAPI=null;
try{if(!reduced.matches)sceneAPI=createWorld()}catch(error){console.warn('Showing a static opening because WebGL is unavailable.',error);document.body.dataset.webgl='fallback'}

function createWorld(){
  const mount=document.querySelector('#scene');
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;mount.append(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#bfc8d6');scene.fog=new THREE.FogExp2('#bfc8d6',.019);
  const camera=new THREE.PerspectiveCamera(38,1,.08,180);
  const hemi=new THREE.HemisphereLight('#cfddf5','#5b6474',.8);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff1dd',2.5);sun.position.set(-10,12,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:55});sun.shadow.normalBias=.025;sun.shadow.bias=-.0001;sun.shadow.radius=4;scene.add(sun);
  const rim=new THREE.DirectionalLight('#8daaff',1.5);rim.position.set(4,9,-10);scene.add(rim);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const roomMap=pmrem.fromScene(room,.03);scene.environment=roomMap.texture;scene.environmentIntensity=.4;room.dispose();pmrem.dispose();
  new HDRLoader().load('assets/quarry-sky.hdr',texture=>{texture.mapping=THREE.EquirectangularReflectionMapping;scene.environment=texture;scene.environmentIntensity=.45},undefined,()=>{});
  const loader=new THREE.TextureLoader();
  const sand=loader.load('assets/sand-diff.jpg');sand.colorSpace=THREE.SRGBColorSpace;sand.wrapS=sand.wrapT=THREE.RepeatWrapping;sand.repeat.set(24,24);sand.anisotropy=4;
  const sandNormal=loader.load('assets/sand-normal.jpg');sandNormal.wrapS=sandNormal.wrapT=THREE.RepeatWrapping;sandNormal.repeat.set(24,24);
  const groundGeo=new THREE.PlaneGeometry(160,160,180,180);groundGeo.rotateX(-Math.PI/2);
  const positions=groundGeo.attributes.position;
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),z=positions.getZ(i),dist=Math.sqrt(x*x+z*z);
    const hills=Math.sin(x*.12+z*.09)*1.8+Math.cos(z*.19-x*.08)*1.1+Math.sin(x*.31+z*.25)*.3;
    const hallClearance=z< -5&&z> -44? smooth(12,18,Math.abs(x)):1;
    const flat=smooth(7,19,dist)*smooth(1.8,5.0,Math.abs(x))*hallClearance;
    const ridge=Math.pow(Math.abs(Math.sin(x*.048+z*.032)),2)*4.5;
    positions.setY(i,-.14+flat*(hills+ridge));
  }
  groundGeo.computeVertexNormals();
  const ground=new THREE.Mesh(groundGeo,new THREE.MeshStandardMaterial({map:sand,normalMap:sandNormal,color:'#c4cbd6',normalScale:new THREE.Vector2(.65,.65),roughness:.96}));ground.receiveShadow=true;scene.add(ground);
  const surfaceNormal=loader.load('assets/sand-normal.jpg');surfaceNormal.wrapS=surfaceNormal.wrapT=THREE.RepeatWrapping;surfaceNormal.repeat.set(.8,.8);
  const stoneMap=loader.load('assets/sand-diff.jpg');stoneMap.colorSpace=THREE.SRGBColorSpace;stoneMap.wrapS=stoneMap.wrapT=THREE.RepeatWrapping;stoneMap.repeat.set(.8,.8);
  const stone=new THREE.MeshStandardMaterial({color:'#d1d6e1',map:stoneMap,roughness:.82,normalMap:surfaceNormal,normalScale:new THREE.Vector2(.35,.35)});
  const edge=new THREE.MeshPhysicalMaterial({color:'#96a9c7',metalness:.85,roughness:.23,clearcoat:.35});
  const blue=new THREE.MeshPhysicalMaterial({color:'#2250e6',metalness:.4,roughness:.21,clearcoat:1,clearcoatRoughness:.16});
  const platformMaterial=new THREE.MeshStandardMaterial({color:'#c2c9d3',roughness:.85,normalMap:surfaceNormal,normalScale:new THREE.Vector2(.15,.15)});
  function roundedShape(w,h,r){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s}
  function slab(w,h,d,r,material){const geo=new THREE.ExtrudeGeometry(roundedShape(w,h,r),{depth:d,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.04,bevelThickness:.04,curveSegments:12});geo.translate(0,0,-d/2);return new THREE.Mesh(geo,material)}
  const base=slab(11.5,12,.22,.6,platformMaterial);base.rotation.x=-Math.PI/2;base.position.set(0,.0,-1.5);base.receiveShadow=true;base.castShadow=true;scene.add(base);
  const path=new THREE.Mesh(new THREE.PlaneGeometry(2.75,24),new THREE.MeshStandardMaterial({color:'#c2c9d7',roughness:.65,metalness:.1}));path.rotation.x=-Math.PI/2;path.position.set(0,-.03,12);path.receiveShadow=true;scene.add(path);
  // Repeated arches evoke pages, with a common object independent of the catalog.
  const gate=new THREE.Group();scene.add(gate);
  function archShape(w,h,thickness){
    const r=w/2,ri=r-thickness,cy=h-r,s=new THREE.Shape();
    s.moveTo(-r,.1);s.lineTo(-r,cy);s.absarc(0,cy,r,Math.PI,0,true);s.lineTo(r,.1);s.lineTo(ri,.1);s.lineTo(ri,cy);s.absarc(0,cy,ri,0,Math.PI,false);s.lineTo(-ri,.1);s.closePath();return s;
  }
  const ribs=[];
  for(let i=0;i<13;i++){
    const archGeo=new THREE.ExtrudeGeometry(archShape(6.6,7.5,.55),{depth:.26,steps:1,bevelEnabled:true,bevelSize:.065,bevelThickness:.065,bevelSegments:4,curveSegments:40});
    const rib=new THREE.Mesh(archGeo,i===3||i===9?edge:stone);rib.castShadow=true;rib.receiveShadow=true;
    const z=2.2-i*.54;const s=1+Math.sin(i/12*Math.PI)*.055;
    rib.scale.set(s,s,1);rib.position.set(0,.13,z);gate.add(rib);ribs.push({mesh:rib,z,index:i});
  }
  // A luminous, layered aperture at the far end of the architectural object.
  const aperture=new THREE.Shape();aperture.moveTo(-2.72,0);aperture.lineTo(2.72,0);aperture.lineTo(2.72,4.2);aperture.absarc(0,4.2,2.72,0,Math.PI,false);aperture.lineTo(-2.72,0);
  const glow=new THREE.Mesh(new THREE.ShapeGeometry(aperture,48),new THREE.ShaderMaterial({uniforms:{opacity:{value:1}},transparent:true,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=(position.xy+vec2(2.72,0.))/vec2(5.44,6.92);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float opacity;void main(){float d=length((vUv-vec2(.5,.45))*vec2(1.,.75));vec3 col=mix(vec3(.78,.89,1.),vec3(.08,.18,.49),smoothstep(.03,.58,d));float light=pow(max(0.,1.-abs(vUv.x-.5)*2.),8.);col+=vec3(.14,.18,.25)*light;gl_FragColor=vec4(col,opacity);}',side:THREE.DoubleSide}));
  glow.position.set(0,.13,-4.95);gate.add(glow);
  const portalLight=new THREE.PointLight('#7299ff',30,14,2);portalLight.position.set(0,3.3,-2.5);scene.add(portalLight);
  const innerFloor=new THREE.Mesh(new THREE.PlaneGeometry(5.4,8),new THREE.MeshStandardMaterial({color:'#7c99e3',metalness:.38,roughness:.25}));innerFloor.rotation.x=-Math.PI/2;innerFloor.position.set(0,.16,-1.4);innerFloor.receiveShadow=true;gate.add(innerFloor);
  const stripMaterial=new THREE.MeshBasicMaterial({color:'#b8d5ff'});
  [-2.47,2.47].forEach(x=>{const strip=new THREE.Mesh(new THREE.BoxGeometry(.035,.022,7.2),stripMaterial);strip.position.set(x,.18,-1.3);gate.add(strip)});
  // Photogrammetry anchors the architectural object in a tactile landscape.
  new GLTFLoader().load('assets/moon_rock_01.gltf',gltf=>{
    const model=gltf.scene,bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    model.position.sub(center);model.position.y+=size.y/2;const unit=new THREE.Group();unit.add(model);unit.scale.setScalar(1/size.x);
    model.traverse(object=>{if(object.isMesh){object.castShadow=true;object.receiveShadow=true;object.material=object.material.clone();object.material.color.set('#b4bdcd')}});
    [[-7.5,6,3.2],[8,4,2.7],[-5.2,10,1.1],[7.7,-4,2.3],[-10,-7,3.1],[6,11,.8],[-3.5,13,.45]].forEach(([x,z,s],i)=>{const rock=unit.clone(true);rock.scale.multiplyScalar(s);rock.position.set(x,-.12,z);rock.rotation.y=i*1.37;scene.add(rock)});
    sceneAPI?.render(state.progress,state.entry);
  },undefined,()=>{});
  // Beyond the gate, a quiet hall keeps the hero and catalog inside the same world.
  const hall=new THREE.Group();scene.add(hall);hall.visible=false;
  const hallMat=new THREE.MeshStandardMaterial({color:'#d8e0ec',roughness:.8});
  const hallFloor=new THREE.Mesh(new THREE.PlaneGeometry(34,38),hallMat);hallFloor.rotation.x=-Math.PI/2;hallFloor.position.set(0,.2,-24);hall.add(hallFloor);
  [-7,7].forEach(x=>{const wall=new THREE.Mesh(new THREE.BoxGeometry(.4,12,40),hallMat);wall.position.set(x,6,-25);hall.add(wall)});
  for(let i=0;i<5;i++){const rib=new THREE.Mesh(new THREE.ExtrudeGeometry(archShape(14,11,.32),{depth:.5,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:2,curveSegments:28}),hallMat);rib.position.set(0,.2,-10-i*6);hall.add(rib)}
  const rear=new THREE.Mesh(new THREE.PlaneGeometry(22,17),new THREE.MeshBasicMaterial({color:'#e6ecf7'}));rear.position.set(0,8,-39);hall.add(rear);
  const hallLight=new THREE.PointLight('#d5e4ff',260,50,2);hallLight.position.set(0,8,-21);hall.add(hallLight);
  // A thin blue seam connects the foreground to the doorway.
  const line=new THREE.Mesh(new THREE.BoxGeometry(.016,.012,21),new THREE.MeshBasicMaterial({color:'#647fb5'}));line.position.set(0,-.02,12);scene.add(line);
  const cameraTarget=new THREE.Vector3(),cameraPosition=new THREE.Vector3();let width=0,height=0;
  function resize(){width=mount.clientWidth;height=mount.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix()}
  resize();addEventListener('resize',resize);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();document.body.classList.remove('webgl-ready');state.webgl=false});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{state.webgl=true;document.body.classList.add('webgl-ready')});
  state.webgl=true;document.body.dataset.webgl='ready';document.body.classList.add('webgl-ready');
  return {render(p,entry){
    if(state.active||!state.webgl)return;
    const mobile=width<700;const align=smooth(.015,.18,p),advance=smooth(.16,.43,p);
    cameraPosition.set(lerp(mobile?10:12,0,align),lerp(mobile?7:7.8,3.6,align),lerp(mobile?32:23,16.5,align));
    cameraPosition.z=lerp(cameraPosition.z,-3.6,advance);cameraPosition.y=lerp(cameraPosition.y,3.45,advance);
    const inside=smooth(.40,.56,p);cameraPosition.z=lerp(cameraPosition.z,-13,inside);cameraPosition.y=lerp(cameraPosition.y,4.8,inside);
    hall.visible=p>.32;glow.material.uniforms.opacity.value=1-smooth(.33,.42,p);
    camera.position.copy(cameraPosition);cameraTarget.set(0,lerp(lerp(3.1,3.45,align),4.8,inside),lerp(lerp(-.5,-7,advance),-32,inside));camera.lookAt(cameraTarget);
    ribs.forEach(({mesh,z,index})=>{const settle=smooth(index*.025,.72+index*.018,entry);const remaining=1-settle;mesh.position.set(Math.sin(index*2.2)*remaining*.7,.13+remaining*(1.2+Math.sin(index)*.5),z+remaining*(index-6)*.14);mesh.rotation.set(remaining*.04*Math.sin(index),remaining*.09*Math.sin(index*1.5),remaining*.04*Math.cos(index))});
    renderer.render(scene,camera);
  }};
}

const started=performance.now();let lastPaint=-1,lastTime=started;
function frame(now){
  requestAnimationFrame(frame);
  if(document.hidden||state.active){lastTime=now;return}
  const dt=Math.min(64,now-lastTime);lastTime=now;
  state.entry=clamp((now-started)/2800);
  state.progress=reduced.matches?1:lerp(state.progress,state.target,1-Math.exp(-dt/105));
  if(Math.abs(state.progress-state.target)<.0001)state.progress=state.target;
  if(Math.abs(state.progress-lastPaint)>.00005){paintUI(state.progress);lastPaint=state.progress}
  if(state.entry<1||Math.abs(state.progress-state.target)>.00005||now-started<3500)sceneAPI?.render(state.progress,state.entry);
}
// Render once on resize, environment texture load, and returning to the tab.
addEventListener('resize',()=>{lastPaint=-1;sceneAPI?.render(state.progress,state.entry)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sceneAPI?.render(state.progress,state.entry)});
setTimeout(()=>sceneAPI?.render(state.progress,state.entry),4500);
setTimeout(()=>sceneAPI?.render(state.progress,state.entry),8000);
paintUI(state.target);requestAnimationFrame(frame);
