import * as THREE from 'three';
import {createInkCurtain} from './ink-curtain.js?v=3';
import {FIRST_DEPTH,DEPTH_GAP,FOCAL_DISTANCE,flightCamera,layerEase} from './depth-flight.js?v=2';

export function createDepthGallery(root,props,cards,poses){
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.setClearColor('#08090d',1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NoToneMapping;
  const canvas=renderer.domElement;
  canvas.className='depth-world';canvas.setAttribute('aria-hidden','true');root.prepend(canvas);
  const curtain=createInkCurtain();document.body.dataset.inkWorld='true';
  const scene=new THREE.Scene();scene.fog=new THREE.Fog('#08090d',1500,3300);
  const camera=new THREE.PerspectiveCamera(48,1,25,18000);
  const geometry=new THREE.PlaneGeometry(1,1),records=[],mainRecords=[];
  let width=0,height=0,worldWidth=0,worldHeight=0,needsRender=true,lastDepth=null,imageReveal=0;
  const maxAnisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());

  function configureTexture(texture){
    texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=maxAnisotropy;
    texture.needsUpdate=true;return texture;
  }
  function register(element,spec,main=false){
    const cutout=element.classList.contains('depth-mascot')||element.classList.contains('mosaic-logos')||element.classList.contains('mosaic-tools');
    const liveCanvas=element.classList.contains('mosaic-logos')||element.classList.contains('mosaic-tools');
    const material=new THREE.MeshBasicMaterial({color:0xffffff,transparent:cutout,depthWrite:!cutout,alphaTest:cutout?.008:0,fog:!liveCanvas,side:THREE.FrontSide});
    const mesh=new THREE.Mesh(geometry,material);mesh.visible=false;scene.add(mesh);
    const record={element,spec,mesh,main,texture:null,source:null};records.push(record);
    const img=element.querySelector('img');
    if(img){
      const load=async()=>{if(!img.naturalWidth)return;await img.decode().catch(()=>{});const bitmap=await createImageBitmap(img,{imageOrientation:'flipY',premultiplyAlpha:'none',colorSpaceConversion:'none',resizeWidth:img.naturalWidth,resizeHeight:img.naturalHeight});record.texture=configureTexture(new THREE.Texture(bitmap));record.texture.flipY=false;material.map=record.texture;material.needsUpdate=true;mesh.visible=imageReveal>.01;needsRender=true};
      if(img.complete&&img.naturalWidth)load();else img.addEventListener('load',load,{once:true});
    }
    return record;
  }
  props.forEach(spec=>register(spec.element,spec));
  cards.forEach(({article},index)=>{
    const pose=poses[index];
    mainRecords.push(register(article,{x:pose.restX,y:pose.restY,width:pose.width,aspect:1/.57,depth:FIRST_DEPTH+index*DEPTH_GAP,roll:0},true));
  });
  function resize(w,h){
    needsRender=true;width=w;height=h;camera.aspect=w/h;camera.updateProjectionMatrix();
    worldHeight=2*FOCAL_DISTANCE*Math.tan(THREE.MathUtils.degToRad(camera.fov/2));worldWidth=worldHeight*camera.aspect;
    renderer.setSize(w,h,false);
    for(const record of records){
      const {spec,mesh,main}=record;
      const planeWidth=Math.min(spec.width,main?h*1.5/w:spec.width)*worldWidth;
      mesh.scale.set(planeWidth,planeWidth/spec.aspect,1);
      mesh.position.set(spec.x*worldWidth,-spec.y*worldHeight,-spec.depth);
      mesh.rotation.set(main?0:-spec.y*.09,main?0:-Math.sign(spec.x)*.085,-THREE.MathUtils.degToRad(spec.roll||0));
      mesh.updateMatrixWorld();
    }
  }
  function update(depth){
    if(lastDepth===null||Math.abs(lastDepth-depth)>.001)needsRender=true;lastDepth=depth;
    const view=flightCamera(depth);
    // The opening presents the two original marks first. Screens become legible
    // only as the aperture opens, without transparency sorting or extra effects.
    const reveal=layerEase(260,1000,depth);imageReveal=reveal;
    scene.fog.near=1500*reveal;scene.fog.far=800+2500*reveal;
    for(const record of records){
      if(record.element.querySelector('img'))record.mesh.visible=!!record.texture&&reveal>.01;
      if(record.element.classList.contains('mosaic-tools'))record.mesh.material.opacity=layerEase(550,900,depth);
    }
    camera.position.set(view.x*worldWidth,view.y*worldHeight,view.z);
    camera.rotation.set(0,0,0);camera.updateMatrixWorld();
    canvas.dataset.cameraDepth=depth.toFixed(2);
    canvas.dataset.cameraX=view.x.toFixed(4);canvas.dataset.cameraY=view.y.toFixed(4);
  }
  function projectMain(index){
    const record=mainRecords[index],mesh=record.mesh;
    const distance=camera.position.z-mesh.position.z;
    if(distance<=80)return {x:0,y:0,width:1,height:1,scale:1,roll:0,visible:false,zIndex:30};
    const corners=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(([x,y])=>{
      const v=new THREE.Vector3(x,y,0);mesh.localToWorld(v);v.project(camera);
      return {x:(v.x*.5+.5)*width,y:(-.5*v.y+.5)*height};
    });
    const left=Math.min(...corners.map(v=>v.x)),right=Math.max(...corners.map(v=>v.x));
    const top=Math.min(...corners.map(v=>v.y)),bottom=Math.max(...corners.map(v=>v.y));
    return {x:(left+right)/2,y:(top+bottom)/2,width:right-left,height:bottom-top,scale:1,roll:0,visible:right>0&&left<width&&bottom>0&&top<height,zIndex:30};
  }
  function render(entry=1,live=false){
    for(const record of records){
      if(record.element.querySelector('img'))continue;
      if(camera.position.z-record.mesh.position.z<=25)continue;
      const source=record.element.querySelector('canvas');
      if(source&&source!==record.source){
        record.source=source;record.texture=configureTexture(new THREE.CanvasTexture(source));
        record.mesh.material.map=record.texture;record.mesh.material.needsUpdate=true;record.mesh.visible=true;needsRender=true;
      }
      if(record.texture&&live){record.texture.needsUpdate=true;needsRender=true}
      if(record.element.classList.contains('mosaic-logos'))record.mesh.material.opacity=entry;
    }
    const logo=records.find(record=>record.element.classList.contains('mosaic-logos'));
    canvas.style.opacity=(lastDepth>700||(logo?.source&&entry>.12))?'1':'0';
    if(needsRender){renderer.render(scene,camera);curtain.render(renderer);needsRender=false}
  }
  root.classList.add('has-depth-world');
  canvas.addEventListener('webglcontextlost',()=>document.dispatchEvent(new CustomEvent('depth-world-lost')));
  return {resize,update,projectMain,render,setCurtain(config){curtain.update(config);needsRender=true}};
}
