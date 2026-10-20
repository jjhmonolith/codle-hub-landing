import * as T from 'three';

// Service-sized still lifes. Existing menu and scene transitions own navigation.
export async function createServiceVolume(mount,id){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));renderer.toneMapping=T.NeutralToneMapping;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.setClearColor(0,0);mount.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,60);camera.position.set(0,0,12);
 const room=new T.Scene();room.background=new T.Color('#62718c');
 for(const [w,h,x,y,z,power] of [[6,8,-7,5,4,5],[3,7,6,2,2,4],[7,3,0,8,-2,4]]){
  const light=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color('white').multiplyScalar(power),side:T.DoubleSide}));light.position.set(x,y,z);light.lookAt(0,0,0);room.add(light);
 }
 const generator=new T.PMREMGenerator(renderer),environment=generator.fromScene(room,.025);scene.environment=environment.texture;scene.environmentIntensity=.7;generator.dispose();room.traverse(n=>{n.geometry?.dispose();n.material?.dispose()});
 scene.add(new T.HemisphereLight('#ecf6ff','#293249',2));
 const key=new T.DirectionalLight('#fff9ee',3.5);key.position.set(-3,7,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=7;key.shadow.camera.bottom=-7;key.shadow.normalBias=.03;key.shadow.bias=-.0002;scene.add(key);
 const rim=new T.DirectionalLight('#a7c9ff',3);rim.position.set(6,3,-4);scene.add(rim);
 const root=new T.Group();scene.add(root);const moving=[];
 const material=(color,extra={})=>new T.MeshPhysicalMaterial({color,roughness:.24,metalness:.25,clearcoat:1,clearcoatRoughness:.16,...extra});
 const ink=material('#25364e',{metalness:.65}),paper=material('#fff4df',{metalness:0,roughness:.57}),blue=material('#2465fc'),gold=material('#ffbf31');
 const loader=new T.TextureLoader(),maps=new Map();
 async function map(file){if(maps.has(file))return maps.get(file);const m=await loader.loadAsync('assets/worlds/'+file);m.colorSpace=T.SRGBColorSpace;m.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());maps.set(file,m);return m}
 function slab(w,h,d,r,mat,parent,x=0,y=0,z=0){
  const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const mesh=new T.Mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:.024,bevelSize:.024,bevelSegments:3,curveSegments:8}),mat);mesh.geometry.translate(0,0,-d/2);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function face(texture,w,h,parent,z=.08){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,toneMapped:false}));m.position.z=z;parent.add(m);return m}
 function display(texture,w,parent,body=ink){const h=w*texture.image.height/texture.image.width,g=new T.Group();slab(w+.1,h+.1,.12,.065,body,g);face(texture,w,h,g,.087);parent.add(g);return g}
 function tube(points,mat,parent,r=.025){const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),80,r,10,false),mat);parent.add(m);return m}
 function sphere(r,mat,parent,x,y,z){const m=new T.Mesh(new T.SphereGeometry(r,24,16),mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
 const floor=new T.Mesh(new T.PlaneGeometry(30,24),new T.ShadowMaterial({opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.35;floor.receiveShadow=true;scene.add(floor);
 if(id==='platform'){
  const [ui,marks]=await Promise.all([map('content-ai.png'),map('codle-tools-ui.png')]);
  const screen=display(ui,4.5,root,material('#285798',{metalness:.65,roughness:.18}));screen.position.set(.3,.08,-.45);screen.rotation.set(.04,-.22,.035);
  const specs=[[68,68,'#1686ff',-1.7,1.4,.8],[700,68,'#00ce82',1.35,1.65,.15],[980,352,'#ff414a',-2,-.42,1.25],[349,352,'#ffb300',1.6,-1.25,1.05],[700,635,'#ff7caf',-.05,-1.65,1.35]];
  for(let i=0;i<specs.length;i++){
   const [sx,sy,color,x,y,z]=specs[i],block=new T.Group();root.add(block);slab(.82,.82,.20,.16,material(color,{roughness:.18,metalness:.16}),block);block.position.set(x,y,z);block.rotation.set(.14,-.25,(i-2)*.10);
   const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),ratio=marks.image.width/2048;ctx.drawImage(marks.image,sx*ratio,sy*ratio,166*ratio,166*ratio,0,0,256,256);const pixels=ctx.getImageData(0,0,256,256);
   for(let n=0;n<pixels.data.length;n+=4){const px=(n/4)%256,py=Math.floor(n/1024),edge=Math.min(px,py,255-px,255-py);pixels.data[n+3]*=Math.max(0,Math.min(1,(edge-18)/8))*Math.max(0,Math.min(1,(Math.min(pixels.data[n],pixels.data[n+1],pixels.data[n+2])-220)/35));pixels.data[n]=pixels.data[n+1]=pixels.data[n+2]=255}ctx.putImageData(pixels,0,0);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const icon=face(texture,.74,.74,block,.133);icon.material.transparent=true;icon.material.depthWrite=false;
   moving.push({object:block,index:i,kind:'platform-tool',y});
  }
 }else if(id==='contents'){
  const files=['everyday-ai','python-data','climate-data','microbit','esg','ocean-data','p8-im1'];
  const textures=await Promise.all(files.map(f=>map('thumbnail-'+f+'.webp')));
  const fan=new T.Group();root.add(fan);fan.rotation.set(-.07,-.3,-.14);
  // A continuous ribbon of thick prints, with one legible foreground face.
  for(let i=6;i>=0;i--){const tile=display(textures[i],3.55,fan,i%2?blue:ink);tile.position.set((i-2.5)*.48,(i-2.5)*.48,-i*.31);tile.rotation.set(.04*i,-.07*i,.015*i);moving.push({object:tile,index:i,kind:'print',y:tile.position.y})}
  fan.position.set(.35,-.3,.55);
 }else if(id==='textbook'){
  const [page,board]=await Promise.all([map('cmass-page33.png'),map('textbook-river-board.png')]);
  const book=new T.Group();root.add(book);book.position.set(-.55,-.14,0);book.rotation.set(-.12,-.25,-.13);
  for(const side of [-1,1]){const leaf=new T.Group();book.add(leaf);leaf.position.x=side*1.02;leaf.rotation.y=-side*.17;slab(2.05,2.88,.2,.04,blue,leaf,0,0,-.08);slab(1.97,2.78,.16,.02,paper,leaf);if(side===-1)face(page,1.91,2.70,leaf,.11);
   for(let n=0;n<6;n++)slab(1.96,.008,.012,.002,material('#b9b8af',{roughness:.8,metalness:0}),leaf,0,-1.37,-.06+n*.027);
  }
  const activity=display(board,2.8,root,material('#93bcb0'));activity.position.set(1.18,.68,1.05);activity.rotation.set(.02,-.32,.10);
  for(const [name,x,y] of [['farmer',-.7,.1],['sheep',.22,-.25],['cabbage',.85,.2]]){const tex=await map('textbook-'+name+'.png'),token=new T.Group();activity.add(token);slab(.53,.53,.14,.18,paper,token,x,y,.18);const m=face(tex,.48,.48,token,.31);m.position.set(x,y,.31);m.material.transparent=true;m.material.depthWrite=false;moving.push({object:token,index:x,kind:'token',y:0})}
 }else if(id==='camp'){
  const texture=await map('camp-block.png');
  const bench=slab(5.5,.24,2.9,.18,material('#e6b880'),root,0,-1.65,0);bench.rotation.y=-.12;
  const laptop=new T.Group();root.add(laptop);laptop.rotation.y=-.28;laptop.position.set(.2,-.18,.1);
  const screen=display(texture,3.15,laptop,material('#b8c6dc',{metalness:.85,roughness:.2}));screen.position.y=-1.13+(3.15*texture.image.height/texture.image.width)/2;screen.rotation.x=-.06;
  slab(3.4,.13,1.65,.08,material('#a6b8d0',{metalness:.8}),laptop,0,-1.26,.6);
  for(let row=0;row<3;row++)for(let col=0;col<8;col++){const keycap=slab(.28,.22,.035,.035,ink,laptop,(col-3.5)*.35,-1.18,.3+row*.26);keycap.rotation.x=-Math.PI/2}
  const rail=tube([[-2.3,-.9,.6],[-2.3,.8,-.3],[-.5,2,-.7],[1.9,1.5,-.2],[2.4,-.8,.8]],gold,root,.035);
  const marks=await map('codle-tools-ui.png');
  for(let i=0;i<3;i++){const block=new T.Group();root.add(block);slab(.69,.69,.69,.14,[material('#1686ff'),material('#00ce82'),material('#ff414a')][i],block);
   const [sx,sy]=[[68,68],[700,68],[980,352]][i],c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),ratio=marks.image.width/2048;ctx.drawImage(marks.image,sx*ratio,sy*ratio,166*ratio,166*ratio,0,0,256,256);const pixels=ctx.getImageData(0,0,256,256);for(let n=0;n<pixels.data.length;n+=4){const x=(n/4)%256,y=Math.floor(n/1024),edge=Math.min(x,y,255-x,255-y);pixels.data[n+3]*=Math.max(0,Math.min(1,(edge-18)/8))*Math.max(0,Math.min(1,(Math.min(pixels.data[n],pixels.data[n+1],pixels.data[n+2])-220)/35));pixels.data[n]=pixels.data[n+1]=pixels.data[n+2]=255}ctx.putImageData(pixels,0,0);const iconMap=new T.CanvasTexture(c);iconMap.colorSpace=T.SRGBColorSpace;const icon=face(iconMap,.62,.62,block,.38);icon.material.transparent=true;icon.material.depthWrite=false;
   block.position.set(-1.95+i*.4,-.8+i*.74,1);block.rotation.set(.12,.25,-.12+i*.12);moving.push({object:block,index:i,kind:'block',y:block.position.y})}
  const traveler=sphere(.10,paper,root,0,0,0);moving.push({object:traveler,kind:'rail',curve:rail.geometry.parameters.path});
 }else if(id==='jitda'){
  const texture=await map('jitda-official-demo.png');
  const desk=new T.Group();root.add(desk);desk.rotation.y=-.20;
  slab(5.7,.23,1.8,.12,material('#373b73'),desk,0,-1.55,.1);
  const displayGroup=display(texture,3.8,desk);displayGroup.position.set(.63,.12,-.12);
  slab(.19,.6,.24,.04,ink,desk,.63,-1.17,-.13);slab(1.2,.10,.65,.08,ink,desk,.63,-1.39,.05);
  const data=await fetch('assets/worlds/jitda-worker-v1.json.gz').then(async r=>{if(!r.ok)throw Error('Worker model unavailable');return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json()});
  const binary=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer,worker=new T.Group();desk.add(worker);
  for(const part of data.parts){const geometry=new T.BufferGeometry();for(const [name,spec] of Object.entries(part.attributes)){const packed=new Uint16Array(binary(spec.data)),values=new Float32Array(spec.length),previous=new Uint16Array(spec.itemSize);for(let i=0;i<values.length;i++){const c=i%spec.itemSize,q=(previous[c]+packed[i])&65535;previous[c]=q;values[i]=spec.min[c]+q/65535*(spec.max[c]-spec.min[c])}geometry.setAttribute(name,new T.BufferAttribute(values,spec.itemSize))}if(part.index){const delta=new Uint32Array(binary(part.index)),values=new Uint32Array(delta.length);let prev=0;for(let i=0;i<values.length;i++){prev=(prev+delta[i])>>>0;values[i]=prev}geometry.setIndex(new T.BufferAttribute(values,1))}
   const mesh=new T.Mesh(geometry,part.material==='helmet'?material('#ffffff',{vertexColors:true,metalness:.08}):material('#373741',{metalness:.45}));mesh.position.z=part.z+(part.material==='helmet'?0:.08);mesh.position.y=part.material==='helmet'?0:-.035;mesh.castShadow=mesh.receiveShadow=true;worker.add(mesh);
  }
  worker.scale.set(-1.12,1.12,1.12);worker.position.set(-1.75,-.8,.48);
  const tool=new T.Group();worker.add(tool);tool.position.set(-.68,-.38,.32);
  const handle=new T.Mesh(new T.CapsuleGeometry(.035,.75,5,12),material('#936333'));handle.position.y=.28;tool.add(handle);tube([[-.25,.68,0],[0,.82,0],[.3,.68,0]],material('#afbed2',{metalness:.9}),tool,.055);moving.push({object:tool,kind:'pickaxe'});
 }
 let px=0,py=0,tx=0,ty=0;
 function resize(){const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();root.position.x=Math.tan(35*Math.PI/360)*12*camera.aspect*(id==='platform'?.37:.46);root.scale.setScalar(camera.aspect<1.15?.90:1.14)}
 function render(time=0,dt=.033,still=false){const blend=1-Math.exp(-dt*4);px+=(tx-px)*blend;py+=(ty-py)*blend;root.rotation.y=still?0:px*.09;root.rotation.x=still?0:py*.045;
  for(const item of moving){const o=item.object;if(item.kind==='platform-tool'){o.rotation.y=-.25+(still?0:Math.sin(time*.36+item.index)*.22);o.rotation.x=.14+(still?0:Math.cos(time*.29+item.index)*.10);o.position.y=item.y+(still?0:Math.sin(time*.4+item.index)*.055)}else if(item.kind==='print'){o.position.y=item.y+(still?0:Math.sin(time*.42+item.index*.2)*.045)}else if(item.kind==='block'){o.rotation.y=.25+(still?0:Math.sin(time*.4+item.index)*.16)}else if(item.kind==='rail'){o.position.copy(item.curve.getPointAt(still?.45:(time*.07)%1))}else if(item.kind==='pickaxe'){o.rotation.z=still?-.2:-.22+Math.pow((Math.sin(time*1.65)+1)/2,6)*.48}}
  renderer.render(scene,camera);
 }
 resize();render(0,.033,true);return {render,resize,setPointer:(x=0,y=0)=>{tx=x;ty=y}};
}
