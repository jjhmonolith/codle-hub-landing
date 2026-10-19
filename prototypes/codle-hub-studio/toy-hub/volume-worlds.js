import * as THREE from 'three';
import {clamp,ease,mix} from './story-timeline.js?v=2';
import {featurePose,contentFeaturePose,toWorld} from './spatial-scene-motion.js?v=15';
import {createStudioScenes} from './studio-scenes.js?v=14';
import {STREAM_ORDER} from './content-stream-motion.js?v=5';
import {chapterAt} from './surface-timeline.js?v=2';

// All props share the landing's camera, light rig and depth buffer. No DOM
// perspective or baked drop shadows: silhouettes and reflections turn in 3D.
export async function createVolumeWorlds(scene,renderer,products){
  const resources=new Set(),maps=new Set(),groups=[];
  const own=value=>(resources.add(value),value);
  const physical=(color,options={})=>own(new THREE.MeshPhysicalMaterial({color,roughness:.25,metalness:.12,clearcoat:.65,clearcoatRoughness:.18,...options}));
  const ivory=physical('#eeeae0',{roughness:.52,metalness:0,clearcoat:.12});
  const ink=physical('#19212e',{roughness:.29,metalness:.45});
  const silver=physical('#bdc8d8',{roughness:.2,metalness:.88});

  const studio=new THREE.Scene();studio.background=new THREE.Color('#424959');
  const sources=[[-6,5,5,4,7,5],[6,2,2,2,8,4],[0,7,0,7,3,4],[-1,-5,5,6,1,2]];
  for(const [x,y,z,w,h,power] of sources){
    const box=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color('#ffffff').multiplyScalar(power),side:THREE.DoubleSide}));
    box.position.set(x,y,z);box.lookAt(0,0,0);studio.add(box);
  }
  const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(studio,.035);
  studio.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}});pmrem.dispose();
  scene.environment=environment.texture;scene.environmentIntensity=.82;
  const lights=new THREE.Group();lights.add(new THREE.HemisphereLight('#e4edff','#34324a',1.1));
  for(const [color,power,x,y,z] of [['#ffffff',2.6,-4,7,8],['#c9ddff',1.1,6,0,4],['#fff2d8',2.2,2,5,-5]]){
    const light=new THREE.DirectionalLight(color,power);light.position.set(x,y,z);lights.add(light);
  }
  scene.add(lights);

  function roundedShape(w,h,r){
    const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
    s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
    s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
  }
  function slab(w,h,d,r,material,parent,x=0,y=0,z=0){
    const bevel=Math.min(d*.24,.045,w*.2,h*.2),shape=roundedShape(w-bevel*2,h-bevel*2,Math.max(.001,Math.min(r-bevel,(w-bevel*2)/2,(h-bevel*2)/2)));
    const geometry=own(new THREE.ExtrudeGeometry(shape,{depth:d-bevel*2,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:4,curveSegments:12,steps:1}));
    geometry.translate(0,0,-d/2+bevel);
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  }
  function canvasMap(w,h,draw){
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d');draw(ctx,w,h);
    const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());maps.add(map);return map;
  }
  function face(w,h,r,map,parent,z,lit=true){
    const geometry=own(new THREE.ShapeGeometry(roundedShape(w,h,r),16));
    const uv=geometry.attributes.uv,position=geometry.attributes.position;
    for(let i=0;i<uv.count;i++)uv.setXY(i,position.getX(i)/w+.5,position.getY(i)/h+.5);
    const material=lit?physical('#ffffff',{map,roughness:.38,metalness:0,clearcoat:.22}):own(new THREE.MeshBasicMaterial({map,toneMapped:false}));
    const mesh=new THREE.Mesh(geometry,material);mesh.position.z=z;parent.add(mesh);return mesh;
  }
  function label(text,color='#fff',size=190){
    return canvasMap(512,512,(c)=>{c.fillStyle=color;c.font=`650 ${size}px Pretendard, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,256)});
  }
  function decal(map,w,h,parent,z){
    const material=physical('#ffffff',{map,transparent:true,depthWrite:false,roughness:.32,metalness:0});
    const mesh=new THREE.Mesh(own(new THREE.PlaneGeometry(w,h)),material);mesh.position.z=z;parent.add(mesh);return mesh;
  }
  function line(points,color,parent,radius=.008){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const tube=new THREE.Mesh(own(new THREE.TubeGeometry(curve,32,radius,6,false)),physical(color,{roughness:.3,metalness:.6}));parent.add(tube);return tube;
  }
  const loader=new THREE.TextureLoader();
  const manifestResponse=await fetch('assets/worlds/content-thumbnails.sources.json?v=2');
  if(!manifestResponse.ok)throw new Error('Content cover list unavailable');
  const contentManifest=await manifestResponse.json();
  const [toolMap,...contentMaps]=await Promise.all(['codle-tools-ui.png',...contentManifest.items.map(item=>item.file)].map(async name=>{
    const map=await loader.loadAsync('assets/worlds/'+name);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;maps.add(map);return map;
  }));
  await document.fonts.ready;
  function icon(x,y,color,text){
    const g=new THREE.Group();const mat=physical(color,{roughness:.18,metalness:.14,clearcoat:1});
    slab(1,1,.27,.23,mat,g);
    slab(.82,.82,.018,.18,physical(color,{roughness:.33,metalness:.35}),g,0,0,-.145);
    const map=text?label(text):canvasMap(512,512,(c,w,h)=>{
      // Extract only the white mark from Codle's official tool artwork.
      const ratio=toolMap.image.width/2048;c.save();c.beginPath();c.roundRect(0,0,w,h,106);c.clip();
      c.drawImage(toolMap.image,x*ratio,y*ratio,166*ratio,166*ratio,0,0,w,h);c.restore();
      const data=c.getImageData(0,0,w,h);
      for(let i=0;i<data.data.length;i+=4){const a=clamp((Math.min(data.data[i],data.data[i+1],data.data[i+2])-220)/35);data.data[i+3]*=a;data.data[i]=data.data[i+1]=data.data[i+2]=255}
      c.putImageData(data,0,0);
    });
    decal(map,.94,.94,g,.139);
    for(let i=0;i<3;i++)slab(.27-i*.04,.018,.008,.008,silver,g,0,(i-1)*.07,-.159);
    g.userData.turn=true;
    return g;
  }


  const assetNames=['content-ai.png','cmass-page33.png','jitda-official-demo.png','textbook-river-board.png','textbook-farmer.png','textbook-cabbage.png','textbook-wolf.png','textbook-sheep.png','textbook-boat.png'];
  const assets=Object.fromEntries(await Promise.all(assetNames.map(async name=>{
    const map=await loader.loadAsync('assets/worlds/'+name);map.colorSpace=THREE.SRGBColorSpace;
    map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());maps.add(map);return [name,map];
  })));
  const workerData=await fetch('assets/worlds/jitda-worker-v1.json.gz').then(async r=>{if(!r.ok)throw new Error('Worker model unavailable');return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json()});
  const binary=text=>Uint8Array.from(atob(text),c=>c.charCodeAt(0)).buffer;
  const workerModel=workerData.parts.map(part=>{
    const geometry=own(new THREE.BufferGeometry());
    for(const [name,spec] of Object.entries(part.attributes)){
      const packed=new Uint16Array(binary(spec.data)),values=new Float32Array(spec.length),previous=new Uint16Array(spec.itemSize);
      for(let i=0;i<values.length;i++){const c=i%spec.itemSize,q=(previous[c]+packed[i])&65535;previous[c]=q;values[i]=spec.min[c]+q/65535*(spec.max[c]-spec.min[c])}
      geometry.setAttribute(name,new THREE.BufferAttribute(values,spec.itemSize));
    }
    if(part.index){const delta=new Uint32Array(binary(part.index)),values=new Uint32Array(delta.length);let previous=0;for(let i=0;i<values.length;i++){previous=(previous+delta[i])>>>0;values[i]=previous}geometry.setIndex(new THREE.BufferAttribute(values,1))}
    geometry.computeBoundingSphere();return {...part,geometry};
  });
  function sheet(map,depth=.045,body=ink){
    const g=new THREE.Group(),w=1.82,h=w*map.image.height/map.image.width;
    slab(w,h,depth,.025,body,g);face(w-.012,h-.012,.021,map,g,depth/2+.002,false);
    g.userData.nativeWidth=w;return g;
  }
  const orderedMaps=[...contentMaps].sort((a,b)=>b.image.width-a.image.width);
  const first=contentMaps[contentManifest.items.findIndex(item=>item.file==='thumbnail-everyday-ai.webp')];
  orderedMaps.splice(orderedMaps.indexOf(first),1);orderedMaps.unshift(first);
  const factories={
    ...createStudioScenes({THREE,own,physical,slab,face,canvasMap,line,assets,icon,ivory,ink,workerModel}),
    contents:()=>orderedMaps.map((map,i)=>{const g=sheet(map,.022);g.userData.streamIndex=STREAM_ORDER.indexOf(i);g.userData.aspect=map.image.width/map.image.height;return g})
  };
  products.forEach((product,index)=>{
    const root=new THREE.Group();root.visible=false;scene.add(root);
    const actors=(factories[product.id]?.()||[]).map((mesh,order)=>{
      root.add(mesh);const materials=[];
      mesh.traverse(node=>{if(node.isMesh||node.isLine){
        const original=node.material;
        const material=own(original.clone());material.transparent=true;
        materials.push({material,opacity:original.opacity,depthWrite:original.depthWrite,color:original.color?.clone()});
        node.material=material;
      }});return {mesh,order,materials};
    });groups.push({root,index,id:product.id,actors});
  });
  function render(position,collection,time,{width,height}){
    for(const world of groups){
      const chapter=chapterAt(position,world.index,products.length);
      world.root.visible=collection>.015&&chapter.presence>.002;if(!world.root.visible)continue;
      for(const a of world.actors){
        const data=a.mesh.userData;
        const pose=world.id==='contents'?contentFeaturePose(data.streamIndex,chapter.phase,width,height,data.aspect):featurePose(world.id,a.order,chapter.phase,width,height);
        // Each pose already owns its entry fade. Applying chapter.entry again
        // made adjacent scenes disappear into a dark, doubled crossfade.
        const opacity=pose.opacity*(1-chapter.exit)*collection;
        a.mesh.visible=opacity>.002;if(!a.mesh.visible)continue;
        const point=toWorld(pose,width,height,data.nativeWidth||1);
        a.mesh.position.set(point.x,point.y,point.z);a.mesh.scale.setScalar(point.scale);
        a.mesh.rotation.set(pose.pitch,pose.yaw,pose.roll);data.animate?.(chapter.phase,{width,height});
        a.materials.forEach(({material,opacity:base,depthWrite,color})=>{
          material.opacity=base*opacity*(material.userData.localOpacity??1);if(material.uniforms?.worldOpacity)material.uniforms.worldOpacity.value=opacity;material.depthWrite=depthWrite&&material.opacity>.99;
          if(color)material.color.copy(color).multiplyScalar(pose.brightness);
        });
      }
    }
  }
  return {render,anchorFor(id){
    const world=groups.find(g=>g.id===id),actor=world?.actors[0]?.mesh;
    if(!world?.root.visible||!actor?.visible)return null;
    const anchor=actor.userData.landingAnchor;if(!anchor)return null;
    actor.updateWorldMatrix(true,true);return anchor;
  },setPointer(){},dispose(){groups.forEach(g=>scene.remove(g.root));scene.remove(lights);resources.forEach(r=>r.dispose());maps.forEach(m=>m.dispose());environment.dispose()}};
}
