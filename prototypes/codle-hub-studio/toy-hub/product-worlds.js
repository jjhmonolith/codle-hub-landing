import * as T from './vendor/three.module.min.js';

// Full-bleed environments, not product mockups. Every movement belongs to the landscape.
export function mountWorld(host,index){
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio||1,1.5),1.75));
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.domElement.className='world-canvas';host.append(renderer.domElement);
 const palette=[['#4479c5','#739ada'],['#8c79b4','#b9a5d2'],['#77b5a2','#abd8bf'],['#c48058','#e5ad72']][index];
 const scene=new T.Scene();scene.background=new T.Color(palette[0]);scene.fog=new T.Fog(palette[0],42,80);
 const camera=new T.PerspectiveCamera(38,1,.1,120),root=new T.Group();scene.add(root);
 scene.add(new T.HemisphereLight('#eef5ff',palette[0],1.45));
 const sun=new T.DirectionalLight('#fff3db',3.2);sun.position.set(-12,24,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
 Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:1,far:75});sun.shadow.normalBias=.04;sun.shadow.bias=-.0002;scene.add(sun);
 const fill=new T.DirectionalLight('#c5dfff',1.2);fill.position.set(15,10,-12);scene.add(fill);
 const environment=new T.Scene();environment.background=new T.Color('#b0bac9');
 for(const [x,y,z,w,h,p] of [[-10,16,12,9,18,3],[14,10,-4,12,15,2],[0,20,-10,20,10,2]]){
  const light=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color('white').multiplyScalar(p),side:T.DoubleSide}));light.position.set(x,y,z);light.lookAt(0,0,0);environment.add(light);
 }
 const generator=new T.PMREMGenerator(renderer),env=generator.fromScene(environment);scene.environment=env.texture;scene.environmentIntensity=.38;generator.dispose();environment.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
 const mats=new Map(),animations=[],owned=new Set();
 const material=(color,roughness=.58)=>{const k=color+roughness;if(!mats.has(k))mats.set(k,new T.MeshStandardMaterial({color,roughness,metalness:.04}));return mats.get(k);};
 const white=material('#f8f1df'),blue=material('#2875e1',.34),gold=material('#f2c756',.4),mint=material('#8ccaae'),coral=material('#eb9277'),ink=material('#2a4463');
 function add(geometry,mat,x=0,y=0,z=0,parent=root){owned.add(geometry);const mesh=new T.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function shape(w,d,r){const s=new T.Shape(),x=-w/2,y=-d/2;r=Math.min(r,w/2,d/2);s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
 function extrude(s,h,mat,x=0,y=0,z=0,parent=root,bevel=.06){const g=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:16});g.rotateX(-Math.PI/2);return add(g,mat,x,y,z,parent);}
 function block(w,d,h,mat,x=0,y=0,z=0,parent=root,r=.16){return extrude(shape(w,d,r),h,mat,x,y,z,parent,Math.min(.055,h*.2));}
 const sphereGeometry=new T.SphereGeometry(1,24,16);
 function ball(r,mat,x,y,z,parent=root){const m=add(sphereGeometry,mat,x,y,z,parent);m.scale.setScalar(r);return m;}
 function cylinder(r,h,mat,x,y,z,parent=root){return add(new T.CylinderGeometry(r,r,h,40),mat,x,y+h/2,z,parent);}
 function curve(points,closed=false){return new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),closed,'catmullrom',.4);}
 function tube(path,r,mat,parent=root){return add(new T.TubeGeometry(path,160,r,8,false),mat,0,0,0,parent);}
 function ribbon(path,width,height,mat){const points=path.getPoints(160),a=[],b=[];for(let i=0;i<points.length;i++){const t=path.getTangent(i/(points.length-1)),n=new T.Vector3(-t.z,0,t.x).normalize().multiplyScalar(width/2);a.push(points[i].clone().add(n));b.push(points[i].clone().sub(n));}const s=new T.Shape();a.concat(b.reverse()).forEach((p,i)=>i?s.lineTo(p.x,-p.z):s.moveTo(p.x,-p.z));s.closePath();return extrude(s,height,mat,0,points[0].y,0,root,.035);}
 function arch(x,z,w,h,mat,angle=0){const group=new T.Group();group.position.set(x,0,z);group.rotation.y=angle;root.add(group);const r=w/2,t=.18;
  const arc=add(new T.TorusGeometry(r,t,12,64,Math.PI),mat,0,h-r,0,group);
  for(const side of [-1,1]){const post=add(new T.CylinderGeometry(t,t,h-r,16),mat,side*r,(h-r)/2,0,group);post.receiveShadow=true;}
  return group;
 }
 function tree(x,z,size=1,color='#438d79',base=.6){const g=new T.Group();g.position.set(x,base,z);g.scale.setScalar(size);root.add(g);cylinder(.1,1.45,material('#a88562'),0,0,0,g);const crown=ball(.8,material(color),0,1.7,0,g);crown.scale.set(.72,1.12,.72);ball(.5,material(color),.38,1.46,.05,g);return g;}
 function pebbles(x,z,mat,base=0){for(let i=0;i<3;i++){const b=ball(.22+i*.09,mat,x+Math.cos(i*2.5)*.4,base+.1,z+Math.sin(i*2.5)*.4);b.scale.y*=.55;}}
 const floor=add(new T.PlaneGeometry(160,160),material(palette[1]),0,-.16,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
 const H={T,root,scene,renderer,animations,material,white,blue,gold,mint,coral,ink,add,shape,extrude,block,ball,cylinder,curve,tube,ribbon,arch,tree,pebbles,invalidate:()=>render()};
 [learningPaths,paperLandscape,riverLandscape,codeLandscape][index](H);
 let time=0,playing=false,raf=0,last=0,disposed=false;
 function render(){
  const aspect=host.clientWidth/host.clientHeight,mobile=aspect<.85;
  const fov=mobile?52:38;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
  camera.position.set(12+Math.sin(time*.045)*.8,mobile?23:22,mobile?28:26);
  camera.lookAt(0,.8,0);renderer.render(scene,camera);
  host.dataset.frame=String(Math.round(time*30));
 }
 function tick(now){raf=0;if(!playing||disposed)return;const delta=Math.max(0,Math.min((now-last)/1000,.05));last=now;time+=delta;animations.forEach(a=>a(time));render();raf=requestAnimationFrame(tick);}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();animations.forEach(a=>a(time));render();}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();host.classList.add('world-ready');
 return {setPlaying(value){playing=value;host.dataset.motion=value?'playing':'paused';if(value&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}else if(!value&&raf){cancelAnimationFrame(raf);raf=0;}},dispose(){disposed=true;playing=false;cancelAnimationFrame(raf);observer.disconnect();const materials=new Set(mats.values()),textures=new Set();root.traverse(o=>{if(o.material){materials.add(o.material);if(o.material.map)textures.add(o.material.map);}});owned.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();sun.shadow.map?.dispose();renderer.dispose();}};
}

