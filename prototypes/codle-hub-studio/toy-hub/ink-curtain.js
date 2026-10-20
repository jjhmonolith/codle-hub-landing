import * as THREE from 'three';

const SIZE=1024,RANGE=48;
const DROP='M252.42 137.71V137.72C293.16 137.72 326.19 169.39 326.19 208.44C326.19 228.94 319.59 252.58 295.37 274.85C274.58 293.96 248.98 301.38 234.81 304.17C229.85 305.14 225.62 300.49 227.04 295.63L230.03 285.34C231.42 280.57 228.86 275.61 224.24 273.78C197.48 263.17 178.65 237.92 178.65 208.43C178.65 169.37 211.68 137.71 252.42 137.71Z';

// Distance from the authentic vector contour, rather than a blurred screenshot.
function distanceField(mask,inside){
  const data=new Float64Array(SIZE*SIZE),temp=new Float64Array(SIZE);
  const sites=new Int32Array(SIZE),edges=new Float64Array(SIZE+1),line=new Float64Array(SIZE);
  for(let i=0;i<data.length;i++)data[i]=(mask[i*4+3]>127)===inside?0:1e12;
  function transform(){
    let k=0;sites[0]=0;edges[0]=-Infinity;edges[1]=Infinity;
    for(let q=1;q<SIZE;q++){
      let s;
      do{s=((line[q]+q*q)-(line[sites[k]]+sites[k]*sites[k]))/(2*(q-sites[k]));if(s<=edges[k])k--;else break}while(k>=0);
      k++;sites[k]=q;edges[k]=s;edges[k+1]=Infinity;
    }
    k=0;
    for(let q=0;q<SIZE;q++){while(edges[k+1]<q)k++;temp[q]=(q-sites[k])**2+line[sites[k]]}
  }
  for(let x=0;x<SIZE;x++){for(let y=0;y<SIZE;y++)line[y]=data[y*SIZE+x];transform();for(let y=0;y<SIZE;y++)data[y*SIZE+x]=temp[y]}
  for(let y=0;y<SIZE;y++){for(let x=0;x<SIZE;x++)line[x]=data[y*SIZE+x];transform();for(let x=0;x<SIZE;x++)data[y*SIZE+x]=Math.sqrt(temp[x])}
  return data;
}

export function createInkCurtain(){
  const source=document.createElement('canvas');source.width=source.height=SIZE;
  const ctx=source.getContext('2d');ctx.translate(SIZE/2,SIZE/2);ctx.scale(SIZE/200,SIZE/200);ctx.translate(-253,-222);ctx.fill(new Path2D(DROP));
  const pixels=ctx.getImageData(0,0,SIZE,SIZE).data;
  const toInside=distanceField(pixels,true),toOutside=distanceField(pixels,false),rgba=new Uint8Array(SIZE*SIZE*4);
  for(let i=0;i<toInside.length;i++){
    const d=Math.max(-RANGE,Math.min(RANGE,toOutside[i]-toInside[i]));
    rgba[i*4]=Math.round((d/RANGE*.5+.5)*255);rgba[i*4+3]=255;
  }
  const texture=new THREE.DataTexture(rgba,SIZE,SIZE,THREE.RGBAFormat);
  texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;texture.needsUpdate=true;
  const uniforms={uDistance:{value:texture},uResolution:{value:new THREE.Vector2(1,1)},uCenter:{value:new THREE.Vector2()},uSize:{value:1},uOpacity:{value:1},uFlow:{value:0},uBloom:{value:0}};
  const material=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,uniforms,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uDistance;
      uniform vec2 uResolution,uCenter;
      uniform float uSize,uOpacity,uFlow,uBloom;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
      void main(){
        vec2 pixel=vec2(vUv.x*uResolution.x,(1.-vUv.y)*uResolution.y);
        vec2 local=(pixel-uCenter)/uSize+.5;
        float within=step(0.,local.x)*step(local.x,1.)*step(0.,local.y)*step(local.y,1.);
        float field=texture2D(uDistance,clamp(local,0.,1.)).r;
        float d=(field*2.-1.)*48.*uSize/1024.;
        if(field<.004)d=-1000.;
        if(field>.996)d=1000.;
        d=mix(-1000.,d,within);
        vec2 flow=vec2(uFlow*2.1,-uFlow*.7);
        float n=noise(pixel*.004+flow*.05);
        d+=(n-.5)*(1.5+uBloom*6.);
        float feather=1.8+uBloom*4.;
        float alpha=1.-smoothstep(-feather,feather,d);
        gl_FragColor=vec4(vec3(.93725,.93333,.91373),alpha*uOpacity);
      }`});
  const scene=new THREE.Scene();scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
  const camera=new THREE.Camera();
  function update({width,height,aperture,opacity,progress}){
    uniforms.uResolution.value.set(width,height);uniforms.uCenter.value.set(width*.5,height*.47);
    uniforms.uSize.value=aperture*200/180;uniforms.uOpacity.value=opacity;
    uniforms.uFlow.value=progress*12;uniforms.uBloom.value=Math.sin(Math.min(1,progress/.15)*Math.PI*.65);
  }
  function render(renderer){
    if(uniforms.uOpacity.value<=.001)return;
    const autoClear=renderer.autoClear;renderer.autoClear=false;renderer.render(scene,camera);renderer.autoClear=autoClear;
  }
  return {update,render};
}
