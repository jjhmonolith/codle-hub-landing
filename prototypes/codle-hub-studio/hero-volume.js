import * as THREE from './vendor/three/three.module.min.js';

// Original geometries, studio lighting and interaction. Three.js r170 (MIT)
// is vendored locally, so no runtime CDN, image, model or third-party script is needed.
const canvas=document.getElementById('scene');
const viewport=document.getElementById('viewport');
const status=document.getElementById('scene-status');
const tools=document.getElementById('scene-tools');
const pauseButton=document.getElementById('pause');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});}catch(error){status.textContent='이 브라우저에서는 3D를 표시할 수 없어요. 아래 교육 프로그램은 그대로 이용할 수 있습니다.';throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.1;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#11141b');
scene.fog=new THREE.Fog('#11141b',22,38);
const camera=new THREE.PerspectiveCamera(34,1,.1,65);camera.position.set(0,0,15.2);
const group=new THREE.Group();scene.add(group);

// A photographed studio-like reflection environment made from actual emissive
// panels: long soft highlights describe the bevels, rather than a flat matcap.
const environment=new THREE.Scene();environment.background=new THREE.Color('#20222b');
const room=new THREE.Mesh(new THREE.BoxGeometry(40,30,40),new THREE.MeshBasicMaterial({color:'#151720',side:THREE.BackSide}));environment.add(room);
function softbox(x,y,z,w,h,intensity,color='#ffffff'){
  const material=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide});
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);panel.position.set(x,y,z);panel.lookAt(0,0,0);environment.add(panel);
}
softbox(-7,10,7,6,13,6);softbox(8,4,4,3,12,4);softbox(0,10,-8,15,4,5);softbox(-10,-2,-3,3,9,2,'#9eb8ff');softbox(1,-8,5,10,2,.8);
const pmrem=new THREE.PMREMGenerator(renderer);const envTarget=pmrem.fromScene(environment,.025,.1,80);scene.environment=envTarget.texture;pmrem.dispose();
environment.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
scene.add(new THREE.HemisphereLight('#d6e0ff','#050610',1.3));
const key=new THREE.DirectionalLight('#ffffff',4.2);key.position.set(-5,8,9);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-15,right:15,top:9,bottom:-9,near:1,far:35});key.shadow.bias=-.0005;key.shadow.normalBias=.035;key.shadow.radius=4;scene.add(key);
const rim=new THREE.DirectionalLight('#b8ceff',2.5);rim.position.set(8,0,-4);scene.add(rim);
const fill=new THREE.DirectionalLight('#f7f4eb',1.1);fill.position.set(0,-4,10);scene.add(fill);
const back=new THREE.Mesh(new THREE.PlaneGeometry(90,60),new THREE.MeshStandardMaterial({color:'#10131a',roughness:1}));back.position.z=-6;back.receiveShadow=true;scene.add(back);

const materials={
  blue:new THREE.MeshPhysicalMaterial({color:'#173ad5',metalness:.32,roughness:.22,clearcoat:1,clearcoatRoughness:.10,envMapIntensity:1.15}),
  ivory:new THREE.MeshPhysicalMaterial({color:'#e7e9eb',metalness:.16,roughness:.25,clearcoat:.9,clearcoatRoughness:.15,envMapIntensity:.95}),
  black:new THREE.MeshPhysicalMaterial({color:'#14171e',metalness:.48,roughness:.17,clearcoat:1,clearcoatRoughness:.1,envMapIntensity:1.25}),
  yellow:new THREE.MeshPhysicalMaterial({color:'#f7ca4e',metalness:.24,roughness:.25,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:1})
};
function roundedPath(path,w,h,r,clockwise=false){
  const x=-w/2,y=-h/2;
  path.moveTo(x+r,y);path.lineTo(x+w-r,y);path.quadraticCurveTo(x+w,y,x+w,y+r);path.lineTo(x+w,y+h-r);path.quadraticCurveTo(x+w,y+h,x+w-r,y+h);path.lineTo(x+r,y+h);path.quadraticCurveTo(x,y+h,x,y+h-r);path.lineTo(x,y+r);path.quadraticCurveTo(x,y,x+r,y);path.closePath();return path;
}
function extrude(shape,depth=.85){const g=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSegments:5,bevelSize:.16,bevelThickness:.16,curveSegments:40});g.center();g.computeVertexNormals();return g;}
const ringShape=roundedPath(new THREE.Shape(),2.5,2.5,.6);ringShape.holes.push(roundedPath(new THREE.Path(),1.12,1.12,.28));
const ring=extrude(ringShape,.85);
const arcShape=new THREE.Shape();const a=Math.PI*.24,b=Math.PI*1.76;
arcShape.absarc(0,0,1.3,a,b,false);arcShape.lineTo(Math.cos(b)*.57,Math.sin(b)*.57);arcShape.absarc(0,0,.57,b,a,true);arcShape.closePath();const arc=extrude(arcShape,1.05);
const vertices=[[-.49,1.32],[.49,1.32],[.49,.49],[1.32,.49],[1.32,-.49],[.49,-.49],[.49,-1.32],[-.49,-1.32],[-.49,-.49],[-1.32,-.49],[-1.32,.49],[-.49,.49]];
const crossShape=new THREE.Shape();
vertices.forEach((v,i)=>{const prev=vertices[(i+vertices.length-1)%vertices.length],next=vertices[(i+1)%vertices.length];const r=.19;const incoming=new THREE.Vector2(prev[0]-v[0],prev[1]-v[1]).normalize().multiplyScalar(r);const outgoing=new THREE.Vector2(next[0]-v[0],next[1]-v[1]).normalize().multiplyScalar(r);if(i===0)crossShape.moveTo(v[0]+incoming.x,v[1]+incoming.y);else crossShape.lineTo(v[0]+incoming.x,v[1]+incoming.y);crossShape.quadraticCurveTo(v[0],v[1],v[0]+outgoing.x,v[1]+outgoing.y);});crossShape.closePath();const hole=new THREE.Path();hole.absarc(0,0,.31,0,Math.PI*2,true);crossShape.holes.push(hole);const cross=extrude(crossShape,.92);
const pillShape=roundedPath(new THREE.Shape(),1.3,2.8,.6);const pill=extrude(pillShape,.95);
const geometries=[ring,arc,cross,pill];

