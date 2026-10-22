import * as THREE from './vendor/three/three.module.min.js';
import {PERIOD, ENTRY, LOOP, sampleCamera} from './hero-spaces-motion.mjs';

// An original architectural model, not a model of an actual school or venue.
// This is a browser-native interactive hero, not a rendered HyperFrames film.
const viewport = document.querySelector('#visual');
const canvas = document.querySelector('#space-canvas');
const buttons = [...document.querySelectorAll('[data-scene]')];
const pauseButton = document.querySelector('#pause');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const scenes = [
  ['01 — CLASSROOM', '일상의 수업이, 가능성의 시작으로.', '수업 공간. 책상과 노트북, 코들 수업 화면이 있는 입체 교실.'],
  ['02 — HACKATHON', '함께 나눈 아이디어가, 하나의 결과물로.', '해커톤 공간. 모둠별로 모인 책상과 짓다 화면이 있는 협업 스튜디오.'],
  ['03 — AI CAMP', '몰입의 시간이, 새로운 경험으로.', '캠프 공간. 발표 스크린과 계단식 좌석, 프로젝트 전시가 있는 배움의 마당.']
];
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'low-power'});
} catch {
  document.querySelector('#fallback').hidden = false;
  document.querySelector('#interaction-hint').hidden = true;
  pauseButton.disabled = true;
}
if (renderer) init();

