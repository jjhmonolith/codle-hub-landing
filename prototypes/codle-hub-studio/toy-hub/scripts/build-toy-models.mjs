import {readFile,writeFile} from 'node:fs/promises';
import {createRequire,register} from 'node:module';
import {gzipSync,gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
register('./three-loader.mjs',import.meta.url);
const require=createRequire(import.meta.url);
const {xml2js}=require(process.env.XML_JS_MODULE||'xml-js');

// Minimal build-time DOM adapter for these path/circle SVGs. Resolve their
// simple fill classes before passing the original contours to SVGLoader.
globalThis.DOMParser=class{
  parseFromString(source){
    const fills=new Map([...source.matchAll(/\.([\w-]+)\s*\{\s*fill:\s*(#[\da-f]+)\s*;/gi)].map(match=>[match[1],match[2]]));
    const node=element=>{
      const attributes={...element.attributes};
      if(fills.has(attributes.class))attributes.fill=fills.get(attributes.class);
      return {nodeType:1,nodeName:element.name,
        hasAttribute:name=>Object.hasOwn(attributes,name),getAttribute:name=>attributes[name]??null,
        childNodes:(element.elements||[]).filter(child=>child.type==='element').map(node)};
    };
    return {documentElement:node(xml2js(source).elements.find(element=>element.name==='svg'))};
  }
};
const {buildToyParts}=await import('../toy-geometry.js');
const {decodeToyParts}=await import('../mesh-pack.js');
const root=new URL('../',import.meta.url);
const [codle,jitda]=await Promise.all(['codle-drop-mask.svg','jitda-logo.svg'].map(name=>readFile(new URL('assets/'+name,root),'utf8')));
const started=performance.now(),parts=buildToyParts(codle,jitda),buildMs=Math.round(performance.now()-started);
const chunks=[];let offset=0;
const encode=attribute=>{
  const array=attribute.array,padding=(4-offset%4)%4;
  if(padding){chunks.push(Buffer.alloc(padding));offset+=padding}
  const spec={type:array.constructor.name,offset,length:array.length,itemSize:attribute.itemSize,normalized:attribute.normalized};
  let bytes;
  if(array instanceof Float32Array){
    spec.encoding='quantized-delta';spec.min=Array(attribute.itemSize).fill(Infinity);spec.max=Array(attribute.itemSize).fill(-Infinity);
    for(let i=0;i<array.length;i++){const c=i%attribute.itemSize;spec.min[c]=Math.min(spec.min[c],array[i]);spec.max[c]=Math.max(spec.max[c],array[i])}
    const packed=new Uint16Array(array.length),previous=new Uint16Array(attribute.itemSize);
    for(let i=0;i<array.length;i++){
      const c=i%attribute.itemSize,range=spec.max[c]-spec.min[c],q=range?Math.round((array[i]-spec.min[c])/range*65535):0;
      packed[i]=(q-previous[c])&65535;previous[c]=q;
    }
    bytes=Buffer.from(packed.buffer);
  }else{
    spec.encoding='index-delta';bytes=Buffer.alloc(array.length*5);let cursor=0,previous=0;
    for(const index of array){
      const delta=index-previous;previous=index;let value=((delta<<1)^(delta>>31))>>>0;
      while(value>=128){bytes[cursor++]=(value&127)|128;value>>>=7}bytes[cursor++]=value;
    }
    bytes=bytes.subarray(0,cursor);
  }
  spec.bytes=bytes.length;chunks.push(bytes);offset+=bytes.length;
  return spec;
};
const manifest={version:1,parts:parts.map(({group,material,z,geometry})=>({group,material,z,
  attributes:Object.fromEntries(Object.entries(geometry.attributes).map(([name,attribute])=>[name,encode(attribute)])),
  index:geometry.index?encode(geometry.index):null}))};
const json=Buffer.from(JSON.stringify(manifest)),prefix=Buffer.alloc((8+json.length+3)&~3);
prefix.writeUInt32LE(0x31594f54,0);prefix.writeUInt32LE(json.length,4);json.copy(prefix,8);
const raw=Buffer.concat([prefix,...chunks]),compressed=gzipSync(raw,{level:9});
// Check the actual compressed asset through the same decoder used by the site.
const unpacked=gunzipSync(compressed),buffer=unpacked.buffer.slice(unpacked.byteOffset,unpacked.byteOffset+unpacked.byteLength);
const decoded=decodeToyParts(buffer);assert.equal(decoded.length,5);
let maximumPositionError=0;
for(let i=0;i<parts.length;i++){
  const before=parts[i],after=decoded[i];
  for(const key of ['group','material','z'])assert.equal(after[key],before[key]);
  for(const name of Object.keys(before.geometry.attributes)){
    const original=before.geometry.getAttribute(name).array,actual=after.geometry.getAttribute(name).array,spec=manifest.parts[i].attributes[name];
    assert.equal(actual.length,original.length);
    for(let j=0;j<original.length;j++){
      const c=j%spec.itemSize,error=Math.abs(actual[j]-original[j]);
      assert.ok(error<=(spec.max[c]-spec.min[c])/131070+1e-7);
      if(name==='position')maximumPositionError=Math.max(maximumPositionError,error);
    }
  }
  assert.deepEqual(after.geometry.index.array,before.geometry.index.array);
}
await writeFile(new URL('assets/toy-models-v1.bin.gz',root),compressed);
console.log(JSON.stringify({buildMs,rawBytes:raw.length,compressedBytes:compressed.length,parts:parts.map(part=>({group:part.group,material:part.material,vertices:part.geometry.getAttribute('position').count})),maximumPositionError,indicesUnchanged:true}));