function learningPaths(H){
 const {T,root,animations,material,white,blue,gold,mint,coral,block,ball,cylinder,curve,tube,ribbon,arch,tree,pebbles}=H;
 const pale=material('#aec9e7'),rail=material('#356bc3'),track=curve([[-18,.12,3],[-13,.12,-8],[-3,.12,-12],[9,.12,-9],[17,.12,-1],[12,.12,9],[1,.12,12],[-12,.12,10]],true);
 ribbon(track,2.3,.14,white);tube(track,.07,rail);
 const branch=curve([[-19,.15,-9],[-9,.15,-4],[0,.15,1],[10,.15,4],[20,.15,6]]);ribbon(branch,1.5,.08,pale);tube(branch,.035,white);
 // Gates make a continuous course; the small carriers follow the same route.
 const stations=[[-12,-8,-.7], [10,-8,.6], [11,9,-.8],[-12,9,.65]],gates=[];
 stations.forEach(([x,z,a],i)=>{
  block(5,4,.28,pale,x,-.05,z);const gate=arch(x,z,2.9,3.25,[blue,coral,gold,mint][i],a);gates.push(gate);
  for(let side of [-1,1])cylinder(.3,.14,white,x+Math.cos(a)*side*1.45,.1,z-Math.sin(a)*side*1.45);
  block(1.7,1.6,.45,white,x+2.8,0,z+1.7);cylinder(.4,.65,[coral,gold,mint,blue][i],x+2.8,.45,z+1.7);
 });
 const artwork=new Image();artwork.onload=()=>{
  [[68,68],[980,352],[349,352],[700,68]].forEach(([x,y],i)=>{
   const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),ratio=artwork.width/2048;ctx.beginPath();ctx.roundRect(0,0,256,256,46);ctx.clip();ctx.drawImage(artwork,x*ratio,y*ratio,166*ratio,166*ratio,0,0,256,256);
   const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const mat=new T.MeshStandardMaterial({map,transparent:true,roughness:.5,side:T.DoubleSide});const sign=H.add(new T.PlaneGeometry(1.15,1.15),mat,0,3.25,.22,gates[i]);sign.castShadow=false;
  });H.invalidate();
 };artwork.src='assets/worlds/codle-tools-ui.png';
 for(const [x,z,s] of [[-20,-2,1.9],[-5,-17,2.3],[18,-8,1.8],[21,7,2.2],[-18,14,1.8],[5,19,2.4]]){
  block(6*s,4*s,.5,pale,x,-.2,z,root,1.2);tree(x,z,s*.95,'#679dc4',.3);tree(x+2,z-1,s*.6,'#4379aa',.3);
 }
 const travelers=[];
 for(let i=0;i<8;i++){const g=new T.Group();root.add(g);block(.58,.98,.25,[blue,gold,coral,white][i%4],0,.06,0,g,.22);ball(.18,white,0,.46,-.14,g);travelers.push(g);}
 const signals=stations.map(([x,z])=>ball(.12,gold,x,3.65,z));
 animations.push(t=>{travelers.forEach((g,i)=>{const u=(t*.024+i/8)%1,p=track.getPointAt(u),v=track.getTangentAt(u);g.position.copy(p);g.rotation.y=Math.atan2(v.x,v.z);});signals.forEach((g,i)=>g.scale.setScalar(.12*(1+.12*Math.sin(t*1.6-i))));});
 for(let i=0;i<20;i++){const x=-24+i*2.5,z=i%2?19:-18;pebbles(x,z,white,.05);}
}

