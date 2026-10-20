import * as T from 'three';
import {loadToyParts} from './mesh-pack.js?v=1';
import {addMaterialSculpture} from './mosaic-sculptures.js?v=4';

// Service-sized still lifes. Existing menu and scene transitions own navigation.
export async function createMosaicObject(mount,id){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.toneMapping=T.NeutralToneMapping;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.setClearColor(0,0);mount.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,60);camera.position.set(0,0,12);
 const room=new T.Scene();room.background=new T.Color('#596475');
 for(const [w,h,x,y,z,power] of [[6,8,-7,5,4,5],[3,7,6,2,2,4],[7,3,0,8,-2,4]]){
  const light=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color('white').multiplyScalar(power),side:T.DoubleSide}));light.position.set(x,y,z);light.lookAt(0,0,0);room.add(light);
 }
 const generator=new T.PMREMGenerator(renderer),environment=generator.fromScene(room,.025);scene.environment=environment.texture;scene.environmentIntensity=.75;generator.dispose();room.traverse(n=>{n.geometry?.dispose();n.material?.dispose()});
 scene.add(new T.HemisphereLight('#fffdf8','#4f5867',1.25));
 const key=new T.DirectionalLight('#fff9ee',2.5);key.position.set(-3,7,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=7;key.shadow.camera.bottom=-7;key.shadow.normalBias=.03;key.shadow.bias=-.0002;scene.add(key);
 const rim=new T.DirectionalLight('#dce7ff',1.4);rim.position.set(6,3,-4);scene.add(rim);
 const root=new T.Group();scene.add(root);const moving=[];let sculpture=null;
 const material=(color,extra={})=>new T.MeshPhysicalMaterial({color,roughness:.30,metalness:.16,clearcoat:.7,clearcoatRoughness:.20,...extra});
 const ink=material('#25364e',{metalness:.65}),paper=material('#fff4df',{metalness:0,roughness:.57}),blue=material('#2465fc'),gold=material('#ffbf31');
 const loader=new T.TextureLoader(),maps=new Map();
 async function map(file){if(maps.has(file))return maps.get(file);const m=await loader.loadAsync('assets/worlds/'+file);m.colorSpace=T.SRGBColorSpace;m.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());maps.set(file,m);return m}
 function slab(w,h,d,r,mat,parent,x=0,y=0,z=0){
  const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const mesh=new T.Mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:Math.min(.035,d*.24,r*.3),bevelSize:Math.min(.035,d*.24,r*.3),bevelSegments:5,curveSegments:16}),mat);mesh.geometry.translate(0,0,-d/2);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function face(texture,w,h,parent,z=.08){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,toneMapped:false}));m.position.z=z;parent.add(m);return m}
 function display(texture,w,parent,body=ink){
  const h=w*texture.image.height/texture.image.width,g=new T.Group();
  slab(w+.13,h+.13,.065,.075,body,g);
  slab(w+.045,h+.045,.012,.025,material('#202733',{metalness:0,roughness:.55}),g,0,0,.045);
  face(texture,w,h,g,.057);parent.add(g);return g;
 }
 function print(texture,w,parent){
  const h=w*texture.image.height/texture.image.width,g=new T.Group();
  slab(w+.04,h+.04,.035,.025,paper,g);face(texture,w,h,g,.028);parent.add(g);return g;
 }
 function tube(points,mat,parent,r=.025){const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),80,r,10,false),mat);parent.add(m);return m}
 function sphere(r,mat,parent,x,y,z){const m=new T.Mesh(new T.SphereGeometry(r,24,16),mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
 const floor=new T.Mesh(new T.PlaneGeometry(30,24),new T.ShadowMaterial({opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.35;floor.receiveShadow=true;scene.add(floor);
 if(id==='platform'){
  const [ui,marks]=await Promise.all([map('content-ai.png'),map('codle-tools-ui.png')]);
  const screen=display(ui,3.7,root,material('#b8cced',{metalness:.65,roughness:.18}));screen.position.set(.3,.08,-.45);screen.rotation.set(.11,-.23,-.025);
  const specs=[[68,68,'#287de9',-1.65,1.1,.8],[700,68,'#37bfa0',1.45,1.22,.15],[349,352,'#e9b84b',.95,-1.15,1.05]];
  for(let i=0;i<specs.length;i++){
   const [sx,sy,color,x,y,z]=specs[i],block=new T.Group();root.add(block);slab(1.13,1.13,.22,.22,material(color,{roughness:.20,metalness:.05,clearcoat:1}),block);block.position.set(x,y,z);block.rotation.set(.14,-.25,(i-2)*.10);
   const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),ratio=marks.image.width/2048;ctx.drawImage(marks.image,sx*ratio,sy*ratio,166*ratio,166*ratio,0,0,256,256);const pixels=ctx.getImageData(0,0,256,256);
   for(let n=0;n<pixels.data.length;n+=4){const px=(n/4)%256,py=Math.floor(n/1024),edge=Math.min(px,py,255-px,255-py);pixels.data[n+3]*=Math.max(0,Math.min(1,(edge-18)/8))*Math.max(0,Math.min(1,(Math.min(pixels.data[n],pixels.data[n+1],pixels.data[n+2])-220)/35));pixels.data[n]=pixels.data[n+1]=pixels.data[n+2]=255}ctx.putImageData(pixels,0,0);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const icon=face(texture,.91,.91,block,.149);icon.material.transparent=true;icon.material.depthWrite=false;
   moving.push({object:block,index:i,kind:'platform-tool',y});
  }
 }else if(['contents','textbook','aidt','camp'].includes(id)){
  sculpture=addMaterialSculpture(root,id);
 }else if(id==='jitda'){
  const emblem=new T.Group();root.add(emblem);emblem.rotation.set(.08,-.20,-.065);
  const parts=await loadToyParts();
  const helmet=material('#ffffff',{vertexColors:true,metalness:0,roughness:.19,clearcoat:1,clearcoatRoughness:.11});
  const dark=material('#222733',{metalness:.22,roughness:.25,clearcoat:.8});
  for(const part of parts){
   if(part.group!=='jitda'){part.geometry.dispose();continue}
   const mesh=new T.Mesh(part.geometry,part.material==='helmet'?helmet:dark);mesh.position.z=part.z;mesh.castShadow=mesh.receiveShadow=true;emblem.add(mesh);
  }

 }
 let px=0,py=0,tx=0,ty=0;
 const objectBounds=new T.Box3().setFromObject(root),objectSize=objectBounds.getSize(new T.Vector3()),objectCenter=objectBounds.getCenter(new T.Vector3());floor.visible=false;
 // A shared soft contact shadow anchors every object without adding decorative props.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
 const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(64,64,2,64,64,64);
 gradient.addColorStop(0,'rgba(25,28,37,.20)');gradient.addColorStop(.35,'rgba(25,28,37,.10)');gradient.addColorStop(1,'rgba(25,28,37,0)');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
 const shadowMap=new T.CanvasTexture(shadowCanvas),shadow=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false,toneMapped:false}));scene.add(shadow);

 function resize(){const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();const vh=2*Math.tan(35*Math.PI/360)*11;const scale=Math.min(vh/objectSize.y,vh*camera.aspect/objectSize.x)*.98;root.scale.setScalar(scale);root.position.copy(objectCenter).multiplyScalar(-scale);shadow.scale.set(objectSize.x*scale*1.24,objectSize.y*scale*.28,1);shadow.position.set(.1,-objectSize.y*scale*.48,-2)}
 function render(time=0,dt=.033,still=false){const blend=1-Math.exp(-dt*4);px+=(tx-px)*blend;py+=(ty-py)*blend;root.rotation.y=still?0:px*.09;root.rotation.x=still?0:py*.045;
  for(const item of moving){const o=item.object;if(item.kind==='platform-tool'){o.rotation.y=-.25+(still?0:Math.sin(time*.36+item.index)*.22);o.rotation.x=.14+(still?0:Math.cos(time*.29+item.index)*.10);o.position.y=item.y+(still?0:Math.sin(time*.4+item.index)*.055)}else if(item.kind==='print'){o.position.y=item.y+(still?0:Math.sin(time*.42+item.index*.2)*.045)}else if(item.kind==='block'){o.rotation.y=.25+(still?0:Math.sin(time*.4+item.index)*.16)}else if(item.kind==='rail'){o.position.copy(item.curve.getPointAt(still?.45:(time*.07)%1))}else if(item.kind==='pickaxe'){o.rotation.z=still?-.2:-.22+Math.pow((Math.sin(time*1.65)+1)/2,6)*.48}}
  sculpture?.render(time,still);
  renderer.render(scene,camera);
 }
 resize();render(0,.033,true);return {render,resize,setPointer:(x=0,y=0)=>{tx=x;ty=y}};
}
