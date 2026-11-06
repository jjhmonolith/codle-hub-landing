import * as THREE from './vendor/three.module.min.js';
export async function mountCodleSurface(canvas, card, controls = null) {
function showStatus(message) {
 if (controls) controls.status.textContent = message;
}
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:!controls,preserveDrawingBuffer:true});
renderer.setSize(960,720,false);renderer.setClearColor('#edf4ff',controls ? 1 : 0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.autoClear=false;
const camera=new THREE.OrthographicCamera(-724,724,543,-543,.1,4000);camera.position.z=2000;
const loader=new THREE.TextureLoader();
const bg=await loader.loadAsync('assets/unified-cards/codle-blank-spheres-v1.png');bg.colorSpace=THREE.SRGBColorSpace;
const base=new THREE.Scene();base.add(new THREE.Mesh(new THREE.PlaneGeometry(1448,1086),new THREE.MeshBasicMaterial({map:bg,transparent:true,depthTest:false,depthWrite:false})));
async function texture(name){
 let svg=await(await fetch(`assets/card-visuals/codle-${name}.svg`)).text();
 // Original artwork uses saturated icon faces with soft directional shading.
 const palette={
  '#32D27D':['#09c77a','#009958'], '#3239DE':['#397aff','#1855dd'],
  '#42DB88':['#16cf68','#04a74d'], '#DFFF9A':['#ddf75b','#b9df36'],
  '#F889AA':['#ff75a1','#e9467b'], '#874BFF':['#8c43f4','#6420c8'],
  '#3E88FF':['#0796f7','#0075df'], '#FFC700':['#ffce13','#e8ad00'],
  '#FFDB58':['#ffdc24','#ffc000'], '#62BD6D':['#79bf1d','#4aa20e']
 };
 let defs='';let n=0;
 for(const [color,stops] of Object.entries(palette)){
  if(!svg.includes(color))continue;const id=`tone${n++}`;
  defs+=`<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${stops[0]}"/><stop offset="1" stop-color="${stops[1]}"/></linearGradient>`;
  svg=svg.replaceAll(color,`url(#${id})`);
 }
 svg=svg.replace('</svg>',`<defs>${defs}</defs></svg>`);
 if(name==='video')svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><linearGradient id="v" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#397aff"/><stop offset="1" stop-color="#1855dd"/></linearGradient></defs><rect x="3" y="3" width="18" height="18" rx="2.6" fill="url(#v)"/><path d="M9.4 8.4 Q9.4 7.6 10.2 8.1 L16 11.5 Q16.8 12 16 12.5 L10.2 15.9 Q9.4 16.4 9.4 15.6Z" fill="#f7fbff"/></svg>`;
 const u=URL.createObjectURL(new Blob([svg.replace('<svg ','<svg width="512" height="512" ')],{type:'image/svg+xml'}));
 const im=new Image();im.src=u;await im.decode();const c=document.createElement('canvas');c.width=c.height=512;c.getContext('2d').drawImage(im,0,0);URL.revokeObjectURL(u);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
}
// Pixel-space measurements from the approved original: icon offset is separate from ball center.
const specs=[
 ['python',230,710,160,164,.10,1,20,34,-.12],
 ['ai-socroom',905,724,162,172,-.06,-1,-3,42,.10],
 ['worksheet',1202,644,195,240,.65,1,-3,32,-.14],
 ['entry',585,867,235,286,-.42,-1,22,56,.05],
 ['video',175,1000,280,365,.38,1,54,66,0,0],
 ['board',830,990,170,210,-.38,-1,4,35,.10],
 ['quiz',1230,1000,280,330,-.31,1,8,112,0,0]
];
const parts=await Promise.all(specs.map(async([name,x,y,r,size,roll,dir,ox,oy,baseYaw,pitch=0],index)=>{
 const scene=new THREE.Scene(),pivot=new THREE.Group();pivot.position.set(x-724,543-y,0);scene.add(pivot);
 const sphere=new THREE.Mesh(new THREE.SphereGeometry(r,64,48),new THREE.MeshBasicMaterial({colorWrite:false}));pivot.add(sphere);
 const g=new THREE.PlaneGeometry(size,size,64,64),p=g.attributes.position;
 const surfaceCenter=new THREE.Vector3(ox,oy,Math.sqrt(r*r-ox*ox-oy*oy)).normalize();
 const surfaceRight=new THREE.Vector3(surfaceCenter.z,0,-surfaceCenter.x).normalize();
 const surfaceUp=new THREE.Vector3().crossVectors(surfaceCenter,surfaceRight).normalize();
 for(let i=0;i<p.count;i++){
  const xx=p.getX(i),yy=p.getY(i);
  if(name==='video'||name==='quiz'){
   // Place the icon in the local tangent frame, then wrap it onto the sphere.
   // This makes foreshortening follow the attachment point, not an arbitrary camera tilt.
   const u=(xx*Math.cos(roll)-yy*Math.sin(roll))/r;
   const v=(xx*Math.sin(roll)+yy*Math.cos(roll))/r;
   const theta=Math.hypot(u,v);
   const tangent=surfaceRight.clone().multiplyScalar(u).addScaledVector(surfaceUp,v);
   const point=surfaceCenter.clone().multiplyScalar(Math.cos(theta));
   if(theta>0)point.addScaledVector(tangent,Math.sin(theta)/theta);
   point.multiplyScalar(r+.7);p.setXYZ(i,point.x,point.y,point.z);continue;
  }
  let px=xx*Math.cos(roll)-yy*Math.sin(roll)+ox;
  let py=xx*Math.sin(roll)+yy*Math.cos(roll)+oy;
  const distance=Math.hypot(px,py),limit=r*.995;
  if(distance>limit){px*=limit/distance;py*=limit/distance;}
  // Exact spherical surface: yaw changes perspective without spinning the printed design.
  p.setXYZ(i,px,py,Math.sqrt(r*r-px*px-py*py)+.6);
 }
 g.computeVertexNormals();const icon=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:await texture(name),transparent:true,depthWrite:false,side:THREE.FrontSide}));pivot.add(icon);
 // Foreground balls hide rear decals, just as they do in the original raster.
 for(const foreground of specs.slice(index+1)){
  // The pink painted silhouette has its own center and radius, distinct from the decal rig.
  const [,fx,fy,fr]=foreground[0]==='quiz' && name==='worksheet'
   ? ['quiz',1235,935,231] : foreground;
  const mask=new THREE.Mesh(new THREE.CircleGeometry(fr,128),new THREE.MeshBasicMaterial({colorWrite:false}));
  mask.position.set(fx-724,543-fy,900);mask.renderOrder=-1;scene.add(mask);
 }
 return {scene,pivot,dir,baseYaw,pitch};
}));
let hover=false,phase=0,angle=0,raf=0,last=0,recording=false;
function draw(){renderer.clear();renderer.render(base,camera);for(const part of parts){renderer.clearDepth();part.pivot.rotation.set(part.pitch,part.baseYaw+angle*part.dir,0,'YXZ');renderer.render(part.scene,camera);}canvas.dataset.angle=(angle*180/Math.PI).toFixed(2);}
function tick(now){raf=0;const dt=Math.min((now-last)/1000||0,.05);last=now;if(hover)phase+=dt;const target=hover?Math.sin(phase*.85)*.065:0;angle+=(target-angle)*(1-Math.exp(-dt*7));draw();if(hover||Math.abs(angle)>.0005)raf=requestAnimationFrame(tick);else{angle=0;draw();}}
function start(){if(reduced.matches&&!recording)return;hover=true;showStatus('구면 위에서 좌우 회전 중');if(!raf){last=performance.now();raf=requestAnimationFrame(tick);}}
function stop(){hover=false;showStatus('마우스를 올려보세요');}
card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')start();});card.addEventListener('pointerleave',()=>{if(!recording)stop();});

reduced.addEventListener('change',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!recording)stop();});
if(controls){
controls.play.onclick=start;controls.reset.onclick=stop;
controls.record.onclick=()=>{
 if(recording)return;recording=true;angle=phase=0;const stream=canvas.captureStream(30),chunks=[];
 const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6000000});
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 recorder.onstop=()=>{const blob=new Blob(chunks,{type:'video/webm'});const link=controls.download;if(link.dataset.url)URL.revokeObjectURL(link.dataset.url);link.download='codle-surface-tangent.webm';link.href=URL.createObjectURL(blob);link.dataset.url=link.href;link.hidden=false;stream.getTracks().forEach(t=>t.stop());recording=false;showStatus('영상 저장 준비 완료');};
 recorder.start();start();setTimeout(()=>{stop();},6200);setTimeout(()=>recorder.stop(),8000);
};
}
showStatus('마우스를 올려보세요');draw();
}
