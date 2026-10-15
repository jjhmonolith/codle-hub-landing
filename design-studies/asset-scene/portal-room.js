import * as THREE from './vendor/three.module.js';

// A separate room is rendered through the droplet, not pasted over the logo.
export function createPortalRoom(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b9d7ff');
  scene.fog = new THREE.Fog('#b9d7ff', 18, 45);
  const camera = new THREE.PerspectiveCamera(44, .9, .1, 80);
  const target = new THREE.WebGLRenderTarget(768, 864);
  const resources = [];
  const mat = color => { const m = new THREE.MeshStandardMaterial({color,roughness:.65}); resources.push(m); return m; };
  const blue = mat('#3979e8'), white = mat('#f1f6ff'), pale = mat('#94bdf5'), dark = mat('#203b70');
  scene.add(new THREE.HemisphereLight(0xffffff, 0x5375b1, 3));
  const light = new THREE.DirectionalLight(0xffffff, 4); light.position.set(-5,10,8); scene.add(light);
  function mesh(geometry,material,x,y,z,parent=scene) {
    resources.push(geometry); const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;
  }
  const box=(w,h,d,m,x,y,z,parent)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);
  box(40,.3,50,pale,0,-3,-8);
  // Repeated architectural ribs give the camera a readable depth cue.
  for(let i=0;i<5;i++) {
    const z=2-i*4;
    box(.3,12,.4,white,-5,3,z);box(.3,12,.4,white,5,3,z);
    box(10,.3,.4,white,0,8.8,z);
  }
  for(let i=0;i<3;i++) mesh(new THREE.CylinderGeometry(3.6-i*.35,3.6-i*.35,.3,80),white,0,-2.65+i*.3,-3);
  const screen = document.createElement('canvas');screen.width=1024;screen.height=640;
  const ctx=screen.getContext('2d');
  ctx.fillStyle='#f6f9ff';ctx.fillRect(0,0,1024,640);
  ctx.fillStyle='#3e88ff';ctx.font='bold 118px sans-serif';ctx.fillText('codle',70,150);
  ctx.fillStyle='#22334c';ctx.font='bold 40px sans-serif';ctx.fillText('A little idea. A bigger world.',70,220);
  ['CREATE','LEARN','CONNECT'].forEach((label,i)=>{
    ctx.fillStyle=['#e3edff','#dfecf2','#ece8ff'][i];ctx.beginPath();ctx.roundRect(70+i*300,300,270,250,24);ctx.fill();
    ctx.fillStyle='#3e88ff';ctx.font='bold 70px monospace';ctx.fillText(['</>','Aa','✳'][i],100+i*300,410);
    ctx.fillStyle='#263650';ctx.font='24px sans-serif';ctx.fillText(label,100+i*300,505);
  });
  const texture=new THREE.CanvasTexture(screen);texture.colorSpace=THREE.SRGBColorSpace;resources.push(texture);
  const display=new THREE.MeshBasicMaterial({map:texture});resources.push(display);
  box(6.6,4.3,.25,dark,0,1,-4);
  mesh(new THREE.PlaneGeometry(6.3,3.94),display,0,1,-3.86);
  box(.18,1.5,.18,blue,0,-1.7,-4);
  // An open book and a coding cube sit at different depths in the room.
  const book=new THREE.Group();book.position.set(-2.7,-.6,0);book.rotation.set(.2,.4,-.16);scene.add(book);
  const left=box(1.25,.12,1.7,white,-.61,0,0,book);left.rotation.z=.18;
  const right=box(1.25,.12,1.7,white,.61,0,0,book);right.rotation.z=-.18;
  const cube=box(1.2,1.2,1.2,blue,2.7,-.1,-.5);cube.rotation.set(.3,.4,.2);
  const orbit=mesh(new THREE.TorusGeometry(.8,.045,12,64),blue,2.8,2.9,-3);orbit.rotation.y=.6;
  const uniforms={uMap:{value:target.texture},uOpen:{value:0},uPointer:{value:new THREE.Vector2()}};
  const material=new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,uniforms,
    vertexShader:`varying vec2 vPortal; void main(){vPortal=vec2((position.x+208.65)/147.54,(position.y+152.145)/166.58);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform sampler2D uMap;uniform float uOpen;uniform vec2 uPointer;varying vec2 vPortal;
      void main(){vec2 uv=vPortal;vec2 q=uv-.5;float edge=smoothstep(.27,.55,length(q));
      uv+=q*edge*.045+uPointer*edge*.009;vec3 room=texture2D(uMap,clamp(uv,0.001,.999)).rgb;
      room=mix(room,vec3(.24,.53,1.),edge*.17);room+=pow(max(0.,dot(normalize(q+vec2(.0001)),normalize(vec2(-.7,.9)))),14.)*edge*.12;
      gl_FragColor=vec4(room,uOpen);
      #include <colorspace_fragment>
      }`});
  return {material,
    render(age,progress,pointer){
      uniforms.uOpen.value=THREE.MathUtils.smoothstep(age,1.8,2.65);uniforms.uPointer.value.copy(pointer);
      const enter=THREE.MathUtils.smoothstep(progress,.3,.78);
      camera.position.set(pointer.x*.65*(1-enter),.8+pointer.y*.4,13-enter*5);
      camera.lookAt(pointer.x*.15,.6,-4);
      book.position.y=-.6+Math.sin(age*.65)*.09;cube.rotation.y=.4+Math.sin(age*.4)*.12;
      renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);
    },dispose(){resources.forEach(r=>r.dispose());material.dispose();target.dispose();}
  };
}
