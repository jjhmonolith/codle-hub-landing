import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { HDRLoader } from './vendor/HDRLoader.js';

const hero=document.querySelector('.asset-opening'), stage=hero.querySelector('.asset-stage');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const video=document.createElement('video');
video.src='assets/environment/codle-demo.mp4';video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';
let selected='codle',paused=reduced.matches,visible=true,progress=0,pointerX=0,pointerY=0;
const status=hero.querySelector('.scene-status'),pauseButton=hero.querySelector('.scene-pause');
const data={codle:{title:'배움의 가능성을 <em>열다.</em>',copy:'수업을 연결하는 AI 교실.',logo:'codle.svg',url:'https://codle.io/',name:'코들'},jitda:{title:'상상한 세상을 <em>짓다.</em>',copy:'아이디어에서 나만의 서비스까지.',logo:'jitda-logo.svg',url:'https://jitda.io/',name:'짓다'}};
function media(){if(!paused&&visible&&!document.hidden&&selected==='codle')video.play().catch(()=>{});else video.pause();pauseButton.textContent=paused?'▶':'Ⅱ';pauseButton.setAttribute('aria-label',paused?'움직임 재생':'움직임 일시정지');}
pauseButton.addEventListener('click',()=>{paused=!paused;media();});
let screen,accent,renderer;
function select(key){selected=key;const d=data[key];hero.dataset.platform=key;hero.querySelector('h1').innerHTML=d.title;hero.querySelector('.scene-brand p').textContent=d.copy;const logo=hero.querySelector('.scene-brand img');logo.src='assets/'+d.logo;logo.alt=d.name;const link=hero.querySelector('.scene-brand a');link.href=d.url;link.textContent=d.name+' 둘러보기 ↗';hero.querySelectorAll('[data-scene-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sceneSelect===key)));if(screen){screen.material.map=key==='codle'?codleTexture:jitdaTexture;screen.material.needsUpdate=true;accent.material.color.set(key==='codle'?0x306bff:0xffd34a);}media();}
hero.querySelectorAll('[data-scene-select]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.sceneSelect)));
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;media();},{threshold:0}).observe(hero);
document.addEventListener('visibilitychange',media);
reduced.addEventListener('change',()=>{paused=reduced.matches;media();});
const codleTexture=new THREE.VideoTexture(video);codleTexture.colorSpace=THREE.SRGBColorSpace;
// An explicitly labelled illustrative Jitda screen; replace with a real product recording later.
const demo=document.createElement('canvas');demo.width=1600;demo.height=900;const ctx=demo.getContext('2d');
function jitdaDemo(){ctx.fillStyle='#f8f9f7';ctx.fillRect(0,0,1600,900);ctx.fillStyle='#1c262f';ctx.fillRect(0,0,1600,72);ctx.fillStyle='#f9dc60';ctx.font='bold 26px sans-serif';ctx.fillText('jitda',35,47);ctx.fillStyle='#dde3e5';ctx.font='20px sans-serif';ctx.fillText('나의 첫 번째 프로젝트',150,45);ctx.fillStyle='#596b7a';ctx.fillRect(330,72,1,828);ctx.fillStyle='#263544';ctx.font='bold 30px sans-serif';ctx.fillText('무엇을 만들어 볼까요?',35,140);ctx.font='20px sans-serif';ctx.fillStyle='#71808b';ctx.fillText('아이디어를 적어주세요.',35,185);ctx.fillStyle='#fff';ctx.fillRect(25,230,280,130);ctx.fillStyle='#344655';ctx.fillText('우리 반과 함께 쓰는',43,270);ctx.fillText('독서 기록 앱을 만들래.',43,305);ctx.fillStyle='#fff1b0';ctx.fillRect(25,400,280,180);ctx.fillStyle='#344655';ctx.fillText('좋아요! 책과 생각을',43,447);ctx.fillText('모으는 공간을 만들게요.',43,482);ctx.fillStyle='#b8c3c9';ctx.font='16px sans-serif';ctx.fillText('짓다 화면 구성 예시',40,860);ctx.fillStyle='#e9efe9';ctx.fillRect(365,108,1200,754);ctx.fillStyle='#fff';ctx.fillRect(410,150,1100,660);ctx.fillStyle='#3e5a46';ctx.font='bold 28px sans-serif';ctx.fillText('우리의 책장',450,205);ctx.font='bold 63px sans-serif';ctx.fillText('한 페이지씩,',450,345);ctx.fillText('함께 자라는 생각.',450,425);ctx.font='23px sans-serif';ctx.fillStyle='#7d8d7f';ctx.fillText('오늘 읽은 책과 마음에 남은 문장을 기록해요.',450,485);['#f6d48a','#bdcdbc','#e6b8a7'].forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(450+i*330,550,285,205);ctx.fillStyle='#3f5046';ctx.font='20px sans-serif';ctx.fillText(['읽고 있는 책','함께 나눈 문장','새로 발견한 생각'][i],475+i*330,600);});}
jitdaDemo();const jitdaTexture=new THREE.CanvasTexture(demo);jitdaTexture.colorSpace=THREE.SRGBColorSpace;
document.fonts.ready.then(()=>{jitdaDemo();jitdaTexture.needsUpdate=true;});
try{init();}catch(error){console.error(error);status.textContent='3D 미리보기를 사용할 수 없습니다';hero.querySelector('.scene-fallback').hidden=false;}
function init(){
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;stage.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','바위 지형 중앙의 대형 모니터');
 const scene=new THREE.Scene();scene.background=new THREE.Color('#d8e3e8');scene.fog=new THREE.Fog('#d8e3e8',18,65);
 const camera=new THREE.PerspectiveCamera(40,1,.1,140);
 const ambient=new THREE.HemisphereLight(0xe5f3ff,0x8e887b,1.4);scene.add(ambient);
 const sun=new THREE.DirectionalLight(0xfff4dd,2.7);sun.position.set(-7,14,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:.1,far:55});sun.shadow.bias=-.0003;sun.shadow.normalBias=.04;sun.shadow.radius=4;scene.add(sun);
 const fill=new THREE.DirectionalLight(0xc4ddff,1.2);fill.position.set(10,4,-8);scene.add(fill);
 const envLoader=new HDRLoader();envLoader.load('assets/environment/quarry-sky.hdr',texture=>{texture.mapping=THREE.EquirectangularReflectionMapping;scene.environment=texture;scene.environmentIntensity=.65;},undefined,()=>{status.textContent='기본 조명으로 미리보기 중';});
 const loader=new THREE.TextureLoader();const groundMap=loader.load('assets/environment/sand-diff.jpg');groundMap.anisotropy=8;groundMap.colorSpace=THREE.SRGBColorSpace;groundMap.wrapS=groundMap.wrapT=THREE.RepeatWrapping;groundMap.repeat.set(70,70);const normal=loader.load('assets/environment/sand-normal.jpg');normal.wrapS=normal.wrapT=THREE.RepeatWrapping;normal.repeat.set(70,70);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:0xc4ced3,map:groundMap,normalMap:normal,normalScale:new THREE.Vector2(.6,.6),roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.position.y=-.06;scene.add(ground);
 const monitor=new THREE.Group();scene.add(monitor);
 function box(w,h,d,material,x,y,z){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;monitor.add(mesh);return mesh;}
 const metal=new THREE.MeshStandardMaterial({color:0xb8c2c9,metalness:.85,roughness:.25});const dark=new THREE.MeshStandardMaterial({color:0x121b24,metalness:.45,roughness:.28});
 box(8.8,5.15,.26,metal,0,3.55,0);box(8.64,4.99,.08,dark,0,3.55,.17);
 screen=new THREE.Mesh(new THREE.PlaneGeometry(8.3,4.67),new THREE.MeshBasicMaterial({map:codleTexture,toneMapped:false}));screen.position.set(0,3.58,.219);monitor.add(screen);
 box(.8,1.25,.42,metal,0,.7,-.13);box(3,.12,1.7,metal,0,.05,.1);
 accent=box(.65,.025,.01,new THREE.MeshBasicMaterial({color:0x306bff}),0,1.065,.22);
 const cameraDot=new THREE.Mesh(new THREE.SphereGeometry(.022,12,8),dark);cameraDot.position.set(0,6.04,.22);monitor.add(cameraDot);
 new GLTFLoader().load('assets/environment/moon_rock_01.gltf',gltf=>{
  const model=gltf.scene;const bounds=new THREE.Box3().setFromObject(model);const size=bounds.getSize(new THREE.Vector3());const center=bounds.getCenter(new THREE.Vector3());model.position.sub(center);model.position.y+=size.y/2;const unit=new THREE.Group();unit.add(model);unit.scale.setScalar(1/size.x);
  const locations=[[-7,1.5,5.3,0.2], [6.8,2.5,4.9,2.4],[-5.4,-5,3.1,1.6],[5,-7,2.8,4],[-11,-12,4.5,1], [12,-16,5,3],[-19,-28,8,1.5],[20,-32,9,4.5],[-4.9,3.8,1.1,3],[4.4,4.6,.85,1],[-3.6,6.5,.45,5],[3.7,2.5,.38,2]];
  locations.forEach(([x,z,s,r])=>{const rock=unit.clone(true);rock.scale.multiplyScalar(s);rock.position.set(x,-.05,z);rock.rotation.y=r;rock.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(rock);});
  status.textContent='SCROLL TO EXPLORE';hero.dataset.assets='ready';
 },undefined,error=>{console.error(error);status.textContent='일부 공간 에셋을 불러오지 못했습니다';});
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}resize();addEventListener('resize',resize);
 hero.addEventListener('pointermove',e=>{pointerX=(e.clientX/innerWidth-.5);pointerY=(e.clientY/innerHeight-.5);});hero.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
 let current=0;const clamp=n=>Math.max(0,Math.min(1,n));
 function draw(){requestAnimationFrame(draw);if(!visible||document.hidden)return;const rect=hero.getBoundingClientRect();progress=reduced.matches?0:clamp(-rect.top/Math.max(1,hero.offsetHeight-stage.clientHeight));current+= (progress-current)*.08;const t=current*current*(3-2*current);const mobile=stage.clientWidth<700;const baseZ=mobile?34:17;camera.position.set(!paused&&!reduced.matches?pointerX*.35*(1-t):0,3.8+(.0*t)+(!paused&&!reduced.matches?pointerY*.12:0),baseZ+(3.2-baseZ)*t);camera.lookAt(0,3.55,0);const opacity=1-clamp(current/.28);hero.style.setProperty('--scene-chrome',opacity);hero.querySelector('.scene-progress').style.width=(current*100)+'%';hero.querySelectorAll('.scene-nav,.scene-footer').forEach(el=>el.inert=opacity<.05);renderer.render(scene,camera);}
 draw();media();
}




