import * as THREE from 'three';
import { SVGLoader } from './vendor/three/SVGLoader.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';

// Model the original vector outlines, including their counters.
try {
  const stage=document.querySelector('.stage');
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.setClearColor(0x000000,0);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  renderer.domElement.className='logo-canvas';
  renderer.domElement.setAttribute('aria-hidden','true');
  stage.prepend(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,4000);
  camera.position.z=1800;
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.04);
  scene.environment=environment.texture;
  room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff,0x536586,2));
  const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(-400,600,800);scene.add(key);
  const rim=new THREE.DirectionalLight(0xb5cbff,1.8);rim.position.set(500,-80,500);scene.add(rim);
  const loader=new SVGLoader();
  const groups=['codle','jitda'].map((name,index)=>{
    const symbol=document.getElementById(name+'-mark');
    const box=symbol.getAttribute('viewBox').split(' ').map(Number);
    const parsed=loader.parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(' ')}">${symbol.innerHTML}</svg>`);
    const group=new THREE.Group();
    parsed.paths.forEach((path,pathIndex)=>{
      const shapes=SVGLoader.createShapes(path);
      if(!shapes.length)return;
      const fill=path.userData.style.fill;
      const helmet=index===1&&fill&&fill!=='#000'&&fill!=='#000000'&&fill!=='black';
      const material=new THREE.MeshPhysicalMaterial({
        color:helmet?fill:index===0?'#4052bd':'#34404e',
        metalness:helmet?.12:.32,roughness:.27,clearcoat:.85,clearcoatRoughness:.18,envMapIntensity:1.25,
      });
      const depth=index===0?32:25;
      const geometry=new THREE.ExtrudeGeometry(shapes,{depth,steps:1,curveSegments:20,bevelEnabled:true,bevelThickness:index===0?4:2.5,bevelSize:index===0?2.8:1.3,bevelSegments:5});
      geometry.translate(-box[0]-box[2]/2,-box[1]-box[3]/2,-depth/2+pathIndex*.035);
      const mesh=new THREE.Mesh(geometry,material);
      mesh.scale.y=-1;
      group.add(mesh);
    });
    group.userData.sourceWidth=box[2];
    scene.add(group);return group;
  });
  let state=null,raf=0,lastWidth=0,lastHeight=0;
  const started=performance.now();
  function render(now){
    raf=0;if(!state||document.hidden||document.body.classList.contains('has-landing'))return;
    const {w,h,positions,travel,reduced}=state;
    if(w!==lastWidth||h!==lastHeight){
      renderer.setSize(w,h);camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();lastWidth=w;lastHeight=h;
    }
    const entry=reduced?1:Math.min(1,(now-started)/3000);
    const ease=1-Math.pow(1-entry,3);
    groups.forEach((group,i)=>{
      const p=positions[i];
      group.position.set(p.cx-w/2,h/2-p.cy,0);
      group.scale.setScalar(p.width/group.userData.sourceWidth);
      group.rotation.set((i===0?.1:-.08)*(1-travel),(i===0?1:-1)*(.65-.48*ease)*(1-travel),(i===0?-.025:.025)*(1-travel));
    });
    renderer.render(scene,camera);
    stage.classList.add('webgl-ready');
    if(entry<1&&travel<1)schedule();
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(render)}
  addEventListener('hub:frame',event=>{state=event.detail;schedule()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
  renderer.domElement.addEventListener('webglcontextlost',()=>stage.classList.remove('webgl-ready'));
  renderer.domElement.addEventListener('webglcontextrestored',schedule);
  dispatchEvent(new Event('hub:ready'));
} catch(error) {
  // Original SVGs remain visible if WebGL is unavailable.
  console.warn('3D logo unavailable; displaying original vector logos.',error);
}
