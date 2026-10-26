import * as T from './vendor/three.module.min.js';

// A resolution-independent product stage. Source UI stays at its original aspect ratio.
export function mountStudio(host, source) {
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio,1.5),2));
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.domElement.className='studio-canvas';host.append(renderer.domElement);
 const scene=new T.Scene(), camera=new T.PerspectiveCamera(35,1,.1,80), rig=new T.Group();
 scene.add(rig);scene.add(new T.HemisphereLight('#e6efff','#728bc0',2.2));
 const key=new T.DirectionalLight('#ffffff',4.2);key.position.set(-4,7,7);key.castShadow=true;
 key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:30});key.shadow.normalBias=.025;key.shadow.bias=-.0002;
 scene.add(key);const fill=new T.DirectionalLight('#8bb8ff',2);fill.position.set(5,1,-3);scene.add(fill);
 const env=new T.Scene();env.background=new T.Color('#a1b0cc');
 for(const [x,y,z,w,h,power] of [[-4,5,3,4,6,4],[4,3,0,2,6,3],[0,6,-3,7,3,2]]){
  const panel=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color('white').multiplyScalar(power),side:T.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);env.add(panel);
 }
 const generator=new T.PMREMGenerator(renderer),environment=generator.fromScene(env);scene.environment=environment.texture;generator.dispose();
 env.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
 const metal=new T.MeshStandardMaterial({color:'#c7d3e5',metalness:.8,roughness:.26});
 const dark=new T.MeshStandardMaterial({color:'#161f31',metalness:.3,roughness:.28});
 const keys=new T.MeshStandardMaterial({color:'#29354a',roughness:.5});
 function rounded(w,h,r,depth,material){
  const s=new T.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  const mesh=new T.Mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,curveSegments:16}),material);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
 }
 const lid=new T.Group();lid.position.set(0,-.9,-.65);lid.rotation.x=-.12;rig.add(lid);
 const shell=rounded(6.25,3.72,.17,.09,metal);shell.position.y=1.86;lid.add(shell);
 const bezel=rounded(6.14,3.61,.14,.025,dark);bezel.position.set(0,1.86,.11);lid.add(bezel);
 const screen=new T.Mesh(new T.PlaneGeometry(5.98,5.98*966/1718),new T.MeshBasicMaterial({color:'#eef3f8',toneMapped:false}));screen.position.set(0,1.86,.19);lid.add(screen);
 const lens=new T.Mesh(new T.SphereGeometry(.022,12,12),dark);lens.position.set(0,3.61,.16);lid.add(lens);
 const deck=rounded(6.27,3.5,.18,.10,metal);deck.rotation.x=-Math.PI/2;deck.position.set(0,-.94,.96);rig.add(deck);
 const keyboard=new T.Group();keyboard.position.set(0,-.79,.6);rig.add(keyboard);
 const keyGeometry=new T.BoxGeometry(.37,.035,.28);
 for(let row=0;row<4;row++)for(let col=0;col<14;col++){
  const k=new T.Mesh(keyGeometry,keys);k.position.set((col-6.5)*.405,0,(row-1.5)*.325);keyboard.add(k);
 }
 const pad=rounded(1.85,.84,.07,.004,new T.MeshStandardMaterial({color:'#aab9cf',metalness:.75,roughness:.38}));pad.rotation.x=-Math.PI/2;pad.position.set(0,-.78,2.02);rig.add(pad);
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=256;
 const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(128,128,15,128,128,128);gradient.addColorStop(0,'rgba(7,27,84,.45)');gradient.addColorStop(.45,'rgba(7,27,84,.2)');gradient.addColorStop(1,'rgba(7,27,84,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);
 const floor=new T.Mesh(new T.PlaneGeometry(10,6),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false,toneMapped:false}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-1.08,.7);scene.add(floor);
 let playing=false,time=0,raf=0,last=0,disposed=false;
 function render(){
  const aspect=host.clientWidth/host.clientHeight,narrow=aspect<1;
  const scale=narrow?Math.min(1,aspect/.76):.82;rig.scale.setScalar(scale);
  const phase=Math.sin(time*.18);
  rig.rotation.y=-.13+phase*.035;rig.rotation.z=-.018;
  camera.position.set(.32+phase*.18,narrow?5:4.4,narrow?16.5:12.4);
  camera.lookAt(0,narrow?3.5*scale:2.2,0);renderer.render(scene,camera);
 }
 function frame(now){if(!playing||disposed){raf=0;return;}time+=Math.min((now-last)/1000,.05);last=now;render();raf=requestAnimationFrame(frame);}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render();}
 const observer=new ResizeObserver(resize);observer.observe(host);
 const loader=new T.TextureLoader();loader.load(source,texture=>{
  if(disposed){texture.dispose();return;}texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();screen.material.map=texture;screen.material.color.set('white');screen.material.needsUpdate=true;host.classList.add('studio-ready');render();
 },undefined,()=>{host.classList.add('studio-failed');});
 resize();
 return {setPlaying(value){playing=value;host.dataset.motion=value?'playing':'paused';if(playing&&!raf){last=performance.now();raf=requestAnimationFrame(frame);}else if(!playing&&raf){cancelAnimationFrame(raf);raf=0;}},dispose(){disposed=true;playing=false;cancelAnimationFrame(raf);observer.disconnect();scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.map?.dispose();o.material.dispose();}});environment.dispose();renderer.dispose();}};
}