function paperLandscape(H){
 const {T,root,animations,material,white,blue,gold,coral,mint,add,block,curve,ribbon,tree,pebbles}=H;
 const lavender=material('#c9bcdf'),pink=material('#e8adac'),paper=material('#fff6de');
 const flow=curve([[-28,.05,9],[-14,.05,4],[-3,.05,6],[7,.05,-1],[15,.05,-7],[28,.05,-9]]);ribbon(flow,5,.12,lavender);
 const pageRigs=[],covers=['thumbnail-everyday-ai.webp','thumbnail-esg.webp','thumbnail-python-data.webp','thumbnail-microbit.webp','thumbnail-ocean-data.webp','thumbnail-climate-data.webp','thumbnail-p8-im1.webp'];
 let bookIndex=0;
 for(const [x,z,a,color] of [[-13,-8,-.4,blue],[-4,-13,.2,coral],[9,-11,-.5,gold],[16,0,.6,mint],[11,11,.3,blue],[-8,13,-.4,pink],[-20,5,.3,gold]]){
  const book=new T.Group();book.position.set(x,0,z);book.rotation.y=a;root.add(book);
  const left=new T.Group(),right=new T.Group();book.add(left,right);left.rotation.z=.22;right.rotation.z=-.22;
  block(3.2,4.6,.19,color,-1.6,.05,0,left,.08);block(3.2,4.6,.19,color,1.6,.05,0,right,.08);
  for(let j=0;j<5;j++){block(3.04,4.36,.055,paper,-1.53,.27+j*.07,0,left,.035);block(3.04,4.36,.055,paper,1.53,.27+j*.07,0,right,.035);}
  const map=new T.TextureLoader().load('assets/worlds/'+covers[bookIndex++],()=>H.invalidate());map.colorSpace=T.SRGBColorSpace;map.anisotropy=H.renderer.capabilities.getMaxAnisotropy();
  const print=add(new T.PlaneGeometry(2.72,1.53),new T.MeshStandardMaterial({map,roughness:.8}),-1.53,.64,-.55,left);print.rotation.x=-Math.PI/2;print.castShadow=false;
  for(let line=0;line<5;line++)block(line===4?1.4:2.55,.028,.006,lavender,-1.53,.635,.6+line*.2,left,.005);
  const diagram=new T.Group();diagram.position.set(1.5,.65,0);right.add(diagram);
  for(let k=0;k<3;k++){H.cylinder(.26,.025,[color,gold,blue][k],(k-1)*.66,0,k%2?.6:-.3,diagram);}
  const link=curve([[-.66,.03,-.3],[0,.03,.6],[.66,.03,-.3]]);H.tube(link,.025,lavender,diagram);
  pageRigs.push({left,right});
 }
 // Broad paper ribbons bend as a single landscape, with slow waves passing along them.
 const sheets=[];
 for(const [x,z,color,width] of [[-18,-4,paper,4.6],[14,7,lavender,5.5],[-5,-20,pink,6]]){
  const geometry=new T.PlaneGeometry(width,32,12,64);geometry.rotateX(-Math.PI/2);
  const mesh=add(geometry,color,x,.6,z);mesh.material.side=T.DoubleSide;mesh.rotation.y=-.33;sheets.push({mesh,base:new Float32Array(geometry.attributes.position.array)});
 }
 const plane=new T.Group();root.add(plane);const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([0,.12,-.85,-.85,0,.65,0,.02,.25,0,.12,-.85,0,.02,.25,.85,0,.65],3));geometry.computeVertexNormals();const m=add(geometry,white,0,0,0,plane);m.material.side=T.DoubleSide;
 const flight=curve([[-24,3,10],[-10,2.8,7],[1,3,5],[10,3.8,-2],[25,3,-10]]);
 animations.push(t=>{
  sheets.forEach(({mesh,base},i)=>{const p=mesh.geometry.attributes.position;for(let j=0;j<p.count;j++){const z=base[j*3+2];p.setY(j,.8+Math.sin(z*.24+t*.22+i)*.65+Math.cos(base[j*3]*.45)*.25);}p.needsUpdate=true;mesh.geometry.computeVertexNormals();});
  pageRigs.forEach(({left,right},i)=>{left.rotation.z=.22+Math.sin(t*.28+i)*.045;right.rotation.z=-.22-Math.sin(t*.28+i)*.045;});
  const u=(t*.024)%1,p=flight.getPointAt(u),v=flight.getTangentAt(u);plane.position.copy(p);plane.rotation.set(0,Math.atan2(-v.x,-v.z),Math.sin(t*.35)*.07);
 });
 for(const [x,z,s] of [[-20,-14,1.3],[20,13,1.5],[4,19,1.8],[-15,19,1.4],[20,-17,1.2]]){tree(x,z,s,'#d7bad8',0);pebbles(x+1,z+2,white);}
}

