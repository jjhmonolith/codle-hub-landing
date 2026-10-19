import * as THREE from 'three';
import { loadToyParts } from './mesh-pack.js?v=1';
import { storyAt } from './story-timeline.js?v=2';

const clamp=(x)=>Math.max(0,Math.min(1,x));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const smoother=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*t*(t*(t*6-15)+10)};
const bezier=(a,b,c,d,t)=>{const q=1-t;return q*q*q*a+3*q*q*t*b+3*q*t*t*c+t*t*t*d};

function studioEnvironment(renderer,glass=false){
  const room=new THREE.Scene();room.background=new THREE.Color('#20232d');
  const shell=new THREE.Mesh(new THREE.BoxGeometry(30,30,30),new THREE.MeshBasicMaterial({color:glass?'#6e7795':'#535762',side:THREE.BackSide}));room.add(shell);
  const lightCanvas=document.createElement('canvas');lightCanvas.width=128;lightCanvas.height=128;
  const ctx=lightCanvas.getContext('2d');ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(5,5,118,118,8);ctx.fill();
  const lightMap=new THREE.CanvasTexture(lightCanvas);
  const addSoftbox=(w,h,x,y,z,power,tint='#ffffff')=>{
    const material=new THREE.MeshBasicMaterial({color:new THREE.Color(tint).multiplyScalar(power*(glass&&tint==='#ffffff'?1.5:1)),map:lightMap,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    const box=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);box.position.set(x,y,z);box.lookAt(0,0,0);room.add(box);
  };
  addSoftbox(5.2,8,-8,3,2.5,4.5);
  addSoftbox(1.4,7,8,2,1.5,3.5);
  addSoftbox(6,3,1,8,2,3.8);
  addSoftbox(5,.8,0,-1,8,2.0,'#d9e4ff');
  addSoftbox(3,4,-6,0,-4,1.5);
  if(glass){addSoftbox(2,6,6,-3,0,3.2,'#52e7ff');addSoftbox(4,2,-4,-5,2,2.7,'#22c9ff')}
  const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromScene(room,.025);
  room.traverse(object=>{if(object.isMesh){object.geometry.dispose();object.material.dispose()}});lightMap.dispose();pmrem.dispose();return target;
}

function studioBackdrop(){
  const material=new THREE.ShaderMaterial({depthWrite:false,uniforms:{
    baseColor:{value:new THREE.Color('#08090d')},time:{value:0},focus:{value:0},gold:{value:0},
    bluePool:{value:new THREE.Vector2(.3,.3)},goldPool:{value:new THREE.Vector2(.7,.3)},poolSize:{value:new THREE.Vector2(.25,.18)},poolStrength:{value:0},
    blueTint:{value:new THREE.Color('#4387ff')},goldTint:{value:new THREE.Color('#b89b55')}
  },vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`varying vec2 vUv; uniform vec3 baseColor,blueTint,goldTint; uniform float time,focus,poolStrength,gold; uniform vec2 bluePool,goldPool,poolSize;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){
      vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
      return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
    }
    void main(){
      // Broad, continuously changing light folds; no discrete floating shapes.
      float t=time*.026;
      vec2 uv=vUv;
      float warp=noise(uv*2.2+vec2(t*.27,-t*.18))-.5;
      float fold=uv.y-.33*uv.x-.23+.10*sin(uv.x*3.2+t)+warp*.12;
      float second=uv.y+.40*uv.x-1.12+.12*sin(uv.x*2.5-t*.72+1.3);
      float ribbon=exp(-pow(fold/.065,2.0));
      float wash=exp(-pow(second/.18,2.0));
      vec2 center=(uv-vec2(.5,.5))*vec2(1.6,2.1);
      float quiet=1.0-focus*.72*exp(-dot(center,center)*2.5);
      float edge=smoothstep(.0,.28,uv.x)*(1.0-smoothstep(.8,1.15,uv.x));
      vec3 color=baseColor;
      color+=(mix(vec3(.004,.008,.023),vec3(.021,.012,.005),gold)*ribbon*edge+vec3(.007,.008,.013)*wash)*quiet;
      vec2 blueOffset=(vUv-bluePool)/poolSize;
      vec2 goldOffset=(vUv-goldPool)/poolSize;
      color+=blueTint*exp(-dot(blueOffset,blueOffset)*1.8)*poolStrength*.052;
      color+=vec3(.35,.39,.48)*exp(-dot(goldOffset,goldOffset)*1.8)*poolStrength*.040;
      gl_FragColor=vec4(color,1.0);
      #include <colorspace_fragment>
      // Static sub-pixel dither avoids banding in the very dark gradients.
      gl_FragColor.rgb+=(hash(gl_FragCoord.xy)-.5)/255.0;
    }`});
  const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);backdrop.position.z=-4;backdrop.renderOrder=-10;return backdrop;
}

