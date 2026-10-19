import * as THREE from 'three';
import {streamPose,streamScene,streamLandingPose,STREAM_ORDER,STREAM_DURATION} from './content-stream-motion.js?v=5';
import {stackPose,stackScene} from './content-stack-motion.js?v=4';

const $=s=>document.querySelector(s),clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,t)=>a+(b-a)*t,ease=(a,b,p)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)};
const host=$('.canvas-host'),stage=$('.study-scene'),range=$('input[type=range]'),play=$('.play');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let mode='stream',target=reduced.matches?.30:0,progress=target,playing=!reduced.matches,last=0,dirty=true;
let width=1,height=1,manifest;

try{
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0,0);host.append(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,90);camera.position.z=12;
  const loader=new THREE.TextureLoader();
  manifest=await fetch('assets/worlds/content-thumbnails.sources.json?v=2').then(r=>{if(!r.ok)throw Error('covers');return r.json()});
  const maps=await Promise.all(manifest.items.map(async item=>{
    const map=await loader.loadAsync('assets/worlds/'+item.file);map.colorSpace=THREE.SRGBColorSpace;
    map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return map;
  }));
  const space=new THREE.Group();scene.add(space);
  scene.add(new THREE.HemisphereLight(0xd7e4ff,0x171924,2));
  const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-5,7,12);scene.add(key);
  const orderedMaps=[...maps].sort((a,b)=>b.image.width-a.image.width);
  const first=maps[manifest.items.findIndex(item=>item.file==='thumbnail-everyday-ai.webp')];
  if(first){orderedMaps.splice(orderedMaps.indexOf(first),1);orderedMaps.unshift(first)}
  function makeTile(map){
    const aspect=map.image.width/map.image.height,h=1/aspect,r=.009;
    const shape=new THREE.Shape();shape.moveTo(-.5+r,-h/2);shape.lineTo(.5-r,-h/2);
    shape.quadraticCurveTo(.5,-h/2,.5,-h/2+r);shape.lineTo(.5,h/2-r);
    shape.quadraticCurveTo(.5,h/2,.5-r,h/2);shape.lineTo(-.5+r,h/2);
    shape.quadraticCurveTo(-.5,h/2,-.5,h/2-r);shape.lineTo(-.5,-h/2+r);
    shape.quadraticCurveTo(-.5,-h/2,-.5+r,-h/2);
    const bodyGeometry=new THREE.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2,steps:1,curveSegments:4});
    bodyGeometry.translate(0,0,-.021);
    const bodyMaterial=new THREE.MeshStandardMaterial({color:0x868990,roughness:.50,metalness:.12,transparent:true});
    const faceGeometry=new THREE.ShapeGeometry(shape,4),uv=faceGeometry.attributes.uv,position=faceGeometry.attributes.position;
    for(let i=0;i<uv.count;i++)uv.setXY(i,position.getX(i)+.5,position.getY(i)/h+.5);
    const faceMaterial=new THREE.MeshBasicMaterial({map,transparent:true,toneMapped:false});
    const face=new THREE.Mesh(faceGeometry,faceMaterial);face.position.z=.0015;
    const group=new THREE.Group();group.add(new THREE.Mesh(bodyGeometry,bodyMaterial),face);space.add(group);
    return {group,aspect,bodyMaterial,faceMaterial};
  }
  const tiles=orderedMaps.map((map,index)=>({...makeTile(map),streamIndex:STREAM_ORDER.indexOf(index)}));
  const landingMap=await loader.loadAsync('assets/actual-contents.jpg');landingMap.colorSpace=THREE.SRGBColorSpace;
  landingMap.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const landingTile=makeTile(landingMap);
  function placeTile({group,bodyMaterial,faceMaterial},pose){
    group.position.set(pose.x,pose.y,pose.z);group.rotation.set(pose.pitch,pose.yaw,pose.roll);
    group.scale.setScalar(pose.tileWidth*pose.scale);
    bodyMaterial.opacity=faceMaterial.opacity=pose.opacity;
    faceMaterial.color.setScalar(pose.brightness);group.visible=pose.opacity>.002;
  }
  function resize(){
    width=stage.clientWidth;height=stage.clientHeight;renderer.setSize(width,height,false);
    camera.aspect=width/height;camera.updateProjectionMatrix();
    dirty=true;
  }
  new ResizeObserver(resize).observe(stage);resize();
  function draw(){
    const p=progress,spatial=(mode==='stack'?stackScene:streamScene)(p,width,height);
    const reveal=mode==='stack'?spatial.landing:ease(.985,1,p),destination=$('.destination');
    camera.position.z=spatial.cameraZ;
    tiles.forEach((tile,i)=>{
        const pose=mode==='stack'?stackPose(i,p,width,height,tile.aspect):streamPose(tile.streamIndex,p,width,height,tile.aspect);
        placeTile(tile,pose);
    });
    if(mode==='stream'){
      const pose=streamLandingPose(p,width,height,landingTile.aspect);placeTile(landingTile,pose);
      destination.style.left=`${pose.screenX}px`;destination.style.top=`${pose.screenY}px`;
      destination.style.width=`${pose.halfWidth*2}px`;
      destination.style.transform='translate(-50%,-50%)';
    }else{
      landingTile.group.visible=false;
      destination.style.removeProperty('left');destination.style.removeProperty('top');destination.style.removeProperty('width');
      destination.style.transform=`translate(-50%,-50%) scale(${mix(.90,1,reveal)})`;
    }
    destination.style.opacity=reveal.toFixed(4);destination.setAttribute('aria-hidden',String(reveal<.85));
    const featureEnd=mode==='stack'?.40:.085,landingStart=mode==='stack'?.85:.875;
    range.value=String(Math.round(p*100));stage.dataset.phase=p<featureEnd?'feature':p<landingStart?'transition':'landing';
    document.querySelectorAll('[data-progress]').forEach(button=>{
      const point=Number(button.dataset.progress);
      button.setAttribute('aria-pressed',String(point===0?p<featureEnd:point<1?p>=featureEnd&&p<landingStart:p>=landingStart));
    });
    renderer.render(scene,camera);dirty=false;
  }
  function stop(){playing=false;play.textContent='재생 ↗'}
  function setTarget(value){stop();target=clamp(value);dirty=true;if(reduced.matches)progress=target}
  function replay(){
    if(reduced.matches){setTarget(mode==='stack'?.64:.30);return}
    target=0;progress=0;playing=true;play.textContent='멈춤';dirty=true;
  }
  document.querySelectorAll('button[data-mode]').forEach(button=>button.addEventListener('click',()=>{
    mode=button.dataset.mode;stage.dataset.mode=mode;replay();
    document.querySelectorAll('button[data-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.mode===mode)));
    $('.direction-copy').textContent=mode==='stack'?'이전 구도 · 전체 콘텐츠 펼침':'콘텐츠 한 장이, 새로운 배움의 입구로';
    document.querySelector('[data-progress="0.36"]').textContent=mode==='stack'?'펼침':'흐름';
  }));
  document.querySelectorAll('[data-progress]').forEach(button=>button.addEventListener('click',()=>{
    let p=Number(button.dataset.progress);
    if(p>0&&p<1)p=mode==='stack'?.64:.30;
    setTarget(p);
  }));
  range.addEventListener('input',()=>{setTarget(Number(range.value)/100);progress=target});
  play.addEventListener('click',()=>{
    if(playing){stop();return}
    replay();
  });
  stage.addEventListener('wheel',event=>{
    if(reduced.matches)return;event.preventDefault();
    const pixels=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?height:1);
    setTarget(target+pixels*(mode==='stream'?.00052:.00038));
  },{passive:false});
  let touchY=null;
  stage.addEventListener('touchstart',event=>{touchY=event.touches.length===1?event.touches[0].clientY:null},{passive:true});
  stage.addEventListener('touchmove',event=>{
    if(reduced.matches||touchY===null||event.touches.length!==1)return;
    const next=event.touches[0].clientY,delta=touchY-next;touchY=next;
    if((delta<0&&target<=0)||(delta>0&&target>=1))return;
    event.preventDefault();setTarget(target+delta*.0013);
  },{passive:false});
  stage.addEventListener('touchend',()=>{touchY=null},{passive:true});
  reduced.addEventListener('change',()=>{stop();progress=target;dirty=true});
  document.addEventListener('visibilitychange',()=>{last=performance.now()});
  $('.load-status').hidden=true;
  play.textContent=playing?'멈춤':'다시 보기 ↗';
  function frame(now){
    requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000||.016);last=now;
    if(document.hidden)return;
    if(playing){const end=mode==='stack'?.67:1;target=Math.min(end,target+dt/(mode==='stack'?4.5:STREAM_DURATION));if(target>=end)stop()}
    const next=reduced.matches?target:mix(progress,target,1-Math.exp(-dt/.12));
    if(Math.abs(next-progress)>.00001||dirty){progress=Math.abs(next-target)<.00002?target:next;draw()}
  }
  draw();requestAnimationFrame(frame);
}catch(error){
  // The authentic covers remain accessible even if WebGL is unavailable.
  try{
    manifest??=await fetch('assets/worlds/content-thumbnails.sources.json?v=2').then(r=>r.json());
    const fallback=$('.cover-fallback');
    for(const [i,item] of manifest.items.entries()){
      const img=document.createElement('img');img.src='assets/worlds/'+item.file;img.alt=item.title||`코들 수업 콘텐츠 ${i+1}`;fallback.append(img);
    }
    fallback.hidden=false;$('.load-status').hidden=true;stage.classList.add('static-mode');
    document.querySelectorAll('.study-bar button,.study-controls button,input').forEach(el=>el.disabled=true);
    $('.direction-copy').textContent='전체 콘텐츠 미리보기';
  }catch{ $('.load-status').textContent='콘텐츠를 불러오지 못했어요. 새로고침해 주세요.'; }
  console.error('Composition study could not load',error);
}