function riverLandscape(H){
 const {T,root,animations,material,white,blue,gold,ink,add,extrude,block,ball,cylinder,curve,tube,arch,tree,pebbles}=H;
 const grass=material('#90b992'),edge=material('#d5d3ae'),water=material('#328caa',.23),leaf=material('#528e64');
 const center=z=>Math.sin(z*.12)*3;
 const left=new T.Shape(),right=new T.Shape();left.moveTo(-60,50);right.moveTo(60,50);
 for(let z=-50;z<=50;z+=1){left.lineTo(center(z)-4.5,-z);right.lineTo(center(z)+4.5,-z);}left.lineTo(-60,-50);left.closePath();right.lineTo(60,-50);right.closePath();
 extrude(left,.8,edge,0,-.1,0,root,.08);extrude(right,.8,edge,0,-.1,0,root,.08);extrude(left,.15,grass,0,.72,0,root,.06);extrude(right,.15,grass,0,.72,0,root,.06);
 const waterGeometry=new T.PlaneGeometry(115,115,70,70);waterGeometry.rotateX(-Math.PI/2);const surface=add(waterGeometry,water,0,.05,0);surface.castShadow=false;
 const positions=waterGeometry.attributes.position,base=new Float32Array(positions.array);
 const streaks=[];
 for(let i=0;i<30;i++){const path=curve([[-.6,0,0],[-.2,0,.07],[.3,0,.03],[.65,0,0]]);const line=tube(path,.014,material('#9bd5d8'));streaks.push(line);}
 for(let i=0;i<22;i++){
  const z=-25+(i%11)*5,x=center(z)+(i<11?-1:1)*(7+(i%3)*2.6);tree(x,z,.8+(i%4)*.25,i%3?'#558f70':'#8fba79',.9);if(i%2===0)pebbles(x+1.8,z+1,edge,.88);
 }
 // A low bridge belongs to the far bank; the foreground stays open for the river activity.
 const bridgeZ=-15,bridgeX=center(bridgeZ),bridge=new T.Group();bridge.position.set(bridgeX,1.0,bridgeZ);root.add(bridge);
 block(12,2.1,.28,white,0,.65,0,bridge,.15);
 for(let x=-5;x<=5;x+=2){cylinder(.12,1.1,white,x,.85,-.88,bridge);cylinder(.12,1.1,white,x,.85,.88,bridge);}
 for(let z of [-.88,.88])tube(curve([[-5.5,1.95,z],[0,1.95,z],[5.5,1.95,z]]),.075,white,bridge);
 for(let x of [-4,4])block(.6,1.9,2.0,edge,x,-1.1,0,bridge);
 const boat=new T.Group();root.add(boat);const hull=ball(1,material('#cd965b'),0,.16,0,boat);hull.scale.set(.72,.25,1.42);
 block(.95,2.1,.08,white,0,.25,0,boat,.4);block(.9,.16,.15,gold,0,.33,.45,boat,.03);
 cylinder(.15,.55,blue,0,.34,-.35,boat);ball(.18,white,0,1.02,-.35,boat);
 const paddle=new T.Group();boat.add(paddle);paddle.position.set(.65,.5,-.1);const shaft=add(new T.CylinderGeometry(.035,.035,1.8,10),material('#a46b45'),0,0,0,paddle);const blade=block(.2,.06,.55,material('#a46b45'),0,-1.0,0,paddle,.07);paddle.rotation.z=-.5;
 function sheep(x,z,parent=root){const g=new T.Group();g.position.set(x,.94,z);parent.add(g);for(let j=0;j<5;j++)ball(.25,white,Math.cos(j*1.25)*.2,.42,Math.sin(j*1.25)*.25,g);const head=ball(.19,ink,0,.5,-.43,g);head.scale.z=1.25;for(let dx of [-.19,.19])for(let dz of [-.22,.22])cylinder(.045,.3,ink,dx,0,dz,g);return g;}
 sheep(-7,5);sheep(-8.1,5.7);
 const wolf=new T.Group();wolf.position.set(-8.1,.94,2.8);root.add(wolf);const body=ball(.4,material('#597182'),0,.5,0,wolf);body.scale.set(.65,1,1.3);ball(.25,ink,0,.74,-.46,wolf);for(let x of [-.16,.16]){const ear=add(new T.ConeGeometry(.1,.3,5),ink,x,1,-.48,wolf);}for(let dx of [-.2,.2])for(let dz of [-.28,.28])cylinder(.055,.4,ink,dx,0,dz,wolf);
 for(let j=0;j<3;j++){const cabbage=ball(.35,leaf,-6.4+j*.5,1.05,7.5+(j%2)*.4);cabbage.scale.y=.8;}
 animations.push(t=>{
  for(let j=0;j<positions.count;j++){const x=base[j*3],z=base[j*3+2];positions.setY(j,Math.sin(z*.65+t*.9)*.035+Math.cos(x*.85+z*.3+t*.7)*.028);}positions.needsUpdate=true;waterGeometry.computeVertexNormals();
  streaks.forEach((s,i)=>{const z=((i*3.3+t*.65+50)%95)-45;s.position.set(center(z)+Math.sin(i*2.4)*3.7,.16,z);s.rotation.y=Math.cos(z*.12)*.3;s.scale.x=.7+(i%3)*.4;});
  const phase=t*.24,z=4+Math.cos(phase)*1.25;boat.position.set(center(z)+Math.sin(phase)*3.0,.12+Math.sin(t*1.5)*.035,z);boat.rotation.set(Math.sin(t*.9)*.018,Math.atan2(3*Math.cos(phase),-1.25*Math.sin(phase)),Math.sin(t*1.1)*.025);paddle.rotation.x=Math.sin(t*1.6)*.4;
 });
}

