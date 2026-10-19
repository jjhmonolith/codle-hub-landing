import * as THREE from 'three';
import {ease} from './story-timeline.js?v=2';
import {chapterAt,surfaceAt} from './surface-timeline.js?v=2';
import {productLandingPose} from './spatial-scene-motion.js?v=15';
import {createVolumeWorlds} from './volume-worlds.js?v=49';
import {createSceneAtmosphere} from './scene-atmosphere.js?v=3';
export async function createLandingSurface(host,products,onFailure){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;
 renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();onFailure?.()});
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,30);camera.position.z=8;
 const atmosphere=createSceneAtmosphere(scene),volumes=await createVolumeWorlds(scene,renderer,products);
 const pointer={x:0,y:0,ex:0,ey:0},point=new THREE.Vector3(),bounds=new THREE.Box3();
 let width=1,height=1,worldHeight=1,worldWidth=1;
 function resize(){width=host.clientWidth||innerWidth;height=host.clientHeight||innerHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();worldHeight=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*8;worldWidth=worldHeight*camera.aspect}
 resize();
 function render(position,collection=1,time=0){
  const s=surfaceAt(position,products.length),id=products[s.from].id,ch=chapterAt(position,s.from,products.length);
  pointer.ex+=(pointer.x-pointer.ex)*.09;pointer.ey+=(pointer.y-pointer.ey)*.09;camera.position.set(pointer.ex*.15,-pointer.ey*.10,8);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  atmosphere.render(position,collection,time,width,height);volumes.render(position,collection,time,{width,height,worldWidth,worldHeight});
  const pose=productLandingPose(id,ch.phase,width,height),anchor=volumes.anchorFor(id);
  let rect={left:pose.screenX-pose.pixelWidth/2,top:pose.screenY-pose.pixelWidth*9/32,width:pose.pixelWidth,height:pose.pixelWidth*9/16};
  if(anchor){
   let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;anchor.object.updateWorldMatrix(true,false);
   const project=()=>{point.project(camera);const px=(point.x+1)*width/2,py=(1-point.y)*height/2;left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py)};
   if(anchor.volumeBounds){
    bounds.setFromObject(anchor.object,true);
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){point.set(x,y,z);project()}
   }else for(const x of [-anchor.width/2,anchor.width/2])for(const y of [-anchor.height/2,anchor.height/2]){point.set(x,y,anchor.offsetZ||0).applyMatrix4(anchor.object.matrixWorld);project()}
   rect={left,top,width:right-left,height:bottom-top};
  }
  const right=Math.min(width-12,rect.left+rect.width),bottom=Math.min(height*(width<=700?.60:.70),rect.top+rect.height);
  rect.left=Math.max(12,rect.left);rect.top=Math.max(width<=700?86:100,rect.top);rect.width=Math.max(24,right-rect.left);rect.height=Math.max(24,bottom-rect.top);
  renderer.render(scene,camera);
  const copy=(id==='contents'?ease(.55,.65,ch.phase):ease(.08,.21,ch.phase))*(id==='platform'?1-ease(.855,.925,ch.phase):1);
  return {...s,copy:s.copy*copy,reveal:pose.ready*ch.presence,rect};
 }
 function capture(rect){
  try{
   renderer.render(scene,camera);
   const sx=renderer.domElement.width/width,sy=renderer.domElement.height/height,canvas=document.createElement('canvas');
   canvas.width=Math.max(1,Math.round(rect.width*sx));canvas.height=Math.max(1,Math.round(rect.height*sy));
   const ctx=canvas.getContext('2d');ctx.fillStyle='#0b1019';ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.drawImage(renderer.domElement,Math.max(0,rect.left)*sx,Math.max(0,rect.top)*sy,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
   return canvas.toDataURL('image/webp',.94);
  }catch{return null}
 }
 return {resize,render,capture,setPointer(x=0,y=0){pointer.x=x;pointer.y=y},dispose(){atmosphere.dispose();volumes.dispose();renderer.dispose();renderer.domElement.remove()}};
}