function init() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  // Conceal departing furniture beneath the presentation floor.
  renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0,1,0),.24)];
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(29,1,.015,100);
  camera.position.set(11,10.6,15);
  camera.lookAt(0,.8,0);
  const world = new THREE.Group(); scene.add(world);
  scene.add(new THREE.HemisphereLight(0xffffff,0x8391ab,2.3));
  const sun = new THREE.DirectionalLight(0xfffaf0,3.4);
  sun.position.set(-5,12,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:35});
  sun.shadow.bias=-.00025;sun.shadow.normalBias=.025;sun.shadow.radius=4;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xd7e7ff,1.6);fill.position.set(8,5,-6);scene.add(fill);
  const mat=(color,roughness=.5,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const white=mat('#f4f5f2'), edge=mat('#d5dae0'), pale=mat('#e5eaf0'), blue=mat('#4389ed',.28,.2), dark=mat('#31445d',.32,.3), wood=mat('#dbccb5'), silver=mat('#aeb9c5',.25,.65), leaf=mat('#8d9f8d'), yellow=mat('#e8c35e',.4,.12);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-.24;floor.receiveShadow=true;scene.add(floor);
  const boxGeometry = new THREE.BoxGeometry(1,1,1);
  function box(parent,w,h,d,x,y,z,material=white){const o=new THREE.Mesh(boxGeometry,material);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function cylinder(parent,r,h,x,y,z,material,segments=24){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function roundSlab(parent,w,d,h,r,material){
    const p=new THREE.Shape(),x=-w/2,y=-d/2;
    p.moveTo(x+r,y);p.lineTo(x+w-r,y);p.quadraticCurveTo(x+w,y,x+w,y+r);p.lineTo(x+w,y+d-r);p.quadraticCurveTo(x+w,y+d,x+w-r,y+d);p.lineTo(x+r,y+d);p.quadraticCurveTo(x,y+d,x,y+d-r);p.lineTo(x,y+r);p.quadraticCurveTo(x,y,x+r,y);
    const g=new THREE.ExtrudeGeometry(p,{depth:h,bevelEnabled:true,bevelSegments:3,bevelSize:.035,bevelThickness:.025,curveSegments:12});g.rotateX(-Math.PI/2);
    const mesh=new THREE.Mesh(g,material);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  const base=roundSlab(world,8.2,6.2,.16,.22,white);base.position.y=-.16;
  const baseEdge=roundSlab(world,8.0,6,.07,.2,edge);baseEdge.position.y=-.23;
  for(let i=0;i<17;i++)box(world,.008,.002,5.6,-3.7+i*.45,.015,0,pale);
  box(world,7.4,.025,.026,0,.025,2.8,blue);
  const props=[];
  function moving(object,poses,delay=0){props.push({object,poses,delay});return object;}
  const pose=(x,y,z,ry=0,s=1)=>({x,y,z,ry,s});
  function plant(parent,x,z,scale=1){
    const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);parent.add(g);
    cylinder(g,.25,.45,0,.225,0,pale);cylinder(g,.045,1.2,0,.9,0,wood,8);
    for(let i=0;i<7;i++){const o=new THREE.Mesh(new THREE.SphereGeometry(.3,12,10),leaf);o.scale.set(.75,1.35,.8);o.position.set(Math.sin(i*2.4)*.22,1.1+i*.09,Math.cos(i*2.4)*.22);o.castShadow=true;g.add(o);}return g;
  }
  plant(world,3.5,-2.35,.9);plant(world,-3.5,2.15,.65);
  // Fine architectural window mullions; no enclosing roof to hide the learning space.
  const architecture=new THREE.Group();world.add(architecture);
  box(architecture,.12,3.5,4.5,-3.8,1.75,-.55,white);
  for(let i=0;i<10;i++){box(architecture,.035,3.2,.07,-3.71,1.65,-2.55+i*.44,silver);}
  box(architecture,.15,.12,4.65,-3.75,3.5,-.55,white);
  for(let i=0;i<9;i++)box(architecture,.18,.045,4.4,-3.5+i*.33,3.48,-.55,white);
  moving(architecture,[pose(0,0,0),pose(-.2,-.5,0,0,.85),pose(-1,-3.6,0,0,.05)]);
  // Screen content is illustrative; the two brand marks below use the original SVG assets.
  function screenTexture(mode){
    const c=document.createElement('canvas');c.width=1200;c.height=680;const ctx=c.getContext('2d');
    ctx.fillStyle='#f8f9fb';ctx.fillRect(0,0,1200,680);
    ctx.fillStyle='#e5e9ef';ctx.fillRect(0,76,1200,2);
    ctx.fillStyle='#d6dce5';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(1080+i*24,38,5,0,7);ctx.fill();}
    if(mode===0){
      ctx.fillStyle='#f3f6fa';ctx.fillRect(0,78,240,602);ctx.fillStyle='#33445e';ctx.font='bold 25px sans-serif';ctx.fillText('AI CLASSROOM',32,135);
      for(let i=0;i<5;i++){ctx.fillStyle=i===1?'#dfebff':'#e5e9ef';ctx.fillRect(25,180+i*62,184,40);ctx.fillStyle=i===1?'#3079ec':'#a6b1c0';ctx.fillRect(42,194+i*62,110,10);}
      ctx.fillStyle='#71829b';ctx.font='18px monospace';ctx.fillText('project.py',278,126);
      const lines=['# A small idea. A new possibility.','from codle import imagination','','idea = "Our next project"','for student in classroom:','    student.create(idea)','','# Ready to begin?'];
      lines.forEach((l,i)=>{ctx.fillStyle=i===0||i===7?'#9daabd':i%2?'#3679d7':'#60718b';ctx.font='18px monospace';ctx.fillText(l,280,194+i*41);});
      ctx.fillStyle='#edf4ff';ctx.fillRect(808,158,345,410);ctx.fillStyle='#4389ed';ctx.beginPath();ctx.arc(981,315,85,0,7);ctx.fill();ctx.fillStyle='white';ctx.font='58px sans-serif';ctx.fillText('AI',947,337);
      ctx.fillStyle='#bed4f5';ctx.fillRect(855,448,250,12);ctx.fillRect(885,478,190,10);
    }else if(mode===1){
      ctx.fillStyle='#f6f5f0';ctx.fillRect(0,78,350,602);ctx.fillStyle='#3f4651';ctx.font='bold 25px sans-serif';ctx.fillText('MAKE IT REAL.',35,145);
      for(let i=0;i<3;i++){ctx.fillStyle=i===0?'#eae5d4':'#e5e7e9';ctx.fillRect(32,186+i*100,280,64);ctx.fillStyle='#a2a6ac';ctx.fillRect(49,209+i*100,200,8);ctx.fillRect(49,227+i*100,150,7);}
      ctx.fillStyle='#fff';ctx.fillRect(32,557,280,83);ctx.strokeStyle='#dadde1';ctx.strokeRect(32,557,280,83);
      ctx.fillStyle='#293b50';ctx.font='bold 62px sans-serif';ctx.fillText('Our next',418,230);ctx.fillText('big idea.',418,300);
      ctx.fillStyle='#efc554';ctx.fillRect(420,355,180,54);
      for(let i=0;i<3;i++){ctx.fillStyle=['#e8eef6','#e9f0e7','#f4ead5'][i];ctx.fillRect(420+i*235,458,210,155);ctx.fillStyle='#a5b3c6';ctx.fillRect(445+i*235,565,150,9);}
    }else{
      ctx.fillStyle='#f0f5fb';ctx.fillRect(0,78,1200,602);ctx.fillStyle='#3079ec';ctx.font='bold 24px sans-serif';ctx.fillText('CREATE. SHARE. GROW.',60,156);ctx.fillStyle='#223952';ctx.font='bold 82px sans-serif';ctx.fillText('A world of',58,287);ctx.fillText('possibilities.',58,377);
      ctx.fillStyle='#c2d9f8';ctx.beginPath();ctx.arc(990,360,173,0,7);ctx.fill();ctx.fillStyle='#4a8ceb';ctx.beginPath();ctx.arc(955,333,135,0,7);ctx.fill();
      for(let i=0;i<3;i++){ctx.fillStyle='#d5e4f7';ctx.fillRect(60+i*200,488,170,95);ctx.fillStyle='#fff';ctx.fillRect(81+i*200,512,120,9);}
    }
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
    const logo=new Image();logo.onload=()=>{ctx.drawImage(logo,28,11,137,54);texture.needsUpdate=true;draw();};logo.src=mode===1?'assets/jitda-logo.svg':'assets/codle.svg';
    return texture;
  }
  const textures=[0,1,2].map(screenTexture);
  const screenGroup=new THREE.Group();world.add(screenGroup);
  box(screenGroup,5.4,2.97,.13,0,2.1,0,white);
  const screenMaterial=new THREE.MeshBasicMaterial({map:textures[0],toneMapped:false});
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(5.14,2.91),screenMaterial);screen.name='lesson-display';screen.position.set(0,2.1,.075);screenGroup.add(screen);
  for(const x of [-2.05,2.05]){box(screenGroup,.055,.75,.055,x,.375,0,silver);box(screenGroup,.48,.045,.48,x,.025,0,edge);}
  moving(screenGroup,[pose(0,0,-2.65),pose(.2,.15,-2.5,-.05),pose(-.9,.4,-2.15,.08,.88)],.03);
  const laptopScreen=new THREE.MeshBasicMaterial({color:'#b8d6ff'});
  function desk(){
    const g=new THREE.Group();world.add(g);
    const top=roundSlab(g,1.65,.86,.065,.07,white);top.position.y=.88;
    for(const x of [-.65,.65]){box(g,.045,.85,.045,x,.445,-.3,silver);box(g,.045,.85,.045,x,.445,.3,silver);}
    box(g,1.33,.035,.035,0,.37,-.3,silver);
    const pc=new THREE.Group();pc.position.set(-.13,.96,-.03);g.add(pc);
    box(pc,.62,.025,.43,0,0,.07,silver);box(pc,.55,.008,.23,0,.015,.10,dark);
    const lid=new THREE.Group();lid.position.set(0,.02,-.14);lid.rotation.x=-.18;pc.add(lid);
    box(lid,.64,.40,.025,0,.19,0,dark);box(lid,.59,.35,.006,0,.19,.017,laptopScreen);
    box(g,.23,.025,.3,.52,.967,.06,blue);box(g,.20,.012,.28,.53,.987,.065,white);
    cylinder(g,.047,.15,.52,1.03,-.26,white,16);
    // One understated chair per station, with a thin folded back and metal base.
    const chair=new THREE.Group();chair.position.z=.78;g.add(chair);
    box(chair,.55,.07,.49,0,.51,0,blue);box(chair,.55,.50,.045,0,.78,.24,blue);
    for(const x of [-.22,.22])for(const z of [-.18,.18])box(chair,.028,.49,.028,x,.245,z,silver);
    return g;
  }
  const classroom=[[-2,-.8],[.15,-.8],[2.3,-.8],[-2,1.05],[.15,1.05],[2.3,1.05]];
  const hackathon=[[-2,-.35,Math.PI],[-2,.55,0],[.2,-.35,Math.PI],[.2,.55,0],[2.35,-.35,Math.PI],[2.35,.55,0]];
  for(let i=0;i<6;i++)moving(desk(),[pose(classroom[i][0],0,classroom[i][1]),pose(...[hackathon[i][0],0,hackathon[i][1],hackathon[i][2]]),pose(i<3?2.45:3.4,-1.8,-.3+(i%3)*1.15,Math.PI/2,.08)],i*.055);
  const camp=new THREE.Group();world.add(camp);
  // A miniature presentation forum; terraces replace desks during the camp beat.
  for(let i=0;i<3;i++){
    box(camp,4.8,.22+i*.20,.62,-.7,(.22+i*.20)/2,.5+i*.69,white);
    for(let j=0;j<5;j++)box(camp,.62,.06,.42,-2.55+j*.9,.25+i*.20,.54+i*.69,j===3?yellow:blue);
  }
  const podium=roundSlab(camp,1.0,.75,.9,.1,blue);podium.position.set(1.65,0,-1.3);
  box(camp,.72,.02,.48,1.65,.96,-1.3,white);
  for(let i=0;i<2;i++){
    const display=new THREE.Group();camp.add(display);display.position.set(3.05,0,-.75+i*1.6);display.rotation.y=-.48;
    box(display,.05,1.85,.05,0,.95,0,silver);box(display,.65,.035,.5,0,.035,0,edge);
    box(display,.87,1.16,.05,0,1.48,0,white);box(display,.71,.91,.025,0,1.5,.04,i?yellow:blue);
    box(display,.42,.025,.02,0,1.55,.06,white);box(display,.3,.025,.02,0,1.43,.06,white);
  }
  moving(camp,[pose(0,-2.4,0,0,.02),pose(0,-2.4,0,0,.02),pose(0,0,0)],.06);
  const hack=new THREE.Group();world.add(hack);
  for(let i=0;i<3;i++){
    const g=new THREE.Group();g.position.set(-2.8+i*2.5,0,-1.85);hack.add(g);
    box(g,.025,1.6,.025,0,.8,0,silver);box(g,.4,.035,.4,0,.025,0,edge);box(g,.65,.65,.035,0,1.5,0,white);
    for(let j=0;j<4;j++)box(g,.18,.16,.012,-.13+(j%2)*.26,1.38+Math.floor(j/2)*.24,.03,j%2?blue:yellow);
  }
  moving(hack,[pose(0,-2.7,0,0,.02),pose(0,0,0),pose(0,-2.7,0,0,.02)],.2);
  // A contact-shadow layer makes the model sit on the page, instead of floating in a card.
  const contact=document.createElement('canvas');contact.width=256;contact.height=256;const ctx=contact.getContext('2d');const grad=ctx.createRadialGradient(128,128,10,128,128,128);grad.addColorStop(0,'rgba(37,55,83,.20)');grad.addColorStop(.6,'rgba(37,55,83,.09)');grad.addColorStop(1,'rgba(37,55,83,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,256,256);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(12,10),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(contact),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.235;world.add(shadow);

  // Optional paused-time links support reproducible camera/frame reviews.
  const reviewValue=new URL(location.href).searchParams.get('t');
  const reviewTime=reviewValue===null?NaN:Number(reviewValue);
  const reviewing=Number.isFinite(reviewTime)&&reviewTime>=0;
  let active=-1, paused=reduced.matches||reviewing, elapsed=reviewing?reviewTime%LOOP:ENTRY, manualUntil=null, raf=0, previous=0, visible=true, lost=false;
  let pointerX=0,pointerY=0,rotation=0,tilt=0;
  function applyPose(object,p){object.position.set(p.x,p.y,p.z);object.rotation.y=p.ry;object.scale.setScalar(p.s);object.visible=p.s>.09;}
  // Prebuild complete, stationary arrangements. The camera orbits and dives;
  // every room keeps identity transforms, with shared geometry/materials.
  const rooms=scenes.map((_,index)=>{
    props.forEach(p=>applyPose(p.object,p.poses[index]));
    const room=world.clone(true);
    room.getObjectByName('lesson-display').material=new THREE.MeshBasicMaterial({map:textures[index],toneMapped:false});
    scene.add(room);return room;
  });
  scene.remove(world);
  function renderMotion(){
    const state=sampleCamera(elapsed,reduced.matches);
    const index=state.index;
    rooms.forEach((room,i)=>{
      room.visible=i===index;
    });
    camera.position.set(state.position[0]+rotation*4*state.parallax,state.position[1]+tilt*5*state.parallax,state.position[2]);
    camera.lookAt(...state.target);
    if(index!==active){
      active=index;
      document.querySelector('#scene-number').textContent=scenes[index][0];document.querySelector('#scene-caption').textContent=scenes[index][1];viewport.setAttribute('aria-label',scenes[index][2]);
      buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    }
    viewport.dataset.motionPhase=state.phase;
    viewport.dataset.sceneTime=state.local.toFixed(3);
    buttons[active].style.setProperty('--progress',paused?1:state.local/PERIOD);
  }
  function draw(){if(!lost)renderer.render(scene,camera);}
  function select(index,user=false){
    elapsed=index*PERIOD+(reduced.matches?ENTRY:0);
    manualUntil=user&&!reduced.matches?elapsed+ENTRY:null;
    paused=reduced.matches;
    renderMotion();updatePause();draw();wake();
  }
  function tick(now){
    raf=0;if(!visible||document.hidden||lost){previous=0;return;}
    const dt=Math.min((now-(previous||now))/1000,.05);previous=now;
    if(!paused){
      elapsed+=dt;
      if(manualUntil!==null&&elapsed>=manualUntil){elapsed=manualUntil;manualUntil=null;paused=true;updatePause();}
      else if(elapsed>=LOOP)elapsed%=LOOP;
    }
    const factor=1-Math.exp(-dt*5);rotation=THREE.MathUtils.lerp(rotation,reduced.matches?0:pointerX*.06,factor);tilt=THREE.MathUtils.lerp(tilt,reduced.matches?0:pointerY*.015,factor);
    renderMotion();
    draw();
    if(!paused||Math.abs(rotation-pointerX*.06)>.0001||Math.abs(tilt-pointerY*.015)>.0001)raf=requestAnimationFrame(tick);else previous=0;
  }
  function wake(){if(!raf&&visible&&!document.hidden&&!lost)raf=requestAnimationFrame(tick);}
  function updatePause(){pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.setAttribute('aria-label',paused?'자동 전환 재생':'자동 전환 일시정지');pauseButton.innerHTML=paused?'<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M7 4l9 6-9 6Z" fill="currentColor"/></svg>':'<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M7 5v10M13 5v10" fill="none" stroke="currentColor" stroke-width="2"/></svg>';}
  buttons.forEach((button,index)=>button.addEventListener('click',()=>select(index,true)));
  pauseButton.addEventListener('click',()=>{paused=!paused;manualUntil=null;updatePause();wake();});
  viewport.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const r=viewport.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width*2-1;pointerY=(e.clientY-r.top)/r.height*2-1;wake();},{passive:true});
  viewport.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;wake();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;pointerX=pointerY=0;manualUntil=null;elapsed=active*PERIOD+ENTRY;renderMotion();updatePause();draw();wake();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;previous=0;}}).observe(viewport);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;previous=0;}else wake();});
  new ResizeObserver(()=>{const w=viewport.clientWidth,h=viewport.clientHeight,aspect=w/h;camera.aspect=aspect;camera.fov=aspect<1.2?34:29;camera.updateProjectionMatrix();renderer.setSize(w,h,false);renderMotion();draw();wake();}).observe(viewport);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;document.querySelector('#fallback').hidden=false;});
  canvas.addEventListener('webglcontextrestored',()=>{lost=false;document.querySelector('#fallback').hidden=true;draw();wake();});
  renderMotion();updatePause();draw();wake();
}
