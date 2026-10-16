import * as THREE from 'three';
import { SVGLoader } from './vendor/SVGLoader.js';
import { softVolume } from './soft-volume.js?v=4';

const clamp=(x)=>Math.max(0,Math.min(1,x));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};

function helmetVolume(grooveShapes){
  // The shaded strips in the flat logo belong to a continuous helmet shell.
  // Bridge those two notches before inflating, instead of making three prongs.
  const shell=new THREE.Shape();shell.moveTo(114.5,41.35);
  shell.bezierCurveTo(128,41.35,139.7,44,139.7,51);
  shell.bezierCurveTo(150,53,164,59,175,66);
  shell.bezierCurveTo(197,83,209,108,210.7,135.2);shell.lineTo(210.8,147);
  shell.bezierCurveTo(218.7,149.7,222.6,157.4,224.2,164.8);
  shell.bezierCurveTo(224.8,167.6,223.7,170.3,220.8,171.6);
  shell.bezierCurveTo(187,187,151,192,114.5,192.3);
  shell.bezierCurveTo(78,192,40,186,8,171);
  shell.bezierCurveTo(5,169,4,167,4.5,164);
  shell.bezierCurveTo(5.7,156.3,9.9,147.9,18,145.1);shell.lineTo(18.1,134.1);
  shell.bezierCurveTo(19,102,40,72,70,57.3);
  shell.bezierCurveTo(76,55,83,53,89.3,51);
  shell.bezierCurveTo(89.7,45,100,41.35,114.5,41.35);shell.closePath();
  const grooves=grooveShapes.map(shape=>shape.getSpacedPoints(120).slice(0,-1).map(p=>[(p.x-114.5)/220,(143-p.y)/220]));
  const grooveAt=(x,y)=>{
    let distance=-Infinity;
    for(const outline of grooves){
      let inside=false,nearest=Infinity;
      for(let j=0;j<outline.length;j++){
        const a=outline[j],b=outline[(j+1)%outline.length],vx=b[0]-a[0],vy=b[1]-a[1];
        if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
        const t=clamp(((x-a[0])*vx+(y-a[1])*vy)/(vx*vx+vy*vy||1));
        const px=x-a[0]-t*vx,py=y-a[1]-t*vy,d=px*px+py*py;
        nearest=Math.min(nearest,d);
      }
      distance=Math.max(distance,Math.sqrt(nearest)*(inside?1:-1));
    }
    return smooth(-.011,.015,distance);
  };
  const geometry=softVolume(shell,114.5,143,220,.245,{resolution:200,falloff:.13,rounded:true,depthSteps:64,
    depthProfile:(x,y)=>(1-.22*grooveAt(x,y))*(1-.17*Math.pow(x/.52,2)-.08*Math.pow((y-.08)/.65,2))
  });
  const position=geometry.getAttribute('position');
  const colors=new Float32Array(position.count*3),grooveMask=new Float32Array(position.count);
  const yellow=new THREE.Color('#ffd000'),ochre=new THREE.Color('#b88006'),color=new THREE.Color();
  for(let i=0;i<position.count;i++){
    const groove=grooveAt(position.getX(i),position.getY(i));
    color.copy(yellow).lerp(ochre,groove);color.toArray(colors,i*3);
    grooveMask[i]=groove;
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setAttribute('groove',new THREE.Float32BufferAttribute(grooveMask,1));
  geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

function studioEnvironment(renderer,glass=false){
  const room=new THREE.Scene();room.background=new THREE.Color('#626579');
  const shell=new THREE.Mesh(new THREE.BoxGeometry(30,30,30),new THREE.MeshBasicMaterial({color:'#92919a',side:THREE.BackSide}));room.add(shell);
  const lightCanvas=document.createElement('canvas');lightCanvas.width=128;lightCanvas.height=128;
  const ctx=lightCanvas.getContext('2d');ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(5,5,118,118,8);ctx.fill();
  const lightMap=new THREE.CanvasTexture(lightCanvas);
  const addSoftbox=(w,h,x,y,z,power,tint='#ffffff')=>{
    const material=new THREE.MeshBasicMaterial({color:new THREE.Color(tint).multiplyScalar(power*(glass&&tint==='#ffffff'?1.5:1)),map:lightMap,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    const box=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);box.position.set(x,y,z);box.lookAt(0,0,0);room.add(box);
  };
  addSoftbox(4.2,7,-8,3,2.5,4.5);
  addSoftbox(2.0,6,8,2,1.5,3.1);
  addSoftbox(6,3,1,8,2,3.8);
  addSoftbox(3,4,-6,0,-4,1.5);
  if(glass){addSoftbox(2,6,6,-3,0,3.2,'#52e7ff');addSoftbox(4,2,-4,-5,2,2.7,'#22c9ff')}
  const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromScene(room,.025);
  room.traverse(object=>{if(object.isMesh){object.geometry.dispose();object.material.dispose()}});lightMap.dispose();pmrem.dispose();return target;
}

function studioBackdrop(){
  const material=new THREE.ShaderMaterial({depthWrite:false,uniforms:{
    topColor:{value:new THREE.Color('#f0edf6')},bottomColor:{value:new THREE.Color('#e8dfe5')},lightColor:{value:new THREE.Color('#fbf7f3')}
  },vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`varying vec2 vUv; uniform vec3 topColor,bottomColor,lightColor;
    void main(){
      vec3 color=mix(bottomColor,topColor,smoothstep(0.0,1.0,vUv.y));
      vec2 offset=(vUv-vec2(.46,.64))*vec2(1.1,1.5);
      color=mix(color,lightColor,exp(-dot(offset,offset)*4.0)*.58);
      gl_FragColor=vec4(color,1.0);
      #include <colorspace_fragment>
    }`});
  const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);backdrop.position.z=-4;backdrop.renderOrder=-10;return backdrop;
}

function shadowTexture(tint='59,46,94',strength=.30){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
  const context=canvas.getContext('2d');const g=context.createRadialGradient(128,64,0,128,64,64);
  g.addColorStop(0,`rgba(${tint},${strength})`);g.addColorStop(.30,`rgba(${tint},${strength*.47})`);g.addColorStop(1,`rgba(${tint},0)`);
  context.save();context.translate(128,64);context.scale(2,1);context.translate(-128,-64);context.fillStyle=g;context.fillRect(0,0,256,128);context.restore();
  return new THREE.CanvasTexture(canvas);
}

function glassVolume(shape){
  // A single inflated droplet: continuous curvature from the belly to the tail.
  // No raised perimeter or inset face, which would read as a glass badge.
  return softVolume(shape,252.42,220.94,147.54,.34,{resolution:180,falloff:.095,rounded:true});
}

export async function createToyStage(mount){
  const [codleSvg,jitdaSvg]=await Promise.all(['assets/codle-drop-mask.svg','assets/jitda-logo.svg'].map(async url=>{
    const response=await fetch(url);if(!response.ok)throw new Error('Brand asset unavailable: '+url);return response.text();
  }));
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;
  renderer.setClearColor('#f0edf6');mount.append(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#f0edf6');
  const backdrop=studioBackdrop();scene.add(backdrop);
  const camera=new THREE.OrthographicCamera(-5,5,4,-4,.1,100);camera.position.set(0,0,20);
  const environment=studioEnvironment(renderer),glassEnvironment=studioEnvironment(renderer,true);scene.environment=environment.texture;scene.environmentIntensity=.85;
  const ambient=new THREE.HemisphereLight('#ffffff','#b9a8ae',.7);scene.add(ambient);
  const key=new THREE.DirectionalLight('#fffaf3',1.5);key.position.set(-4,7,8);scene.add(key);
  const fill=new THREE.DirectionalLight('#f7f5ff',.65);fill.position.set(6,1,5);scene.add(fill);
  const rim=new THREE.DirectionalLight('#ffffff',1.4);rim.position.set(3,6,-4);scene.add(rim);
  const loader=new SVGLoader();
  const blue=new THREE.MeshPhysicalMaterial({color:'#75baff',metalness:0,roughness:.025,transmission:1,thickness:.56,ior:1.46,attenuationColor:'#247aff',attenuationDistance:4.2,clearcoat:1,clearcoatRoughness:.04,specularIntensity:1,envMap:glassEnvironment.texture,envMapIntensity:1.45});
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
  const dark=new THREE.MeshPhysicalMaterial({color:'#302923',metalness:0,roughness:.24,clearcoat:.65,clearcoatRoughness:.10,specularIntensity:.40,envMapIntensity:.65});
  const codle=new THREE.Group(),jitda=new THREE.Group();scene.add(codle,jitda);
  const codleShape=SVGLoader.createShapes(loader.parse(codleSvg).paths[0])[0];
  codle.add(new THREE.Mesh(glassVolume(codleShape),blue));

  const paths=loader.parse(jitdaSvg).paths;
  const grooveShapes=paths.filter(path=>path.color.getHexString(THREE.SRGBColorSpace)==='e9ad03').flatMap(path=>SVGLoader.createShapes(path));
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
  for(const path of paths){
    const shapes=SVGLoader.createShapes(path);if(!shapes.length)continue;
    const bounds=new THREE.Box2().setFromPoints(shapes.flatMap(shape=>shape.getPoints(16)));
    if(bounds.max.x>235||bounds.getSize(new THREE.Vector2()).length()<3)continue;
    const color='#'+path.color.getHexString(THREE.SRGBColorSpace);
    let mesh;
    if(color==='#ffce2c'){
      mesh=new THREE.Mesh(helmetVolume(grooveShapes),helmetMaterial);jitda.add(mesh);
    }else if(color==='#3f3934'){
      const isEye=bounds.max.y<220;
      for(const shape of shapes){
        mesh=new THREE.Mesh(softVolume(shape,114.5,143,220,isEye?.038:.055,{resolution:80,falloff:.028,rounded:.45,depthSteps:40}),dark);
        // Eyes sit behind the helmet so its lower edge occludes their tops.
        mesh.position.z=isEye?-.065:.075;jitda.add(mesh);
      }
    }
  }
  // The original brim is already part of the continuous shell silhouette.

  const texture=shadowTexture();
  const shadows=[0,1].map(()=>{const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,.25),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));mesh.position.z=-1;scene.add(mesh);return mesh});
  const spills=['33,139,255','235,180,35'].map(tint=>{const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,.25),new THREE.MeshBasicMaterial({map:shadowTexture(tint,.36),transparent:true,depthWrite:false,toneMapped:false}));mesh.position.z=-.98;scene.add(mesh);return mesh});
  let w=0,h=0;
  function resize(){w=mount.clientWidth;h=mount.clientHeight;renderer.setSize(w,h);backdrop.scale.set(w/100,h/100,1);camera.left=-w/200;camera.right=w/200;camera.top=h/200;camera.bottom=-h/200;camera.updateProjectionMatrix()}
  resize();
  let lost=false;
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;document.body.classList.remove('webgl-ready')});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;document.body.classList.add('webgl-ready');render(lastP,lastEntry)});
  let lastP=0,lastEntry=0;
  const turnAxes=[new THREE.Vector3(.52,.78,.33).normalize(),new THREE.Vector3(-.46,.8,.38).normalize()];
  const rotation=new THREE.Quaternion();
  function render(p,entry,seconds=0){
    lastP=p;lastEntry=entry;if(lost)return;
    const mobile=w<700,unit=Math.min(w*(mobile?.56:.39),h*.49,520);
    const travel=smooth(.035,.29,p),exit=smooth(.62,.80,p);
    const arrive=1-Math.pow(1-clamp(entry/.54),3);
    const impact=clamp((entry-.48)/.52),bounce=Math.sin(impact*Math.PI*3)*Math.exp(-impact*5)*.016;
    const idle=1-travel;
    const initial=[{x:mobile?w*.32:w/2-unit*.48,y:mobile?h*.40:h*.47},{x:mobile?w*.70:w/2+unit*.48,y:mobile?h*.58:h*.47+unit*.10}];
    const parked=[{x:w*(mobile?.19:.17),y:h*(mobile?.22:.25)},{x:w*(mobile?.81:.83),y:h*(mobile?.77:.74)}];
    [codle,jitda].forEach((group,i)=>{
      const direction=i===0?-1:1;
      let px=mix(initial[i].x,parked[i].x,travel);
      let py=mix(initial[i].y,parked[i].y,travel);
      px=mix(px,w*(i===0?-.035:1.035),exit);
      py=mix(py,h*(i===0?.23:.82),exit);
      px+=direction*unit*.40*(1-arrive)*idle-direction*unit*bounce*idle;
      py-=unit*.12*(1-arrive)*idle;
      const scale=unit/100*mix(1,mobile?.43:.47,travel)*mix(1,.55,exit);
      group.position.set((px-w/2)/100,(h/2-py)/100,i===0?0:.36);
      group.scale.setScalar(scale);
      group.scale.x*=1-bounce*idle;group.scale.y*=1+bounce*.5*idle;
      const beat=Math.sin(seconds*(i===0?.23:.20)+i*.55);
      const turn=(1-exit)*smooth(.75,1,entry)*beat*(i===0?.44:.34);
      group.rotation.set(mix(i===0?-.08:.10,i===0?.12:-.08,travel),
        mix(i===0?-.16:.12,i===0?.38:-.28,travel)+direction*(1-arrive)*.95*idle,
        mix(i===0?.12:-.12,i===0?-.28:.24,travel)-direction*bounce*idle);
      rotation.setFromAxisAngle(turnAxes[i],direction*turn);group.quaternion.premultiply(rotation);
      const shadow=shadows[i];shadow.position.x=(px-w/2)/100;
      shadow.position.y=(h/2-(initial[i].y+unit*(i===0?.58:.49)))/100;
      shadow.scale.set(unit/100*1.05,unit/100*.7,1);shadow.material.opacity=(1-travel)*.80*arrive;
      const spill=spills[i];spill.position.copy(shadow.position);spill.position.z=-.98;spill.position.x+=unit/100*(i===0?-.09:.03);
      spill.scale.set(unit/100*1.25,unit/100*.55,1);spill.material.opacity=(1-travel)*arrive*(i===0?.80:.45);
    });
    renderer.render(scene,camera);
  }
  return {render,resize};
}
