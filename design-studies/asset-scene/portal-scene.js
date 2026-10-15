import * as THREE from './vendor/three.module.js';
import { SVGLoader } from './vendor/SVGLoader.js';
import { createPortalRoom } from './portal-room.js';

// The SVG remains the fallback and the single source of brand geometry.
const section = document.querySelector('.portal-intro');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = n => Math.max(0, Math.min(1, n));
const smooth = n => { const t = clamp(n); return t*t*(3-2*t); };
let disposeScene;

function mount() {
  if (!section || reduced.matches || disposeScene) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true, powerPreference:'low-power' }); }
  catch { return; }
  const pin = section.querySelector('.portal-pin');
  const canvas = renderer.domElement;
  canvas.className = 'portal-webgl';
  canvas.setAttribute('aria-hidden','true');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .5, 6000);
  scene.add(new THREE.HemisphereLight(0xf5f9ff, 0x7187a4, 2.5));
  const key = new THREE.DirectionalLight(0xffffff, 3);
  key.position.set(-250,500,650); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbad8ff, 2);
  rim.position.set(500,100,-100); scene.add(rim);
  const group = new THREE.Group(); scene.add(group);
  const source = [...section.querySelectorAll('.logo-line')];
  const loader = new SVGLoader();
  const parse = d => loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000" fill-rule="evenodd" d="${d}"/></svg>`).paths[0];
  const lines = [], materials = [], geometries = [];
  const room = createPortalRoom(renderer);
  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  const groups = [[0],[1],[2],[3,4],[5],[6,7]];
  for (const indices of groups) {
    const drop = indices[0] === 0;
    const path = parse(indices.map(i => source[i].getAttribute('d')).join(' '));
    const face = new THREE.MeshStandardMaterial({color:drop?0x3e88ff:0x192332,roughness:drop?.62:.82,metalness:0,transparent:true,opacity:0});
    const side = new THREE.MeshStandardMaterial({color:drop?0x3077ef:0x354252,roughness:.8,metalness:0,transparent:true,opacity:0});
    materials.push(face,side);
    const geometry = new THREE.ExtrudeGeometry(SVGLoader.createShapes(path), {depth:drop?23:15,bevelEnabled:true,bevelThickness:drop?3:1.5,bevelSize:drop?3:1.2,bevelSegments:3,steps:1,curveSegments:32});
    geometry.scale(1,-1,1); geometry.translate(-387.305,152.145,-10);
    geometries.push(geometry);
    group.add(new THREE.Mesh(geometry,[face,side]));
    if(drop) {
      const windowGeometry=new THREE.ShapeGeometry(SVGLoader.createShapes(path),48);
      windowGeometry.scale(1,-1,1);windowGeometry.translate(-387.305,152.145,16.3);
      geometries.push(windowGeometry);
      group.add(new THREE.Mesh(windowGeometry,room.material));
    }
  }
  source.forEach((node,i) => {
    const path = parse(node.getAttribute('d'));
    path.subPaths.forEach(contour => {
      const points = contour.getSpacedPoints(240).map(p => new THREE.Vector3(p.x-387.305,152.145-p.y,i===0?16.2:6.6));
      const geometry = new THREE.BufferGeometry().setFromPoints(points); geometry.setDrawRange(0,0);
      const material = new THREE.LineBasicMaterial({color:i===0?0x3e88ff:0x26354a,transparent:true});
      const line = new THREE.Line(geometry,material);
      lines.push({line,delay:parseFloat(node.style.getPropertyValue('--draw-delay')),duration:parseFloat(node.style.getPropertyValue('--draw-duration')),count:points.length});
      geometries.push(geometry); group.add(line);
    });
  });
  pin.append(canvas);
  const started = performance.now();
  let frame=0, progress=0, width=0, height=0, alive=true;
  const target = new THREE.Vector3();
  function render() {
    frame=0;
    if(!alive) return;
    if(width!==pin.clientWidth || height!==pin.clientHeight) {
      width=pin.clientWidth; height=pin.clientHeight;
      renderer.setSize(width,height,false); camera.aspect=width/height; camera.updateProjectionMatrix();
    }
    const age=(performance.now()-started)/1000;
    const fill=smooth((age-1.55)/.5);
    materials.forEach(m=>{m.opacity=fill;m.depthWrite=fill>.98;});
    lines.forEach(({line,delay,duration,count})=>{
      line.geometry.setDrawRange(0,Math.floor(count*clamp((age-delay)/duration)));
      line.material.opacity=1-fill;
    });
    const distance=Math.max(960, 774/(2*Math.tan(THREE.MathUtils.degToRad(17))*camera.aspect*.78));
    const opening=smooth(age/2.05);
    const turn=smooth(progress/.34);
    const push=smooth((progress-.3)/.48);
    const mobile=width<700;
    const yaw=THREE.MathUtils.degToRad((mobile?-25:-42)+(mobile?5:12)*opening)*(1-turn);
    const tx=THREE.MathUtils.lerp(-70+70*opening,-134.885,turn);
    const ty=THREE.MathUtils.lerp(12,-67.855,turn);
    const radius=distance*Math.pow(20/distance,push);
    target.set(tx,ty,0);
    camera.position.set(tx+Math.sin(yaw)*radius,ty-(mobile?.08:.18)*radius*(1-turn),Math.cos(yaw)*radius);
    camera.lookAt(target);
    canvas.style.opacity=String(1-smooth((progress-.73)/.09));
    pointer.lerp(pointerTarget,.09);
    room.render(age,progress,pointer);
    renderer.render(scene,camera);
    if(!document.hidden && (age<2.8 || (progress<.83 && section.getBoundingClientRect().bottom>0))) request();
  }
  const request=()=>{if(!frame && alive)frame=requestAnimationFrame(render);};
  const onProgress=event=>{progress=event.detail.progress;request();};
  const onVisible=()=>{if(!document.hidden)request();};
  const onPointer=event=>{const r=pin.getBoundingClientRect();pointerTarget.set((event.clientX-r.left)/r.width*2-1,1-(event.clientY-r.top)/r.height*2);request();};
  const onLeave=()=>{pointerTarget.set(0,0);request();};
  const dispose=()=>{
    alive=false;cancelAnimationFrame(frame);
    section.removeEventListener('portal:frame',onProgress);
    removeEventListener('resize',request);document.removeEventListener('visibilitychange',onVisible);
    pin.removeEventListener('pointermove',onPointer);pin.removeEventListener('pointerleave',onLeave);room.dispose();
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());lines.forEach(({line})=>line.material.dispose());
    renderer.dispose();canvas.remove();section.classList.remove('has-spatial-scene');disposeScene=undefined;
    dispatchEvent(new Event('scroll'));
  };
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();dispose();},{once:true});
  section.addEventListener('portal:frame',onProgress);
  addEventListener('resize',request);document.addEventListener('visibilitychange',onVisible);
  pin.addEventListener('pointermove',onPointer,{passive:true});pin.addEventListener('pointerleave',onLeave);
  disposeScene=dispose;
  section.classList.add('has-spatial-scene');
  dispatchEvent(new Event('scroll'));
  request();
}
try { mount(); } catch(error) { section?.classList.remove('has-spatial-scene'); console.warn('3D intro unavailable; retaining SVG intro.',error); }
reduced.addEventListener('change',()=>{if(reduced.matches)disposeScene?.();else mount();});
addEventListener('pagehide',()=>disposeScene?.(),{once:true});
