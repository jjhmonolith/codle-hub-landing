import * as THREE from './vendor/three.module.min.js';

// Local image deformation keeps the painted surface intact around the eyes and hands.
const host = document.querySelector('.brand-hub-card');
const image = host?.querySelector('.mascot-opening-art img');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
if (image) init().catch(error => console.warn('Mascot motion unavailable:', error));
async function init() {
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.className = 'mascot-hover-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setSize(1200,800,false);
  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  const clean = new Image();
  clean.src = new URL('./assets/codle-mascot-clean-plate-v1.png', import.meta.url).href;
  await clean.decode();
  const outlines=[
    'M734 469 Q682 503 648 538 Q611 578 618 616 Q622 642 650 640 Q675 637 699 623 Q729 620 731 588 Z',
    'M713 651 Q709 630 741 601 Q785 570 923 528 Q943 517 947 541 Q955 591 921 626 Q878 665 803 666 L740 668 Q716 670 713 651 Z'
  ];
  function surface(path) {
    const c=document.createElement('canvas');c.width=1536;c.height=1024;
    const ctx=c.getContext('2d');ctx.save();ctx.clip(new Path2D(path));ctx.drawImage(image,0,0);ctx.restore();
    // Remove the light background fringe, without slicing through the flipper.
    const pixels=ctx.getImageData(0,0,1536,1024),d=pixels.data;
    for(let i=0;i<d.length;i+=4){
      if(!d[i+3])continue;
      const dark=Math.min(1,Math.max(0,(132-d[i+1])/20));
      const blue=Math.min(1,Math.max(0,(d[i+2]-d[i]-18)/20));
      d[i+3]*=dark*blue*Math.min(1,Math.max(0,(205-d[i+2])/20));
    }
    ctx.putImageData(pixels,0,0);
    return new THREE.CanvasTexture(c);
  }
  // Only replace the pixels originally hidden by the arms. All visible furniture
  // and the mascot outside these outlines stay pixel-identical to the source.
  const plate=document.createElement('canvas');plate.width=1536;plate.height=1024;
  const ctx=plate.getContext('2d');ctx.drawImage(image,0,0);
  const mask=document.createElement('canvas');mask.width=1536;mask.height=1024;
  const mx=mask.getContext('2d');mx.fillStyle='#fff';mx.strokeStyle='#fff';mx.lineWidth=28;
  outlines.forEach(path=>{mx.fill(new Path2D(path));mx.stroke(new Path2D(path));});
  const patch=document.createElement('canvas');patch.width=1536;patch.height=1024;
  const px=patch.getContext('2d');px.drawImage(clean,0,0,1536,1024);px.globalCompositeOperation='destination-in';px.filter='blur(5px)';px.drawImage(mask,0,0);
  ctx.drawImage(patch,0,0);
  const uniforms = {picture:{value:texture},plate:{value:new THREE.CanvasTexture(plate)},
    rear:{value:surface(outlines[0])},front:{value:surface(outlines[1])},time:{value:0},strength:{value:0}};
  const material = new THREE.ShaderMaterial({uniforms,
    vertexShader:`varying vec2 point; void main(){point=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader:`
      uniform sampler2D picture,plate,rear,front; uniform float time,strength; varying vec2 point;
      vec2 uv(vec2 p){return vec2(p.x/1536.,1.-p.y/1024.);}
      float zone(vec2 p,vec2 c,vec2 r){return 1.-smoothstep(.2,1.,length((p-c)/r));}
      void main(){
        vec2 p=vec2(point.x,1.-point.y)*vec2(1536.,1024.);
        float beat=mod(time,2.8);
        float burst=smoothstep(0.,.35,beat)*(1.-smoothstep(1.8,2.35,beat));
        float l=(.5-.5*cos(time*12.5))*burst*strength;
        float r=(.5-.5*cos(time*12.5+3.14159265))*burst*strength;
        float rearFlex=smoothstep(480.,610.,p.y);
        float frontFlex=1.-smoothstep(730.,935.,p.x);
        vec4 base=texture2D(plate,point);
        vec4 backHand=texture2D(rear,uv(p+vec2(2.,25.)*l*rearFlex));
        vec4 nearHand=texture2D(front,uv(p+vec2(-1.,28.)*r*frontFlex));
        base=mix(base,backHand,backHand.a);
        base=mix(base,nearHand,nearHand.a);
        vec4 original=texture2D(picture,point);
        vec2 glance=vec2(5.*sin(time*1.7),2.5*sin(time*1.2))*strength;
        float eyes=max(zone(p,vec2(803.,330.),vec2(39.,43.)),zone(p,vec2(899.,351.),vec2(42.,44.)));
        base=mix(base,texture2D(picture,uv(p-glance*eyes)),eyes);
        gl_FragColor=mix(original,base,smoothstep(0.,.12,strength));
      }`});
  const scene=new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
  const camera=new THREE.Camera();
  const render=()=>renderer.render(scene,camera);
  render();
  image.parentElement.append(canvas);
  image.style.opacity='0';
  let active=false, frame=0, last=0;
  function tick(now){
    const delta=Math.min((now-last)/1000,.05);last=now;
    uniforms.time.value+=delta;
    const target=active&&!reduced.matches?1:0;
    uniforms.strength.value+=(target-uniforms.strength.value)*(1-Math.exp(-delta*10));
    render();
    if(target || uniforms.strength.value>.002) frame=requestAnimationFrame(tick);
    else {uniforms.strength.value=0;render();frame=0;}
  }
  function setActive(value){active=value;if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}}
  host.addEventListener('pointerenter',()=>setActive(true));
  host.addEventListener('pointerleave',()=>setActive(false));
  host.addEventListener('focusin',()=>setActive(true));
  host.addEventListener('focusout',()=>setActive(false));
  reduced.addEventListener('change',()=>setActive(false));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)setActive(false);});
}
