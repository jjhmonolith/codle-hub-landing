import * as T from './vendor/three.module.min.js';

// One continuous graphic, with one quieter fold at the edge. No scene props or product mockups.
export function mountGraphic(host){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio,1.5),2));
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.domElement.className='world-canvas';host.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,100);camera.position.set(0,0,32);
 scene.add(new T.HemisphereLight('#d1e4ff','#102c80',2.2));
 const key=new T.DirectionalLight('#d9edff',4);key.position.set(-6,10,9);scene.add(key);
 const rim=new T.DirectionalLight('#4c8cff',3);rim.position.set(9,-3,5);scene.add(rim);
 const studio=new T.Scene();studio.background=new T.Color('#263b69');
 for(const [x,y,z,w,h,strength] of [[-9,9,8,9,20,4],[8,3,7,5,18,2],[0,-8,3,20,5,1]]){
  const panel=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color('#e6f1ff').multiplyScalar(strength),side:T.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel);
 }
 const generator=new T.PMREMGenerator(renderer),environment=generator.fromScene(studio);scene.environment=environment.texture;scene.environmentIntensity=.65;generator.dispose();studio.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
 const material=new T.MeshPhysicalMaterial({color:'#337cff',roughness:.32,metalness:.24,clearcoat:.35,clearcoatRoughness:.3,side:T.DoubleSide});
 const secondMaterial=new T.MeshPhysicalMaterial({color:'#193d84',roughness:.65,metalness:.05,clearcoat:.08,side:T.DoubleSide});
 const segments=140,across=22;
 function sheet(mat){const geometry=new T.PlaneGeometry(1,1,segments,across);const mesh=new T.Mesh(geometry,mat);scene.add(mesh);return mesh;}
 const main=sheet(material),edge=sheet(secondMaterial);edge.position.set(-3,11,-7);edge.rotation.z=Math.PI+.12;edge.scale.setScalar(.86);
 let time=0,playing=false,last=0,raf=0,disposed=false;
 function shape(mesh,phase){
  const p=mesh.geometry.attributes.position;
  for(let row=0;row<=across;row++)for(let col=0;col<=segments;col++){
   const u=col/segments*2-1,v=row/across*2-1;
   const x=u*21,y=-5.7+4.9*Math.sin(u*2.1),z=1.4*Math.cos(u*1.9);
   const dy=4.9*2.1*Math.cos(u*2.1),length=Math.hypot(21,dy),nx=-dy/length,ny=21/length;
   const twist=.78*Math.sin(u*2.4+phase)+.3,width=3.6+.35*Math.cos(u*2);
   const bend=Math.cos(v*Math.PI/2)*.48;
   p.setXYZ(row*(segments+1)+col,x+nx*v*width*Math.cos(twist),y+ny*v*width*Math.cos(twist),z+v*width*Math.sin(twist)+bend);
  }
  p.needsUpdate=true;mesh.geometry.computeVertexNormals();
 }
 function render(){
  const narrow=camera.aspect<.8;
  main.scale.setScalar(narrow?.83:1);main.position.set(narrow?-2:0,narrow?-1:0,0);
  shape(main,Math.sin(time*.18)*.22);shape(edge,.9+Math.sin(time*.14)*.12);
  renderer.render(scene,camera);host.dataset.frame=String(Math.round(time*30));
 }
 function tick(now){raf=0;if(!playing||disposed)return;time+=Math.max(0,Math.min((now-last)/1000,.05));last=now;render();raf=requestAnimationFrame(tick);}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render();}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();host.classList.add('world-ready','graphic-ready');
 return {setPlaying(value){playing=value;host.dataset.motion=value?'playing':'paused';if(value&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}else if(!value&&raf){cancelAnimationFrame(raf);raf=0;}},dispose(){disposed=true;playing=false;cancelAnimationFrame(raf);observer.disconnect();main.geometry.dispose();edge.geometry.dispose();material.dispose();secondMaterial.dispose();environment.dispose();renderer.dispose();}};
}
