import {readFile,writeFile} from 'node:fs/promises';
import {register} from 'node:module';
import {gzipSync,gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
register('./three-loader.mjs',import.meta.url);
globalThis.DOMParser=class{parseFromString(source){
  const childNodes=[...source.matchAll(/<path\s+fill="([^"]+)"\s+d="([^"]+)"\s*\/>/g)].map(m=>({nodeType:1,nodeName:'path',childNodes:[],hasAttribute:n=>n==='fill'||n==='d',getAttribute:n=>n==='fill'?m[1]:n==='d'?m[2]:null}));
  return {documentElement:{nodeType:1,nodeName:'svg',childNodes,hasAttribute:()=>false,getAttribute:()=>null}};
}};
const THREE=await import('three');
const {SVGLoader}=await import('../vendor/SVGLoader.js');
const {softVolume}=await import('../soft-volume.js');
const file=new URL('../assets/worlds/jitda-worker-side.svg',import.meta.url);
const paths=new SVGLoader().parse(await readFile(file,'utf8')).paths;
const shapes=paths.map(path=>({color:path.color.getHexString(THREE.SRGBColorSpace),shape:SVGLoader.createShapes(path)[0]}));
const groove=shapes.find(p=>p.color==='e9ad03').shape.getSpacedPoints(180).map(p=>[(p.x-310)/410,(340-p.y)/410]);
const clamp=v=>Math.max(0,Math.min(1,v));
function grooveAt(x,y){
  let inside=false,nearest=Infinity;
  for(let i=0,j=groove.length-1;i<groove.length;j=i++){
    const a=groove[j],b=groove[i],vx=b[0]-a[0],vy=b[1]-a[1];
    if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    const t=clamp(((x-a[0])*vx+(y-a[1])*vy)/(vx*vx+vy*vy||1));
    nearest=Math.min(nearest,Math.hypot(x-a[0]-t*vx,y-a[1]-t*vy));
  }
  const t=clamp(((inside?nearest:-nearest)+.006)/.014);return t*t*(3-2*t);
}
const parts=[];
for(const {color,shape} of shapes){
  if(color==='e9ad03')continue;
  const helmet=color==='ffce2c';
  const geometry=softVolume(shape,310,340,410,helmet?.26:.045,{resolution:helmet?120:60,depthSteps:helmet?36:20,falloff:helmet?.115:.025,rounded:true,depthProfile:helmet?(x,y)=>1-.15*grooveAt(x,y):undefined});
  if(helmet){
    const attr=geometry.attributes.position,colors=new Float32Array(attr.count*3),a=new THREE.Color('#ffce2c'),b=new THREE.Color('#dca500'),c=new THREE.Color();
    for(let i=0;i<attr.count;i++)c.copy(a).lerp(b,grooveAt(attr.getX(i),attr.getY(i))).toArray(colors,i*3);
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  }
  const attributes={};
  for(const name of ['position','normal','color']){
    const attr=geometry.attributes[name];if(!attr)continue;
    const min=Array(attr.itemSize).fill(Infinity),max=Array(attr.itemSize).fill(-Infinity);
    for(let i=0;i<attr.array.length;i++){const c=i%attr.itemSize;min[c]=Math.min(min[c],attr.array[i]);max[c]=Math.max(max[c],attr.array[i])}
    const packed=new Uint16Array(attr.array.length),previous=new Uint16Array(attr.itemSize);
    for(let i=0;i<attr.array.length;i++){const c=i%attr.itemSize,range=max[c]-min[c],q=range?Math.round((attr.array[i]-min[c])/range*65535):0;packed[i]=(q-previous[c])&65535;previous[c]=q;assert(Math.abs(min[c]+q/65535*range-attr.array[i])<=range/131070+1e-7)}
    attributes[name]={itemSize:attr.itemSize,length:attr.array.length,min,max,data:Buffer.from(packed.buffer).toString('base64')};
  }
  const indices=geometry.index?.array,packed=indices?new Uint32Array(indices.length):null;
  if(indices){let previous=0;for(let i=0;i<indices.length;i++){packed[i]=(indices[i]-previous)>>>0;previous=indices[i]}}
  parts.push({material:helmet?'helmet':'dark',z:helmet?0:-.045,attributes,index:packed?Buffer.from(packed.buffer).toString('base64'):null});
}
assert.equal(parts.length,3);
const bytes=gzipSync(Buffer.from(JSON.stringify({version:1,parts})),{level:9});
assert.equal(JSON.parse(gunzipSync(bytes)).parts.length,3);
await writeFile(new URL('../assets/worlds/jitda-worker-v1.json.gz',import.meta.url),bytes);
console.log(JSON.stringify({parts:parts.length,bytes:bytes.length,vertices:parts.map(p=>p.attributes.position.length/3),officialContours:true,quantizationVerified:true}));
