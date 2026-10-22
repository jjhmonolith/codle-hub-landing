import * as THREE from './vendor/three/three.module.min.js';
import {DURATION,sampleJourney} from './hero-desk-motion.mjs';

// Two object-led scenes. Deterministic camera sampler; no remote model dependencies.
const canvas=document.querySelector('#desk-canvas'),viewport=document.querySelector('#desk-visual');
const seek=document.querySelector('#desk-seek'),pauseButton=document.querySelector('#desk-pause'),replay=document.querySelector('#desk-replay');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});}catch{document.querySelector('#desk-fallback').hidden=false;[seek,pauseButton,replay].forEach(e=>e.disabled=true);}
if(renderer)build();
function build(){
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.005,30),model=new THREE.Group();scene.add(model);
  scene.add(new THREE.HemisphereLight('#ffffff','#a4aab3',2.0));
  const sun=new THREE.DirectionalLight('#fff7e8',3.5);sun.position.set(-3,6,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-2,right:2,top:2,bottom:-2,near:.1,far:12});sun.shadow.bias=-.00006;sun.shadow.normalBias=.001;sun.shadow.radius=4;scene.add(sun);
  const fill=new THREE.DirectionalLight('#dce9ff',1.1);fill.position.set(3,2,-3);scene.add(fill);
  // Soft studio environment reflections on the steel and aluminum.
  const env=new THREE.Scene();env.background=new THREE.Color('#c2c8d0');
  for(const [x,y,z,w,h,power] of [[-4,5,3,3,5,4],[4,2,0,2,5,2],[0,6,-3,6,2,3]]){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color('#ffffff').multiplyScalar(power),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,.5,0);env.add(m);
  }
  const pmrem=new THREE.PMREMGenerator(renderer),envMap=pmrem.fromScene(env);scene.environment=envMap.texture;pmrem.dispose();env.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
  const material=(color,roughness=.5,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const metal=material('#a5adb2',.28,.75),trayMat=material('#888f92',.48,.35),rubber=material('#32383e',.85),silver=material('#bfc6cd',.27,.8),black=material('#141b24',.36),keymat=material('#353e49',.52),paper=material('#fffef8',.9),blue=material('#2864b9',.28,.25);
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(50,50),new THREE.ShadowMaterial({opacity:.075}));plane.rotation.x=-Math.PI/2;plane.position.y=-.002;plane.receiveShadow=true;scene.add(plane);
  const unitBox=new THREE.BoxGeometry(1,1,1);
  function box(p,w,h,d,x,y,z,m){const o=new THREE.Mesh(unitBox,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
  function tube(p,a,b,r,m){const v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b),diff=v2.clone().sub(v1);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,diff.length(),20),m);o.position.copy(v1.add(v2).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());o.castShadow=o.receiveShadow=true;p.add(o);return o;}
  function rounded(p,w,d,h,r,m){
    const s=new THREE.Shape(),x=-w/2,z=-d/2;s.moveTo(x+r,z);s.lineTo(x+w-r,z);s.quadraticCurveTo(x+w,z,x+w,z+r);s.lineTo(x+w,z+d-r);s.quadraticCurveTo(x+w,z+d,x+w-r,z+d);s.lineTo(x+r,z+d);s.quadraticCurveTo(x,z+d,x,z+d-r);s.lineTo(x,z+r);s.quadraticCurveTo(x,z,x+r,z);
    const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSize:.002,bevelThickness:.0015,bevelSegments:3,curveSegments:12});g.rotateX(-Math.PI/2);
    const o=new THREE.Mesh(g,m);o.castShadow=o.receiveShadow=true;p.add(o);return o;
  }
  function texture(draw,w=1024,h=1024){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return tex;}
  const woodTex=texture((c,w,h)=>{
    c.fillStyle='#d7b784';c.fillRect(0,0,w,h);
    for(let j=0;j<900;j++){const z=j/900*h;c.strokeStyle=`rgba(${j%3===0?'120,88,49':'245,219,172'},${.025+(j%7)*.006})`;c.lineWidth=.5+(j%3)*.35;c.beginPath();for(let x=0;x<=w;x+=8){const y=z+Math.sin(x*.008+j*.19)*1.9+Math.sin(x*.021+j*.13)*.8;if(x===0)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();}
  });
  const wood=new THREE.MeshPhysicalMaterial({color:'#eed8b2',map:woodTex,roughness:.42,metalness:0,clearcoat:.25,clearcoatRoughness:.35});
  const top=rounded(model,1.12,.68,.035,.035,wood);top.position.y=.775;
  // Extruded slab UVs have world scale; a planar grain cap keeps grain even.
  const cap=new THREE.Mesh(new THREE.PlaneGeometry(1.055,.615),wood);cap.rotation.x=-Math.PI/2;cap.position.y=.811;model.add(cap);
  for(const x of [-.47,.47])for(const z of [-.245,.245]){
    tube(model,[x,.025,z],[x*.97,.775,z*.96],.0175,metal);
    tube(model,[x,.001,z],[x,.041,z],.022,rubber);
    tube(model,[x,.30,z],[x,.34,z],.0184,metal);
  }
  for(const x of [-.465,.465])tube(model,[x,.22,-.24],[x,.22,.24],.012,metal);
  tube(model,[-.46,.23,-.24],[.46,.23,-.24],.013,metal);
  // Open-front pressed-steel book compartment, not a solid box.
  const tray=rounded(model,.94,.48,.007,.055,trayMat);tray.position.set(0,.625,-.035);
  box(model,.94,.14,.008,0,.7,-.275,trayMat);
  for(const x of [-.465,.465])box(model,.008,.14,.48,x,.7,-.035,trayMat);
  tube(model,[-.46,.645,.205],[.46,.645,.205],.009,metal);
  for(const x of [-.48,.48])for(const z of [-.25,.25]){
    const bolt=new THREE.Mesh(new THREE.SphereGeometry(.006,12,8),silver);bolt.scale.z=.4;bolt.position.set(x,.742,z);model.add(bolt);
  }
  // Laptop: aluminum enclosure, hinge, separately modeled keys, trackpad and display.
  const laptop=new THREE.Group();laptop.position.set(.055,.815,-.115);model.add(laptop);
  rounded(laptop,.405,.272,.009,.009,silver);
  const keys=new THREE.Group();keys.position.set(0,.012,-.035);laptop.add(keys);
  box(keys,.363,.001,.125,0,0,0,black);
  const legends=texture((c,w,h)=>{c.fillStyle='#313944';c.fillRect(0,0,w,h);c.fillStyle='#b5bdc7';c.font='14px monospace';const rows=['1234567890-=','QWERTYUIOP[]','ASDFGHJKL;','ZXCVBNM,./'];rows.forEach((row,r)=>[...row].forEach((letter,j)=>c.fillText(letter,15+j*40,20+r*40)));},512,192);
  const legendPlane=new THREE.Mesh(new THREE.PlaneGeometry(.344,.112),new THREE.MeshBasicMaterial({map:legends,toneMapped:false}));legendPlane.rotation.x=-Math.PI/2;legendPlane.position.set(0,.006,0);keys.add(legendPlane);
  for(let r=0;r<5;r++)for(let k=0;k<13;k++){box(keys,.023,.003,.018,-.161+k*.0268,.002,-.052+r*.023,keymat);}
  // Fine strips leave the printed legends visible while giving actual key relief.
  const pad=rounded(laptop,.125,.067,.001,.004,material('#a7b0bb',.4,.6));pad.position.set(0,.012,.082);
  tube(laptop,[-.18,.013,-.132],[.18,.013,-.132],.0065,silver);
  const lid=new THREE.Group();lid.position.set(0,.014,-.132);lid.rotation.x=-.20;laptop.add(lid);
  const lidCase=rounded(lid,.407,.256,.006,.009,silver);lidCase.rotation.x=Math.PI/2;lidCase.position.set(0,.129,-.004);
  box(lid,.395,.246,.003,0,.128,.003,black);
  const ui=texture((c,w,h)=>{
    c.fillStyle='#f7f9fc';c.fillRect(0,0,w,h);c.fillStyle='#4a586c';c.font='500 37px sans-serif';c.fillText('OUR IDEA',85,120);
    c.fillStyle='#347bf3';c.beginPath();c.roundRect(85,214,320,535,24);c.fill();c.fillStyle='#fff';c.font='128px sans-serif';c.fillText('01',130,422);c.font='28px sans-serif';c.fillText('School',132,545);c.fillText('Project',132,585);
    const rows=[['01','Discover'],['02','Prototype'],['03','Share']];rows.forEach((r,i)=>{const y=230+i*177;c.fillStyle='#fff';c.beginPath();c.roundRect(450,y,850,143,18);c.fill();c.fillStyle='#8491a3';c.font='28px sans-serif';c.fillText(r[0],495,y+83);c.fillStyle='#8eb6f5';c.beginPath();c.arc(660,y+72,7,0,7);c.fill();c.fillStyle='#45566c';c.font='34px sans-serif';c.fillText(r[1],710,y+83);c.fillStyle='#a1afc0';c.fillText('›',1230,y+83);});
  },1400,900);
  const display=new THREE.Mesh(new THREE.PlaneGeometry(.38,.236),new THREE.MeshBasicMaterial({map:ui,toneMapped:false}));display.position.set(0,.128,.007);lid.add(display);
  const webcam=new THREE.Mesh(new THREE.CircleGeometry(.0015,12),material('#23354a',.1,.3));webcam.position.set(0,.25,.006);lid.add(webcam);
  // Paper notebook: two slightly arched page surfaces, a cloth spine and wire rings.
  const notebook=new THREE.Group();notebook.position.set(-.13,.816,.202);notebook.rotation.y=-.06;model.add(notebook);
  const cover=rounded(notebook,.40,.207,.003,.004,material('#c6d4e4',.8));
  const paperTex=texture((c,w,h)=>{c.fillStyle='#fffefa';c.fillRect(0,0,w,h);c.strokeStyle='#d5dfeb';c.lineWidth=1.2;for(let y=90;y<h-30;y+=42){c.beginPath();c.moveTo(45,y);c.lineTo(w-30,y);c.stroke();}c.strokeStyle='#e3bfc1';c.beginPath();c.moveTo(60,50);c.lineTo(60,h-25);c.stroke();c.fillStyle='#647a96';c.font='italic 20px sans-serif';c.fillText('My next idea',88,85);},512,640);
  const pageMat=new THREE.MeshStandardMaterial({map:paperTex,roughness:.98,side:THREE.DoubleSide});
  for(const sign of [-1,1]){
    box(notebook,.192,.005,.2,sign*.101,.006,0,paper);
    const geo=new THREE.PlaneGeometry(.19,.198,24,1),pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getY(i);pos.setXYZ(i,x,.009+Math.sin((x/.19+.5)*Math.PI)*.004,-z);}
    geo.computeVertexNormals();const page=new THREE.Mesh(geo,pageMat);page.position.x=sign*.101;page.receiveShadow=true;notebook.add(page);
  }
  for(let i=0;i<13;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.0065,.0011,6,16),silver);ring.rotation.y=Math.PI/2;ring.position.set(0,.012,-.088+i*.0145);ring.castShadow=true;notebook.add(ring);}
  const pen=new THREE.Group();pen.position.set(.055,.84,.235);pen.rotation.y=-.23;model.add(pen);
  tube(pen,[-.065,0,0],[.055,0,0],.0047,blue);tube(pen,[.055,0,0],[.078,0,0],.003,silver);tube(pen,[-.07,0,0],[-.052,0,0],.0053,silver);box(pen,.035,.0018,.002,-.043,.0055,0,silver);
  // Same laptop and blue project tile now belong to a shared hackathon table.
  // All objects stay still; only the camera moves.
  const team=new THREE.Group();scene.add(team);
  const teamTop=rounded(team,1.85,.99,.035,.065,material('#e7e3db',.4));teamTop.position.y=.775;
  const darkSteel=material('#505a68',.32,.65);
  for(const x of [-.76,.76]){
    for(const z of [-.35,.35])tube(team,[x,.025,z],[x*.97,.775,z*.95],.023,darkSteel);
    tube(team,[x,.12,-.35],[x,.12,.35],.017,darkSteel);
  }
  tube(team,[-.76,.68,0],[.76,.68,0],.02,darkSteel);
  const heroLaptop=laptop.clone(true);heroLaptop.position.set(.43,.815,.20);team.add(heroLaptop);
  const leftLaptop=laptop.clone(true);leftLaptop.position.set(-.44,.815,-.08);leftLaptop.rotation.y=.3;team.add(leftLaptop);
  const backLaptop=laptop.clone(true);backLaptop.position.set(.34,.815,-.28);backLaptop.rotation.y=Math.PI-.2;team.add(backLaptop);
  const teamNotebook=notebook.clone(true);teamNotebook.position.set(-.40,.816,.29);teamNotebook.rotation.y=.12;teamNotebook.scale.setScalar(.75);team.add(teamNotebook);
  const teamPen=pen.clone(true);teamPen.position.set(-.3,.837,.3);team.add(teamPen);
  const taskTex=texture((c,w,h)=>{
    c.fillStyle='#fffefa';c.fillRect(0,0,w,h);c.fillStyle='#27374d';c.font='600 34px sans-serif';c.fillText('OUR NEXT IDEA',32,58);
    ['01  Discover','02  Build','03  Share'].forEach((s,i)=>{c.fillStyle=['#e8effb','#e7ecff','#e4f2ee'][i];c.fillRect(30,95+i*130,w-60,105);c.fillStyle='#3b506f';c.font='24px sans-serif';c.fillText(s,50,135+i*130);c.fillStyle='#a2b5ce';c.fillRect(50,155+i*130,w-130,5);});
  },420,540);
  const taskSheet=new THREE.Mesh(new THREE.PlaneGeometry(.22,.29),new THREE.MeshStandardMaterial({map:taskTex,roughness:.9}));taskSheet.rotation.x=-Math.PI/2;taskSheet.rotation.z=-.15;taskSheet.position.set(-.02,.815,-.01);taskSheet.receiveShadow=true;team.add(taskSheet);
  for(const [x,z,color] of [[-.14,.29,'#a9c8f3'],[-.03,.32,'#e9cc81'],[.08,.29,'#b9d9ca']]){const note=box(team,.075,.001,.075,x,.816,z,material(color,.9));note.rotation.y=x;}
  function stool(x,z){
    const group=new THREE.Group();group.position.set(x,0,z);team.add(group);
    const seat=new THREE.Mesh(new THREE.CylinderGeometry(.145,.14,.035,48),blue);seat.position.y=.45;seat.castShadow=seat.receiveShadow=true;group.add(seat);
    for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])tube(group,[Math.cos(a)*.11,.02,Math.sin(a)*.11],[Math.cos(a)*.085,.44,Math.sin(a)*.085],.011,darkSteel);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.105,.007,8,40),darkSteel);ring.rotation.x=Math.PI/2;ring.position.y=.19;group.add(ring);
  }
  stool(-.63,.66);stool(.68,.65);stool(-.58,-.64);
  // A soft localized contact shadow adds weight without a visible floor rectangle.
  const shade=texture((c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,10,w/2,h/2,w/2);g.addColorStop(0,'rgba(45,54,67,.12)');g.addColorStop(.6,'rgba(45,54,67,.04)');g.addColorStop(1,'rgba(45,54,67,0)');c.fillStyle=g;c.fillRect(0,0,w,h);},256,256);
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(1.7,1.35),new THREE.MeshBasicMaterial({map:shade,transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=-.001;scene.add(contact);
  model.updateMatrixWorld(true);team.updateMatrixWorld(true);
  // Focus on a blank part of the same blue date tile, not an arbitrary wall.
  const focus=lid.localToWorld(new THREE.Vector3(-.10,.065,.007));const normal=new THREE.Vector3(0,0,1).transformDirection(lid.matrixWorld);
  const teamFocus=heroLaptop.localToWorld(laptop.worldToLocal(focus.clone()));
  const anchors={classroom:{focus:focus.toArray(),normal:normal.toArray()},team:{focus:teamFocus.toArray(),normal:normal.toArray()}};
  const caption=document.querySelector('.desk-label'),captionTag=caption.querySelector('span'),captionText=caption.querySelector('p');
  seek.max=DURATION;
  const reviewText=new URL(location.href).searchParams.get('t'),review=reviewText===null?NaN:Number(reviewText);
  let elapsed=Number.isFinite(review)?Math.max(0,Math.min(DURATION,review)):0,paused=reduced.matches||Number.isFinite(review),visible=true,lost=false,raf=0,last=0,mouse=0,mouseTarget=0;
  function render(){
    const shot=sampleJourney(elapsed,anchors,reduced.matches),isTeam=shot.world==='team';
    model.visible=!isTeam;team.visible=isTeam;
    camera.position.set(shot.position[0]+mouse*.08*shot.parallax,shot.position[1],shot.position[2]);camera.lookAt(...shot.target);camera.rotateZ(shot.roll);
    renderer.render(scene,camera);seek.value=elapsed;document.querySelector('#shot-name').textContent=shot.phase;
    caption.style.opacity=shot.caption;captionTag.textContent=isTeam?'02 / BUILD TOGETHER':'01 / EVERYDAY LEARNING';captionText.textContent=isTeam?'혼자의 아이디어가, 우리의 결과물로.':'가능성은, 이 작은 책상에서.';
    viewport.dataset.phase=shot.phase;viewport.dataset.scene=shot.world;viewport.dataset.time=elapsed.toFixed(3);
    document.querySelectorAll('[data-scene-time]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.scene===(isTeam?'team':'classroom'))));
  }
  function frame(now){raf=0;if(!visible||document.hidden||lost){last=0;return;}const dt=Math.min((now-(last||now))/1000,.05);last=now;if(!paused)elapsed=(elapsed+dt)%DURATION;mouse+=(mouseTarget-mouse)*(1-Math.exp(-dt*5));render();if(!paused||Math.abs(mouse-mouseTarget)>.0001)raf=requestAnimationFrame(frame);else last=0;}
  function wake(){if(!raf&&visible&&!document.hidden&&!lost)raf=requestAnimationFrame(frame);}
  function update(){pauseButton.textContent=paused?'▷':'Ⅱ';pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.setAttribute('aria-label',paused?'카메라 움직임 재생':'카메라 움직임 일시정지');}
  pauseButton.addEventListener('click',()=>{paused=!paused;update();wake();});
  replay.addEventListener('click',()=>{elapsed=0;paused=reduced.matches;update();render();wake();});
  seek.addEventListener('input',()=>{paused=true;elapsed=Number(seek.value);update();render();});
  document.querySelectorAll('[data-scene-time]').forEach(button=>button.addEventListener('click',()=>{elapsed=Number(button.dataset.sceneTime);paused=true;update();render();}));
  viewport.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const r=viewport.getBoundingClientRect();mouseTarget=(e.clientX-r.left)/r.width*2-1;wake();},{passive:true});viewport.addEventListener('pointerleave',()=>{mouseTarget=0;wake();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;mouse=mouseTarget=0;elapsed=0;update();render();wake();});
  new ResizeObserver(()=>{const w=viewport.clientWidth,h=viewport.clientHeight;camera.aspect=w/h;camera.fov=w/h<1.1?40:34;camera.updateProjectionMatrix();renderer.setSize(w,h,false);render();wake();}).observe(viewport);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;last=0;}}).observe(viewport);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else wake();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;document.querySelector('#desk-fallback').hidden=false;});canvas.addEventListener('webglcontextrestored',()=>{lost=false;document.querySelector('#desk-fallback').hidden=true;wake();});
  update();render();wake();
}