function shadowTexture(tint='77,73,61',strength=.30){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
  const context=canvas.getContext('2d');const g=context.createRadialGradient(128,64,0,128,64,64);
  g.addColorStop(0,`rgba(${tint},${strength})`);g.addColorStop(.30,`rgba(${tint},${strength*.47})`);g.addColorStop(1,`rgba(${tint},0)`);
  context.save();context.translate(128,64);context.scale(2,1);context.translate(-128,-64);context.fillStyle=g;context.fillRect(0,0,256,128);context.restore();
  return new THREE.CanvasTexture(canvas);
}

export async function createToyStage(mount){
  const parts=await loadToyParts();
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;
  renderer.setClearColor('#08090d');mount.append(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#08090d');
  const backdrop=studioBackdrop();scene.add(backdrop);
  const camera=new THREE.OrthographicCamera(-5,5,4,-4,.1,100);camera.position.set(0,0,20);
  const environment=studioEnvironment(renderer),glassEnvironment=studioEnvironment(renderer,true);scene.environment=environment.texture;scene.environmentIntensity=.85;
  const ambient=new THREE.HemisphereLight('#ffffff','#c1bba9',.7);scene.add(ambient);
  const key=new THREE.DirectionalLight('#fffaf3',1.5);key.position.set(-4,7,8);scene.add(key);
  const fill=new THREE.DirectionalLight('#f9fcff',.65);fill.position.set(6,1,5);scene.add(fill);
  const rim=new THREE.DirectionalLight('#ffffff',1.4);rim.position.set(3,6,-4);scene.add(rim);
  const blue=new THREE.MeshPhysicalMaterial({color:'#3285ff',emissive:'#0538ff',emissiveIntensity:.14,metalness:0,roughness:.025,transmission:.96,thickness:.56,ior:1.46,attenuationColor:'#247aff',attenuationDistance:4.2,clearcoat:1,clearcoatRoughness:.04,specularIntensity:1,envMap:glassEnvironment.texture,envMapIntensity:1.45});
  blue.onBeforeCompile=shader=>{
    shader.vertexShader='attribute float edgeDistance; varying float vGlassEdge; varying vec3 vGlassPosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGlassPosition=position;vGlassEdge=edgeDistance;');
    shader.fragmentShader='varying float vGlassEdge; varying vec3 vGlassPosition;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <transmission_fragment>',THREE.ShaderChunk.transmission_fragment.replace('material.attenuationDistance = attenuationDistance;','material.attenuationDistance = attenuationDistance * length(modelMatrix[0].xyz) / 3.7;').replace('material.thickness = thickness;',`float glassEdge=pow(1.0-abs(dot(normal,geometryViewDir)),1.5);
      float glassBorder=1.0-smoothstep(.008,.080,vGlassEdge);
      float glassBody=sqrt(max(0.0,1.0-pow(clamp(length(vGlassPosition.xy*vec2(1.8,1.65)),0.0,1.0),2.0)));
      material.thickness = thickness * mix(.45,1.2,glassBody) * mix(1.0,2.1,glassEdge);
      material.diffuseColor *= mix(vec3(1.0),vec3(.38,.70,1.0),glassBorder*.75);
      material.diffuseColor *= mix(vec3(.62,.84,1.0),vec3(1.0),smoothstep(-.45,.50,vGlassPosition.y));`));
    shader.fragmentShader=shader.fragmentShader.replace('vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',`vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
      float edgeLight=max(pow(1.0-abs(dot(normal,geometryViewDir)),1.1),glassBorder*.65);
      vec2 poolA=(vGlassPosition.xy-vec2(-.29,-.35))/vec2(.22,.30);
      vec2 poolB=(vGlassPosition.xy-vec2(.43,.10))/vec2(.13,.21);
      float pool=exp(-dot(poolA,poolA))+.65*exp(-dot(poolB,poolB));
      outgoingLight += vec3(.0,.65,1.0)*edgeLight*pool;`);
  };
  blue.customProgramCacheKey=()=> 'codle-water-volume-v3';
  const yellow=new THREE.MeshPhysicalMaterial({color:'#ffd000',metalness:0,roughness:.095,clearcoat:1,clearcoatRoughness:.045,specularIntensity:.85,ior:1.49,envMapIntensity:1});
  const dark=new THREE.MeshPhysicalMaterial({color:'#171d27',metalness:.30,roughness:.16,clearcoat:1,clearcoatRoughness:.065,specularIntensity:1,envMapIntensity:1.65});
  // A soft grazing reflection keeps the black face legible on the dark stage.
  // It follows the surface normals as the logo turns, without changing its shape.
  dark.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',`vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
      float faceRim=pow(1.0-abs(dot(normal,geometryViewDir)),1.8);
      float faceSoftbox=mix(.35,1.0,smoothstep(-.4,.7,normal.y+normal.x*.4));
      outgoingLight+=vec3(.075,.085,.105)*faceRim*faceSoftbox;
      outgoingLight+=vec3(.012,.015,.021)*(1.0-faceRim);`);
  };
  dark.customProgramCacheKey=()=> 'jitda-dark-stage-face-v3';
  const codle=new THREE.Group(),jitda=new THREE.Group();scene.add(codle,jitda);
  const helmetMaterial=yellow.clone();helmetMaterial.color.set('#ffffff');helmetMaterial.vertexColors=true;
  helmetMaterial.onBeforeCompile=shader=>{
    shader.vertexShader='attribute float groove; varying float vGroove;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGroove = groove;');
    shader.fragmentShader='varying float vGroove;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_physical_fragment>',`#include <lights_physical_fragment>
      material.diffuseColor *= mix(1.0, 0.88, vGroove);
      material.roughness = max(material.roughness, vGroove * 0.22);
      material.specularColor *= mix(1.0, 0.60, vGroove);
      material.clearcoat *= mix(1.0, 0.45, vGroove);`);
  };
  helmetMaterial.customProgramCacheKey=()=> 'jitda-solid-grooves-v1';
  const materials={blue,helmet:helmetMaterial,dark},groups={codle,jitda};
  for(const {group,material,z,geometry} of parts){
    const mesh=new THREE.Mesh(geometry,materials[material]);mesh.position.z=z;
    groups[group].add(mesh);
  }
  const texture=shadowTexture();
  const shadows=[0,1].map(()=>{const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,.25),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));mesh.position.z=-1;scene.add(mesh);return mesh});
  const contacts=[0,1].map(()=>{const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,.25),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));mesh.position.z=-.99;scene.add(mesh);return mesh});
  const spills=['33,139,255','235,180,35'].map(tint=>{const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,.25),new THREE.MeshBasicMaterial({map:shadowTexture(tint,.36),transparent:true,depthWrite:false,toneMapped:false}));mesh.position.z=-.98;scene.add(mesh);return mesh});
  let w=0,h=0;
  function resize(){w=mount.clientWidth;h=mount.clientHeight;renderer.setSize(w,h);backdrop.scale.set(w/100,h/100,1);camera.left=-w/200;camera.right=w/200;camera.top=h/200;camera.bottom=-h/200;camera.updateProjectionMatrix()}
  resize();
  let lost=false;
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;document.body.classList.remove('webgl-ready')});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;document.body.classList.add('webgl-ready');render(lastP,lastEntry,lastSeconds,1/60,lastAmbient)});
  let lastP=0,lastEntry=0,lastSeconds=0,lastAmbient=0;
  const pointer={x:0,y:0,easedX:0,easedY:0};
  function setPointer(x=0,y=0){pointer.x=Math.max(-1,Math.min(1,x));pointer.y=Math.max(-1,Math.min(1,y))}
  const turnAxes=[new THREE.Vector3(.24,1,.08).normalize(),new THREE.Vector3(-.20,1,.06).normalize()];
  const rotation=new THREE.Quaternion();
  function render(p,entry,seconds=0,dt=1/60,ambientSeconds=seconds){
    lastP=p;lastEntry=entry;lastSeconds=seconds;lastAmbient=ambientSeconds;if(lost)return;
    const follow=1-Math.exp(-Math.min(dt,.064)*5.5);
    pointer.easedX=mix(pointer.easedX,pointer.x,follow);pointer.easedY=mix(pointer.easedY,pointer.y,follow);
    const mobile=w<700,unit=Math.min(w*(mobile?.68:.42),h*(mobile?.42:.54),560);
    const story=storyAt(p);
    const uniforms=backdrop.material.uniforms;
    uniforms.time.value=ambientSeconds;uniforms.focus.value=story.title;uniforms.gold.value=story.gold;
    uniforms.poolSize.value.set(unit/w*1.30,unit/h*.82);
    uniforms.poolStrength.value=mix(1,.28,story.release)*smooth(0,.5,entry);
    key.position.set(-4+pointer.easedX*.7,7-pointer.easedY*.5,8);
    const initial=[{x:mobile?w*.34:w/2-unit*.44,y:h*(mobile?.40:.445)},
      {x:mobile?w*.65:w/2+unit*.46,y:h*(mobile?.56:.54)}];
    const parked=[{x:w*(mobile?.08:.055),y:h*(mobile?.23:.23)},
      {x:w*(mobile?.94:.95),y:h*(mobile?.72:.77)}];
    [codle,jitda].forEach((group,i)=>{
      const direction=i===0?-1:1;
      const travel=story.release,macro=story.macro,arrive=smoother(0,.8,entry);
      const start=initial[i],end=parked[i];
      const path=i===0?travel:smoother(0,.96,travel);
      let px=bezier(start.x,start.x+direction*unit*.14,end.x-direction*unit*.06,end.x,path);
      let py=bezier(start.y,start.y+direction*unit*.08,end.y-direction*unit*.06,end.y,path);
      // The camera passes the same objects as the collection arrives.
      // No replacement meshes, abrupt teleport, or independent floating loop.
      px=mix(px,i===0?-unit*1.8:w+unit*1.8,macro);
      py=mix(py,h*(i===0?-.15:1.2),macro);
      const poseScale=i===0?1.08:.98;
      const scale=unit/100*mix(poseScale,mobile?.43:.49,travel)*mix(.94,1,arrive)*mix(1,4,macro);
      group.visible=macro<.999;
      group.position.set((px-w/2)/100,(h/2-py)/100,i===0?0:.36);
      group.scale.setScalar(scale);
      const phase=Math.max(0,seconds-.8)*.18+i*.35;
      const idle=(1-travel)*smoother(.7,2.5,seconds);
      const look=(1-travel)*(mobile?0:1);
      const revealTurn=(1-smoother(.05,2.4,seconds))*(1-travel);
      group.rotation.set(
        mix(i===0?-.08:.015,i===0?.22:-.18,travel)+pointer.easedY*.05*look+macro*.26-.10*revealTurn,
        mix(i===0?-.16:.12,i===0?.55:-.44,travel)+pointer.easedX*.10*look+direction*macro*.5+direction*.55*revealTurn,
        mix(i===0?.12:-.13,i===0?-.28:.23,travel)-pointer.easedX*.025*look);
      rotation.setFromAxisAngle(turnAxes[i],direction*Math.sin(phase)*idle*(i===0?.14:.12));group.quaternion.premultiply(rotation);
      const pool=i===0?uniforms.bluePool:uniforms.goldPool;pool.value.set(px/w,1-(py+unit*.35)/h);
      const grounded=(1-smooth(.0,.85,travel))*arrive;
      shadows[i].visible=contacts[i].visible=spills[i].visible=grounded>.001;
      const shadow=shadows[i];shadow.position.x=(px-w/2)/100;
      shadow.position.y=(h/2-(start.y+unit*poseScale*(i===0?.56:.46)))/100;
      shadow.scale.set(unit/100*poseScale*1.08,unit/100*.72,1);shadow.material.opacity=grounded*.46;
      const contact=contacts[i];contact.position.copy(shadow.position);contact.position.z=-.99;
      contact.scale.set(unit/100*(i===0?.45:.56),unit/100*.19,1);contact.material.opacity=grounded*.42;
      const spill=spills[i];spill.position.copy(shadow.position);spill.position.z=-.98;
      spill.scale.set(unit/100*1.14,unit/100*.48,1);spill.material.opacity=grounded*(i===0?.52:.32);
    });
    renderer.render(scene,camera);
  }
  return {render,resize,setPointer};
}