// Deliberate staggered close-up: shapes extend beyond the frame, with deep
// layers and large foreground silhouettes. The composition is not a logo.
const specs=[
  [-10,3.4,-1.4,1.30,2,'black',.6,.2,.4],[-6.5,3.25,-.3,1.28,0,'ivory',.5,-.4,-.4],[-2.8,3.7,-1.1,1.22,1,'blue',.9,.1,.3],[1.0,3.6,-1.1,1.25,2,'black',-.4,.5,-.3],[4.6,3.5,-.4,1.3,0,'blue',.3,-.5,.3],[8.3,3.3,-1.3,1.3,1,'ivory',-.4,.3,.5],
  [-9,-.5,-.7,1.4,1,'blue',.1,.5,-.5],[-5.3,.15,1.0,1.26,2,'ivory',-.55,.6,.45],[-1.3,.2,.35,1.2,0,'blue',.4,-.5,-.5],[2.9,.4,1.2,1.36,1,'black',-.3,-.55,.6],[7.1,-.1,.2,1.36,2,'blue',.55,.2,.5],[10.4,.1,-1.1,1.12,0,'yellow',.2,.4,-.5],
  [-10,-3.7,-1,1.3,0,'ivory',.4,.4,.5],[-6.4,-3.65,-.8,1.2,0,'black',-.5,.2,.2],[-2.8,-3.25,.2,1.3,1,'blue',.45,.3,-.2],[1,-3.5,-.6,1.1,2,'ivory',.4,-.3,-.3],[4.8,-3.45,-.4,1.2,0,'blue',-.5,.5,.2],[8.7,-3.5,-1,1.3,3,'black',.5,.2,1],
  [-3,1.8,-3.6,.7,3,'yellow',.3,.4,-.6],[5.4,1.8,-3.7,.8,2,'ivory',.5,.3,.6]
];
const objects=specs.map((s,i)=>{
  const mesh=new THREE.Mesh(geometries[s[4]],materials[s[5]]);mesh.position.set(s[0],s[1],s[2]);mesh.rotation.set(s[6],s[7],s[8]);mesh.scale.setScalar(s[3]);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  return{mesh,base:new THREE.Vector3(s[0],s[1],s[2]),rotation:new THREE.Vector3(s[6],s[7],s[8]),targetRotation:new THREE.Vector3(s[6],s[7],s[8]),scale:s[3],hover:0,phase:i*1.73};
});
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(5,5);
let hovered=null,dragging=false,startX=0,startY=0,dragX=0,dragY=0,targetX=0,targetY=0,mouseX=0,mouseY=0;
let paused=reduced.matches,visible=true,contextLost=false,frameId=0,last=0,elapsed=0,shuffleCount=0,settleUntil=0;
function draw(){renderer.render(scene,camera);}
function animate(now){
  frameId=0;if(document.hidden||!visible||contextLost){last=0;return;}
  const dt=Math.min((now-(last||now))/1000,.05);last=now;const lerp=reduced.matches?1:1-Math.exp(-dt*5.5);
  if(!paused)elapsed+=dt;
  group.rotation.y=THREE.MathUtils.lerp(group.rotation.y,targetX+mouseX*.07,lerp);
  group.rotation.x=THREE.MathUtils.lerp(group.rotation.x,targetY-mouseY*.045,lerp);
  objects.forEach((o,i)=>{
    o.hover=THREE.MathUtils.lerp(o.hover,hovered===o.mesh ? .55 : 0,lerp);
    const drift=Math.sin(elapsed*.34+o.phase)*.10;
    o.mesh.position.set(o.base.x,o.base.y+drift,o.base.z+o.hover);
    o.mesh.rotation.x=THREE.MathUtils.lerp(o.mesh.rotation.x,o.targetRotation.x+Math.sin(elapsed*.2+o.phase)*.10,lerp);
    o.mesh.rotation.y=THREE.MathUtils.lerp(o.mesh.rotation.y,o.targetRotation.y+Math.cos(elapsed*.17+o.phase)*.12,lerp);
    o.mesh.rotation.z=THREE.MathUtils.lerp(o.mesh.rotation.z,o.targetRotation.z,lerp);
  });
  draw();
  if(!paused||dragging||now<settleUntil)frameId=requestAnimationFrame(animate);else last=0;
}
function wake(){settleUntil=performance.now()+1800;if(!frameId&&visible&&!document.hidden&&!contextLost)frameId=requestAnimationFrame(animate);}
function size(){const r=viewport.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=15.2;camera.updateProjectionMatrix();draw();wake();}
new ResizeObserver(size).observe(viewport);
function hit(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);mouseX=pointer.x;mouseY=pointer.y;raycaster.setFromCamera(pointer,camera);hovered=raycaster.intersectObjects(group.children,false)[0]?.object||null;}
canvas.addEventListener('pointermove',e=>{hit(e);if(dragging){targetX=THREE.MathUtils.clamp(dragX+(e.clientX-startX)*.0035,-.65,.65);targetY=THREE.MathUtils.clamp(dragY+(e.clientY-startY)*.0025,-.35,.35);}wake();},{passive:true});
canvas.addEventListener('pointerdown',e=>{dragging=true;startX=e.clientX;startY=e.clientY;dragX=targetX;dragY=targetY;canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');hit(e);wake();});
function release(){dragging=false;canvas.classList.remove('dragging');wake();}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
canvas.addEventListener('pointerleave',()=>{hovered=null;mouseX=0;mouseY=0;wake();});
canvas.addEventListener('keydown',e=>{let handled=true;if(e.key==='ArrowLeft')targetX=Math.max(-.65,targetX-.12);else if(e.key==='ArrowRight')targetX=Math.min(.65,targetX+.12);else if(e.key==='ArrowUp')targetY=Math.max(-.35,targetY-.1);else if(e.key==='ArrowDown')targetY=Math.min(.35,targetY+.1);else if(e.key==='Escape'){targetX=0;targetY=0;}else handled=false;if(handled){e.preventDefault();wake();}});
document.getElementById('shuffle').addEventListener('click',()=>{shuffleCount++;objects.forEach((o,i)=>{o.targetRotation.set(o.rotation.x+Math.sin(i*2.3+shuffleCount*1.7)*.65,o.rotation.y+Math.cos(i*1.4+shuffleCount*2)*.65,o.rotation.z+Math.sin(i+shuffleCount)*1.5);if(reduced.matches)o.mesh.rotation.set(o.targetRotation.x,o.targetRotation.y,o.targetRotation.z);});wake();});
function updatePause(){pauseButton.disabled=reduced.matches;pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.textContent=paused?'▷':'Ⅱ';pauseButton.setAttribute('aria-label',reduced.matches?'기기 설정에 따라 자동 움직임 꺼짐':paused?'자동 움직임 켜기':'자동 움직임 멈추기');wake();}
pauseButton.addEventListener('click',()=>{paused=!paused;updatePause();});reduced.addEventListener('change',()=>{paused=reduced.matches;updatePause();});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frameId);frameId=0;last=0;}else wake();}).observe(viewport);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;last=0;}else wake();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;cancelAnimationFrame(frameId);frameId=0;tools.hidden=true;status.hidden=false;status.textContent='3D 연결이 중단되었어요. 페이지를 새로고침하면 다시 볼 수 있습니다.';});
size();draw();status.hidden=true;tools.hidden=false;viewport.dataset.ready='true';updatePause();