function codeLandscape(H){
 const {T,root,animations,material,white,blue,gold,coral,mint,ink,add,block,ball,cylinder,curve,tube,ribbon,arch,tree}=H;
 const earth=material('#dba577'),road=material('#f7d8a7'),aqua=material('#75bcbd');
 // The floor and network extend beyond the frame, so this reads as a place, not a display stand.
 for(let x=-30;x<=30;x+=5)for(let z=-30;z<=30;z+=5){block(4.88,4.88,.08,earth,x,-.08,z,root,.12);}
 const routes=[curve([[-30,.12,-7],[-15,.12,-7],[-5,.12,-7],[4,.12,0],[8,.12,8],[25,.12,8]]),curve([[-28,.12,10],[-12,.12,10],[0,.12,4],[6,.12,-5],[9,.12,-20]]),curve([[-16,.12,-24],[-16,.12,-5],[-8,.12,0],[7,.12,0],[28,.12,-3]])];
 routes.forEach(p=>{ribbon(p,1.1,.05,road);tube(p,.035,white);});
 const assemblies=[];
 const places=[[-16,-12,blue,4],[-5,-15,white,5],[10,-11,aqua,3],[17,-1,gold,4],[12,13,blue,3],[-5,16,coral,4],[-17,7,white,3],[-25,-1,aqua,4],[23,-15,coral,3]];
 places.forEach(([x,z,mat,count],i)=>{
  block(4.4,4.4,.3,road,x,0,z,root,.3);const tower=new T.Group();tower.position.set(x,.3,z);root.add(tower);
  for(let j=0;j<count;j++){const layer=block(2.8,2.8,.72,j===count-1?mat:j%2?white:mat,0,j*.79,0,tower,.2);if(j===count-1)assemblies.push({layer,height:j*.79,phase:i*.7});
   for(let side of [-1,1])block(.12,.7,.22,ink,side*1.43,j*.79+.28,0,tower,.04);
  }
  cylinder(.25,.18,white,x+.65,.3+count*.79,z);cylinder(.25,.18,white,x-.65,.3+count*.79,z);
 });
 const gliders=[];routes.forEach((path,j)=>{for(let i=0;i<5;i++){const g=new T.Group();root.add(g);block(.45,.75,.18,[blue,mint,white][j],0,.1,0,g,.2);gliders.push({g,path,start:i/5+j*.08});}});
 for(const [x,z] of [[-20,17],[19,18],[22,-23],[-25,-21]]){arch(x,z,3,3.4,blue,.5);tree(x+3,z,1.2,'#b18c65',0);}
 const ease=x=>x*x*(3-2*x);
 animations.push(t=>{
  assemblies.forEach(({layer,height,phase})=>{const p=(t*.075+phase)%1;const lift=p<.16?1-ease(p/.16):p>.84?ease((p-.84)/.16):0;layer.position.y=height+lift*1.05;layer.rotation.y=lift*.12;});
  gliders.forEach(({g,path,start})=>{const u=(t*.035+start)%1,v=path.getTangentAt(u);g.position.copy(path.getPointAt(u));g.rotation.y=Math.atan2(v.x,v.z);});
 });
}
